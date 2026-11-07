export const CURRENT_TERM = '2026/2027 · Fall';
export const PREVIOUS_TERM = '2025/2026 · Spring';

export const DEFAULT_THRESHOLDS = {
  attendance: 85,
  gpaHigh: 3.0,
  gpaMedium: 3.6,
  absenceHigh: 30,
  absenceMedium: 20,
  gpaDecline: 0.4,
};

export const RISK_LEVELS = ['high', 'medium', 'low', 'none'];
export const RISK_LABELS = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  none: 'No current risk indicator',
};

const mean = (values) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null);
const percent = (part, total) => (total ? (part / total) * 100 : null);

export function parseThresholds(settings = []) {
  const map = Object.fromEntries(settings.map((item) => [item.key, parseFloat(item.value)]));
  const pick = (key, fallback) => (Number.isFinite(map[key]) ? map[key] : fallback);
  return {
    attendance: pick('attendance_threshold', DEFAULT_THRESHOLDS.attendance),
    gpaHigh: pick('risk_gpa_high', DEFAULT_THRESHOLDS.gpaHigh),
    gpaMedium: pick('risk_gpa_medium', DEFAULT_THRESHOLDS.gpaMedium),
    absenceHigh: pick('risk_absence_high', DEFAULT_THRESHOLDS.absenceHigh),
    absenceMedium: pick('risk_absence_medium', DEFAULT_THRESHOLDS.absenceMedium),
    gpaDecline: pick('risk_gpa_decline', DEFAULT_THRESHOLDS.gpaDecline),
  };
}

export function iso(date) {
  return date.toISOString().slice(0, 10);
}

export function today() {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  return iso(date);
}

