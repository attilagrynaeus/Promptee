const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'src');
const exts = ['.jsx', '.tsx'];
let bad = false;

function scan(file) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\n/);
  lines.forEach((line, idx) => {
    if (line.includes('className') || line.includes('aria-')) return;
    const regex = />\s*[^<{]*[A-Za-z][^<{]*</;
    if (regex.test(line) && !line.includes('t(')) {
      console.error(`Literal text in ${file}:${idx + 1}`);
      bad = true;
    }
  });
}

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      if (f === '__tests__' || f === 'i18n') continue;
      walk(p);
    } else if (exts.includes(path.extname(p))) {
      scan(p);
    }
  }
}

walk(root);
if (bad) {
  console.error('Run i18n helper for user-visible strings');
  process.exit(1);
}
