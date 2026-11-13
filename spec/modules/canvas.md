# Module: the edit canvas

**Status:** Locked · **Depends on:** [00-aim.md](../00-aim.md), [decisions.md](../decisions.md) · **Open items:** none

> Amended 2026-11-11 by DEC-061, DEC-066 and DEC-067: the ⋯ menu replaces Settings and holds Clear the room; merged objects can be split in Edit Object; Room edit can change or add labels on fixed elements.

The canvas is where all editing happens. The user works directly on the room: tap, hold, drag, twist. The bottom bar brings things in (the AI, Assets), and the top bar holds what applies to the whole room (DEC-013).

**Serves:** G1 (explore), G2 (less trial and error), G5 (layouts) · **Themes:** Imagine, Evaluate · **Screens:** ED-*, AS-*, EO-01, SE-*, RE-*, LY-01, FN-* in the [sitemap](../screens/sitemap.md)

---

## 1. The frame

What is on screen when nothing is happening (ED-01). The canvas is the 3D model of Aarav's room, and the user looks around by dragging on empty space (DEC-001).

| Zone | Contents | Decision |
|---|---|---|
| **Top left** | Back to Home · layout name ▾ (opens Layouts, LY-01) | DEC-013, DEC-009 |
| **Top right** | Room Check (a count when checks are open) · Undo · Redo · Preview (hides the interface) · ⋯ More options | DEC-013, DEC-022, DEC-034, DEC-067 |
| **Floating, top right, under the bar** | **Confirm** with the number of staged changes. Shown only while something is staged | DEC-013, DEC-049 |
| **Bottom left** | **AI \| Assets** toggle | DEC-013 |
| **Bottom right** | The pill. In AI: the input, a context chip and 2 or 3 suggestion chips. In Assets: one row of assets. A grab handle expands it | DEC-013, DEC-031 |
| **Just above the bottom bar** | Check cards (owned by the AI module), the selection bar, a proposal's Apply / Not now | DEC-019, DEC-015, DEC-018 |

**Top-bar layout (DEC-049, amended by DEC-067).**
- **Left:** Back · layout name ▾.
- **Right:** Room Check · [Undo Redo] as one pill · [Preview ⋯] as one pill.
- **⋯ (More options)** replaces Settings. It holds **Clear the room** · **Room edit** · **Preferences**.
- **Confirm** floats just below the bar, only while something is staged.

**Clear the room (DEC-063, DEC-067).**
- It moves every movable object into Assets → Your room, leaving the fixed elements and an empty floor. It's undoable.
- It's offered in ⋯, and as a **pill** ("Clear the room") when the user lands in a layout that has never been edited. The pill disappears on the first change.

## 2. Gestures

| Gesture | On | Result | Decision |
|---|---|---|---|
| **Drag** | Empty space | Look around | DD F2 |
| **Tap** | An object | Shows its name and the tap menu (ED-02). With something already selected, it adds the object to the selection instead | DEC-014, DEC-015 |
| **Hold, then release** without moving | An object | Selects it (ED-04) | DEC-015 |
| **Hold, then drag** | An object | Lifts it: the 3D model becomes a bounding box and the floor shows through. The box snaps flush to walls, scales with distance, and pans the view at the screen edge. A linked partner moves with it | DEC-015, DD F2, DEC-036 |
| **Two-finger twist** | A lifted or selected object | Rotates it about its vertical axis. It snaps to angles parallel to the walls at a low threshold, with a haptic tick | DEC-016 |
| **Tap** | Empty space | Clears the selection, closes the tap menu | DEC-015 |
| **Drag** | From the Assets row or grid into the room | Places the object as a lifted box | DEC-013, DEC-037 |

**Release.** A released object is **staged**: it stays a box until Confirm (D-04, D-27). The checks run on release (see [guidance.md](guidance.md)). If the spot is physically impossible, the object slides to the nearest valid spot, with no message (DEC-020).

**First use (P9, quietly).** On the first visit, a one-time hint shows near an object ("Hold to pick it up"). It appears again only if the user hasn't held anything after a pause (DD W15). It never comes back once an object has been lifted.

## 3. The tap menu (ED-02)

A small menu beside the tapped object. Its header shows the object's name and origin badge ("Study desk · From your room"). It only ever shows actions that are possible for this object, so what's on offer is itself the explanation (P9).

