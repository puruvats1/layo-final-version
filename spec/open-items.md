# Open items

**Status:** Draft · **Depends on:** [process.md](process.md) · **Open items:** this file

Everything still unsettled is listed here. The method is in [process.md §4](process.md).

**How to answer.** Write on the `Answer:` line of any item, or answer in chat. A short answer is fine ("yes", "option b", "rec"). For the **Default** table, one line answers every row.

**Types:**
- **Your call**: only you can decide.
- **Conflict**: two sources disagree.
- **Gap**: nothing defines it.
- **Default**: the recommendation stands unless you object.
- **Parked**: needed only for building, not for the screen specs.

**Source abbreviations:**
- **DD** = [kith-design-documentation.md](../docs/kith-design-documentation.md)
- **OQ** = [kith-open-questions.md](../docs/kith-open-questions.md)
- **UJ** = [kith-user-journeys.md](../docs/kith-user-journeys.md)
- **SF** = [kith-scenarios-and-flows.md](../docs/kith-scenarios-and-flows.md)
- **ST** = [kith-room-stress-test-and-journey.md](../docs/kith-room-stress-test-and-journey.md)

---

## Batch 1: blocks step 1 (the aim)

### OI-001 · What the specs describe
- **Type:** Your call · **Blocks:** everything, including how the screens look
- **Sources:** DD §2.1 (the intended product edits 360° photos), DD §2.1 prototype note and D-27/D-28 (the test prototype is a 3D room, scripted, with 3D models on Confirm)
- **Question:** Do the screens show the **intended product** or the **test prototype**? This decides what the canvas looks like (a photo of your room, or a 3D model of a room) and what Confirm produces.
- **Options:** (a) The intended product, in the one sample room. Wherever the prototype has to fake something, a short note says so. (b) The test prototype exactly as D-27 describes it. (c) Both, as separate versions of the screens.
- **Recommendation:** (a). The screens should describe the experience we want to test. How it gets faked is a build question.
- **Status:** Decided → DEC-001
- **Answer:** (b) The test prototype.

### OI-002 · Refine mode in this round
- **Type:** Your call · **Blocks:** aim (scope), canvas module, scenario coverage
- **Sources:** DD F7, DD §1.3 · OQ G-3 → out of scope, F-4 · SF SG-9, E16 · UJ JQ-2 (no home for a whole-room palette)
- **Question:** "Cover the whole app": does that include Refine (surface changes such as wall colour, finishes and decor, with no furniture moving)?
- **Options:** (a) Out. The Redesign/Refine choice is dropped from onboarding, so there is no dead promise. (b) Out, but onboarding still offers it with an honest "coming later". (c) A small Refine: whole-room finishes and palette, through the AI. (d) A full Refine mode.
- **Recommendation:** (a). Goal 4 (personalisation) is already served by finishes and added objects. A choice that leads nowhere breaks "no dead ends".
- **Status:** Decided → DEC-002
- **Answer:** (a) Drop it, including the Redesign/Refine choice in onboarding.

### OI-003 · Zone capture (one photo of a corner)
- **Type:** Your call · **Blocks:** aim (scope), capture flow, sitemap
- **Sources:** DD §1.3 (in scope, simulated) · OQ G-2 · SF C6 "Partly"
- **Question:** Is the single-photo zone path in this round?
- **Options:** (a) Out: whole room only. (b) In, as a flow with honest limits ("Some trade-offs can't be checked from one photo"). (c) Shown on Home but marked "coming later".
- **Recommendation:** (a). It adds a second canvas type, and the scenario doesn't need it.
- **Status:** Decided → DEC-003
- **Answer:** Keep the Zone option on Home; not explored in flows this round; define it later. Concept: a photo of one section of the room for micro-level work (posters on a wall, arranging a desk top) that the room view is too coarse for. The room view is the macro level.

### OI-004 · Goal 5, a space that evolves (Adapt)
- **Type:** Your call · **Blocks:** aim, scenario ending
- **Sources:** DD §1.5 goal 5, D-29 (deferred) · SF SG-10, S3 · ST beat 25
- **Question:** Adapt is deferred. Should the screens include anything for it?
- **Options:** (a) Nothing: an epilogue in the story and an interview prompt only. (b) A small "save this layout", so a second layout can be started later. (c) Saved layouts and comparing them.
- **Recommendation:** (a), unless you want goal 5 visible on screen, in which case (b) is the smallest version.
- **Status:** Decided → DEC-004
- **Answer:** (b) Save this layout.

### OI-005 · What the user leaves with (the ending)
- **Type:** Your call · **Blocks:** aim, scenario, finish flow
- **Sources:** SF E15 (Gap), SF §9 item 6 · ST beat 24, ST §4 item 8
- **Question:** After Confirm, what does the user take into the real room?
- **Options:** (a) Nothing beyond the screen. (b) An ordered list of moves ("1 Clear the pile, 2 Take the fan out…"), shareable. (c) (b) plus a before-and-after image.
- **Recommendation:** (b). It's the smallest bridge to the real room, and the order comes from the rules.
- **Status:** Decided → DEC-005
- **Answer:** (b) Ordered move list.

### OI-006 · Preferences before the scan, or during processing
- **Type:** Conflict · **Blocks:** capture and preferences flow order, sitemap
- **Sources:** DD F1 (`Scan → Onboarding 1–4 → Processing`) vs SF §2 and ST beat 2 (preferences fill the processing wait)
- **Question:** Do the preference questions come after the scan, while the room is being built?
- **Options:** (a) Scan, then preferences while it processes, then "Here's what we found", then the editor. (b) Preferences first, then the scan.
- **Recommendation:** (a). The wait is real in the product, so it's used well.
- **Status:** Decided → DEC-006
- **Answer:** (a) Scan, then preferences during processing.

### OI-007 · Platform
- **Type:** Default · **Blocks:** every screen
- **Sources:** OQ G-4
- **Recommendation:** Phone first, portrait. Tablet later.
- **Status:** Decided → DEC-007
- **Answer:** Default applied (not objected; owner can overrule).

### OI-008 · What tapping the Zone tile does
- **Type:** Your call · **Blocks:** Home, sitemap
- **Sources:** raised by DEC-003
- **Question:** Zone stays on Home but has no flow. What happens on tap?
- **Options:** (a) An explainer sheet marked "coming later". (b) The tile is visibly disabled. (c) It opens photo capture, then says "later".
- **Recommendation:** (a).
- **Status:** Decided → DEC-008
- **Answer:** Nothing happens; plan it fully later.

### OI-009 · What saved layouts let the user do
- **Type:** Your call · **Blocks:** canvas module, Home, sitemap
- **Sources:** raised by DEC-004
- **Question:** With "Save this layout" in scope, what can the user do with saved layouts?
- **Options:** (a) Save, reopen, duplicate. (b) Save and reopen only. (c) (a) plus a list of what changed.
- **Recommendation:** (a).
- **Status:** Decided → DEC-009
- **Answer:** (a) Save, reopen, duplicate.

### OI-070 · A ninth principle: clear about its abilities
- **Type:** Your call · **Blocks:** aim, AI module, canvas module
- **Sources:** the owner's brief: the AI must say what it can do "to minimize confusion", and the canvas must give options that fit "the wide possibilities we are providing"
- **Question:** Add **P9, clear about its abilities**? Every tool shows what it can and can't do before the user tries, and every "no" points to what *is* possible.
- **Recommendation:** Yes. It turns your brief into a test every screen has to pass.
- **Status:** Decided → DEC-011
- **Answer:** Keep the principle, but it must work passively: no load of information, no dense screens, no cognitive overload.

### OI-071 · Added objects and editing their sizes
- **Type:** Your call · **Blocks:** aim, canvas module
- **Sources:** the owner's comment on the aim draft · DD §1.4, §4.4 · OQ D-02, D-11 · ST beat 17
- **Question:** The aim's out-of-scope row "Resizing to explore other sizes" read as if added objects couldn't have their sizes edited.
- **Status:** Decided → DEC-010
- **Answer:** "We are adding other objects in our scope and also editing the dimensions of an added object as well because of reason mentioned earlier."

