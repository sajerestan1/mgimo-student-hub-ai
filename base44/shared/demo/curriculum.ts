// Authored teaching content for the demonstration dataset: six interconnected
// courses, their modules and the documents generated from them. All content is
// fictional teaching material written for this prototype.

export const TERM = '2026/2027 · Fall';
export const PREVIOUS_TERM = '2025/2026 · Spring';
export const ACADEMIC_YEAR = '2026/27';

export const COURSES = [
  {
    code: 'IR-201',
    title: 'Theory of International Relations',
    faculty: 'IR',
    dept: 'IRFP',
    professor: 0,
    credits: 6,
    year: 2,
    level: 'intermediate',
    area: 'Theory',
    sessions: 4,
    description:
      'The competing theoretical traditions of international relations, and what each one can and cannot explain about state behaviour, cooperation and conflict.',
    objectives: [
      'State and compare the realist, liberal and constructivist accounts of international order.',
      'Apply each tradition to a specific case and identify what the competing explanation misses.',
      'Judge which theory the evidence in a case actually supports.',
    ],
    prerequisites: ['Introduction to International Relations'],
    weights: [30, 20, 20, 30],
    modules: [
      {
        t: 'Anarchy and the realist tradition',
        i: 'Realism begins from the absence of a central authority above states and asks what follows for their behaviour.',
        c: ['anarchy', 'self-help', 'balance of power'],
        o: ['Explain how anarchy is said to constrain state choice', 'Distinguish defensive from offensive realism'],
        r: ['Waltz, Theory of International Politics, ch. 6', 'Mearsheimer, The Tragedy of Great Power Politics, ch. 2'],
      },
      {
        t: 'Cooperation and the liberal tradition',
        i: 'Liberalism asks why states that could defect nonetheless build institutions that outlast the incentives to cheat.',
        c: ['institutional cooperation', 'absolute gains', 'interdependence'],
        o: ['Account for cooperation without a central enforcer', 'Identify the conditions under which institutions change state behaviour'],
        r: ['Keohane, After Hegemony, ch. 4', 'Axelrod, The Evolution of Cooperation, ch. 1'],
      },
      {
        t: 'Identity, norms and the constructivist turn',
        i: 'Constructivism treats state interests as produced by social interaction rather than given before it.',
        c: ['social construction', 'norms', 'identity'],
        o: ['Show how interests can change through interaction', 'Apply norm diffusion to one policy change'],
        r: ['Wendt, Social Theory of International Politics, ch. 1', 'Finnemore & Sikkink, International Norm Dynamics'],
      },
      {
        t: 'Choosing between theories',
        i: 'A theory earns its place by explaining cases it was not built to explain, and by failing in ways that can be specified in advance.',
        c: ['paradigm competition', 'scope conditions', 'explanation versus description'],
        o: ['Evaluate rival explanations of a single outcome', 'State the evidence that would refute a claim'],
        r: ['Fearon, Counterfactuals and Hypothesis Testing', 'Lake & Powell, Strategic Choice and International Relations'],
      },
    ],
  },
  {
    code: 'IR-204',
    title: 'Regional Security Studies',
    faculty: 'IR',
    dept: 'RS',
    professor: 1,
    credits: 4,
    year: 2,
    level: 'intermediate',
    area: 'Security',
    sessions: 3,
    description:
      'Security dynamics in three regional complexes, and the analytic vocabulary used to compare them without importing one region’s assumptions into another.',
    objectives: [
      'Apply the regional security complex framework to a chosen region.',
      'Distinguish security dilemma dynamics from deliberate revisionism.',
      'Assess the effect of alliance structures on regional escalation.',
    ],
    prerequisites: ['Theory of International Relations'],
    weights: [40, 20, 10, 30],
    modules: [
      {
        t: 'The regional security complex',
        i: 'Security threats travel more easily over short distances than long ones, which makes regions the natural unit of analysis.',
        c: ['security complex', 'securitisation', 'amity and enmity'],
        o: ['Define a region by security interdependence rather than geography', 'Explain how securitisation moves an issue into the existential register'],
        r: ['Buzan & Wæver, Regions and Powers, ch. 2', 'Buzan, Wæver & de Wilde, Security: A New Framework, ch. 1'],
      },
      {
        t: 'Alliances and entrapment',
        i: 'Alliances buy deterrence with a promise that can drag the guarantor into a war it did not choose.',
        c: ['extended deterrence', 'entrapment', 'alliance credibility'],
        o: ['Explain the trade-off between credibility and control', 'Identify the conditions that make entrapment likely'],
        r: ['Snyder, Alliance Politics, ch. 1', 'Christensen, Worse Than a Monolith'],
      },
      {
        t: 'Civil conflict and regional spillover',
        i: 'Internal wars rarely stay internal: refugees, arms and combatants cross borders and change the security environment that receives them.',
        c: ['spillover', 'war economy', 'proxy conflict'],
        o: ['Identify the channels through which conflict crosses a border', 'Assess how neighbouring states shape the duration of a civil war'],
        r: ['Kalyvas, The Logic of Violence in Civil War, ch. 2', 'Salehyan, Rebels Without Borders, ch. 3'],
      },
      {
        t: 'De-escalation and arms control',
        i: 'Agreements that reduce uncertainty can stabilise a rivalry even when the underlying dispute remains unresolved.',
        c: ['confidence building', 'verification', 'intransigence'],
        o: ['Explain how verification reduces the security dilemma', 'Judge when arms control substitutes for settlement and when it does not'],
        r: ['Croft, Strategies of Arms Control, ch. 1', 'Kydd, Trust and Mistrust in International Relations, ch. 5'],
      },
    ],
  },
  {
    code: 'IR-310',
    title: 'Diplomatic Practice',
    faculty: 'IR',
    dept: 'IRFP',
    professor: 2,
    credits: 4,
    year: 3,
    level: 'advanced',
    area: 'Diplomacy',
    sessions: 3,
    description:
      'How diplomatic practice is organised — representation, instruction, negotiation and reporting — and why formality carries substantive information.',
    objectives: [
      'Draft a reasoned negotiating brief from an instruction.',
      'Distinguish the diplomatic functions of signalling and bargaining.',
      'Assess the effect of protocol on the interpretation of a message.',
    ],
    prerequisites: ['Theory of International Relations'],
    weights: [30, 20, 20, 30],
    modules: [
      {
        t: 'Representation and mandate',
        i: 'A diplomat’s authority ends where the mandate ends, and the boundary is part of what the other side is reading.',
        c: ['plenipotentiary mandate', 'agrément', 'head of mission'],
        o: ['Explain how mandate shapes what a signal can communicate', 'Draft a limited-authority negotiating instruction'],
        r: ['Roberts, Satow’s Diplomatic Practice, ch. 3', 'Barston, Modern Diplomacy, ch. 2'],
      },
      {
        t: 'Signalling and bargaining',
        i: 'Most negotiation is the costly exchange of information about resolve before the terms are ever discussed.',
        c: ['costly signal', 'audience costs', 'reservation point'],
        o: ['Separate signalling moves from bargaining moves', 'Identify how cheap talk is discounted'],
        r: ['Fearon, Signaling Foreign Policy Interests', 'Schelling, The Strategy of Conflict, ch. 2'],
      },
      {
        t: 'Protocol as information',
        i: 'Rank, seating and precedence look like decoration until a change in them is read as a change in the relationship.',
        c: ['precedence', 'protocol', 'ceremonial ambiguity'],
        o: ['Explain when protocol deviations carry meaning', 'Interpret a documented change in ranking'],
        r: ['Wood & Serres, Diplomatic Ceremonial and Protocol, ch. 4', 'Satow’s Diplomatic Practice, ch. 8'],
      },
      {
        t: 'Reporting and the home government',
        i: 'The report is the product of the mission, and its framing decides which policy option the capital sees as reasonable.',
        c: ['despatch', 'analytic framing', 'instruction cycle'],
        o: ['Write a despatch that separates observation from advice', 'Trace an instruction cycle from report to policy'],
        r: ['Satow’s Diplomatic Practice, ch. 12', 'Berridge, Diplomacy: Theory and Practice, ch. 6'],
      },
    ],
  },
  {
    code: 'IE-201',
    title: 'World Economy',
    faculty: 'IER',
    dept: 'WE',
    professor: 3,
    credits: 6,
    year: 2,
    level: 'intermediate',
    area: 'Economics',
    sessions: 4,
    description:
      'The structure of the world economy: trade, capital flows, exchange-rate regimes and the institutions that govern them.',
    objectives: [
      'Explain the gains from trade and the distributional conflict they create.',
      'Read a balance-of-payments statement and interpret what it implies.',
      'Assess how exchange-rate regime choice constrains domestic policy.',
    ],
    prerequisites: ['Principles of Economics'],
    weights: [30, 20, 20, 30],
    modules: [
      {
        t: 'Trade, specialisation and distribution',
        i: 'Trade raises aggregate income and simultaneously creates identifiable losers, which is why the politics never follows the aggregate.',
        c: ['comparative advantage', 'factor endowment', 'adjustment cost'],
        o: ['Derive the gains from specialisation', 'Identify which groups lose from liberalisation and why'],
        r: ['Krugman, Obstfeld & Melitz, International Economics, ch. 3', 'Rodrik, The Globalization Paradox, ch. 2'],
      },
      {
        t: 'Capital flows and the balance of payments',
        i: 'Every current-account position is a claim on future income, and a sustainable one depends on what the borrowing finances.',
        c: ['current account', 'capital account', 'external sustainability'],
        o: ['Read a balance-of-payments statement', 'Judge whether a deficit reflects investment or consumption'],
        r: ['Krugman, Obstfeld & Melitz, ch. 12', 'Obstfeld, Financial Flows, Financial Crises'],
      },
      {
        t: 'Exchange-rate regimes',
        i: 'A fixed rate buys certainty at the price of monetary autonomy; the choice is rarely free.',
        c: ['purchasing power parity', 'interest parity', 'trilemma'],
        o: ['State the policy trilemma and apply it to a case', 'Explain how a peg fails under capital mobility'],
        r: ['Krugman, Obstfeld & Melitz, ch. 14', 'Rey, Dilemma not Trilemma'],
      },
      {
        t: 'Institutions of the world economy',
        i: 'The Bretton Woods institutions were designed for a world of restricted capital mobility that no longer exists.',
        c: ['conditionality', 'lender of last resort', 'policy space'],
        o: ['Explain the mandate of each institution', 'Assess the effect of conditionality on policy space'],
        r: ['Woods, The IMF and the Global Economy', 'Babb & Carruthers, Conditionality: Forms, Function, and History'],
      },
    ],
  },
  {
    code: 'IE-215',
    title: 'International Finance',
    faculty: 'IER',
    dept: 'IF',
    professor: 4,
    credits: 4,
    year: 2,
    level: 'intermediate',
    area: 'Economics',
    sessions: 3,
    description:
      'Financial markets across borders: parity conditions, currency exposure, sovereign risk and the anatomy of a sudden stop.',
    objectives: [
      'Apply interest-rate and purchasing-power parity to observed data.',
      'Measure and hedge transaction and translation exposure.',
      'Explain the mechanics of a currency crisis without relying on a single trigger.',
    ],
    prerequisites: ['World Economy'],
    weights: [30, 20, 20, 30],
    modules: [
      {
        t: 'Parity conditions',
        i: 'The parity conditions are not predictions but arbitrage statements, and their failures are the interesting part.',
        c: ['covered interest parity', 'forward premium', 'real exchange rate'],
        o: ['Test covered interest parity with market data', 'Interpret a persistent deviation from parity'],
        r: ['Eun & Resnick, International Financial Management, ch. 5', 'Levich, International Financial Markets, ch. 4'],
      },
      {
        t: 'Currency exposure and hedging',
        i: 'Exposure is the sensitivity of value to a rate change, and it is rarely where the accounting loss appears.',
        c: ['transaction exposure', 'translation exposure', 'hedging ratio'],
        o: ['Distinguish the three exposure types', 'Design a hedge for a known receivable'],
        r: ['Eun & Resnick, ch. 9', 'Hull, Options, Futures and Other Derivatives, ch. 3'],
      },
      {
        t: 'Sovereign risk',
        i: 'A sovereign cannot be sued into repayment, so the spread is a price for the credibility of a promise.',
        c: ['sovereign spread', 'debt sustainability', 'credit rating'],
        o: ['Interpret a sovereign spread', 'Assess debt sustainability from a debt-dynamics identity'],
        r: ['Reinhart & Rogoff, This Time Is Different, ch. 1', 'Manasse & Roubini, Rules of Thumb for Sovereign Debt Crises'],
      },
      {
        t: 'Sudden stops and contagion',
        i: 'Crises spread through the balance sheets of creditors, not only through trade links.',
        c: ['sudden stop', 'contagion', 'maturity mismatch'],
        o: ['Trace transmission through a bank balance sheet', 'Explain why regional crises cluster'],
        r: ['Calvo, Capital Flows and Capital-Market Crises', 'Kaminsky, Reinhart & Végh, The Unholy Trinity of Financial Contagion'],
      },
    ],
  },
  {
    code: 'IE-301',
    title: 'Trade Policy Analysis',
    faculty: 'IER',
    dept: 'WE',
    professor: 5,
    credits: 4,
    year: 3,
    level: 'advanced',
    area: 'Economics',
    sessions: 3,
    description:
      'The instruments of trade policy, their welfare effects and the political economy that selects between them.',
    objectives: [
      'Quantify the welfare effect of a tariff and a quota.',
      'Explain why protection persists when its aggregate cost is positive.',
      'Assess a dispute-settlement outcome against the legal text.',
    ],
    prerequisites: ['World Economy'],
    weights: [40, 20, 10, 30],
    modules: [
      {
        t: 'Instruments and welfare effects',
        i: 'A tariff, a quota and a voluntary export restraint can protect the same industry at very different costs.',
        c: ['tariff', 'quota', 'deadweight loss'],
        o: ['Compute the welfare effect of each instrument', 'Compare instruments at equal protective effect'],
        r: ['Krugman, Obstfeld & Melitz, ch. 9', 'Bhagwati, Protectionism, ch. 2'],
      },
      {
        t: 'Political economy of protection',
        i: 'Concentrated losses and diffuse gains make protection politically rational even when it is economically costly.',
        c: ['collective action', 'rent seeking', 'logrolling'],
        o: ['Explain the asymmetry between producers and consumers', 'Predict which industry obtains protection'],
        r: ['Olson, The Logic of Collective Action, ch. 1', 'Grossman & Helpman, Protection for Sale'],
      },
      {
        t: 'Regionalism and the WTO',
        i: 'Preferential agreements liberalise inside the club and discriminate outside it, and the net effect is an empirical question.',
        c: ['trade diversion', 'trade creation', 'dispute settlement'],
        o: ['Distinguish trade creation from diversion', 'Assess whether an agreement raises or lowers welfare'],
        r: ['Viner, The Customs Union Issue, ch. 4', 'Bagwell & Staiger, The Economics of the World Trading System, ch. 1'],
      },
      {
        t: 'Sanctions and economic statecraft',
        i: 'Sanctions are a substitute for force that work through the target’s own political economy, if they work at all.',
        c: ['economic statecraft', 'evasion', 'sanction cost'],
        o: ['Assess the conditions under which sanctions change policy', 'Identify the channels of evasion'],
        r: ['Baldwin, Economic Statecraft, ch. 3', 'Drezner, The Sanctions Paradox, ch. 1'],
      },
    ],
  },
];

