#!/usr/bin/env node
// Kith spec check. Run: npm run spec:check
// Errors make the check fail. Actions are things waiting to be handled. See spec/process.md §8.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..', '..');
const SPEC = path.join(ROOT, 'spec');
const DOCS = path.join(ROOT, 'docs');
const errors = [];
const actions = [];
const info = [];
const rel = (p) => path.relative(ROOT, p).replace(/\\/g, '/');
const read = (p) => fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === 'tools' ? [] : walk(p);
    return e.name.endsWith('.md') ? [p] : [];
  });
}
const specFiles = walk(SPEC);
const texts = Object.fromEntries(specFiles.map((f) => [f, read(f)]));
// Ignore inline code and fenced blocks when looking for markers and links.
const stripCode = (t) => t.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');

// 1. Status headers
const statusOf = {};
for (const f of specFiles) {
  const head = texts[f].split('\n').slice(0, 6).join('\n');
  const m = head.match(/\*\*Status:\*\*\s*(Draft|In review|Locked)/);
  if (!m) errors.push(`${rel(f)}: missing or invalid status header`);
  else statusOf[f] = m[1];
}

// 2. Open items and decisions: IDs
const oiFile = path.join(SPEC, 'open-items.md');
const oiText = texts[oiFile] ?? '';
const oiIds = [...oiText.matchAll(/^### (OI-\d{3})\b|^\| (OI-\d{3}) \|/gm)].map((m) => m[1] || m[2]);
const dupes = (arr) => [...new Set(arr.filter((x, i) => arr.indexOf(x) !== i))];
for (const d of dupes(oiIds)) errors.push(`open-items.md: duplicate ID ${d}`);
const oiSet = new Set(oiIds);

const decFile = path.join(SPEC, 'decisions.md');
const decText = texts[decFile] ?? '';
const decBody = decText.split('<!-- Decisions start below this line. -->')[1] ?? '';
const decIds = [...decBody.matchAll(/^### (DEC-\d{3})\b/gm)].map((m) => m[1]);
for (const d of dupes(decIds)) errors.push(`decisions.md: duplicate ID ${d}`);

// 3. Decisions with unticked changes
for (const sec of decBody.split(/^### /m).slice(1)) {
  const id = sec.split(/\s/)[0];
  const open = sec.match(/^\s*- \[ \].*$/gm) || [];
  const later = open.filter((l) => /\(step \d\)/.test(l));
  if (open.length - later.length) errors.push(`decisions.md: ${id} has ${open.length - later.length} change(s) not yet applied`);
  for (const l of later) actions.push(`${id}: waiting for ${l.match(/\(step \d\)/)[0]}: ${l.replace(/^\s*- \[ \]\s*\(step \d\)\s*/, '').slice(0, 70)}`);
}

// 4. Open item sections: answers waiting, decided items pointing to real decisions
const decSet = new Set(decIds);
const decidedOi = {};
const counts = {};
for (const sec of oiText.split(/^### (?=OI-)/m).slice(1)) {
  const id = sec.slice(0, 6);
  const type = (sec.match(/\*\*Type:\*\*\s*([A-Za-z' ]+?)\s*(·|\n)/) || [])[1] ?? '?';
  const status = (sec.match(/\*\*Status:\*\*\s*(.+)/) || [])[1]?.trim() ?? '?';
  const answer = (sec.match(/\*\*Answer:\*\*[ \t]*(.*)/) || [])[1]?.trim() ?? '';
  const key = `${status.split(/\s/)[0]} / ${type}`;
  counts[key] = (counts[key] || 0) + 1;
  if (answer && /^Open/.test(status)) actions.push(`${id}: answer waiting to be applied ("${answer.slice(0, 60)}")`);
  const dec = status.match(/DEC-\d{3}/);
  if (dec && !decSet.has(dec[0])) errors.push(`open-items.md: ${id} points to ${dec[0]}, which does not exist`);
  if (dec) decidedOi[id] = dec[0];
}
const parked = (oiText.split('## Parked')[1]?.match(/^\| OI-\d{3}/gm) || []).length;
info.push(`Open items: ${Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join(' · ')} · Parked: ${parked}`);
info.push(`Decisions: ${decIds.length}`);

// 5. Markers
for (const f of specFiles) {
  if (f === oiFile || f.endsWith('process.md')) continue;
  const t = stripCode(texts[f]);
  const markers = [...t.matchAll(/\[(OPEN|ASSUMED) (OI-\d{3})\]/g)];
  for (const m of markers) if (!oiSet.has(m[2])) errors.push(`${rel(f)}: marker points to unknown ${m[2]}`);
  if (statusOf[f] === 'Locked' && markers.length) errors.push(`${rel(f)}: Locked but has ${markers.length} open marker(s)`);
}

// 6. [YOU] notes
for (const f of specFiles) {
  texts[f].split('\n').forEach((l, i) => {
    if (/^>\s*\[YOU\]/.test(l)) actions.push(`${rel(f)}:${i + 1}: owner note: ${l.replace(/^>\s*\[YOU\]\s*/, '').slice(0, 70)}`);
  });
}

// 7. Links (spec files and CLAUDE.md)
for (const f of [...specFiles, path.join(ROOT, 'CLAUDE.md')]) {
  if (!fs.existsSync(f)) continue;
  const t = stripCode(read(f));
  for (const m of t.matchAll(/\]\(([^)\s]+)\)/g)) {
    const target = m[1];
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    const p = path.resolve(path.dirname(f), decodeURI(target.split('#')[0]));
    if (!fs.existsSync(p)) errors.push(`${rel(f)}: broken link → ${target}`);
  }
}

// 8. Source map against docs/ headings, banners, pointers
const ROLES = new Set(['Carried', 'Input', 'Pending', 'Conflict', 'Superseded', 'Retired']);
const smText = texts[path.join(SPEC, 'source-map.md')] ?? '';
const smByFile = {};
for (const block of smText.split(/^## /m).slice(1)) {
  const name = block.split('\n')[0].trim();
  smByFile[name] = Object.fromEntries(
    [...block.matchAll(/^\| (.+?) \| (\w+) \|/gm)].filter((m) => m[1] !== 'Section' && !/^-+$/.test(m[1])).map((m) => [m[1].trim(), m[2]])
  );
}
const norm = (h) => h.replace(/^#+\s*/, '').trim();
for (const file of fs.readdirSync(DOCS).filter((n) => n.endsWith('.md'))) {
  const lines = read(path.join(DOCS, file)).split('\n');
  const rows = smByFile[file];
  if (!rows) { errors.push(`source-map.md: no section for docs/${file}`); continue; }
  const heads = lines.map((l, i) => [l, i]).filter(([l]) => /^#{2,4} /.test(l));
  const names = new Set(heads.map(([l]) => norm(l)));
  for (const [l, i] of heads) {
    const n = norm(l);
    const role = rows[n];
    if (!role) { errors.push(`source-map.md: docs/${file} "${n}" has no role`); continue; }
    if (!ROLES.has(role)) errors.push(`source-map.md: docs/${file} "${n}" has unknown role "${role}"`);
    if (role === 'Superseded') {
      const near = (k) => lines.slice(k + 1, k + 4).some((x) => x.startsWith('> Superseded'));
      let ok = near(i);
      if (!ok) { // accept a banner on the parent heading
        const lvl = l.match(/^#+/)[0].length;
        for (let k = i - 1; k >= 0; k--) if (/^#+ /.test(lines[k]) && lines[k].match(/^#+/)[0].length < lvl) { ok = near(k); break; }
      }
      if (!ok) errors.push(`docs/${file} "${n}": Superseded in the source map but has no banner`);
    }
  }
  for (const n of Object.keys(rows)) if (!names.has(n)) errors.push(`source-map.md: docs/${file} row "${n}" matches no heading`);
  for (const m of lines.join('\n').matchAll(/→ (OI-\d{3})( \(closed: (DEC-\d{3})\))?/g)) {
    if (!oiSet.has(m[1])) errors.push(`docs/${file}: pointer to unknown ${m[1]}`);
    else if (decidedOi[m[1]] && !m[2]) errors.push(`docs/${file}: pointer → ${m[1]} not marked closed (run npm run spec:close)`);
  }
}
const roleCounts = {};
Object.values(smByFile).forEach((r) => Object.values(r).forEach((x) => (roleCounts[x] = (roleCounts[x] || 0) + 1)));
info.push(`Source map: ${Object.entries(roleCounts).map(([k, v]) => `${k} ${v}`).join(' · ')}`);

// 9. Sitemap (active once spec/screens/sitemap.md exists)
const smapPath = path.join(SPEC, 'screens', 'sitemap.md');
// Screen IDs: whole words, never open-item or decision IDs.
const SID = /\b(?!OI-|DEC-)[A-Z]{2,3}-\d{2}\b/g;
if (fs.existsSync(smapPath)) {
  const rows = [...texts[smapPath].matchAll(/^\| ([A-Z]{2,3}-\d{2}) \|([^\n]*)$/gm)].map((m) => {
    const cells = m[2].split('|').map((c) => c.trim());
    return { id: m[1], from: cells[3] ?? '', to: cells[4] ?? '' };
  });
  const ids = new Set(rows.map((r) => r.id));
  for (const d of dupes(rows.map((r) => r.id))) errors.push(`sitemap: duplicate screen ${d}`);
  const edges = Object.fromEntries(rows.map((r) => [r.id, [...r.to.matchAll(SID)].map((x) => x[0])]));
  for (const r of rows) {
    for (const t of [...edges[r.id], ...[...r.from.matchAll(SID)].map((x) => x[0])])
      if (!ids.has(t)) errors.push(`sitemap: ${r.id} links to unknown ${t}`);
    if (!edges[r.id].length) errors.push(`sitemap: ${r.id} has no way out (dead end)`);
  }
  if (rows.length) {
    const seen = new Set([rows[0].id]);
    const queue = [rows[0].id];
    while (queue.length) for (const n of edges[queue.shift()] ?? []) if (!seen.has(n)) { seen.add(n); queue.push(n); }
    for (const r of rows) if (!seen.has(r.id)) errors.push(`sitemap: ${r.id} cannot be reached from ${rows[0].id}`);
  }
  const detail = specFiles.filter((f) => f.includes(`${path.sep}screens${path.sep}`) && f !== smapPath).map((f) => texts[f]).join('\n');
  if (detail.trim()) {
    for (const id of ids) if (!new RegExp(`^### ${id}\\b`, 'm').test(detail)) errors.push(`screens: ${id} has no detail section`);
    for (const m of detail.matchAll(/^### ([A-Z]{2,3}-\d{2})\b/gm)) if (!ids.has(m[1])) errors.push(`screens: detail section ${m[1]} has no sitemap row`);
  }
  info.push(`Sitemap: ${rows.length} screens`);
}

// Report
const statusCounts = {};
Object.values(statusOf).forEach((s) => (statusCounts[s] = (statusCounts[s] || 0) + 1));
info.unshift(`Spec files: ${specFiles.length} (${Object.entries(statusCounts).map(([k, v]) => `${k} ${v}`).join(', ')})`);
console.log('\nKith spec check\n');
info.forEach((l) => console.log('  ' + l));
console.log(`\nActions waiting (${actions.length})`);
actions.forEach((l) => console.log('  - ' + l));
console.log(`\nErrors (${errors.length})`);
errors.forEach((l) => console.log('  ✗ ' + l));
console.log(errors.length ? '\nFAIL\n' : '\nPASS\n');
process.exit(errors.length ? 1 : 0);
