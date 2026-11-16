// Fictional demonstration population. Every name, e-mail address and identifier
// below is invented for the prototype. Nothing here refers to a real person or
// institution, and every row written from it is flagged is_demo = true.

export const DEMO_DOMAIN = 'digitaldean-demo.edu';

export const FACULTIES = [
  {
    key: 'IR',
    code: 'IR',
    name: 'School of International Relations',
    dean_name: 'Prof. Elena V. Sokolova',
    established: 1944,
    description: 'Diplomacy, regional studies and international security.',
  },
  {
    key: 'IER',
    code: 'IER',
    name: 'School of International Economic Relations',
    dean_name: 'Prof. Andrei N. Volkov',
    established: 1946,
    description: 'World economy, finance and foreign trade policy.',
  },
];

export const DEPARTMENTS = [
  { key: 'IRFP', faculty: 'IR', code: 'IR-D1', name: 'International Relations & Foreign Policy', head_name: 'Prof. Elena V. Sokolova' },
  { key: 'RS', faculty: 'IR', code: 'IR-D2', name: 'Regional Studies', head_name: 'Prof. Pavel D. Rybakov' },
  { key: 'WE', faculty: 'IER', code: 'IER-D1', name: 'World Economy', head_name: 'Prof. Andrei N. Volkov' },
  { key: 'IF', faculty: 'IER', code: 'IER-D2', name: 'International Finance', head_name: 'Prof. Olga P. Timofeeva' },
];

export const GROUPS = [
  { name: 'IR-21A', faculty: 'IR', programme: 'International Relations', year: 2 },
  { name: 'IR-21B', faculty: 'IR', programme: 'Regional Studies', year: 2 },
  { name: 'IE-22A', faculty: 'IER', programme: 'World Economy', year: 2 },
];

export const PROFESSORS = [
  {
    full_name: 'Prof. Elena V. Sokolova',
    title: 'Professor',
    faculty: 'IR',
    dept: 'IRFP',
    email: 'e.sokolova@staff.digitaldean-demo.edu',
    employment_status: 'full_time',
    weekly_hours: 18,
  },
  {
    full_name: 'Prof. Pavel D. Rybakov',
    title: 'Associate Professor',
    faculty: 'IR',
    dept: 'RS',
    email: 'p.rybakov@staff.digitaldean-demo.edu',
    employment_status: 'full_time',
    weekly_hours: 16,
  },
  {
    full_name: 'Prof. Irina A. Melnikova',
    title: 'Senior Lecturer',
    faculty: 'IR',
    dept: 'IRFP',
    email: 'i.melnikova@staff.digitaldean-demo.edu',
    employment_status: 'part_time',
    weekly_hours: 12,
  },
  {
    full_name: 'Prof. Andrei N. Volkov',
    title: 'Professor',
    faculty: 'IER',
    dept: 'WE',
    email: 'a.volkov@staff.digitaldean-demo.edu',
    employment_status: 'full_time',
    weekly_hours: 18,
  },
  {
    full_name: 'Prof. Olga P. Timofeeva',
    title: 'Associate Professor',
    faculty: 'IER',
    dept: 'IF',
    email: 'o.timofeeva@staff.digitaldean-demo.edu',
    employment_status: 'full_time',
    weekly_hours: 16,
  },
  {
    full_name: 'Prof. Sergey M. Antonov',
    title: 'Lecturer',
    faculty: 'IER',
    dept: 'WE',
    email: 's.antonov@staff.digitaldean-demo.edu',
    employment_status: 'visiting',
    weekly_hours: 10,
  },
];

const STUDENT_NAMES = ['Sajere Stanley', 'Patience'];

// The two student test accounts used in the competition walkthrough.
export const DEMO_STUDENT = {
  index: 0,
  full_name: 'Sajere Stanley',
  email: 'stanley.demo@mgimo.example',
  student_id: 'DEMO-STU-001',
};

const slug = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z\\s-]/g, '')
    .trim()
    .replace(/\\s+/g, '.');

export function buildStudents() {
  return STUDENT_NAMES.map((fullName, index) => {
    const group = index === 0 ? GROUPS[0] : GROUPS[2];
    const programme = index === 0 ? 'International Relations' : 'World Economy';
    const department = index === 0 ? 'IRFP' : 'WE';
    return {
      full_name: fullName,
      student_id: index === 0 ? 'DEMO-STU-001' : 'DEMO-STU-002',
      email: index === 0 ? 'stanley.demo@mgimo.example' : 'patience.demo@mgimo.example',
      programme,
      group: group.name,
      faculty: group.faculty,
      department,
      year: 1,
      at_risk: false,
      intervention_status: 'none',
      demo: true,
    };
  });
}