const bullets = (rows, mark = '-') => rows.map((row) => `${mark} ${row}`).join('\n');

export function syllabusText(course, professorName, departmentName) {
  const [assignments, quizzes, midterm, final] = course.weights;
  return `# ${course.code} — ${course.title}

**Instructor:** ${professorName}
**Academic year:** ${ACADEMIC_YEAR} · **Semester:** ${TERM}
**Credits:** ${course.credits} · **Level:** ${course.level} · **Year:** ${course.year}
**Department:** ${departmentName}

## Course description
${course.description}

## Learning objectives
On completion, students will be able to:
${bullets(course.objectives)}

## Prerequisites
${course.prerequisites.length ? bullets(course.prerequisites) : '- None.'}

## Weekly schedule
${course.modules
  .map((module, index) => `**Module ${index + 1} — ${module.t}**\n${bullets(module.o, '  -')}`)
  .join('\n\n')}

## Assessment structure
| Component | Weight | Notes |
|---|---|---|
| Assignments | ${assignments}% | Written work set in modules 2 and 3 |
| Quizzes | ${quizzes}% | Knowledge checks after each block; best attempt counts |
| Midterm assessment | ${midterm}% | Set in the middle of the semester |
| Final examination | ${final}% | Cumulative, essay format |

Missing work is recorded as missing, not as zero. A component is scored only when submitted work has been graded.

## Academic integrity
All submitted work must be the student's own and must cite its sources.

## Fictional data notice
This syllabus, its instructor and every record in this course are fictional demonstration data created for a university prototype.`;
}

