// Response builders for the Dean workspace. Each builder turns the loaded
// institutional dataset into one screen's payload: rows, filters and totals.
import { ATTENDANCE_FLOOR, PASS_MARK, mean, normaliseTerm, round } from './dataset.ts';

const attended = (status) => status === 'present' || status === 'late';

const presenceRate = (rows) => round(mean(rows.map((row) => (attended(row.status) ? 100 : 0))));
const gradeAverage = (rows) => round(mean(rows.map((row) => row.grade)));
const unique = (values) => [...new Set(values.filter(Boolean))];
const matches = (haystack, needle) => haystack.join(' ').toLowerCase().includes(needle);

const FLAG_LABELS = {
  grade_below: 'Grade below pass mark',
  grade_near: 'Grade near pass mark',
  attendance_critical: 'Attendance critically low',
  attendance_low: 'Attendance below requirement',
};

export function facultyRowsView(inst) {
  const rows = inst.faculties.map((faculty) => {
    const students = inst.students.filter((row) => row.faculty_id === faculty.id);
    const staff = inst.professors.filter((row) => row.faculty_id === faculty.id);
    const courses = inst.courses.filter((row) => row.faculty_id === faculty.id);
    const records = inst.records.filter((row) => row.faculty_id === faculty.id);
    const attendance = inst.attendance.filter((row) => row.faculty_id === faculty.id);
    const atRisk = students.filter((student) => {
      const metrics = inst.studentMetrics.get(student.id);
      return metrics && metrics.riskLevel === 'high';
    }).length;
    return {
      id: faculty.id,
      code: faculty.code || '—',
      name: faculty.name,
      dean_name: faculty.dean_name || '—',
      established: faculty.established || null,
      departments: inst.departments.filter((row) => row.faculty_id === faculty.id).length,
      programmes: unique(students.map((row) => row.program)).length,
      students: students.length,
      professors: staff.length,
      courses: courses.length,
      avgGrade: gradeAverage(records),
      attendanceRate: presenceRate(attendance),
      atRisk,
      monitoring: students.filter((row) => row.intervention_status === 'monitoring').length,
    };
  });
  return rows.sort((a, b) => b.students - a.students);
}

export function departmentRowsView(inst) {
  const rows = inst.departments.map((department) => {
    const faculty = inst.indexes.facultyById.get(department.faculty_id);
    const students = inst.students.filter((row) => row.department_id === department.id);
    const staff = inst.professors.filter((row) => row.department_id === department.id);
    const courses = inst.courses.filter((row) => row.department_id === department.id);
    const records = inst.records.filter((row) => row.department_id === department.id);
    const attendance = inst.attendance.filter((row) => row.department_id === department.id);
    const atRisk = students.filter((student) => {
      const metrics = inst.studentMetrics.get(student.id);
      return metrics && metrics.riskLevel === 'high';
    }).length;
    return {
      id: department.id,
      code: department.code || '—',
      name: department.name,
      faculty_id: department.faculty_id,
      faculty: faculty ? faculty.name : '—',
      faculty_code: faculty ? faculty.code : '',
      head_name: department.head_name || '—',
      students: students.length,
      professors: staff.length,
      courses: courses.length,
      avgGrade: gradeAverage(records),
      attendanceRate: presenceRate(attendance),
      atRisk,
    };
  });
  return rows.sort((a, b) => b.students - a.students);
}

export function programmeRowsView(inst) {
  const names = unique(inst.students.map((row) => row.program)).sort();
  const rows = names.map((name) => {
    const students = inst.students.filter((row) => row.program === name);
    const ids = new Set(students.map((row) => row.id));
    const records = inst.records.filter((row) => ids.has(row.student_id));
    const attendance = inst.attendance.filter((row) => ids.has(row.student_id));
    const faculties = unique(students.map((row) => row.faculty_id)).map((id) => {
      const faculty = inst.indexes.facultyById.get(id);
      return faculty ? { id, name: faculty.name, code: faculty.code } : null;
    }).filter(Boolean);
    const atRisk = students.filter((student) => {
      const metrics = inst.studentMetrics.get(student.id);
      return metrics && metrics.riskLevel === 'high';
    }).length;
    return {
      id: name,
      name,
      faculties,
      faculty_names: faculties.map((item) => item.name).join(', ') || '—',
      students: students.length,
      years: unique(students.map((row) => row.year)).sort((a, b) => a - b),
      groups: unique(students.map((row) => row.group_name)).length,
      avgGrade: gradeAverage(records),
      attendanceRate: presenceRate(attendance),
      atRisk,
      monitoring: students.filter((row) => row.intervention_status === 'monitoring').length,
    };
  });
  return rows.sort((a, b) => b.students - a.students);
}

