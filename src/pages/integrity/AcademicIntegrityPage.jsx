import { useCallback, useEffect, useState } from 'react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import AnalysisCards from '@/components/integrity/AnalysisCards';
import AnalysisForm from '@/components/integrity/AnalysisForm';
import EngineStatusPanel from '@/components/integrity/EngineStatusPanel';
import IntegrityReport from '@/components/integrity/IntegrityReport';
import HistoryList from '@/components/integrity/HistoryList';
import { loadAnalysis, loadEngineStatus, loadHistory, refreshAnalysis, runAnalysis } from '@/lib/integrity/api';

/**
 * Academic Integrity: an isolated workspace reporting three separate
 * measurements — external provider similarity, internal similarity, and
 * dedicated AI-writing detection. It reads and writes only its own entity and
 * touches no academic record, grade or existing workspace module.
 */
export default function AcademicIntegrityPage() {
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState(null);
  const [statusError, setStatusError] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [historyError, setHistoryError] = useState('');

  const refreshHistory = useCallback(() => {
    loadHistory()
      .then((data) => {
        setHistory(data.items || []);
        setHistoryError('');
      })
      .catch((caught) => setHistoryError(caught.message || 'Your previous analyses could not be loaded.'));
  }, []);

  useEffect(() => {
    refreshHistory();
    loadEngineStatus()
      .then((data) => {
        setStatus(data);
        setStatusError('');
      })
      .catch((caught) => setStatusError(caught.message || 'Engine status could not be loaded.'));
  }, [refreshHistory]);

  const engines = status?.engines || null;
  const externalConfigured = engines?.find((row) => row.id === 'plagiarism')?.configured === true;
  const detectorConfigured = engines?.find((row) => row.id === 'ai_detection')?.configured === true;

  const handleAnalyze = async (draft) => {
    setBusy(true);
    setError('');
    try {
      const data = await runAnalysis(draft);
      setAnalysis(data);
      refreshHistory();
    } catch (caught) {
      setError(caught.message || 'The analysis could not be completed.');
    } finally {
      setBusy(false);
    }
  };

  const handleOpen = async (id) => {
    if (analysis?.record?.id === id) return;
    setBusy(true);
    setError('');
    try {
      setAnalysis(await loadAnalysis(id));
    } catch (caught) {
      setError(caught.message || 'That analysis could not be opened.');
    } finally {
      setBusy(false);
    }
  };

  const handleRefresh = async () => {
    if (!analysis?.record?.id) return;
    setError('');
    try {
      setAnalysis(await refreshAnalysis(analysis.record.id));
    } catch (caught) {
      setError(caught.message || 'The report could not be refreshed.');
    }
  };

  return (
    <div>
      <PageTitle
        eyebrow="Academic integrity"
        title="Academic Integrity"
        description="External similarity, internal similarity and AI-writing detection reported separately, with the provider and status of each."
        meta={[
          externalConfigured ? 'External similarity · configured' : 'External similarity · engine not configured',
          'Internal similarity · supplementary',
          detectorConfigured ? 'AI detection · configured' : 'AI detection · engine not configured',
          'Private to your account',
        ]}
      />

      <AnalysisCards engines={engines} />

      <Surface
        title="Detection engines"
        subtitle="Which engines are actually wired to a provider. Nothing here substitutes a language model for a detector."
      >
        <EngineStatusPanel status={status} error={statusError} />
      </Surface>

      <Surface
        className="mt-4"
        title="Analyse a submission"
        subtitle="Nothing is analysed until you press Analyse. The text is stored with the report so it can be reproduced."
      >
        <AnalysisForm onAnalyze={handleAnalyze} busy={busy} error={error} engines={engines} />
      </Surface>

      {analysis?.record && (
        <div className="mt-4">
          <IntegrityReport
            record={analysis.record}
            passages={analysis.passages}
            onRefresh={handleRefresh}
            busy={busy}
          />
        </div>
      )}

      <Surface
        className="mt-4"
        title="Previous analyses"
        subtitle="Stored for your account only, and used as the internal comparison set for the next submission"
      >
        <HistoryList
          items={history}
          onOpen={handleOpen}
          busy={busy}
          activeId={analysis?.record?.id}
          error={historyError}
        />
      </Surface>
    </div>
  );
}