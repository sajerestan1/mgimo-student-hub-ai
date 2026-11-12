import { useCallback, useEffect, useState } from 'react';
import PageTitle from '@/components/shell/PageTitle';
import Surface from '@/components/shell/Surface';
import AnalysisCards from '@/components/integrity/AnalysisCards';
import AnalysisForm from '@/components/integrity/AnalysisForm';
import EngineStatusPanel from '@/components/integrity/EngineStatusPanel';
import IntegrityReport from '@/components/integrity/IntegrityReport';
import HistoryList from '@/components/integrity/HistoryList';
import { loadAnalysis, loadEngineStatus, loadHistory, refreshAnalysis, runAnalysis } from '@/lib/integrity/api';
import { useI18n } from '@/i18n/I18nProvider';

/**
 * Academic Integrity: an isolated workspace reporting three separate
 * measurements — external provider similarity, internal similarity, and
 * dedicated AI-writing detection. It reads and writes only its own entity and
 * touches no academic record, grade or existing workspace module.
 */
export default function AcademicIntegrityPage() {
  const { t } = useI18n();
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
      .catch((caught) => setHistoryError(caught.message || t('integrity.form.errorHistory')));
  }, [t]);

  useEffect(() => {
    refreshHistory();
    loadEngineStatus()
      .then((data) => {
        setStatus(data);
        setStatusError('');
      })
      .catch((caught) => setStatusError(caught.message || t('integrity.form.errorStatus')));
  }, [refreshHistory, t]);

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
      setError(caught.message || t('integrity.form.errorAnalyze'));
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
      setError(caught.message || t('integrity.form.errorOpen'));
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
      setError(caught.message || t('integrity.form.errorRefresh'));
    }
  };

  return (
    <div>
      <PageTitle
        eyebrow={t('integrity.eyebrow')}
        title={t('integrity.title')}
        description={t('integrity.description')}
        meta={[
          externalConfigured ? t('integrity.meta.externalOn') : t('integrity.meta.externalOff'),
          t('integrity.meta.internal'),
          detectorConfigured ? t('integrity.meta.detectionOn') : t('integrity.meta.detectionOff'),
          t('integrity.meta.private'),
        ]}
      />

      <AnalysisCards engines={engines} />

      <Surface title={t('integrity.engines.title')} subtitle={t('integrity.engines.subtitle')}>
        <EngineStatusPanel status={status} error={statusError} />
      </Surface>

      <Surface className="mt-4" title={t('integrity.form.title')} subtitle={t('integrity.form.subtitle')}>
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

      <Surface className="mt-4" title={t('integrity.history.title')} subtitle={t('integrity.history.subtitle')}>
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