function studentRow(inst, student) {
  const metrics = inst.studentMetrics.get(student.id) || {};
  const faculty = inst.indexes.facultyById.get(student.faculty_id);
  const department = inst.indexes.departmentById.get(student.department_id);
  return {
    id: student.id,
    full_name: student.full_name,
    student_id: student.student_id || '—',
    email: student.email || '—',
    programme: student.program || '—',
    year: student.year || null,
    group_name: student.group_name || '—',
    faculty_id: student.faculty_id || '',
    faculty: faculty ? faculty.name : '—',
    faculty_code: faculty ? faculty.code : '',
    department: department ? department.name : '—',
    enrollment_status: student.enrollment_status || 'active',
    intervention_status: student.intervention_status || 'none',
    avgGrade: metrics.avgGrade === undefined ? null : metrics.avgGrade,
    attendanceRate: metrics.attendanceRate === undefined ? null : metrics.attendanceRate,
    enrolledCourses: metrics.enrolledCourses || 0,
    gradedAssessments: metrics.gradedAssessments || 0,
    riskLevel: metrics.riskLevel || 'low',
    riskFlags: metrics.riskFlags || [],
    riskReasons: metrics.riskReasons || [],
  };
}

export function studentRowsView(inst, filters) {
  const criteria = filters || {};
  const query = String(criteria.q || '').trim().toLowerCase();
  const rows = inst.students
    .map((student) => studentRow(inst, student))
    .filter((row) => {
      if (criteria.faculty_id && row.faculty_id !== criteria.faculty_id) return false;
      if (criteria.programme && row.programme !== criteria.programme) return false;
      if (criteria.year && Number(row.year) !== Number(criteria.year)) return false;
      if (criteria.risk && row.riskLevel !== criteria.risk) return false;
      if (criteria.status && row.enrollment_status !== criteria.status) return false;
      if (query && !matches([row.full_name, row.student_id, row.email, row.group_name, row.programme], query)) {
        return false;
      }
      return true;
    })
    .sort((a, b) => String(a.full_name || '').localeCompare(String(b.full_name || '')));

  const facets = {
    faculties: inst.faculties
      .map((faculty) => ({ id: faculty.id, name: faculty.name, code: faculty.code }))
      .sort((a, b) => String(a.name).localeCompare(String(b.name))),
    programmes: unique(inst.students.map((row) => row.program)).sort(),
    years: unique(inst.students.map((row) => Number(row.year))).sort((a, b) => a - b),
  };

  return { rows, total: rows.length, facets, passMark: PASS_MARK, attendanceFloor: ATTENDANCE_FLOOR };
}

export function studentDetailView(inst, id) {
  const student = inst.indexes.studentById.get(id);
  if (!student) return null;
  const metrics = inst.studentMetrics.get(student.id) || {};
  const courseIds = unique(inst.enrolments.filter((row) => row.student_id === student.id).map((row) => row.course_id));

  const courses = courseIds.map((courseId) => {
    const course = inst.indexes.courseById.get(courseId);
    const professor = course ? inst.indexes.professorById.get(course.professor_id) : null;
    const grades = inst.records
      .filter((row) => row.student_id === student.id && row.course_id === courseId)
      .map((row) => row.grade);
    const presence = inst.attendance
      .filter((row) => row.student_id === student.id && row.course_id === courseId)
      .map((row) => (attended(row.status) ? 100 : 0));
    return {
      id: courseId,
      code: course ? course.code : '—',
      title: course ? course.title : 'Course no longer in the catalogue',
      professor: professor ? professor.full_name : '—',
      credits: course ? course.credits : null,
      avgGrade: round(mean(grades)),
      assessments: grades.length,
      attendanceRate: round(mean(presence)),
    };
  }).sort((a, b) => String(a.code).localeCompare(String(b.code)));

  const recent = inst.records
    .filter((row) => row.student_id === student.id)
    .sort((a, b) => String(b.recorded_date || '').localeCompare(String(a.recorded_date || '')))
    .slice(0, 8)
    .map((row) => {
      const course = inst.indexes.courseById.get(row.course_id);
      return {
        id: row.id,
        course: course ? course.code : '—',
        grade: row.grade,
        assessment: row.assessment_type || 'assessment',
        term: normaliseTerm(row.term).label || '—',
        date: row.recorded_date || null,
      };
    });

  return { student: studentRow(inst, student), metrics, courses, recent };
}

