import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { openPrivateFile } from '@/lib/studentCourses';
import {
  openTranslation,
  inspectMaterial,
  translateBatch,
  saveTargetPreference,
  resolveInitialTarget,
  dirFor,
} from '@/lib/materialTranslation';
import { alignPanels, scrollToSection, documentText, downloadTextFile } from '@/lib/readerSync';
import ReaderHeader from './ReaderHeader';
import ReaderToolbar from './ReaderToolbar';
import TranslationStatusBanner from './TranslationStatusBanner';
import DocumentPanel from './DocumentPanel';
import BilingualStack from './BilingualStack';
import ReaderLanguageBar from './ReaderLanguageBar';

const slug = (value) =>
  String(value || 'material')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);

// Full-screen bilingual document reader. The original and the translation are
// separate stored records: nothing here edits the professor's material.
export default function MaterialReader({ resource, onClose }) {
  const { language } = useI18n();
  // No target is assumed: it is resolved from the student's saved choice, the
  // interface language and the material's own detected language, and the
  // student confirms it before any translation is requested.
  const [target, setTarget] = useState('');
  const [sourceOverride, setSourceOverride] = useState('');
  const [meta, setMeta] = useState(null);
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState('both');
  const [sync, setSync] = useState(true);
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [split, setSplit] = useState(52);

  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const stackRef = useRef(null);
  const gridRef = useRef(null);
  const lock = useRef(false);
  const dragging = useRef(false);
  const cancelled = useRef(false);

  // Each round translates a bounded batch of chunks on the server. Finished
  // sections are painted as soon as the round returns, and a round that saved
  // nothing stops the loop instead of retrying the same work forever.
  const run = useCallback(async (start) => {
    let current = start;
    for (let round = 0; round < 14; round += 1) {
      if (cancelled.current || !current?.id) return;
      if (!['pending', 'translating'].includes(current.status)) {
        // Nothing left to generate (a cached or completed translation): stop
        // cleanly instead of leaving the reader marked as busy.
        setBusy(false);
        return;
      }
      setBusy(true);
      const before = current.progress?.translated_sections ?? 0;
      try {
        current = await translateBatch(current.id);
      } catch (caught) {
        if (!cancelled.current) setError(caught.message || 'The translation could not be completed.');
        setBusy(false);
        return;
      }
      if (cancelled.current) return;
      setData((previous) => ({ ...previous, ...current }));
      if (current.done) break;
      const after = current.progress?.translated_sections ?? 0;
      if (after <= before) {
        setError(current.error || 'Some sections could not be translated. The rest of the document is saved.');
        break;
      }
    }
    setBusy(false);
  }, []);

  // Opening a material only inspects it: the source language is detected and the
  // languages already cached are listed. Nothing is created or translated yet.
  useEffect(() => {
    if (!resource?.id) return undefined;
    cancelled.current = false;
    setLoading(true);
    setStarted(false);
    setError('');
    setData(null);
    setMeta(null);
    setSourceOverride('');
    setActiveId('');
    setSearch('');

    (async () => {
      try {
        const info = await inspectMaterial(resource.id);
        if (cancelled.current) return;
        setMeta(info);
        setLoading(false);
        if (info.status !== 'ready') return;

        const initial = resolveInitialTarget({
          preferred: info.preferred_target,
          interfaceLanguage: language,
          source: info.source_language,
        });
        setTarget(initial);
        // An existing translation for that language is shown at once; a language
        // that has none waits for the student to press Translate.
        if ((info.cached_languages || []).includes(initial) && initial !== info.source_language) {
          setStarted(true);
        }
      } catch (caught) {
        if (cancelled.current) return;
        setError(caught.message || 'This material could not be opened.');
        setLoading(false);
      }
    })();

    return () => {
      cancelled.current = true;
    };
  }, [resource?.id]);

  const sourceResolved = sourceOverride || meta?.source_language || '';
  const sourceKnown = Boolean(sourceResolved);
  const sameLanguage = sourceKnown && sourceResolved === target;

  // One target language at a time: every switch opens that language's own record,
  // so a cached translation is reused and no other language's text is shown.
  useEffect(() => {
    if (!started || !target || !resource?.id || sameLanguage) return undefined;
    cancelled.current = false;
    setBusy(true);

    (async () => {
      try {
        const opened = await openTranslation(resource.id, target, sourceOverride);
        if (cancelled.current) return;
        setData(opened);
        await run(opened);
      } catch (caught) {
        if (cancelled.current) return;
        setError(caught.message || 'This material could not be translated.');
        setBusy(false);
      }
    })();

    return () => {
      cancelled.current = true;
    };
  }, [started, target, resource?.id, reloadKey, sourceOverride, sameLanguage]);

  // This component is mounted for the whole life of the course page, so the
  // document scroll lock must exist only while a material is actually open.
  // Locking unconditionally froze the page's own scrolling on every visit.
  const open = Boolean(resource?.id);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event) => {
      if (event.key === 'Escape') closeRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    const move = (event) => {
      if (!dragging.current || !gridRef.current) return;
      const bounds = gridRef.current.getBoundingClientRect();
      const next = ((event.clientX - bounds.left) / bounds.width) * 100;
      setSplit(Math.min(72, Math.max(28, next)));
    };
    const stop = () => {
      dragging.current = false;
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
    };
  }, []);

  if (!resource) return null;

  const cachedLanguages = meta?.cached_languages || [];
  const canTranslate = sourceKnown && Boolean(target) && !sameLanguage;
  const sections = data?.sections || [];
  const term = search.trim();
  const visible = term
    ? sections.filter((section) =>
        [section.heading, section.original, section.translated_heading, section.translated]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(term.toLowerCase())
      )
    : sections;
  const translatedCount = sections.filter((section) => section.translated || section.translated_heading).length;

  const handleScroll = (side) => () => {
    if (!sync || lock.current || mode !== 'both') return;
    lock.current = true;
    alignPanels(side === 'left' ? leftRef.current : rightRef.current, side === 'left' ? rightRef.current : leftRef.current);
    window.setTimeout(() => {
      lock.current = false;
    }, 110);
  };

  const selectSection = (id, origin) => {
    setActiveId(id);
    if (!sync) return;
    const targetPanel = origin === 'left' ? rightRef.current : leftRef.current;
    if (mode === 'both' && targetPanel) scrollToSection(targetPanel, id, 8);
  };

  const jumpTo = (id) => {
    setActiveId(id);
    scrollToSection(leftRef.current, id, 8);
    scrollToSection(rightRef.current, id, 8);
    scrollToSection(stackRef.current, id, 8);
  };

  // An explicit choice by the student becomes their saved reader default.
  const chooseTarget = (code) => {
    setTarget(code);
    saveTargetPreference(code);
    if (started) {
      setData(null);
      if (code === sourceResolved) setStarted(false);
    }
  };

  const chooseSource = (code) => {
    setSourceOverride(code);
    setData(null);
    setStarted(false);
    if (code === target) {
      setTarget(
        resolveInitialTarget({
          preferred: meta?.preferred_target,
          interfaceLanguage: language,
          source: code,
        })
      );
    }
  };

  const startTranslation = () => {
    if (!canTranslate) return;
    setStarted(true);
  };

  const regenerate = async () => {
    if (!data?.id) return;
    setError('');
    setBusy(true);
    try {
      // A failed or interrupted document resumes only the missing sections; only a
      // changed source restarts the whole translation.
      const refreshed = await translateBatch(data.id, data.status === 'outdated');
      setData((previous) => ({ ...previous, ...refreshed }));
      await run(refreshed);
    } catch (caught) {
      setError(caught.message || 'The translation could not be restarted.');
      setBusy(false);
    }
  };

  const downloadOriginal = async () => {
    const materialInfo = data?.material || meta?.material;
    if (materialInfo?.file_url) {
      await openPrivateFile(materialInfo.file_url);
      return;
    }
    downloadTextFile(`${slug(materialInfo?.resource_title)}-original.md`, documentText(sections, 'original'));
  };

  const downloadTranslation = () => {
    downloadTextFile(
      `${slug(data?.material?.resource_title)}-${target}.md`,
      documentText(sections, 'translation')
    );
  };

  const emptyLabel = term ? 'No section matches this search.' : 'This material has no text to display.';
  const status = data?.status || 'pending';
  const bilingual = mode === 'both';

  // 100dvh, not the layout viewport: with `inset-0` alone the panel was taller than
  // the visible area on mobile browsers, so the last sections sat below the screen.
  return (
    <div
      className="fixed inset-0 z-50 flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-canvas"
      role="dialog"
      aria-modal="true"
      aria-label="Course material translation reader"
    >
      <ReaderHeader
        material={data?.material || meta?.material}
        status={data ? status : 'idle'}
        source={sourceResolved}
        target={target}
        onClose={onClose}
        onDownloadOriginal={downloadOriginal}
        onDownloadTranslation={downloadTranslation}
        canDownloadTranslation={translatedCount > 0}
      />

      {meta?.status === 'ready' && (
        <ReaderLanguageBar
          source={sourceResolved}
          sourceDetection={meta?.source_detection}
          sourceKnown={sourceKnown}
          sameLanguage={sameLanguage}
          target={target}
          onSource={chooseSource}
          onTarget={chooseTarget}
          started={started}
          busy={busy}
          canTranslate={canTranslate}
          onTranslate={startTranslation}
          cachedLanguages={cachedLanguages}
          complete={data?.status === 'complete'}
          percent={data?.progress?.percent ?? 0}
        />
      )}

      <ReaderToolbar
        mode={mode}
        onMode={setMode}
        sync={sync}
        onSync={() => setSync((value) => !value)}
        search={search}
        onSearch={setSearch}
        matchCount={term ? visible.length : sections.length}
        onClose={onClose}
      />

      {data && (
        <TranslationStatusBanner
          status={status}
          totalSections={data.progress?.total_sections ?? sections.length}
          translatedSections={data.progress?.translated_sections ?? translatedCount}
          failedSections={status === 'failed' ? data.progress?.pending_sections ?? 0 : 0}
          error={data.error || error}
          note={data.note}
          busy={busy}
          onRegenerate={regenerate}
        />
      )}

      {sections.length > 0 && (
        <nav className="no-scrollbar flex items-center gap-1 overflow-x-auto border-b border-line bg-white px-3 py-1.5 sm:px-5" aria-label="Document sections">
          <span className="me-1 shrink-0 text-[12px] uppercase tracking-[0.06em] text-mutedink">Sections</span>
          {sections.map((section) => (
            <button
              key={`nav-${section.id}`}
              type="button"
              onClick={() => jumpTo(section.id)}
              aria-current={activeId === section.id ? 'true' : 'undefined'}
              className={`shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[12px] transition-colors ${
                activeId === section.id ? 'bg-navy text-white' : 'text-mutedink hover:bg-canvas hover:text-ink'
              }`}
            >
              {section.id}
            </button>
          ))}
        </nav>
      )}

      {loading && (
        <div className="flex flex-1 items-center justify-center gap-2 text-[14px] text-mutedink">
          <Loader2 className="h-4 w-4 animate-spin" /> Preparing document…
        </div>
      )}

      {!loading && !data && !error && started && (
        <div className="flex flex-1 items-center justify-center gap-2 text-[14px] text-mutedink">
          <Loader2 className="h-4 w-4 animate-spin" /> Extracting document…
        </div>
      )}

      {!loading && error && !data && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <AlertCircle className="h-6 w-6 text-critical" />
          <p className="max-w-md text-[15px] text-ink">{error}</p>
          <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="btn-quiet btn-sm">
            Try again
          </button>
        </div>
      )}

      {!loading && (data?.status === 'unsupported' || meta?.status === 'unsupported') && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <AlertCircle className="h-6 w-6 text-mutedink" />
          <p className="max-w-md text-[15px] leading-relaxed text-ink">
            {data?.note || meta?.note || 'This material cannot be read as text, so no translation can be produced.'}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={downloadOriginal} className="btn-primary btn-sm">
              Download the original
            </button>
            <button type="button" onClick={onClose} className="btn-quiet btn-sm">
              Back to course workspace
            </button>
          </div>
        </div>
      )}

      {!loading && data && status !== 'unsupported' && (
        <>
          {/* Desktop: two independently readable panels with a draggable divider */}
          <div ref={gridRef} className="hidden min-h-0 flex-1 lg:flex">
            {mode !== 'translation' && (
              <div
                className="min-w-0 border-e border-line"
                style={{ flexBasis: bilingual ? `${split}%` : '100%', flexGrow: 0, flexShrink: 0, width: bilingual ? undefined : '100%' }}
              >
                <DocumentPanel
                  side="original"
                  language={data.source_language}
                  direction={dirFor(data.source_language)}
                  sections={visible}
                  activeId={activeId}
                  onSelect={selectSection}
                  containerRef={leftRef}
                  onScroll={handleScroll('left')}
                  search={term}
                  emptyLabel={emptyLabel}
                  pendingLabel="Awaiting translation"
                />
              </div>
            )}

            {bilingual && (
              <div
                role="separator"
                aria-orientation="vertical"
                aria-label="Resize panels"
                onPointerDown={() => {
                  dragging.current = true;
                }}
                className="w-1 shrink-0 cursor-col-resize bg-line/70 transition-colors hover:bg-brand/40"
              />
            )}

            {mode !== 'original' && (
              <div className="min-w-0 flex-1">
                <DocumentPanel
                  side="translation"
                  language={target}
                  direction={dirFor(target)}
                  sections={visible}
                  activeId={activeId}
                  onSelect={selectSection}
                  containerRef={rightRef}
                  onScroll={handleScroll('right')}
                  search={term}
                  emptyLabel={emptyLabel}
                  pendingLabel="Awaiting translation"
                />
              </div>
            )}
          </div>

          {/* Mobile and tablet: one readable column at a time, or a stacked
              bilingual view. Two columns never appear below 1024px. */}
          <div ref={stackRef} className="scroll-thin min-h-0 flex-1 overflow-y-auto lg:hidden">
            {mode === 'original' && (
              <DocumentPanel
                side="original"
                language={data.source_language}
                direction={dirFor(data.source_language)}
                sections={visible}
                activeId={activeId}
                onSelect={selectSection}
                containerRef={null}
                onScroll={undefined}
                search={term}
                emptyLabel={emptyLabel}
                pendingLabel="Awaiting translation"
                embedded
              />
            )}
            {mode === 'translation' && (
              <DocumentPanel
                side="translation"
                language={target}
                direction={dirFor(target)}
                sections={visible}
                activeId={activeId}
                onSelect={selectSection}
                containerRef={null}
                onScroll={undefined}
                search={term}
                emptyLabel={emptyLabel}
                pendingLabel="Awaiting translation"
                embedded
              />
            )}
            {bilingual && (
              <BilingualStack
                sections={visible}
                target={target}
                source={data.source_language || sourceResolved || 'en'}
                activeId={activeId}
                onSelect={selectSection}
                emptyLabel={emptyLabel}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}