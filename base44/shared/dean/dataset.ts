// Institutional dataset for the Dean workspace.
//
// Every collection is read with the service role *after* the calling function
// has verified the caller's role and resolved their scope, then reduced to
// per-person and per-course metrics. Aggregation happens once here so each
// action returns summaries instead of shipping raw academic records.

export const DEAN_ROLES = [
  'admin',
  'dean',
  'deputy_dean',
  'academic_staff',
  'faculty_admin',
  'department_head',
];

export const PASS_MARK = 60;
export const ATTENDANCE_FLOOR = 75;

// The institution stores marks on two scales: historical registers use a
// 100-point mark, the LMS uses the 5-point scale. Everything is converted to a
// percentage so an average never mixes the two.
export const GRADE_NOTE = 'Grades are shown on a 100-point scale; 5-point marks are converted (5 = 100).';

export const normaliseGrade = (grade) => {
  const value = Number(grade);
  if (!Number.isFinite(value)) return null;
  return value <= 5 ? round((value / 5) * 100) : value;
};

const PAGE_SIZE = 500;

const asList = (page) => (Array.isArray(page) ? page : (page && page.items) || []);

async function readAll(collection, query) {
  const rows = [];
  let cursor = null;
  for (let guard = 0; guard < 20; guard += 1) {
    const options = { limit: PAGE_SIZE };
    if (cursor) options.cursor = cursor;
    const page = query ? await collection.filter(query, options) : await collection.list(options);
    rows.push(...asList(page));
    if (!page || Array.isArray(page) || !page.has_more || !page.next_cursor) break;
    cursor = page.next_cursor;
  }
  return rows;
}

export const mean = (values) =>
  values.length ? values.reduce((total, value) => total + value, 0) / values.length : null;

export const round = (value, digits = 1) =>
  value === null || value === undefined ? null : Number(value.toFixed(digits));

const push = (map, key, value) => {
  if (!key) return;
  const bucket = map.get(key);
  if (bucket) bucket.push(value);
  else map.set(key, [value]);
};

const bump = (map, key) => {
  if (!key) return;
  map.set(key, (map.get(key) || 0) + 1);
};

const attended = (status) => status === 'present' || status === 'late';

// Faculty administrators and department heads inspect their own unit only; the
// dean's office sees the whole institution.
export function resolveScope(user) {
  const role = String((user && user.role) || '').toLowerCase();
  if (role === 'faculty_admin' && user.faculty_id) {
    return { faculty_id: user.faculty_id, label: 'your faculty' };
  }
  if (role === 'department_head' && user.department_id) {
    return { department_id: user.department_id, label: 'your department' };
  }
  return { label: 'the whole institution' };
}

