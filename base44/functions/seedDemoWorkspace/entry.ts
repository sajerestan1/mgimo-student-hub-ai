import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import {
  FACULTIES,
  DEPARTMENTS,
  GROUPS,
  PROFESSORS,
  DEMO_STUDENT,
  buildStudents,
} from '../../shared/demo/people.ts';
import {
  COURSES,
  TERM,
  PREVIOUS_TERM,
  syllabusText,
  lectureNotes,
  studyGuide,
  assignmentSpec,
  quizQuestions,
} from '../../shared/demo/curriculum.ts';
import { buildWeeklySessions, mondayOf } from '../../shared/demo/timetable.ts';

// Populates the prototype with one interconnected fictional university: two
// schools, four departments, three class groups, thirty students, six professors,
// six courses and everything that hangs off them — modules, resources,
// assignments, submissions, quizzes, attempts, attendance, results and a
// conflict-free four-week class register.
//
// The endpoint is administrator-only, runs entirely server-side with the service
// role, and is idempotent: it records a marker row and refuses to seed twice, so
// repeating the call can never duplicate records.

const MARKER_KEY = 'demo_dataset';
const MARKER_VERSION = 'v1';

const list = (page) => (Array.isArray(page) ? page : page?.items || []);

const isoOf = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const shiftDays = (offset) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return isoOf(date);
};

const clamp = (value, low, high) => Math.min(high, Math.max(low, Math.round(value)));

// Deterministic noise, so a re-seed of an empty database produces identical data.
const noise = (seed) => {
  let value = (seed * 2654435761) % 4294967296;
  return () => {
    value = (value * 1103515245 + 12345) % 2147483648;
    return value / 2147483648;
  };
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const errorText = (error) => {
  const detail = error?.response?.data;
  if (typeof detail === 'string') return detail;
  if (detail?.error) return String(detail.error);
  return String(error?.message || '');
};

// The entity API rate-limits bulk writes per caller. Seeding is a burst of
// writes, so every call waits out a rate-limit response instead of failing.
async function withRateLimitRetry(run) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      const message = errorText(error);
      const wait = Number((message.match(/Retry after (\d+)/) || [])[1] || 0);
      if (attempt >= 8 || !/Rate limit/i.test(message)) throw error;
      await sleep((wait + 1) * 1000);
    }
  }
}

async function createAll(entity, rows, size = 200) {
  const created = [];
  for (let index = 0; index < rows.length; index += size) {
    const part = rows.slice(index, index + size);
    const batch = await withRateLimitRetry(() => entity.bulkCreate(part));
    created.push(...list(batch));
  }
  return created;
}

// A run that stopped part-way leaves only rows this seeder owns (all flagged
// is_demo), so a retry clears them and starts clean instead of duplicating.
async function clearDemoRows(sr) {
  // Questions and request events carry no demo flag, so they are removed through
  // the demo records that own them.
  const demoQuizzes = list(await sr.entities.Quiz.filter({ is_demo: true }, { limit: 300 }));
  if (demoQuizzes.length) {
    await sr.entities.QuizQuestion.deleteMany({ quiz_id: { $in: demoQuizzes.map((row) => row.id) } });
  }
  const demoRequests = list(await sr.entities.AdminRequest.filter({ is_demo: true }, { limit: 300 }));
  if (demoRequests.length) {
    await sr.entities.RequestEvent.deleteMany({ request_id: { $in: demoRequests.map((row) => row.id) } });
  }

  const order = [
    'ClassSession',
    'QuizAttempt',
    'Quiz',
    'Submission',
    'Assignment',
    'ModuleProgress',
    'LearningResource',
    'CourseModule',
    'CourseEnrollment',
    'AcademicRecord',
    'AttendanceRecord',
    'AdminRequest',
    'Announcement',
    'AcademicEvent',
    'AdministrativeTask',
    'Course',
    'Student',
    'Professor',
    'Department',
    'Faculty',
  ];
  for (const name of order) {
    await withRateLimitRetry(() => sr.entities[name].deleteMany({ is_demo: true }));
  }
}

const gradeFromPercent = (percent) => (percent >= 87 ? 5 : percent >= 74 ? 4 : percent >= 60 ? 3 : 2);

