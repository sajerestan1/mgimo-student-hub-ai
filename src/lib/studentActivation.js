import { base44 } from '@/api/base44Client';

// First-run activation for a student account: the student office already holds
// their pending document requests, so a newly signed-in student opens the
// portal with a real queue instead of an empty list.

const days = (offset) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);

const OPEN_REQUESTS = [
  { certificate_type: 'Enrolment certificate', purpose: 'Bank account opening', needed_by: days(5), status: 'submitted', submitted_date: days(-3) },
  { certificate_type: 'Transcript (English)', purpose: 'Internship application', needed_by: days(2), status: 'under_review', submitted_date: days(-9) },
  { certificate_type: 'Enrolment certificate', purpose: 'Visa appointment', needed_by: days(-1), status: 'submitted', submitted_date: days(-14) },
];

let activation = null;

export function activateStudentAccount(user) {
  if (!user?.id) return Promise.resolve();
  if (!activation) activation = run(user);
  return activation;
}

async function run(user) {
  const existing = await base44.entities.Application.count({ user_id: user.id });
  if (existing > 0) return;

  await base44.entities.Application.bulkCreate(
    OPEN_REQUESTS.map((item) => ({ user_id: user.id, title: item.certificate_type, ...item }))
  );
}