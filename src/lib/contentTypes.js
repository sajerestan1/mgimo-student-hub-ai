export const RESOURCE_TYPES = [
  { value: 'lecture_notes', label: 'Lecture notes' },
  { value: 'slides', label: 'Slides' },
  { value: 'reading', label: 'Reading' },
  { value: 'study_guide', label: 'Study guide' },
  { value: 'case_study', label: 'Case study' },
  { value: 'research_summary', label: 'Research summary' },
  { value: 'seminar_prep', label: 'Seminar preparation' },
  { value: 'revision_guide', label: 'Revision guide' },
];

export const typeLabel = (value) => RESOURCE_TYPES.find((type) => type.value === value)?.label || 'Resource';

export const field =
  'w-full rounded-lg border border-line bg-white px-3 py-2 text-[12px] text-ink focus:border-royal/40 focus:outline-none focus:ring-2 focus:ring-royal/10';