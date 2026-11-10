// Academic performance and attendance intelligence for the signed-in student.
//
// Every figure is derived from records the portal already reads: the authorised
// academic context (courses, gradebook rows, submissions, quizzes, sessions),
// the official academic register and the attendance register. Nothing is
// invented, and a calculated average is never presented as a recorded grade.

import { buildStudentContext } from './context.ts';
import { round1 } from './gradebook.ts';
import { dedupeAttendanceRecords } from './attendance.ts';

// Prototype policy thresholds, as a share of the permitted absence allowance.
export const ATTENDANCE_THRESHOLDS = [50, 70, 80, 90, 100];

export const DEFAULT_POLICY = {
  institution: 'MGIMO University (Demo)',
  absenceLimit: 15,
  note: 'Prototype default for this demonstration institution. It is not a claim about every MGIMO course or official regulation.',
};

export const PREFERENCE_DEFAULTS = {
  course_performance_alerts: true,
  overall_performance_alerts: true,
  attendance_alerts: true,
  threshold_alerts: true,
  in_app_delivery: true,
  email_delivery: false,
  assignment_reminders: true,
  quiz_reminders: true,
  exam_reminders: true,
  overdue_alerts: true,
  daily_digest: false,
  weekly_digest: false,
  reminder_timing: 'morning',
  digest: 'off',
};

const DIGEST_VALUES = ['off', 'daily', 'weekly'];
const TIMING_VALUES = ['morning', 'afternoon', 'evening'];

const list = (page) => (Array.isArray(page) ? page : page?.items || []);
const round0 = (value) => Math.round(value);
const mean = (values) => (values.length ? round1(values.reduce((sum, value) => sum + value, 0) / values.length) : null);
const dayOf = (value) => String(value || '').slice(0, 10);
const isoToday = () => new Date().toISOString().slice(0, 10);

export function normalisePreferences(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const next = { ...PREFERENCE_DEFAULTS };
  Object.keys(PREFERENCE_DEFAULTS).forEach((key) => {
    if (key === 'digest' || key === 'reminder_timing') return;
    if (typeof source[key] === 'boolean') next[key] = source[key];
  });
  next.digest = DIGEST_VALUES.includes(source.digest) ? source.digest : PREFERENCE_DEFAULTS.digest;
  next.reminder_timing = TIMING_VALUES.includes(source.reminder_timing)
    ? source.reminder_timing
    : PREFERENCE_DEFAULTS.reminder_timing;
  return next;
}

// Institution policy lives in AppSetting, so another institution sets its own
// permitted number of missed classes without a code change.
export async function loadPolicy(svc, overrides = {}) {
  const rows = list(
    await svc.entities.AppSetting.filter(
      { key: { $in: ['attendance_absence_limit', 'institution_name'] } },
      { limit: 5 },
    ),
  );
  const byKey = new Map(rows.map((row) => [row.key, row.value]));
  const configured = Number(byKey.get('attendance_absence_limit'));
  const limit = Number.isFinite(configured) && configured > 0 ? configured : DEFAULT_POLICY.absenceLimit;
  return {
    institution: overrides.institution || byKey.get('institution_name') || DEFAULT_POLICY.institution,
    absenceLimit: Math.round(limit),
    configured: Boolean(byKey.get('attendance_absence_limit')),
    note: DEFAULT_POLICY.note,
  };
}

export async function loadStudentPreferences(svc, userId) {
  const row = list(await svc.entities.StudentProfile.filter({ user_id: userId }, { limit: 1 }))[0] || null;
  return {
    row,
    preferences: normalisePreferences(row?.preferences),
    institution: row?.university || '',
  };
}

export async function saveStudentPreferences(svc, userId, { preferences, institution }) {
  const clean = normalisePreferences(preferences);
  const row = list(await svc.entities.StudentProfile.filter({ user_id: userId }, { limit: 1 }))[0] || null;
  const patch = { preferences: clean };
  if (institution) patch.university = String(institution).slice(0, 120);
  if (row) {
    await svc.entities.StudentProfile.update(row.id, patch);
    return { preferences: clean, institution: patch.university || row.university || '' };
  }
  const created = await svc.entities.StudentProfile.create({ user_id: userId, ...patch });
  return { preferences: clean, institution: created.university || '' };
}

