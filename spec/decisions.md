# Decisions

**Status:** Draft · **Depends on:** [open-items.md](open-items.md) · **Open items:** none

Decisions made during the spec work. Decisions made before it (D-01 to D-41) stay in [kith-open-questions.md, Part 1](../docs/kith-open-questions.md).

Each entry records:
- the open item it closes
- what was decided and the reason
- a checklist of every file it changes, in spec/ and in docs/

An entry is complete only when every box is ticked. The check fails while any box is open.

Format:

```
### DEC-001 · Short title
- **Closes:** OI-nnn · **Date:** yyyy-mm-dd
- **Decision:** …
- **Why:** …
- **Changes:**
  - [ ] spec/… : what changes
  - [ ] docs/… §x.y : what changes
```

---

<!-- Decisions start below this line. -->

### DEC-001 · The specs follow the test prototype
- **Closes:** OI-001 · **Date:** 2026-11-11
- **Decision:** Screens show the test prototype (D-27, D-28):
  - The canvas is the 3D room model.
  - Staged objects are bounding boxes.
  - Confirm shows 3D models.
  - Scanning, detection, the objects that can be added and the AI are scripted.
- **Why:** The owner's call. The screens should match what testers will use.
- **Changes:**
  - [x] docs/kith-design-documentation.md §2.1: note added
  - [x] spec/source-map.md: §2.1 Pending → Carried
  - [x] spec/00-aim.md: fidelity stated in the scope section

### DEC-002 · Refine is dropped
- **Closes:** OI-002 · **Date:** 2026-11-11
- **Decision:** No Refine mode. The Redesign/Refine choice is removed from onboarding, and the editor has no mode.
- **Why:** It was never defined. A choice that leads nowhere breaks "no dead ends". Personalisation comes from finishes and added objects.
- **Changes:**
  - [x] docs/kith-design-documentation.md §1.3: Refine row set to Dropped, with a note
  - [x] docs/kith-design-documentation.md F1: flow line note, Onboarding 2 row struck through
  - [x] docs/kith-design-documentation.md F1.2: step 2 and Mode rows marked dropped
  - [x] docs/kith-design-documentation.md F7: Superseded banner
  - [x] spec/source-map.md: F7 → Superseded, §1.3 → Carried
  - [x] docs/: pointers for OQ G-3 and F-4 closed (npm run spec:close)
  - [x] spec/00-aim.md: out-of-scope list

### DEC-003 · Zone stays on Home, defined later
- **Closes:** OI-003 · **Date:** 2026-11-11
- **Decision:**
  - Home keeps the Zone option. No flows or screens behind it this round.
  - **Concept, for later:** a Zone is a photo of one section of the room, for fine, micro-level work that the room view is too coarse for. Examples: posters on a wall, arranging things on a desk top.
  - The room view is the macro level.
- **Why:** The owner's call. It keeps the idea visible without adding a second canvas now.
- **Changes:**
  - [x] docs/kith-design-documentation.md §1.3: capture row and note
  - [x] docs/: pointer for OQ G-2 closed
  - [x] spec/00-aim.md: scope, with Zone as a defined concept and the macro/micro split

### DEC-004 · Layouts can be saved (a small part of Adapt)
- **Closes:** OI-004 · **Date:** 2026-11-11
- **Decision:** "Save this layout" is in scope. Comparing layouts stays deferred. What saved layouts allow is DEC-009.
- **Why:** The owner's call. It makes goal 5 visible with the smallest feature.
- **Changes:**
  - [x] docs/kith-design-documentation.md §1.3, §1.6, §1.7: rows updated
  - [x] docs/kith-open-questions.md Part 1, D-29: note "partly reversed"
  - [x] spec/00-aim.md: goal 5 coverage
  - [x] spec/modules/canvas.md: the layout actions

### DEC-005 · The ending is an ordered move list
- **Closes:** OI-005 · **Date:** 2026-11-11
- **Decision:** After Confirm, the user can open a short, shareable list of real-world moves, in the order the layout needs them. The order comes from the rules: for example, clear what blocks a spot before moving something into it.
- **Why:** It's the smallest bridge from the screen to the real room (goal 2).
- **Changes:**
  - [x] docs/kith-design-documentation.md F6: "Take away" row
  - [x] spec/modules/canvas.md: the finish section

### DEC-006 · Preferences are answered while the room is processed
- **Closes:** OI-006 · **Date:** 2026-11-11
- **Decision:** Home → Scan → preferences (name and references, activities, priorities) while processing runs → "Here's what we found" → Editor.
- **Why:** The processing wait is real, so it gets used.
- **Changes:**
  - [x] docs/kith-design-documentation.md F1: flow line note, Onboarding 5 row
  - [x] spec/source-map.md: F1 Conflict → Input
  - [x] spec/screens/sitemap.md: capture and preferences order

### DEC-007 · Phone first, portrait
- **Closes:** OI-007 · **Date:** 2026-11-11
- **Decision:** Phone first, portrait. Tablet later. Applied as a Default, which the owner can overrule.
- **Why:** The recommendation in OQ G-4.
- **Changes:**
  - [x] docs/: pointer for OQ G-4 closed
  - [x] spec/00-aim.md: platform line

### DEC-008 · The Zone tile does nothing yet
- **Closes:** OI-008 · **Date:** 2026-11-11
- **Decision:** The Zone tile is shown on Home and does nothing when tapped. It will be planned fully later.
- **Why:** The owner's call. **Known tension:** a control that does nothing pulls against principle P4 (no dead ends). It's accepted for this round. The tile is not a screen on the sitemap.
- **Changes:**
  - [x] docs/kith-design-documentation.md §1.3: capture row
  - [x] spec/screens/sitemap.md: Home row notes the inert tile

