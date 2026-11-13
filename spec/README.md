# Kith spec: status board

**Status:** In review · **Depends on:** [process.md](process.md) · **Open items:** see below

## Where we are

| | |
|---|---|
| **Current step** | **3 Scenario**: A, B, C rewritten with floor plans, plus room-rules.md. Waiting on the owner's review, OI-036, OI-057, OI-103, OI-053, OI-058 |
| **Alongside** | **The evaluation plan** ([evaluation/plan.md](evaluation/plan.md)), the owner's priority since 2026-11-12. Draft, waiting on OI-105 to OI-110. Its §7 is the screen priority for the prototype |
| **Next** | Lock the scenarios, then step 4 (flows for what the scenarios don't reach, and edge cases) |
| **Branch** | `spec/foundation` |
| **Check** | `npm run spec:check` |

## Files

| File | Step | Status |
|---|---|---|
| [process.md](process.md) | 0 | Locked |
| [source-map.md](source-map.md) | 0 | In review |
| [open-items.md](open-items.md) | all | Draft (living) |
| [decisions.md](decisions.md) | all | Draft (living) |
| [00-aim.md](00-aim.md) | 1 | Locked |
| [modules/canvas.md](modules/canvas.md) · [ai.md](modules/ai.md) · [guidance.md](modules/guidance.md) | 2 | Locked |
| [screens/sitemap.md](screens/sitemap.md) | 2 to 5 | Draft (38 screens) |
| [scenarios/](scenarios/A-aarav.md): A-aarav, B-mira, C-aarav-weekend, room-rules (candidates.md is v1) | 3 | In review |
| [evaluation/plan.md](evaluation/plan.md) · [story.md](evaluation/story.md) · [story-floor-plans.md](evaluation/story-floor-plans.md) · [story-check.md](evaluation/story-check.md) | outside the steps | Draft |
| flows/ | 4 | Not started |
| screens/ (detail) | 5 | Not started |
| handoff/ | 6 | Not started |

## Waiting on the owner

**Batch 1:** decided (DEC-001 to DEC-009).

**Step 1:** Locked (DEC-010 to DEC-012).

**Batch 2:** decided (DEC-013 to DEC-048). OI-036 moves to step 3.

**Step 2:** Locked (DEC-049 to DEC-056).

**Rules changed in the prototype:** OI-120 (window blocking, plug hiding, the heads-up card, applying a choice).

**The app's name:** OI-118 (Kith to Layo in the spec and the old files).

**Room rules, from the prototype test:** OI-111 (the sightline from the door), OI-112 (the window sills).

**Evaluation plan:** OI-105 (how the AI runs in the test), OI-106 (what the test covers), OI-107 (facilitator controls), OI-108 (participants and session), OI-109 (measures and targets), OI-110 (the folder in process.md).

**Test story** ([evaluation/story.md](evaluation/story.md)): your review of the story, OI-113 (no longer blocks it), OI-114 (Aarav's priorities), OI-115 (decided, DEC-074), OI-116 (the wall shelf: height and the window card), OI-117 (the bed's head end, the parking step), OI-119 (why the AI chose a spot). The walk-through gaps are in [story-check.md](evaluation/story-check.md).

## Change log

| Date | Change |
|---|---|
| 2026-11-11 | Step 0. Starting commit on `spec/foundation`. Control files written. Every section of the five docs/ files mapped. 62 open items registered from the docs (53 active, 9 parked), with 97 "→ OI" pointers and 5 Superseded banners added to docs/. Check script added |
| 2026-11-11 | Batch 1 answered: DEC-001 to DEC-009 recorded and applied to docs/ (design documentation §1.3, §1.6, §1.7, §2.1, F1, F1.2, F6, F7; decision log D-29), 7 pointers closed. Step 1 draft 00-aim.md written. OI-070 added |
| 2026-11-11 | Step 1 Locked. DEC-010 (added objects and their sizes), DEC-011 (P9, quiet), DEC-012 (the room is the 3D scene). Design doc §1.4, §4.4 and §7 updated. OI-024 made passive |
| 2026-11-11 | Batch 2 answered across seven rounds: DEC-013 to DEC-048 (editor layout, tap menu, selection, rotation, AI proposals, check cards as the AI's voice, Room Check redesign, Room edit and Settings, whole-room restyle, only picked qualities watched, card stacks, one signal at a time, words). Design doc, decision log and journeys updated, 56 pointers closed. Step 2 drafts: modules/canvas.md, ai.md, guidance.md, screens/sitemap.md. OI-083 to OI-087 raised. Check extended (sitemap ID matching) |
| 2026-11-11 | Step 2 Locked: canvas, AI and guidance modules (DEC-049 to DEC-056). Sitemap v1.1 (38 screens, with ED-09). Design doc §4 to §4.6 and scenarios §7 Superseded |
| 2026-11-11 | Step 3: the owner's feedback on the v1 candidates recorded (DEC-057 to DEC-068: look and feel, three scenarios, floor plans, Clear the room, the ⋯ menu, detection mistakes, aim line amended). Scenarios A, B and C written with a floor plan per act, plus room-rules.md. OI-103 raised |
| 2026-11-12 | Outside the spec steps, at the owner's request: a new prototype in `src/v4/` (the app at `/`; the earlier one moved to `/old`). It follows the Locked modules, the sitemap and room-rules.md, and the V4 design system in `docs/design system/`. Flows, edge cases and shortcuts are listed in PROTOTYPE.md. No spec file changed |
| 2026-11-12 | Prototype, at the owner's request: a local model (qwen3.5:4b through Ollama) now decides what is presented: card or marker and their order, which options are shown, and what a chat message becomes. The rules and all measurements stay in code, with scripted fallbacks. Details in PROTOTYPE.md. Two points touch Locked files and are raised with the owner in chat: the model choosing a check's level (guidance.md §2) and its actions (ai.md §5). No spec file changed |
| 2026-11-12 | Prototype, at the owner's request: a compact editor frame so the room stays in view. The AI and Assets toggle is two icons, the AI's suggestions sit on its input, the tap menu and the rotation Done float on the object, Undo and Redo move under the top left with a new Save button, and the AI has a new button icon. This differs from the Locked canvas module, so OI-104 is raised. No Locked file changed |
| 2026-11-12 | DEC-072 (the AI runs on a local model; rules and measurements stay in code) and DEC-073 (Undo on every card that follows a change). modules/ai.md amended. Thinking mode on the model was tried and left off: over 85 seconds a message with no answer |
| 2026-11-12 | Outside the spec steps, at the owner's request: the evaluation plan, [evaluation/plan.md](evaluation/plan.md). Part A is seven interaction tasks with objective measures. Part B is scenario A run by goals, with a questionnaire and interview on control, interruption, helpfulness and new information. It lists the 17 screens the test depends on. OI-105 to OI-110 raised; parked OI-095 and OI-096 taken up. No Locked file changed |
| 2026-11-13 | Prototype, at the owner's request: the Privacy sightline now sees only through the door's opening, and the window and its curtains sit flat on the wall. Both differ from [room-rules.md](scenarios/room-rules.md), so OI-111 and OI-112 are raised and marked in the text. A parked-ideas file was added ([parked-ideas.md](parked-ideas.md)). No Locked file changed |
| 2026-11-13 | At the owner's request: the test story, [evaluation/story.md](evaluation/story.md). Scenario A reshaped: Aarav fixes a wrong label, clears the room, builds it back up himself, and the AI speaks four times, each about something not visible on screen. Ends with the move list. OI-113 and OI-114 raised; the owner's direction noted on OI-106. plan.md §5.3 and §7 follow once the story is approved. No Locked file changed |
| 2026-11-13 | At the owner's request: floor plans for the test story ([evaluation/story-floor-plans.md](evaluation/story-floor-plans.md)), one per point where the room changes. Drawing them showed the mat in Part 6 slides into the door's swing, as in scenario A, so the story now has the stack of two cards there. No Locked file changed |
| 2026-11-13 | At the owner's request: the test story and its floor plans rewritten around the owner's drawing of the final room and their three parts (clear the room with the bed and desk; the AI proposes the rest; add the finishing pieces). Plans are now drawn in the drawing's orientation, with sizes from the prototype. The story lists what the prototype can't do yet. OI-115 to OI-117 raised, OI-113 revised. No Locked file changed |
| 2026-11-13 | At the owner's request: the story was walked through in the running prototype and 17 gaps are listed in [evaluation/story-check.md](evaluation/story-check.md). The owner's answers on tabs, the shelf, the rug, the fan and a yoga layout are applied: DEC-074 (vertical tabs for a proposal with several objects; ai.md and the sitemap amended), a Part 5 in the story (a yoga layout), the fan removal in Part 3, and new preference tags. OI-115 decided; OI-116 and OI-117 have the owner's answers and stay open |
| 2026-11-13 | At the owner's request: the story's AI lines refined to what the prototype does. Parts 1 and 2 now use "Suggest places for the bed and the study desk" and "Suggest places for laundry basket, dressing table and side table", with the real rows and chat lines; the floor plans for Parts 1 and 2 follow. The tags became Natural light, Open floor, Fresh air. OI-119 raised. No Locked file changed |
| 2026-11-13 | Prototype, at the owner's request: the app is renamed Layo on screen, in the page title and in the manifest. The spec and `docs/` still say Kith, so OI-118 is raised. Layo can also ask for spots for several things at once, shown as ghosts with a row for each. No Locked file changed |
| 2026-11-13 | Prototype, at the owner's request: the assets drawer has its pills outside it and a one-row minimum, a tile turns into the object as it leaves the drawer, a linked pair turns as one, the tap menu always has the Layo marker, and a poster and an open bookshelf can be added from photos. Some rules changed (a slim lamp no longer blocks a window; a desk no longer hides a plug), so OI-120 is raised. No Locked file changed |
