# Source map

**Status:** In review · **Depends on:** [process.md](process.md) · **Open items:** listed per row

Every section of the five docs/ files and its role. The roles are explained in [process.md §3](process.md). A section name must match its heading in the docs exactly, because the check compares them. "→" names the spec file that will take a section over, or the open item that decides it.

## kith-design-documentation.md

| Section | Role | Note |
|---|---|---|
| Index | Carried | |
| 1. Problem and project framing | Carried | |
| 1.1 Problem statement | Carried | → 00-aim |
| 1.2 Target users | Pending | The sample user's story changes. OI-052 |
| 1.3 Scope | Carried | Updated by DEC-002, DEC-003, DEC-004, DEC-009 |
| 1.4 Out of scope, and boundary notes | Carried | → 00-aim |
| 1.5 Goals | Carried | → 00-aim. The yardstick |
| 1.6 Limitations and how the product responds | Carried | → 00-aim |
| 1.7 From insight to capability | Carried | → 00-aim. The "how might we" themes |
| 2. Product concept and design principles | Carried | |
| 2.1 Concept | Carried | The specs follow the test prototype (DEC-001) |
| 2.2 Design principles | Carried | → 00-aim. P1 to P8 |
| 3. State of the product today | Retired | Describes the old build |
| 3.1 What exists | Retired | |
| 3.2 What is faked | Retired | |
| 3.3 Gaps against the new requirements | Retired | |
| 3.4 Why a fresh build is justified | Retired | |
| 4. How the product works | Superseded | 4.1 to 4.6 → modules (Locked). 4.7 still applies |
| 4.1 The layer model | Superseded | → modules/canvas |
| 4.2 The object model | Superseded | → modules/canvas §6 |
| 4.3 Object states | Superseded | → modules/canvas §6 |
| 4.4 Dimension refinement | Superseded | → modules/canvas §8 |
| 4.5 Adding objects | Superseded | → modules/canvas §7. The objects that can be added: step 3 |
| 4.6 The constraint and guidance system | Superseded | → modules/guidance, modules/ai |
| 4.6.1 Two kinds of constraint | Superseded | → modules/guidance |
| 4.6.2 Three response levels (Decided, D-30, D-31) | Superseded | → modules/guidance |
| 4.6.3 When feedback appears | Superseded | → modules/guidance |
| 4.6.3a Passive and active feedback: what to show, and when (Proposed) | Superseded | → modules/guidance |
| 4.6.4 Signal vocabulary (Proposed, D-Q1) | Superseded | → modules/guidance |
| 4.6.5 The heads-up card | Superseded | → modules/ai §5 |
| 4.6.6 Dismissal and memory (D-21) | Superseded | → modules/guidance |
| 4.6.7 AI's role (D-19) | Superseded | → modules/ai |
| 4.7 The rule structure | Carried | Build-level. OI-094 |
| 5. Core flows | Input | → flows |
| F1. Start a project (existing, with one change) | Input | → flows. Order settled by DEC-006. Step 2 dropped (DEC-002) |
| F1.1 Proposed onboarding restructure (Proposed, C-13) | Conflict | The activity list. OI-040, OI-041 |
| F1.2 Onboarding experience outline | Input | → flows (preferences). OI-043 |
| F1.3 Step 3 sorting interaction: Main and Sometimes (Proposed, D-39) | Input | → flows, screens. OI-042 |
| F2. Move an object (existing, extended with guidance) | Input | → flows |
| F3. Edit an object | Input | → flows, screens. OI-061 |
| F4. Add an object | Input | → flows. Edit Object always opens (DEC-017) |
| F5. Resolve a heads-up (override, dismiss, get options) | Input | → flows |
| F6. Confirm and keep editing | Input | → flows. The ending: OI-005 |
| F7. Refine (not defined) | Superseded | Dropped by DEC-002 |
| F8. Correct what the system got wrong | Conflict | Which detection mistake to plant. OI-055, OI-060 |
| 6. User journeys | Conflict | Two journey numbering schemes. OI-058 |
| J0. Tell the room what matters to me | Input | → scenarios |
| J1. Make my desk work | Input | → scenarios |
| J2. That's not the size of my bed | Input | → flows |
| J3. I saw this armchair | Input | → flows |
| J4. I know, and I still want it | Input | → flows |
| J5. That's not what that is | Input | → flows |
| 7. The sample room: Aarav's Room | Carried | Updated by DEC-012: the 3D scene wins |
| 7.1 Geometry and orientation | Carried | Read with the DEC-012 note |
| 7.2 Fixed elements: the hard-constraint inventory | Carried | Read with the DEC-012 note |
| 7.3 Movable objects | Carried | |
| 7.4 Draft rule set for this room | Pending | Changes from the stress test. OI-057, OI-036 |
| 7.4b Threshold register | Carried | Build-level. OI-091 |
| 7.5 What the room data reveals (all Derived) | Carried | Read with ST §2.3 |
| 7.6 Data notes (the room model is accepted as the base, D-28) | Carried | Read with the DEC-012 note |
| 7.7 The possibility space | Carried | Input to the scenario |
| 8. Information architecture and language | Input | → screens/sitemap |
| 8.1 App map | Superseded | Replaced by DEC-013. → screens/sitemap |
| 8.2 Where things live | Input | → screens/sitemap |
| 8.3 Where numbers are allowed | Carried | Updated by DEC-021 |
| 8.4 Glossary | Carried | Every spec file uses it. OI-039 |
| 8.5 Phrasing guide for heads-ups | Carried | OI-039 |
| 9. Prototype approach for the rebuild | Carried | Build-level. Not used for screens |
| 9.1 What is real and what is faked | Carried | Build-level. Used for the "faked" notes on screens if OI-001 is (a) |
| 9.2 What the first test must learn | Carried | OI-096 |
| 9.3 Suggested build order | Retired | |
| 9.4 Readiness checklist (before building) | Retired | |
| 10. Appendix | Carried | |
| 10.1 What this document changes in earlier documents | Retired | Refers to files outside docs/ |
| 10.2 Traceability: decisions to sections | Carried | |
| 10.3 Items I could not determine from the materials | Carried | The ceiling height is settled by DEC-012 |