function trendFor(rows) {
  const graded = rows
    .filter((row) => row.status === 'graded' && row.percent !== null && row.gradedAt)
    .sort((a, b) => new Date(a.gradedAt) - new Date(b.gradedAt));
  const series = graded.map((row) => ({ label: row.title, percent: row.percent, date: row.gradedAt }));
  if (series.length < 3) return { series, direction: 'insufficient', delta: null };
  const middle = Math.floor(series.length / 2);
  const earlier = mean(series.slice(0, middle).map((point) => point.percent));
  const later = mean(series.slice(middle).map((point) => point.percent));
  const delta = round1(later - earlier);
  return { series, delta, direction: delta >= 3 ? 'improving' : delta <= -3 ? 'declining' : 'stable' };
}

function breakdownFor(rows) {
  const isExam = (row) => row.categoryLabel === 'Examination';
  const isQuiz = (row) => row.kind === 'quiz';
  const groups = [
    { key: 'coursework', label: 'Coursework & assignments', rows: rows.filter((r) => !isExam(r) && !isQuiz(r)) },
    { key: 'quizzes', label: 'Quizzes', rows: rows.filter((r) => !isExam(r) && isQuiz(r)) },
    { key: 'examinations', label: 'Examinations', rows: rows.filter(isExam) },
  ];
  return groups.map((group) => {
    const graded = group.rows.filter((row) => row.status === 'graded' && row.percent !== null);
    return {
      key: group.key,
      label: group.label,
      total: group.rows.length,
      graded: graded.length,
      average: mean(graded.map((row) => row.percent)),
    };
  });
}

function coursePerformance(course, attendanceByCourse) {
  const rows = course.rows || [];
  const breakdown = breakdownFor(rows);
  const graded = rows.filter((row) => row.status === 'graded' && row.percent !== null);
  const missing = rows.filter((row) => row.status === 'missing');
  const awaiting = rows.filter((row) => row.status === 'awaiting_grading');
  const trend = trendFor(rows);

  const courseworkRows = rows.filter((row) => row.categoryLabel !== 'Examination');
  const completedCoursework = courseworkRows.filter((row) => ['graded', 'awaiting_grading'].includes(row.status));
  const completion = courseworkRows.length
    ? { completed: completedCoursework.length, total: courseworkRows.length, percent: round0((completedCoursework.length / courseworkRows.length) * 100) }
    : { completed: 0, total: 0, percent: null };

  const courseworkAverage = breakdown.find((group) => group.key === 'coursework')?.average ?? null;
  const quizAverage = breakdown.find((group) => group.key === 'quizzes')?.average ?? null;
  const examAverage = breakdown.find((group) => group.key === 'examinations')?.average ?? null;

  const reasons = [];
  if (course.weighted !== null && course.weighted < 60) reasons.push('Recorded average below 60');
  if (missing.length) reasons.push(`${missing.length} assessment${missing.length === 1 ? '' : 's'} not submitted`);
  if (trend.direction === 'declining') reasons.push('Recent results are lower than earlier ones');
  const attendance = attendanceByCourse.get(course.id);
  if (attendance && attendance.absent >= 3) reasons.push(`${attendance.absent} recorded absences`);

  const status = course.weighted === null
    ? 'awaiting'
    : reasons.length
      ? 'attention'
      : course.weighted < 70
        ? 'watch'
        : 'on_track';

  return {
    id: course.id,
    code: course.code,
    title: course.title,
    credits: course.credits,
    semester: course.semester,
    professor: course.professor,
    average: course.weighted,
    letter: course.letter,
    gradedCount: graded.length,
    awaitingCount: awaiting.length,
    breakdown,
    assignmentAverage: courseworkAverage,
    quizAverage,
    examAverage,
    completion,
    missing: missing.map((row) => row.title),
    trend,
    attendance: attendance || null,
    status,
    reasons,
  };
}