const feedbackFor = (percent) => {
  if (percent >= 85) {
    return 'A clear thesis, well evidenced from the set readings, with the counter-argument answered rather than avoided. Tighten the conclusion so that it follows from the argument instead of restating it.';
  }
  if (percent >= 70) {
    return 'Good command of the module’s concepts and a defensible position. The middle section asserts rather than evidences its central claim: cite the rival reading and engage with it and this reaches the upper band.';
  }
  if (percent >= 55) {
    return 'The work summarises the module rather than arguing a position, and two key concepts are named without being applied. Revisit the lecture notes and rebuild the answer around a single claim.';
  }
  return 'The submission does not answer the question set, and sources are neither cited nor engaged. Please book a meeting during office hours before the next assessment.';
};

export default async function (req) {
  let step = 'start';
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me().catch((error) => (error.status === 401 ? null : Promise.reject(error)));
    if (!caller) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (caller.role !== 'admin') {
      return Response.json({ error: 'Only an administrator can load demonstration data.' }, { status: 403 });
    }

    const sr = base44.asServiceRole;

    const marker = list(await sr.entities.AppSetting.filter({ key: MARKER_KEY }, { limit: 1 }));
    if (marker.length) {
      return Response.json({
        seeded: false,
        reason: 'Demonstration data is already loaded. Records are never duplicated.',
        marker: marker[0].value,
      });
    }

    // Never mix the demonstration dataset into institutional records that are
    // already there. A partial earlier run of this seeder is cleared first.
    const demoFaculties = list(await sr.entities.Faculty.filter({ is_demo: true }, { limit: 1 }));
    if (demoFaculties.length) {
      step = 'cleanup';
      await clearDemoRows(sr);
    }

    const existing = list(await sr.entities.Faculty.filter({}, { limit: 1 }));
    if (existing.length) {
      return Response.json({
        seeded: false,
        reason: 'Institutional records already exist in this database. The demonstration dataset only seeds an empty workspace.',
      });
    }

    const counts = {};
    const count = (key, value) => {
      counts[key] = value;
    };

    // ── Institutional structure ────────────────────────────────────────────
    const facultyRows = await createAll(
      sr.entities.Faculty,
      FACULTIES.map((faculty) => ({
        name: faculty.name,
        code: faculty.code,
        dean_name: faculty.dean_name,
        established: faculty.established,
        description: faculty.description,
        is_demo: true,
      })),
    );
    const facultyId = Object.fromEntries(facultyRows.map((row) => [row.code, row.id]));
    count('faculties', facultyRows.length);

    const departmentRows = await createAll(
      sr.entities.Department,
      DEPARTMENTS.map((department) => ({
        faculty_id: facultyId[department.faculty],
        name: department.name,
        code: department.code,
        head_name: department.head_name,
        is_demo: true,
      })),
    );
    const departmentId = {};
    DEPARTMENTS.forEach((department, index) => {
      departmentId[department.key] = departmentRows[index].id;
    });
    count('departments', departmentRows.length);

    // ── People ─────────────────────────────────────────────────────────────
    const professorRows = await createAll(
      sr.entities.Professor,
      PROFESSORS.map((professor, index) => ({
        full_name: professor.full_name,
        title: professor.title,
        faculty_id: facultyId[professor.faculty],
        department_id: departmentId[professor.dept],
        email: professor.email,
        employment_status: professor.employment_status,
        hire_date: shiftDays(-365 * (6 + index)),
        weekly_hours: professor.weekly_hours,
        is_demo: true,
      })),
    );
    count('professors', professorRows.length);

    const students = buildStudents();
    const studentRows = await createAll(
      sr.entities.Student,
      students.map((student) => ({
        user_id: '',
        full_name: student.full_name,
        student_id: student.student_id,
        faculty_id: facultyId[student.faculty],
        department_id: departmentId[student.department],
        program: student.programme,
        year: student.year,
        group_name: student.group,
        email: student.email,
        enrollment_status: 'active',
        intervention_status: student.intervention_status,
        is_demo: true,
      })),
    );
    students.forEach((student, index) => {
      student.id = studentRows[index].id;
    });
    count('students', studentRows.length);
    count('programmes', new Set(students.map((student) => student.programme)).size);
    count('groups', new Set(students.map((student) => student.group)).size);

    // ── Courses, modules and materials ─────────────────────────────────────
    const courseRows = await createAll(
      sr.entities.Course,
      COURSES.map((course) => {
        const professor = professorRows[course.professor];
        const department = DEPARTMENTS.find((row) => row.key === course.dept);
        return {
          code: course.code,
          title: course.title,
          faculty_id: facultyId[course.faculty],
          department_id: departmentId[course.dept],
          professor_id: professor.id,
          credits: course.credits,
          semester: TERM,
          year_level: course.year,
          description: course.description,
          level: course.level,
          objectives: course.objectives,
          prerequisites: course.prerequisites,
          status: 'published',
          syllabus: syllabusText(course, professor.full_name, department ? department.name : ''),
          weight_assignments: course.weights[0],
          weight_quizzes: course.weights[1],
          weight_midterm: course.weights[2],
          weight_final: course.weights[3],
          is_demo: true,
        };
      }),
    );
    count('courses', courseRows.length);

    const moduleRows = [];
    const moduleSources = [];
    COURSES.forEach((course, courseIndex) => {
      course.modules.forEach((module, moduleIndex) => {
        moduleSources.push({ course, courseIndex, module, moduleIndex });
        moduleRows.push({
          course_id: courseRows[courseIndex].id,
          course_code: course.code,
          course_title: course.title,
          module_number: moduleIndex + 1,
          title: module.t,
          introduction: module.i,
          objectives: module.o,
          lecture_topic: module.t,
          lecture_notes: lectureNotes(course.code, module, moduleIndex),
          readings: module.r,
          activity: `Seminar discussion on ${module.c[0]} and ${module.c[1]}.`,
          duration_hours: course.credits >= 6 ? 5 : 4,
          status: 'published',
          professor_id: courseRows[courseIndex].professor_id,
          is_demo: true,
        });
      });
    });
    const createdModules = await createAll(sr.entities.CourseModule, moduleRows);
    count('modules', createdModules.length);

    const resourceRows = [];
    moduleSources.forEach((source, index) => {
      const base = {
        course_id: courseRows[source.courseIndex].id,
        course_code: source.course.code,
        module_id: createdModules[index].id,
        module_number: source.moduleIndex + 1,
        professor_id: courseRows[source.courseIndex].professor_id,
        published_date: shiftDays(-70 + source.moduleIndex * 7),
        visible_to_students: true,
        is_demo: true,
      };
      resourceRows.push(
        {
          ...base,
          title: `Module ${source.moduleIndex + 1} — ${source.module.t}: lecture notes`,
          type: 'lecture_notes',
          description: `Full lecture notes for Module ${source.moduleIndex + 1}, including key concepts and seminar questions.`,
          content: lectureNotes(source.course.code, source.module, source.moduleIndex),
          reading_list: source.module.r,
        },
        {
          ...base,
          title: `Module ${source.moduleIndex + 1} — study guide`,
          type: 'study_guide',
          description: `Objectives, glossary and practice questions for Module ${source.moduleIndex + 1}.`,
          content: studyGuide(source.course.code, source.module, source.moduleIndex, source.course.modules.length),
          reading_list: [],
        },
      );
    });
    COURSES.forEach((course, courseIndex) => {
      const professor = professorRows[course.professor];
      const department = DEPARTMENTS.find((row) => row.key === course.dept);
      resourceRows.push({
        course_id: courseRows[courseIndex].id,
        course_code: course.code,
        module_number: 0,
        professor_id: professor.id,
        published_date: shiftDays(-84),
        visible_to_students: true,
        is_demo: true,
        title: `${course.code} syllabus`,
        type: 'reading',
        description: 'Full course syllabus: objectives, weekly schedule, assessment structure and integrity rules.',
        content: syllabusText(course, professor.full_name, department ? department.name : ''),
        reading_list: [],
      });
    });
    const createdResources = await createAll(sr.entities.LearningResource, resourceRows);
    count('learningResources', createdResources.length);

    // ── Assessment: assignments, quiz and questions ────────────────────────
    const assignmentSpecs = COURSES.map((course) =>
      [
        { kind: 'essay', moduleIndex: 1, due: shiftDays(-21), status: 'closed' },
        { kind: 'policy_brief', moduleIndex: 2, due: shiftDays(9), status: 'published' },
        { kind: 'presentation', moduleIndex: 3, due: shiftDays(24), status: 'published' },
      ].map((row) => ({
        ...assignmentSpec(course, row.kind, course.modules[row.moduleIndex], row.moduleIndex),
        due: row.due,
        status: row.status,
      })),
    );

    const assignmentRows = [];
    COURSES.forEach((course, courseIndex) => {
      assignmentSpecs[courseIndex].forEach((spec) => {
        const module = course.modules[spec.moduleNumber - 1];
        assignmentRows.push({
          course_id: courseRows[courseIndex].id,
          course_code: course.code,
          course_title: course.title,
          professor_id: courseRows[courseIndex].professor_id,
          module_id: createdModules[moduleSources.findIndex(
            (source) => source.courseIndex === courseIndex && source.moduleIndex === spec.moduleNumber - 1,
          )].id,
          module_number: spec.moduleNumber,
          title: spec.title,
          instructions: spec.instructions,
          objectives: spec.objectives,
          assessment_type: spec.type,
          max_score: 100,
          published_date: shiftDays(-56),
          due_date: spec.due,
          submission_format: spec.format,
          late_policy: 'Late submissions lose 5 marks per day for up to five days. After that the item is recorded as missing unless an extension was agreed in advance.',
          rubric: spec.rubric,
          status: spec.status,
          semester: TERM,
          is_demo: true,
          topic: module.t,
        });
      });
    });
    const createdAssignments = await createAll(sr.entities.Assignment, assignmentRows);
    count('assignments', createdAssignments.length);

    const quizRows = [];
    const questionSources = [];
    COURSES.forEach((course, courseIndex) => {
      quizRows.push({
        course_id: courseRows[courseIndex].id,
        course_code: course.code,
        course_title: course.title,
        professor_id: courseRows[courseIndex].professor_id,
        module_number: 1,
        title: `${course.code} knowledge check`,
        description: `Six questions covering the modules of ${course.title}.`,
        instructions: 'Two attempts are permitted and the higher score counts. Feedback appears after submission.',
        duration_minutes: 25,
        attempt_limit: 2,
        pass_mark: 60,
        available_from: shiftDays(-45),
        available_until: shiftDays(18),
        status: 'published',
        semester: TERM,
        is_demo: true,
      });
      questionSources.push(quizQuestions(course));
    });
    const createdQuizzes = await createAll(sr.entities.Quiz, quizRows);
    count('quizzes', createdQuizzes.length);

    const questionRows = [];
    questionSources.forEach((questions, courseIndex) => {
      questions.forEach((question, index) => {
        const moduleIndex = Math.max(0, question.moduleNumber - 1);
        const moduleId = createdModules[moduleSources.findIndex(
          (source) => source.courseIndex === courseIndex && source.moduleIndex === moduleIndex,
        )].id;
        questionRows.push({
          quiz_id: createdQuizzes[courseIndex].id,
          course_id: courseRows[courseIndex].id,
          module_id: moduleId,
          module_number: question.moduleNumber,
          prompt: question.prompt,
          type: question.type,
          options: question.options,
          correct_index: question.correct_index,
          correct_answers: question.correct_answers,
          explanation: question.explanation,
          difficulty: question.difficulty,
          points: 1,
          order: index + 1,
        });
      });
    });
    const createdQuestions = await createAll(sr.entities.QuizQuestion, questionRows);
    count('quizQuestions', createdQuestions.length);

    // ── Enrolment and the student record behind it ─────────────────────────
    const enrollmentRows = [];
    const enrollmentMeta = [];
    students.forEach((student) => {
      COURSES.forEach((course, courseIndex) => {
        if (course.faculty !== student.faculty) return;
        enrollmentMeta.push({ student, courseIndex });
        enrollmentRows.push({
          student_id: student.id,
          student_user_id: '',
          course_id: courseRows[courseIndex].id,
          faculty_id: facultyId[course.faculty],
          department_id: departmentId[course.dept],
          enrolled_date: shiftDays(-70),
          is_demo: true,
        });
      });
    });
    const createdEnrollments = await createAll(sr.entities.CourseEnrollment, enrollmentRows);
    count('courseEnrollments', createdEnrollments.length);

    // Ability drives marks, attendance and risk, so the three agree with each other.
    const ability = new Map();
    students.forEach((student, index) => {
      const random = noise(index + 11);
      ability.set(student.id, student.at_risk ? 46 + random() * 14 : 66 + random() * 30);
    });

    const submissionRows = [];
    const progressRows = [];
    const attemptRows = [];
    const recordRows = [];

    enrollmentMeta.forEach(({ student, courseIndex }, index) => {
      const random = noise(index + 101);
      const base = ability.get(student.id);
      const enrolment = createdEnrollments[index];
      const closed = createdAssignments[courseIndex * 3];
      const open = createdAssignments[courseIndex * 3 + 1];

      if (!student.at_risk || random() > 0.5) {
        const score = clamp(base + (random() - 0.5) * 12, 28, 98);
        submissionRows.push({
          assignment_id: closed.id,
          course_id: courseRows[courseIndex].id,
          course_code: COURSES[courseIndex].code,
          professor_id: courseRows[courseIndex].professor_id,
          student_id: student.id,
          student_user_id: '',
          student_name: student.full_name,
          student_group: student.group,
          submitted_at: shiftDays(-24),
          content: `Essay submitted on ${closed.topic}. The argument follows the module framework and cites the set readings.`,
          status: 'graded',
          score,
          feedback: feedbackFor(score),
          graded_at: shiftDays(-17),
          graded_by: professorRows[COURSES[courseIndex].professor].full_name,
          is_demo: true,
        });
      }

      if (random() > 0.62) {
        submissionRows.push({
          assignment_id: open.id,
          course_id: courseRows[courseIndex].id,
          course_code: COURSES[courseIndex].code,
          professor_id: courseRows[courseIndex].professor_id,
          student_id: student.id,
          student_user_id: '',
          student_name: student.full_name,
          student_group: student.group,
          submitted_at: shiftDays(-2),
          content: `Brief submitted on ${open.topic}, following the required problem / options / recommendation structure.`,
          status: 'submitted',
          is_demo: true,
        });
      }

      const courseModules = moduleSources
        .map((source, moduleIndex) => ({ source, moduleIndex }))
        .filter((row) => row.source.courseIndex === courseIndex);
      const completed = student.at_risk ? 1 : 3;
      courseModules.slice(0, completed).forEach((row, position) => {
        progressRows.push({
          student_user_id: '',
          student_id: student.id,
          course_id: courseRows[courseIndex].id,
          course_code: COURSES[courseIndex].code,
          module_id: createdModules[row.moduleIndex].id,
          module_number: position + 1,
          completed: true,
          completed_at: shiftDays(-20 + position * 6),
          is_demo: true,
        });
      });

      const attemptScore = clamp(base + (random() - 0.5) * 16, 25, 100);
      attemptRows.push({
        quiz_id: createdQuizzes[courseIndex].id,
        course_id: courseRows[courseIndex].id,
        professor_id: courseRows[courseIndex].professor_id,
        student_user_id: '',
        student_id: student.id,
        student_name: student.full_name,
        answers: createdQuestions
          .filter((question) => question.quiz_id === createdQuizzes[courseIndex].id)
          .map((question, questionIndex) =>
            String(
              questionIndex < Math.round((attemptScore / 100) * 6)
                ? question.correct_answers?.[0] ?? question.correct_index
                : -1,
            ),
          ),
        score: attemptScore,
        max_score: 100,
        submitted_at: shiftDays(-30 + (index % 9)),
        is_demo: true,
      });

      recordRows.push({
        student_id: student.id,
        course_id: courseRows[courseIndex].id,
        faculty_id: facultyId[COURSES[courseIndex].faculty],
        department_id: departmentId[COURSES[courseIndex].dept],
        grade: gradeFromPercent(clamp(base - 4 + (random() - 0.5) * 10, 30, 96)),
        assessment_type: 'exam',
        term: PREVIOUS_TERM,
        semester: PREVIOUS_TERM,
        recorded_date: shiftDays(-190),
        is_demo: true,
      });
      if (!student.at_risk || random() > 0.4) {
        recordRows.push({
          student_id: student.id,
          course_id: courseRows[courseIndex].id,
          faculty_id: facultyId[COURSES[courseIndex].faculty],
          department_id: departmentId[COURSES[courseIndex].dept],
          grade: gradeFromPercent(clamp(base + (random() - 0.5) * 12, 30, 97)),
          assessment_type: 'coursework',
          term: TERM,
          semester: TERM,
          recorded_date: shiftDays(-18),
          is_demo: true,
        });
      }

      void enrolment;
    });

    count('submissions', (await createAll(sr.entities.Submission, submissionRows)).length);
    count('moduleProgress', (await createAll(sr.entities.ModuleProgress, progressRows)).length);
    count('quizAttempts', (await createAll(sr.entities.QuizAttempt, attemptRows)).length);
    count('academicRecords', (await createAll(sr.entities.AcademicRecord, recordRows)).length);

    // ── Class register: four weeks, Monday to Friday, no conflicts ─────────
    const sessionEntries = [];
    COURSES.forEach((course, courseIndex) => {
      GROUPS.filter((group) => group.faculty === course.faculty).forEach((group) => {
        sessionEntries.push({
          courseId: courseRows[courseIndex].id,
          courseCode: course.code,
          courseTitle: course.title,
          professorId: courseRows[courseIndex].professor_id,
          group: group.name,
          faculty: course.faculty,
          sessions: course.sessions,
          kinds: course.sessions >= 4 ? ['lecture', 'seminar', 'practice', 'lecture'] : ['lecture', 'seminar', 'practice'],
          topicFor: (dayIndex) => course.modules[dayIndex % course.modules.length].t,
        });
      });
    });

    const sessionRows = buildWeeklySessions(sessionEntries, [-2, -1, 0, 1]).map((row) => ({
      ...row,
      is_demo: true,
    }));
    const createdSessions = await createAll(sr.entities.ClassSession, sessionRows);
    count('classSessions', createdSessions.length);

    // Attendance is recorded against the sessions that have already taken place.
    const today = isoOf(new Date());
    const studentsByGroup = new Map();
    students.forEach((student) => {
      if (!studentsByGroup.has(student.group)) studentsByGroup.set(student.group, []);
      studentsByGroup.get(student.group).push(student);
    });
    const courseByIndex = new Map(courseRows.map((row, index) => [row.id, index]));

    const attendanceRows = [];
    createdSessions.forEach((session) => {
      if (session.session_date >= today) return;
      const courseIndex = courseByIndex.get(session.course_id);
      if (courseIndex === undefined) return;
      const cohort = studentsByGroup.get(session.group_name) || [];
      cohort
        .filter((student) => COURSES[courseIndex].faculty === student.faculty)
        .forEach((student, position) => {
          const random = noise(session.session_date.replace(/-/g, '').length + position * 7 + courseIndex * 13);
          const roll = random();
          let status = 'present';
          if (student.at_risk) status = roll < 0.24 ? 'absent' : roll < 0.4 ? 'late' : 'present';
          else if (roll < 0.05) status = 'absent';
          else if (roll < 0.11) status = 'late';
          else if (roll < 0.14) status = 'excused';
          attendanceRows.push({
            student_id: student.id,
            course_id: session.course_id,
            faculty_id: facultyId[COURSES[courseIndex].faculty],
            department_id: departmentId[COURSES[courseIndex].dept],
            session_date: session.session_date,
            status,
            recorded_by: professorRows[COURSES[courseIndex].professor].full_name,
            is_demo: true,
          });
        });
    });
    count('attendanceRecords', (await createAll(sr.entities.AttendanceRecord, attendanceRows, 150)).length);

    // ── Student office: requests, notices, calendar ────────────────────────
    const REQUEST_SEED = [
      ['Certificate of Enrollment', 'submitted', 'normal'],
      ['Academic Transcript', 'under_review', 'high'],
      ['Grade Appeal', 'awaiting_information', 'high'],
      ['Certificate of Enrollment', 'approved', 'normal'],
      ['Academic Leave', 'under_review', 'high'],
      ['Scholarship Application', 'submitted', 'normal'],
      ['Duplicate Student ID', 'approved', 'low'],
      ['Transfer Request', 'submitted', 'normal'],
      ['Dormitory Reference Letter', 'completed', 'low'],
      ['Exam Retake Permission', 'submitted', 'high'],
      ['Academic Transcript', 'rejected', 'normal'],
      ['Graduation Certificate', 'under_review', 'normal'],
    ];
    const requestRows = REQUEST_SEED.map(([category, status, priority], index) => {
      const student = students[(index * 5 + 2) % students.length];
      return {
        user_id: '',
        student_id: student.id,
        student_name: student.full_name,
        faculty_id: facultyId[student.faculty],
        category,
        subject: `${category} — ${student.full_name}`,
        description: `${category} submitted through the Dean's Office portal for ${student.full_name}. Demonstration record.`,
        status,
        priority,
        assigned_to:
          index % 3 === 0 ? 'Registrar Office' : index % 3 === 1 ? 'Deputy Dean for Academic Affairs' : 'Faculty Administrator',
        submitted_date: shiftDays(-(index + 1)),
        due_date: shiftDays(14 - index),
        is_demo: true,
      };
    });
    const createdRequests = await createAll(sr.entities.AdminRequest, requestRows);
    count('adminRequests', createdRequests.length);

    const requestEvents = [];
    createdRequests.forEach((request, index) => {
      requestEvents.push({
        request_id: request.id,
        type: 'status_change',
        status: 'submitted',
        note: 'Request received by the Dean’s Office.',
        actor_name: request.student_name,
        actor_role: 'student',
        event_date: request.submitted_date,
      });
      if (['under_review', 'awaiting_information', 'approved', 'rejected', 'completed'].includes(request.status)) {
        requestEvents.push({
          request_id: request.id,
          type: 'status_change',
          status: 'under_review',
          note: 'Assigned for administrative review.',
          actor_name: 'Registrar Office',
          actor_role: 'academic_staff',
          event_date: shiftDays(-(index + 1) + 1),
        });
      }
      if (['approved', 'rejected', 'completed'].includes(request.status)) {
        requestEvents.push({
          request_id: request.id,
          type: 'status_change',
          status: request.status,
          note: request.status === 'rejected' ? 'Rejected: documentation incomplete.' : 'Decision recorded by the Dean’s Office.',
          actor_name: 'Deputy Dean for Academic Affairs',
          actor_role: 'deputy_dean',
          event_date: shiftDays(-1),
        });
      }
    });
    count('requestEvents', (await createAll(sr.entities.RequestEvent, requestEvents)).length);

    count(
      'announcements',
      (
        await createAll(sr.entities.Announcement, [
          {
            title: 'Midterm examination schedule published',
            body: 'The midterm examination schedule for both schools is available in the student portal. Students should verify their own timetable before the end of the week.',
            audience_type: 'university',
            status: 'published',
            publish_date: shiftDays(-2),
            author_name: 'Dean’s Office',
            is_demo: true,
          },
          {
            title: 'Attendance register audit — November',
            body: 'Faculty administrators are asked to complete the November attendance register audit before Friday.',
            audience_type: 'academic_staff',
            status: 'published',
            publish_date: shiftDays(-4),
            author_name: 'Deputy Dean for Academic Affairs',
            is_demo: true,
          },
          {
            title: 'International Relations faculty board',
            body: 'The faculty board reviews midterm performance indicators and the current risk cases.',
            audience_type: 'faculty',
            faculty_id: facultyId.IR,
            status: 'published',
            publish_date: shiftDays(-1),
            author_name: 'Faculty Administrator',
            is_demo: true,
          },
          {
            title: 'Group IR-21A: seminar room change',
            body: 'Thursday seminars move to room 307 for the remainder of the term.',
            audience_type: 'student_group',
            group_name: 'IR-21A',
            status: 'published',
            publish_date: shiftDays(-3),
            author_name: 'Teaching Office',
            is_demo: true,
          },
          {
            title: 'Spring course selection opens next week',
            body: 'Course selection for the spring semester opens on Monday. Academic advisors should prepare programme recommendations.',
            audience_type: 'students',
            status: 'scheduled',
            publish_date: shiftDays(7),
            author_name: 'Registrar Office',
            is_demo: true,
          },
          {
            title: 'Draft — revised academic integrity policy',
            body: 'Working draft of the revised academic integrity policy for review by the academic council.',
            audience_type: 'university',
            status: 'draft',
            publish_date: '',
            author_name: 'Dean’s Office',
            is_demo: true,
          },
        ])
      ).length,
    );

    count(
      'academicEvents',
      (
        await createAll(sr.entities.AcademicEvent, [
          { title: 'Midterm examination period', type: 'exam_period', start_date: shiftDays(12), end_date: shiftDays(19), faculty_id: '', location: 'Main campus', description: 'Midterm examinations for both schools.', is_demo: true },
          { title: 'Faculty board — International Relations', type: 'faculty_meeting', start_date: shiftDays(4), end_date: shiftDays(4), faculty_id: facultyId.IR, location: 'Room 214', description: 'Review of academic performance indicators and risk cases.', is_demo: true },
          { title: 'Department heads coordination meeting', type: 'department_meeting', start_date: shiftDays(6), end_date: shiftDays(6), faculty_id: '', location: 'Senate Hall', description: 'Monthly coordination between department heads.', is_demo: true },
          { title: 'Course selection deadline', type: 'deadline', start_date: shiftDays(16), end_date: shiftDays(16), faculty_id: '', location: 'Student portal', description: 'Final day for spring course selection.', is_demo: true },
          { title: 'Winter examination session begins', type: 'exam_period', start_date: shiftDays(42), end_date: shiftDays(63), faculty_id: '', location: 'Main campus', description: 'Winter session for undergraduate programmes.', is_demo: true },
          { title: 'Semester concludes', type: 'semester', start_date: shiftDays(48), end_date: shiftDays(48), faculty_id: '', location: '', description: 'End of the fall semester teaching period.', is_demo: true },
        ])
      ).length,
    );

    count(
      'administrativeTasks',
      (
        await createAll(sr.entities.AdministrativeTask, [
          { title: 'Verify outstanding transcript requests', category: 'Requests', assigned_to: 'Registrar Office', due_date: shiftDays(3), status: 'in_progress', is_demo: true },
          { title: 'Compile faculty attendance audit', category: 'Attendance', assigned_to: 'Deputy Dean for Academic Affairs', due_date: shiftDays(5), status: 'open', is_demo: true },
          { title: 'Review academic risk cases for November', category: 'Academic risk', assigned_to: 'Dean’s Office', due_date: shiftDays(8), status: 'open', is_demo: true },
          { title: 'Confirm examination room allocation', category: 'Examinations', assigned_to: 'Academic Affairs', due_date: shiftDays(11), status: 'open', is_demo: true },
          { title: 'Publish spring course catalogue', category: 'Curriculum', assigned_to: 'Registrar Office', due_date: shiftDays(15), status: 'open', is_demo: true },
        ])
      ).length,
    );

    const settingsExist = list(await sr.entities.AppSetting.filter({ key: 'risk_gpa_high' }, { limit: 1 }));
    if (!settingsExist.length) {
      await createAll(sr.entities.AppSetting, [
        { key: 'attendance_threshold', value: '85', label: 'Attendance threshold (%)', description: 'Attendance below this percentage is flagged for review.' },
        { key: 'risk_gpa_high', value: '3.0', label: 'High risk GPA', description: 'GPA below this value indicates high academic risk.' },
        { key: 'risk_gpa_medium', value: '3.6', label: 'Medium risk GPA', description: 'GPA below this value indicates medium academic risk.' },
        { key: 'risk_absence_medium', value: '20', label: 'Medium risk absence rate (%)', description: 'Absence rate above this value indicates medium risk.' },
        { key: 'risk_absence_high', value: '30', label: 'High risk absence rate (%)', description: 'Absence rate above this value indicates high risk.' },
      ]);
    }

    // ── Demonstration account ──────────────────────────────────────────────
    // The student office records the provision; the first sign-in with this
    // address applies the role and links the seeded record to the account.
    const demoStudent = students[DEMO_STUDENT.index];
    const existingProvision = list(await sr.entities.AccountProvision.filter({ email: DEMO_STUDENT.email }, { limit: 1 }));
    if (!existingProvision.length) {
      await sr.entities.AccountProvision.create({
        email: DEMO_STUDENT.email,
        role: 'student',
        full_name: demoStudent.full_name,
        faculty_id: facultyId[demoStudent.faculty],
        department_id: departmentId[demoStudent.department],
        group_name: demoStudent.group,
        programme: demoStudent.programme,
        student_id: demoStudent.student_id,
        account_status: 'active',
        status: 'pending',
        created_by_name: 'Demonstration data seeder',
        created_by_user_id: caller.id,
      });
    }

    const demoLink = list(await sr.entities.ClassSession.filter(
      { course_id: { $in: [courseRows[0].id] }, session_date: { $gte: shiftDays(0) } },
      { sort: 'session_date', limit: 1 },
    ));

    await sr.entities.AppSetting.create({
      key: MARKER_KEY,
      value: MARKER_VERSION,
      label: 'Demonstration dataset',
      description: 'Written by the demonstration seeder. Its presence prevents a second seed.',
    });

    return Response.json({
      seeded: true,
      counts,
      demo_student: {
        record_id: demoStudent.id,
        full_name: demoStudent.full_name,
        student_id: demoStudent.student_id,
        email: DEMO_STUDENT.email,
        group: demoStudent.group,
        provision: 'pending — applied automatically on first sign-in with this address',
      },
      upcoming_class: demoLink[0]
        ? { date: demoLink[0].session_date, start: demoLink[0].start_time, course: demoLink[0].course_code, room: demoLink[0].room }
        : null,
      week_start: isoOf(mondayOf()),
    });
  } catch (error) {
    return Response.json({ error: error.message, step }, { status: 500 });
  }
}