## kith-open-questions.md

| Section | Role | Note |
|---|---|---|
| Index | Carried | |
| Part 1. Decision log | Carried | D-01 to D-41 stay the decisions before this work. New decisions are in spec/decisions.md |
| Part 2. Open questions register | Superseded | → spec/open-items.md. Each open question carries a "→ OI" pointer |
| A. Edit Object view and dimension refinement | Superseded | → open-items |
| B. Adding objects | Superseded | → open-items |
| C. Constraint model (what counts as hard, what counts as soft) | Superseded | → open-items |
| D. Feedback model (what the user sees and when) | Superseded | → open-items |
| E. Room model, rules and the scripted prototype | Superseded | → open-items |
| F. Onboarding to editor link | Superseded | → open-items |
| G. Product scope and testing | Superseded | → open-items |
| H. Detection errors and correction | Superseded | → open-items |
| Conflict handling options (for D-Q7) | Carried | OI-031 |
| Suggested order to resolve (P0 only) | Superseded | → open-items, ordered in batches |

## kith-user-journeys.md

| Section | Role | Note |
|---|---|---|
| Index | Carried | |
| 1. Purpose and status | Carried | |
| 2. Aarav and the story | Conflict | OI-052 |
| 2.1 What we know and what we assume | Conflict | OI-052 |
| 2.2 The existing ten-step story, read against the new model | Retired | Describes the old build's script |
| 3. The journey backbone | Input | → scenarios |
| 4. The journeys | Conflict | Numbering. OI-058 |
| J0. Tell the room about me | Input | → scenarios, flows |
| J1. The first minute in the room | Input | → scenarios, flows |
| J2. Make my desk work (the core journey) | Input | → scenarios |
| J3. I know, and I still want it | Input | → flows |
| J4. That's not the size of my bed | Input | → flows |
| J5. That's not what that is | Input | → flows |
| J6. Someone's coming over | Input | → flows |
| J7. Make it cosy | Input | → flows. The palette: OI-023 |
| 5. Which features each journey exercises | Input | → flows/coverage |
| 6. The objects the journeys need | Conflict | OI-054 |
| 7. What the journeys say about the design | Carried | |
| 8. Suggested test session (for planning, not a decision) | Carried | Build-level. OI-096 |
| 9. Wireframe inventory (for the low-fidelity round) | Input | → screens/sitemap |
| 10. Open questions from the journey mapping | Superseded | → open-items |

## kith-scenarios-and-flows.md