export function professorRowsView(inst, filters) {
  const criteria = filters || {};
  const query = String(criteria.q || '').trim().toLowerCase();
  const rows = inst.professors
    .map((professor) => {
      const metrics = inst.professorMetrics.get(professor.id) || {};
      const faculty = inst.indexes.facultyById.get(professor.faculty_id);
      const department = inst.indexes.departmentById.get(professor.department_id);
      return {
        id: professor.id,
        full_name: professor.full_name,
        title: professor.title || '—',
        email: professor.email || '—',
        faculty_id: professor.faculty_id || '',
        faculty: faculty ? faculty.name : '—',
        faculty_code: faculty ? faculty.code : '',
        department: department ? department.name : '—',
        employment_status: professor.employment_status || '—',
        weekly_hours: professor.weekly_hours || null,
        hire_date: professor.hire_date || null,
        courses: metrics.courses || 0,
        students: metrics.students || 0,
        avgGrade: metrics.avgGrade === undefined ? null : metrics.avgGrade,
        attendanceRate: metrics.attendanceRate === undefined ? null : metrics.attendanceRate,
      };
    })
    .filter((row) => {
      if (criteria.faculty_id && row.faculty_id !== criteria.faculty_id) return false;
      if (criteria.employment && row.employment_status !== criteria.employment) return false;
      if (query && !matches([row.full_name, row.email, row.department, row.title], query)) return false;
      return true;
    })
    .sort((a, b) => String(a.full_name || '').localeCompare(String(b.full_name || '')));

  const facets = {
    faculties: inst.faculties
      .map((faculty) => ({ id: faculty.id, name: faculty.name, code: faculty.code }))
      .sort((a, b) => String(a.name).localeCompare(String(b.name))),
    employment: unique(inst.professors.map((row) => row.employment_status)).sort(),
  };
  return { rows, total: rows.length, facets };
}

export function courseRowsView(inst, filters) {
  const criteria = filters || {};
  const query = String(criteria.q || '').trim().toLowerCase();
  const rows = inst.courses
    .map((course) => {
      const metrics = inst.courseMetrics.get(course.id) || {};
      const faculty = inst.indexes.facultyById.get(course.faculty_id);
      const department = inst.indexes.departmentById.get(course.department_id);
      const professor = inst.indexes.professorById.get(course.professor_id);
      return {
        id: course.id,
        code: course.code || '—',
        title: course.title,
        faculty_id: course.faculty_id || '',
        faculty: faculty ? faculty.name : '—',
        faculty_code: faculty ? faculty.code : '',
        department: department ? department.name : '—',
        professor: professor ? professor.full_name : 'Unassigned',
        credits: course.credits || null,
        semester: course.semester || '—',
        level: course.level || '—',
        status: course.status || 'draft',
        enrolled: metrics.enrolled || 0,
        graded: metrics.graded || 0,
        avgGrade: metrics.avgGrade === undefined ? null : metrics.avgGrade,
        attendanceRate: metrics.attendanceRate === undefined ? null : metrics.attendanceRate,
        passRate: metrics.passRate === undefined ? null : metrics.passRate,
      };
    })
    .filter((row) => {
      if (criteria.faculty_id && row.faculty_id !== criteria.faculty_id) return false;
      if (criteria.department_id && row.department !== criteria.department_id) return false;
      if (criteria.level && row.level !== criteria.level) return false;
      if (criteria.status && row.status !== criteria.status) return false;
      if (query && !matches([row.code, row.title, row.professor, row.faculty], query)) return false;
      return true;
    })
    .sort((a, b) => String(a.code).localeCompare(String(b.code)));

  const facets = {
    faculties: inst.faculties
      .map((faculty) => ({ id: faculty.id, name: faculty.name, code: faculty.code }))
      .sort((a, b) => String(a.name).localeCompare(String(b.name))),
    levels: unique(inst.courses.map((row) => row.level)).sort(),
    statuses: unique(inst.courses.map((row) => row.status)).sort(),
  };
  return { rows, total: rows.length, facets };
}