---

## Batch 2: blocks step 2 (the modules)

### Canvas

### OI-010 · Turning an object to face another way
- **Type:** Gap · **Blocks:** canvas module, scenario (privacy and glare)
- **Sources:** DD §4.2 (facing is an attribute) and F2 (no step for it) · SF E3, §9 item 8 (only through Show options and chat) · ST R3, beat 22 ("Which way will you face?" chips on the card) · DD P3 (no gizmos)
- **Question:** How does a user turn an object?
- **Options:** (a) Only through Show options and the chat. (b) A "Turn" action in the object's menu that steps through 90° turns. (c) Facing chips that appear when facing matters (desk, chair, lounge chair). (d) A rotation gesture with two fingers.
- **Recommendation:** (b) plus (c). One tap per 90°, no gizmo, and facing is offered where a rule depends on it.
- **Status:** Decided → DEC-016
- **Answer:** Two-finger rotate with low-threshold snapping to the room planes and haptics, plus a rotate button. Tapping it enters a rotation state where dragging a finger horizontally turns the object on one plane.

### OI-011 · Selecting several objects
- **Type:** Gap · **Blocks:** canvas module, AI module
- **Sources:** SF E4 (Gap) · ST beat 20
- **Question:** Can the user select several objects, and how?
- **Options:** (a) No. The AI takes a list in words ("the rug, lamp and plant"). (b) A "Select" mode in the object menu, then tap more objects. (c) Long-press the first object, then tap the others.
- **Recommendation:** (b). It's explicit and doesn't clash with hold-to-lift. Selecting several is only for asking the AI or removing; several objects are never moved together.
- **Status:** Decided → DEC-015
- **Answer:** Hold an object and let go to select it. Tapping another object then adds it to the selection.

### OI-012 · Where object actions live
- **Type:** Your call · **Blocks:** canvas module, sitemap
- **Sources:** DD §8.1 (four tabs: View, Edit, AI, Assets) · OQ A-9 (tap an object for Move, Edit, Remove)
- **Question:** Is the bottom bar four tabs, and what does a tap on an object open?
- **Options:** (a) Keep the four tabs; the Edit tab holds the selected object's actions. (b) Three tabs (Room, Ask, Assets). Tapping an object opens a small menu beside it (Edit, Turn, Remove, Ask about this, Not right?).
- **Recommendation:** (b). Actions sit on the thing they act on. The Edit tab is empty when nothing is selected.
- **Status:** Decided → DEC-013
- **Answer:** Superseded by the owner's layout idea (OI-073).

### OI-013 · Does Edit Object open by itself after adding something?
- **Type:** Conflict · **Blocks:** the add flow
- **Sources:** OQ D-10 and DD F4 step 4 (yes, it opens to confirm the type) vs ST beats 13 and 18 (the object goes straight to Added, and is edited later)
- **Options:** (a) Yes, always. (b) A short confirm card ("Yoga mat · Estimated from photo · Looks right / Edit"), then straight to placing.
- **Recommendation:** (b). Confirming the type takes one tap, and the full view is still one tap away.
- **Status:** Decided → DEC-017
- **Answer:** Always open Edit Object.

### OI-014 · Removing and restoring objects
- **Type:** Gap · **Blocks:** canvas module, assets
- **Sources:** OQ B-9 ("Removed" as a fourth Assets group) · DD §4.3 (Removed → Available) · SF E11 "Partly"
- **Recommendation:** Remove is in the object menu, with an Undo toast. Removed objects go to a **Removed** group in Assets. Restoring returns the object to where it stood. An added object that is removed goes back to **Added**.
- **Status:** Decided → DEC-033
- **Answer:** A removed object goes back to Assets. No separate "Removed" section.

### OI-015 · Undo, redo and discard
- **Type:** Gap · **Blocks:** canvas module
- **Sources:** OQ A-10 · SF E5 "Partly"
- **Recommendation:**
  - Undo and redo cover every action (move, add, remove, edit, finish change, correction), including after Confirm.
  - "Discard changes" returns everything staged to its last confirmed state.
  - There's no "Reset to the scan" in this round.
- **Status:** Decided → DEC-034
- **Answer:** Everything, plus Discard.

### OI-016 · Invisible blocks: explain them or not
- **Type:** Conflict · **Blocks:** canvas and guidance modules
- **Sources:** OQ D-31 (blocks are silent) vs ST F11 and ST §4 item 6 (the desk stops 22 cm short and nothing says why; suggests a reason on long-press, and the window sill as a block)
- **Options:** (a) Silent always. (b) Silent, but a short line appears when the user lets go against a block ("The window sill stops it here"). (c) Show it only on a long-press.
- **Recommendation:** (b). One quiet line, only when the user lets go against something. It isn't a card.
- **Status:** Decided → DEC-020
- **Answer:** Always silent.

### OI-017 · Linked objects (desk and chair, dressing table and stool)
- **Type:** Default · **Blocks:** canvas module
- **Sources:** OQ C-10 · DD F2
- **Recommendation:** Linked pairs move together. "Unlink" is in Edit Object. The pair's space is judged as one.
- **Status:** Decided → DEC-036
- **Answer:** Linked, with Unlink in the tap menu.

### OI-018 · What surfaces objects can sit on
- **Type:** Default · **Blocks:** canvas module
- **Sources:** OQ B-5
- **Recommendation:** The floor and walls in this round. On top of other furniture and on the ceiling come later. A lamp is a floor lamp.
- **Status:** Decided → DEC-038
- **Answer:** Floor and walls.

### OI-019 · Asset groups
- **Type:** Default · **Blocks:** assets screen
- **Sources:** OQ B-1, B-10, G-7, B-9
- **Recommendation:**
  - **In this room** · **Suggested** (3 to 5 stand-ins drawn from your references, marked "stand-in") · **Added** · **Removed**.
  - "Add" is the first tile.
- **Status:** Decided → DEC-037
- **Answer:** Your room · Added · Suggested.

### AI

### OI-020 · Requests in chat become proposals the user applies
- **Type:** Conflict · **Blocks:** AI module
- **Sources:** DD §4.6.7 ("never moves an object without the user's tap") vs SF §7.3 and ST beat 19 (chat commands stage a proposal with an **Apply** tap)
- **Recommendation:** Every change the AI makes is a proposal on the canvas (shown as ghosts or a staged box) with **Apply** and **Not now**. The tap on Apply is the user's tap, so §4.6.7 holds. The same rules and heads-ups apply as for touch.
- **Status:** Decided → DEC-018
- **Answer:** Proposal + Apply.

### OI-021 · What the AI can do
- **Type:** Your call · **Blocks:** AI module
- **Sources:** SF §7.1 (ten intents: do, suggest, explain, style, add, ask about the room, out of scope, unclear, against the rules, not a task) and §7.2 (five outcomes) · DD §4.6.7 · OQ A-7
- **Question:** Adopt this as the AI's capability list? In short:
  - **It can:** move, turn or remove objects (as proposals), suggest positions, explain any heads-up, change finishes, and point you to Add.
  - **It can't:** change size, shape or type, change fixed elements, shop, pick a "best" layout, or get around the rules.
- **Recommendation:** Yes. Step 2 writes it out in full.
- **Status:** Decided → DEC-025
- **Answer:** Adopt, and the AI can also add (it can suggest objects). For the "can't" list, the AI redirects: size, shape or type goes to Edit Object; walls and fixed elements (such as a plug in the wrong place) go to Room edit.