function buildAttendance(records, sessions, courses, courseLabels, student, policy) {
  // The shared rule: one entry per course per day, unknown or cancelled
  // statuses excluded, so no class or absence is counted twice.
  const deduped = dedupeAttendanceRecords(records);

  const todayIso = isoToday();
  const inScope = sessions.filter(
    (session) => dayOf(session.session_date) <= todayIso && (!session.group_name || session.group_name === student.group_name),
  );
  const registerDates = new Set(deduped.map((row) => `${row.course_id}|${dayOf(row.session_date)}`));
  const heldSessions = inScope.filter(
    (session) => session.attendance_taken || registerDates.has(`${session.course_id}|${dayOf(session.session_date)}`),
  );

  const perCourse = courses.map((course) => {
    const rows = deduped.filter((row) => row.course_id === course.id);
    const count = (status) => rows.filter((row) => row.status === status).length;
    const present = count('present');
    const late = count('late');
    const excused = count('excused');
    const absent = count('absent');
    const total = rows.length;
    return {
      courseId: course.id,
      code: course.code,
      title: course.title,
      semester: course.semester || 'Semester not recorded',
      present,
      late,
      excused,
      absent,
      held: total,
      rate: total ? round0(((present + late + excused) / total) * 100) : null,
    };
  });

  // Register rows for a course outside the current enrolment still count, so
  // the allowance is never understated.
  const known = new Set(courses.map((course) => course.id));
  const extra = [...new Set(deduped.map((row) => row.course_id).filter((id) => id && !known.has(id)))];
  extra.forEach((courseId) => {
    const rows = deduped.filter((row) => row.course_id === courseId);
    const count = (status) => rows.filter((row) => row.status === status).length;
    const present = count('present');
    const late = count('late');
    const excused = count('excused');
    const absent = count('absent');
    const total = rows.length;
    perCourse.push({
      courseId,
      code: courseLabels.get(courseId)?.code || '',
      title: courseLabels.get(courseId)?.title || 'Course outside current enrolment',
      semester: courseLabels.get(courseId)?.semester || 'Semester not recorded',
      present,
      late,
      excused,
      absent,
      held: total,
      rate: total ? round0(((present + late + excused) / total) * 100) : null,
      outsideEnrolment: true,
    });
  });

  const totals = deduped.reduce(
    (sum, row) => ({ ...sum, [row.status]: sum[row.status] + 1 }),
    { present: 0, late: 0, excused: 0, absent: 0 },
  );
  const held = deduped.length;
  const attended = totals.present + totals.late + totals.excused;
  const rate = held ? round0((attended / held) * 100) : null;

  const limit = policy.absenceLimit;
  const used = totals.absent;
  const usedPercent = limit ? round1((used / limit) * 100) : null;
  const remaining = Math.max(0, limit - used);
  const status = used > limit
    ? 'exceeded'
    : used >= limit
      ? 'reached'
      : usedPercent >= 90
        ? 'critical'
        : usedPercent >= 80
          ? 'high'
          : usedPercent >= 70
            ? 'approaching'
            : usedPercent >= 50
              ? 'halfway'
              : 'ok';

  const semesters = [...new Set(perCourse.map((course) => course.semester))];
  const bySemester = semesters.map((semester) => {
    const rows = perCourse.filter((course) => course.semester === semester);
    const semesterHeld = rows.reduce((sum, course) => sum + course.held, 0);
    const semesterAttended = rows.reduce((sum, course) => sum + course.present + course.late + course.excused, 0);
    return {
      semester,
      held: semesterHeld,
      absent: rows.reduce((sum, course) => sum + course.absent, 0),
      rate: semesterHeld ? round0((semesterAttended / semesterHeld) * 100) : null,
    };
  });

  return {
    scheduled: inScope.length,
    heldSessions: heldSessions.length,
    registerEntries: held,
    present: totals.present,
    late: totals.late,
    excused: totals.excused,
    missed: used,
    attended,
    rate,
    perCourse,
    bySemester,
    semesterLabel: bySemester.length === 1 ? bySemester[0].semester : 'All semesters',
    allowance: { limit, used, remaining, usedPercent, status },
    thresholds: ATTENDANCE_THRESHOLDS.map((percent) => {
      const missed = Math.ceil((limit * percent) / 100);
      return { percent, missed, reached: used >= missed, exceeded: percent === 100 && used > limit };
    }),
  };
}

const RISK_COPY = {
  exceeded: { level: 'critical', label: 'Absence limit exceeded', action: 'Contact your course instructor and the student office now: the permitted allowance is used up.' },
  reached: { level: 'critical', label: 'Absence allowance reached', action: 'You have no permitted absences left. Attend every scheduled class and speak to your instructor about any further absence.' },
  critical: { level: 'critical', label: 'Critical attendance risk', action: 'Attend every remaining class and ask your instructor or student office how to protect your standing.' },
  high: { level: 'warning', label: 'High attendance risk', action: 'Plan to attend every class from now on and check whether any absence can be documented as excused.' },
  approaching: { level: 'warning', label: 'Approaching the absence limit', action: 'Review which classes you have missed and protect the rest of the semester.' },
  halfway: { level: 'info', label: 'Attendance allowance more than halfway used', action: 'Keep an eye on your remaining allowance and attend consistently.' },
  ok: { level: 'positive', label: 'Attendance within the permitted allowance', action: 'No action needed: keep attending as you are.' },
};

