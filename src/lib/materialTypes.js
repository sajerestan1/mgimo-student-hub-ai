export const MATERIAL_TYPES = [
  { value: 'lecture_notes', label: 'Lecture notes' },
  { value: 'presentation', label: 'Slides' },
  { value: 'syllabus', label: 'Syllabus' },
  { value: 'reading', label: 'Reading' },
  { value: 'dataset', label: 'Dataset' },
  { value: 'other', label: 'Other' },
];

export const typeLabel = (value) =>
  MATERIAL_TYPES.find((type) => type.value === value)?.label || 'Other';