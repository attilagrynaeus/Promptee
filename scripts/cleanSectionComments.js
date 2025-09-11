#!/usr/bin/env node
/**
 * Rationale: Remove non-informative section separator comments like
 *            "/* ---------- handlers ---------- *\/" or "// ----- foo -----"
 *            across source files without touching meaningful comments.
 *
 * Safe-by-default: dry-run unless --write is passed.
 *
 * TODO: If additional extension types exist in this repo, extend `FILE_EXTS`.
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const WRITE = process.argv.includes('--write');

const FILE_EXTS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.css', '.scss', '.sass'
]);

const EXCLUDES = new Set([
  'node_modules', '.git', 'dist', 'build', 'coverage', 'out'
]);

// Matches lines like: // ------- something -------
const lineSectionRe = /^\s*\/\/\s*[-=*_]{3,}[A-Za-z0-9 ._\/+#:()|,]*[-=*_]{3,}\s*$/gm;

// Matches single-line block comments like: 
const singleBlockSectionRe = /\/\*\s*[-=*_]{3,}[A-Za-z0-9 ._\/+#:()|,]*[-=*_]{3,}\s*\*\//g;

// Matches lines like: // ------------- (no text) -------------
const lineOnlySeparatorsRe = /^\s*\/\/\s*[-=*_]{6,}\s*$/gm;

function shouldVisitDir(name) {
  return !EXCLUDES.has(name);
}

function shouldProcessFile(file) {
  return FILE_EXTS.has(path.extname(file));
}

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (shouldVisitDir(entry.name)) yield* walk(full);
    } else if (entry.isFile()) {
      if (shouldProcessFile(full)) yield full;
    }
  }
}

function cleanContent(src) {
  let out = src;
  const before = out;
  out = out.replace(lineOnlySeparatorsRe, '');
  out = out.replace(lineSectionRe, '');
  out = out.replace(singleBlockSectionRe, '');
  // Collapse 3+ blank lines to at most 2
  out = out.replace(/\n{3,}/g, '\n\n');
  const changed = out !== before;
  return { changed, out };
}

let changedFiles = 0;
let totalChanges = 0;

for (const file of walk(ROOT)) {
  const orig = fs.readFileSync(file, 'utf8');
  const { changed, out } = cleanContent(orig);
  if (changed) {
    changedFiles += 1;
    // Approximate change count: removed comment markers occurrences
    const delta = (orig.match(lineOnlySeparatorsRe)?.length || 0)
                + (orig.match(lineSectionRe)?.length || 0)
                + (orig.match(singleBlockSectionRe)?.length || 0);
    totalChanges += delta;
    if (WRITE) {
      fs.writeFileSync(file, out, 'utf8');
      process.stdout.write(`[cleaned] ${path.relative(ROOT, file)} (−${delta})
`);
    } else {
      process.stdout.write(`[would clean] ${path.relative(ROOT, file)} (−${delta})
`);
    }
  }
}

const summary = `${WRITE ? 'Applied' : 'Planned'} ${totalChanges} removals in ${changedFiles} file(s).`;
console.log(summary);

if (!WRITE && changedFiles > 0) {
  console.log('Run with --write to apply changes:');
  console.log('  node scripts/cleanSectionComments.js --write');
}