### DEC-009 · Saved layouts: save, reopen, duplicate
- **Closes:** OI-009 · **Date:** 2026-11-11
- **Decision:**
  - Save the confirmed room under a name.
  - The project lists its layouts, and any of them can be opened to keep editing.
  - A new layout starts from the original room or from a copy.
  - No comparing.
- **Why:** The owner's call.
- **Changes:**
  - [x] docs/kith-design-documentation.md §1.3, F6: rows updated
  - [x] spec/modules/canvas.md: layout actions, and what happens to unconfirmed changes when switching layouts
  - [x] spec/screens/sitemap.md: the layouts list

### DEC-010 · Added objects are in scope, and their sizes can be edited
- **Closes:** OI-071 · **Date:** 2026-11-11
- **Decision:**
  - Objects that are not in the room can be added (photo, link, Suggested).
  - Edit Object corrects the size of any object, including added ones, whose size is often an estimate from a photo.
  - Trying a bigger version of your own furniture is still done by adding a different object (D-02).
- **Why:** The owner's comment on the aim draft. An estimate from a photo must be correctable, or the plan is built on a wrong size. *Interpretation to confirm: "the reason mentioned earlier" is read as the photo-estimate problem.*
- **Changes:**
  - [x] spec/00-aim.md §5: in-scope objects, out-of-scope row reworded
  - [x] docs/kith-design-documentation.md §1.4: Edit dimensions row
  - [x] docs/kith-design-documentation.md §4.4: Purpose row
  - [x] spec/modules/canvas.md: Edit Object applies to every object

### DEC-011 · P9: clear about its abilities, quietly
- **Closes:** OI-070 · **Date:** 2026-11-11
- **Decision:** A ninth principle.
  - Each tool shows what it can and can't do through what it offers (the actions shown on an object, suggestion chips, dimmed actions), not through explanation.
  - A "no" is one short line that points to what is possible.
  - P9 must never make a screen denser.
- **Why:** The owner's brief, to minimise confusion, with the owner's condition that it works passively and without cognitive overload.
- **Changes:**
  - [x] spec/00-aim.md §4: P9 row
  - [x] spec/open-items.md OI-024: recommendation made passive
  - [x] spec/modules/ai.md, canvas.md, guidance.md: P9 applied in each

### DEC-012 · The room is the 3D scene
- **Closes:** OI-050 · **Date:** 2026-11-11
- **Decision:** The values in the 3D scene are the room:
  - the ceiling is 2.75 m
  - the wardrobe and plug A are where the scene draws them
  - the window sills stick out 22 cm
  - the hinge is east until it's measured
- **Why:** It's what is drawn, and what the stress test measured.
- **Changes:**
  - [x] docs/kith-design-documentation.md §7: update note
  - [x] spec/00-aim.md §6: the room
  - [x] spec/source-map.md: DD §7, 7.1, 7.2, 7.6, 10.3 and ST §2.2 → Carried
  - [x] docs/: pointer for ST §4 item 1 closed

### DEC-013 · The editor layout: the canvas edits, the bottom bar brings things in
- **Closes:** OI-012, OI-073 · **Date:** 2026-11-11
- **Decision:** No tabs.
  - **Top bar:** back, layout name, undo and redo, a preview toggle that hides the interface, Confirm with a count of staged changes.
  - **Bottom:** an **AI | Assets** toggle on the left and a pill on the right. In AI it is the chat input; in Assets it is one row of assets. A grab handle expands it to the conversation or an asset grid.
  - **Object actions:** the tap menu on the object (DEC-014).
- **Why:** The owner's design. Editing happens on the canvas, as a direct mental model for a 3D space. The bottom bar holds the two sources of change, talking and adding. The toggle is named for what the pill holds.
- **Changes:**
  - [x] docs/kith-design-documentation.md §8.1: note
  - [x] spec/source-map.md: §8.1 → Superseded
  - [x] spec/modules/canvas.md: the editor frame
  - [x] spec/screens/sitemap.md: editor rows

### DEC-014 · A tap on an object shows its name and menu
- **Closes:** OI-072 · **Date:** 2026-11-11
- **Decision:** A tap shows the object's name and a menu. The owner named **Edit** (opens Edit Object) and **Remove** (to Assets). The canvas module proposes the full menu.
- **Why:** The owner's call. Actions sit on the thing they act on.
- **Changes:**
  - [x] docs/kith-design-documentation.md F2: note
  - [x] spec/modules/canvas.md: the full menu, for the owner to confirm

### DEC-015 · Selecting one or several objects
- **Closes:** OI-011, OI-076 · **Date:** 2026-11-11
- **Decision:** **Hold and release** without dragging selects an object. While something is selected, tapping another object adds it to the selection. With several selected, a floating bar appears ("3 selected · Ask AI · Remove · ✕"), and the AI context chip shows the selection. Several objects are never dragged together.
- **Why:** The owner's call. Hold already lifts, so hold-and-release is a natural "pick up and put down".
- **Changes:**
  - [x] docs/kith-design-documentation.md F2: note
  - [x] spec/modules/canvas.md: selection states

### DEC-016 · Rotation
- **Closes:** OI-010 · **Date:** 2026-11-11
- **Decision:** A **two-finger twist** rotates the object. It snaps to the room's planes (angles parallel to the walls) at a low threshold, with a haptic tick. A **Rotate** action in the menu enters a rotation state: dragging a finger horizontally turns the object about its vertical axis. A rotated object becomes staged, like a moved one.
- **Why:** The owner's call. Direct and tactile, with snapping to keep it tidy, and a button so the gesture is discoverable (P9).
- **Changes:**
  - [x] docs/kith-design-documentation.md F2: note
  - [x] spec/modules/canvas.md: the rotation state

