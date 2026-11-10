import { useCallback, useEffect, useState } from 'react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import AnalysisCards from '@/components/integrity/AnalysisCards';
import AnalysisForm from '@/components/integrity/AnalysisForm';
import IntegrityReport from '@/components/integrity/IntegrityReport';
import HistoryList from '@/components/integrity/HistoryList';
import { loadAnalysis, loadHistory, runAnalysis } from '@/lib/integrity/api';

/**
 * Academic Integrity: an isolated workspace for internal similarity analysis and
 * an optional language-model screening pass. It reads and writes only its own
 * entity, and touches no academic record, grade or existing workspace module.
 */
export default function AcademicIntegrityPage() {
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
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
  }, [refreshHistory]);

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

  return (
    <div>
      <PageTitle
        eyebrow="Academic integrity"
        title="Academic Integrity"
        description="Similarity analysis and AI-writing indicators for academic submissions."
        meta={[
          'Internal similarity check',
          'AI-writing screening prototype',
          'Private to your account',
        ]}
      />

      <AnalysisCards />

      <Surface
        title="Analyse a submission"
        subtitle="Nothing is analysed until you press Analyse. The text is stored with the report so it can be reproduced."
      >
        <AnalysisForm onAnalyze={handleAnalyze} busy={busy} error={error} />
      </Surface>

      {analysis?.record && (
        <div className="mt-4">
          <IntegrityReport record={analysis.record} passages={analysis.passages} />
        </div>
      )}

      <Surface
        className="mt-4"
        title="Previous analyses"
        subtitle="Stored for your account only, and used as the comparison set for the next submission"
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