export function performanceView(inst) {
  const graded = inst.records.filter((row) => typeof row.grade === 'number');

  const byFaculty = facultyRowsView(inst).map((faculty) => ({
    name: faculty.name,
    code: faculty.code,
    students: faculty.students,
    avgGrade: faculty.avgGrade,
    attendanceRate: faculty.attendanceRate,
    passRate: (() => {
      const records = inst.records.filter((row) => row.faculty_id === faculty.id);
      const passed = records.filter((row) => row.grade >= PASS_MARK).length;
      return records.length ? round((passed / records.length) * 100) : null;
    })(),
  }));

  const bands = [
    { label: '90–100', min: 90, max: 101 },
    { label: '80–89', min: 80, max: 90 },
    { label: '70–79', min: 70, max: 80 },
    { label: '60–69', min: 60, max: 70 },
    { label: 'Below 60', min: 0, max: 60 },
  ];
  const distribution = bands.map((band) => ({
    label: band.label,
    count: graded.filter((row) => row.grade >= band.min && row.grade < band.max).length,
    tone: band.max <= 60 ? 'critical' : band.min >= 80 ? 'positive' : 'warning',
  }));

  const termMap = new Map();
  inst.records.forEach((row) => {
    const term = normaliseTerm(row.term);
    if (!term.key) return;
    const bucket = termMap.get(term.key) || { label: term.label, order: term.order, grades: [] };
    bucket.grades.push(row.grade);
    termMap.set(term.key, bucket);
  });
  const terms = [...termMap.values()]
    .sort((a, b) => a.order - b.order)
    .map((bucket) => ({ label: bucket.label, avgGrade: round(mean(bucket.grades)), assessed: bucket.grades.length }));

  const courseRows = courseRowsView(inst, {}).rows.filter((row) => row.graded >= 5 && row.avgGrade !== null);
  const strongest = [...courseRows].sort((a, b) => b.avgGrade - a.avgGrade).slice(0, 5);
  const weakest = [...courseRows].sort((a, b) => a.avgGrade - b.avgGrade).slice(0, 5);
  const levels = unique(inst.courses.map((row) => row.level)).sort();

  return {
    overall: {
      avgGrade: round(mean(graded.map((row) => row.grade))),
      passRate: graded.length ? round((graded.filter((row) => row.grade >= PASS_MARK).length / graded.length) * 100) : null,
      assessed: graded.length,
      students: inst.students.length,
      courses: inst.courses.length,
    },
    byFaculty,
    distribution,
    terms,
    strongest,
    weakest,
    levelSplit: levels.map((level) => {
      const ids = new Set(inst.courses.filter((row) => row.level === level).map((row) => row.id));
      const records = inst.records.filter((row) => ids.has(row.course_id));
      return {
        level,
        courses: ids.size,
        avgGrade: gradeAverage(records),
        passRate: records.length ? round((records.filter((row) => row.grade >= PASS_MARK).length / records.length) * 100) : null,
      };
    }),
  };
}

