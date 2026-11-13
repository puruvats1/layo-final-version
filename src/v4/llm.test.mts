// Manual check of the local model: npx tsx src/v4/llm.test.mts   (needs Ollama running with qwen3.5:4b)
import { START, FIXED, DEFAULT_PREFS, runChecks, type Prefs } from './room';
import { brain, wake, triage, chooseOptions, chat, facts } from './llm';

const prefs: Prefs = { ...DEFAULT_PREFS, given: true, main: ['Working or studying', 'Resting'], some: ['Exercising'], priorities: ['Privacy', 'Natural light'] };
const fixed = JSON.parse(JSON.stringify(FIXED));
const t = async <T,>(name: string, fn: () => Promise<T>) => { const t0 = Date.now(); const r = await fn(); console.log(`\n== ${name} (${Date.now() - t0} ms)\n${JSON.stringify(r, null, 1).slice(0, 1100)}`); return r; };
console.log('ready:', await wake()); await new Promise((r) => setTimeout(r, 400));
if (process.argv.includes('--facts')) console.log(facts(START, fixed, prefs, runChecks(START, prefs, fixed)));
// desk moved under window 2: plug hidden behind the fan (uncertain plug) + still in view from the door
const moved = START.map((o) => (o.id === 'obj_study_table' ? { ...o, at: [0.745, 1.18] as [number, number], rot: Math.PI } : o.id === 'obj_chair' ? { ...o, at: [0.745, 0.64] as [number, number], rot: 0 } : o.id === 'obj_clutter' ? { ...o, inRoom: false } : o));
await t('triage: desk under window 2', () => triage('obj_study_table', moved, fixed, prefs, runChecks(moved, prefs, fixed)));
const door = START.map((o) => (o.id === 'obj_dressing_table' ? { ...o, at: [0.2, -1.4] as [number, number] } : o));
await t('triage: dressing table in the doorway', () => triage('obj_dressing_table', door, fixed, prefs, runChecks(door, prefs, fixed)));
await t('options: desk', () => chooseOptions('obj_study_table', START, fixed, prefs).then((r) => ({ note: r.note, list: r.list.map((o) => `${o.n} ${o.where}: ${o.cost}`) })));
const checks = runChecks(START, prefs, fixed);
for (const [msg, ctx] of [['Put the desk by the window', []], ['get rid of the fan', []], ['why is my bed flagged?', ['obj_bed']], ['make it bigger', ['obj_study_table']], ['how wide is my desk?', []], ['move it', []], ['can you order me a new chair', []], ['I take calls at my desk', []], ['turn the bed around', []], ['make the room feel like my references', []], ['where could the bed go?', []], ['add a plant near the window', []], ['what is the weather today', []]] as [string, string[]][])
  await t(`chat: "${msg}" ${ctx.join()}`, () => chat(msg, ctx, START, fixed, prefs, checks, []).then((r) => ({ text: r.text, proposal: r.proposal && { title: r.proposal.title, changes: r.proposal.changes.map((c) => `${c.id}${c.remove ? ' remove' : ''}${c.add ? ' add' : ''}${c.at ? ' at ' + c.at.map((v) => v.toFixed(2)) : ''}${c.finish ? ' ' + c.finish : ''}`) }, optionsFor: r.optionsFor, ask: r.ask, link: r.link?.label, rule: r.rule })));
console.log('\nLOG', brain.log.join(' | '), 'fails', brain.fails);
