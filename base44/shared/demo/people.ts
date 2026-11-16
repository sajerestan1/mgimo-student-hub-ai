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
  { name: 'IR-1A', faculty: 'IR', programme: 'International Relations', year: 1 },
  { name: 'IR-1B', faculty: 'IR', programme: 'Regional Studies', year: 1 },
  { name: 'IER-1A', faculty: 'IER', programme: 'International Economic Relations', year: 1 },
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

const STUDENT_NAMES = [
  'Stanley','Patience','Aleksandra Volkova','Dmitry Sokolov','Maria Kuznetsova','Ivan Morozov','Ekaterina Lebedeva','Nikita Novikov','Sofia Semenova','Artem Petrov','Anastasia Fedorova','Pavel Ivanov','Vera Orlova','Timur Kozlov','Polina Zaitseva','Mikhail Baranov','Daria Grigorieva','Kirill Belov','Alina Mironova','Roman Karpov','Yulia Solovyova','Egor Tikhomirov','Ksenia Yakovleva','Vladimir Gusev','Nina Vinogradova','Maxim Komarov','Lidia Rodionova','Anton Safonov','Galina Medvedeva','Ruslan Ershov',
];

export const DEMO_STUDENT = {
  index: 0,
  full_name: 'Stanley',
  email: 'stanley.demo@mgimo.example',
  student_id: 'DEMO-STU-001',
};

const AT_RISK_INDEXES = [4, 13, 21, 26];
const ACTIVE_INTERVENTION_INDEXES = [13, 26];

const slug = (value) => value.toLowerCase().replace(/[^a-z\\s-]/g, '').trim().replace(/\\s+/g, '.');

export function buildStudents() {
  return STUDENT_NAMES.map((fullName, index) => {
    const group = index === 0 ? GROUPS[0] : index === 1 ? GROUPS[2] : index < 10 ? GROUPS[0] : index < 18 ? GROUPS[1] : GROUPS[2];
    const programme = index === 0 ? 'International Relations' : index === 1 ? 'International Economic Relations' : group.programme;
    const department = programme === 'International Relations' ? 'IRFP' : programme === 'Regional Studies' ? 'RS' : programme === 'World Economy' ? 'WE' : 'IF';
    const demoAccount = index < 2;
    return {
      full_name: fullName,
      student_id: demoAccount ? `DEMO-STU-00${index + 1}` : `MG-2024-${1043 + index}`,
      email: demoAccount ? (index === 0 ? 'stanley.demo@mgimo.example' : 'patience.demo@mgimo.example') : `${slug(fullName)}@student.${DEMO_DOMAIN}`,
      programme, group: group.name, faculty: group.faculty, department, year: 1,
      at_risk: !demoAccount && AT_RISK_INDEXES.includes(index),
      intervention_status: !demoAccount && AT_RISK_INDEXES.includes(index) ? (ACTIVE_INTERVENTION_INDEXES.includes(index) ? 'active' : 'monitoring') : 'none',
      demo: true,
    };
  });
}