### OI-022 · Can the AI state numbers?
- **Type:** Conflict · **Blocks:** AI module
- **Sources:** OQ D-06 (numbers only in Edit Object) vs SF §7.1 ("How wide is my desk?")
- **Options:** (a) Never: "You can see its size in Edit Object." (b) Yes, when asked directly.
- **Recommendation:** (b). The user asked for the number. D-06 is about not pushing numbers at people.
- **Status:** Decided → DEC-021
- **Answer:** Yes. The AI answers, and may offer to open Edit Object to change the size.

### OI-023 · Whole-room palette and finishes through the AI
- **Type:** Your call · **Blocks:** AI module; tied to OI-002
- **Sources:** UJ JQ-2, J7 · OQ A-7 (finish only, per object)
- **Question:** Can the user ask for "make the room warmer" across every object, or only one object at a time?
- **Recommendation:** One object at a time, or a selected group (OI-011). A whole-room palette belongs with Refine (OI-002).
- **Status:** Decided → DEC-026
- **Answer:** Yes, the whole room, based on the look of the user's references. It is applied object by object, and each object's Edit Object keeps its earlier finishes so the user can go back.

### OI-024 · How the AI shows what it can do
- **Type:** Gap · **Blocks:** AI module, AI screens
- **Sources:** none. You raised this one.
- **Recommendation:** Revised after DEC-011 (P9 must be quiet). Three passive devices, no explanatory text:
  1. **A chip showing what it's working on.** "Whole room", or the selected object(s), always visible.
  2. **Two or three suggestion chips** that follow the current selection and any open heads-up. The chips themselves show what kind of thing can be asked.
  3. **Refusals of one line that point elsewhere.** "I can't change its size, but Edit Object can."

  No "I can help with…" list.
- **Status:** Decided → DEC-031
- **Answer:** A context chip plus 2 or 3 suggestion chips.

### OI-025 · Does the AI read the free-text description?
- **Type:** Default · **Blocks:** AI module, onboarding
- **Sources:** OQ F-1
- **Recommendation:** Yes, as context for suggestions and wording. Free text never switches on a rule; only the bubbles and priorities do.
- **Status:** Decided → DEC-039
- **Answer:** It can switch rules on.

### OI-072 · What a tap on an object does
- **Type:** Gap · **Blocks:** canvas module · **Sources:** raised by DEC-015
- **Status:** Decided → DEC-014
- **Answer:** Shows the object's name and its options, such as Edit (opens Edit Object to correct sizes and more) and Remove (removes the object and puts it in Assets).

### OI-073 · The editor layout
- **Type:** Your call · **Blocks:** canvas module, sitemap · **Sources:** DD §8.1 (four tabs) · OI-012
- **Status:** Decided → DEC-013
- **Answer:** The owner's design. No View tab: a top-bar toggle hides the interface for a clean preview, and undo, redo and other global edit actions sit at the top. At the bottom, an AI | Assets toggle on the left and a pill on the right. The pill is the AI chat or one row of assets, with a grab handle to expand it to the conversation or an asset grid. Object options live in the tap menu. The "AI | Assets" naming was agreed after discussion.

### OI-074 · Which problems get a card on drop
- **Type:** Your call · **Blocks:** guidance module · **Sources:** raised by DEC-019
- **Status:** Decided → DEC-019
- **Answer:** Room facts plus the user's ranked priorities.

### OI-075 · Where Room Check lives
- **Type:** Your call · **Blocks:** guidance module, sitemap · **Sources:** OI-034 · DD §4.6.3, D-Q9 · raised by DEC-013 (no View tab)
- **Question:** The owner asked what Room Check is for before placing it. See the explanation in chat on 2026-11-11.
- **Options:** (a) A section inside the expanded AI panel. (b) A count chip in the top bar that opens a sheet. (c) Both, opening the same thing. (d) Drop it: markers on the canvas are enough.
- **Recommendation:** (a).
- **Status:** Decided → DEC-022
- **Answer:** A Room Check button in the top bar. Tapping it shows a list of all checks. Tapping an item takes the user to its object and opens its card. The list has a "Clear checks" option.

### OI-076 · What appears when several objects are selected
- **Type:** Your call · **Blocks:** canvas module · **Sources:** raised by DEC-015
- **Status:** Decided → DEC-015
- **Answer:** A floating selection bar.

### OI-077 · What "Clear checks" does
- **Type:** Your call · **Blocks:** guidance module · **Sources:** raised by DEC-022
- **Status:** Decided → DEC-022
- **Answer:** A confirmation explains that every check will be cleared and can't be restored. On confirm, all markers are removed and the list is empty. Clearing a single check from its card needs no confirmation. Restoring a kept check is not offered.

### OI-078 · How a check is settled from its card
- **Type:** Your call · **Blocks:** guidance module, AI module · **Sources:** raised by DEC-022
- **Status:** Decided → DEC-023
- **Answer:** "Keep it" (accept as is).

### OI-079 · Where priorities and corrections go without the old Room Check
- **Type:** Your call · **Blocks:** canvas module, sitemap · **Sources:** raised by DEC-022 · OQ F-3
- **Status:** Decided → DEC-024
- **Answer:** Project settings.

### OI-080 · Room edit and the Settings button
- **Type:** Your call · **Blocks:** canvas module, sitemap · **Sources:** raised by DEC-025 · DD F8 entry C · DD §8.1 ("Check your room", deferred)
- **Status:** Decided → DEC-028
- **Answer:** The owner's idea. A Room edit feature takes the user to the base room to identify or fix mistakes from the scan. It also appears during project setup, and can be reached later from a Settings button on the edit canvas. Settings also lets the user change the preferences set up earlier.

### OI-081 · Are priorities the user didn't pick still watched?
- **Type:** Conflict · **Blocks:** guidance module
- **Sources:** OQ D-15 ("qualities the user did not pick are still watched, at low priority") vs the owner's direction on OI-036 (a rule runs only if its preference was picked)
- **Options:** (a) Only what the user picked is watched. Room facts are always watched. (b) D-15 stands: unpicked qualities are watched quietly, as markers only. (c) Unpicked qualities are never flagged during editing, but appear in Room Check under "Before you started".
- **Recommendation:** (a). It's the clearest link between "what I told it" and "what it tells me" (H6), and it keeps the screen quiet (P9).
- **Status:** Decided → DEC-029
- **Answer:** Only what was picked.

### OI-082 · What a whole-room restyle changes
- **Type:** Your call · **Blocks:** AI module · **Sources:** raised by DEC-026 · DEC-002 (Refine, which included wall colour, is dropped)
- **Question:** "Restyle the room" changes the finishes of movable objects. Does it also touch walls, floor and curtains?
- **Options:** (a) Movable objects only. (b) Objects plus soft furnishings (curtains, bedding, rugs). (c) Everything, including wall colour and floor.
- **Recommendation:** (b). Curtains and bedding carry most of a room's mood. Walls and floor stay out with Refine.
- **Status:** Decided → DEC-030
- **Answer:** Furniture plus soft furnishings.

### OI-083 · Fitting the top bar on a phone
- **Type:** Gap · **Blocks:** canvas module, screens · **Sources:** DEC-013, DEC-022, DEC-028, DEC-034 together put seven controls at the top
- **Recommendation:** Left: Back and the layout name. Right: Room Check, Undo and Redo as one pair, Preview and Settings as one pair. **Confirm** floats below the bar and appears only while something is staged.
- **Status:** Decided → DEC-049
- **Answer:** Grouped, with a floating Confirm.

### OI-084 · The full tap menu
- **Type:** Your call · **Blocks:** canvas module · **Sources:** DEC-014 (you named Edit and Remove)
- **Recommendation:** Edit · Rotate · Remove · Ask (with the check badge) · Unlink (linked pairs only) · Not right?
- **Status:** Decided → DEC-050
- **Answer:** Move "Not right?" into Edit Object.

### OI-085 · Switching layouts with staged changes
- **Type:** Gap · **Blocks:** canvas module, layouts · **Sources:** DEC-009
- **Recommendation:** Ask once: "Confirm or discard your changes first?", with Confirm, Discard and Cancel.
- **Status:** Decided → DEC-051
- **Answer:** Ask: Confirm, Discard or Cancel.

