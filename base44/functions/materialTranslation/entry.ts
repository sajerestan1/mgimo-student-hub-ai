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
const MAX_CHUNK_CHARS = 3600;
const MAX_CHUNK_SECTIONS = 8;
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
// tables and paragraphs each keep their own kind so the reader can rebuild the
// document structure instead of flattening it into one blob.
function sectionize(text) {
  const lines = String(text).replace(/\r\n/g, '\n').split('\n');
  const sections = [];
  let buffer = [];
  let heading = '';
  let kind = 'paragraph';

  const flush = () => {
    const body = buffer.join('\n').trim();
    if (body || heading) {
      const index = sections.length + 1;
      sections.push({
        id: `s${String(index).padStart(2, '0')}`,
        kind,
        heading,
        original: body,
        translated: '',
      });
    }
    buffer = [];
    heading = '';
    kind = 'paragraph';
  };

  lines.forEach((raw) => {
    const line = raw.replace(/\s+$/, '');
    const headingMatch = /^(#{1,6})\s+(.*)$/.exec(line);
    if (headingMatch) {
      flush();
      heading = headingMatch[2].trim();
      kind = 'heading';
      return;
    }
    if (!line.trim()) {
      flush();
      return;
    }
    const isList = /^\s*([-*+]|\d+[.)])\s+/.test(line);
    const isTable = /^\s*\|/.test(line);
    if (isList || isTable) {
      const wanted = isList ? 'list' : 'table';
      if (kind !== wanted) {
        flush();
        kind = wanted;
      }
      buffer.push(line.trim());
      return;
    }
    if (kind === 'list' || kind === 'table') flush();
    kind = 'paragraph';
    buffer.push(line.trim());
  });

  flush();
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

    // A section is only accepted when its text arrived, and when it carries a
    // heading, when that heading was translated too. This is what prevents a
    // silently half-translated document.
    const incomplete = sections
      .filter((section) => {
        const entry = translations.get(section.id);
        if (!entry) return true;
        if (!entry.text.trim() && !entry.heading.trim()) return true;
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

    // ── translate: one chunk per call, so progress is real and a timeout can
    // never lose a whole document.
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
        return Response.json({ material, ...record });
      }
      if (record.status === 'outdated' || payload.force) {
        record = await svc.entities.MaterialTranslation.update(record.id, {
          status: 'translating',
          attempts: 0,
          error: '',
          chunk_done: 0,
          sections: record.sections.map((section) => ({ ...section, translated: '' })),
        });
      }

      const sections = record.sections || [];
      const chunks = buildChunks(sections);
      const translatedIds = new Set(sections.filter((section) => section.translated).map((section) => section.id));
      const chunkIndex =
        typeof payload.chunk === 'number'
          ? payload.chunk
          : chunks.findIndex((chunk) => chunk.some((section) => !translatedIds.has(section.id)));

      if (chunkIndex < 0 || !chunks[chunkIndex]) {
        const completed = await svc.entities.MaterialTranslation.update(record.id, {
          status: 'complete',
          chunk_total: chunks.length,
          chunk_done: chunks.length,
          translated_at: new Date().toISOString(),
          error: '',
        });
        return Response.json({ material, done: true, ...completed });
      }

      const chunk = chunks[chunkIndex];
      const result = await translateSections(
        base44,
        chunk.map((section) => ({
          ...section,
          translated: '',
        })),
        recordTarget,
        recordSource || 'unknown',
        glossaryFrom(sections)
      );

      if (!result.ok) {
        const attempts = (record.attempts || 0) + 1;
        const failed = await svc.entities.MaterialTranslation.update(record.id, {
          attempts,
          status: attempts >= MAX_ATTEMPTS ? 'failed' : 'translating',
          error: result.error,
        });
        return Response.json({ material, ...failed });
      }

      const merged = sections.map((section) => {
        const entry = result.translations.get(section.id);
        return entry
          ? { ...section, translated: entry.text, translated_heading: entry.heading || section.translated_heading || '' }
          : section;
      });
      const byId = new Map(merged.map((section) => [section.id, section]));
      const translatedNow = merged.filter((section) => section.translated || section.translated_heading).length;
      const isComplete = translatedNow === merged.length;
      const updated = await svc.entities.MaterialTranslation.update(record.id, {
        sections: merged,
        chunk_total: chunks.length,
        chunk_done: chunks.filter((entry) =>
          entry.every((section) => {
            const row = byId.get(section.id);
            return Boolean(row?.translated || row?.translated_heading);
          })
        ).length,
        status: isComplete ? 'complete' : 'translating',
        attempts: 0,
        error: '',
        translated_at: isComplete ? new Date().toISOString() : '',
      });

      return Response.json({ material, done: isComplete, ...updated });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}