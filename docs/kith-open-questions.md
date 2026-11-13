# Kith: Decision Log and Open Questions

Status: working draft, 2026-11-10. Companion to [kith-design-documentation.md](./kith-design-documentation.md).

This file has two parts:

1. **Decision log**: what the team has already decided (taken from the team's written answers on 2026-11-10). The design documentation treats these as fixed.
2. **Open questions register**: everything still undecided, grouped by area, each with a recommendation so you can accept, change or reject it.

**Priority key**
- **P0**: blocks the rebuild. Decide before any new prototype work starts.
- **P1**: shapes the design. Decide before the detailed flows are final.
- **P2**: can be settled during the build or in the first round of testing.

**Source key**: a recommendation marked *Rec* is my suggestion, not a team decision.

---

## Index

1. [Part 1. Decision log](#part-1-decision-log)
2. [Part 2. Open questions register](#part-2-open-questions-register)
   - [A. Edit Object view and dimension refinement](#a-edit-object-view-and-dimension-refinement)
   - [B. Adding objects](#b-adding-objects)
   - [C. Constraint model (what counts as hard, what counts as soft)](#c-constraint-model-what-counts-as-hard-what-counts-as-soft)
   - [D. Feedback model (what the user sees and when)](#d-feedback-model-what-the-user-sees-and-when)
   - [E. Room model, rules and the scripted prototype](#e-room-model-rules-and-the-scripted-prototype)
   - [F. Onboarding to editor link](#f-onboarding-to-editor-link)
   - [G. Product scope and testing](#g-product-scope-and-testing)
   - [H. Detection errors and correction](#h-detection-errors-and-correction)
3. [Conflict handling options (for D-Q7)](#conflict-handling-options-for-d-q7)
4. [Suggested order to resolve (P0 only)](#suggested-order-to-resolve-p0-only)

---

## Part 1. Decision log

| ID | Decision | Area |
|---|---|---|
| D-01 | In the normal flow the user never enters dimensions. The app detects them. The user may *refine* them. | Dimensions |
| D-02 | Refining dimensions means **correcting a wrong detection**. It is not for exploring "what if the desk were bigger" and not for replacing furniture. | Dimensions |
| D-03 | There is **no resize handle** on the canvas. Reasons: objects are thumbnails, size is hard to judge in 3D, and drag is already used to move. Resizing happens only in the Edit Object view. | Dimensions |
| D-04 | A dimension change updates the object's **3D bounding box (wireframe)**. The furniture is re-rendered over it when the user taps **Confirm**. | Dimensions |
| D-05 | A dimension change affects **only that object** and its own clearances. | Dimensions |
| D-06 | **No numbers** are shown while dragging or during other normal interactions. Numbers appear only inside the Edit Object view. | Principle |
| D-07 | Users can **add objects that were not in the room**, using an **image** (camera or gallery) or a **product link** (system sources the image and the dimensions). This is a deliberate small scope expansion. | Adding objects |
| D-08 | There is **no furniture repository or catalogue** for now, because that drifts into shopping. | Adding objects |
| D-09 | The Assets area has: objects **detected in the room**; **suggested** objects (from the user's references, only things the room lacks); and a **separate tab for manually added** objects. | Adding objects |
| D-10 | Add flow: tap Add → pop-up asks where the image comes from (camera or gallery) → user picks an image → lands in the **Edit Object view**. | Adding objects |
| D-11 | The **Edit Object view is the same for every object** (detected, suggested, added). It holds dimension edits and AI-assisted changes. | Edit Object |
| D-12 | For an added object the system builds a **3D bounding box from the image(s)**. On Confirm, the object is rendered using the image as visual reference and the bounding box as geometric reference. | Adding objects |
| D-13 | Clearance and spatial guidance is **for all users**. Its job is to make constraints visible so the user can decide and, if they want, override. | Constraints |
| D-14 | **Hard constraints** are non-negotiable facts: plug points, windows, built-in furniture, and anything physically impossible (for example a bed that blocks the entry door). | Constraints |
| D-15 | **Soft constraints** come from the user's onboarding preferences (for example Privacy) and are **prioritised**. Qualities the user did not pick (for example airflow) are still watched, at **low priority**. *Reversed in part by DEC-029 (2026-11-11): qualities the user did not pick are **not** watched. Room facts are always watched.* | Constraints |
| D-16 | While dragging an object, the relevant fixed element **changes colour red → green** by how well the placement works (example: plug point colour by distance from a table). Red means a problem. | Feedback |
| D-17 | When an object is dropped in a red state, the system shows a **pop-up warning**. The user stays free to keep the placement. | Feedback |
| D-18 | For soft constraints the system asks, in effect: "This isn't followed. Do you still want it, or do you want suggestions?" | Feedback |
| D-19 | **AI offers suggestions**. The user chooses. | Feedback |
| D-20 | Thresholds and clearances are derived from **room geometry, object sizes and object types**. | Rules |
| D-21 | Warnings can be **dismissed**, and the system **remembers** the dismissal. | Feedback |
| D-22 | Logic is **per room**. Objects are elements inside it. Object type can change which logic applies. | Rules |
| D-23 | Onboarding answers **do** feed the editor. The existing 10-step scenario was written from a persona and story. | Onboarding link |
| D-24 | There is **no rule structure yet**. One has to be built for the sample room, and the script has to be refined. | Rules |
| D-25 | When a single object triggers several conflicts, **show all of them**. *How* to show them is still open (see D-Q7 below). | Feedback |
| D-26 | We define everything on paper first, then build a **fully new prototype**. The current prototype is a reference, not the baseline. | Process |
| D-27 | **Rendering in this prototype:** no 360° images and no image generation. Staging shows the bounding box. On Confirm, the object appears as a **3D model** at its position and size. Image generation is a later phase. | Rendering |
| D-28 | The **existing room model is the accepted base** and the **only room** in this prototype. Its dimensions are not up for change. | Room | *Refined by DEC-062 (2026-11-11): a scenario may start from a different arrangement of the movable furniture. The room's fixed elements and dimensions stay.*
| D-29 | The **Adapt** capability (saved or compared arrangements) is **deferred** to a later phase. *Partly reversed by DEC-004 and DEC-009 (2026-11-11): saving, reopening and duplicating layouts are in scope. Comparing stays deferred.* | Scope |
| D-30 | The team adopted the **Block / Warn / Inform** response model. What exactly is blocked is proposed in design documentation, section 4.6.2. (The message said "block one and informed model". I read it as the three-level model. Correct me if you meant only Block and Inform.) | Constraints |
| D-31 | **Block is invisible.** The user simply cannot do the blocked thing (for example move an object outside the room). There is no message, card, colour or sound. **Sealing the entrance is a Warn, not a Block.** | Constraints |
| D-32 | The **six onboarding priority options** are accepted: Privacy, Natural light, Fresh air, Open floor, Easy storage access, Restful sleep. | Onboarding |
| D-33 | **Added objects are scripted.** A prepared set of images exists, the user picks one, and each has a prepared 3D model. It behaves like every other object: bounding box while staged, 3D model on Confirm. | Adding objects |
| D-34 | Feedback has two modes: **passive** (live while dragging, never interrupts) and **active** (after a drop, the system speaks). The options for active feedback are analysed in design documentation, section 4.6.3a. | Feedback |
| D-35 | The live plug signal is a **connection line plus a colour tint** on the plug (green, amber, red), while dragging. | Feedback |
| D-36 | An ignored card **collapses to a marker attached to the object in the clash** and stays open. It applies to warning cards and to information about a conflict. | Feedback |
| D-37 | The **prepared set of added objects is deferred** until the user journeys are mapped. The five objects in the design doc are provisional. | Adding objects |
| D-38 | **No "keep in place" lock.** If the user wants something to stay, they don't move it, and it clashes with nothing. | Editor |
| D-39 | Activity weight (**Main** or **Sometimes**) is captured on onboarding step 3 by dragging activity bubbles into a Main section or a Sometimes section. | Onboarding |
| D-40 | Next steps, in order: map the user journeys, refine the plan from them, then make low-fidelity wireframes and options. | Process |
| D-41 | **Seeded errors are in the prototype.** A few deliberate mistakes in the room model, switched on by the facilitator, so the correction flow ("Not right?") can be tested. | Testing |

---

## Part 2. Open questions register

> Superseded by [spec/open-items.md](../spec/open-items.md) (2026-11-11). Each open question here carries a pointer to its new ID (→ OI-nnn).

### A. Edit Object view and dimension refinement

| ID | Question | Options / Recommendation | Pri |
|---|---|---|---|
| A-1 | Which objects can have their dimensions edited? Movable furniture is clear. What about **fixed elements** (door, windows, wardrobe, AC)? The existing data already has `canEditSpecs` for them, and their size drives rules (door width sets the swing zone). | **Updated (D-28):** the room model is accepted as is, so fixed elements are **not editable** in this prototype and the "Check your room" step is deferred. Movable and added objects are editable in the editor. | P2 |
| A-2 → OI-061 (closed: DEC-054) | What is the input control for a dimension: typed number, stepper, or slider? Which units, and does the unit follow locale (cm / inches / feet)? | *Rec*: typed number with +/− stepper. Show the **detected value beside the field** as the reference. Default unit follows device locale, with a toggle. | P1 |
| A-3 → OI-061 (closed: DEC-054) | Are width, depth and height edited independently, or is there a proportion lock? | *Rec*: independent fields, with "keep proportions" **on** by default. Height matters for rendering and for tall-object rules. | P1 |
| A-4 → OI-061 (closed: DEC-054) | Do we guard against nonsense values (a 20 cm bed, a 5 m desk)? | *Rec*: hard limits per object type (outside them the field refuses), plus a soft message when the edit is far from the detected value ("That's quite different from what we detected"). | P1 |
| A-5 → OI-061 (closed: DEC-054) | How does the user know the *true* size? Many won't have a tape measure to hand. | *Rec*: do not build measuring tools in v1. Show the detected value, allow edit, allow "Reset to detected". Learn from testing whether people ask for help here. | P2 |
| A-6 → OI-090 | D-05 says only that object is affected. Please confirm the precise meaning: after a bed grows, every **rule check that involves the bed** (its clearances to the walls, door, walkway) is recalculated, but **no other object's own dimensions change**. | *Rec*: adopt that definition. Otherwise a wider bed that leaves a narrow walkway would not warn the user. | P0 |
| A-7 → OI-021 (closed: DEC-025) | What can "change the object using AI" do in the Edit Object view? D-02 says no replacement, so where is the line? | *Rec*: **finish only** (colour, material, upholstery, style matched to a reference). Not shape, not type, not size. Size stays in the dimension fields. | P0 |
| A-8 → OI-061 (closed: DEC-054) | Does the Edit Object view have its own preview or render, or does it only stage a wireframe and return to the room, where one Confirm covers everything? | *Rec*: it shows the wireframe (and for finish changes a rendered preview) and returns to the room staged. Rendering the whole set stays on the single **Confirm**, so there is one consistent rule: "nothing is drawn until you confirm". | P1 |
| A-9 → OI-012 (closed: DEC-013) | Entry points: how does a user reach Edit Object? | *Rec*: tap the object → action chips (Move, Edit, Remove). Also from the Assets tab. Also automatically after adding. | P1 |
| A-10 → OI-015 (closed: DEC-034) | Reset and history: can the user go back to the detected values or to a previous render of an object? | *Rec*: "Reset to detected" per object. Global undo/redo already exists on the canvas. | P2 |

### B. Adding objects

| ID | Question | Options / Recommendation | Pri |
|---|---|---|---|
| B-1 → OI-019 (closed: DEC-037) | Assets tab structure. Today: All / Suggested / Owned. D-09 calls for a third group. | *Rec*: **In this room / Suggested / Added**. Drop "All". "Owned" is misleading because an added object may be something the user does not own yet. | P0 |
| B-2 → OI-062 | What image input do we accept? One photo or several angles? What if the photo has a busy background, several items, or a person in it? | *Rec*: one photo to start, optional second angle. The system isolates the main object and asks the user to confirm "Is this the one?". | P1 |
| B-3 → OI-062 | Product link: which sites, and what if the page has no dimensions, or several sizes? | *Rec*: accept any pasted URL. If dimensions are missing, fall back to the image-based estimate and mark it "estimated". If several sizes exist, ask the user to pick one. No search, cart or prices (see D-08). | P1 |
| B-4 → OI-062 | Who tells the system **what the object is**? The rules need a type (bed, rug, lamp, chair) to decide what applies. | *Rec*: system guesses, user confirms with one tap in Edit Object ("What is this?"). Required before the object can be placed. | P0 |
| B-5 → OI-018 (closed: DEC-038) | Which placement planes are in scope for the first rebuild: floor, wall, ceiling, on top of another object? | *Rec*: **floor and wall** first. Ceiling and surface objects (lamp on a desk) later. | P1 |
| B-6 → OI-062 | How accurate is the estimated bounding box from an image, and how do we say so? | *Rec*: label every dimension with its source chip: *Detected*, *You edited*, *From product page*, *Estimated from photo*. Estimated ones are visibly less certain. | P1 |
| B-7 | What can the prototype actually render for an added object? A real render for any photo is not possible in a Wizard of Oz build. | **Updated (D-27):** rendering is now a 3D model, not a generated image. Still prepare **2 or 3 sample added objects** (for example a rug, a floor lamp, an armchair). Testers use those. Everything else is described honestly as "coming". **Resolved (D-33):** the set is prepared. Its contents are B-13. | Resolved |
| B-8 → OI-065 | Are added objects kept only in this project, or in a personal list across projects? | *Rec*: project only (D-08). Revisit after testing. | P2 |
| B-9 → OI-014 (closed: DEC-033) | Where do **removed** objects go (the old design had "Hidden items")? | *Rec*: a fourth group inside the Assets tab, "Removed", so the user can bring them back. | P2 |
| B-10 → OI-019 (closed: DEC-037) | How many **suggested** objects, and are they sized and rule-checked like the rest? | *Rec*: yes, identical treatment, with generic default sizes the user can refine. Limit to a small set (3 to 5) so the tab stays calm. | P1 |
| B-11 → OI-062 | Is a placed added object edited and moved with the same gestures as a detected one? | *Rec*: yes, identical. The only difference is the origin badge. | P1 |
| B-12 | **What does an added object look like in 3D?** With D-27 there is no generated image, so a photo-added object still needs a 3D appearance. | Options: (a) a generic 3D model for its type, scaled to the bounding box, with colour taken from the photo; (b) the photo as a flat card standing inside the box; (c) the photo wrapped onto the box. **Resolved (D-33):** everything added is scripted. The user picks from a prepared set of images and each has a prepared 3D model. | Resolved |
| B-13 → OI-054 (closed: DEC-060) | **Contents and entry paths of the prepared set.** Which objects, and how do the Camera and Product link options behave when everything is scripted? | *Rec*: five objects (see design documentation, section 4.5). Gallery shows the prepared images. Camera opens a simulated capture that resolves to one of them. A pasted link, whatever it is, resolves to the next prepared "link" object. Mix the source chips (*From product page* and *Estimated from photo*) so the chips can be tested. **Deferred (D-37):** define the set from the user journeys first. The journey map (kith-user-journeys.md) recommends a smaller set. | Deferred |

### C. Constraint model (what counts as hard, what counts as soft)

| ID | Question | Options / Recommendation | Pri |
|---|---|---|---|
| C-1 | **Response levels.** D-14 and D-17 make "hard" mean both "a fact about the room" and "can't be ignored", yet the user can always override. We need to name what each hard constraint does. | *Rec*: three levels. **Block**: geometrically impossible (inside a wall, inside a built-in, outside the room). **Warn**: possible but problematic (blocks the door, far from a plug). **Inform**: soft, quiet. Only *Block* stops the user, and only because the scene would become physically impossible. **Update (D-30):** the team adopted this model. **Resolved (D-31):** blocks are invisible, and sealing the entrance is a Warn. The list is in design documentation, section 4.6.2. | Resolved |
| C-2 → OI-039 (closed: DEC-045) | Naming. "Hard / soft" is internal language. What does the user see? | *Rec*: keep hard/soft in the documentation and code. In the UI use plain words: **"Room facts"** and **"Your priorities"**, and call the pop-up a **"Heads-up"**, not a warning or error. | P1 |
| C-3 → OI-061 (closed: DEC-054) | **Functional needs** (a desk needs a plug, a bed needs side access): are they properties of the *object type* or of the *object instance*? Can the user say "this lamp doesn't need power"? | *Rec*: defaults come from object type. The user can adjust in Edit Object ("Needs power: yes/no"). | P1 |
| C-4 → OI-041 (closed: DEC-046) | **Soft-constraint priority model.** D-15 says user-selected preferences are prioritised and unselected ones are low priority. Is priority simply "selected = high"? Does selection order matter? | *Rec*: selected keywords are high; **order of selection = rank**. Say so in onboarding step 4 ("Tap in order of importance"). Unselected system defaults are low. | P0 |
| C-5 → OI-038 (closed: DEC-044) | **Low-priority nagging.** How loud is a low-priority flag (airflow)? | *Rec*: evaluate against the **previous state**, not an absolute. Only mention it when the move makes things meaningfully worse than before, and then as a quiet "side effect" note, never a pop-up. | P1 |
| C-6 → OI-041 (closed: DEC-046) | **Keyword → rule mapping.** Onboarding suggests nine keywords: Comfort, Privacy, Natural light, Ventilation, Open floor, Storage, Easy to clean, Calm, Plants. Users can also add their own. Which of these can the system actually check? | *Rec*: in the rebuild commit to checkable rules for **Privacy, Natural light, Ventilation, Open floor, Storage**. Treat **Comfort, Calm, Easy to clean, Plants** as "noted, shown in suggestions" with no live check. Custom keywords are stored and matched by AI to the nearest rule family if one exists. State this honestly in the UI. **Update:** the team wants onboarding restructured so every option is checkable. A restructure is proposed in design documentation, section F1.1 (see C-13). | P0 |
| C-7 → OI-041 (closed: DEC-046) | **Activities → constraints.** Activity pills (Resting, Studying, Working out, Getting ready, Hosting friends, Art & hobbies, Drying laundry) imply zones that must stay usable (a floor patch for a workout mat, daylight plus a plug for study, a free window for drying). Do they generate constraints as well as keywords? | *Rec*: yes. Activities create **"zones to protect"** and are a second soft source. Priority is below the user's ranked keywords unless the activity is the only mention. | P0 |
| C-8 → OI-091 | **Where do the numbers come from?** Door swing, wardrobe access, walkway width, plug reach, seating space. | *Rec*: start from published interior-design rules of thumb, store each in the rule table with a **source column**, and mark them "guidance, not code". Test with 3 to 5 people. See E-2. **Update:** every threshold is now listed in design documentation, section 7.4b, with its basis and confidence. It needs team review. | P0 |
| C-9 → OI-092 | **Plug reach.** Straight-line distance, or along the wall and floor? Does an extension cord count? What if another object stands in front of the plug? | *Rec*: two separate checks: (1) *reach* by a generous straight-line radius, (2) *access*, whether the plug is blocked. The sample room has a power strip already, so "reach" is lenient and "blocked" is its own flag. | P1 |
| C-10 → OI-017 (closed: DEC-036) | **Linked objects.** Desk + chair, dressing table + stool. Do they move together? Does the chair's pull-out zone count as part of the desk? | *Rec*: linked by default (move as a pair), with "unlink" in Edit Object. The pair's functional zone is evaluated as one. | P1 |
| C-11 → OI-093 | **Overlap rules.** Can objects overlap (a rug under a bed, a plant beside a desk)? | *Rec*: a small table of allowed pairings by type (rug may sit under furniture). All other overlaps are *Block*. | P1 |
| C-12 | Door geometry: the data says "inward right swing". | **Resolved (D-28):** use the room model as given: inward, right swing. | Resolved |
| C-13 → OI-041 (closed: DEC-046) | **Restructured onboarding.** Confirm the proposal in design documentation F1.1: activities each create a need and a zone to protect; priorities become a fixed list of six checkable options, pick up to three in order; Comfort, Calm and Easy to clean are dropped as keywords; "Something else" is stored but marked "noted, not checked". | *Rec*: adopt. Decide the default selection (currently Privacy and Natural light). | P0 |

### D. Feedback model (what the user sees and when)

| ID | Question | Options / Recommendation | Pri |
|---|---|---|---|
| D-Q1 → OI-032 (closed: DEC-041) | **Signal vocabulary.** The plug tint is one signal. The door swing, windows, walkways and sightlines need their own. What is the visual language? | *Rec*: a small fixed set (see design documentation, section 4.6): **tint** on a fixed element, **floor zone** overlay, **edge glow** on a window, **sightline** ray. Define all of them before building any. | P0 |
| D-Q2 → OI-032 (closed: DEC-041) | **How much at once while dragging?** Showing every relevant signal is noise. | *Rec*: only signals relevant to the dragged object's **type**, and only within an attention radius. At most two visible at once. Hard signals outrank soft ones. | P0 |
| D-Q3 → OI-032 (closed: DEC-041) | **Accessibility of red/green.** Colour alone excludes colour-blind users. | *Rec*: pair every colour state with a second cue: an icon or ring shape and a change in brightness or pulse. Never colour only. | P0 |
| D-Q4 → OI-032 (closed: DEC-041) | **Continuous or stepped colour?** A smooth red→green gradient or three states? | *Rec*: three states (**fine / stretch / problem**) with a smooth blend between them. Easier to learn, easier to build the thresholds. | P1 |
| D-Q5 → OI-030 (closed: DEC-019) | **Pop-up form and timing.** A modal pop-up on every drop could become annoying. | *Rec*: on drop, a **non-modal card** at the bottom with the reason and three buttons: *Keep it · Undo · Show options*. At Confirm, a single **review** of anything still unresolved. **Update:** the options are analysed in design documentation, section 4.6.3a, with an escalation ladder as the recommendation. Needs a decision. | P0 |
| D-Q6 → OI-039 (closed: DEC-045) | **Numbers in pop-up text.** D-06 says no numbers. "Far from a plug" is clear. "Walkway is narrow" is vaguer than "55 cm". | *Rec*: honour D-06 strictly in the prototype and use qualitative wording. Watch in testing whether people ask "how far?". If they do, add an optional "details" line. | P1 |
| D-Q7 → OI-031 (closed: DEC-040) | **Several conflicts on one object** (the team asked to discuss). | See "Conflict handling options" at the end of this file. *Rec*: option C. | P0 |
| D-Q8 → OI-033 (closed: DEC-042) | **Dismissal memory.** What exactly is remembered, for how long, and how can the user undo it? | *Rec*: remember per **(object, rule)**. Re-surface only if the situation changes materially (moved to a different problem spot, or object resized). Dismissed items live in a **Room Check** list where they can be restored. | P0 |
| D-Q9 → OI-034 (closed: DEC-022) | **Room Check.** Is there a place to see all current heads-ups and dismissed ones at any time? | *Rec*: yes, a sheet opened from the View tab, with a count chip. It is the "no dead ends" safety net for flags that vanished. | P1 |
| D-Q10 → OI-035 (closed: DEC-032) | **What does "Show options" return?** | *Rec*: 2 or 3 **ghost positions** on the canvas, each with a one-line trade-off. The user taps one to preview. Never moved automatically. Never ranked as "best". | P0 |
| D-Q11 → OI-098 | **Does feedback also apply after Confirm?** | *Rec*: yes. Rules are re-evaluated on every change, so a confirmed layout is still checked. | P1 |
| D-Q13 → OI-034 (closed: DEC-022) | **Flags about the user's existing layout.** The starting room already has issues (for example the bed sits under the AC, and the pedestal fan stands in front of a plug). Do we flag the user's own arrangement? It could feel like criticism. | *Rec*: no pop-ups for the starting layout. List them quietly in Room Check as "about your room today", and only raise a heads-up when the user *changes* something. | P1 |
| D-Q14 | **Passive signal for plugs: connection line, tint, or both?** The team described "seeing the connection being drawn". | *Rec*: both. A thin number-free line from the dragged object to the nearest usable plug, and the plug itself changing green, amber, red. The line style (solid, dashed, broken) is the second cue for colour-blind users. **Resolved (D-35).** | Resolved |
| D-Q15 | **What happens to a card the user ignores?** | *Rec*: it collapses to a small marker on the object and stays **open**, not dismissed. Only "Keep it" dismisses. **Resolved (D-36):** the marker is attached to the object in the clash. | Resolved |
| D-Q16 → OI-030 (closed: DEC-019) | **Role of the Confirm review.** | *Rec*: one non-blocking sheet listing what is still open. "Confirm anyway" is always there. It is the only place where the user is asked to decide a batch. | P1 |
| D-Q18 → OI-032 (closed: DEC-041) | **Which signal for which kind of rule?** Not every rule is a connection like the plug. | *Rec*: each rule declares its relationship type (reach, keep clear, line of sight, keep apart, ambient, overlap), and the type decides the signal. Only "reach" rules, where closer is better, get a connection line. See design documentation, 4.6.4. | P0 |
| D-Q17 → OI-037 (closed: DEC-043) | **Should uncertainty change the wording?** If a heads-up depends on a shaky detection or an estimated size. | *Rec*: yes. Use "We think…" or "If that's a plug…" and move the item one level down the ladder. Never show a number. | P1 |
| D-Q12 → OI-039 (closed: DEC-045) | **Tone.** | *Rec*: calm, factual, never a verdict. Allowed: "This blocks the door's swing." Not allowed: "Wrong placement." Write a short phrasing guide (see design documentation, section 8.5). | P2 |

### E. Room model, rules and the scripted prototype

| ID | Question | Options / Recommendation | Pri |
|---|---|---|---|
| E-1 | **One canonical room model.** The current code has three overlapping descriptions of the same room and they disagree in places (see design documentation, section 7.6). Who verifies the real measurements, and when? | **Resolved (D-28):** the existing room model is the base and the only room in this prototype. One remaining note: the starting layout has a few overlaps in the data (pedestal fan and bed, chair tucked into desk), so the overlap rule applies to the user's *moves* only, never to the starting layout. | Resolved |
| E-2 → OI-094 | **Rule authoring.** Where do the rules live so designers can tune a threshold without touching code? | *Rec*: a declarative rule table (one row per rule) separate from the interface code, with thresholds as named values. | P0 |
| E-3 → OI-095 | **Script vs live rules.** The old build ran a fixed 10-step script. The new build can either run the script, or evaluate rules freely. | *Rec*: **rules are live** for any placement of any supported object. The story script becomes a **facilitator guide** (tasks to give testers) and is no longer prototype state. | P0 |
| E-4 | **Rendering arbitrary placements.** Rules can judge any position, but the "result image" for an arbitrary position cannot be pre-made. | Options: (a) restrict drops to a set of pre-rendered **candidate slots**; (b) show a simple 3D stand-in model instead of a photo-style render for unscripted spots; (c) live generation. **Resolved (D-27):** no image rendering in this prototype. Confirm shows the object as a 3D model at its position, so any placement can be shown. The question that remains is B-12. | Resolved |
| E-5 | **Photo vs procedural 3D room.** Already open in the existing notes. | *Rec*: keep the 3D room for now, as decided on 2026-11-10. **Reinforced by D-27:** the prototype uses the 3D room throughout. | Resolved |
| E-6 → OI-091 | Which exact **starting thresholds** for the sample room? | *Rec*: see the draft rule table in design documentation, section 7.4. All values are placeholders until E-1 and C-8 are settled. | P1 |

### F. Onboarding to editor link

| ID | Question | Options / Recommendation | Pri |
|---|---|---|---|
| F-1 → OI-025 (closed: DEC-039) | Is the free-text room description (step 3) interpreted, or only the pills? | *Rec*: pills are structured and drive rules. Free text is stored and AI-matched to suggest further pills. | P1 |
| F-2 → OI-043 (closed: DEC-048) | Does the user see **how** their answers are used? | *Rec*: yes, one line on step 4: "We'll watch these first." And the pop-ups name the priority that triggered them ("because you chose Privacy"). | P1 |
| F-3 → OI-034 (closed: DEC-022) | Can the user change priorities later, inside the editor? | *Rec*: yes, from Room Check. Otherwise a wrong choice in onboarding locks them in, which breaks "no dead ends". | P1 |
| F-4 → OI-002 (closed: DEC-002) | What does onboarding step 2 (Redesign vs Refine) change in the rules? | *Rec*: nothing in v1, because Refine has no editor yet. | P2 |
| F-5 | **Weight for each activity.** Someone who studies daily and someone who studied once both tap "Studying". | *Rec*: a second tap on a pill switches it between **Main** and **Sometimes**. One extra tap, much better accuracy. **Resolved in direction (D-39):** captured by dragging activity bubbles into Main and Sometimes. The screen is designed in design documentation, F1.3. | Resolved |
| F-6 | **"Keep in place."** The user may not want to move certain things. | **Dropped (D-38):** no lock. If the user wants something to stay, they don't move it. | Dropped |
| F-7 → OI-043 (closed: DEC-048) | **Profile recap.** Does the processing screen end with a short recap of what the system will watch? | *Rec*: yes, three lines, for transparency (design documentation, F1.2). | P2 |
| F-8 → OI-042 (closed: DEC-047) | **Details of the Main / Sometimes sorting screen.** Cap on Main? Pre-sorted or empty? Tap fallback? How do the two sections change the rules? | *Rec* (design documentation, F1.3): Main holds at most three; pre-sort what the scan supports and ask the user to confirm; tap a bubble to cycle it (the fallback for people who don't drag); Main is protected at high priority and Sometimes at low. Order of precedence: ranked priorities, then Main, then Sometimes, then system defaults. | P1 |

### G. Product scope and testing

| ID | Question | Options / Recommendation | Pri |
|---|---|---|---|
| G-1 | **The Adapt HMW** ("establish a baseline that supports adaptability") has no feature in the new scope. Defer or include something small (for example saved versions, or day/night arrangements)? | *Rec*: decide explicitly. **Resolved (D-29):** deferred to a later phase. | Resolved |
| G-2 → OI-003 (closed: DEC-003) | **Zone (single photo) path.** A single photo lacks full room geometry. Do rules run? | *Rec*: run only the rules whose fixed elements are visible in the photo, and say so. | P2 |
| G-3 → OI-002 (closed: DEC-002) | **Refine mode** is still undefined. | *Rec*: out of scope for the rebuild. Keep the choice stored. | P2 |
| G-4 → OI-007 (closed: DEC-007) | **Platform.** The current build is phone-first (bottom nav). | *Rec*: confirm phone-first. Define the minimum touch target and a tablet behaviour later. | P1 |
| G-5 → OI-064 (closed: DEC-055) | **Persistence in the prototype.** What survives a reload: dismissals, refined dimensions, added objects? | *Rec*: all three, in local storage, so a test session can pause and resume. | P2 |
| G-6 → OI-096 | **What must the first test prove?** | *Rec*: see design documentation, section 9.2 (hypotheses H1 to H6). | P1 |
| G-7 → OI-019 (closed: DEC-037) | **Scope boundary on suggested vs added objects.** Is a "suggested" object just a generic stand-in for something in a reference photo? | *Rec*: yes, a stand-in with generic dimensions. State that in its badge. | P2 |

### H. Detection errors and correction

Scans misidentify things. These questions cover the correction flow (design documentation, F8).

| ID | Question | Options / Recommendation | Pri |
|---|---|---|---|
| H-1 → OI-060 | Where does the user correct a wrong detection? | *Rec*: four entry points: a "Not right?" link on the heads-up card, "Not right?" on any object or fixed element, a short optional review after processing, and "Mark something we missed". | P0 |
| H-2 → OI-060 | D-28 and A-1 say fixed elements are not editable. Does correction contradict that? | *Rec*: fixed elements stay non-editable in normal editing. They can be corrected **only** through the correction flow. | P0 |
| H-3 → OI-037 (closed: DEC-043) | Do we show how sure the system is? | *Rec*: only as wording ("We think…") and a short "not sure" list. Never a number (D-06). | P1 |
| H-4 | Do we seed deliberate misdetections in the prototype so the flow can be tested? The room model is accepted as is (D-28), so otherwise testers have nothing to correct. | *Rec*: yes, one or two, switched on by the facilitator. Candidates: the "Storage boxes & clutter" object (several things counted as one) and a plug point the system labelled as a switch. **Resolved (D-41):** yes, seeded errors are in. The working choice is in design documentation, F8. | Resolved |
| H-5 → OI-060 | If the user's correction contradicts the system, who wins? | *Rec*: the user wins and the system recalculates. The only refusal is an impossible value (B-F). | P1 |
| H-6 → OI-033 (closed: DEC-042) | After a correction, what happens to heads-ups the user already dismissed that depended on the corrected thing? | *Rec*: re-evaluate them, and reset the dismissal if the cause changed. | P1 |
| H-7 → OI-060 | Merged objects (the clutter pile): split, or only remove and re-add? | *Rec*: remove and re-add in this phase. Split is later. | P2 |
| H-8 → OI-060 | Can the user add a missed *fixed* element (a plug, a window)? | *Rec*: yes through "Mark something we missed": place a marker, choose a type. Scripted in the prototype. | P2 |

---

## Conflict handling options (for D-Q7)

Scenario: a desk is dropped where it sits within the door's swing zone, is far from any plug, and is visible from the door (Privacy was chosen).

| Option | What the user sees | For | Against |
|---|---|---|---|
| **A. One pop-up, all items** | A single card listing every issue, hard first | Simple, honest | Becomes a wall of text with 3+ items |
| **B. Stacked, one at a time** | The most serious first, then "Next" for the rest | Focus | Slow, and users may dismiss all without reading |
| **C. Summary chip + expand** | A short card: "3 things to know", the top one written out in full, tap to expand the rest | Calm, scales, keeps hard facts on top | One extra tap |

*Rec*: **C.** Order is **Block, then Warn (hard), then user-ranked soft, then low-priority soft**. The card shows at most one hard and one soft item in full; the rest sit behind the expand. Dismissal applies per item, not per card.

---

## Suggested order to resolve (P0 only)

> Superseded by [spec/open-items.md](../spec/open-items.md) (2026-11-11). Each open question here carries a pointer to its new ID (→ OI-nnn).

1. **Resolved already:** room model (E-1, C-12), rendering (E-4), Adapt (G-1).
2. **C-1, C-2** (response levels and naming): defines what "hard" does.
3. **C-4, C-6, C-7, C-13** (soft constraints sources and the restructured onboarding): defines what onboarding feeds.
4. **D-Q1, D-Q2, D-Q3, D-Q5, D-Q7, D-Q8, D-Q10** (feedback language): defines the guidance experience.
5. **A-6, A-7, B-1, B-4, B-7, B-12** (Edit Object and adding): defines the object lifecycle.
6. **E-2, E-3** (how the rules are stored, and how the story script is used).
