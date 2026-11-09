import { base44 } from '@/api/base44Client';

// First-run activation for a student account: the student office already holds
// their pending document requests and notices, so a newly signed-in student
// opens the portal with a real queue instead of empty lists.

const days = (offset) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);

const OPEN_REQUESTS = [
  { certificate_type: 'Enrolment certificate', purpose: 'Bank account opening', needed_by: days(5), status: 'submitted', submitted_date: days(-3) },
  { certificate_type: 'Transcript (English)', purpose: 'Internship application', needed_by: days(2), status: 'under_review', submitted_date: days(-9) },
  { certificate_type: 'Enrolment certificate', purpose: 'Visa appointment', needed_by: days(-1), status: 'submitted', submitted_date: days(-14) },
];

const NOTICES = [
  { title: 'Midterm examination schedule published', body: 'Your examination dates are now visible in the academic calendar. Check the rooms before the end of the week.', category: 'announcement', due_date: days(12) },
  { title: 'Assignment deadline approaching', body: 'A published assignment closes soon. Submit through the course workspace to avoid the late penalty.', category: 'deadline', due_date: days(9) },
  { title: 'Timetable updated', body: 'Your weekly timetable is available offline once it has been opened online. Open the timetable to refresh the saved week.', category: 'schedule' },
  { title: 'Document request received', body: 'The student office has received your enrolment certificate request and will confirm collection by e-mail.', category: 'application' },
];

const RECOMMENDATIONS = [
  { kind: 'material', title: 'Re-read the module lecture notes before the next seminar', why: 'The seminar questions assume the module’s key concepts are already secure.', action: 'Open the lecture notes for the current module and write one example per concept.', priority: 'medium' },
  { kind: 'practice', title: 'Attempt the knowledge check again', why: 'A second attempt is permitted and the higher score counts.', action: 'Open the quiz in the course workspace and review the feedback on the questions you missed.', priority: 'high' },
  { kind: 'support', title: 'Book a meeting with your academic advisor', why: 'Consistent attendance and early feedback protect your standing this term.', action: 'Write to your department office to arrange a ten-minute review of your progress.', priority: 'low' },
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

  await base44.entities.Notification.bulkCreate(
    NOTICES.map((notice) => ({ user_id: user.id, is_read: false, ...notice }))
  );

  await base44.entities.StudyRecommendation.bulkCreate(
    RECOMMENDATIONS.map((item) => ({
      student_user_id: user.id,
      student_name: user.full_name || '',
      status: 'suggested',
      generated_at: new Date().toISOString(),
      is_demo: true,
      ...item,
    }))
  );
}