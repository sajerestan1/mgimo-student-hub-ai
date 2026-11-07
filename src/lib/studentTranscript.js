// Completed-semester course and grade records for the Student Workspace.
// Four semesters x 24 credits = the 96 credits already earned on the profile,
// and the term averages match PERFORMANCE_TREND (Fall 25 = 76, Spring 26 = 79).

export const TRANSCRIPT = [
  {
    term: 'Spring Semester 2026',
    year: 2,
    courses: [
      { code: 'ECO-212', title: 'International Finance I', credits: 6, score: 81 },
      { code: 'ECO-230', title: 'Econometrics II', credits: 6, score: 74 },
      { code: 'ECO-240', title: 'Development Economics', credits: 6, score: 82 },
      { code: 'LAN-109', title: 'Academic Writing (C1)', credits: 3, score: 88 },
      { code: 'POL-215', title: 'Political Economy of Integration', credits: 3, score: 70 },
    ],
  },
  {
    term: 'Fall Semester 2025',
    year: 2,
    courses: [
      { code: 'ECO-205', title: 'International Trade Theory', credits: 6, score: 78 },
      { code: 'ECO-210', title: 'Monetary Economics', credits: 6, score: 72 },
      { code: 'ECO-220', title: 'Econometrics I', credits: 6, score: 73 },
      { code: 'LAN-108', title: 'Business English (B2+)', credits: 3, score: 83 },
      { code: 'LAW-201', title: 'International Economic Law', credits: 3, score: 79 },
    ],
  },
  {
    term: 'Spring Semester 2025',
    year: 1,
    courses: [
      { code: 'ECO-121', title: 'Microeconomics II', credits: 6, score: 78 },
      { code: 'MAT-125', title: 'Probability & Statistics', credits: 6, score: 73 },
      { code: 'ECO-135', title: 'Accounting for Economists', credits: 6, score: 74 },
      { code: 'LAN-105', title: 'Academic English (B2)', credits: 3, score: 80 },
      { code: 'GEO-110', title: 'Economic Geography', credits: 3, score: 70 },
    ],
  },
  {
    term: 'Fall Semester 2024',
    year: 1,
    courses: [
      { code: 'ECO-101', title: 'Microeconomics I', credits: 6, score: 76 },
      { code: 'ECO-102', title: 'Macroeconomics I', credits: 6, score: 72 },
      { code: 'MAT-110', title: 'Mathematics for Economists', credits: 6, score: 70 },
      { code: 'LAN-101', title: 'Academic English (B1+)', credits: 3, score: 84 },
      { code: 'HIS-105', title: 'History of International Relations', credits: 3, score: 72 },
    ],
  },
];

const termCredits = (term) => term.courses.reduce((total, course) => total + course.credits, 0);
const termWeighted = (term) => term.courses.reduce((total, course) => total + course.score * course.credits, 0);

export function semesterStats(term) {
  const credits = termCredits(term);
  return {
    credits,
    count: term.courses.length,
    average: credits ? termWeighted(term) / credits : 0,
  };
}

export const TRANSCRIPT_TOTALS = (() => {
  const credits = TRANSCRIPT.reduce((total, term) => total + termCredits(term), 0);
  const weighted = TRANSCRIPT.reduce((total, term) => total + termWeighted(term), 0);
  return {
    credits,
    terms: TRANSCRIPT.length,
    courses: TRANSCRIPT.reduce((total, term) => total + term.courses.length, 0),
    average: credits ? weighted / credits : 0,
  };
})();