// Terms arrive in several spellings ("2026-2027 Fall", "2026/2027 · Fall"), so
// they are normalised before they are grouped or ordered.
export function normaliseTerm(term) {
  const text = String(term || '')
    .replace(/·/g, ' ')
    .replace(/\//g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  const match = text.match(/^(\d{4})-(\d{4})\s+(fall|spring|summer)/i);
  if (!match) return { key: text, label: text, order: 0 };
  const raw = match[3].toLowerCase();
  const season = raw.charAt(0).toUpperCase() + raw.slice(1);
  const order = Number(match[1]) * 10 + (season === 'Spring' ? 2 : season === 'Summer' ? 3 : 1);
  return { key: `${match[1]}-${match[2]} ${season}`, label: `${match[1]}/${match[2]} ${season}`, order };
}

export async function loadInstitution(svc, scope) {
  const [facultyRows, departmentRows, studentRows, professorRows, courseRows, enrolmentRows, recordRows, attendanceRows] =
    await Promise.all([
      readAll(svc.entities.Faculty),
      readAll(svc.entities.Department),
      readAll(svc.entities.Student),
      readAll(svc.entities.Professor),
      readAll(svc.entities.Course),
      readAll(svc.entities.CourseEnrollment),
      readAll(svc.entities.AcademicRecord),
      readAll(svc.entities.AttendanceRecord),
    ]);

  const faculties = scope && scope.faculty_id
    ? facultyRows.filter((row) => row.id === scope.faculty_id)
    : facultyRows;

  const departments = scope && scope.department_id
    ? departmentRows.filter((row) => row.id === scope.department_id)
    : scope && scope.faculty_id
      ? departmentRows.filter((row) => row.faculty_id === scope.faculty_id)
      : departmentRows;

  const inScope = (row) => {
    if (scope && scope.department_id) return row.department_id === scope.department_id;
    if (scope && scope.faculty_id) return row.faculty_id === scope.faculty_id;
    return true;
  };

  const students = studentRows.filter(inScope);
  const professors = professorRows.filter(inScope);
  const courses = courseRows.filter(inScope);
  const enrolments = enrolmentRows.filter(inScope);
  // Normalising once here means every average, pass rate and distribution below
  // is computed on the same scale.
  const records = recordRows
    .filter(inScope)
    .map((row) => ({ ...row, grade: normaliseGrade(row.grade) }))
    .filter((row) => row.grade !== null);
  const attendance = attendanceRows.filter(inScope);

  const facultyById = new Map(faculties.map((row) => [row.id, row]));
  const departmentById = new Map(departments.map((row) => [row.id, row]));
  const studentById = new Map(students.map((row) => [row.id, row]));
  const professorById = new Map(professors.map((row) => [row.id, row]));
  const courseById = new Map(courses.map((row) => [row.id, row]));

  const gradesByStudent = new Map();
  const gradesByCourse = new Map();
  records.forEach((row) => {
    push(gradesByStudent, row.student_id, row.grade);
    push(gradesByCourse, row.course_id, row.grade);
  });

  const attendanceByStudent = new Map();
  const attendanceByCourse = new Map();
  attendance.forEach((row) => {
    const value = attended(row.status) ? 100 : 0;
    push(attendanceByStudent, row.student_id, value);
    push(attendanceByCourse, row.course_id, value);
  });

  const enrolmentsByStudent = new Map();
  const enrolledByCourse = new Map();
  enrolments.forEach((row) => {
    push(enrolmentsByStudent, row.student_id, row.course_id);
    bump(enrolledByCourse, row.course_id);
  });

  const studentMetrics = new Map();
  students.forEach((student) => {
    const grades = gradesByStudent.get(student.id) || [];
    const presence = attendanceByStudent.get(student.id) || [];
    const avgGrade = round(mean(grades));
    const attendanceRate = round(mean(presence));

    const gradeBelow = avgGrade !== null && avgGrade < PASS_MARK;
    const gradeNear = !gradeBelow && avgGrade !== null && avgGrade < 70;
    const attendanceCritical = attendanceRate !== null && attendanceRate < 65;
    const attendanceLow = !attendanceCritical && attendanceRate !== null && attendanceRate < ATTENDANCE_FLOOR;

    const riskFlags = [];
    const riskReasons = [];
    if (gradeBelow) {
      riskFlags.push('grade_below');
      riskReasons.push(`Average grade ${avgGrade} is below the ${PASS_MARK} pass mark`);
    } else if (gradeNear) {
      riskFlags.push('grade_near');
      riskReasons.push(`Average grade ${avgGrade} is close to the pass mark`);
    }
    if (attendanceCritical) {
      riskFlags.push('attendance_critical');
      riskReasons.push(`Attendance ${attendanceRate}% is critically low`);
    } else if (attendanceLow) {
      riskFlags.push('attendance_low');
      riskReasons.push(`Attendance ${attendanceRate}% is below the ${ATTENDANCE_FLOOR}% requirement`);
    }

    studentMetrics.set(student.id, {
      avgGrade,
      attendanceRate,
      gradedAssessments: grades.length,
      attendanceSessions: presence.length,
      enrolledCourses: (enrolmentsByStudent.get(student.id) || []).length,
      riskLevel: gradeBelow || attendanceCritical ? 'high' : riskFlags.length ? 'medium' : 'low',
      riskFlags,
      riskReasons,
    });
  });

  const courseMetrics = new Map();
  courses.forEach((course) => {
    const grades = gradesByCourse.get(course.id) || [];
    const presence = attendanceByCourse.get(course.id) || [];
    const passed = grades.filter((grade) => grade >= PASS_MARK).length;
    courseMetrics.set(course.id, {
      enrolled: enrolledByCourse.get(course.id) || 0,
      graded: grades.length,
      avgGrade: round(mean(grades)),
      attendanceRate: round(mean(presence)),
      passRate: grades.length ? round((passed / grades.length) * 100) : null,
    });
  });

  const professorMetrics = new Map();
  professors.forEach((professor) => {
    const owned = courses.filter((course) => course.professor_id === professor.id);
    const ownedIds = new Set(owned.map((course) => course.id));
    const grades = records.filter((row) => ownedIds.has(row.course_id)).map((row) => row.grade);
    const presence = attendance
      .filter((row) => ownedIds.has(row.course_id))
      .map((row) => (attended(row.status) ? 100 : 0));
    const learners = new Set(
      enrolments.filter((row) => ownedIds.has(row.course_id)).map((row) => row.student_id),
    );
    professorMetrics.set(professor.id, {
      courses: owned.length,
      students: learners.size,
      avgGrade: round(mean(grades)),
      attendanceRate: round(mean(presence)),
    });
  });

  return {
    scope,
    faculties,
    departments,
    students,
    professors,
    courses,
    enrolments,
    records,
    attendance,
    indexes: { facultyById, departmentById, studentById, professorById, courseById },
    studentMetrics,
    courseMetrics,
    professorMetrics,
  };
}