export function attendanceView(inst) {
  const total = inst.attendance.length;
  const present = inst.attendance.filter((row) => attended(row.status)).length;

  const statuses = ['present', 'late', 'excused', 'absent'];
  const statusMix = statuses.map((status) => {
    const count = inst.attendance.filter((row) => row.status === status).length;
    return { status, count, share: total ? round((count / total) * 100) : 0 };
  });

  const weekMap = new Map();
  inst.attendance.forEach((row) => {
    const date = new Date(row.session_date);
    if (Number.isNaN(date.getTime())) return;
    const monday = new Date(date);
    monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
    const key = monday.toISOString().slice(0, 10);
    const bucket = weekMap.get(key) || { week: key, total: 0, present: 0 };
    bucket.total += 1;
    if (attended(row.status)) bucket.present += 1;
    weekMap.set(key, bucket);
  });
  const weeks = [...weekMap.values()]
    .sort((a, b) => a.week.localeCompare(b.week))
    .slice(-10)
    .map((bucket) => ({
      week: bucket.week,
      rate: bucket.total ? round((bucket.present / bucket.total) * 100) : 0,
      sessions: bucket.total,
    }));

  const belowFloor = inst.students
    .map((student) => {
      const metrics = inst.studentMetrics.get(student.id) || {};
      const row = studentRow(inst, student);
      return {
        id: student.id,
        full_name: row.full_name,
        student_id: row.student_id,
        group_name: row.group_name,
        faculty: row.faculty,
        programme: row.programme,
        attendanceRate: metrics.attendanceRate === undefined ? null : metrics.attendanceRate,
        sessions: metrics.attendanceSessions || 0,
        avgGrade: metrics.avgGrade === undefined ? null : metrics.avgGrade,
      };
    })
    .filter((row) => row.sessions >= 3 && row.attendanceRate !== null && row.attendanceRate < ATTENDANCE_FLOOR)
    .sort((a, b) => a.attendanceRate - b.attendanceRate);

  return {
    overall: {
      rate: total ? round((present / total) * 100) : null,
      records: total,
      studentsTracked: inst.students.length,
      belowFloor: belowFloor.length,
      floor: ATTENDANCE_FLOOR,
    },
    byFaculty: facultyRowsView(inst).map((faculty) => ({
      name: faculty.name,
      code: faculty.code,
      rate: faculty.attendanceRate,
      students: faculty.students,
    })),
    byDepartment: departmentRowsView(inst)
      .filter((department) => department.students > 0)
      .map((department) => ({
        name: department.name,
        faculty: department.faculty_code || department.faculty,
        rate: department.attendanceRate,
        students: department.students,
      })),
    statusMix,
    weeks,
    belowFloor: belowFloor.slice(0, 40),
  };
}

export function riskView(inst) {
  const rows = inst.students
    .map((student) => {
      const row = studentRow(inst, student);
      return { ...row, labels: row.riskFlags.map((flag) => FLAG_LABELS[flag] || flag) };
    })
    .filter((row) => row.riskLevel !== 'low')
    .sort((a, b) => {
      if (a.riskLevel !== b.riskLevel) return a.riskLevel === 'high' ? -1 : 1;
      return (a.avgGrade === null ? 999 : a.avgGrade) - (b.avgGrade === null ? 999 : b.avgGrade);
    });

  const counts = {
    high: rows.filter((row) => row.riskLevel === 'high').length,
    medium: rows.filter((row) => row.riskLevel === 'medium').length,
    low: inst.students.length - rows.length,
    monitoring: inst.students.filter((row) => row.intervention_status === 'monitoring').length,
    total: inst.students.length,
  };

  const byFaculty = inst.faculties.map((faculty) => {
    const scoped = rows.filter((row) => row.faculty_id === faculty.id);
    const population = inst.students.filter((row) => row.faculty_id === faculty.id).length;
    return {
      id: faculty.id,
      name: faculty.name,
      code: faculty.code,
      high: scoped.filter((row) => row.riskLevel === 'high').length,
      medium: scoped.filter((row) => row.riskLevel === 'medium').length,
      population,
      share: population ? round((scoped.length / population) * 100) : 0,
    };
  }).sort((a, b) => b.high - a.high);

  const byReason = Object.keys(FLAG_LABELS).map((flag) => ({
    flag,
    label: FLAG_LABELS[flag],
    count: rows.filter((row) => row.riskFlags.includes(flag)).length,
  }));

  return { counts, byFaculty, byReason, rows };
}

export function reportView(inst) {
  return {
    generatedAt: new Date().toISOString(),
    passMark: PASS_MARK,
    attendanceFloor: ATTENDANCE_FLOOR,
    datasets: {
      faculties: facultyRowsView(inst),
      programmes: programmeRowsView(inst),
      departments: departmentRowsView(inst),
      courses: courseRowsView(inst, {}).rows,
      risk: riskView(inst).rows,
      attendance: attendanceView(inst).byFaculty,
    },
  };
}