### OI-086 · Where an added object appears after Edit Object
- **Type:** Gap · **Blocks:** the add flow · **Sources:** DEC-017
- **Recommendation:** After Done, the object appears held in the middle of the view as a box, with a hint "Drag to place". It's also saved in Assets → Added.
- **Status:** Decided → DEC-053
- **Answer:** Held in the middle of the view.

### OI-087 · Choosing objects inside a restyle proposal
- **Type:** Your call · **Blocks:** AI module · **Sources:** DEC-026, DEC-030
- **Question:** A whole-room restyle proposes new finishes for several objects at once. Can the user untick single objects before Apply?
- **Recommendation:** Yes. Each changed object shows a small tick on the canvas, all on by default, so the user can keep the curtains and skip the bed in one go. Afterwards, single objects can still go back through their finish history.
- **Status:** Decided → DEC-052
- **Answer:** Yes, with ticks on the objects.

### Guidance

### OI-030 · How loudly feedback speaks (the escalation ladder)
- **Type:** Your call · **Blocks:** guidance module
- **Sources:** DD §4.6.3a · OQ D-Q5, D-Q16
- **Question:** Adopt the ladder?
  - L0: silent block.
  - L1: a marker on the object.
  - L2: a card on drop that doesn't block the room.
  - L3: one review at Confirm, with "Confirm anyway".
- **Recommendation:** Yes.
- **Status:** Decided → DEC-019
- **Answer:** A marker for most things, a card for things with priority. Tapping a marker shows the card. The card is part of the AI.

### OI-031 · Several problems from one move
- **Type:** Default · **Blocks:** guidance module
- **Sources:** OQ D-Q7, option C
- **Recommendation:** One card. It shows the top problem in full and a chip "2 more things to know". Hard problems come before soft ones.
- **Owner's proposal (2026-11-11):**
  - Stacked cards, swipeable, with next and previous.
  - The marker shows a number of problems; colour for priority may be too much.
  - While the tap menu is open, the marker sits inside it, over the Ask button.
  - Refinements proposed in chat, waiting for confirmation.
