# Kith: Scenarios and User Flows

Version 0.2 working draft, 2026-11-10. Companion to [kith-design-documentation.md](./kith-design-documentation.md), [kith-open-questions.md](./kith-open-questions.md) and [kith-user-journeys.md](./kith-user-journeys.md). IDs such as `D-29`, `F8`, `S-4`, `JQ-3` refer to those files.

**Status of this file.** It changes nothing in the other docs. Section 10 lists what would need to change if you accept it.

**Labels:** **Proposed** = my recommendation. **Needs your call** = a decision only the team can make (collected in section 9). **Derived** = calculated from the room data. **Gap** = something the product needs that no current document defines.

---

## Index

1. [Short answer](#1-short-answer)
2. [The three flows, refined](#2-the-three-flows-refined)
3. [Auditing the story](#3-auditing-the-story)
4. [The primary scenario, S1: "A room for the person he is now"](#4-the-primary-scenario-s1-a-room-for-the-person-he-is-now)
5. [Supporting scenarios](#5-supporting-scenarios)
6. [The flow inventory](#6-the-flow-inventory)
7. [The chat is an input channel](#7-the-chat-is-an-input-channel)
8. [The next step: user tasks and edge cases](#8-the-next-step-user-tasks-and-edge-cases)
9. [Decisions needed](#9-decisions-needed)
10. [What this changes in earlier documents](#10-what-this-changes-in-earlier-documents)
11. [What I did not do](#11-what-i-did-not-do)

---

## 1. Short answer

1. **The three-flow split holds.** Capture, Preferences, Edit is the right backbone. Two refinements: Capture should include *reviewing and correcting what was found*, and Edit is too large for one flow and splits into six sub-flows (section 2). A fourth flow, *come back and adapt*, exists in your story but is deferred (D-29).
2. **The Aarav story is a strong primary scenario.** It is the first one that lands on the room's real tensions (one tight room, four activities that compete for the same floor). It covers goals 1 to 4. It does **not** cover goal 5 (the space evolves), and it has eleven gaps (section 3.3, numbered SG-1 to SG-11). Most are fixed by adding a line or a beat, not by rewriting the story. Four need a decision from you: SG-1, SG-9, SG-10 and SG-11.
3. **Add two supporting scenarios, not more.** S2, *same room, different person*, proves the guidance is personal. S3, *two weeks later*, makes the deferred Adapt goal visible without building it (section 5).
4. **The flow inventory has 32 flows** (section 6). Five have **no definition in the current design documentation**: rotating an object, moving several objects at once, the chat as a way to give commands, skipping onboarding, and what the user takes away at the end. The chat is the largest.
5. **The chat is an input channel, not a feature.** If we model it as a second way to do what the other flows already do, the endless-input problem becomes a finite one (section 7). That is the foundation for the edge-case work.

---

## 2. The three flows, refined

| Your version | Suggested refinement | Why |
|---|---|---|
| **1. Capture the room**: start a project, scan, get a base room | **Capture and base room.** Add *review what we found* and *correct it* (F8 entries A to D) | Capture is not finished when the scan ends. The base room is only usable once the user has accepted it, and detection errors are normal (F8 principle 1) |
| **2. Preferences**: the form that gives the AI context | **Preferences.** Keep as is, and add *skip* and *change later* | Preferences are not a one-off gate. D-23 says the editor reads them, so a wrong answer must be fixable (F-3), and a user who skips everything needs a defined result |
| **3. Edit**: everything the user can do, until they reach the state they want | **Split into six sub-flows**: Arrange · Understand and decide · Reshape objects · Bring in something new · Ask (the chat) · See and finish | One flow with sixteen parts cannot be tested or designed as a unit. The sub-flows map onto the HMWs: Imagine, Negotiate, Evaluate, Personalise |
| (not in your list) | **4. Come back and adapt** (deferred) | Goal 5. Your own story is about a person who has changed. We defer the feature (D-29) but should still name the flow so the gap is visible |

**One sequencing note.** In the current build the order is Scan, Onboarding, then Processing. In the real product, processing takes time. That makes **Preferences the thing that fills the wait**: the user answers questions while the room is being built. The scenario in section 4 uses this.

---

## 3. Auditing the story

### 3.1 What the story already gives us

| Story element | What it exercises | Project reference |
|---|---|---|
| Moving back home, old room built for a teenager | A real trigger. The person has changed and the room has not | Problem statement; goal 5 |
| "No fixed layout in mind" | Open exploration, not a task with a correct answer | Goal 1; out of scope: a single optimal layout |
| Four activities (working, gaming, relaxing, exercising) | Multifaceted needs in a limited space | Problem statement; F1.1, F1.3 |
| Rearrange existing furniture, maybe buy new | Detected objects, plus objects he brings (test, not shop) | D-07, D-08 |
| "Warm, slightly playful, not overly minimal" | Mood references, suggestions, finishes | Goal 4; taste creates no rules (F1.2) |
| "Does not want to spend an hour recreating his room" | The value of capture | Capture flow; goal 2 |

### 3.2 Coverage against the five project goals

| Goal (section 1.5) | Covered by the story as written | Comment |
|---|---|---|
| 1. Make spatial possibilities easier to explore | **Yes** | |
| 2. Reduce reliance on physical trial and error | **Partly** | The story says he does not want to spend an hour in a planning tool. It does not say what he would otherwise try physically (hauling a desk, buying one that does not fit) |
| 3. Enable more informed decisions | **Partly** | Four activities are named but not set against each other. The conflict is not stated |
| 4. Support meaningful personalisation | **Partly** | Taste is stated. What he keeps from his teenage room, and what he lets go, is not |
| 5. Enable the space to evolve | **No** | The story is about a person evolving. The product defers the feature (D-29) |

### 3.3 Gaps and fixes

| # | Gap | Why it matters | Proposed fix |
|---|---|---|---|
| SG-1 | **The activity list does not match the product's.** Your first paragraph says "getting ready, working, relaxing, exercise". Your list says "working, gaming, relaxing, exercising". The product (F1.1) has Resting, Studying, Working out, Getting ready, Hosting, Art and hobbies, Drying laundry, Plants. There is no Gaming, no Relaxing, and Studying is not Working | Every activity must create a need and a rule (C-6, C-13). **Gaming and Relaxing have no rule today.** S-2 mentions glare, but the threshold register (7.4b) has no glare value, so a gaming desk by a window has no defined test | Use **Working, Gaming, Relaxing, Exercising** as the four. Keep **Getting ready** in *Sometimes* (the dressing table is in the room). Rename Studying to "Working or studying". Add rule rows for Gaming and Relaxing (needs your call) |
| SG-1b | **Four activities exceed the Main cap of three** (F1.3) | Aarav cannot put all four in Main. One bounces to Sometimes | This is useful friction: it forces a real choice. Keep it and test it. If testers find it unfair, raise the cap |
| SG-2 | **Sleep is missing.** It is a bedroom. The bed is more than half of all furniture area (7.5), and it stays where it is in the existing scenario (step 1) | Everything else is arranged around the bed. A remote worker also faces a known tension: the bed in view of the desk | One line in the story: the bed stays and is the fixed point. Optional: his calls make "what is behind the desk" matter. That would be a new rule, so leave it out unless you want it |
| SG-3 | **No priorities.** Onboarding step 4 needs a ranked top three, and the story gives none | Without them, no soft rule has a rank and no card is loud. The v0.1 default (Privacy, Natural light) is not in the new story at all | **Proposed:** 1 Natural light, 2 Open floor, 3 Privacy. Natural light fits a remote worker (light for calls, desk by a window). Open floor fits exercise, and it collides with the door and wardrobe zones (7.5). Privacy third means a sightline is a quiet marker, not a card, which shows the ladder (4.6.3a). Alternative: keep Privacy first as in v0.1 |
| SG-4 | **The conflict is not stated.** Four activities, one room, 46% of the floor already covered (7.5) | A story needs tension. The room supplies it, but the story does not use it | State it: *two things want the same spot.* The window-and-plug spot (south centre) wants the desk. The only workout-sized clear floor is the entry area, where the door swing and wardrobe access live (**Derived**, 7.5) |
| SG-5 | **"Maybe even buy new furniture" crosses a scope line** (out of scope: furniture replacement, shopping) | If the story says he buys through Kith, it breaks D-08. If testers use Edit Object to make the desk bigger, it breaks D-02 | Reword: he *tests something he might buy*, from a product link. A wider desk is an **added object**, never a resized one. Kith never sells |
| SG-6 | **What is in the teenage room?** The story says old room, but not what is in it | Making a room his own is largely choosing what to keep and what to let go. Remove and restore is under-defined (E11), and the sample room has a pile of boxes | Beat: he clears out the boxes and the old school desk, and keeps the bookshelf. The pile of boxes is also the natural **seeded misdetection** (H-4; merged objects, F8 error type 6), so JQ-1 is answered by the story |
| SG-7 | **Family home.** Shared or communal spaces are out of scope. Target users have *primary control* of their space | A reviewer will ask whether this is a shared space. Parents are stakeholders | One line: *his parents have said the room is his to arrange.* The built-in wardrobe and the walls stay fixed, as in D-28 |
| SG-8 | **"Not an hour" cannot be tested as written.** Capture is simulated (D-26, Wizard of Oz) | We would claim a benefit we cannot measure | Test **perceived effort** and **corrections needed**, not minutes. Success signal: he never rebuilds anything by hand, and fixes two things or fewer |
| SG-9 | **Taste has little to act on.** Mood references only change Suggested items, finishes and wording. "Not overly minimal" may also collide with the Open floor priority, and decluttering is out of scope | If every added rug or plant triggers a floor warning, the system reads as "be minimal" | State what taste changes (Suggested tab, finishes) and what it does not (no rules). Check that guidance never reads as "remove things". Refine mode (wall colour) is undefined (G-3 in the open questions) and the old whole-room palette (JQ-2) has no home |
| SG-10 | **Goal 5 has no beat.** His story is about change over time | A reviewer will see the strongest story in the project and a deferred feature | Add an epilogue beat and a third scenario (S3). Do not build it |
| SG-11 | **The story has no ending.** You described the user reaching "the final state of what they desire". After Confirm, saved arrangements are deferred (D-29) and no other output of any kind is defined | A decision tool that gives nothing to take to the real room leaves the physical part to memory. The board's own limitation is that a result still needs real-world validation | Needs your call. Options in section 9, item 6. Recommendation: a short list of what to move in the real room |

---

## 4. The primary scenario, S1: "A room for the person he is now"

**Aarav.** He has just taken a remote job and moved back to his hometown. His old room was made for his teenage self. He wants to set up a work-from-home space and make the room his own, as a chance to make it feel intentional while still supporting the way he lives.

**What he knows.** The old layout no longer works. He works, games, relaxes and exercises. He wants warm and slightly playful, not overly minimal. He will rearrange what he has and might try something new. He will not spend an hour rebuilding the room in a planning tool.

**Added by this audit (marked below).** His parents have said the room is his. The bed stays. His top three priorities are Natural light, Open floor, Privacy. Two things want the same spot.

**Source column:** *Story* = from your description. *Added* = from section 3.3, with the gap number. *Reused* = taken from [kith-user-journeys.md](./kith-user-journeys.md), with its journey number.

### 4.1 Beats

| # | Aarav does | Flows | Goals | Source |
|---|---|---|---|---|
| **Capture** | | | | |
| 1 | In the old room, boxes still stacked. Starts a project, taps *Scan my room*, sweeps it with his phone | C1, C2 | 2 | Story |
| 2 | While the room is processed, he answers questions about himself | C3 with P1 to P5 | 1 | Added (section 2) |
| 3 | *Here's what we found*: the pile of boxes was read as one object. He taps **Not right?** and says it is several things he wants gone | C4, C5 | 3 | Added (SG-6). Reused: J5 |
| **Preferences** | | | | |
| 4 | Names the project, adds two references (warm wood, a playful rug), picks **Redesign** | P1, P2 | 4 | Story |
| 5 | Sorts activities. Working, Exercising and Relaxing go to **Main**. A fourth bounces. Gaming goes to **Sometimes** | P3 | 3 | Added (SG-1, SG-1b) |
| 6 | Picks Natural light, Open floor, Privacy, in that order. Reads the recap | P4, P5 | 3 | Added (SG-3) |
| **Edit** | | | | |
| 7 | First look around. Presses and holds his old school desk, and it comes off the floor as a box | E1, E2 | 1 | Reused: J1 |
| 8 | Clears out. Removes the boxes and the old desk. Keeps the bookshelf | E11 | 4 | Added (SG-6) |
| 9 | Wants a bigger desk. Pastes a product link. Confirms the type. Sees the size chip *From product page* | E12, E9 | 2 | Story, reframed (SG-5) |
| 10 | Drags the new desk to the window wall. The connection line stretches toward a plug. The plug between the windows is behind the fan, so the card names the fan. He moves the fan. The line turns green. A quiet marker says the desk is in view from the door (Privacy, third) | E2, E6, E7 | 3 | Reused: J2, changed (SG-3) |
| 11 | The desk must serve both work and gaming. The window gives daylight and also glare on the gaming screen. **Show options** gives two ghost positions: *facing the window* and *side-on to the window* | E7, E3 | 3 | Added (SG-1). **Needs a glare rule** |
| 12 | Exercise. Adds a yoga mat (gallery, *Estimated from photo*). The only clear patch is in the entry area, where the door swing and wardrobe front are. The card explains the trade-off. He decides | E12, E7 | 3 | Added (SG-4). Derived 7.5 |
| 13 | Relax. Adds a lounge chair (gallery) and a lamp. Adds a rug and a plant from Suggested. Asks the AI for a warmer rug (finish only) | E12, E10, E13 | 4 | Reused: J6, J7 |
| 14 | Selects the chair, lamp and plant and asks the AI where they could go. It offers positions. Nothing moves by itself | E4, E13 | 1, 3 | Added. Your own example task |
| 15 | Confirm. Reads the review, sees every box become a 3D model, looks around | E14 | 2 | Reused: J2 steps 9, 10 |
| 16 | Leaves with a short list of what to move on Saturday | E15 | 2 | Added (SG-11). **Needs your call** |
| 17 | *Epilogue.* A month later he has started going to the gym and wants a weekday layout and a weekend layout | S3 | 5 | Added (SG-10) |

### 4.2 Success signals for S1

1. He reaches a first move without rebuilding anything by hand, and fixes two things or fewer (SG-8).
2. He can say why each flag appeared and which priority of his caused it (H6).
3. The four activities visibly compete, and he makes the trade-off himself (SG-4).
4. The room feels like his: references appear as suggestions, he decided what to keep, and he did not feel the system chose for him (goal 4, P1).
5. He knows what to do next in the real room (SG-11).

### 4.3 What the room can and cannot show (**Derived**)

| Fact from the room data (7.5, 7.3) | Consequence for S1 |
|---|---|
| Plug B is behind the pedestal fan | Beat 10 works as written. The best desk spot starts with a clash another object causes |
| The only 2 × 1 m clear patch is in the entry area | Beat 12 is a real conflict, not a staged one |
| The narrowest walkway is about 0.77 m (T-03 is 0.75 m) | A wider desk or an added chair can trip the walkway check, depending on where it goes. Check it feels fair |
| The bed is 3.0 m² and stays | Both the desk and the mat are placed around it |
| 46% of the floor is covered | Adding a lounge chair, rug and plant will use most of what remains |

---

## 5. Supporting scenarios

### 5.1 Coverage of the goals

| | S1 Aarav, primary | S2 Same room, different person | S3 Two weeks later |
|---|---|---|---|
| Goal 1 Explore | Full | Partial | Partial |
| Goal 2 Less physical trial and error | Full | Partial | Partial |
| Goal 3 Informed decisions | Full | **Full, by contrast** | None |
| Goal 4 Personalisation | Full | Partial | None |
| Goal 5 Evolve | Partial (epilogue only) | None | **Full, but not built** |
| Flow 1 Capture | Full | Pre-done | Not defined (no flow for updating the scan) |
| Flow 2 Preferences | Full | Full (different answers) | Partial (change later) |
| Flow 3 Edit | Full | Partial | Partial |

### 5.2 S2: "Same room, different person"

| | |
|---|---|
| **Purpose** | Prove that guidance is personal (D-23, H6, F-4). The same move gives different feedback to a different person |
| **Who** | A second person in the same room (D-28: it is the only room). Placeholder: reuse the v0.1 profile. Privacy first, Natural light second. Main: Resting, Studying, Getting ready. Sometimes: Hosting friends. Details are missing (JQ-3) |
| **How** | Not a full story. A short second pass in a test session: repeat beats 9 and 10, the desk move to the window wall |
| **What differs** | The privacy sightline is a **card** for this person (Privacy first) and a **marker** for Aarav (Privacy third). There is no protected exercise patch. The activities protect different zones |
| **Also carries** | Keep it and Room Check (J3), which S1 only touches lightly |
| **Why not a full story** | The room is the same, so a full second story would repeat S1. The contrast is the finding |

### 5.3 S3: "Two weeks later" (documented, not built)

| | |
|---|---|
| **Purpose** | Make goal 5 visible without building it. D-29 stays |
| **Story** | He moved the furniture in the real room. The scan no longer matches. He has started going to the gym, so exercise matters less, and gaming matters more. He wants one layout for weekdays and one for the weekend |
| **Flows touched** | P7 change preferences later. X3 saved arrangements (deferred). **No flow exists** for updating the scan after the real room changes, or for comparing two layouts. That absence is the point. Whether you want such flows is item 9 in section 9 |
| **How to use it** | As an interview prompt at the end of a test session, not a build. Ask: *would you come back to this, and what would you want to find?* |
| **Why** | The story is about change. If the prototype has nothing to say about change, a reviewer will see it as the hole in the project |

---

## 6. The flow inventory

### 6.1 How to read it

Flows are grouped by your three categories, plus a cross-cutting group. IDs are new (**C**apture, **P**references, **E**dit, cross-cutting **X**) so they do not clash with `F1` to `F8` in the design documentation. Each row points to its source, which is always a current document or your own words.

**Status:** **Defined** = specified in the current design documentation. **Partly** = exists but incomplete or out of date. **Gap** = needed, no definition in the current design documentation. **Deferred** = decided to defer. **Out** = out of scope for this phase.

### 6.2 Capture and base room

| ID | Flow | Status | Source | S1 beat | Cases to cover |
|---|---|---|---|---|---|
| C1 | Start a project: Room (360°) or Zone (photo) | Defined | F1; PROTOTYPE | 1 | Room or Zone. The prototype continues with the sample room either way |
| C2 | Capture the room | Built, simulated | PROTOTYPE | 1 | A 360° sweep or a single photo. Whether the prototype shows a poor scan at all is item 9 in section 9 |
| C3 | Processing, base room ready | Built | F1 step 5 | 2 | The recap must match what the editor really does (F-7) |
| C4 | *Here's what we found*: review the uncertain items | Defined, not built | F8 entry C | 3 | Skip it; zero uncertain; two uncertain |
| C5 | Correct a detection | Defined, scripted | F8; H-1 to H-8 | 3 | The seven error types in F8: wrong type, wrong size, wrong fixed or movable, missed, false, merged, wrong setting. The four entry points in F8. Undo a correction |
| C6 | Zone capture (one photo) | **Partly** | G-2 in the open questions | none | Fewer rules run, and the product says so |

### 6.3 Preferences

| ID | Flow | Status | Source | S1 beat | Cases to cover |
|---|---|---|---|---|---|
| P1 | Name, add references | Built | F1.2 step 1 | 4 | Skip; preset, gallery, Pinterest link; a bad link |
| P2 | Choose Redesign or Refine | Built, Refine undefined | F1; F7 | 4 | He chooses Refine: the product must say honestly that nothing changes yet |
| P3 | Describe the room and sort activities | Defined, not built | F1.3 | 5 | Main cap hit; add your own; edit the description by hand; tap instead of drag; nothing in Main |
| P4 | Rank priorities | Defined | F1.1 | 6 | None, one, two or three picked; free text "noted, not checked"; reorder |
| P5 | Recap and profile | Defined | F1.2 | 6 | The recap must match what the editor really does |
| P6 | **Skip or default path** | **Gap** | none | none | Skips every optional step. What does the editor do with an empty profile? |
| P7 | Change preferences later | **Partly** | F-3, Room Check | S3 | Change priorities or activity weight. What happens to heads-ups already dismissed (H-6)? |

### 6.4 Edit

| ID | Flow | Status | Source | S1 beat | Cases to cover |
|---|---|---|---|---|---|
| | **Arrange** | | | | |
| E1 | Orient: first minute in the room | **Partly** | J1; W15 | 7 | Does not find hold-and-drag; the 3D room is not his photo |
| E2 | Move one object: hold, drag, release, stage | Defined, built | F2 | 7, 10 | Linked pair; snap to the wall; edge auto-pan; pick up again; wall objects; objects on a surface (B-5, later) |
| E3 | **Rotate or change facing** | **Gap** | Design doc 4.2 lists "facing" and J2 offers "face the wall" as an option, but F2 has no step for it | 11 | How does the user change facing: through Show options, through the chat, or another way? Section 9, item 8 |
| E4 | **Move several objects at once** | **Gap** | Your example task. The design docs define no multi-select | 14 | Two or more selected; "suggest positions" (your example). How the user selects several objects at all is undefined |
| E5 | Undo, redo, discard staged | **Partly** | A-10; state diagram 4.3 | none | Undo after Confirm (D-Q11: the canvas stays live); undo a Keep it; discard staged changes |
| | **Understand and decide** | | | | |
| E6 | Read live signals while dragging | Defined | 4.6.4 | 10 | Two at once at most; colour-blind second cue |
| E7 | Resolve a heads-up: Keep, Undo, Show options | Defined | F5 | 10 to 12 | Several conflicts; ignored card becomes a marker; picked up again within a second; same situation versus new problem |
| E8 | Room Check: review and revisit | Defined | D-Q9 | none | Open; kept; about your room today; restore a dismissed one; corrections list |
| | **Reshape objects** | | | | |
| E9 | Edit Object: dimensions, type, needs, link | Defined | F3 | 9 | Limits; reset to detected; proportion lock; an estimated chip; typing a size that makes the walkway tight |
| E10 | Change finish with AI | Defined | A-7 | 13 | A request that changes shape, size or type: decline and point to Edit Object. Preview; revert |
| E11 | Remove and restore an object | **Partly** | State diagram 4.3; B-9 | 8 | Remove a detected, added or linked object; remove the pile that holds the power strip; restore from Removed (B-9) |
| | **Bring in something new** | | | | |
| E12 | Add by image, link or Suggested, then place | Defined, scripted | F4; D-33; B-2; B-3 | 9, 12, 13 | Only the prepared set works; a busy photo, several items or a person in it (B-2); a link with no size, or several sizes (B-3) |
| | **Ask (chat)** | | | | |
| E13 | **Ask the AI**: ask, suggest, explain, restyle, command | **Gap** | Design doc 4.6.7 and the AI tab (8.1). An AI assistant is built but scripted (3.1) | 13, 14 | See section 7 |
| | **See and finish** | | | | |
| E14 | Confirm: review, 3D models, keep editing | Defined | F6 | 15 | Zero open; many open; nothing staged; discard |
| E15 | **What the user takes away** | **Gap** | Your words: "the final state of what they desire" | 16 | Section 9, item 6 |
| E16 | Refine mode | Undefined | F7; G-3 in the open questions | none | See SG-9 |

### 6.5 Cross-cutting

| ID | Flow | Status | Source | Cases to cover |
|---|---|---|---|---|
| X1 | Resume a project | **Partly** | G-5 in the open questions | What survives a reload: dismissals, refined sizes, added objects (G-5) |
| X2 | Shopping | Out | D-08; section 1.4 | |
| X3 | Saved arrangements, and switching between them | Deferred | D-29 | S3 |

### 6.6 What the inventory shows

| Finding | Count |
|---|---|
| Flows in total | 32 |
| **Gap** (no definition in the current design documentation): E3, E4, E13, E15, P6 | 5 |
| **Partly** defined: C6, P7, E1, E5, E11, X1 | 6 |
| Flows used by no S1 beat | C6, P6, E5, E8, E16, X1, X2, X3. P7 appears only in S3 |

Flows no scenario reaches are the best candidates for the **user tasks** in the next step.

---

## 7. The chat is an input channel

> Superseded for 7.1 to 7.3 by [spec/modules/ai.md](../spec/modules/ai.md) (2026-11-11). Section 7.4 describes the old build.

Your concern: *there is no limit to what the user can type.* The way to bound it is to stop treating the chat as a feature. Every message is a **request**, and every request resolves into one of a small number of outcomes. The chat is a second way to do what the touch flows already do.

### 7.1 What a message can be

| Intent | Example | Handled as |
|---|---|---|
| **Do** | "Move the desk to the window." "Remove this." "Rotate it." | The same action as the touch flow, ending in the same staged state and the same rules |
| **Suggest** | "Where could these go?" | Ghost positions with trade-offs (E7). Never "best" (D-19) |
| **Explain** | "Why is this flagged?" | The reason text, naming the priority (4.6.5) |
| **Style** | "Make the rug warmer." | Finish only (A-7). Shape, size and type: decline and point to Edit Object |
| **Add** | "Add a bookshelf." | No catalogue (D-08). Offer Suggested items or the Add flow |
| **Ask about the room** | "How wide is my desk?" | Numbers live only in Edit Object (D-06). Decide whether chat may state them |
| **Out of scope** | "Paint the wall green." "Knock down the wardrobe." "Where can I buy this?" | Say plainly it is not possible here, and say what is |
| **Unclear** | "Move it." "Make it better." | One question with tap options. Use the current selection as context |
| **Against the rules** | "Put the bed in front of the door." | The rules apply exactly as for touch. The chat is not a back door |
| **Not a task** | Greetings, other topics, abuse, an empty message, a very long one | A brief reply and no change to the room |

### 7.2 Five possible outcomes

Every request ends in one of: **Stage a change** (as a proposal the user accepts), **Suggest**, **Explain**, **Ask one question**, or **Decline and offer an alternative.** The edge cases are the combinations of intent and state, not an open list.

### 7.3 A conflict to resolve

Design documentation 4.6.7 says the AI *"never moves an object without the user's tap."* A user who types "move the desk to the window" expects it to move. **Proposed:** a chat command **stages** a change as a proposal with an **Apply** tap. That keeps the principle (the tap is Apply) and routes the change through the same rules and heads-ups. **Needs your call.**

### 7.4 What the code does today

The AI sheet is driven by the scripted scenario. It has a free-text message path and a fixed set of guided steps. A free-text message is sent to a model through an API proxy, constrained to the scenario. Nothing in the code maps a message to an action on an arbitrary object.

---

## 8. The next step: user tasks and edge cases

Your pipeline is **scenarios, then user tasks, then edge cases**. This inventory is the input.

**A user task** is one goal a tester is asked to do, mapped to one flow or two. Examples: *"Select the chair, lamp and plant and ask for positions"* (E4 with E13). *"Remove the old desk by typing in the chat"* (E11 with E13).

**Edge cases come from eight axes.** For each task, vary one axis at a time, then combine the likely ones.

| Axis | Values |
|---|---|
| Selection | None · one · several · mixed origins · includes a fixed element · includes a staged or removed object |
| Object state | Placed · lifted · staged · being edited · removed |
| Input channel | Touch · chat · both interleaved · the tap alternative where one exists (F1.3) |
| Intent clarity | Clear · unclear · against the rules · out of scope |
| Rules outcome | None · Inform · Warn · Block · several at once |
| Data certainty | Detected · edited · estimated · a seeded error |
| Timing and interaction faults | Double tap; release mid-animation; drag off screen; leave mid-flow; a reply that arrives after the state has changed; undo while a request is pending |
| Persistence | Reload mid-task; resume with unconfirmed changes |

**Worked example.** *An object is selected, and the user types "remove it" although a Remove button exists.* Intent: Do. Selection: one. Channel: chat. **Result:** the same staged removal as the button, with an Undo. *Variants:* two objects selected, so ask which; nothing selected and "it" is unclear, so ask; the selected object is linked, so say its partner stays; the object is a fixed element, so decline; the object is already removed, so say so; an Undo requested while the reply is pending.

This is the template for the full catalogue.

---

## 9. Decisions needed

> Superseded by [spec/open-items.md](../spec/open-items.md) (2026-11-11). Each open question here carries a pointer to its new ID (→ OI-nnn).

| # | Question | Recommendation |
|---|---|---|
| 1 → OI-040 (closed: DEC-027) | **Activities.** Adopt Working, Gaming, Relaxing, Exercising, with Getting ready in Sometimes, and add rule rows for Gaming and Relaxing? Keep the Main cap of three? | Yes to both. The cap forces the real choice |
| 2 → OI-053 | **Aarav's priorities.** Natural light, Open floor, Privacy, or keep Privacy first? | The first. It gives a card, a marker and a conflict in one run |
| 3 → OI-052 (closed: DEC-059) | **Family home.** Add the line that his parents have said the room is his? | Yes. It keeps the story inside scope |
| 4 → OI-056 (closed: DEC-058) | **Supporting scenarios.** Adopt S2 as a second pass, and S3 as an interview prompt only? | Yes |
| 5 → OI-004 (closed: DEC-004) | **Adapt (D-29).** Reopen it in light of the story? | No for the build. Keep S3 so the need is recorded in testing |
| 6 → OI-005 (closed: DEC-005) | **The ending (E15).** (a) Nothing beyond the screen. (b) A short list of what to move in the real room. (c) Something else you have in mind | (b). It is the smallest thing that bridges to the real room |
| 7 → OI-020 (closed: DEC-018) | **Chat commands.** Stage as a proposal with an Apply tap? | Yes (section 7.3) |
| 8 → OI-010 (closed: DEC-016) | **Rotation (E3).** Facing changes only through Show options and the chat, or a control on the object? | Show options and chat only. The design documentation already offers "face the wall" as a ghost option (J2), and P3 rules out gizmos. This is my suggestion, not a decision in the documents |
| 9 → OI-063 | **Topics with no flow.** What happens when a scan is poor or fails, and does the user ever re-scan or compare layouts? Do you want any of these in the prototype? | Your call. I have not assumed any |
| 10 → OI-054 (closed: DEC-060) | **The prepared set (D-37, B-13, JQ-7).** The story needs a wider desk (link), a lounge chair (gallery) and a yoga mat (gallery). JQ-7 proposed two objects | Three, replacing the guest chair and bookcase. The set now follows the story |
| 11 → OI-055 (closed: DEC-061) | **Seeded error (H-4, JQ-1).** Use the pile of boxes? | Yes. The story motivates it, and merged objects (F8 error type 6) is its error class |

---

## 10. What this changes in earlier documents

| Document | Change if accepted |
|---|---|
| kith-user-journeys.md, 2.1 and 2.2 | Aarav's facts change. *Compact rented bedroom* becomes *his old room at home*. "Why now" (marked *Needed*) is now supplied. Details such as age and family are still missing (JQ-3) |
| kith-user-journeys.md, section 6 | The prepared set changes from two objects to three (item 10) |
| Journey numbering | The design documentation (section 6) and the journeys doc number their journeys differently. Design doc J1 is journeys-doc J2, design doc J2 is J4, J3 is J6 and J4 is J3. Retire the J-numbers in the design documentation and refer to the journeys doc |
| kith-design-documentation.md, 1.2 | The sample user description |
| kith-design-documentation.md, F1.1 and F1.3 | The activity list; the Main-cap example |
| kith-design-documentation.md, 4.5 | The prepared set (provisional, D-37) |
| kith-design-documentation.md, 7.4 and 7.4b | New soft rows for Gaming and Relaxing, and a glare value |
| kith-design-documentation.md, 9.2 | A hypothesis on effort: *he never rebuilds anything by hand* |
| kith-open-questions.md | B-13 and D-37 (the set), H-4 (seeded errors), G-1 (Adapt) in the open questions, and a new entry for the chat commands (item 7) |

---

## 11. What I did not do

- I did not edit any other file.
- I did not define flows for a poor or failed scan, comparing layouts, re-scanning after a real-world change, or errors and offline. They are a question for you (section 9, item 9), not an assumption.
- I did not run the prototype. The statuses in section 6 come from the documents and a read of the AI sheet, not from using the build. Items marked *Built* should be checked.
- I did not write the edge-case catalogue. Section 8 gives the method and one worked example.
- I did not define the rules for Gaming or Relaxing, the glare value, or the rotation interaction. They need your decisions first.
- Every effort and time figure carries over from earlier documents. I added none.
