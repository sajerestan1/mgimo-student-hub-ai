import { base44 } from '@/api/base44Client';

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    answer: { type: 'string', description: 'Concise analytical answer in 2-4 short paragraphs.' },
    findings: { type: 'array', items: { type: 'string' }, description: 'Key findings, each one sentence.' },
    actions: { type: 'array', items: { type: 'string' }, description: 'Recommended follow-up actions for the Dean.' },
    visualization: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['bar', 'line', 'pie', 'none'] },
        title: { type: 'string' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: { label: { type: 'string' }, value: { type: 'number' } },
            required: ['label', 'value'],
          },
        },
      },
      required: ['type', 'title', 'data'],
    },
    table: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        columns: { type: 'array', items: { type: 'string' } },
        rows: { type: 'array', items: { type: 'array', items: { type: 'string' } } },
      },
      required: ['title', 'columns', 'rows'],
    },
    limitations: { type: 'string', description: 'Data limitations or gaps that affect the answer.' },
  },
  required: ['answer'],
};

const round = (value) => (value === null || value === undefined ? null : Number(value.toFixed(2)));

export function buildDatasetSummary(data, analytics) {
  const { kpis, facultyRows, departmentRows, riskCounts, riskByFaculty, attendanceTrend, requestsByStatus, requestsByCategory, upcomingEvents, professorRows, examStats, thresholds, studentInsights } = analytics;
  const risky = studentInsights
    .filter((insight) => insight.level !== 'none')
    .sort((a, b) => (a.level === 'high' ? -1 : 1))
    .slice(0, 24)
    .map((insight) => ({
      student: insight.student.full_name,
      id: insight.student.student_id,
      faculty: insight.facultyName,
      year: insight.student.year,
      risk: insight.level,
      gpa: round(insight.gpa),
      absence_pct: round(insight.absenceRate),
      evidence: insight.evidence,
    }));

  return {
    term: analytics.currentTermLabel,
    records: {
      students: kpis.totalStudents,
      professors: kpis.totalStaff,
      faculties: kpis.facultyCount,
      departments: kpis.departmentCount,
      academic_records: data.academicRecords.length,
      attendance_records: data.attendanceRecords.length,
      requests: data.requests.length,
    },
    kpis,
    thresholds,
    faculties: facultyRows.map((faculty) => ({
      code: faculty.code,
      name: faculty.name,
      students: faculty.studentCount,
      staff: faculty.staffCount,
      avg_gpa: round(faculty.avgGpa),
      attendance_pct: round(faculty.attendanceRate),
      pass_pct: round(faculty.passRate),
      at_risk: faculty.riskCount,
      pending_requests: data.requests.filter((request) => request.faculty_id === faculty.id && ['submitted', 'under_review', 'awaiting_information'].includes(request.status)).length,
    })),
    departments: departmentRows.map((dept) => ({
      name: dept.name,
      faculty: dept.facultyName,
      students: dept.studentCount,
      avg_gpa: round(dept.avgGpa),
      attendance_pct: round(dept.attendanceRate),
      pass_pct: round(dept.passRate),
      at_risk: dept.riskCount,
    })),
    risk: { counts: riskCounts, by_faculty: riskByFaculty, students: risky },
    attendance_trend: attendanceTrend,
    requests: {
      by_status: requestsByStatus,
      by_category: requestsByCategory,
      pending: analytics.pendingRequests.slice(0, 14).map((request) => ({
        subject: request.subject,
        category: request.category,
        status: request.status,
        priority: request.priority,
        submitted: request.submitted_date,
        due: request.due_date,
        assigned_to: request.assigned_to,
      })),
    },
    calendar: upcomingEvents.map((event) => ({ title: event.title, type: event.type, start: event.start_date, faculty: event.facultyName })),
    teaching: professorRows.slice(0, 18).map((professor) => ({
      name: professor.full_name,
      title: professor.title,
      faculty: professor.facultyName,
      department: professor.departmentName,
      courses: professor.courseCount,
      credits: professor.credits,
      weekly_hours: professor.weekly_hours,
    })),
    exam_stats: examStats,
    data_notes: 'All values are computed from the demonstration database records of this application. No institutional data is present.',
  };
}

function normalize(result) {
  const parsed = typeof result === 'string' ? { answer: result } : result || {};
  const visualization = parsed.visualization || {};
  const table = parsed.table || {};
  return {
    answer: parsed.answer || 'No answer was generated.',
    findings: Array.isArray(parsed.findings) ? parsed.findings.filter(Boolean) : [],
    actions: Array.isArray(parsed.actions) ? parsed.actions.filter(Boolean) : [],
    visualization:
      ['bar', 'line', 'pie'].includes(visualization.type) && Array.isArray(visualization.data) && visualization.data.length
        ? { ...visualization, data: visualization.data.filter((row) => row && row.label).slice(0, 12) }
        : null,
    table:
      Array.isArray(table.columns) && table.columns.length && Array.isArray(table.rows) && table.rows.length
        ? { ...table, rows: table.rows.slice(0, 14) }
        : null,
    limitations: parsed.limitations || '',
  };
}

export async function askDeanAssistant({ question, data, analytics, history = [] }) {
  const summary = buildDatasetSummary(data, analytics);
  const historyText = history
    .slice(-6)
    .map((message) => `${message.role === 'user' ? 'Dean' : 'Assistant'}: ${message.content}`)
    .join('\n');

  const prompt = `You are the AI Dean's Assistant of the Digital Dean Dean's Office, an administrative decision-support system for university leadership. Digital Dean is a fictional institution; the platform is called Academic Intelligence. Never name or imply any real-world institution.

RULES
- Answer ONLY from the DATASET below. Never invent students, professors, faculties, statistics or events.
- If the dataset does not contain the answer, say so explicitly and name the data limitation.
- All figures are derived from demonstration records. Never claim an administrative action was performed.
- Risk classifications are decision-support indicators requiring human review; never label a student as failing.
- Be concise and executive: numbers first, then interpretation.
- Choose ONE visualization when the question benefits from it: "bar" for comparisons, "line" for trends over time, "pie" for distributions. Otherwise "none" with an empty data array.
- Include a table only when a ranked or detailed list helps.
- Provide 2-4 findings and 1-3 recommended actions.

DATASET (JSON):
${JSON.stringify(summary)}

RECENT CONVERSATION:
${historyText || 'None'}

DEAN'S QUESTION: ${question}`;

  const result = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: RESPONSE_SCHEMA });
  return normalize(result);
}

export async function generateDeanBriefing({ data, analytics }) {
  const summary = buildDatasetSummary(data, analytics);
  const prompt = `You are the AI Dean's Assistant producing a short executive briefing for the Dean of a university.

Use ONLY the DATASET. Do not invent facts, students or statistics. Do not state that any action has already been taken.
Write 3-5 briefing findings (one sentence each, numbers where useful) covering academic performance, attendance, faculty differences, administrative workload and students requiring review, then 2-4 recommended actions.

DATASET (JSON):
${JSON.stringify(summary)}`;

  const result = await base44.integrations.Core.InvokeLLM({ prompt, response_json_schema: RESPONSE_SCHEMA });
  return normalize(result);
}