// Descriptions for sections that are architected in Stage 1 and built in Stage 2.
export const ROADMAP = {
  '/courses': {
    title: 'Courses',
    summary: 'A unified course catalogue where students browse enrolments and professors manage the courses they teach.',
    bullets: [
      'Course catalogue with credits, prerequisites and learning outcomes',
      'Enrolment management for students and course coordinators',
      'Course workspaces linking materials, assignments and grades',
    ],
  },
  '/lms': {
    title: 'Learning platform',
    summary: 'The course player for lectures, readings, recordings and discussion, connected to the academic record.',
    bullets: [
      'Structured modules with readings, slides and recorded sessions',
      'Discussions and questions per course',
      'Progress tracking that feeds the student workspace',
    ],
  },
  '/assignments': {
    title: 'Assignments & grading',
    summary: 'Submission, review and grading in one flow, with a queue that shows what needs attention first.',
    bullets: [
      'Assignment creation with rubrics and deadlines',
      'Submission inbox and annotation for professors',
      'Grade release that updates the academic record automatically',
    ],
  },
  '/grades': {
    title: 'Grades',
    summary: 'A transparent grade book: per-course results, credit accumulation and progress toward the degree.',
    bullets: ['Per-course results with weighted components', 'Credit and GPA progression across terms', 'Appeal and correction workflow'],
  },
  '/attendance': {
    title: 'Attendance',
    summary: 'Session-level attendance capture with university-wide reporting and early-warning thresholds.',
    bullets: ['Session capture for professors in a few taps', 'Threshold alerts before a student loses eligibility', 'Faculty and department attendance reporting'],
  },
  '/schedule': {
    title: 'Schedule',
    summary: 'A personal timetable that resolves rooms, groups, professors and conflicts in one view.',
    bullets: ['Weekly and agenda views for every role', 'Room and group conflict detection', 'Exam and deadline overlay'],
  },
  '/announcements': {
    title: 'Announcements',
    summary: 'Targeted institutional communication to audiences from a single course group to the whole university.',
    bullets: ['Audience targeting by faculty, department, group or course', 'Scheduling and publishing workflow', 'Readership tracking'],
  },
  '/applications': {
    title: 'Applications & requests',
    summary: 'Student service requests — certificates, transcripts, leave — tracked from submission to decision.',
    bullets: ['Structured request types and required documents', 'Routing to the responsible office', 'Status history visible to the student'],
  },
  '/faculty': {
    title: 'Faculties',
    summary: 'Institutional structure, leadership and faculty-level academic performance.',
    bullets: ['Faculty profiles, leadership and departments', 'Performance and attendance comparison', 'Faculty-level staffing overview'],
  },
  '/departments': {
    title: 'Departments',
    summary: 'Department-level oversight: staffing, course load and academic outcomes.',
    bullets: ['Department composition and head assignments', 'Teaching load per department', 'Course outcomes by department'],
  },
  '/students': {
    title: 'Students',
    summary: 'The full student directory with academic standing, attendance and intervention history.',
    bullets: ['Searchable directory scoped to your authorisation', 'Individual academic record and history', 'Intervention tracking for academic support'],
  },
  '/professors': {
    title: 'Professors',
    summary: 'Academic staff directory with teaching load, courses and grading activity.',
    bullets: ['Staff profiles and assignments', 'Teaching load across the term', 'Grading and attendance submission status'],
  },
  '/analytics': {
    title: 'Academic analytics',
    summary: 'Institution-wide analytics: performance trends, attendance patterns and faculty comparison.',
    bullets: ['Term-over-term performance trends', 'Attendance and completion analysis', 'Exportable institutional reports'],
  },
  '/ai-assistant': {
    title: 'AI assistant',
    summary: 'The intelligence layer that answers questions across the academic database in natural language.',
    bullets: ['Conversational answers over authorised records', 'Explainable findings with supporting evidence', 'Suggested interventions for at-risk students'],
  },
};