export function lectureNotes(courseCode, module, index) {
  return `## Module ${index + 1} — ${module.t}

**Introduction.** ${module.i}

### Key concepts
${bullets(module.c.map((concept) => `**${concept}** — used in this module to organise the analysis of ${module.t.toLowerCase()}.`))}

### Reading for this module
${bullets(module.r, '1.')}

### Check your understanding
- Define ${module.c[0]} without notes, then give one example.
- Where does ${module.c[1]} do explanatory work, and where does it fail?
- How would the argument change if ${module.c[2]} were absent?

_Course: ${courseCode} · demonstration material._`;
}

export function studyGuide(courseCode, module, index, total) {
  return `## Study guide — Module ${index + 1} of ${total}: ${module.t}

**Learning objectives**
${bullets(module.o)}

**How the module fits the course**
This module develops ${courseCode} by moving from ${module.t.toLowerCase()} to the assessment task set for this stage of the course.

**Practice questions**
1. Explain how ${module.c[0]} shapes the outcome discussed in this module.
2. Compare ${module.c[1]} and ${module.c[2]} as explanations of the same phenomenon.

**Self-check before the seminar**
- I can define every key term without notes.
- I can state the module's main claim and one objection to it.
- I can connect this module to the course assignment.`;
}

export function assignmentSpec(course, kind, module, index) {
  const specs = {
    essay: {
      type: 'essay',
      title: `Analytical essay: ${module.t}`,
      instructions: `Write a 2,000-word analytical essay on ${module.t.toLowerCase()}.\n\n**The task.** ${module.i} State a position in the introduction, support it with evidence from the course readings, and address the strongest objection to it.\n\n**Requirements.** 2,000 words (±10%), referenced, submitted as PDF. At least four course readings must be engaged.`,
      format: 'PDF, 2,000 words',
    },
    policy_brief: {
      type: 'policy_brief',
      title: `Policy brief: ${module.t}`,
      instructions: `Prepare a 1,200-word policy brief for a decision-maker on the problem raised in ${module.t.toLowerCase()}.\n\n**Structure.** Problem (200 words) · Options (400 words, at least two) · Recommendation (400 words) · Risks and mitigation (200 words).\n\n**Requirements.** 1,200 words, maximum three pages, no more than five references.`,
      format: 'PDF, 1,200 words',
    },
    presentation: {
      type: 'presentation',
      title: `Seminar presentation: ${module.t}`,
      instructions: `Prepare and deliver a 10-minute presentation on ${module.t.toLowerCase()}, followed by five minutes of questions.\n\n**Requirements.** Submit your slides plus speaking notes as a PDF. At most 10 slides. Every claim must be defensible from a course reading.`,
      format: 'PDF slides with speaker notes',
    },
    problem_set: {
      type: 'problem_set',
      title: `Problem set: ${module.t}`,
      instructions: `Complete the applied problem set on ${module.t.toLowerCase()}.\n\nShow the method, the substitution and the interpretation for every question. A numerical answer without interpretation earns half credit.`,
      format: 'PDF with full working',
    },
  };
  const spec = specs[kind] || specs.essay;
  const rubric = [
    { criterion: 'Use of concepts', points: 30, descriptor: `Concepts from the module (${module.c.join(', ')}) are defined and applied, not merely named.` },
    { criterion: 'Evidence and sources', points: 30, descriptor: 'Claims are supported by cited course readings.' },
    { criterion: 'Argument and structure', points: 25, descriptor: 'A clear position is stated and defended against the strongest objection.' },
    { criterion: 'Presentation and referencing', points: 15, descriptor: 'The submission follows the required format and cites consistently.' },
  ];
  return {
    type: spec.type,
    title: spec.title,
    instructions: spec.instructions,
    format: spec.format,
    objectives: module.o,
    rubric,
    moduleNumber: index + 1,
  };
}