### DEC-017 · Edit Object always opens after adding
- **Closes:** OI-013 · **Date:** 2026-11-11
- **Decision:** After a photo or link is added, the full Edit Object view opens, to confirm the type and check the size, before the object is placed.
- **Why:** The owner's call. It matches D-10 and design documentation F4. The size of an added object is often an estimate (DEC-010).
- **Changes:**
  - [x] spec/source-map.md: F4 Conflict → Input
  - [ ] (step 4) spec/flows: the add flow

### DEC-018 · AI changes are proposals the user applies
- **Closes:** OI-020 · **Date:** 2026-11-11
- **Decision:** Every change the AI makes appears on the canvas as a proposal (a ghost or a staged box) with **Apply** and **Not now**. It goes through the same rules and heads-ups as a touch change.
- **Why:** It keeps P1. The user's tap is Apply.
- **Changes:**
  - [x] docs/kith-design-documentation.md §4.6.7: note
  - [x] spec/source-map.md: DD §4.6.7 and SF §7.3 → Input
  - [x] spec/modules/ai.md

### DEC-019 · How loud feedback is: markers by default, cards for what matters, and the card is the AI's
- **Closes:** OI-030, OI-074 · **Date:** 2026-11-11
- **Decision:** - **Card on drop** for room facts (the door swing, a sealed entrance, a needed plug that is hidden or out of reach, a window, the wardrobe, the walkway) and for the user's ranked priorities.
  - **Marker** for everything else. Tapping a marker opens its card.
  - **One review at Confirm** for what is still open.
  - **Blocks** stay silent (DEC-020).
  - The card is the AI's voice, so guidance's active feedback belongs to the AI module.
- **Why:** The owner's call. It keeps the screen calm (P9 quiet) and still catches real problems.
- **Changes:**
  - [x] docs/kith-design-documentation.md §4.6.3a: note
  - [x] docs/kith-design-documentation.md §4.6.7: note
  - [x] spec/modules/guidance.md and ai.md: the card is specified once, in ai.md, and guidance.md links to it

### DEC-020 · Blocks stay silent
- **Closes:** OI-016 · **Date:** 2026-11-11
- **Decision:** D-31 stands. A blocked placement slides to the nearest valid spot and nothing is said, including at the window sill.
- **Why:** The owner's call.
- **Changes:**
  - [x] spec/modules/guidance.md: blocks section

### DEC-021 · The AI may answer with a number when asked
- **Closes:** OI-022 · **Date:** 2026-11-11
- **Decision:** Asked directly ("How wide is my desk?"), the AI answers with the number and its source, and offers to open Edit Object.
- **Why:** The owner's call. Numbers are still never pushed at people unasked.
- **Changes:**
  - [x] docs/kith-design-documentation.md §8.3: row
  - [x] spec/source-map.md: §8.3 → Carried
  - [x] spec/modules/ai.md

### DEC-022 · Room Check: a top-bar button and a list of open checks
- **Closes:** OI-075, OI-077, OI-034 · **Date:** 2026-11-11
- **Decision:** - **The button.** A Room Check button in the top bar, showing a count only when checks are open.
  - **The list.** Every open check, grouped by object. It includes problems that were there before any change, tagged "Before you started".
  - **An item.** Tapping one turns the view to its object and opens its card (the same card the marker opens).
  - **Clear checks.** At the top of the list. It opens a confirmation saying every check will be cleared and can't be restored. On confirm, all markers go and the list is empty.
  - **No restoring.** A kept or cleared check returns only if the situation really changes (a new spot, a size edit, a correction).
  - **Empty state.** No count, and "Nothing to check".
- **Why:** The owner's design. Markers pile up as the user experiments, so the user needs one place to see and clear them. Restoring was judged unnecessary.
- **Changes:**
  - [x] docs/kith-design-documentation.md §2.2 P4, §4.6.3, §4.6.6: notes
  - [x] spec/open-items.md: OI-034 closed
  - [x] spec/modules/guidance.md: Room Check
  - [x] spec/screens/sitemap.md: Room Check and the Clear confirmation

### DEC-023 · Settling a check from its card
- **Closes:** OI-078 · **Date:** 2026-11-11
- **Decision:** The card's actions are **Show options** (the AI's alternatives), **Keep it** (accept as is: the check closes, without confirmation), **Undo** (only right after the drop) and **Not right?** (the correction flow).
- **Why:** The owner's call. A single check is a small decision, so no confirmation.
- **Changes:**
  - [x] spec/modules/ai.md: the card

### DEC-024 · Priorities in project settings; corrections use Undo
- **Closes:** OI-079 · **Date:** 2026-11-11
- **Decision:** Changing priorities and activities after onboarding happens in **project settings**, reached from the layout name in the top bar. Corrections are not listed anywhere and are undone with normal Undo.
- **Why:** The owner's call.
- **Changes:**
  - [x] docs/kith-design-documentation.md §2.2 P4, F8: notes
  - [x] spec/modules/canvas.md: project settings
  - [x] spec/screens/sitemap.md: settings row

### DEC-025 · What the AI can and can't do
- **Closes:** OI-021 · **Date:** 2026-11-11
- **Decision:** - **Can** (always as proposals the user applies, DEC-018): move, turn, remove or **add** objects (for example a Suggested item); suggest positions; explain any check; change finishes, including the whole room (DEC-026); answer questions about the room, with numbers when asked (DEC-021).
  - **Can't, and redirects in one line:** size, shape or type go to **Edit Object**; walls and fixed elements go to **Room edit** (DEC-028).
  - **Can't, and just says so:** shopping or finding products, picking a "best" layout, getting round the room's rules.
