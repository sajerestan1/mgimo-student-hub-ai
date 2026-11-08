// Idempotent LMS content seeder. Reads the authored course files and writes a
// fully interconnected teaching graph: courses, modules, resources, assignments,
// quizzes, questions, discussions, enrolments, submissions and attempts.
const fs = require('fs');

const FACULTY = {
  IR: '6aef538266ed33a330b25d04',
  IER: '6aef538266ed33a330b25d05',
  LAW: '6aef538266ed33a330b25d06',
  JRN: '6aef538266ed33a330b25d07',
  IBG: '6aef538266ed33a330b25d08',
  GP: '6aef538266ed33a330b25d09',
};

const DEPT = {
  '88': '6aef538275dbc770eab88088',
  '89': '6aef538275dbc770eab88089',
  '8a': '6aef538275dbc770eab8808a',
  '8b': '6aef538275dbc770eab8808b',
  '8c': '6aef538275dbc770eab8808c',
  '8d': '6aef538275dbc770eab8808d',
  '8e': '6aef538275dbc770eab8808e',
  '8f': '6aef538275dbc770eab8808f',
  '90': '6aef538275dbc770eab88090',
  '91': '6aef538275dbc770eab88091',
  '92': '6aef538275dbc770eab88092',
  '93': '6aef538275dbc770eab88093',
  '94': '6aef538275dbc770eab88094',
  '95': '6aef538275dbc770eab88095',
  '96': '6aef538275dbc770eab88096',
  '97': '6aef538275dbc770eab88097',
  '98': '6aef538275dbc770eab88098',
  '99': '6aef538275dbc770eab88099',
};

const PROFS = {
  IR: [
    '6aef53824414bb29675df6c0',
    '6aef53824414bb29675df6c1',
    '6aef53824414bb29675df6c2',
    '6aef53824414bb29675df6c3',
    '6aef53824414bb29675df6c4',
  ],
  IER: ['6aefbfb3eefff527733bab47'],
  LAW: [
    '6aef53824414bb29675df6ca',
    '6aef53824414bb29675df6cb',
    '6aef53824414bb29675df6cc',
  ],
  GP: [
    '6aef53824414bb29675df6d9',
    '6aef53824414bb29675df6da',
    '6aef53824414bb29675df6db',
    '6aef53824414bb29675df6dc',
    '6aef53824414bb29675df6dd',
  ],
};

const ALEX_USER = '6aefb51f193cdd7701dd467c';
const ALEX_STUDENT = '6aefb3a43e9dabbe38f50ee4';

const TERM = 'Fall Semester 2026';

const chunk = (rows, size = 120) => {
  const out = [];
  for (let i = 0; i < rows.length; i += size) out.push(rows.slice(i, i + size));
  return out;
};

const bullets = (rows, mark = '-') => rows.map((r) => `${mark} ${r}`).join('\n');

function loadCourses() {
  const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8')).courses;
  return [
    ...read('/app/base44/shared/lms/courses-a.json'),
    ...read('/app/base44/shared/lms/courses-b.json'),
  ];
}

function lectureNotes(course, m) {
  return `## Module ${m.n} — ${m.t}

**Introduction.** ${m.i}

**Lecture: ${m.t}**
${m.l}

### Key concepts
${bullets(m.c, '-')}

### Worked example
${m.a}

### Reading for this module
${bullets(m.r.slice(0, 2), '1.')}

### Check your understanding
- Can you state, in one sentence, what ${m.c[0]} means in this module?
- Where does ${m.c[1]} do analytical work, and where does it fail?
- How would the argument change if ${m.c[2]} were absent?`;
}

function readingResource(course, m) {
  return `## Reading notes — ${m.r[0]}

**Why this reading.** ${m.i} The reading is set to give you the argument the lecture assumes rather than restates.

**What to look for while reading**
${bullets([`How the author defines ${m.c[0]}`, `The evidence offered for ${m.c[1]}`, `Where ${m.c[2]} is treated as a scope condition`, `The strongest objection the author acknowledges`])}

**Summary.** ${m.r[0]} establishes the case for treating ${m.c[0]} as the organising variable of this module. Read it alongside ${m.r[1]}, which supplies the counter-consideration developed in the lecture under ${m.c[3]}.

**Reading list**
1. ${m.r[0]} — core reading, required before the seminar.
2. ${m.r[1]} — companion reading for the discussion.

**Seminar questions**
- What would count as evidence against the author's central claim?
- Which of the module's key concepts travels best outside this course's cases?`;
}