export async function buildAcademicIntelligence(base44, user, options = {}) {
  const svc = base44.asServiceRole;
  // A caller that already holds the authorised context (the reminder sweep)
  // passes it in, so one student's record is read once per run.
  const context = options.context || (await buildStudentContext(base44, user));
  const stored = await loadStudentPreferences(svc, user.id);
  const policy = await loadPolicy(svc, { institution: stored.institution });

  if (!context.linked) {
    return {
      linked: false,
      scopeNote: context.scopeNote,
      profile: null,
      policy,
      preferences: stored.preferences,
      institution: stored.institution || policy.institution,
      context,
    };
  }

  const student = { id: context.profile.id, group_name: context.profile.group_name };
  const courseIds = context.courses.map((course) => course.id);

  const [recordPage, attendancePage, sessionPage] = await Promise.all([
    svc.entities.AcademicRecord.filter({ student_id: student.id }, { limit: 300 }),
    svc.entities.AttendanceRecord.filter({ student_id: student.id }, { limit: 2000 }),
    courseIds.length
      ? svc.entities.ClassSession.filter({ course_id: { $in: courseIds } }, { sort: '-session_date', limit: 400 })
      : [],
  ]);

  const attendanceRecords = list(attendancePage);
  const sessions = list(sessionPage);
  const academicRecords = list(recordPage);

  // Labels for register rows that belong to courses outside the live enrolment.
  const knownCourseIds = new Set(courseIds);
  const unknownIds = [...new Set(attendanceRecords.map((row) => row.course_id).filter((id) => id && !knownCourseIds.has(id)))];
  const unknownPage = unknownIds.length
    ? await svc.entities.Course.filter({ id: { $in: unknownIds } }, { limit: 40 })
    : [];
  const courseLabels = new Map(
    [...context.courses, ...list(unknownPage)].map((course) => [
      course.id,
      { code: course.code || '', title: course.title || '', semester: course.semester || '' },
    ]),
  );

  const attendance = buildAttendance(attendanceRecords, sessions, context.courses, courseLabels, student, policy);
  const attendanceByCourse = new Map(attendance.perCourse.map((course) => [course.courseId, course]));
  const courses = context.courses.map((course) => coursePerformance(course, attendanceByCourse));

  const scored = courses.filter((course) => course.average !== null);
  const creditTotal = scored.reduce((sum, course) => sum + (course.credits || 0), 0);
  const semesterAverage = creditTotal
    ? round1(scored.reduce((sum, course) => sum + course.average * (course.credits || 0), 0) / creditTotal)
    : mean(scored.map((course) => course.average));

  // The cumulative figure comes from the official academic register only, and is
  // reported as unavailable until at least one record exists.
  const records = academicRecords
    .filter((row) => typeof row.grade === 'number')
    .map((row) => ({
      courseId: row.course_id,
      courseCode: courseLabels.get(row.course_id)?.code || '',
      courseTitle: courseLabels.get(row.course_id)?.title || '',
      grade: row.grade,
      assessmentType: row.assessment_type || 'exam',
      semester: row.semester || row.term || 'Not recorded',
      recordedDate: row.recorded_date || null,
    }));
  const registerSemesters = [...new Set(records.map((row) => row.semester))].map((semester) => {
    const rows = records.filter((row) => row.semester === semester);
    return { semester, average: mean(rows.map((row) => row.grade)), count: rows.length };
  });

  const strengths = scored
    .filter((course) => course.average >= 70)
    .sort((a, b) => b.average - a.average)
    .slice(0, 3);
  const attention = courses
    .filter((course) => course.status === 'attention' || course.status === 'watch')
    .sort((a, b) => (a.average ?? 101) - (b.average ?? 101));
  const declining = courses.filter((course) => course.trend.direction === 'declining');
  const improving = courses.filter((course) => course.trend.direction === 'improving');

  const risk = RISK_COPY[attendance.allowance.status] || RISK_COPY.ok;
  // Carried on the attendance block itself so the UI reads one object.
  attendance.suggestedAction = risk.action;
  const indicators = [];
  if (attendance.allowance.status !== 'ok') {
    indicators.push({ level: risk.level, label: risk.label, detail: `${attendance.missed} of ${attendance.allowance.limit} permitted absences recorded.` });
  }
  attention.forEach((course) => {
    indicators.push({
      level: course.status === 'attention' ? 'warning' : 'info',
      label: `${course.code || course.title}: ${course.reasons[0] || 'below target'}`,
      detail: course.average === null ? 'No graded work yet.' : `Calculated average ${course.average}/100.`,
    });
  });

  const todayIso = isoToday();
  const work = {
    overdue: context.assignments.filter((row) => row.state === 'overdue').slice(0, 8),
    upcomingAssignments: context.assignments
      .filter((row) => row.state === 'pending' && row.dueDate && row.dueDate >= todayIso)
      .slice(0, 6),
    upcomingAssessments: context.quizzes
      .filter((quiz) => quiz.state !== 'graded' && (!quiz.availableUntil || quiz.availableUntil >= todayIso))
      .slice(0, 6),
  };

  return {
    linked: true,
    profile: context.profile,
    policy,
    preferences: stored.preferences,
    institution: stored.institution || policy.institution,
    performance: {
      courses,
      semesterAverage,
      semesterLabel: courses[0]?.semester || 'Current semester',
      credits: creditTotal,
      gradedAssessments: courses.reduce((sum, course) => sum + course.gradedCount, 0),
      awaitingAssessments: courses.reduce((sum, course) => sum + course.awaitingCount, 0),
      missingAssessments: courses.reduce((sum, course) => sum + course.missing.length, 0),
      strengths,
      attention,
      declining,
      improving,
      cumulative: {
        average: mean(records.map((row) => row.grade)),
        count: records.length,
        // The register records the institutional marking scale (2–5 here), which
        // is not comparable with a 0–100 calculated average. The two are always
        // reported separately and never combined.
        scaleMax: 5,
        scaleLabel: '5-point register scale',
        semesters: registerSemesters,
        records: records.slice(0, 40),
        note: records.length
          ? 'Averaged from entries in the official academic register, on the institutional marking scale.'
          : 'No academic register entries are recorded for this account yet.',
      },
    },
    attendance,
    work,
    indicators,
    suggestedAction: risk.action,
  };
}

