import { base44 } from '@/api/base44Client';
import {
  ASSESSMENTS,
  ASSIGNMENTS,
  COURSES,
  GRADES,
  LIBRARY_CATALOG,
  MENTORS,
  STUDENT,
  SUMMARY,
  courseAttendance,
  courseAverage,
  daysUntil,
  formatDate,
  letterFor,
} from '@/lib/studentWorkspace';

export const COURSE_CODES = COURSES.map((course) => course.code);

const RECOMMENDATION_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    recommendations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          course_code: { type: 'string' },
          kind: { type: 'string', enum: ['material', 'remedial_task', 'practice', 'support'] },
          title: { type: 'string' },
          why: { type: 'string' },
          action: { type: 'string' },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] },
          material_id: { type: 'string' },
          material_title: { type: 'string' },
        },
        required: ['course_code', 'kind', 'title', 'why', 'action', 'priority'],
      },
    },
  },
  required: ['summary', 'recommendations'],
};

export async function loadPublishedMaterials() {
  const page = await base44.entities.CourseMaterial.filter(
    { published: true, course_code: { $in: COURSE_CODES } },
    { sort: '-uploaded_at', limit: 40 }
  );
  return page.items || [];
}

export async function loadRecommendations(userId) {
  if (!userId) return [];
  const page = await base44.entities.StudyRecommendation.filter(
    { student_user_id: userId },
    { sort: '-generated_at', limit: 40 }
  );
  return page.items || [];
}

function performanceBrief(materials) {
  const courseLines = COURSES.map((course) => {
    const average = courseAverage(course.id);
    const marks = GRADES.filter((grade) => grade.courseId === course.id)
      .map((grade) => `${grade.title} ${grade.score}/100`)
      .join('; ');
    const open = ASSIGNMENTS.filter((item) => item.courseId === course.id && item.status !== 'graded')
      .map((item) => `${item.title} due in ${daysUntil(item.dueDate)} days (${item.weight})`)
      .join('; ');
    const exams = ASSESSMENTS.filter((item) => item.courseId === course.id)
      .map((item) => `${item.title} on ${formatDate(item.date)}, preparation ${item.preparation}%`)
      .join('; ');
    return `- ${course.code} ${course.title}: average ${average.toFixed(1)}/100 (${letterFor(
      average
    )}), attendance ${courseAttendance(course.id)}%. Marks: ${marks || 'none recorded'}. Open work: ${
      open || 'none'
    }. Upcoming assessments: ${exams || 'none'}.`;
  });

  const materialLines = materials.length
    ? materials
        .map(
          (material) =>
            `- material_id ${material.id} | ${material.course_code} | "${material.title}" (${material.type.replace(
              '_',
              ' '
            )}, topic: ${material.topic || 'general'})`
        )
        .join('\n')
    : '- no course files have been published for these courses';

  const libraryLines = LIBRARY_CATALOG.map(
    (book) => `- "${book.title}" by ${book.author} (${book.availability})`
  ).join('\n');

  const mentorLines = MENTORS.map(
    (mentor) => `- ${mentor.name} (${mentor.programme}) helps with: ${mentor.topics.join(', ')}`
  ).join('\n');

  return [
    `Student: ${STUDENT.fullName}, ${STUDENT.programme}, year ${STUDENT.year}, group ${STUDENT.group}, ${STUDENT.semester}.`,
    `Weighted average ${SUMMARY.averageMark.toFixed(1)}/100 (${SUMMARY.averageLetter}), attendance ${SUMMARY.attendanceRate}%.`,
    '',
    'COURSES AND PERFORMANCE',
    courseLines.join('\n'),
    '',
    'PUBLISHED COURSE MATERIALS THE STUDENT CAN OPEN',
    materialLines,
    '',
    'LIBRARY CATALOGUE',
    libraryLines,
    '',
    'PEER MENTORS AVAILABLE',
    mentorLines,
  ].join('\n');
}

export async function generateStudyPlan(materials) {
  return base44.integrations.Core.InvokeLLM({
    prompt: [
      'You are the academic adviser inside a university student portal, writing a short remedial study plan.',
      'Use only the record below. Never invent courses, grades, materials, dates, people or policies.',
      'Choose 3 to 5 recommendations, at most two per course, and start with the weakest course by average.',
      'Prefer a specific published material when one fits: return its material_id and material_title exactly as given.',
      'If no material fits, choose kind "remedial_task" (redo or extend a specific piece of work), "practice" (a concrete exercise) or "support" (a named peer mentor, writing centre or lecturer consultation).',
      'Quote the real score or attendance figure that justifies each recommendation in "why" (one sentence, max 30 words).',
      'Write "action" as one specific instruction the student can start today (max 25 words).',
      '',
      'STUDENT RECORD',
      performanceBrief(materials),
    ].join('\n'),
    response_json_schema: RECOMMENDATION_SCHEMA,
  });
}

const courseFor = (code) => COURSES.find((course) => course.code === code);

/**
 * Replaces the untouched suggestions with the freshly generated plan, while
 * keeping anything the student already started or finished.
 */
export async function savePlan({ userId, studentName, recommendations, materials }) {
  await base44.entities.StudyRecommendation.deleteMany({ student_user_id: userId, status: 'suggested' });

  const materialIds = new Set(materials.map((material) => material.id));
  const generatedAt = new Date().toISOString();

  const records = (recommendations || [])
    .filter((item) => courseFor(item.course_code))
    .slice(0, 6)
    .map((item) => {
      const course = courseFor(item.course_code);
      const materialLink = item.material_id && materialIds.has(item.material_id);
      return {
        student_user_id: userId,
        student_name: studentName,
        course_code: course.code,
        course_title: course.title,
        kind: ['material', 'remedial_task', 'practice', 'support'].includes(item.kind) ? item.kind : 'remedial_task',
        title: item.title,
        why: item.why,
        action: item.action,
        priority: ['high', 'medium', 'low'].includes(item.priority) ? item.priority : 'medium',
        material_id: materialLink ? item.material_id : '',
        material_title: materialLink ? item.material_title || '' : '',
        status: 'suggested',
        source_average: Math.round(courseAverage(course.id) * 10) / 10,
        generated_at: generatedAt,
        is_demo: true,
      };
    });

  if (!records.length) return [];
  return base44.entities.StudyRecommendation.bulkCreate(records);
}