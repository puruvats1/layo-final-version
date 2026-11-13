#!/usr/bin/env node
// Marks "→ OI-nnn" pointers in docs/ as closed once the item is Decided in spec/open-items.md.
// Run: npm run spec:close
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..', '..');
const oi = fs.readFileSync(path.join(ROOT, 'spec', 'open-items.md'), 'utf8');
const decided = {};
for (const sec of oi.split(/^### (?=OI-)/m).slice(1)) {
  const m = sec.match(/\*\*Status:\*\*\s*Decided → (DEC-\d{3})/);
  if (m) decided[sec.slice(0, 6)] = m[1];
}
let n = 0;
for (const f of fs.readdirSync(path.join(ROOT, 'docs')).filter((x) => x.endsWith('.md'))) {
  const p = path.join(ROOT, 'docs', f);
  const t = fs.readFileSync(p, 'utf8');
  const out = t.replace(/→ (OI-\d{3})(?! \(closed)/g, (m, id) => (decided[id] ? (n++, `→ ${id} (closed: ${decided[id]})`) : m));
  if (out !== t) fs.writeFileSync(p, out);
}
console.log(`Closed ${n} pointer(s).`);