function studyGuide(course, m, total) {
  return `## Study guide — Module ${m.n} of ${total}: ${m.t}

**Learning objectives**
${bullets(m.o)}

**Key terms**
${bullets(m.c.map((c) => `**${c}** — used in this module to organise the analysis of ${m.t.toLowerCase()}.`))}

**How the module fits the course**
This module develops the ${course.code} argument by moving from ${m.t.toLowerCase()} to the assessment task set for this stage of the course.

**Practice questions**
1. Explain how ${m.c[0]} shapes the outcome discussed in this module.
2. Compare ${m.c[1]} and ${m.c[2]} as explanations of the same phenomenon.
3. Short answer: in no more than 150 words, define ${m.c[3]} and give one example from the reading.

**Self-check before the seminar**
- I can define every key term without notes.
- I can state the module's main claim and one objection to it.
- I can connect this module to the course assignment.`;
}

function syllabusText(course, modules, prof) {
  const [wa, wq, wm, wf] = course.weights;
  return `# ${course.code} — ${course.title}

**Instructor:** ${prof}
**Academic year:** 2026/27 · **Semester:** ${TERM}
**Credits:** ${course.credits} · **Level:** ${course.level} · **Year:** ${course.year}
**Department:** ${course.deptName}

## Course description
${course.description}

## Learning objectives
On completion, students will be able to:
${bullets(course.objectives)}

## Prerequisites
${course.prerequisites.length ? bullets(course.prerequisites) : '- None. The course is designed to be taken without prior specialist preparation.'}

## Weekly schedule
${modules.map((m) => `**Module ${m.n} — ${m.t}** (approx. ${m.hours} study hours)\n${m.o.map((o) => `  - ${o}`).join('\n')}`).join('\n\n')}

## Assessment structure
| Component | Weight | Notes |
|---|---|---|
| Assignments | ${wa}% | Two written assessments set in modules 3 and 5 |
| Quizzes | ${wq}% | Knowledge checks after each block; best attempt counts |
| Midterm assessment | ${wm}% | Set in the middle of the semester |
| Final examination | ${wf}% | Cumulative, essay format |

Missing work is recorded as missing, not as zero. A component is only scored when a submitted item has been graded or an attempt recorded.

## Reading and preparation
Readings are set per module and are available as learning resources in the course workspace. Students are expected to arrive at seminars having completed the core reading.

## Academic integrity
All submitted work must be the student's own. Sources must be cited. Suspected misconduct is referred under the university's academic integrity procedure.

## Fictional data notice
This syllabus, its instructor and all records in this course are fictional demonstration data created for a university prototype. They are not affiliated with, and do not represent, any real institution.`;
}

