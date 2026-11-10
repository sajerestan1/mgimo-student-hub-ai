import en from './en';
import ru from './ru';
import fr from './fr';
import zhCN from './zh-CN';
import ar from './ar';
import { modules } from './modules';

// The base dictionary holds the shell (navigation, authentication, shared
// wording). Workspace modules add their own namespace on top, so a module's
// strings live together in one file and can never be half-registered.
const withModules = (base, extra) => ({ ...base, ...extra });

export const dictionaries = {
  en: withModules(en, modules.en),
  ru: withModules(ru, modules.ru),
  fr: withModules(fr, modules.fr),
  'zh-CN': withModules(zhCN, modules['zh-CN']),
  ar: withModules(ar, modules.ar),
};

export default dictionaries;