- **Why:** The owner's call. Every "no" points somewhere (P9).
- **Changes:**
  - [x] docs/kith-design-documentation.md §4.6.7: note
  - [x] spec/modules/ai.md: capability list and refusal lines

### DEC-026 · Whole-room restyle from the user's references, with a finish history per object
- **Closes:** OI-023 · **Date:** 2026-11-11
- **Decision:** - The AI can restyle the whole room. It takes its look from what it pulls out of the user's reference images (colours, materials, styles).
  - The change is a proposal (DEC-018), applied object by object.
  - Each object's finish change is saved in its own **Edit Object**, which keeps a **finish history**, so the user can go back to an earlier finish for that object.
  - What a restyle touches beyond movable objects is OI-082.
- **Why:** The owner's call. References (taste) shape finishes, never rules (DD F1.2).
- **Changes:**
  - [x] docs/kith-design-documentation.md §4.6.7: note
  - [x] docs/kith-design-documentation.md F3: finish history row
  - [x] spec/modules/ai.md and canvas.md (Edit Object)

### DEC-027 · The ten activities
- **Closes:** OI-040 · **Date:** 2026-11-11
- **Decision:** Resting, Working or studying, Gaming, Relaxing, Exercising, Getting ready, Hosting friends, Hobbies, Drying laundry, Keeping plants. Gaming needs a glare-free screen and a plug. Relaxing needs a seat and soft light.
- **Why:** It merges the design doc's list with the newer scenario's needs.
- **Changes:**
  - [x] docs/kith-design-documentation.md F1.1: note
  - [x] the Gaming and Relaxing rules: spec/scenarios/room-rules.md §4 (DEC-069)

### DEC-028 · Room edit, and a Settings button on the canvas
- **Closes:** OI-080 · **Date:** 2026-11-11
- **Decision:** - A **Settings** button sits on the edit canvas. It opens:
    - **Room edit:** the base room, where the user checks and corrects what the scan found (fixed elements such as a plug or window, and detections). It's the same screen as "Here's what we found" during setup.
    - **Preferences:** references, activities and priorities.
  - Room edit corrects; it doesn't rebuild the room. A plug can be moved to where it really is, but not to where the user wishes it were.
  - This refines DEC-024: priorities live under Settings, not under the layout name.
- **Why:** The owner's call. Scan mistakes are fixed where the room is shown whole, at any time, and Room edit gives the AI somewhere to redirect fixed-element requests.
- **Changes:**
  - [x] docs/kith-design-documentation.md F8: note (entry C becomes Room edit)
  - [x] docs/kith-design-documentation.md §8.2: priorities row
  - [x] spec/modules/canvas.md: Settings and Room edit
  - [x] spec/screens/sitemap.md: Settings, Room edit, Preferences