function revisionGuide(course, modules) {
  return `# Revision guide — ${course.code} ${course.title}

## How the assessment is structured
${course.weights[0]}% assignments · ${course.weights[1]}% quizzes · ${course.weights[2]}% midterm · ${course.weights[3]}% final. The final examination is cumulative and expects you to connect modules rather than recite them.

## Module-by-module revision map
${modules.map((m) => `**Module ${m.n}: ${m.t}** — revise ${m.c.join(', ')}. Be able to state the module's central claim and one objection to it.`).join('\n\n')}

## Likely essay questions
- Which concept from this course best explains the outcome in ${modules[1].t.toLowerCase()}? Defend your choice against one rival.
- "${modules[4].t}" — argue for or against the proposition that this is the decisive variable in the course's cases.
- Compare ${modules[2].c[0]} and ${modules[6].c[1]} as competing accounts.

## Common errors to avoid
- Describing theories instead of using them to explain a case.
- Asserting evidence without a source.
- Answering the question you prepared rather than the one set.`;
}

function caseStudy(course, m) {
  return `# Case study — ${course.title}

## Setting
The seminar returns to the problem raised in Module ${m.n}, ${m.t.toLowerCase()}. The materials below are fictional and were written for teaching.

## Facts
A ministry has to choose between two courses of action. Option A protects the position described in the module's reading but imposes visible short-term costs. Option B reduces those costs while conceding the mechanism the module treats as decisive (${m.c[0]}). Officials disagree, and the disagreement is not about facts but about which risk is acceptable.

## Documents
1. A two-page internal brief arguing for Option A, citing ${m.c[1]}.
2. A stakeholder memorandum arguing for Option B, citing ${m.c[2]}.
3. A one-page note from the legal service on the constraints that apply either way.

## Questions
- Which option does the module's framework predict, and why?
- What evidence would settle the disagreement between the two briefs?
- Draft the paragraph of advice you would give the minister, in no more than 200 words.

## Assessment
Seminar contribution is assessed on the quality of the evidence cited, not on which option is chosen.`;
}

function seminarPrep(course, m) {
  return `# Seminar preparation — ${course.code}, Module ${m.t}

## Before the seminar
1. Read ${m.r[0]} in full and ${m.r[1]} for the counter-argument.
2. Write a 200-word answer to the question below and bring it to class.
3. Note one passage you could not follow, with the paragraph number.

## Discussion question
${m.i} Taking the module's framework as given, what follows for the case in the case study?

## Role for the seminar
You will be asked to argue one position for ten minutes and then to switch. Prepare both.

## What is assessed
Clarity of the claim, quality of evidence, and the ability to state the strongest objection to your own position.`;
}

function assignmentSpec(course, kind, m) {
  const specs = {
    essay: {
      title: `Analytical essay: ${m.t}`,
      type: 'essay',
      instructions: `Write a 2,000-word analytical essay answering the question set for ${m.t.toLowerCase()}.\n\n**The task.** ${m.i} Build an argument, do not survey the literature. State a position in the introduction, support it with evidence drawn from the course readings, and address the strongest objection to it.\n\n**Requirements.** 2,000 words (±10%), referenced, submitted as PDF. At least four course readings must be engaged.\n\n**What the marker looks for.** A clear thesis, use of the module's key concepts (${m.c.slice(0, 2).join(', ')}), evidence that is cited rather than asserted, and a conclusion that follows from the argument rather than restating it.`,
      format: 'PDF, 2,000 words',
      formatShort: 'PDF',
    },
    policy_brief: {
      title: `Policy brief: ${m.t}`,
      type: 'policy_brief',
      instructions: `Prepare a 1,200-word policy brief for a decision-maker on the problem raised in ${m.t.toLowerCase()}.\n\n**The task.** ${m.i} Recommend a course of action, state what it costs, and name the interests that will resist it.\n\n**Structure.** Problem (200 words) · Options (400 words, at least two) · Recommendation (400 words) · Risks and mitigation (200 words).\n\n**Requirements.** 1,200 words, maximum three pages, no more than five references, written for a non-specialist reader.`,
      format: 'PDF, 1,200 words, max 3 pages',
      formatShort: 'PDF',
    },
    presentation: {
      title: `Seminar presentation: ${m.t}`,
      type: 'presentation',
      instructions: `Prepare and deliver a 10-minute presentation on ${m.t.toLowerCase()}, followed by five minutes of questions.\n\n**The task.** ${m.i} Your job is to make the module's argument legible to classmates who have done the reading but not yet thought it through.\n\n**Requirements.** Submit your slides plus speaking notes as a PDF. At most 10 slides. Every claim on a slide must be defensible from a course reading.`,
      format: 'PDF slides with speaker notes',
      formatShort: 'PDF',
    },
    problem_set: {
      title: `Problem set: ${m.t}`,
      type: 'problem_set',
      instructions: `Complete the applied problem set on ${m.t.toLowerCase()}.\n\n**The task.** ${m.i} Work through each question showing the method, the substitution and the interpretation. A numerical answer without interpretation earns half credit.\n\n**Requirements.** Submit as a single PDF. Show all working. Interpret every result in one sentence.`,
      format: 'PDF with full working',
      formatShort: 'PDF',
    },
    case_analysis: {
      title: `Case analysis: ${m.t}`,
      type: 'case_analysis',
      instructions: `Analyse the assigned case using the framework of ${m.t.toLowerCase()}.\n\n**The task.** ${m.i} Separate facts from interpretation, apply the framework explicitly, and state what the framework cannot explain in this case.\n\n**Requirements.** 1,500 words. Use the case pack documents. Cite every factual claim.`,
      format: 'PDF, 1,500 words',
      formatShort: 'PDF',
    },
  };
  const spec = specs[kind] || specs.essay;
  const rubric = [
    { criterion: 'Use of concepts', points: 30, descriptor: `Concepts from the module (${m.c.slice(0, 3).join(', ')}) are defined and applied, not merely named.` },
    { criterion: 'Evidence and sources', points: 30, descriptor: 'Claims are supported by cited course readings and, where relevant, by case material.' },
    { criterion: 'Argument and structure', points: 25, descriptor: 'A clear position is stated, developed and defended against the strongest objection.' },
    { criterion: 'Presentation and referencing', points: 15, descriptor: 'The submission follows the required format and cites consistently.' },
  ];
  return { ...spec, rubric, objectives: m.o };
}