// Compact text record for the language model. It contains only this student's
// own rows, and marks every calculated figure as calculated.
export function intelligenceBrief(intel) {
  if (!intel.linked) return 'The signed-in account has no linked student record, so no academic record is available.';
  const { performance: perf, attendance } = intel;
  const lines = [
    `Student: ${intel.profile.full_name} (${intel.profile.student_id || 'no id'}), group ${intel.profile.group_name || '—'}, ${intel.profile.faculty || 'faculty not recorded'}.`,
    `Calculated semester average: ${perf.semesterAverage === null ? 'not available (no graded work yet)' : `${perf.semesterAverage.toFixed(1)}/100`}.`,
    `Official register cumulative average: ${
      perf.cumulative.average === null
        ? 'not available (no register entries)'
        : `${perf.cumulative.average.toFixed(1)} on the ${perf.cumulative.scaleLabel} from ${perf.cumulative.count} entries — a different scale from the calculated 0-100 averages, never combine the two`
    }.`,
    `Attendance: ${attendance.rate === null ? 'no register entries' : `${attendance.rate}% of ${attendance.registerEntries} recorded sessions`}; ${attendance.missed} absent, ${attendance.excused} excused, allowance ${attendance.allowance.limit}, remaining ${attendance.allowance.remaining}.`,
    '',
    'COURSES (averages are calculated from graded items, not recorded letter grades)',
  ];
  if (!perf.courses.length) lines.push('- none published');
  perf.courses.forEach((course) => {
    lines.push(
      `- ${course.code} ${course.title}: average ${course.average === null ? 'not graded yet' : `${course.average.toFixed(1)}/100 (${course.letter})`}, coursework completion ${course.completion.percent === null ? 'no items' : `${course.completion.percent}%`}, missing ${course.missing.length}, trend ${course.trend.direction}, attendance ${course.attendance?.rate === null || course.attendance?.rate === undefined ? 'not recorded' : `${course.attendance.rate}%`}.`,
    );
    course.breakdown
      .filter((group) => group.total)
      .forEach((group) => {
        lines.push(`    ${group.label}: ${group.average === null ? 'nothing graded' : `${group.average}`} from ${group.graded}/${group.total} items`);
      });
    course.missing.slice(0, 4).forEach((title) => lines.push(`    missing: "${title}"`));
  });

  lines.push('', 'UPCOMING AND OVERDUE');
  perf.courses.length && intel.work.overdue.forEach((row) => lines.push(`- overdue: ${row.courseCode} "${row.title}" due ${row.dueDate}`));
  intel.work.upcomingAssignments.forEach((row) => lines.push(`- due ${row.dueDate}: ${row.courseCode} "${row.title}" (${row.type})`));
  intel.work.upcomingAssessments.forEach((quiz) => lines.push(`- assessment: ${quiz.courseCode} "${quiz.title}" closes ${quiz.availableUntil || 'no closing date'}`));
  if (!intel.work.overdue.length && !intel.work.upcomingAssignments.length && !intel.work.upcomingAssessments.length) {
    lines.push('- nothing outstanding in the published record');
  }
  return lines.join('\n');
}

