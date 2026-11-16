// Competition demo identities only. Never use these accounts for real student records.
export const DEMO_USERS = [
  { id: 'demo-student-a', email: 'student.demo@mgimo.example', full_name: 'Alex Morgan', role: 'student', faculty: 'International Relations' },
  { id: 'demo-student-b', email: 'student.demo2@mgimo.example', full_name: 'Sofia Ivanova', role: 'student', faculty: 'International Economics' },
  { id: 'demo-professor', email: 'professor.demo@mgimo.example', full_name: 'Dr. Elena Petrova', role: 'professor' },
  { id: 'demo-admin', email: 'admin.demo@mgimo.example', full_name: 'Demo Administrator', role: 'admin' },
];

const STORAGE_KEY = 'academic_intelligence_demo_user';

export const getDemoUser = () => {
  try {
    const id = window.localStorage.getItem(STORAGE_KEY);
    return DEMO_USERS.find((user) => user.id === id) || null;
  } catch {
    return null;
  }
};

export const signInDemo = (userId) => {
  const user = DEMO_USERS.find((user) => user.id === userId);
  if (!user) throw new Error('Unknown demo account');
  window.localStorage.setItem(STORAGE_KEY, user.id);
  return user;
};

export const signOutDemo = () => window.localStorage.removeItem(STORAGE_KEY);
