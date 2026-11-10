import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { resolveAcademicIdentity } from '../../shared/student/academicIdentity.ts';

const list = (page) => (Array.isArray(page) ? page : page?.items || []);

const LANGUAGES = {
  en: 'English',
  ru: 'Russian',
  fr: 'French',
  zh: 'Chinese (Simplified)',
  ar: 'Arabic',
};

const SUPPORTED = Object.keys(LANGUAGES);
const normalise = (value) => String(value || '').trim().toLowerCase().split('-')[0];
const isSupported = (value) => SUPPORTED.includes(value);
const languageName = (code) => LANGUAGES[code] || 'the requested language';

const STAFF_ROLES = ['admin', 'dean', 'deputy_dean', 'academic_staff'];
// Smaller chunks keep every request short and let several of them run at once.
// Four sections per chunk keeps a heading with the text it introduces, and the
// character cap keeps a table or a long paragraph inside one request.
const MAX_CHUNK_CHARS = 1800;
const MAX_CHUNK_SECTIONS = 4;
const CHUNK_CONCURRENCY = 3;
const MAX_ATTEMPTS = 2;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    sections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          translated_heading: { type: 'string' },
          translated: { type: 'string' },
        },
        required: ['id', 'translated'],
      },
    },
  },
  required: ['sections'],
};

const EXTRACT_SCHEMA = {
  type: 'object',
  properties: {
    sections: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          heading: { type: 'string' },
          text: { type: 'string' },
        },
        required: ['text'],
      },
    },
  },
  required: ['sections'],
};

// ── Small deterministic helpers ────────────────────────────────────────────

const checksum = (text) => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `${hash.toString(16).padStart(8, '0')}-${text.length}`;
};

// One definition of "this section is finished", used for chunk selection, for
// progress and for completion. A heading-only section carries its translation in
// translated_heading, so checking `translated` alone left the first chunk pending
// forever and every request re-translated work that was already stored.
const isTranslated = (section) =>
  Boolean(String(section?.translated || '').trim() || String(section?.translated_heading || '').trim());

// Language detection from the extracted text itself. Script evidence decides
// Arabic, Chinese and Russian outright; Latin text is scored on frequent words
// so French is not confused with English. Anything inconclusive is reported as
// undetermined instead of being assumed to be English.
const LATIN_MARKERS = {
  en: ['the', 'and', 'of', 'to', 'is', 'that', 'for', 'with', 'this', 'are', 'from', 'which', 'not', 'you', 'was', 'on', 'as', 'by', 'be', 'it', 'at', 'or', 'an'],
  fr: ['le', 'la', 'les', 'des', 'du', 'et', 'est', 'pour', 'dans', 'que', 'une', 'un', 'pas', 'sur', 'avec', 'ce', 'cette', 'sont', 'au', 'aux', 'qui', 'par', 'plus', 'vous', 'nous', 'être'],
};

