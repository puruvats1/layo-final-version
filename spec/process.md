# How this spec is made

**Status:** Locked · **Depends on:** none · **Open items:** none

This file is the working method. If the method changes, it changes here first.

## 1. What we are making

Screen specs for Kith, written so that Claude Design can turn them into screens and flows. On the way there we settle:

1. **The aim.** What every later file is checked against: the goals, the "how might we" themes, the principles, the scope.
2. **The modules.** What the edit canvas, the AI and the guidance system can and cannot do, and how each one tells the user what it can do.
3. **The scenario.** One main story, possibly with a short second one, that works in the room as recorded and covers the whole app.
4. **The flows and edge cases.** A flow for every feature the scenario does not reach, with its edge cases.
5. **The sitemap and the screen specs.** One map that ties every screen together, plus a detail section for each screen.
6. **The Claude Design briefs.** One per flow.

## 2. The files

```
CLAUDE.md                 working rules, loaded in every session
spec/
  README.md               status board: current step, file status, waiting items, change log
  process.md              this file
  source-map.md           every section of the five docs/ files and its role
  open-items.md           conflicts, gaps and questions waiting for the owner
  decisions.md            answered items, each with the file changes it causes
  00-aim.md               step 1
  modules/                step 2: canvas.md, ai.md, guidance.md
  scenarios/              step 3: candidates.md, then the chosen scenario
  flows/                  step 4: coverage.md, plus one file per flow
  screens/                sitemap.md (the structure) and one detail file per area
  handoff/                step 6: one Claude Design brief per flow
  tools/check.mjs         the check script (npm run spec:check)
```

**Old files** means only the five files in `docs/`. Nothing else in the repository is read, cited or changed by this work.

**Every spec file starts with one header line:**
`**Status:** Draft | In review | Locked · **Depends on:** … · **Open items:** …`

## 3. How the docs/ files are used

Step 0 gives every section of every docs/ file a role in `source-map.md`:

| Role | Meaning | What happens to the section |
|---|---|---|
| **Carried** | Still right. Spec files build on it | Spec files link to it instead of copying it |
| **Input** | Raw material a spec file will absorb | Once that spec file is Locked, the section becomes Superseded |
| **Pending** | An open item will decide whether it stays | Its role is set when the item is decided |
| **Conflict** | Disagrees with another section or with the owner's direction | An open item records both sides. Nothing changes until it is decided |
| **Superseded** | A spec file replaces it | Gets a one-line banner: `> Superseded by spec/… (date)` |
| **Retired** | Describes the old build, which this work sets aside | Not used. No banner needed |

**The docs/ files change only through decisions.** Every decision lists the docs/ sections it changes. Those edits happen in the same step as the decision, with a dated note: `> Updated by DEC-012 (2026-11-11): …`.

**Questions already in the docs.** Every open question in the docs gets copied into `open-items.md` with a new ID, and the original line gets a pointer (`→ OI-012`). When the item is decided, the original is marked closed with a pointer to the decision.

## 4. How conflicts and questions are raised

- **One register.** `open-items.md` holds every unsettled thing. Each item records its type, the sources quoted with their location, the options, a recommendation, what it blocks, and its status.
- **Item types:**
  - **Your call**: only the owner can decide.
  - **Conflict**: two sources disagree.
  - **Gap**: nothing defines it.
  - **Default**: a recommendation that stands unless the owner objects.
  - **Parked**: needed only for building the prototype, not for the screen specs.
- **Markers.** Text written past an open item carries `[OPEN OI-012]` (not decided, the text stays neutral) or `[ASSUMED OI-012]` (written as if the recommendation is accepted). A file with markers cannot be Locked.
- **When the owner is asked.** In chat, in batches, ordered by what each item blocks, each with a recommendation. A question that blocks the current step is asked at once. Others wait for the checkpoint at the end of their step.
- **Notes from the owner.** Two ways besides chat:
  - Fill in the `Answer:` line of any item in `open-items.md`.
  - Write `> [YOU] …` anywhere in a spec file.

  The check lists both until they are handled.

## 5. How an answer is applied

1. The item's status becomes **Decided → DEC-nnn**, and a matching entry is added to `decisions.md` with a checklist of every file it changes.
2. Each change is made, in spec/ and in docs/, and its box is ticked.
3. The markers for that item are removed or rewritten.
4. Anything the answer knocks loose becomes a new open item. Nothing is settled quietly.
5. If the answer contradicts a Locked file, nothing is overwritten. A new open item quotes both sides.
6. `npm run spec:check` passes, the status board and its log are updated, and the work is committed.

## 6. The steps

Each step runs the same cycle: **draft → check myself → raise items → owner decides → apply → check again → Lock → commit.**

| Step | Produces | Done when |
|---|---|---|
| **0 Setup** | Branch and starting commit. Control files. Source map. Register filled from the docs | Every docs/ section has a role. Every open question in the docs is in the register with a pointer back. The check passes |
| **1 Aim** | `00-aim.md` | The owner approves it. It has no markers |
| **2 Modules** | `modules/canvas.md`, `ai.md`, `guidance.md`. Each lists every possible feature as In, Only through the AI, or Out, with the reason. A first draft of `screens/sitemap.md` | Every goal is served by at least one In feature. Every Out has a reason. Features shared by two modules behave the same in both. The AI's limits are written in words a user would see |
| **3 Scenario** | `scenarios/candidates.md`, then the chosen scenario beat by beat, with its screen IDs | Every beat is possible in the room as recorded. Every beat names a feature and a screen. The story has tension, a trade-off, a personal angle and an ending |
| **4 Flows** | `flows/coverage.md`, plus one file per flow | Every In feature is reached by the scenario or by a flow. Every flow covers the edge-case factors. Every flow is a route along links that exist on the map |
| **5 Screens** | Detail sections for every screen on the map | Every map row has a detail section and every section has a row. Every state named in a flow is on its screen. Wording follows the glossary |
| **6 Handoff** | One Claude Design brief per flow | One flow is first tried in Claude Design, and the brief format is adjusted. Then the rest |
| **7 Final sync** | The remaining docs/ edits and banners. Every file Locked | The check finds no markers, no unapplied decisions, no broken links, and no docs/ section without a final role |

## 7. The sitemap rule

`spec/screens/sitemap.md` is the single source of truth for how the app is structured. Each row is one screen and records:

- **ID**
- **Name**
- **Kind:** Base view, Sheet, Overlay or State
- **Area**
- **Reached from:** a screen ID plus the action that leads here
- **Leads to:** a screen ID plus the action
- **States**

Rules:
- Flows are routes through those IDs.
- Detail lives in one file per area, as a section headed by the screen's ID.
- A screen exists only if it has a row on the map.

## 8. The check (`npm run spec:check`)

It runs at every checkpoint, and its output goes to the owner. It checks:

- Markers left in Locked files, and markers that point to items that don't exist.
- A missing status header on a spec file.
- Duplicate IDs among the open items and the decisions.
- Decisions with unticked file changes.
- Links between files that point nowhere.
- `[YOU]` notes and filled-in answers not yet handled.
- docs/ sections with no role in the source map.
- From step 2, the sitemap:
  - every screen can be reached from Home
  - every screen has a way out
  - every link points to a screen that exists
  - every map row has a detail section, and the reverse
- From step 4, the flows: every flow step follows a link on the map, and every state a flow names appears on its screen.
- From step 4, coverage: every In feature is reached by the scenario or a flow, and every goal has at least one feature serving it.
