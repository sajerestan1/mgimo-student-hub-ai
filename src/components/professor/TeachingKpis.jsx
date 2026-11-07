export default function TeachingKpis({ stats }) {
  const rows = [
    ['Courses taught', stats.courses, 'This semester'],
    ['Students enrolled', stats.students, 'Across your courses'],
    ['Classes today', stats.today, 'Scheduled sessions'],
    ['To grade', stats.pending, 'Submissions waiting'],
    ['Attendance due', stats.attendanceDue, 'Sessions not completed'],
    ['Upcoming assessments', stats.upcoming, 'Published, not yet due'],
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
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