| Action | Shown when | Goes to | Decision |
|---|---|---|---|
| **Edit** | Always | Edit Object (EO-01) | DEC-014 |
| **Rotate** | Always | The rotation state (ED-05) | DEC-016 |
| **Remove** | Always | Back to Assets (DEC-033). An Undo toast appears | DEC-014, DEC-033 |
| **Ask** | Always | The AI, with this object as context. Carries the check badge ("Ask ③") when the object has open checks | DEC-040 |
| **Unlink / Link** | Linked pairs only | Splits or rejoins the pair | DEC-036 |

The list is settled by DEC-050. **Not right?** is not in the menu; it's a link inside Edit Object (§8).

## 4. Selecting several objects (ED-04)

- **Start:** hold one object and release it. While it's selected, tapping more objects adds them (DEC-015).
- **The selection bar,** above the bottom bar: "3 selected · Ask AI · Remove · ✕". The AI's context chip shows "3 objects".
- **Never moved together.** Several objects are not dragged as a group.
- **End:** tap empty space, or ✕.

## 5. Rotation state (ED-05)

- **Entry:** Rotate in the tap menu.
- **While rotating:** the object becomes a box, and dragging a finger horizontally anywhere on screen turns it about its vertical axis. It snaps to wall-parallel angles with a haptic tick.
- **Exit:** a Done chip, or tapping elsewhere. The rotated object is staged.
- **The twist (§2)** does the same without entering the state.

## 6. Objects

| Topic | Rule | Decision |
|---|---|---|
| Origins | **From your room** (detected), **Added** (photo or link), **Suggested** (stand-ins from references). Shown as a badge | DD §4.2, DEC-037 |
| Where they sit | Floor and walls only | DEC-038 |
| States | In the room as a 3D model → selected → lifted (a box) → staged (a box) → back to a model at Confirm. Also: in Assets (not in the room), and proposed (an AI ghost, until Apply) | DD §4.3, DEC-018 |
| Fixed elements | Door, windows, wardrobe, plugs, AC, ceiling fan, tube light. They can't be moved. They're corrected only in Room edit | D-28, DEC-028 |

## 7. Assets (the Assets side of the pill: AS-01, AS-02)

- **Collapsed:** one row. The **Add** tile comes first, then the items of the active group.
- **Expanded (grab handle):** a grid, with group tabs **Your room · Added · Suggested** (DEC-037).
  - **Your room:** detected objects that aren't in the room right now (removed ones, DEC-033).
  - **Added:** objects the user brought.
  - **Suggested:** stand-ins taken from the references. With no references, they come from the default preset (DEC-035).
- **Use:** drag an item into the room. It arrives lifted, as a box.
- **Add flow:** Add → the source sheet (Camera · Gallery · Product link, AS-03) → the prepared object (DEC-001) → **Edit Object opens** to confirm the type and check the size (DEC-017) → Done → the object appears held as a box in the middle of the view, with the hint "Drag to place". It's also saved in Added (DEC-053).

## 8. Edit Object (EO-01)

The same view for every object (D-11), including added ones (DEC-010). It's the **only** place sizes appear as numbers, apart from a direct answer from the AI (DEC-021).

| Section | Content | Decision |
|---|---|---|
| Identity | Name, origin badge, **type** ("What is this?"), which must be confirmed for an added object | DD F3, DEC-017 |
| Split | Only when the scan read two things as one, such as the side cabinet and dressing table. **"It's two things"** splits it into its parts, each its own object | DEC-061, DEC-066 |
| Size | Width, depth and height as number fields with − and +, the detected value beside each, and a **source chip** (From your room · From product page · Estimated from photo · You edited). Proportions are locked by default. Limits per type stop the field. Reset to detected. No measuring tools | D-01 to D-06, DEC-010, DEC-054 |
| Finish | "Change with AI" chips and a short prompt, finish only | A-7, DEC-026 |
| Finish history | Earlier finishes of this object, including any set by a whole-room restyle. Tap one to go back to it | DEC-026 |
| Needs | Needs power, and the linked partner, in a collapsed advanced section | DD F3 |
| Actions | **Done** (stages the change and returns) · **Cancel** · **Not right?**, a small link that opens the Fix sheet (RE-02) when the object isn't what the scan says | DD F3, DEC-050 |

## 9. Staging, Confirm and after