| Section | Role | Note |
|---|---|---|
| Index | Carried | |
| 1. Short answer | Carried | |
| 2. The three flows, refined | Input | → flows |
| 3. Auditing the story | Input | → scenarios |
| 3.1 What the story already gives us | Input | → scenarios |
| 3.2 Coverage against the five project goals | Input | → scenarios |
| 3.3 Gaps and fixes | Input | → scenarios |
| 4. The primary scenario, S1: "A room for the person he is now" | Input | → scenarios. OI-051 |
| 4.1 Beats | Input | → scenarios |
| 4.2 Success signals for S1 | Input | → scenarios |
| 4.3 What the room can and cannot show (**Derived**) | Carried | |
| 5. Supporting scenarios | Input | → scenarios. OI-056 |
| 5.1 Coverage of the goals | Input | → scenarios |
| 5.2 S2: "Same room, different person" | Input | → scenarios. OI-056 |
| 5.3 S3: "Two weeks later" (documented, not built) | Input | → scenarios. OI-004 |
| 6. The flow inventory | Input | → flows/coverage |
| 6.1 How to read it | Input | |
| 6.2 Capture and base room | Input | → flows |
| 6.3 Preferences | Input | → flows |
| 6.4 Edit | Input | → flows |
| 6.5 Cross-cutting | Input | → flows |
| 6.6 What the inventory shows | Input | → flows/coverage |
| 7. The chat is an input channel | Superseded | 7.1 to 7.3 → modules/ai. 7.4 Retired |
| 7.1 What a message can be | Superseded | → modules/ai §3, §4 |
| 7.2 Five possible outcomes | Superseded | → modules/ai §3 |
| 7.3 A conflict to resolve | Superseded | → modules/ai (DEC-018) |
| 7.4 What the code does today | Retired | Describes the old build |
| 8. The next step: user tasks and edge cases | Input | → flows. The edge-case factors |
| 9. Decisions needed | Superseded | → open-items |
| 10. What this changes in earlier documents | Carried | |
| 11. What I did not do | Carried | |

## kith-room-stress-test-and-journey.md

| Section | Role | Note |
|---|---|---|
| 1. Short answer | Carried | |
| 2. Part 1: the stress test | Carried | The evidence base for the room |
| 2.1 Method and limits | Carried | |
| 2.2 Where the scene, the data and the docs disagree (**Found**) | Carried | These values are the room (DEC-012) |
| 2.3 What the recomputation confirms (**Found**) | Carried | |
| 2.4 Findings | Carried | |
| F1. The red state depends on three modelling choices | Carried | OI-092 |
| F2. "The fan hides the plug" rests on 7.5 cm | Carried | OI-057 (R1) |
| F3. The room has one daylit area for a desk, and the fan guards it | Carried | OI-035 |
| F4. Privacy, as written, can never clear | Carried | OI-036 |
| F5. The window desk and the exercise patch cannot both be clean | Carried | OI-057 (R4) |
| F6. The north-east corner is wanted by three things | Carried | |
| F7. The comfortable-walkway threshold sits inside the measurement noise | Carried | OI-091 |
| F8. A free plug and a reachable plug are different things | Carried | OI-092 |
| F9. Rules that cannot fire, and rules that always fire | Carried | OI-036 |
| F10. Bounding boxes are too coarse for some objects | Carried | OI-097 |
| F11. Several blocks are physical and invisible, and the user will not know why | Carried | OI-016 |
| 2.5 What this asks of the rules (**Proposed**, all need your call) | Pending | OI-057, OI-016, OI-050, OI-092 |
| 3. Part 2: the core journey, "Before Saturday" | Input | → scenarios. OI-051 |
| 3.1 What this journey is meant to prove | Input | → scenarios |
| 3.2 The story | Input | → scenarios |
| 3.3 The room, before and after | Input | → scenarios |
| 3.4 Act 1: Capture (Thursday night, about four minutes) | Input | → scenarios |
| 3.5 Act 2: Preferences (about two minutes) | Input | → scenarios |
| 3.6 Act 3: Edit (about 25 minutes) | Input | → scenarios |
| 3.7 Act 4: after Saturday (epilogue, deferred) | Input | → scenarios. OI-004 |
| 3.8 Branches (what else might happen) | Input | → flows (edge cases) |
| 3.9 What the prototype needs for this journey | Carried | Build-level |
| 3.10 What to watch in a test | Carried | OI-096 |
| 4. Decisions needed | Superseded | → open-items |
| 5. What this does not cover | Carried | |