### DEC-029 · Only what the user picked is watched
- **Closes:** OI-081 · **Date:** 2026-11-11
- **Decision:** A soft rule (privacy, daylight, fresh air, open floor, storage, restful sleep, and the activities' zones) runs only if the user picked its priority or activity. Room facts are always watched. Changing preferences in Settings switches rules on or off. This partly reverses D-15.
- **Why:** The owner's call. What the room says maps exactly to what the user told it (H6), and the screen stays quiet (P9).
- **Changes:**
  - [x] docs/kith-open-questions.md D-15: note
  - [x] docs/kith-design-documentation.md §4.6.1, F1.1, §7.4: notes
  - [x] spec/modules/guidance.md

### DEC-030 · A whole-room restyle covers furniture and soft furnishings
- **Closes:** OI-082 · **Date:** 2026-11-11
- **Decision:** Restyle touches movable furniture plus curtains, bedding and rugs. Walls and floor stay out, because Refine is dropped.
- **Why:** Soft furnishings carry most of a room's mood.
- **Changes:**
  - [x] spec/modules/ai.md

### DEC-031 · How the AI shows what it can do: a context chip and 2 or 3 suggestion chips
- **Closes:** OI-024 · **Date:** 2026-11-11
- **Decision:** The pill always shows what it's working on ("Whole room", "Desk", "3 objects"), plus 2 or 3 suggestion chips that change with the selection and any open check. There's no capability list. A refusal is one line with a pointer (DEC-025).
- **Why:** P9, quietly (DEC-011).
- **Changes:**
  - [x] spec/modules/ai.md

### DEC-032 · Show options offers the least-bad options, honestly
- **Closes:** OI-035 · **Date:** 2026-11-11
- **Decision:** Always 2 or 3 options, each with what it costs. When none is clean: "Each of these gives something up." An option may involve another object. Never "best".
- **Why:** The room rarely has a clean spot (ST F3). Saying so honestly is the Negotiate need.
- **Changes:**
  - [x] docs/kith-design-documentation.md §4.6.4: note
  - [x] spec/modules/ai.md (Show options is the AI's)

### DEC-033 · Removed objects go back to Assets
- **Closes:** OI-014 · **Date:** 2026-11-11
- **Decision:** Remove (from the tap menu or the selection bar) takes the object out of the room and back into Assets: "Your room" if it was detected, "Added" if the user added it. It returns by dragging it in, like any asset. No Removed group.
- **Why:** The owner's call.
- **Changes:**
  - [x] docs/kith-design-documentation.md §4.5: note
  - [x] spec/modules/canvas.md

### DEC-034 · Undo and redo cover everything; Discard resets staged changes
- **Closes:** OI-015 · **Date:** 2026-11-11
- **Decision:** Undo and Redo in the top bar cover every action (move, rotate, add, remove, size and finish edits, corrections, Keep it), including after Confirm. **Clear checks** is the one exception, and says so (DEC-022). **Discard changes** returns everything staged to the last confirmed state.
- **Why:** P4. Corrections rely on Undo (DEC-024).
- **Changes:**
  - [x] spec/modules/canvas.md

### DEC-035 · Every preference step can be skipped, with gentle prompts and a default preset
- **Closes:** OI-044 · **Date:** 2026-11-11
- **Decision:** - Every step has Skip.
  - If priorities and activities are skipped, only room facts are watched (DEC-029). A prompt at the top of the canvas (shown for a while, then gone) and a quiet line in Room Check offer "Tell us what matters", which opens Settings → Preferences.
  - Skipping references selects a **default preset**. A pop-up says which one, with "Continue" and "Add references".
- **Why:** The owner's call. P4, and the AI's finishes and Suggested items always have a look to work from.
- **Changes:**
  - [x] docs/kith-design-documentation.md F1.2: note
  - [x] spec/screens/sitemap.md: skip pop-up and canvas prompt
  - [ ] (step 5) which preset is the default

### DEC-036 · Linked pairs move together; Unlink is in the tap menu
- **Closes:** OI-017 · **Date:** 2026-11-11
- **Decision:** Desk and chair, and dressing table and stool, move as pairs, and their space is judged as one. "Unlink" (and "Link") are in the tap menu of a linked object.
- **Why:** The owner's call.
- **Changes:**
  - [x] docs/kith-design-documentation.md F2: note
  - [x] spec/modules/canvas.md

### DEC-037 · Asset groups: Your room · Added · Suggested
- **Closes:** OI-019 · **Date:** 2026-11-11
- **Decision:** Three groups. **Your room** holds detected objects that aren't in the room right now. **Added** holds objects the user brought. **Suggested** holds stand-ins from the references. The Add tile comes first.
- **Why:** The owner's call.
- **Changes:**
  - [x] docs/kith-design-documentation.md §4.5: note
  - [x] spec/modules/canvas.md

### DEC-038 · Objects sit on the floor and walls
- **Closes:** OI-018 · **Date:** 2026-11-11
- **Decision:** Floor and wall objects this round. On top of furniture and the ceiling come later. Detail work such as a desk top belongs to Zone (DEC-003).
- **Why:** It fits the macro and micro split.
- **Changes:**
  - [x] spec/modules/canvas.md

### DEC-039 · Free text can switch rules on, visibly
- **Closes:** OI-025 · **Date:** 2026-11-11
- **Decision:** The AI may switch a rule on from the free-text description or from "Add your own" ("I need it quiet for calls"). **Condition (from P1 and P8, added in chat, owner to object if unwanted):** an inferred rule is always shown as a removable item, in the recap and in Settings → Preferences, worded "From what you wrote".
- **Why:** The owner's call. The condition keeps the user in charge of what is watched.
- **Changes:**
  - [x] docs/kith-design-documentation.md F1.1: note
  - [x] spec/modules/ai.md and guidance.md

### DEC-040 · Several problems: a stack of cards, and a numbered marker
- **Closes:** OI-031 · **Date:** 2026-11-11
- **Decision:** - **The marker.** It shows a number when there is more than one problem. Its tone follows the most serious one: amber for a room fact, neutral for a priority.
  - **With the tap menu open,** the marker becomes a badge on **Ask** ("Ask ③").
  - **The stack.** Tapping opens a stack of cards: the top card in full, the edge of the next showing, "1 of 3", swipe plus ‹ › buttons. Order: room facts first, then priorities by rank.
  - **Settling one.** Each card has its own actions (DEC-023). Keep it removes that card and lowers the count. When the last card goes, the marker disappears.
  - **Re-checking.** Any move or applied option re-checks the stack.
- **Why:** The owner's idea, refined. Each problem gets its own decision without one long card. The badge on Ask ties the card to the AI (DEC-019).
- **Changes:**
  - [x] docs/kith-design-documentation.md §4.6.3a: note
  - [x] spec/modules/ai.md (the card stack) and guidance.md (the marker)

### DEC-041 · Signals while dragging: the design doc's set, one at a time
- **Closes:** OI-032 · **Date:** 2026-11-11
- **Decision:** - **The set:** a plug line (green, amber, red, with solid, dashed or broken line style as the second cue); a floor zone (door swing, wardrobe front, walkway); a window glow; a sightline from the door (only if Privacy was picked).
  - **One signal at a time:** the most serious, room facts first.
- **Why:** The owner's call. It keeps the canvas calm (P9).
- **Changes:**
  - [x] docs/kith-design-documentation.md §4.6.4: note
  - [x] spec/modules/guidance.md

### DEC-042 · A kept check returns only if things really change
- **Closes:** OI-033 · **Date:** 2026-11-11
- **Decision:** Keep it is remembered for that object and that rule. The check returns only if the object moves to a different problem spot, its size is edited, or a correction changes the cause.
- **Why:** P7.
- **Changes:**
  - [x] spec/modules/guidance.md

### DEC-043 · Uncertain checks are hedged and one step quieter
- **Closes:** OI-037 · **Date:** 2026-11-11
- **Decision:** A check that rests on an estimated size or an uncertain detection says "We think…" or "If that's a plug…", and drops one step (a card becomes a marker). There are never percentages or confidence numbers.
- **Why:** P8, and D-Q17.
- **Changes:**
  - [x] spec/modules/guidance.md and ai.md

### DEC-044 · Side effects are mentioned only when clearly worse
- **Closes:** OI-038 · **Date:** 2026-11-11
- **Decision:** A side effect of a move is mentioned only if the move makes it noticeably worse than before, and then as a marker. Room facts and ranked priorities follow the card rule instead (DEC-019).
- **Why:** It keeps the canvas calm.
- **Changes:**
  - [x] spec/modules/guidance.md

### DEC-045 · Words: "check", "Room facts", "Your priorities"
- **Closes:** OI-039 · **Date:** 2026-11-11
- **Decision:** - A problem shown as a card or a marker is a **check**. Never "warning", "error" or "violation".
  - "Room facts" and "Your priorities".
  - Wording states the effect calmly, names the priority behind it, and uses words, not numbers. The design doc's phrasing guide (§8.5) applies, with "check" in place of "heads-up".
- **Why:** It matches the owner's names "Room Check" and "Clear checks".
- **Changes:**
  - [x] docs/kith-design-documentation.md §8.4: note
  - [x] spec/modules: a glossary in guidance.md

### DEC-046 · The priorities step
- **Closes:** OI-041 · **Date:** 2026-11-11
- **Decision:** Six options (Privacy, Natural light, Fresh air, Open floor, Easy storage access, Restful sleep). Pick up to three, in order of importance. Each shows one line of what it will watch. Free text can add more (DEC-039). Only picked ones are watched (DEC-029).
- **Why:** It adopts design doc F1.1.
- **Changes:**
  - [x] spec/screens/sitemap.md: the priorities row

### DEC-047 · The activities step
- **Closes:** OI-042 · **Date:** 2026-11-11
- **Decision:** The ten bubbles (DEC-027), pre-sorted from the scan, dragged or tapped into **Main** (at most three) or **Sometimes**. Continue needs one in Main, or Skip (DEC-035).
- **Why:** It adopts design doc F1.3.
- **Changes:**
  - [x] spec/screens/sitemap.md: the activities row

### DEC-048 · The recap is warm, not watchful
- **Closes:** OI-043 · **Date:** 2026-11-11
- **Decision:** When processing finishes, a short recap tells the user what will be **kept in mind while they shape their room**: their priorities in order, and what the room is mostly for. Anything taken from their own words is phrased as theirs ("You mentioned calls"). Rules: welcoming, about the user's room rather than about the user, never "we know", "we noticed", "we picked up" or "we'll watch you". The draft wording goes to the owner in step 5.
- **Why:** The owner's concern: the old wording sounded invasive.
- **Changes:**
  - [x] docs/kith-design-documentation.md F1.2: note
  - [ ] (step 5) the recap wording, for the owner to approve

### DEC-049 · The top-bar layout
- **Closes:** OI-083 · **Date:** 2026-11-11
- **Decision:** Left: Back · layout name ▾. Right: Room Check · [Undo Redo] as one pill · [Preview Settings] as one pill. Confirm floats just below the bar, only while something is staged.
- **Why:** Seven controls have to fit a phone row.
- **Changes:**
  - [x] spec/modules/canvas.md §1

### DEC-050 · The tap menu: Edit · Rotate · Remove · Ask (· Unlink)
- **Closes:** OI-084 · **Date:** 2026-11-11
- **Decision:** The tap menu holds Edit, Rotate, Remove and Ask (with the check badge), plus Unlink on linked pairs. **Not right?** is a link inside Edit Object, not in the menu.
- **Why:** The owner's call. A shorter menu.
- **Changes:**
  - [x] spec/modules/canvas.md §3, §8
  - [x] spec/screens/sitemap.md: ED-02, EO-01, RE-02

### DEC-051 · Switching layouts with staged changes asks first
- **Closes:** OI-085 · **Date:** 2026-11-11
- **Decision:** One question: "Confirm or discard your changes first?", with Confirm, Discard and Cancel.
- **Why:** Nothing is lost silently (P4).
- **Changes:**
  - [x] spec/modules/canvas.md §10
  - [x] spec/screens/sitemap.md: LY-01

### DEC-052 · Objects in a restyle can be unticked before Apply
- **Closes:** OI-087 · **Date:** 2026-11-11
- **Decision:** Each object changed by a restyle proposal shows a tick on the canvas, all on by default. Apply stages only the ticked ones.
- **Why:** The user stays in charge of each object (P1).
- **Changes:**
  - [x] spec/modules/ai.md §6

### DEC-053 · An added object appears held in the middle of the view
- **Closes:** OI-086 · **Date:** 2026-11-11
- **Decision:** After Edit Object's Done, the new object appears as a held box in the middle of the current view, with "Drag to place". It's also saved in Assets → Added.
- **Why:** It goes straight from adding to placing.
- **Changes:**
  - [x] spec/modules/canvas.md §7
  - [x] spec/screens/sitemap.md: EO-01

### DEC-054 · Edit Object details
- **Closes:** OI-061 · **Date:** 2026-11-11
- **Decision:** Number fields with − and +, the detected value beside each, proportions locked by default, limits per type that stop the field, Reset to detected, "Needs power" in a collapsed advanced section, and no measuring tools.
- **Why:** It adopts OQ A-2 to A-5, A-8 and C-3.
- **Changes:**
  - [x] spec/modules/canvas.md §8

### DEC-055 · A project is always left with nothing staged, so it always reopens clean
- **Closes:** OI-064 · **Date:** 2026-11-11
- **Decision:** Back to Home with staged changes asks "Confirm or discard your changes first?", with Confirm, Discard and Cancel. It's the same question as switching layouts (ED-09). Reopening a project shows its last layout as last confirmed, with kept checks and corrections intact.
- **Why:** The owner's call. It is simpler than restoring an unconfirmed state.
- **Changes:**
  - [x] spec/modules/canvas.md §13
  - [x] spec/screens/sitemap.md: ED-09 added, ED-01 and LY-01 linked
  - [ ] (step 4) the flows: the app closing unexpectedly with changes staged

### DEC-056 · Step 2 Locked; the room's specific rules move to step 3
- **Closes:** none (process) · **Date:** 2026-11-11
- **Decision:** canvas.md, ai.md and guidance.md are Locked with the owner's approval. guidance.md keeps the mechanism. The specific rules for Aarav's room (each rule's test and wording, the Gaming and Relaxing rules, and rules that can never clear) go into a room-rules file in step 3, where OI-036 and OI-057 are answered. The sitemap stays Draft until step 5.
- **Why:** A Locked file can't carry open markers, and the rules depend on the scenario.
- **Changes:**
  - [x] spec/modules/*.md: Locked
  - [x] docs/kith-design-documentation.md §4 to §4.6 and docs/kith-scenarios-and-flows.md §7: Superseded banners
  - [x] spec/source-map.md: roles updated
  - [x] spec/scenarios/room-rules.md

### DEC-057 · Scenarios are about how the room will look and feel; size accuracy is a safety net
- **Closes:** none (owner direction on the candidates) · **Date:** 2026-11-11
- **Decision:** Kith's main job is letting people **see and feel a change before doing it**, which saves the manual effort of trying it for real. Scenarios are driven by that, not by "will it fit". Correcting a size is a safety net for estimates, not a headline beat. Every scenario shows the whole room coming together, including the user's actual life (his work setup), and uses Preview to step back and look.
- **Why:** The owner's direction on candidates A and B.
- **Changes:**
  - [x] spec/scenarios: rewrite A and B
  - [x] spec/00-aim.md one-line summary: amended by DEC-068

### DEC-058 · Three scenarios: A main, B second pass, C layouts
- **Closes:** OI-051, OI-056 · **Date:** 2026-11-11
- **Decision:** - **A (Aarav)** is the main story.
  - **B (Mira)** is a second pass with a clear problem (OI-100). No mother and no print-order angles.
  - **C (Aarav, later)** duplicates his layout and changes things on top of it. Layout versions appear **only** in C.
  - One of A or B starts by **clearing the room** (DEC-063).
- **Why:** The owner's call.
- **Changes:**
  - [x] spec/scenarios

### DEC-059 · Aarav: back in his hometown, in a compact room
- **Closes:** OI-052 · **Date:** 2026-11-11
- **Decision:** Aarav, 27, has moved back to his hometown for a remote job and lives in this compact room. Nothing about his parents or whose room it is.
- **Why:** The owner's call. He's an adult, so the room is plainly his.
- **Changes:**
  - [x] docs/kith-design-documentation.md §1.2: note
  - [x] spec/scenarios

### DEC-060 · The objects that can be added: yoga mat, lounge chair, framed print
- **Closes:** OI-054 · **Date:** 2026-11-11
- **Decision:** - **Yoga mat:** gallery photo, *Estimated from photo*.
  - **Lounge chair:** product link, *From product page*.
  - **Framed print:** photo, a wall object.
  - Camera resolves to the same set.
- **Why:** Three objects, three behaviours.
- **Changes:**
  - [x] spec/scenarios
  - [ ] (step 4) the add flow

### DEC-061 · Two kinds of detection mistake: wrong labels on fixed elements, and merged objects
- **Closes:** OI-055 · **Date:** 2026-11-11
- **Decision:** - **Wrong labels.** A fixed element can have a wrong label (a socket read as a light switch). In Room edit the user can **change a label or add one** to fixed elements (window, door, light switch, socket).
  - **Merged objects.** Two objects can be detected as one. The user **splits** them in the edit options. This reverses OQ H-7 ("split later").
  - **The pile of boxes** is clutter the user removes, not a mistake.
  - Which two objects are merged in the story is OI-099.
- **Why:** The owner's call.
- **Changes:**
  - [x] docs/kith-design-documentation.md F8: note
  - [x] spec/modules/canvas.md amendment: Split in Edit Object, labels in Room edit
  - [ ] (step 4) the correction flow (OI-060)

### DEC-062 · A scenario may start from its own arrangement of the furniture
- **Closes:** none (owner direction) · **Date:** 2026-11-11
- **Decision:** The movable furniture's starting positions may be set per scenario. A cluttered start, or a cleared one, is fine. The fixed elements and the room's size stay as recorded (D-28, DEC-012).
- **Why:** The owner's direction. The story should fit the room, not the other way round.
- **Changes:**
  - [x] docs/kith-open-questions.md D-28: note
  - [x] spec/scenarios: each scenario states its starting plan

### DEC-063 · Clear the room
- **Closes:** none (owner direction; placement is OI-101) · **Date:** 2026-11-11
- **Decision:** "Clear the room" moves every movable object out of the room and into Assets → Your room, leaving an empty canvas. The fixed elements stay. It's undoable. It's offered in a **⋯ (more options)** menu on the editor's top bar, and as a **pill** when the user lands in the editor.
- **Why:** The owner's direction. Some people want a blank start.
- **Changes:**
  - [x] spec/modules/canvas.md amendment and the sitemap (DEC-067)

### DEC-064 · Every scenario step has a floor plan
- **Closes:** none (owner direction) · **Date:** 2026-11-11
- **Decision:** Each act of each scenario has a top-down floor plan beside it, on the stress test's 0.2 m grid, so the room can be seen coming together and fixes can be checked for realism. Turning the desk to face the window for privacy is dropped, because it traps the chair against the wall.
- **Why:** The owner's direction.
- **Changes:**
  - [x] spec/scenarios

### DEC-065 · Mira's problem: she works and sleeps in one room and never switches off
- **Closes:** OI-100 · **Date:** 2026-11-11
- **Decision:** Mira, a freelance illustrator, works and sleeps in the same small room and can't switch off. She clears the room and rebuilds it to see whether it can feel like two places, a bright work corner and a calm sleep side, before moving anything. Scenario B starts with Clear the room.
- **Why:** The owner's call.
- **Changes:**
  - [x] spec/scenarios/B-mira.md

### DEC-066 · The merged pair is the side cabinet and the dressing table
- **Closes:** OI-099 · **Date:** 2026-11-11
- **Decision:** The scan reads the side cabinet and the dressing table, side by side on the east wall, as one "storage unit". The user splits them in Edit Object.
- **Why:** The owner's call. Scenario A needs the cabinet to move alone.
- **Changes:**
  - [x] spec/modules/canvas.md §8 (Split row)
  - [x] spec/scenarios/A-aarav.md

### DEC-067 · The ⋯ menu replaces Settings; when the Clear the room pill shows
- **Closes:** OI-101 · **Date:** 2026-11-11
- **Decision:** ⋯ (More options) replaces Settings in the top bar and holds Clear the room, Room edit and Preferences. The "Clear the room" pill shows when the user lands in a layout that has never been edited, and disappears on the first change.
- **Why:** The owner's call.
- **Changes:**
  - [x] spec/modules/canvas.md §1, §11, §14 (amendment note at the top)
  - [x] spec/screens/sitemap.md: SE-01, ED-01

### DEC-068 · The aim leads with how the room will look and feel
- **Closes:** OI-102 · **Date:** 2026-11-11
- **Decision:** The one-line aim now reads: "let people see how their room could look and feel before they move a thing, understand what each choice gives and takes, and leave knowing what to do."
- **Why:** DEC-057.
- **Changes:**
  - [x] spec/00-aim.md §1 (amended)

### DEC-069 · The room's rules
- **Closes:** OI-057 · **Date:** 2026-11-11
- **Decision:** Adopt [room-rules.md](scenarios/room-rules.md):
  - Plug access is a 15 cm zone around the socket (R1).
  - The mat patch is the mat's size plus a margin on its long sides, and may share the chair's pull-out space (R4).
  - Flat things don't block walkways (R5).
  - The Gaming and Relaxing rules (R9).
  - **Main** activities get a card, like ranked priorities. **Sometimes** activities get a marker.
  - The facing-based privacy idea (R3) is dropped.
- **Why:** The scenarios rely on these, and they work in this room (ST).
- **Changes:**
  - [x] spec/scenarios/room-rules.md: markers removed
  - [x] spec/scenarios/A-aarav.md, B-mira.md: open items cleared

### DEC-070 · No check in this room is permanently on
- **Closes:** OI-036 · **Date:** 2026-11-11
- **Decision:** Privacy clears when something at least 1.5 m tall stands in the line from the door. The bed under the AC clears by turning the bed. Neither runs unless picked (DEC-029).
- **Why:** A signal that never clears carries no information (ST F9).
- **Changes:**
  - [x] spec/scenarios/room-rules.md §3

### DEC-071 · Scenario C has no preference change
- **Closes:** none (the owner, on OI-103) · **Date:** 2026-11-11
- **Decision:** In C, Aarav doesn't change his preferences. He asks the AI for blackout curtains himself. Whether a preference change brings back kept checks (OI-103) is settled as a step 4 edge case.
- **Why:** The owner's call.
- **Changes:**
  - [x] spec/scenarios/C-aarav-weekend.md: act 1 step 3 removed, act 2 rewritten
  - [x] spec/open-items.md OI-103: moved to step 4

### DEC-072 · The AI runs on a local model; the rules stay in code
- **Closes:** none (the owner, 2026-11-12) · **Date:** 2026-11-12
- **Decision:** The AI is no longer only a script. A small model on the device (qwen3.5:4b through Ollama) decides what is presented: whether a check is a card or a marker and in what order, how it is worded, which options are shown, and what a chat message becomes. The room's measurements and every rule stay in code, and the model is given them as data. Consequences are stated from the rules, never by the model. The model can only propose; Apply is still the person's tap (DEC-018). When the model is off, slow or invalid, the scripted behaviour applies. This amends DEC-001 for the AI: the scan and the room are still prepared, the answers are not.
- **Why:** The owner's call: "we are introducing intelligence through this AI model". A fact of the room stays a card on drop (DEC-019) whatever the model says, so the Locked guidance levels still hold as the floor.
- **Changes:**
  - [x] spec/modules/ai.md: amendment note, and the prototype note rewritten
  - [x] PROTOTYPE.md: "The local model"

### DEC-073 · Undo is on every card that follows a change
- **Closes:** none (the owner, 2026-11-12) · **Date:** 2026-11-12
- **Decision:** A check card offers **Undo** whenever the object it is about has a change that isn't confirmed yet, not only right after the drop. Right after the drop it undoes that action. Opened later, it puts that object (and its linked partner) back to how it was last confirmed. A "Before you started" card still has no Undo, because nothing was changed (DEC-022). The Undo button in the top bar is unchanged. This amends DEC-023.
- **Why:** The owner's call: with a high-priority check on screen, the three ways out (other options, keep it, undo) are always together.
- **Changes:**
  - [x] spec/modules/ai.md §5: the Actions row

### DEC-074 · A proposal with several objects has vertical tabs, and the view follows
- **Closes:** OI-115 · **Date:** 2026-11-13
- **Decision:** When a request brings in several objects at once (for example "add the side cabinet, the dressing table and the laundry hamper"), the AI shows each object in its proposed spot as a ghost. The proposal card shows **vertical tabs**, one per object, that the user can tap. Tapping a tab turns the view to that object's proposed spot. It works the other way too: when the user pans the view to look around, the tab of the object that is mainly in view becomes the active one. **Apply** and **Not now** work on the whole proposal, with a tick per object as for a restyle (DEC-052). The owner also asked that the prototype be treated as the working tool: the build already shows one proposal at a time and has no tabs, so the tabs are new work.
- **Why:** The owner's call: look around the proposed room, not just read a list.
- **Changes:**
  - [x] spec/modules/ai.md: amendment note, and §1 (Proposals)
  - [x] spec/screens/sitemap.md: AI-03 states