- **Status:** Decided → DEC-040
- **Answer:** Adopt the stacked cards as described (the owner's idea with the refinements).

### OI-032 · The signal vocabulary while dragging
- **Type:** Default · **Blocks:** guidance module, drag screens
- **Sources:** DD §4.6.4 · OQ D-Q1, D-Q2, D-Q3, D-Q4, D-Q18
- **Recommendation:** Adopt §4.6.4 as written:
  - A line plus a colour on the plug, for things that need to be near something.
  - A shape on the floor for space that must stay clear.
  - A glow on the window frame.
  - A sightline from the door.
  - Ghost copies for options.

  At most two signals at once, and every colour has a second cue that isn't colour.
- **Status:** Decided → DEC-041
- **Answer:** Accept the signal set, but only one signal at a time.

### OI-033 · Remembering a dismissed heads-up
- **Type:** Default · **Blocks:** guidance module
- **Sources:** OQ D-Q8, H-6 · DD §4.6.6
- **Recommendation:** Remembered per object and per rule. It comes back only if the situation really changes. Correcting a detection resets the dismissals that depended on it.
- **Status:** Decided → DEC-042
- **Answer:** Only if things really change.

### OI-034 · Room Check, and changing priorities later
- **Type:** Default · **Blocks:** guidance module, sitemap
- **Sources:** OQ D-Q9, F-3, D-Q13 · SF P7
- **Recommendation:** Room Check is one sheet with five parts:
  1. Open heads-ups.
  2. Kept ones, which can be restored.
  3. "About your room today", for problems that were already there before any change.
  4. Your priorities and activities, which can be edited here.
  5. Corrections, with undo.
- **Status:** Decided → DEC-022
- **Answer:** Replaced by the owner's Room Check design (DEC-022) and DEC-024.

### OI-035 · Show options when there is no clean option
- **Type:** Gap · **Blocks:** guidance module, scenario
- **Sources:** OQ D-Q10 · ST F3 (only 0.1% of desk spots are clean today), F5
- **Recommendation:** Show options always gives 2 or 3 choices, each with what it costs. When none is clean, it says so: "Each of these gives something up." It never says "best". An option can involve moving another object ("if the fan goes").
- **Status:** Decided → DEC-032
- **Answer:** Least-bad options, honestly.

### OI-036 · Rules that are always on
- **Type:** Conflict · **Blocks:** scenario (step 3)
- **Sources:** ST F4 and F9 (privacy can never clear; the bed is always under the AC) vs DD S-1 and S-6 as written · ST R3 (privacy depends on which way the desk faces)
- **Recommendation:** Privacy depends on facing (R3), so turning the desk can clear it. Problems that no move can fix (the bed under the AC) live only in "About your room today", never on a card.
- **Owner's direction (2026-11-11):** These rules come from the old scenario. They should depend on the preferences the user enters, for example a privacy rule only if Privacy was picked, and a bed-and-AC rule only if comfort or Restful sleep was picked. The specific rules are settled with the scenario (step 3). The general principle is OI-081.
- **Status:** Decided → DEC-070
- **Answer:** Adopt.

### OI-037 · Wording when the system is unsure
- **Type:** Default · **Blocks:** guidance module
- **Sources:** OQ D-Q17, H-3
- **Recommendation:** Hedged wording ("We think…", "If that's a plug…"), one level lower on the ladder, and never a number or a percentage.
- **Status:** Decided → DEC-043
- **Answer:** Hedged, and one step quieter.

### OI-038 · Low-priority side effects
- **Type:** Default · **Blocks:** guidance module
- **Sources:** OQ C-5
- **Recommendation:** Mention a low-priority side effect only when a move makes it noticeably worse than before, and then only as a marker.
- **Status:** Decided → DEC-044
- **Answer:** Only if clearly worse.

### OI-039 · Words in the interface
- **Type:** Default · **Blocks:** every screen
- **Sources:** OQ C-2, D-Q12, D-Q6 · DD §8.4, §8.5
- **Recommendation:**
  - Use "Room facts", "Your priorities" and "Heads-up", never "warning" or "error".
  - Follow the §8.5 phrasing guide.
  - Use words, not numbers, in cards.
- **Status:** Decided → DEC-045
- **Answer:** Accept. "Check" replaces "heads-up".

### Preferences

### OI-040 · The activity list
- **Type:** Conflict · **Blocks:** onboarding, guidance, scenario
- **Sources:** DD F1.1 (Resting, Studying, Working out, Getting ready, Hosting friends, Art and hobbies, Drying laundry, Keeping plants) vs SF SG-1 and ST beat 6 (Working, Gaming, Relaxing, Exercising) · ST R9 (Gaming and Relaxing need rules)
- **Recommendation:** Merge them into ten bubbles:
  - Resting, Working or studying, Gaming, Relaxing, Exercising, Getting ready, Hosting friends, Hobbies, Drying laundry, Keeping plants.
  - Gaming adds a glare and plug need. Relaxing adds a seat and soft light.
- **Status:** Decided → DEC-027
- **Answer:** The merged list of ten.

### OI-041 · The new onboarding structure
- **Type:** Default · **Blocks:** onboarding
- **Sources:** OQ C-13, C-4, C-6, C-7 · DD F1.1
- **Recommendation:** Adopt F1.1:
  - The six priorities; pick up to three, and the order you pick them is their rank.
  - Each activity creates a need and a zone to protect.
  - Your own words are stored as "noted, not checked".
- **Status:** Decided → DEC-046
- **Answer:** Accept.

### OI-042 · The Main and Sometimes sort
- **Type:** Default · **Blocks:** onboarding
- **Sources:** OQ F-8 · DD F1.3
- **Recommendation:** Adopt F1.3: pre-sorted from the scan, at most three in Main, tapping a bubble cycles it between sections, and Continue needs at least one bubble in Main.
- **Status:** Decided → DEC-047
- **Answer:** Accept.

### OI-043 · The recap
- **Type:** Default · **Blocks:** onboarding
- **Sources:** OQ F-7, F-2 · DD F1.2 trust moments
- **Recommendation:** Each priority shows a "We'll watch…" line, and a three-line recap closes onboarding.
- **Status:** Decided → DEC-048
- **Answer:** Accept, but the wording of the recap needs work: as worded it sounds invasive, almost like a breach of privacy. Use warm, welcoming language that says these things will be considered while the user makes changes.

### OI-044 · Skipping onboarding
- **Type:** Gap · **Blocks:** flows
- **Sources:** SF P6
- **Recommendation:** Every step can be skipped. If everything is skipped, every priority stays at low priority (D-15) and the editor shows a line in Room Check: "Tell us what matters to get more specific heads-ups".
- **Status:** Decided → DEC-035
- **Answer:** Skip any step. A quiet line in Room Check, and for a while a prompt at the top of the canvas, invite the user to fill in preferences. Skipping references selects a default preset, and a pop-up says so ("continue, or upload references").

---

## Batch 3: blocks step 3 (the scenario)

### OI-050 · Which room is true
- **Type:** Conflict · **Blocks:** the scenario's feasibility, room drawings
- **Sources:** DD §7.1, §7.2 vs ST §2.2. They disagree on:
  - the ceiling (2.5 m vs 2.75 m)
  - the wardrobe's position (0.34 m apart)
  - plug A (x 0.58 vs 0.85)
  - the window sills, which stick out 22 cm
  - the door hinge side, which isn't recorded
- **Recommendation:** Use the 3D scene's values (ST) as the room, because they're what is drawn. Treat the hinge as east until it's measured. Update DD §7 to match.
- **Status:** Decided → DEC-012
- **Answer:** The 3D scene.

### OI-051 · The starting story
- **Type:** Your call · **Blocks:** the scenario
- **Sources:**
  - DD §6 J1 (desk and divider, Privacy first)
  - UJ J2
  - SF S1 ("A room for the person he is now")
  - ST §3 ("Before Saturday", checked against the room)
- **Question:** Step 3 will propose two or three candidates. Should "Before Saturday" be the base, with the others as alternatives?
- **Recommendation:** Yes. It's the only one tested against the room's geometry.
- **Status:** Decided → DEC-058
- **Answer:** A as the main scenario and B as a second pass, both reworked (60 to 70% satisfied). A third, C (Aarav duplicates a layout and changes it), carries layout versions. See DEC-057 to DEC-064.

### OI-052 · Who Aarav is
- **Type:** Conflict · **Blocks:** the scenario
- **Sources:** DD §1.2 and UJ §2.1 (a compact rented bedroom; "why now" unknown) vs SF §4 and ST §3.2 (back in his teenage room after taking a remote job) · UJ JQ-3 (age, job and visitors are missing) · SF SG-7 (his parents say the room is his)
- **Recommendation:** The remote-job, back-home version, with his parents' blessing. Step 3 fills in the missing details for you to approve.
- **Status:** Decided → DEC-059
- **Answer:** Moved back to his hometown, but the room is still a compact room; keep it like that. Don't mention his parents saying the room is his.

### OI-053 · Aarav's priorities
- **Type:** Conflict · **Blocks:** the scenario
- **Sources:** DD F1.1 default (Privacy, Natural light) vs SF §9 item 2 and ST beat 7 (Natural light, Open floor, Privacy)
- **Recommendation:** Natural light, Open floor, Privacy. That gives a card, a marker and a real conflict in one run.
- **Status:** Open
- **Answer:**

### OI-054 · The objects that can be added
- **Type:** Conflict · **Blocks:** the scenario, the add flow
- **Sources:**
  - DD §4.5: five objects
  - UJ §6 and JQ-7: two (a guest chair and a bookcase)
  - SF §9 item 10: three (a wider desk, a yoga mat, a lounge chair)
  - ST §4 item 9: two (a yoga mat from the gallery, a lounge chair from a link)
  - OQ B-13 and D-37: deferred until the journeys are settled
- **Recommendation:** Set them from the chosen scenario in step 3. For now, the yoga mat (gallery, estimated) and the lounge chair (link, from the product page).
- **Status:** Decided → DEC-060
- **Answer:** Mat, lounge chair, print.

### OI-055 · The deliberate detection mistake
- **Type:** Conflict · **Blocks:** the scenario, the correction flow
- **Sources:** DD F8 (the socket mistaken for a light switch is the working choice; the pile is optional) vs SF §9 item 11 and ST beat 3 (the pile of boxes read as one object is the main one)
- **Recommendation:** The pile in the main scenario. The socket appears in the correction flow as a second case.
- **Status:** Decided → DEC-061
- **Answer:** Two kinds: (1) a fixed element given the wrong label (a light switch, a socket); the user can add or change labels on fixed elements such as a window, door, light switch or socket. (2) Two objects detected as one, separated in the edit options. The pile of boxes is clutter the user removes, not a mistake.

### OI-056 · A second scenario
- **Type:** Your call · **Blocks:** step 3
- **Sources:** SF S2 (same room, a person with Privacy first) · UJ JQ-6
- **Recommendation:** A short second pass with a different person in the same room, to show the guidance is personal. It isn't a full story.
- **Status:** Decided → DEC-058
- **Answer:** Yes, B as a second pass, with a clear problem. No mother angle.

### OI-057 · Rule changes the story depends on
- **Type:** Your call · **Blocks:** the scenario, guidance
- **Sources:** ST R1 (plug access is a 15 cm radius around the socket), R3 (privacy depends on facing), R4 (the mat patch is the mat's size plus a margin, and may share the chair's space), R5 (flat things such as mats and rugs don't block walkways), R9 (rules for Gaming and Relaxing)
- **Recommendation:** Adopt all five. Without them the story doesn't work in this room.
- **Status:** Decided → DEC-069
- **Answer:** Adopt.

### OI-058 · The two journey numbering schemes
- **Type:** Conflict · **Blocks:** nothing new
- **Sources:** DD §6 vs UJ §4 (DD's J1 is UJ's J2, and so on) · SF §10
- **Recommendation:** Retire both. The spec's scenario beats and flow IDs replace them, and both docs get a Superseded banner when step 3 is Locked.
- **Status:** Open
- **Answer:**

### OI-099 · Which two objects are detected as one
- **Type:** Your call · **Blocks:** scenario A, the correction flow · **Sources:** DEC-061
- **Question:** Which merged detection does the story use?
- **Options:** (a) The side cabinet and the dressing table, which stand side by side on the east wall and are read as one long unit. (b) The laundry hamper and the storage boxes near window 2, read as one "storage" object. (c) The desk and its chair, read as one "desk".
- **Recommendation:** (a). They touch on the east wall, and the story needs the cabinet to move on its own.
- **Status:** Decided → DEC-066
- **Answer:** The side cabinet and the dressing table.

### OI-100 · Mira's problem (scenario B)
- **Type:** Your call · **Blocks:** scenario B · **Sources:** DEC-058
- **Question:** What is Mira's problem, clearly?
- **Status:** Decided → DEC-065
- **Answer:** Work and sleep in one room.

### OI-101 · Clear the room: the ⋯ menu and the landing pill
- **Type:** Your call · **Blocks:** canvas module (Locked, needs an amendment), sitemap · **Sources:** DEC-063 vs DEC-049 (the top bar has no ⋯)
- **Question:** Where does ⋯ go in the top bar, what else is in it, and when does the "Clear the room" pill show?
- **Status:** Decided → DEC-067
- **Answer:** ⋯ replaces Settings: Clear the room, Room edit, Preferences. The pill shows on landing in a layout never edited, and goes on the first change.

### OI-102 · Add "how it looks and feels" to the aim's one-line summary
- **Type:** Your call · **Blocks:** 00-aim.md (Locked, needs an amendment) · **Sources:** DEC-057
- **Question:** The aim's line reads "let people try their room before they move a thing, see what each choice costs them, and leave knowing what to do." Amend it to lead with seeing how it would look and feel?
- **Recommendation:** "Let people see how their room could look and feel before they move a thing, understand what each choice gives and takes, and leave knowing what to do."
- **Status:** Decided → DEC-068
- **Answer:** Amend.

### OI-103 · Does changing preferences bring back kept checks?
- **Type:** Gap · **Blocks:** step 4 edge cases (the owner took it out of scenario C on 2026-11-11) · **Sources:** DEC-042 (a kept check returns only if the object moves, its size is edited, or a correction changes the cause) vs scenario C act 2 (Gaming moved to Main)
- **Recommendation:** Yes, but only for a check whose level changes because of the new preferences (a marker that would now be a card). It returns once, as the new level.
- **Status:** Open
- **Answer:**

---

## Batch 4: blocks step 4 (flows) and step 5 (screens)

### OI-104 · The compact editor frame in the prototype differs from the Locked canvas module
- **Type:** Conflict · **Blocks:** canvas module (Locked, needs an amendment), ED-01 and ED-02 in step 5
- **Sources:** the owner's brief of 2026-11-12 (the room must not be blocked; compact wherever possible) vs [modules/canvas.md](modules/canvas.md) §1, §3 and §5 (DEC-013, DEC-049, DEC-050). The prototype was changed at the owner's request; canvas.md was not.
- **The two sides:**
  - **Undo and Redo.** canvas.md §1: "Right: Room Check · [Undo Redo] as one pill · [Preview ⋯] as one pill." The owner: "the redo and undo buttons should be placed below the top left section of the page so that they are maybe more reachable."
  - **Save.** canvas.md §10: Save layout sits inside "Layout name ▾ opens Layouts", and §9 offers it after Confirm. The owner: "There should be a save option right on the canvas page itself… without having to go to the dropdown, which is like a tiny chevron beside the layout name."
  - **The toggle.** canvas.md §1: "**AI | Assets** toggle". The owner: "removing the button text from the AI and asset toggle. Instead, you should just keep it a toggle."
  - **The tap menu.** canvas.md §3: "A small menu beside the tapped object." The owner: "a floating attached menu which appears on top of the object", compact.
  - **Rotation.** canvas.md §5: "Exit: a Done chip". The prototype now attaches that chip to the object.
- **Question:** Amend canvas.md to the frame the prototype now has? And one thing only you can decide: what **Save** does while changes are staged.
- **Options for Save with staged changes:** (a) It saves the room as last confirmed and says the staged changes are not included (what the prototype does today). (b) It opens the Confirm review first, then saves. (c) Save is disabled until the changes are confirmed or discarded.
- **Recommendation:** Amend canvas.md §1, §3 and §5 as built. For Save, (b): one button that never saves something different from what is on screen, and the checks still get their review (DEC-034).
- **Status:** Open
- **Answer:**

### OI-060 · The correction flow
- **Type:** Default · **Blocks:** correction flow
- **Sources:** OQ H-1, H-2, H-5, H-7, H-8 · DD F8
- **Recommendation:**
  - Four ways in: Not right? on a card, Not right? on any object, "Here's what we found", and "Mark something we missed".
  - Fixed elements can be corrected only through this flow.
  - The user's correction wins.
  - A merged object is removed and re-added, not split.
- **Status:** Open
- **Answer:**

### OI-061 · Edit Object details
- **Type:** Default · **Blocks:** the Edit Object screen
- **Sources:** OQ A-2, A-3, A-4, A-5, A-8, C-3 · DD F3
- **Recommendation:**
  - A number field with +/− and the detected value beside it.
  - Proportions locked by default, and type limits that stop the field.
  - Reset to detected.
  - The preview stays a wireframe until Confirm.
  - "Needs power" sits in an advanced section.
  - No measuring tools.
- **Status:** Decided → DEC-054
- **Answer:** Accept.

### OI-062 · Edge cases when adding an object
- **Type:** Default · **Blocks:** the add flow
- **Sources:** OQ B-2, B-3, B-4, B-6, B-11
- **Recommendation:**
  - One photo, with "Is this the one?".
  - A link with no size falls back to an estimate.
  - Several sizes means you pick one.
  - Confirming the type takes one tap.
  - The source chip is always shown.
  - Added objects use the same gestures as everything else.
- **Status:** Open
- **Answer:**

### OI-063 · Topics with no flow
- **Type:** Your call · **Blocks:** flows
- **Sources:** SF §9 item 9 (a poor or failed scan, re-scanning after the real room changes, comparing layouts)
- **Recommendation:** Write a short flow for a poor or failed scan, since scans do fail. Re-scanning and comparing are out with Adapt (OI-004).
- **Status:** Open
- **Answer:**

### OI-064 · Coming back to a project
- **Type:** Default · **Blocks:** flows, Home
- **Sources:** OQ G-5 · SF X1
- **Recommendation:** Everything survives: staged changes, dismissals, corrections and added objects. Opening the project returns you to where you were, with a line if changes are still waiting for Confirm.
- **Status:** Decided → DEC-055
- **Answer:** If a project is always left by saving or discarding, it always opens with no unconfirmed changes.

### OI-065 · Added objects in other projects
- **Type:** Default · **Blocks:** assets
- **Sources:** OQ B-8
- **Recommendation:** Added objects belong to this project only.
- **Status:** Open
- **Answer:**

---

## Batch 5: the evaluation plan (outside the steps)

Raised by [evaluation/plan.md](evaluation/plan.md), written at the owner's request on 2026-11-12.

### OI-105 · How the AI runs during the test
- **Type:** Your call · **Blocks:** evaluation plan §5.1 and §5.6, the test build
- **Sources:** the owner's brief of 2026-11-12 ("These scenarios might be scripted, or… if you think we can set up a framework for the AI to work, then we might do that") · [modules/ai.md](modules/ai.md) prototype note, as amended by DEC-072 ("The AI's decisions are made by a small model on the device… the scripted version of it is the fallback")
- **Question:** In the test, does the local model run, or the scripted fallback?
- **Options:** (a) Model off. The room's rules stay live in code, so checks answer wherever the participant drops something. Card wording is fixed, and the chat runs on the chips plus a table of prepared replies. (b) The model on, as in the prototype today. (c) A fully scripted path: every participant follows the same steps.
- **Recommendation:** (a). The ratings are only comparable if everyone meets the same check with the same words. With (b) the test measures the model, and with (c) nobody makes a real choice, so "in control" can't be measured. DEC-072 stands for the prototype; this is a setting for the test.
- **Status:** Open
- **Answer:**

### OI-106 · What the test covers and what it leaves out
- **Type:** Your call · **Blocks:** evaluation plan §2.3, §5.2 and §7.1, the screen priority for the prototype
- **Sources:** [UJ §8](../docs/kith-user-journeys.md) (setup "or pre-done"; a seeded detection error for H7) · UJ F-4 ("Use two different profiles in testing") · the owner's brief of 2026-11-12 (interactions, then a scenario in the fixed room)
- **Question:** Four scope choices:
  1. Do participants enter Aarav's activities and priorities themselves?
  2. One scenario for everyone, or two profiles?
  3. Is correcting a wrong detection (H7) tested?
  4. Are restyle and saved layouts tested?
- **Recommendation:**
  *Owner's direction (2026-11-13), for point 3:* the test story should cover "fix a misidentified constraint at the start of the editing journey". [evaluation/story.md](evaluation/story.md) Part 1 does this with a wrong label, so RE-01 and RE-02 join the screens the test needs. The recommendation for point 3 below is out of date.
  1. Yes, activities and priorities only (PR-03 to PR-05). "You chose Open floor" only means something if they chose it. Skip the scan, references and Room edit. If those three screens aren't ready, load the preferences beforehand and show the recap.
  2. Scenario A for everyone. Five or six people split across two profiles is too few on each side.
  3. No. The correction flow is still open (OI-060).
  4. No. They add minutes and screens without touching the control and interruption questions.
- **Status:** Open
- **Answer:**

### OI-107 · Facilitator controls in the test build
- **Type:** Gap · **Blocks:** evaluation plan §4.1 and §7.2
- **Sources:** none. The plan needs them
- **Question:** Can the build have three controls for the facilitator: checks off and on, reset to the starting layout, and model off?
- **Recommendation:** Yes, as URL settings or a hidden menu. Checks are off in Part A so that each task measures one gesture and the first check a participant sees is in Part B. If "checks off" can't be built, Part A uses spots that are piloted to raise no check.
- **Status:** Open
- **Answer:**

### OI-108 · Participants and session
- **Type:** Your call · **Blocks:** evaluation plan §3
- **Sources:** [00-aim.md](00-aim.md) §1 (who it's for) · DEC-007 (phone first) · UJ §8 (about 30 minutes)
- **Question:** Who takes part, how many, and how is the session run?
- **Recommendation:** Five or six people who run their own small room (a rented room, a studio, a room in a shared flat), plus one pilot. In person, 45 minutes each, on a phone, because hold, drag and twist need touch. Screen and voice recorded with consent.
- **Status:** Open
- **Answer:**

### OI-109 · Measures and targets
- **Type:** Default · **Blocks:** evaluation plan §2.1 and §6
- **Sources:** [DD §9.2](../docs/kith-design-documentation.md) (signals to look for, no thresholds)
- **Recommendation:** The System Usability Scale after Part A, one ease question per task, and the targets in the plan's §6 table as a first line for "good enough". They're a starting point, not a pass mark.
- **Status:** Open
- **Answer:**

### OI-110 · An evaluation folder in the method
- **Type:** Default · **Blocks:** nothing
- **Sources:** [process.md](process.md) §2 (Locked; its file list has no `evaluation/`)
- **Recommendation:** Add `evaluation/` to the file list in process.md §2: "the test plan, outside the steps".
- **Status:** Open
- **Answer:**

### OI-111 · The sightline from the door, and the door's opening
- **Type:** Gap · **Blocks:** room-rules.md §3 (Privacy), guidance.md §3 (line of sight)
- **Sources:** [room-rules.md](scenarios/room-rules.md) §3 · the owner testing the prototype on 2026-11-13: the desk by the door was called "in view from the door" and it is not
- **Question:** Where does the door see from, and through what? The rule draws a line from the middle of the door, so a desk in the corner beside the door counts as in view, although the door frame hides it from anyone outside.
- **Recommendation:** The viewer stands just outside on the door's centre line and sees only through the 0.88 m opening, less 3 cm each side for the frame. A thing at least 1.5 m tall on that line still breaks it. This is how the prototype works now. It also matches scenario B, where the desk "in the corner by the door" is out of her line of sight.
- **Status:** Open
- **Answer:**

### OI-112 · The window sills in the room model
- **Type:** Gap · **Blocks:** room-rules.md §1 (the sills row)
- **Sources:** [room-rules.md](scenarios/room-rules.md) §1 (the sills stick out 22 cm, and nothing taller than 0.65 m can stand against the wall there) · the owner on 2026-11-12: "fix the window so that no object clips in the room"
- **Question:** Do the sills stick out 22 cm and block furniture, or sit flat on the wall?
- **Recommendation:** Flat. The prototype's window, sill, grill and curtains now sit within a couple of centimetres of the wall, so the bed and desk no longer cut into them. If that stands, the silent block comes out of room-rules §1; if the sills should be real, the block must be built into where things can be placed.
- **Status:** Open
- **Answer:**

### OI-113 · Linking two objects that were never a pair
- **Type:** Gap · **Blocks:** [evaluation/story.md](evaluation/story.md) Part 7, canvas module §3 and §4 (Locked, would need an amendment)
- **Sources:** the owner's brief of 2026-11-13 (the test story should cover "link objects") · [modules/canvas.md](modules/canvas.md) §3 ("Unlink / Link · Linked pairs only · Splits or rejoins the pair") and §4 (the selection bar: "3 selected · Ask AI · Remove · ✕")
- **Question:** canvas.md only lets a user split or rejoin a pair the app already knows (desk and chair, dressing table and stool). How does a user link two objects of their own choosing, such as a lounge chair and its lamp?
- **Options:** (a) With exactly two objects selected, the selection bar offers **Link**. (b) No new links: the story shows Unlink and Link on the desk and its chair. (c) Link in the tap menu, then tap the partner.
- **Recommendation:** (a). It uses the selection the user already knows, and a chair with its lamp is a reason people would really have. The story was written this way on 2026-11-13.
- **Revised 2026-11-13:** the story was rewritten around the owner's drawing and now uses only the existing desk-and-chair link (Unlink, then Link). Linking two objects of the user's choosing is no longer needed by the test story, so this item no longer blocks it.
- **Status:** Open
- **Answer:**

### OI-114 · Aarav's priorities in the test story
- **Type:** Your call · **Blocks:** [evaluation/story.md](evaluation/story.md) Part 3; tied to OI-053
- **Sources:** [scenarios/A-aarav.md](scenarios/A-aarav.md) (Natural light, Open floor, Fresh air) · OI-053 (recommends Natural light, Open floor, Privacy) · the owner's brief of 2026-11-13 ("our system is supposed to flag things which are beyond what that user sees just on the screen")
- **Updated 2026-11-13:** the owner asked for the tags to follow the story. After walking the story, Restful sleep has no moment (the AI proposes the bed on the east wall, away from the AC), so the story now uses **Natural light, Open floor, Fresh air**. Fresh air connects the shelf and the fan, which both touch window 1.
- **Question:** Which three priorities does Aarav pick in the test story?
- **Recommendation:** Natural light, Open floor, Restful sleep. The AC blowing at his pillow is the clearest thing the app knows that he can't see, and it's fixed by turning the bed. Fresh air and Privacy only speak when a window is blocked or the desk faces the door, and he can see both for himself. Scenario A can keep its own picks, or follow this one when OI-053 is decided.
- **Status:** Open
- **Answer:**

### OI-115 · A proposal with several objects: tabs, and a view that follows
- **Type:** Your call · **Blocks:** [evaluation/story.md](evaluation/story.md) Part 2; [modules/ai.md](modules/ai.md) §1 and §6 (Locked, would need an amendment)
- **Sources:** the owner on 2026-11-13: for a request like "add the side cabinet, the dressing table and the laundry hamper", the AI proposes all three, and "the user can tap on tab actions and switch to particular views… while also having the ability to pan around and then the selected option would change based on whatever is there" · ai.md §1 (a proposal is "a change shown on the canvas with Apply · Not now") and §6 (a restyle shows a tick on each changed object, DEC-052)
- **Question:** ai.md has one kind of proposal. How does a proposal with several objects behave?
- **Recommendation:** The story assumes this:
  - A strip of tabs sits above the pill: **All**, then one per object. That is "four states" for three objects (my reading of "the four states").
  - Tapping a tab turns the view to that object's copy and lights the tab, with one line saying why it goes there.
  - Panning by hand lights the tab of the copy nearest the middle of the screen.
  - **Apply** stages all of them, and **Not now** drops all of them. Each object keeps the tick from DEC-052, on by default.
- **Status:** Decided → DEC-074
- **Answer:** The owner: the proposed objects appear as a card that looks like vertical tabs, one per object. Tapping a tab takes the user to that proposed spot. It works backwards too: panning round the room switches the tab to the object mainly in view. Treat the current prototype as the working tool.

### OI-116 · The wall shelf
- **Type:** Gap · **Blocks:** [evaluation/story.md](evaluation/story.md) Part 3, [scenarios/room-rules.md](scenarios/room-rules.md) §2 (window rule), canvas module §6 (Locked: "Floor and walls", DEC-038)
- **Sources:** the owner on 2026-11-13: a wall-mounted bookshelf "above the storage laundry", in the little gap beside the window below the AC · `src/v4/room.ts` (the Bookshelf is a floor bookcase, 80 × 160 cm)
- **Question:** The shelf hangs on the south wall, in the gap west of window 1, which is about 30 to 50 cm wide. What is it, and what does the room say about it?
- **Recommendation:**
  - A new object type, **wall shelf**: it hangs on a wall and has no floor footprint, so it may sit above a floor object. Its bottom edge is at about 1.6 m, so a floor lamp (1.5 m) can stand under it.
  - It arrives from a photo, "Estimated from photo", 60 cm wide. Aarav corrects it to 40 cm in Edit Object, which is the story's size correction.
  - The window rule gains a line: **"Something that hangs across a window"** gets the card "This would cover part of window 1." At the moment the rule fires only for something taller than 1.05 m standing in the window's strip.
- **Status:** Open
- **Answer:** The owner (2026-11-13): "there is no wall shelf type. I think you will have to add that and add some decorative elements to it also, and make sure it fits on the proposed position that we are intending it to take." Still open: the shelf's height off the floor, and the window card for something hung across a window.

### OI-117 · What the owner's drawing doesn't show
- **Type:** Gap · **Blocks:** [evaluation/story.md](evaluation/story.md), [evaluation/story-floor-plans.md](evaluation/story-floor-plans.md)
- **Sources:** the owner's drawing of the final room, 2026-11-13 · `src/v4/room.ts`
- **Question:** Five things the drawing leaves open, each written into the story as an assumption:
  1. **The bed's head end.** The story puts it at the north wall, by the door. It also covers plug A, which nothing in the final room needs.
  2. **The rug's size.** The drawing's carpet is about 150 × 150 cm. The prototype's Jute rug is 160 × 110 cm.
  3. **Removing a single object.** The owner's list has "remove an object", but removing a clashing object was called a big step, and Clear the room already empties the room. Nothing in the story removes one piece.
  4. **The move list.** The bed needs the east wall and the desk needs the bed's old wall, so the list needs a "slide to the middle for now" step. The prototype's list can't produce one.
  5. **The scan's mistake.** The story has the scan call the plug between the windows a "light switch". The prototype starts it as "Is this a plug?".
- **Recommendation:**
  1. Keep the head at the north wall.
  2. Set the prepared rug to 150 × 150 cm.
  3. Add a small remove: Aarav puts the pedestal fan back out of habit, the plug and window cards name it, and he removes it. This is the "clashing object" step, so it is the owner's call.
  4. Keep the parking step, and add it to the prototype's list.
  5. Make the prototype's seeded mistake the label, as in the story.
- **Status:** Open
- **Answer:** The owner (2026-11-13), by number:
  - **2, the rug.** "The rug and the yoga mat are different things." The rug stays in the room as part of the layout. The yoga mat belongs to Exercising, so it depends on what the user picks at the start. "You will have to add the rug" to the prototype's Assets, at the drawing's size. The mat becomes a second layout (see the story, Part 5).
  - **3, removing one object.** Yes: Aarav puts the fan somewhere, then realises he should remove it, while he is looking for a place for the lamp.
  - **4, the parking step.** The owner asked what it means. Explained in chat on 2026-11-13; waiting for their answer.
  - **5, the scan's mistake.** Yes: the plug's label, which Aarav fixes in the story.
  - **1, the bed's head end.** Not answered.
  - **Priorities.** Re-tag from the story (see OI-114).

### OI-118 · The app's name in the spec and the old files
- **Type:** Your call · **Blocks:** nothing
- **Sources:** the owner on 2026-11-13: "change the name of the app to layo everywhere". The prototype, its page title and its manifest now say Layo. The spec and the five old files in `docs/` still say Kith
- **Question:** Do the spec and `docs/` take the new name too?
- **Recommendation:** Yes, as one decision in decisions.md: "The app is called Layo". Then every mention of Kith in the spec is changed, and each change in `docs/` is ticked off as it's made, as process.md requires. File names such as `kith-design-documentation.md` and the `kith-v4.css` stylesheet stay as they are, because nothing a person sees depends on them.
- **Status:** Open
- **Answer:**

### OI-119 · Why the AI chose a spot
- **Type:** Gap · **Blocks:** [evaluation/story.md](evaluation/story.md) Parts 1 and 2, [modules/ai.md](modules/ai.md) §3 (Explain)
- **Sources:** the walk-through on 2026-11-13 ([evaluation/story-check.md](evaluation/story-check.md) items 18 to 21): a proposal shows only the spot ("Against the east wall"), and "Why did you put the bed against the east wall?" gets "Nothing is open here right now."
- **Question:** Should the AI say why it chose a spot, or only where?
- **Options:** (a) A one-line reason on each row, from the rules ("clear of the wardrobe doors", "low, so it won't block the window"). (b) The reason only when asked, in chat. (c) Neither: the AI says where, and the user judges.
- **Recommendation:** (a), because the aim says to show what each choice gives and takes, and the owner wants the AI to help the user notice what they might not have. It costs one line per row. If the owner prefers (c), the story already works that way.
- **Status:** Open
- **Answer:**

### OI-120 · Rules and cards the prototype has changed at the owner's request
- **Type:** Gap · **Blocks:** room-rules.md §1 (window and plug rows), guidance.md §3 (the heads-up card)
- **Sources:** the owner testing the prototype on 2026-11-13: a slim floor lamp raised "this would block window 1" and "the plug is behind the desk"; the heads-up card carried "Not right?"; applying an option raised the same card again
- **Question:** Do these go into the spec?
  1. A window is blocked only when the footprint covers more than half of its width (the rules say any overlap with the 0.4 m strip).
  2. Something hides a plug only if it is taller than the plug is high plus 5 cm (the rules say 0.9 m, which let a 0.95 m desk hide a plug set at desk height).
  3. The heads-up card has no "Not right?". Object settings are in Edit, from the tap menu.
  4. Applying a proposed spot or an option counts as choosing it, so what it listed (for example "in view from the door") is kept: no card and no marker follow.
  5. "Show options" offers two spots, each with one line on why it fits (DEC-032 says two or three).
  6. A spot with nothing against it still has the Layo marker in the tap menu, and tapping it says so in one line.
- **Recommendation:** Adopt all six, and write them into room-rules.md and guidance.md as decisions once the test round has shown they hold.
- **Status:** Open
- **Answer:**

---

## Parked (needed for building, not for the screen specs)

These are recorded so nothing is lost. They aren't asked now.

| ID | Item | Sources |
|---|---|---|
| OI-090 | How far a rule's recalculation reaches after a size edit (adopt OQ A-6) | OQ A-6 |
| OI-091 | Where threshold values come from and their calibration | OQ C-8, E-6 · DD §7.4b · ST F1, F7, R2, R8 |
| OI-092 | How plug reach is measured | OQ C-9 · ST F1, F8, R2 |
| OI-093 | The table of objects allowed to overlap (beyond rug and tucked chair) | OQ C-11 · ST R5 |
| OI-094 | How rules are stored and authored | OQ E-2 |
| OI-095 | The script versus live rules (the facilitator guide). Taken up in [evaluation/plan.md](evaluation/plan.md) §5.1; decided with OI-105 | OQ E-3 |
| OI-096 | What the first test must learn, and the session plan. Taken up in [evaluation/plan.md](evaluation/plan.md); decided with OI-106 to OI-109 | OQ G-6 · UJ JQ-4, JQ-5, JQ-8 · DD §9.2 |
| OI-097 | Lower footprints for the fan and the mirror table | ST F10, R10 |
| OI-098 | Rules keep running after Confirm (adopt OQ D-Q11) | OQ D-Q11 |
