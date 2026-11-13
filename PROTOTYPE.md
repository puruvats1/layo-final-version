# Kith: prototype (V4)

Kith helps people in compact rooms try a new layout on their phone before they move real furniture.

**This is a Wizard of Oz prototype.** There is no live scanning and no backend. The AI can run on a small local model (see "The local model" below); without it, every answer is scripted. It runs on one scanned room (Aarav's, 3.4 × 3.4 m). The room's checks are computed from real positions. What the AI decides and says comes from a small model on this machine when one is running, and from a script when not (see "The local model").

- Run: `npm run dev`, then open the address it prints. Build: `npm run build`.
- `/` is this prototype. `/?empty` starts with no projects. `/?screen=editor` opens the editor directly.
- `/old` is the earlier prototype, unchanged. Its workbenches are still at `/states`, `/break` and `/styleguide`.
- The code is in `src/v4/`. It follows `spec/` (sitemap, canvas, AI and guidance modules, room rules) and takes its look from `docs/design system/` (V4 tokens: colours, type, spacing, radii, shadows).

## The one rule for the AI

**The petal in rose means the AI found, said or proposed this.** Nothing else in the interface is rose.

| Where | What carries the petal |
|---|---|
| Bottom bar | The AI side of the toggle, the context chip, the suggestion chips |
| On objects | Check markers (a petal with a count; an amber dot when a room fact is involved) |
| Cards | "Kith noticed" (a check), "Kith proposes" (a proposal), "Kith suggests" (options) |
| In the room | Proposal and option ghosts are rose. Staged boxes are paper white. "Where it was" is dashed blue |
| Scan results | Labels in Room edit, "From your room" and "Suggested" badges, the Room Check count |
| Preferences | Activities sorted from the scan, items "From what you wrote" |

## The editor frame (compact, 2026-11-12)

The room is the priority, so the controls take as little of it as they can. This differs from `spec/modules/canvas.md` in five places (OI-104).

- **Top left:** Back and the layout name. **Under it:** Undo and Redo, and **Save** (names the layout as last confirmed). Both step aside while an object is being carried.
- **Top right:** Room Check, Preview and ⋯. Confirm floats under it while something is staged.
- **Bottom left:** a two-icon toggle, AI and Assets, with no text.
- **Bottom right:** the AI's input, with its suggestion chips sitting directly on it as one group. In Assets, the row of assets.
- **On the object:** the tap menu (its name, then Edit, Rotate, Ask, Link or Unlink, Remove as icons) and the rotation "Done". Both stay on screen and clear of the bars when the object is near an edge.
- **The AI's button icon** is the petal with a spark cut out of it. The plain petal still marks what the AI found or said.

## Major flows

| # | Flow | Screens |
|---|---|---|
| 1 | First run: Home, scan, processing | HM-01, CP-01, CP-02 |
| 2 | Preferences while the room builds: name and references, activities, priorities, recap | PR-01 to PR-05 |
| 3 | "Here's what we found": confirm or fix the uncertain plug, mark something missed | RE-01 to RE-03 |
| 4 | Look around, tap an object, tap menu (Edit, Rotate, Remove, Ask, Unlink) | ED-01, ED-02 |
| 5 | Hold and drag: lift, box, wall snap, one signal, linked chair, drop, staged | ED-03 |
| 6 | Check on drop: card, stack, Show options, Keep it, Undo, Not right? | AI-02, AI-04 |
| 7 | Select several, then Ask AI or Remove | ED-04 |
| 8 | Rotate with square snapping | ED-05 |
| 9 | Ask the AI: propose, suggest, explain, ask one question, decline and point | AI-01, AI-03, AI-04 |
| 10 | Restyle from references, with a tick per object | AI-03 |
| 11 | Assets: bring back, Suggested, Add from camera, gallery or product link, then Edit Object, then place | AS-01 to AS-06, EO-01 |
| 12 | Edit Object: type, size steppers with source chip, finish and its history, needs | EO-01 |
| 13 | Confirm review, result, What to move, Save layout | ED-06, ED-07, FN-01, FN-02 |
| 14 | Room Check, Clear checks | RC-01, RC-02 |
| 15 | More options: Clear the room, Room edit, Preferences | SE-01, SE-02 |
| 16 | Layouts: open, save, duplicate, new from the original | LY-01 |
| 17 | Preview, Undo and Redo, leaving with staged changes | ED-08, ED-09 |

## Edge cases built

- **No projects** on Home (`/?empty`). The Zone tile explains it isn't available.
- **Scan cancelled** returns Home.
- **References skipped:** the default preset notice. **All preferences skipped:** only room facts are watched, and "Tell us what matters" appears in the editor and in Room Check.
- **Main activities are capped at three.** A fourth goes to Sometimes. Priorities stop at three.
- **Recap waits** while the room is still building.
- **Words become a rule:** "I take calls here" (in activities or in chat) adds a removable "From what you wrote" item and switches on the privacy check.
- **Physical limits are silent:** a box stays inside the walls, off the wardrobe, and slides off other furniture.
- **Checks that start in the room** never show a card. They sit in Room Check tagged "Before you started", with no Undo.
- **Hedged check:** the plug between the windows is uncertain, so its check says "If that's a plug…" until it is confirmed in Room edit. Saying it isn't a plug removes it from the plug rules.
- **A check clears by itself** when the cause goes (move the fan and the plug is free; turn the bed and the AC check goes).
- **Kept checks** stay closed until the object moves or changes size. **Clear checks** can't be undone and says so.
- **Show options** can involve another object ("only if the storage boxes go"), says "Each of these gives something up" when none is clean, and says so when there is no free spot.
- **Confirm with open checks** becomes "Confirm anyway". Discard is always there.
- **Leaving or switching layouts with staged changes** asks once: Confirm, Discard or Cancel.
- **Product link that can't be read** shows an error and offers a photo instead (any text that isn't a web address fails).
- **An added object** must have its type confirmed before it can be placed. Its size shows as "Estimated from photo" or "From product page", and "You edited" after a change. Size stops at half and one and a half times the detected value.
- **Empty states:** Assets groups, Room Check, What to move.
- **The AI can't:** resize (points to Edit Object), change plugs or walls (points to Room edit), shop (points to Add), pick a "best" layout (shows options instead).

