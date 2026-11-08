import { base44 } from '@/api/base44Client';

/**
 * Study recommendations are generated from the student's own authorised
 * academic context (loaded server-side) and the materials published for those
 * courses. Nothing here reads a demonstration record.
 */

export const RECOMMENDATION_SCHEMA = {
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

export async function loadRecommendations(userId) {
  if (!userId) return [];
  const page = await base44.entities.StudyRecommendation.filter(
    { student_user_id: userId },
    { sort: '-generated_at', limit: 40 }
  );
  return page.items || [];
}

/** A plan needs at least one recorded result before it means anything. */
export const hasGradedWork = (context) => Boolean(context?.summary && context.summary.graded > 0);

function performanceBrief(context, materials) {
  const { profile, summary } = context;
  const courseLines = (context.courses || []).map((course) => {
    const marks = (course.gradedItems || [])
      .map((row) => `${row.title} ${row.score}/${row.max}`)
      .join('; ');
    const open = (context.assignments || [])
      .filter((row) => row.courseId === course.id && row.state !== 'graded')
      .map((row) => `${row.title} (${row.state}, due ${row.dueDate || 'no date'})`)
      .join('; ');
    return `- ${course.code} ${course.title}: result ${
      course.weighted === null ? 'not graded yet' : `${course.weighted.toFixed(1)}/100 (${course.letter})`
    }, attendance ${course.attendance.rate === null ? 'not recorded' : `${course.attendance.rate}%`}. Marks: ${
      marks || 'none recorded'
    }. Open work: ${open || 'none'}.`;
  });

  const materialLines = materials.length
    ? materials
        .map(
          (material) =>
            `- material_id ${material.id} | ${material.courseCode} | "${material.title}" (${String(
              material.type
            ).replace(/_/g, ' ')})`
        )
        .join('\n')
    : '- no course materials have been published for these courses';

  return [
    `Student: ${profile.full_name}, ${profile.program || 'programme not recorded'}, year ${
      profile.year || '—'
    }, group ${profile.group_name || '—'}, ${profile.faculty || 'faculty not recorded'}.`,
    `Weighted average ${summary.average === null ? 'not available' : `${summary.average.toFixed(1)}/100 (${summary.averageLetter})`}; attendance ${
      summary.attendanceRate === null ? 'not recorded' : `${summary.attendanceRate}%`
    }; ${summary.graded} assessments graded, ${summary.pending + summary.overdue} open items.`,
    '',
    'COURSES AND PERFORMANCE',
    courseLines.join('\n'),
    '',
    'PUBLISHED MATERIALS THE STUDENT CAN OPEN',
    materialLines,
  ].join('\n');
}

export async function generateStudyPlan(context, materials) {
  const codes = (context.courses || []).map((course) => course.code).join(', ');
  return base44.integrations.Core.InvokeLLM({
    prompt: [
      'You are the academic adviser inside a university student portal, writing a short remedial study plan.',
      'Use only the record below. Never invent courses, grades, materials, dates, people or policies.',
      `Choose 3 to 5 recommendations, at most two per course, and start with the weakest course by result. Allowed course_code values: ${codes}.`,
      'Prefer a specific published material when one fits: return its material_id and material_title exactly as given.',
      'If no material fits, choose kind "remedial_task" (redo or extend a specific piece of work), "practice" (a concrete exercise) or "support" (a named lecturer consultation).',
      'Quote the real score or attendance figure that justifies each recommendation in "why" (one sentence, max 30 words).',
      'Write "action" as one specific instruction the student can start today (max 25 words).',
      '',
      'STUDENT RECORD',
      performanceBrief(context, materials),
    ].join('\n'),
    response_json_schema: RECOMMENDATION_SCHEMA,
  });
}

/** Replaces untouched suggestions, keeping anything already started or done. */
export async function savePlan({ userId, studentName, recommendations, materials, courses }) {
  await base44.entities.StudyRecommendation.deleteMany({ student_user_id: userId, status: 'suggested' });

  const materialIds = new Set(materials.map((material) => material.id));
  const courseByCode = new Map(courses.map((course) => [course.code, course]));
  const generatedAt = new Date().toISOString();

  const records = (recommendations || [])
    .filter((item) => courseByCode.has(item.course_code))
    .slice(0, 6)
    .map((item) => {
      const course = courseByCode.get(item.course_code);
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
        status: 'suggested',
        material_id: materialLink ? item.material_id : '',
        material_title: materialLink ? item.material_title || '' : '',
        source_average: course.weighted === null ? undefined : course.weighted,
        generated_at: generatedAt,
        is_demo: false,
      };
    });

  if (records.length) await base44.entities.StudyRecommendation.bulkCreate(records);
}