const detectLanguage = (text) => {
  const sample = String(text || '').slice(0, 4000).toLowerCase();
  const letters = (sample.match(/\p{L}/gu) || []).length;
  if (!letters) return { language: null, confidence: 0 };

  const scripts = [
    ['ar', /[\u0600-\u06FF\u0750-\u077F]/gu],
    ['zh', /[\u3040-\u30FF\u4E00-\u9FFF]/gu],
    ['ru', /[\u0400-\u04FF]/gu],
  ];
  for (const [code, pattern] of scripts) {
    const hits = (sample.match(pattern) || []).length;
    if (hits / letters >= 0.2) return { language: code, confidence: Math.min(0.95, 0.6 + hits / letters) };
  }

  const words = sample.replace(/[^\p{L}\s'-]/gu, ' ').split(/\s+/).filter(Boolean);
  const scores = { en: 0, fr: 0 };
  words.forEach((word) => {
    Object.entries(LATIN_MARKERS).forEach(([code, markers]) => {
      if (markers.includes(word)) scores[code] += 1;
    });
  });
  if ((sample.match(/[àâçéèêëîïôùûüÿœ]/g) || []).length >= 3) scores.fr += 3;

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (ranked[0][1] >= 3 && ranked[0][1] >= ranked[1][1] * 1.5) {
    return { language: ranked[0][0], confidence: 0.75 };
  }
  return { language: null, confidence: 0 };
};

// Splits markdown/plain text into stable, numbered sections. Headings, lists,
// tables, quotations and paragraphs each keep their own kind, and a heading keeps
// its depth and travels with the text it introduces, so the reader can rebuild
// the document structure instead of flattening it into one blob.
function sectionize(text) {
  const lines = String(text).replace(/\r\n/g, '\n').split('\n');
  const sections = [];
  let buffer = [];
  let kind = 'paragraph';
  let heading = '';
  let level = 0;

  const push = (bodyKind, body) => {
    sections.push({
      id: `s${String(sections.length + 1).padStart(2, '0')}`,
      kind: bodyKind,
      level,
      heading,
      original: body,
      translated_heading: '',
      translated: '',
    });
    heading = '';
    level = 0;
  };

  const flushBody = () => {
    const body = buffer.join('\n').trim();
    const bodyKind = kind;
    buffer = [];
    kind = 'paragraph';
    if (body) push(bodyKind, body);
  };

  lines.forEach((raw) => {
    const line = raw.replace(/\s+$/, '');
    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
    if (headingMatch) {
      flushBody();
      // A heading that never received text of its own stays its own section.
      if (heading) push('heading', '');
      heading = headingMatch[2].trim();
      level = headingMatch[1].length;
      return;
    }
    if (!line.trim()) {
      flushBody();
      return;
    }
    const isTable = /^\s*\|/.test(line);
    const isList = /^\s*([-*+]|\d+[.)])\s+/.test(line);
    const isQuote = /^\s*>/.test(line);
    const wanted = isTable ? 'table' : isList ? 'list' : isQuote ? 'quote' : 'paragraph';
    if (kind !== wanted) {
      flushBody();
      kind = wanted;
    }
    buffer.push(line.trim());
  });

  flushBody();
  if (heading) push('heading', '');
  return sections;
}

function buildChunks(sections) {
  const chunks = [];
  let current = [];
  let size = 0;
  sections.forEach((section) => {
    const length = section.original.length + (section.heading || '').length;
    if (current.length && (size + length > MAX_CHUNK_CHARS || current.length >= MAX_CHUNK_SECTIONS)) {
      chunks.push(current);
      current = [];
      size = 0;
    }
    current.push(section);
    size += length;
  });
  if (current.length) chunks.push(current);
  return chunks;
}

// ── Authorisation: resolved server-side, never from the browser ────────────

async function resolveProfessor(svc, user) {
  const linked = list(await svc.entities.Professor.filter({ user_id: user.id }, { limit: 2 }))[0];
  if (linked) return linked;
  const email = String(user.email || '').toLowerCase();
  if (!email) return null;
  return (
    list(await svc.entities.Professor.filter({ email: user.email }, { limit: 3 }))[0] ||
    list(await svc.entities.Professor.list('-created_date', 300)).find(
      (row) => String(row.email || '').toLowerCase() === email
    ) ||
    null
  );
}

async function enrolledCourseIds(svc, user) {
  const identity = await resolveAcademicIdentity(svc, user);
  const student = identity?.student || null;
  const ids = new Set();
  if (student?.id) {
    list(await svc.entities.CourseEnrollment.filter({ student_id: student.id }, { limit: 400 })).forEach((row) =>
      ids.add(row.course_id)
    );
  }
  list(await svc.entities.CourseEnrollment.filter({ student_user_id: user.id }, { limit: 400 })).forEach((row) =>
    ids.add(row.course_id)
  );
  return { student, courseIds: ids };
}

async function authoriseMaterial(svc, user, resource) {
  if (!resource) return { allowed: false, reason: 'not_found' };
  const role = String(user.role || 'user').toLowerCase();
  const course = resource.course_id ? await svc.entities.Course.get(resource.course_id).catch(() => null) : null;

  if (STAFF_ROLES.includes(role)) return { allowed: true, role, course, scope: 'staff' };

  if (role === 'professor') {
    const professor = await resolveProfessor(svc, user);
    const owns =
      Boolean(professor) &&
      (course?.professor_id === professor.id || resource.professor_id === professor.id);
    return owns
      ? { allowed: true, role, course, scope: 'professor' }
      : { allowed: false, role, course, reason: 'not_your_course' };
  }

  if (course?.status !== 'published') return { allowed: false, role, course, reason: 'course_not_published' };
  if (resource.visible_to_students === false) return { allowed: false, role, course, reason: 'material_not_published' };

  const { student, courseIds } = await enrolledCourseIds(svc, user);
  if (!courseIds.has(resource.course_id)) return { allowed: false, role, course, reason: 'not_enrolled' };
  return { allowed: true, role, scope: 'student', course, student };
}

// ── Source extraction ─────────────────────────────────────────────────────

async function signedUrl(svc, uri) {
  if (!uri) return '';
  if (String(uri).startsWith('http')) return uri;
  const result = await svc.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 900 });
  return result?.signed_url || '';
}

