import en from './messages.en.json';

let messages = en;
let currentLocale = 'en';

export function setLocale(locale) {
  try {
    messages = require(`./messages.${locale}.json`);
    currentLocale = locale;
  } catch (e) {
    console.warn(`Missing locale ${locale}`);
  }
}

export function t(key, vars = {}) {
  const parts = key.split('.');
  let str = parts.reduce((obj, p) => (obj ? obj[p] : undefined), messages);
  if (typeof str !== 'string') return key;
  Object.entries(vars).forEach(([k, v]) => {
    str = str.replace(new RegExp(`{${k}}`, 'g'), v);
  });
  return str;
}

export { currentLocale };
