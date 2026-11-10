import { student } from './student';
import { assessment } from './assessment';
import { studyGroups } from './studyGroups';

/**
 * Interface namespaces, one object per module, each carrying every language.
 * Registering a module here is all it takes for its keys to resolve through the
 * existing translate() lookup; a new workspace module never touches the
 * base dictionaries.
 */
const registered = [student, assessment, studyGroups];

const LANGUAGES = ['en', 'ru', 'fr', 'zh-CN', 'ar'];

export const modules = LANGUAGES.reduce((acc, language) => {
  acc[language] = { student: {} };
  registered.forEach((pack) => {
    const source = pack[language] || pack.en || {};
    Object.assign(acc[language].student, source);
  });
  return acc;
}, {});

export default modules;