## Shortcuts taken

- Assets are brought in with a tap (they arrive in front of you, staged, with "Hold and drag to place"), not dragged from the tray.
- The two-finger twist isn't built. Rotate is in the tap menu.
- Finishes are recorded per object but only the whole-room restyle changes how the room looks (bedding, curtains, rug).
- "It's two things" (splitting a merged object) isn't built.
- Privacy, Natural light, Restful sleep and Open floor are watched. Fresh air and Easy storage access can be picked but add no rule beyond the window and wardrobe room facts. Of the activities, Working or studying, Exercising and Relaxing have rules.
- The walkway and entrance room facts aren't computed.
- Layouts and edits last for the browser session only.
- The scenario stories (A, B, C) aren't scripted. The flows above work freely in the one room.

## The local model

Kith's decisions can run on a small model on this machine: `qwen3.5:4b` through Ollama. It is used for reasoning only, never for images. The code is in `src/v4/llm.ts`.

**Setup.** Ollama must be running with the model pulled (`ollama run qwen3.5:4b` once). The dev server forwards `/ollama` to `http://localhost:11434`, so a phone on the same network reaches the model through the laptop. Set `OLLAMA_URL` to point somewhere else. `/?llm=off` runs on the scripted answers, and so does ⋯ → "Kith's thinking". A deployed build has no model and falls back by itself.

**Who does what.**

| The code (`room.ts`) | The model (`llm.ts`) |
|---|---|
| Measures the room: positions, sizes, distances to plugs, windows, the door and the AC | Reads those measurements as a table. It never does geometry |
| Tests every rule and produces the open checks, each with its measurement ("nearest free plug 2.85 m; reach limit 2.00 m") | **Triage:** for the object just changed, decides card or marker for each check, their order, the wording, and the order of the actions |
| Finds every free spot for an object and what each one costs | **Options:** picks the two or three spots to show and words each cost, and the line above the list |
| Turns a decision into exact changes: wall snap, the linked chair, small things that have to leave | **Chat:** decides what a message becomes (propose, suggest, explain, ask one question, decline and point), with which object, named spot, finish or check |
| States the consequence of a proposal by running the rules on the result | Words answers to free questions, "ask" questions and declines |

**Guard rails.** Every answer is constrained to a JSON schema whose object, check and spot ids are the real ones, then validated. The code overrides the model in these cases:

- A room fact on a certain detection is always a card. The model can't reduce it to a marker.
- "Show options", "Keep it" and "Undo" are always on a card that follows a change, and "Not right?" is always there as a link. The model orders them and can promote "Not right?". Undo right after the drop undoes that action; later it puts the object back to how it was last confirmed (DEC-073).
- A line with a number, or with "warning", "error", "must" or "should", is replaced by the rule's own wording (DEC-045, D-06).
- Consequences in a proposal come from the rules, never from the model.
- The model can only propose. Nothing changes until Apply.
- Anything invalid, or slower than the time limit (8 s for triage, 9 s for options, 14 s for chat), falls back to the scripted logic.

**What the person sees while it works.** After a drop the object carries a turning petal, then the card or marker appears. Options show "Kith is weighing the free spots". Chat shows "Thinking". On this laptop each call takes two to three and a half seconds.

**Testing.** `npx tsx src/v4/llm.test.mts` runs the three tasks against the live model and prints the results and timings.

**Known limits of the 4B model.**
- It runs with thinking off. Thinking was tried on 2026-11-12: each message took over 85 seconds and the model was still reasoning at 4,000 tokens, so it never answered. Routing with thinking off was right on the 13 test messages after examples were added to the prompt, but it will misroute unusual phrasings.
- Its wording is plain and sometimes awkward. Lines that break the wording rules are swapped for the rule's own text.
- The whole-room restyle and "take calls" rule still use fixed text once the model has chosen them.