// The uploaded file is only ever read. Nothing here writes to, moves or
// replaces the professor's material.
async function extractSource(svc, resource) {
  if (resource.content && resource.content.trim()) {
    return { format: 'markdown', text: resource.content, note: '' };
  }
  if (!resource.file_url) {
    return { format: 'unsupported', text: '', note: 'This material has no text recorded and no attached file.' };
  }

  const name = String(resource.file_name || resource.file_url || '').toLowerCase();
  const url = await signedUrl(svc, resource.file_url);
  if (!url) return { format: 'unsupported', text: '', note: 'The attached file could not be opened.' };

  if (/\.(txt|md|markdown)$/.test(name)) {
    const response = await fetch(url);
    if (!response.ok) return { format: 'unsupported', text: '', note: 'The text file could not be read.' };
    return { format: 'text', text: await response.text(), note: '' };
  }

  if (/\.(pdf|png|jpe?g|webp)$/.test(name)) {
    const extracted = await svc.integrations.Core.ExtractDataFromUploadedFile({
      file_url: url,
      json_schema: EXTRACT_SCHEMA,
    }).catch((error) => ({ status: 'error', details: error.message }));

    if (extracted?.status !== 'success') {
      return {
        format: 'unsupported',
        text: '',
        note: `Text could not be extracted from this file${
          extracted?.details ? ` (${String(extracted.details).slice(0, 160)})` : ''
        }.`,
      };
    }

    const rows = extracted?.output?.sections || [];
    const text = rows
      .map((row) => `${row.heading ? `## ${row.heading}\n\n` : ''}${String(row.text || '').trim()}`)
      .filter(Boolean)
      .join('\n\n');
    if (!text.trim()) {
      return { format: 'unsupported', text: '', note: 'No readable text was found in this file.' };
    }
    return { format: /\.pdf$/.test(name) ? 'pdf' : 'image', text, note: '' };
  }

  if (/\.(pptx?|docx?)$/.test(name)) {
    return {
      format: 'unsupported',
      text: '',
      note: 'Slide and word files cannot be read faithfully here. Add the text as material content, or use the original file download.',
    };
  }

  return { format: 'unsupported', text: '', note: 'This file type cannot be read in the translation reader.' };
}

// ── Translation ───────────────────────────────────────────────────────────

function glossaryFrom(sections) {
  return sections
    .filter((section) => section.heading && section.translated)
    .slice(0, 12)
    .map((section) => `- ${section.heading} → ${section.translated.split('\n')[0].slice(0, 90)}`)
    .join('\n');
}

// Placeholder or fabricated output is rejected instead of being shown: the
// section then keeps its original text and reports that it was not translated.
const looksFabricated = (value) => {
  const text = String(value || '');
  if (!text) return false;
  return (
    /(^|[\s(])undefined([\s).,;:]|$)/i.test(text) ||
    /(^|[\s(])null([\s).,;:]|$)/i.test(text) ||
    /x{6,}/i.test(text) ||
    /(\S)\1{9,}/.test(text)
  );
};

async function translateSections(base44, sections, target, source, glossary) {
  const ids = sections.map((section) => section.id);
  const payload = sections.map((section) => ({
    id: section.id,
    kind: section.kind,
    heading: section.heading || '',
    text: section.original,
  }));

  const prompt = [
    `You are translating authoritative university course material into ${LANGUAGES[target]}.`,
    'Rules that must be followed exactly:',
    '- Return every id you were given, once each, in the same order. Never merge, split, shorten, summarise or add sections.',
    '- Translate academic meaning with the standard terminology of the discipline, and keep terminology consistent across the whole document.',
    '- Preserve equations, mathematical symbols, chemical formulas, citation markers, reference numbers, URLs, e-mail addresses, course codes and all numerals unchanged.',
    '- Keep personal names, institution names and titles of published works in their original form; transliterate only where the target script requires it.',
    '- Return "translated_heading" with the translated heading and "translated" with the translated text only — never repeat the heading inside the text.',
    '- When a section has a non-empty "heading", "translated_heading" must also be non-empty: never leave a heading in the source language. When a section has no heading, return "".',
    '- Keep the document formatting of each section exactly: retain Markdown emphasis (**bold**, *italic*), bullet and numbered list markers, "|" table rows and ">" quotations in the translated text, translating the words and never the markers.',
    '- Keep the paragraph breaks of the section: do not merge separate paragraphs and do not break one paragraph into fragments.',
    '- Never produce filler or placeholder output: no repeated letters (such as "xxxxxx"), no "undefined", no "null", no empty section. If a word has no equivalent, translate it or keep it as it is.',
    '- Do not translate the id or kind values, and do not add commentary or notes.',
    `- Every returned text must be written in ${languageName(target)}. Never return a section unchanged in its source language.`,
    `- The source language is ${LANGUAGES[source] || 'not stated'}. Translate into ${LANGUAGES[target]} even where the source mixes languages.`,
    glossary ? `- Terminology already established in this document, keep it:\n${glossary}` : '',
    '',
    'Sections:',
    JSON.stringify(payload, null, 1),
  ]
    .filter(Boolean)
    .join('\n');

  let lastError = '';
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const corrective =
      attempt > 1 && lastError
        ? `\n\nYour previous reply was rejected: ${lastError}. Return every id, and translate every heading into translated_heading.`
        : '';
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: prompt + corrective,
      response_json_schema: RESPONSE_SCHEMA,
    }).catch((error) => {
      lastError = error.message;
      return null;
    });

    const rows = response?.sections || [];
    const translations = new Map();
    rows.forEach((row) => {
      if (row && typeof row.id === 'string' && typeof row.translated === 'string') {
        const heading = typeof row.translated_heading === 'string' ? row.translated_heading : '';
        if (row.translated.trim() || heading.trim()) translations.set(row.id, { text: row.translated, heading });
      }
    });

    // A section is only accepted when its text arrived, when it carries a heading
    // the heading was translated too, and when the output is real text rather than
    // placeholder markers. This is what prevents a silently half-translated or
    // fabricated document from being stored.
    const incomplete = sections
      .filter((section) => {
        const entry = translations.get(section.id);
        if (!entry) return true;
        if (!entry.text.trim() && !entry.heading.trim()) return true;
        if (looksFabricated(entry.text) || looksFabricated(entry.heading)) return true;
        return Boolean(section.heading) && Boolean(section.original.trim()) && !entry.heading.trim();
      })
      .map((section) => section.id);

    if (!incomplete.length) return { ok: true, translations };
    lastError = `The response was incomplete for ${incomplete.length} section(s): ${incomplete.slice(0, 4).join(', ')}`;
  }

  return { ok: false, error: lastError || 'The translation service returned nothing.' };
}