// The alert rows are built here, independently of any delivery channel, so the
// in-app inbox and email share one set of thresholds, records and dedupe keys.
export function academicAlertRows(identity, intel, preferences) {
  if (!intel.linked) return [];
  const rows = [];
  const term = intel.attendance.semesterLabel || 'current';
  const allowance = intel.attendance.allowance;

  if (preferences.attendance_alerts && preferences.threshold_alerts) {
    intel.attendance.thresholds
      .filter((threshold) => threshold.reached)
      .forEach((threshold) => {
        const reachedLimit = threshold.percent >= 100;
        rows.push({
          user_id: identity.userId,
          title: threshold.exceeded
            ? 'Absence limit exceeded'
            : reachedLimit
              ? 'Absence allowance reached'
              : `Attendance warning: ${threshold.percent}% of absence allowance used`,
          body: `${allowance.used} of ${allowance.limit} permitted absences recorded. ${allowance.remaining} remaining.`,
          category: 'reminder',
          notification_type: 'attendance_threshold',
          link: '/student/attendance',
          conversation_name: intel.policy.institution,
          dedupe_key: `attendance:${identity.studentId}:${term}:${threshold.percent}`,
        });
      });
  }

  if (preferences.course_performance_alerts) {
    intel.performance.courses
      .filter((course) => course.status === 'attention')
      .forEach((course) => {
        rows.push({
          user_id: identity.userId,
          title: `${course.code || course.title} needs attention`,
          body: course.reasons.join(' · ').slice(0, 200),
          category: 'reminder',
          notification_type: 'course_performance',
          link: '/student/intelligence',
          conversation_name: course.title,
          dedupe_key: `performance:${identity.studentId}:${course.id}:attention`,
        });
      });
  }

  if (preferences.overall_performance_alerts && intel.performance.semesterAverage !== null && intel.performance.semesterAverage < 60) {
    rows.push({
      user_id: identity.userId,
      title: 'Overall semester performance needs attention',
      body: `Calculated semester average ${intel.performance.semesterAverage}/100 across ${intel.performance.courses.filter((course) => course.average !== null).length} courses with results.`,
      category: 'reminder',
      notification_type: 'overall_performance',
      link: '/student/intelligence',
      dedupe_key: `performance:${identity.studentId}:overall:${intel.performance.semesterAverage < 50 ? 'below50' : 'below60'}`,
    });
  }

  return rows;
}

// Alerts are written once per threshold per semester: the dedupe key is checked
// before any row is created, so polling the overview cannot repeat an alert.
export async function syncAcademicAlerts(svc, identity, intel, preferences) {
  if (!intel.linked || !preferences.in_app_delivery) return [];
  const rows = academicAlertRows(identity, intel, preferences);
  if (!rows.length) return [];

  const keys = rows.map((row) => row.dedupe_key);
  const existing = new Set(
    list(await svc.entities.Notification.filter({ dedupe_key: { $in: keys } }, { limit: 200 })).map((row) => row.dedupe_key),
  );
  const fresh = rows.filter((row) => !existing.has(row.dedupe_key));
  if (!fresh.length) return [];
  await svc.entities.Notification.bulkCreate(fresh);
  return fresh.map((row) => ({ title: row.title, body: row.body, link: row.link }));
}