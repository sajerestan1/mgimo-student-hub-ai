import StatusChip from '@/components/shell/StatusChip';

const percent = (value) => `${Number(value || 0).toFixed(1)}%`;

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-line bg-canvas px-3 py-2.5">
      <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-mutedink">{label}</p>
      <p className="mt-0.5 text-[17px] font-semibold leading-tight text-ink">{value}</p>
    </div>
  );
}

export default function SimilarityPanel({ record, passages }) {
  const flagged = (passages || []).filter((passage) => passage.flagged);
  const score = Number(record?.similarity_percent || 0);
  const scoreTone = score >= 30 ? 'critical' : score >= 10 ? 'warning' : 'positive';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-mutedink">Overall similarity</p>
          <p className="mt-0.5 text-[2.25rem] font-bold leading-none tracking-[-0.02em] text-ink">{percent(score)}</p>
        </div>
        <StatusChip tone={scoreTone}>
          {flagged.length ? `${flagged.length} passage${flagged.length === 1 ? '' : 's'} for review` : 'No matching passages'}
        </StatusChip>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-[#EDF1FE]">
        <div
          className="h-full rounded-full bg-brand"
          style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
          aria-hidden="true"
        />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Matching passages" value={record?.matched_passage_count || 0} />
        <Stat label="Repeated in document" value={record?.repeated_passage_count || 0} />
        <Stat label="Compared against" value={`${record?.corpus_documents || 0} submission(s)`} />
        <Stat label="Comparison words" value={Number(record?.corpus_words || 0).toLocaleString()} />
      </div>

      <div className="rounded-lg border border-line bg-white px-3 py-2.5">
        <p className="text-[13px] font-semibold text-ink">Internal text similarity check — what this number means</p>
        <p className="mt-1 text-[13px] leading-[1.6] text-mutedink">
          The percentage is the share of this document&rsquo;s words that sit inside passages closely matching text
          already analysed in this workspace. Comparison uses overlapping six-word sequences, so a short shared phrase
          is not counted; a passage is flagged only when at least half of it reappears in one source passage.
        </p>
        <p className="mt-2 text-[13px] leading-[1.6] text-mutedink">
          No external plagiarism database, citation index, publisher archive or institutional repository is connected
          to this workspace, and none is queried. Turnitin, iThenticate and similar services are not part of this
          check. With no previously analysed submission to compare against, the score is necessarily {percent(0)} — that
          is a limit of the comparison set, not a finding. A similarity score is never proof of misconduct, and
          legitimate quotation, common academic phrasing and shared terminology can all match.
        </p>
      </div>

      {flagged.length > 0 && (
        <div>
          <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-[0.06em] text-mutedink">
            Passages flagged for review
          </h3>
          <ul className="divide-y divide-line rounded-lg border border-line">
            {flagged.slice(0, 20).map((passage) => (
              <li key={passage.index} className="px-3 py-2.5">
                <p className="text-[13.5px] leading-[1.6] text-ink">“{passage.text}”</p>
                <ul className="mt-1.5 space-y-1">
                  {passage.sources.map((source, sourceIndex) => (
                    <li key={`${passage.index}-${sourceIndex}`} className="text-[12.5px] text-mutedink">
                      <span className="font-medium text-ink">
                        {source.type === 'internal_submission' ? 'Previously analysed submission' : 'Same document'}:
                      </span>{' '}
                      {source.title}
                      {source.reference ? ` · ${source.reference}` : ''} · {percent(source.overlap)} overlap
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          {flagged.length > 20 && (
            <p className="mt-2 text-[12.5px] text-mutedink">
              Showing the first 20 flagged passages. The stored report keeps the full count.
            </p>
          )}
        </div>
      )}
    </div>
  );
}