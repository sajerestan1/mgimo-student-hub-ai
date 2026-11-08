export default function TeachingKpis({ stats }) {
  const rows = [
    ['Courses taught', stats.courses, 'This semester'],
    ['Students enrolled', stats.students, 'Across your courses'],
    ['Submission rate', `${stats.submissionRate}%`, 'Work submitted'],
    ['Outstanding submissions', stats.outstanding, 'Past due, not submitted'],
    ['Average assessment', stats.averageMark === null ? '—' : `${stats.averageMark}%`, 'Graded work'],
    ['Quiz participation', `${stats.quizParticipation}%`, 'Students who attempted'],
    ['Quiz average', stats.quizAverage === null ? '—' : `${stats.quizAverage}%`, 'All attempts'],
    ['Module completion', `${stats.moduleCompletion}%`, 'Marked complete'],
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {rows.map(([label, value, hint]) => (
        <div key={label} className="card-surface px-4 py-3.5">
          <p className="text-[11px] text-mutedink">{label}</p>
          <p className="mt-1 text-[20px] font-semibold leading-none tracking-[-0.02em] text-ink">{value}</p>
          <p className="mt-1.5 text-[10.5px] text-mutedink">{hint}</p>
        </div>
      ))}
    </div>
  );
}