| Step | What happens | Decision |
|---|---|---|
| Staged | Every moved, rotated, added, resized or restyled object is staged as a box. Confirm shows the count | D-04, DEC-013 |
| Confirm review (ED-06) | One sheet listing the open checks, each tappable (opens its card). Buttons: **Confirm** (or **Confirm anyway** when checks are open) · **Discard changes** | DD F6, DEC-034 |
| Result (ED-07) | Every box becomes a 3D model. The canvas stays live. Two follow-ups are offered: **What to move** (FN-01) and **Save layout** (FN-02) | D-27, DEC-005, DEC-004 |
| Undo and Redo | Cover every action, including after Confirm. The one exception is Clear checks, which says so | DEC-034, DEC-022 |

## 10. Layouts (LY-01) and the move list (FN-01)

- **Layout name ▾** opens Layouts (DEC-009):
  - the project's layouts, each of which can be opened
  - **Save layout** (names the current confirmed room)
  - **Duplicate**
  - **New from the original room**
  - **What to move** for the current layout
- **Switching layouts with staged changes** asks once: "Confirm or discard your changes first?", with Confirm, Discard and Cancel (DEC-051).
- **What to move (DEC-005):** a short ordered list of real-world moves, from the original room to this layout. The order comes from the rules: clear a spot before something moves into it, and free a plug before the object that needs it arrives. It can be shared.
- **Comparing layouts** is out (D-29, DEC-004).

## 11. Settings, Room edit and Preferences

| Screen | Content | Decision |
|---|---|---|
| ⋯ More options (SE-01) | Clear the room · Room edit · Preferences | DEC-028, DEC-067 |
| Room edit (RE-01) | The base room. During setup it opens as "Here's what we found", with only the few uncertain items highlighted. Later, every detected element can be tapped. The Fix sheet (RE-02), which can also **change or add a label** on a fixed element (window, door, light switch, socket), and "Mark something we missed" (RE-03). It corrects; it doesn't rebuild | DEC-028, DD F8, DEC-061 |
| Preferences (SE-02) | References, activities, priorities, editable as in setup. Rules inferred from the user's words appear as removable items | DEC-024, DEC-039 |

## 12. Preview (ED-08) and the Zone tile

- **Preview** hides every control except the toggle that brings them back. It's for looking at the room (DEC-013).
- **The Zone tile on Home** does nothing yet (DEC-008).

## 13. Coming back to a project

- **Leaving.** A project is always left with nothing staged. Back to Home with staged changes asks once, "Confirm or discard your changes first?", with Confirm, Discard and Cancel. It's the same question as switching layouts (ED-09, DEC-055, DEC-051).
- **Reopening.** A project therefore always reopens clean: its last layout as last confirmed, with kept checks and corrections intact.

## 14. What the canvas offers, and what it doesn't

| Capability | Status | How | Goals |
|---|---|---|---|
| Look around | In | Drag on empty space | G1 |
| Move an object | In | Hold and drag | G1, G2 |
| Turn an object | In | Two-finger twist, or Rotate | G1, G3 |
| Select several | In | Hold-release, then tap more | G1 |
| Remove, and bring back | In | Tap menu or selection bar; drag back from Assets | G1, G4 |
| Add an object | In | Assets → Add, or the AI (as a proposal) | G1, G4 |
| Correct a size | In | Edit Object | G2, G3 |
| Change a finish | In | Edit Object, or the AI | G4 |
| Restyle the whole room | **Only through the AI** | Ask the AI (DEC-026, DEC-030) | G4 |
| Get alternative positions | **Only through the AI** | Show options on a card, or ask | G3 |
| Correct the scan (labels, merged objects) | In | ⋯ → Room edit, or Not right? in Edit Object | G2, G3 |
| Clear the room | In | ⋯, or the pill on landing | G1 |
| Confirm, see the result | In | Confirm | G2, G3 |
| Save, reopen, duplicate a layout | In | Layout name ▾ | G5 |
| Take the plan into the real room | In | What to move | G2 |
| Undo anything | In | Undo and Redo | P4 |
| Resize handles or 3D gizmos | **Out** | P3, D-03. The rotation state is a drag, not a handle | |
| Numbers on the canvas | **Out** | D-06. Only in Edit Object, or when asked | |
| Drag several objects together | **Out** | DEC-015 | |
| On top of furniture, on the ceiling | **Out** | DEC-038. Detail work is Zone | |
| Move or change walls, doors, windows, built-ins | **Out** | Scope (00-aim §5). Correct them only, in Room edit | |
| Compare layouts | **Out** | D-29, DEC-004 | |
| Wall or floor colour | **Out** | DEC-002, DEC-030 | |