export function quizQuestions(course) {
  const allConcepts = course.modules.flatMap((module) => module.c);
  return course.modules.map((module, index) => {
    const distractors = allConcepts.filter((concept) => !module.c.includes(concept)).slice(index * 3, index * 3 + 3);
    return {
      moduleNumber: index + 1,
      prompt: `Module ${index + 1}, "${module.t}": which concept is the organising idea of this stage of the course?`,
      type: 'multiple_choice',
      options: [module.c[0], ...distractors],
      correct_index: 0,
      correct_answers: [0],
      explanation: `${module.i} The module builds its argument around ${module.c[0]}.`,
      difficulty: index < 2 ? 'easy' : index === 2 ? 'medium' : 'hard',
    };
  }).concat([
    {
      moduleNumber: 1,
      prompt: `Which two concepts below are developed directly in "${course.modules[0].t}"?`,
      type: 'multiple_select',
      options: [course.modules[0].c[0], course.modules[0].c[1], ...allConcepts.slice(6, 8)],
      correct_index: 0,
      correct_answers: [0, 1],
      explanation: `${course.modules[0].c[0]} and ${course.modules[0].c[1]} are both introduced in the first module.`,
      difficulty: 'medium',
    },
    {
      moduleNumber: 4,
      prompt: `"${course.modules[3].t}" — what is the module's central claim?`,
      type: 'short_answer',
      options: [],
      correct_index: 0,
      correct_answers: [0],
      explanation: course.modules[3].i,
      difficulty: 'hard',
    },
  ]);
}