function quizQuestions(course, modules) {
  const allConcepts = modules.flatMap((m) => m.c);
  const distractors = (m, count) => allConcepts.filter((c) => !m.c.includes(c)).slice(m.n * 3, m.n * 3 + count);
  const rows = [];
  modules.forEach((m) => {
    const opts = [m.c[0], ...distractors(m, 3)];
    rows.push({
      type: 'multiple_choice',
      module_number: m.n,
      prompt: `Module ${m.n}, "${m.t}": which concept is the organising idea of this stage of the course?`,
      options: opts,
      correct_index: 0,
      explanation: `${m.i} The module builds its argument around ${m.c[0]}, and applies it alongside ${m.c[1]}.`,
      difficulty: m.n <= 3 ? 'easy' : m.n <= 6 ? 'medium' : 'hard',
    });
  });
  modules.slice(0, 4).forEach((m) => {
    const opts = [m.c[0], m.c[1], ...distractors(m, 2)];
    rows.push({
      type: 'multiple_select',
      module_number: m.n,
      prompt: `Which two of the following concepts are developed directly in Module ${m.n} ("${m.t}")?`,
      options: opts,
      correct_index: 0,
      correct_answers: [0, 1],
      explanation: `${m.c[0]} and ${m.c[1]} are both introduced in this module; the other options belong to different stages of the course.`,
      difficulty: 'medium',
    });
  });
  return rows;
}

async function createAll(entity, rows) {
  const created = [];
  for (const part of chunk(rows)) {
    const res = await entity.bulkCreate(part);
    if (Array.isArray(res)) created.push(...res);
  }
  return created;
}

