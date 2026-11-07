import { WEEKDAY_NAMES } from '@/lib/academic';

/**
 * Builds the assistant prompt strictly from the student's own records.
 * Nothing is generated here: every personal fact comes from the loaded entities.
 */
export function buildAssistantPrompt({ profile, courses, schedule, grades, applications, notifications }, question, history) {
  const gradeList = grades || [];
  const average = gradeList.length
    ? gradeList.reduce((sum, grade) => sum + (Number(grade.grade_points) || 0), 0) / gradeList.length
    : null;

  const weeklySchedule = WEEKDAY_NAMES.map((name, index) => ({
    day: name,
    classes: (schedule || [])
      .filter((entry) => Number(entry.weekday) === index + 1)
      .sort((a, b) => String(a.start_time).localeCompare(String(b.start_time)))
      .map((entry) => ({
        time: `${entry.start_time}–${entry.end_time}`,
        course: entry.title,
        type: entry.type,
        instructor: entry.instructor,
        room: entry.room,
      })),
  })).filter((day) => day.classes.length > 0);

  const studentData = {
    profile: profile
      ? {
          full_name: profile.full_name,
          student_id: profile.student_id,
          program: profile.program,
          faculty: profile.faculty,
          year: profile.year,
          university: profile.university,
          advisor: profile.advisor,
        }
      : null,
    courses: (courses || []).map((course) => ({
      code: course.code,
      title: course.title,
      instructor: course.instructor,
      credits: course.credits,
      semester: course.semester,
    })),
    weeklySchedule,
    grades: gradeList.map((grade) => ({
      course: grade.title,
      code: grade.course_code,
      credits: grade.credits,
      grade: grade.grade,
      grade_points: grade.grade_points,
      assessment: grade.type,
      date: grade.date,
      semester: grade.semester,
    })),
    academicAverage: average ? Number(average.toFixed(2)) : null,
    applications: (applications || []).map((application) => ({
      type: application.certificate_type,
      status: application.status,
      purpose: application.purpose,
      needed_by: application.needed_by || null,
      submitted_date: application.submitted_date || null,
      history: (application.history || []).map(
        (step) => `${step.status} on ${step.date}${step.note ? ` — ${step.note}` : ''}`
      ),
    })),
    notifications: (notifications || []).map((notification) => ({
      title: notification.title,
      category: notification.category,
      body: notification.body,
      read: Boolean(notification.is_read),
      due_date: notification.due_date || null,
      received: notification.created_date,
    })),
  };

  const now = new Date();
  const todayLabel = `${WEEKDAY_NAMES[(now.getDay() + 6) % 7]}, ${now.toISOString().slice(0, 10)}`;
  const recent = (history || [])
    .slice(-8)
    .map((entry) => `${entry.role === 'assistant' ? 'Assistant' : 'Student'}: ${entry.content}`)
    .join('\n');

  return `You are the AI Student Assistant inside "MGIMO Student Hub AI" — an independent competition prototype of a digital dean's office. It is not an official MGIMO University service.

Today is ${todayLabel}.

Here is the ONLY information you have about this student, read live from their account:
${JSON.stringify(studentData, null, 2)}

${recent ? `Recent conversation:\n${recent}\n` : ''}

Rules you must follow:
1. Use only the data above for anything personal (grades, average, schedule, applications, notifications). Never invent a grade, an average, a deadline, a room, an application status or a notification.
2. If a requested personal data point is missing from the data, say clearly that it is not available in their account yet and suggest where in the app to look or whom to contact.
3. You may explain general dean's office procedures (how a certificate request works, what each application status means), but mark it as general guidance rather than their personal record.
4. Answer in the language the student used. Be warm, concise (under 180 words), and use short markdown lists when it helps.

Student's question: ${question}`;
}

export const SUGGESTED_PROMPTS = [
  'What are my classes today?',
  'What is my academic average?',
  'Summarise my unread notifications',
  'How do I request an enrollment certificate?',
  'What does “under review” mean for my application?',
];