import { student } from './student';
import { assessment } from './assessment';
import { studyGroups } from './studyGroups';
import { integrity } from './integrity';
import { intel } from './intel';
import { office } from './office';

/**
 * Interface namespaces, one object per module, each carrying every language.
 * Registering a module here is all it takes for its keys to resolve through the
 * existing translate() lookup; a new workspace module never touches the
 * base dictionaries.
 */
const registered = [student, assessment, studyGroups];

/**
 * Packs shared by more than one workspace. They carry their own root namespace
 * (integrity.*) instead of living inside the student workspace, because the
 * academic integrity workspace is opened by students and professors alike.
 */
const shared = [integrity, intel, office];

const LANGUAGES = ['en', 'ru', 'fr', 'zh-CN', 'ar'];

export const modules = LANGUAGES.reduce((acc, language) => {
  acc[language] = { student: {} };
  registered.forEach((pack) => {
    const source = pack[language] || pack.en || {};
    Object.assign(acc[language].student, source);
  });
  shared.forEach((pack) => {
    Object.assign(acc[language], pack[language] || pack.en || {});
  });
  return acc;
}, {});

export default modules;