function weekLabel(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getDate()} ${date.toLocaleString('en-GB', { month: 'short' })}`;
}

export function studentRisk(student, records, attendance, thresholds) {
  const current = records.filter((record) => record.term === CURRENT_TERM);
  const previous = records.filter((record) => record.term === PREVIOUS_TERM);
  const gpa = mean(current.map((record) => Number(record.grade)));
  const previousGpa = mean(previous.map((record) => Number(record.grade)));
  const decline = gpa !== null && previousGpa !== null ? previousGpa - gpa : 0;
  const failed = current.filter((record) => Number(record.grade) < 3);
  const sessions = attendance.length;
  const absences = attendance.filter((record) => record.status === 'absent').length;
  const lates = attendance.filter((record) => record.status === 'late').length;
  const absenceRate = percent(absences, sessions);

  const evidence = [];
  let level = 'none';

  const bump = (next) => {
    const order = { none: 0, low: 1, medium: 2, high: 3 };
    if (order[next] > order[level]) level = next;
  };

  if (gpa !== null) {
    if (gpa < thresholds.gpaHigh) {
      bump('high');
      evidence.push(`Current GPA ${gpa.toFixed(2)} is below the high-risk threshold of ${thresholds.gpaHigh.toFixed(1)}.`);
    } else if (gpa < thresholds.gpaMedium) {
      bump('medium');
      evidence.push(`Current GPA ${gpa.toFixed(2)} is below the review threshold of ${thresholds.gpaMedium.toFixed(1)}.`);
    } else if (gpa < thresholds.gpaMedium + 0.3) {
      bump('low');
      evidence.push(`Current GPA ${gpa.toFixed(2)} is close to the review threshold.`);
    }
  }
  if (failed.length >= 2) {
    bump('high');
    evidence.push(`${failed.length} failed assessments in the current semester.`);
  } else if (failed.length === 1) {
    bump('medium');
    evidence.push('One failed assessment in the current semester.');
  }
  if (absenceRate !== null) {
    if (absenceRate >= thresholds.absenceHigh) {
      bump('high');
      evidence.push(`Absence rate ${absenceRate.toFixed(1)}% exceeds the ${thresholds.absenceHigh}% high-risk threshold.`);
    } else if (absenceRate >= thresholds.absenceMedium) {
      bump('medium');
      evidence.push(`Absence rate ${absenceRate.toFixed(1)}% exceeds the ${thresholds.absenceMedium}% review threshold.`);
    } else if (absenceRate >= Math.max(thresholds.absenceMedium - 8, 8)) {
      bump('low');
      evidence.push(`Absence rate ${absenceRate.toFixed(1)}% is approaching the review threshold.`);
    }
  }
  if (decline >= thresholds.gpaDecline) {
    bump('medium');
    evidence.push(`GPA declined by ${decline.toFixed(2)} compared with the previous semester.`);
  } else if (decline >= thresholds.gpaDecline / 2) {
    bump('low');
    evidence.push(`GPA declined by ${decline.toFixed(2)} compared with the previous semester.`);
  }
  if (current.length === 0) {
    evidence.push('No current-semester academic records are available.');
  }
  if (sessions === 0) {
    evidence.push('No attendance records are available.');
  }

  return {
    gpa,
    previousGpa,
    decline,
    failed: failed.length,
    absenceRate,
    absences,
    sessions,
    lates,
    level,
    evidence,
    attendanceRate: sessions ? 100 - (absenceRate || 0) : null,
  };
}

export function buildAnalytics(data) {
  const {
    faculties = [],
    departments = [],
    students = [],
    professors = [],
    courses = [],
    academicRecords = [],
    attendanceRecords = [],
    requests = [],
    events = [],
    tasks = [],
    settings = [],
  } = data;

  const thresholds = parseThresholds(settings);
  const facultyById = Object.fromEntries(faculties.map((faculty) => [faculty.id, faculty]));
  const departmentById = Object.fromEntries(departments.map((dept) => [dept.id, dept]));
  const studentById = Object.fromEntries(students.map((student) => [student.id, student]));

  const recordsByStudent = {};
  academicRecords.forEach((record) => {
    recordsByStudent[record.student_id] = recordsByStudent[record.student_id] || [];
    recordsByStudent[record.student_id].push(record);
  });
  const attendanceByStudent = {};
  attendanceRecords.forEach((record) => {
    attendanceByStudent[record.student_id] = attendanceByStudent[record.student_id] || [];
    attendanceByStudent[record.student_id].push(record);
  });

  const studentInsights = students.map((student) => {
    const insight = studentRisk(
      student,
      recordsByStudent[student.id] || [],
      attendanceByStudent[student.id] || [],
      thresholds
    );
    return {
      ...insight,
      student,
      facultyName: facultyById[student.faculty_id]?.name || 'Unassigned faculty',
      departmentName: departmentById[student.department_id]?.name || 'Unassigned department',
    };
  });

  const riskCounts = { high: 0, medium: 0, low: 0, none: 0 };
  studentInsights.forEach((insight) => {
    riskCounts[insight.level] += 1;
  });

  const facultyRows = faculties.map((faculty) => {
    const facultyStudents = studentInsights.filter((insight) => insight.student.faculty_id === faculty.id);
    const facultyAttendance = attendanceRecords.filter((record) => record.faculty_id === faculty.id);
    const facultyRecords = academicRecords.filter((record) => record.faculty_id === faculty.id && record.term === CURRENT_TERM);
    const attended = facultyAttendance.filter((record) => record.status === 'present' || record.status === 'late').length;
    return {
      id: faculty.id,
      name: faculty.name,
      code: faculty.code,
      deanName: faculty.dean_name,
      studentCount: facultyStudents.filter((insight) => insight.student.enrollment_status === 'active').length,
      staffCount: professors.filter((professor) => professor.faculty_id === faculty.id).length,
      departmentCount: departments.filter((dept) => dept.faculty_id === faculty.id).length,
      avgGpa: mean(facultyStudents.map((insight) => insight.gpa).filter((value) => value !== null)),
      attendanceRate: percent(attended, facultyAttendance.length),
      passRate: percent(facultyRecords.filter((record) => Number(record.grade) >= 3).length, facultyRecords.length),
      riskCount: facultyStudents.filter((insight) => insight.level === 'high' || insight.level === 'medium').length,
      requestCount: requests.filter((request) => request.faculty_id === faculty.id).length,
    };
  });

  const departmentRows = departments.map((dept) => {
    const deptStudents = studentInsights.filter((insight) => insight.student.department_id === dept.id);
    const deptAttendance = attendanceRecords.filter((record) => record.department_id === dept.id);
    const deptRecords = academicRecords.filter((record) => record.department_id === dept.id && record.term === CURRENT_TERM);
    const attended = deptAttendance.filter((record) => record.status === 'present' || record.status === 'late').length;
    return {
      id: dept.id,
      name: dept.name,
      facultyId: dept.faculty_id,
      facultyName: facultyById[dept.faculty_id]?.name || 'Unassigned faculty',
      headName: dept.head_name,
      studentCount: deptStudents.length,
      staffCount: professors.filter((professor) => professor.department_id === dept.id).length,
      avgGpa: mean(deptStudents.map((insight) => insight.gpa).filter((value) => value !== null)),
      attendanceRate: percent(attended, deptAttendance.length),
      passRate: percent(deptRecords.filter((record) => Number(record.grade) >= 3).length, deptRecords.length),
      riskCount: deptStudents.filter((insight) => insight.level === 'high' || insight.level === 'medium').length,
    };
  });

  const attendedAll = attendanceRecords.filter((record) => record.status === 'present' || record.status === 'late').length;
  const overallAttendance = percent(attendedAll, attendanceRecords.length);
  const todayValue = today();
  const todayRecords = attendanceRecords.filter((record) => record.session_date === todayValue);
  const todayRate = percent(
    todayRecords.filter((record) => record.status === 'present' || record.status === 'late').length,
    todayRecords.length
  );
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const weekRecords = attendanceRecords.filter((record) => record.session_date >= iso(weekStart));
  const weekRate = percent(
    weekRecords.filter((record) => record.status === 'present' || record.status === 'late').length,
    weekRecords.length
  );

  const currentRecords = academicRecords.filter((record) => record.term === CURRENT_TERM);
  const overallGpa = mean(currentRecords.map((record) => Number(record.grade)));

  const trendMap = {};
  attendanceRecords.forEach((record) => {
    const label = weekLabel(record.session_date);
    if (!label) return;
    trendMap[label] = trendMap[label] || { label, date: record.session_date, total: 0, attended: 0 };
    trendMap[label].total += 1;
    if (record.status === 'present' || record.status === 'late') trendMap[label].attended += 1;
    if (record.session_date < trendMap[label].date) trendMap[label].date = record.session_date;
  });
  const attendanceTrend = Object.values(trendMap)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((row) => ({ label: row.label, value: Number(((row.attended / row.total) * 100).toFixed(1)) }));

  const gradeDistribution = [5, 4, 3, 2].map((gradeValue) => ({
    label: `Grade ${gradeValue}`,
    value: currentRecords.filter((record) => Number(record.grade) === gradeValue).length,
  }));

  const pendingStatuses = ['submitted', 'under_review', 'awaiting_information'];
  const pendingRequests = requests.filter((request) => pendingStatuses.includes(request.status));
  const requestsByStatus = ['submitted', 'under_review', 'awaiting_information', 'approved', 'rejected', 'completed'].map(
    (status) => ({ label: status.replace(/_/g, ' '), value: requests.filter((request) => request.status === status).length })
  );
  const categoryMap = {};
  requests.forEach((request) => {
    categoryMap[request.category] = (categoryMap[request.category] || 0) + 1;
  });
  const requestsByCategory = Object.entries(categoryMap)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const upcomingEvents = events
    .filter((event) => event.start_date >= todayValue)
    .sort((a, b) => (a.start_date < b.start_date ? -1 : 1))
    .map((event) => ({ ...event, facultyName: facultyById[event.faculty_id]?.name || 'University-wide' }))
    .slice(0, 6);

  const examRecords = currentRecords.filter((record) => record.assessment_type === 'exam');
  const examPassRate = percent(examRecords.filter((record) => Number(record.grade) >= 3).length, examRecords.length);

  const professorRows = professors.map((professor) => {
    const assigned = courses.filter((course) => course.professor_id === professor.id);
    const credits = assigned.reduce((sum, course) => sum + (Number(course.credits) || 0), 0);
    return {
      ...professor,
      facultyName: facultyById[professor.faculty_id]?.name || 'Unassigned faculty',
      departmentName: departmentById[professor.department_id]?.name || 'Unassigned department',
      courseCount: assigned.length,
      credits,
      courses: assigned,
      totalHours: (Number(professor.weekly_hours) || 0) + credits,
    };
  });

  const coursesWithoutProfessor = courses.filter((course) => !course.professor_id);

  const riskByFaculty = facultyRows
    .map((faculty) => ({
      label: faculty.code,
      name: faculty.name,
      value: studentInsights.filter(
        (insight) => insight.student.faculty_id === faculty.id && (insight.level === 'high' || insight.level === 'medium')
      ).length,
    }))
    .sort((a, b) => b.value - a.value);

  const riskByYear = [1, 2, 3, 4].map((year) => ({
    label: `Year ${year}`,
    value: studentInsights.filter((insight) => insight.student.year === year && insight.level !== 'none').length,
  }));

  return {
    thresholds,
    facultyById,
    departmentById,
    studentById,
    studentInsights,
    riskCounts,
    facultyRows,
    departmentRows,
    departmentRowsSorted: [...departmentRows].sort((a, b) => (b.avgGpa || 0) - (a.avgGpa || 0)),
    professorRows,
    coursesWithoutProfessor,
    kpis: {
      totalStudents: students.filter((student) => student.enrollment_status === 'active').length,
      totalStudentsAll: students.length,
      totalStaff: professors.length,
      facultyCount: faculties.length,
      departmentCount: departments.length,
      attendanceRate: overallAttendance,
      attendanceToday: todayRate,
      attendanceWeek: weekRate,
      avgGpa: overallGpa,
      atRisk: riskCounts.high + riskCounts.medium,
      pendingRequests: pendingRequests.length,
      openTasks: tasks.filter((task) => task.status !== 'done').length,
      passRate: percent(currentRecords.filter((record) => Number(record.grade) >= 3).length, currentRecords.length),
    },
    attendanceTrend,
    gradeDistribution,
    requestsByStatus,
    requestsByCategory,
    pendingRequests,
    upcomingEvents,
    examStats: { passRate: examPassRate, count: examRecords.length },
    riskByFaculty,
    riskByYear,
    currentTermLabel: CURRENT_TERM,
  };
}