async function seedCourses(base44, codes) {
  const courses = loadCourses().filter((c) => !codes || codes.includes(c.code));
  const existingCourses = await base44.entities.Course.list('-created_date', 200);
  const existingCodes = new Set((existingCourses || []).map((c) => c.code));

  const students = await base44.entities.Student.list('-created_date', 200);
  const professors = await base44.entities.Professor.list('-created_date', 100);
  const profName = (id) => professors.find((p) => p.id === id)?.full_name || 'Course instructor';

  const report = { seeded: [], skipped: [], counts: {} };
  const add = (key, n) => { report.counts[key] = (report.counts[key] || 0) + n; };

  for (let i = 0; i < courses.length; i += 1) {
    const c = courses[i];
    if (existingCodes.has(c.code)) {
      report.skipped.push(c.code);
      continue;
    }
    const facultyId = FACULTY[c.faculty];
    const deptId = DEPT[c.dept];
    const pool = PROFS[c.faculty];
    const professorId = pool[i % pool.length];
    const deptName = (await base44.entities.Department.get(deptId)).name;

    const modules = c.modules.map((m, idx) => ({ ...m, n: idx + 1, hours: c.credits >= 6 ? 5 : 4 }));
    const enriched = { ...c, deptName, modules };

    const course = await base44.entities.Course.create({
      code: c.code,
      title: c.title,
      faculty_id: facultyId,
      department_id: deptId,
      professor_id: professorId,
      credits: c.credits,
      semester: TERM,
      year_level: c.year,
      description: c.description,
      level: c.level,
      objectives: c.objectives,
      prerequisites: c.prerequisites,
      status: 'published',
      syllabus: syllabusText(enriched, modules, profName(professorId)),
      weight_assignments: c.weights[0],
      weight_quizzes: c.weights[1],
      weight_midterm: c.weights[2],
      weight_final: c.weights[3],
      is_demo: true,
    });
    add('courses', 1);

    // Modules
    const createdModules = await createAll(
      base44.entities.CourseModule,
      modules.map((m) => ({
        course_id: course.id,
        course_code: c.code,
        course_title: c.title,
        module_number: m.n,
        title: m.t,
        introduction: m.i,
        objectives: m.o,
        lecture_topic: m.t,
        lecture_notes: `${m.l}\n\n### Key concepts\n${bullets(m.c)}`,
        readings: m.r,
        activity: m.a,
        duration_hours: m.hours,
        professor_id: professorId,
        is_demo: true,
      }))
    );
    add('modules', createdModules.length);

    // Resources
    const day = (d) => `2026-09-${String(d).padStart(2, '0')}`;
    const resources = [];
    modules.forEach((m, idx) => {
      const moduleId = createdModules[idx].id;
      resources.push(
        {
          course_id: course.id, course_code: c.code, module_id: moduleId, module_number: m.n,
          title: `Module ${m.n} — ${m.t}: lecture notes`, type: 'lecture_notes',
          description: `Full lecture notes for Module ${m.n}, including key concepts, a worked example and seminar questions.`,
          content: lectureNotes(enriched, m), reading_list: m.r, published_date: day(7 + m.n),
          professor_id: professorId, visible_to_students: true, is_demo: true,
        },
        {
          course_id: course.id, course_code: c.code, module_id: moduleId, module_number: m.n,
          title: `Module ${m.n} — reading notes: ${m.r[0]}`.slice(0, 180), type: 'reading',
          description: `Guided reading notes and seminar questions for ${m.r[0]}.`,
          content: readingResource(enriched, m), reading_list: m.r, published_date: day(7 + m.n),
          professor_id: professorId, visible_to_students: true, is_demo: true,
        },
        {
          course_id: course.id, course_code: c.code, module_id: moduleId, module_number: m.n,
          title: `Module ${m.n} — study guide`, type: 'study_guide',
          description: `Objectives, glossary and practice questions for Module ${m.n}.`,
          content: studyGuide(enriched, m, modules.length), reading_list: [], published_date: day(7 + m.n),
          professor_id: professorId, visible_to_students: true, is_demo: true,
        }
      );
    });
    resources.push(
      {
        course_id: course.id, course_code: c.code, module_number: 0,
        title: `${c.code} syllabus`, type: 'reading',
        description: 'Full course syllabus: objectives, weekly schedule, assessment structure and integrity rules.',
        content: syllabusText(enriched, modules, profName(professorId)), reading_list: [],
        published_date: '2026-09-01', professor_id: professorId, visible_to_students: true, is_demo: true,
      },
      {
        course_id: course.id, course_code: c.code, module_number: 1,
        title: `${c.code} revision guide`, type: 'revision_guide',
        description: 'Revision map for all modules with likely essay questions and common errors.',
        content: revisionGuide(enriched, modules), reading_list: [],
        published_date: '2026-09-04', professor_id: professorId, visible_to_students: true, is_demo: true,
      },
      {
        course_id: course.id, course_code: c.code, module_number: modules[5].n,
        module_id: createdModules[5].id,
        title: `${c.code} case study: ${modules[5].t}`, type: 'case_study',
        description: 'Teaching case with documents and seminar questions.',
        content: caseStudy(enriched, modules[5]), reading_list: modules[5].r,
        published_date: '2026-10-01', professor_id: professorId, visible_to_students: true, is_demo: true,
      },
      {
        course_id: course.id, course_code: c.code, module_number: modules[6].n,
        module_id: createdModules[6].id,
        title: `Seminar preparation — ${modules[6].t}`, type: 'seminar_prep',
        description: 'Preparation brief, discussion question and assessment criteria for the seminar.',
        content: seminarPrep(enriched, modules[6]), reading_list: modules[6].r,
        published_date: '2026-10-08', professor_id: professorId, visible_to_students: true, is_demo: true,
      }
    );
    const createdResources = await createAll(base44.entities.LearningResource, resources);
    add('resources', createdResources.length);

    // Assignments
    const kindPool = c.area === 'Research Methods'
      ? ['problem_set', 'essay', 'presentation']
      : c.area === 'Foreign Languages'
        ? ['coursework', 'presentation', 'case_analysis']
        : ['essay', 'policy_brief', 'presentation'];
    const specs = [
      { kind: kindPool[0], m: modules[2], due: '2026-10-12', status: 'closed' },
      { kind: kindPool[1], m: modules[4], due: '2026-11-24', status: 'published' },
      { kind: kindPool[2], m: modules[7], due: '2026-12-11', status: 'published' },
    ].map((row) => ({ ...row, ...assignmentSpec(enriched, row.kind, row.m) }));

    const createdAssignments = await createAll(
      base44.entities.Assignment,
      specs.map((s) => ({
        course_id: course.id,
        course_code: c.code,
        course_title: c.title,
        professor_id: professorId,
        module_id: createdModules[s.m.n - 1].id,
        module_number: s.m.n,
        title: s.title,
        instructions: s.instructions,
        objectives: s.objectives,
        assessment_type: s.type === 'coursework' ? 'coursework' : s.type,
        max_score: 100,
        published_date: '2026-09-14',
        due_date: s.due,
        submission_format: s.format,
        late_policy: 'Late submissions lose 5 marks per day for up to five days. After five days the item is recorded as missing unless an extension was granted in advance.',
        rubric: s.rubric,
        status: s.status,
        semester: TERM,
        is_demo: true,
      }))
    );
    add('assignments', createdAssignments.length);

    // Quiz + questions
    const quiz = await base44.entities.Quiz.create({
      course_id: course.id,
      course_code: c.code,
      course_title: c.title,
      professor_id: professorId,
      module_number: 1,
      title: `${c.code} knowledge check`,
      description: `Twelve questions covering modules 1–8 of ${c.title}.`,
      instructions: 'Two attempts are permitted; the higher score counts. Each question is worth one mark and feedback is shown immediately after submission.',
      duration_minutes: 25,
      attempt_limit: 2,
      pass_mark: 60,
      available_from: '2026-09-20',
      available_until: '2026-12-15',
      status: 'published',
      semester: TERM,
      is_demo: true,
    });
    add('quizzes', 1);

    const questionRows = quizQuestions(enriched, modules).map((q, idx) => ({
      quiz_id: quiz.id,
      course_id: course.id,
      module_number: q.module_number,
      module_id: createdModules[q.module_number - 1].id,
      prompt: q.prompt,
      type: q.type,
      options: q.options,
      correct_index: q.correct_index,
      correct_answers: q.correct_answers || [q.correct_index],
      explanation: q.explanation,
      difficulty: q.difficulty,
      points: 1,
      order: idx + 1,
    }));
    const createdQuestions = await createAll(base44.entities.QuizQuestion, questionRows);
    add('questions', createdQuestions.length);

    // Enrolment cohort: faculty-matched six, always including the demo student for IER courses
    const facultyStudents = students.filter((s) => s.faculty_id === facultyId);
    let cohort = facultyStudents.slice(0, 6);
    if (cohort.length < 6) cohort = [...cohort, ...students.filter((s) => !cohort.includes(s)).slice(0, 6 - cohort.length)];
    const alex = students.find((s) => s.id === ALEX_STUDENT);
    if (c.faculty === 'IER' && alex && !cohort.some((s) => s.id === alex.id)) {
      cohort = [alex, ...cohort.slice(0, 5)];
    }

    await createAll(
      base44.entities.CourseEnrollment,
      cohort.map((s) => ({
        student_id: s.id, course_id: course.id, faculty_id: facultyId, department_id: deptId,
        enrolled_date: '2026-09-08', is_demo: true,
      }))
    );
    add('enrollments', cohort.length);

    // Submissions: graded first assessment, ungraded second assessment
    const scoreSets = [86, 78, 71, 63, 54, 47];
    const gradedRows = cohort.slice(0, 4).map((s, idx) => ({
      assignment_id: createdAssignments[0].id,
      course_id: course.id,
      course_code: c.code,
      professor_id: professorId,
      student_id: s.id,
      student_user_id: s.id === ALEX_STUDENT ? ALEX_USER : '',
      student_name: s.full_name,
      student_group: s.group_name,
      submitted_at: '2026-10-11',
      content: `Essay submitted on ${specs[0].m.t.toLowerCase()}. The argument follows the module framework and cites the set readings.`,
      status: 'graded',
      score: scoreSets[idx % scoreSets.length],
      max_score: 100,
      feedback: scoreSets[idx % scoreSets.length] >= 60
        ? 'A clear thesis and good use of the set readings. The counter-argument in section 3 is asserted rather than evidenced: cite the rival reading and engage with it, and the essay would reach the upper band.'
        : 'The essay summarises the module rather than arguing a position, and two key concepts are named without being applied. Revisit the reading notes for the module and rebuild the argument around one claim.',
      graded_at: '2026-10-18',
      graded_by: profName(professorId),
      is_demo: true,
    }));
    const pendingRows = cohort.slice(4, 6).map((s) => ({
      assignment_id: createdAssignments[1].id,
      course_id: course.id,
      course_code: c.code,
      professor_id: professorId,
      student_id: s.id,
      student_user_id: s.id === ALEX_STUDENT ? ALEX_USER : '',
      student_name: s.full_name,
      student_group: s.group_name,
      submitted_at: '2026-11-06',
      content: `Brief submitted for ${specs[1].m.t.toLowerCase()}, following the required problem/options/recommendation structure.`,
      status: 'submitted',
      is_demo: true,
    }));
    const createdSubs = await createAll(base44.entities.Submission, [...gradedRows, ...pendingRows]);
    add('submissions', createdSubs.length);

    // Quiz attempts across the cohort
    const attemptScores = [92, 83, 75, 67, 58, 42];
    const attemptRows = cohort.map((s, idx) => {
      const score = attemptScores[idx % attemptScores.length];
      const correctCount = Math.round((score / 100) * createdQuestions.length);
      return {
        quiz_id: quiz.id,
        course_id: course.id,
        professor_id: professorId,
        student_user_id: s.id === ALEX_STUDENT ? ALEX_USER : '',
        student_id: s.id,
        student_name: s.full_name,
        answers: createdQuestions.map((q, qi) => (qi < correctCount ? (q.correct_answers?.[0] ?? q.correct_index) : -1)),
        score,
        max_score: 100,
        submitted_at: '2026-10-05',
        is_demo: true,
      };
    });
    const createdAttempts = await createAll(base44.entities.QuizAttempt, attemptRows);
    add('attempts', createdAttempts.length);

    // Discussion with student posts and a professor reply
    const topicModule = modules[3];
    const thread = await base44.entities.Discussion.create({
      course_id: course.id,
      course_code: c.code,
      professor_id: professorId,
      module_id: createdModules[3].id,
      module_number: topicModule.n,
      title: `Discussion: ${topicModule.t}`,
      body: `Prompt: ${topicModule.i} Drawing on modules 1–4, take a position on this question and support it with at least two pieces of evidence from the course readings.`,
      author_user_id: professorId,
      author_name: profName(professorId),
      author_role: 'professor',
      is_demo: true,
    });
    add('discussions', 1);

    const replies = cohort.slice(0, 3).map((s, idx) => ({
      course_id: course.id,
      course_code: c.code,
      professor_id: professorId,
      module_id: createdModules[3].id,
      module_number: topicModule.n,
      parent_id: thread.id,
      title: '',
      body: [
        `Reading ${topicModule.r[0]} pushed me towards the opposite conclusion. If ${topicModule.c[0]} is doing the explanatory work, then the outcome in the case should follow regardless of ${topicModule.c[2]}, and it does not: the comparison in the second half of the module suggests ${topicModule.c[1]} matters more than the lecture allows.`,
        `I take the module's side, but with a qualification. ${topicModule.c[0]} explains why the actors chose confrontation over compromise, yet it cannot explain the timing. ${topicModule.c[3]} seems to carry that part of the story, which makes the two concepts complementary rather than rival.`,
        `The seminar question is harder than it looks. My first answer relied on ${topicModule.c[2]}, but the reading notes for the module treat that as a scope condition rather than a cause. I would now argue that ${topicModule.c[1]} is the better explanation, supported by the case study documents.`,
      ][idx],
      author_user_id: s.id === ALEX_STUDENT ? ALEX_USER : '',
      author_name: s.full_name,
      author_role: 'student',
      is_demo: true,
    }));
    if (alex && !replies.some((r) => r.author_name === alex.full_name)) {
      replies[0].author_user_id = '';
    }
    replies.push({
      course_id: course.id,
      course_code: c.code,
      professor_id: professorId,
      module_id: createdModules[3].id,
      module_number: topicModule.n,
      parent_id: thread.id,
      title: '',
      body: `Good range of positions. Two things to tighten in the replies: state which reading supports the claim, and say what evidence would change your mind. We will take the strongest objection raised here as the starting point for the seminar.`,
      author_user_id: professorId,
      author_name: profName(professorId),
      author_role: 'professor',
      is_demo: true,
    });
    const createdPosts = await createAll(base44.entities.Discussion, replies);
    add('posts', createdPosts.length);

    report.seeded.push(c.code);
  }

  return report;
}

module.exports = { seedCourses, loadCourses };