// ── Handler ───────────────────────────────────────────────────────────────

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me().catch((error) => (error.status === 401 ? null : Promise.reject(error)));
    if (!caller) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await req.json().catch(() => ({}));
    const action = String(payload.action || 'open');
    const svc = base44.asServiceRole;

    // The target is never guessed and never replaced with English: the caller
    // must name one of the supported languages.
    const requestedTarget = normalise(payload.target_language);
    const targetLanguage = isSupported(requestedTarget) ? requestedTarget : '';
    const requestedSource = normalise(payload.source_language);
    const sourceOverride = isSupported(requestedSource) ? requestedSource : '';

    let record = null;
    let resource = null;

    if (payload.translation_id) {
      record = await svc.entities.MaterialTranslation.get(payload.translation_id).catch(() => null);
      if (!record) return Response.json({ error: 'Translation not found' }, { status: 404 });
      resource = await svc.entities.LearningResource.get(record.resource_id).catch(() => null);
    } else {
      if (!payload.resource_id) return Response.json({ error: 'resource_id is required' }, { status: 400 });
      resource = await svc.entities.LearningResource.get(payload.resource_id).catch(() => null);
    }

    const access = await authoriseMaterial(svc, caller, resource);
    if (!access.allowed) {
      return Response.json(
        {
          error: 'You do not have access to this material.',
          reason: access.reason,
        },
        { status: 403 }
      );
    }

    const material = {
      resource_id: resource.id,
      course_id: resource.course_id,
      resource_title: resource.title,
      course_code: resource.course_code || access.course?.code || '',
      file_url: resource.file_url || '',
      file_name: resource.file_name || '',
      type: resource.type,
      description: resource.description || '',
      scope: access.scope,
    };

    // ── inspect: extract and detect the source language, list what is already
    // cached, and let the student choose the target before anything is created.
    if (action === 'inspect') {
      const source = await extractSource(svc, resource);
      if (!source.text) {
        return Response.json({
          material,
          status: 'unsupported',
          note: source.note,
          cached_languages: [],
        });
      }

      const detected = detectLanguage(source.text);
      const sourceLanguage = sourceOverride || detected.language || '';
      const stamp = checksum(source.text);
      const rows = list(
        await svc.entities.MaterialTranslation.filter({ resource_id: resource.id }, { limit: 40 })
      );
      const cachedLanguages = [
        ...new Set(
          rows
            .filter(
              (row) =>
                row.status === 'complete' &&
                row.source_checksum === stamp &&
                isSupported(row.target_language) &&
                row.target_language !== sourceLanguage
            )
            .map((row) => row.target_language)
        ),
      ];
      const preferred = normalise(access.student?.preferences?.translation_target);

      return Response.json({
        material,
        status: 'ready',
        source_language: sourceLanguage,
        source_confidence: sourceLanguage ? (sourceOverride ? 1 : detected.confidence) : 0,
        source_detection: sourceOverride ? 'manual' : detected.language ? 'detected' : 'undetermined',
        source_format: source.format,
        preferred_target: isSupported(preferred) ? preferred : '',
        cached_languages: cachedLanguages,
      });
    }

    // ── preference: the student's explicit choice becomes their saved default.
    if (action === 'preference') {
      if (!targetLanguage) {
        return Response.json(
          { error: 'Choose one of the supported languages.', reason: 'target_required' },
          { status: 400 }
        );
      }
      if (!access.student?.id) return Response.json({ saved: false, reason: 'no_student_profile' });
      const profile = await svc.entities.StudentProfile.get(access.student.id).catch(() => null);
      if (!profile) return Response.json({ saved: false, reason: 'no_student_profile' });
      await svc.entities.StudentProfile.update(profile.id, {
        preferences: { ...(profile.preferences || {}), translation_target: targetLanguage },
      });
      return Response.json({ saved: true, preferred_target: targetLanguage });
    }

    // ── open: extract, align, and serve the cached translation when it is current
    if (action === 'open') {
      const source = await extractSource(svc, resource);
      if (!source.text) {
        return Response.json({
          material,
          status: 'unsupported',
          sections: [],
          note: source.note,
          target_language: targetLanguage,
        });
      }

      if (!targetLanguage) {
        return Response.json(
          { error: 'Choose the language to translate into.', reason: 'target_required', material },
          { status: 400 }
        );
      }

      const detected = detectLanguage(source.text);
      const sourceLanguage = sourceOverride || detected.language || '';

      if (!sourceLanguage) {
        return Response.json(
          {
            error: 'Confirm the language of the original material before translating it.',
            reason: 'source_required',
            material,
          },
          { status: 400 }
        );
      }

      // The same language is never sent to the model: an English document is not
      // "translated into English".
      if (sourceLanguage === targetLanguage) {
        return Response.json({
          material,
          status: 'same_language',
          source_language: sourceLanguage,
          target_language: targetLanguage,
          source_detection: sourceOverride ? 'manual' : 'detected',
          note: `The original material is already in ${LANGUAGES[targetLanguage]}. Please select another language.`,
        });
      }

      const sections = sectionize(source.text);
      const stamp = checksum(source.text);
      const existing = list(
        await svc.entities.MaterialTranslation.filter(
          { resource_id: resource.id, target_language: targetLanguage },
          { sort: '-updated_date', limit: 6 }
        )
      );
      const current = existing.find((row) => row.source_checksum === stamp);

      if (current && current.status === 'complete') {
        return Response.json({ material, cached: true, ...current });
      }
      if (current) return Response.json({ material, cached: true, ...current });

      if (existing.length) {
        // The material changed: the old translation stays readable nowhere and is
        // marked outdated, but the original sections are refreshed so the reader
        // can show the new source immediately.
        const stale = existing[0];
        const chunks = buildChunks(sections);
        const updated = await svc.entities.MaterialTranslation.update(stale.id, {
          source_checksum: stamp,
          source_format: source.format,
          source_language: sourceLanguage,
          sections,
          status: 'outdated',
          chunk_total: chunks.length,
          chunk_done: 0,
          attempts: 0,
          error: 'The material changed since this translation was made.',
          translated_at: '',
        });
        return Response.json({ material, cached: false, outdated: true, ...updated });
      }

      const chunks = buildChunks(sections);
      const created = await svc.entities.MaterialTranslation.create({
        resource_id: resource.id,
        course_id: resource.course_id || '',
        resource_title: resource.title,
        course_code: material.course_code,
        source_checksum: stamp,
        source_format: source.format,
        source_language: sourceLanguage,
        target_language: targetLanguage,
        sections,
        status: 'pending',
        chunk_total: chunks.length,
        chunk_done: 0,
        attempts: 0,
        provider: 'base44',
        model: 'automatic',
      });
      return Response.json({ material, cached: false, ...created });
    }

    // ── translate: a bounded batch of chunks per call. Independent chunks run
    // concurrently, every finished section is persisted before the response, and a
    // failed chunk is retried on its own instead of failing the whole document.
    if (action === 'translate') {
      if (!record) {
        return Response.json({ error: 'Open the material before translating it.' }, { status: 400 });
      }
      // The stored record decides which language is produced; it must be one of
      // the supported languages and must differ from the source.
      const recordTarget = normalise(record.target_language);
      if (!isSupported(recordTarget)) {
        return Response.json(
          { error: 'This translation has no valid target language.', reason: 'unsupported_target' },
          { status: 400 }
        );
      }
      const recordSource = normalise(record.source_language);
      if (recordSource && recordSource === recordTarget) {
        return Response.json({
          material,
          status: 'same_language',
          source_language: recordSource,
          target_language: recordTarget,
          note: `The original material is already in ${LANGUAGES[recordTarget]}. Please select another language.`,
        });
      }

      if (record.status === 'complete' && !payload.force) {
        return Response.json({ material, done: true, ...record });
      }

      // Only an explicit restart clears stored work. A retry after a failure keeps
      // every section that already succeeded and re-runs nothing else.
      if (payload.force) {
        record = await svc.entities.MaterialTranslation.update(record.id, {
          status: 'translating',
          attempts: 0,
          error: '',
          chunk_done: 0,
          sections: (record.sections || []).map((section) => ({
            ...section,
            translated: '',
            translated_heading: '',
          })),
        });
      }

      const sections = record.sections || [];
      const chunks = buildChunks(sections);
      const pending = chunks
        .map((_, index) => index)
        .filter((index) => chunks[index].some((section) => !isTranslated(section)));

      const progress = (rows) => {
        const done = rows.filter(isTranslated).length;
        return {
          total_sections: rows.length,
          translated_sections: done,
          pending_sections: rows.length - done,
          percent: rows.length ? Math.round((done / rows.length) * 100) : 0,
        };
      };

      if (!pending.length) {
        const completed = await svc.entities.MaterialTranslation.update(record.id, {
          status: 'complete',
          chunk_total: chunks.length,
          chunk_done: chunks.length,
          attempts: 0,
          error: '',
          translated_at: new Date().toISOString(),
        });
        return Response.json({ material, done: true, progress: progress(sections), ...completed });
      }

      const before = sections.filter(isTranslated).length;
      const batch = pending.slice(0, CHUNK_CONCURRENCY);
      const glossary = glossaryFrom(sections);
      const results = await Promise.all(
        batch.map((index) =>
          translateSections(
            base44,
            chunks[index].map((section) => ({ ...section, translated: '', translated_heading: '' })),
            recordTarget,
            recordSource || 'unknown',
            glossary
          ).catch((error) => ({ ok: false, error: error.message }))
        )
      );

      const translations = new Map();
      results.forEach((result) => {
        if (result.ok) result.translations.forEach((value, key) => translations.set(key, value));
      });

      const merged = sections.map((section) => {
        const entry = translations.get(section.id);
        return entry
          ? { ...section, translated: entry.text, translated_heading: entry.heading || section.translated_heading || '' }
          : section;
      });
      const byId = new Map(merged.map((section) => [section.id, section]));
      const translatedNow = merged.filter(isTranslated).length;
      const isComplete = merged.length > 0 && translatedNow === merged.length;
      const failures = results.filter((result) => !result.ok);
      // A round with no progress at all counts against the attempt budget; a round
      // that saved sections resets it. This stops a retry loop without discarding
      // any finished work.
      const progressed = translatedNow > before;
      const attempts = failures.length && !progressed ? (record.attempts || 0) + 1 : 0;
      const stopped = !isComplete && attempts >= MAX_ATTEMPTS;

      const updated = await svc.entities.MaterialTranslation.update(record.id, {
        sections: merged,
        chunk_total: chunks.length,
        chunk_done: chunks.filter((chunk) =>
          chunk.every((section) => isTranslated(byId.get(section.id) || section))
        ).length,
        status: isComplete ? 'complete' : stopped ? 'failed' : 'translating',
        attempts,
        error: isComplete
          ? ''
          : failures.length
            ? `${failures.length} part(s) of the material could not be translated (${failures[0].error || 'no response'}). Every finished section is saved.`
            : '',
        translated_at: isComplete ? new Date().toISOString() : '',
      });

      return Response.json({
        material,
        done: isComplete,
        failed_chunks: failures.length,
        progress: progress(merged),
        ...updated,
      });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}