# Module: guidance (the room's checks)

**Status:** Locked · **Depends on:** [00-aim.md](../00-aim.md), [decisions.md](../decisions.md), [ai.md](ai.md) · **Open items:** none (the room's rules are in step 3)

Guidance decides **what the room watches, and when it says something**. How a check speaks (the card, Show options) belongs to the AI ([ai.md §5](ai.md)), because the card is the AI's voice (DEC-019).

**Serves:** G3 (informed decisions), G2 · **Themes:** Negotiate, Evaluate · **Screens:** ED-03 (signals), markers on ED-01, AI-02, RC-01, RC-02, ED-06 in the [sitemap](../screens/sitemap.md)

---

## 1. What is watched

| Kind | Watched when | Examples in this room | Decision |
|---|---|---|---|
| **Physical limits** | Always, silently | Through a wall, the window sill, the wardrobe or the AC; overlapping another solid object (except a rug under furniture, or a chair tucked into its desk) | D-31, DEC-020 |
| **Room facts** | Always | The door's swing, a sealed entrance, the wardrobe front, a plug the object needs being out of reach or hidden, a window blocked, the walkway | DD §7.4 H-3 to H-10 |
| **Your priorities** | **Only if picked** (DEC-029) | Privacy, Natural light, Fresh air, Open floor, Easy storage access, Restful sleep | DD F1.1, DEC-046 |
| **Your activities** | **Only if picked**, at high priority for Main and low for Sometimes | Each activity protects a zone: Exercising needs a clear patch, Working or studying needs a desk with daylight and a plug, Gaming needs a glare-free screen and a plug, Relaxing needs a seat and soft light | DEC-027, DEC-047 |
| **From your words** | Only if inferred and shown to the user | "I take calls here" switches on the privacy sightline | DEC-039 |

**Order when several apply:** room facts, then ranked priorities by rank, then Main activities, then Sometimes activities (DD F1.3).

**This module defines the mechanism.** The specific rules for Aarav's room are written in step 3, in the scenario's room-rules file. That covers each rule's test and wording, the Gaming and Relaxing rules (OI-057), and how to handle rules that can never clear in this room (OI-036). Those rules must fit the mechanism here. If one doesn't, it's raised as an open item against this Locked file.

## 2. How loud it is

| Level | When | What the user sees | Decision |
|---|---|---|---|
| **Silent** | Physical limits | The object slides to the nearest valid spot. Nothing is said | DEC-020 |
| **Card on drop** | Room facts, and ranked priorities | A check card appears (AI-02) | DEC-019 |
| **Marker** | Everything else that's open: Sometimes activities, side effects that are clearly worse, anything uncertain | A small marker on the moved object. A number when there's more than one. Amber if a room fact is involved, neutral otherwise. Tapping it opens the card | DEC-019, DEC-040, DEC-044 |
| **Confirm review** | Whatever is still open at Confirm | One sheet with "Confirm anyway" | DD F6 |

**Adjustments:**
- **Uncertain data** (an estimated size, an uncertain detection): one step quieter, and hedged wording (DEC-043).
- **Side effects:** mentioned only if the move makes them clearly worse than before (DEC-044).
- **The starting layout:** never a card. Its problems appear only in Room Check, tagged "Before you started" (DEC-022, D-Q13).
- **Kept checks:** return only if the situation really changes (a different problem spot, a size edit, a correction) (DEC-042).

## 3. Signals while dragging (ED-03)

**One signal at a time**, the most serious first (DEC-041). Each signal appears only when relevant to the dragged object, and only within its attention radius (DD T-17).

| Relationship | Signal | Second cue (not colour) | Example |
|---|---|---|---|
| Needs to reach something | A line from the object to the nearest usable plug. The plug turns green, amber or red | The line goes solid, dashed or broken | The desk and plug B |
| Must stay clear | A soft shape on the floor, turning amber when overlapped | The outline changes from solid to hatched | The door swing, the wardrobe front, the walkway |
| Window | The frame glows when reachable and dims when blocked | An open or closed glyph | A tall object in front of window 2 |
| Line of sight (only if Privacy was picked) | A soft ray from the door | The eye glyph is struck through when interrupted | The desk in view from the door |

No numbers, ever (D-06).

## 4. Markers

- **Where.** A marker sits on the object the user placed. If two movable objects clash, it sits on the one just moved (D-36).
- **What it shows.** A count when there's more than one check, and one tone (DEC-040).
- **With the tap menu open,** the marker becomes a badge on **Ask** (DEC-040).
- **When it goes.** It disappears by itself when the problem is solved (for example, moving the fan frees the plug), on Keep it, or on Clear checks.

## 5. Room Check (RC-01, RC-02)

| Part | Behaviour | Decision |
|---|---|---|
| The button | In the top bar, with a count only when checks are open | DEC-022 |
| The list | Every open check, grouped by object. "Before you started" items are tagged. If no preferences were given, one quiet line: "Tell us what matters" (opens Preferences) | DEC-022, DEC-035 |
| An item | Turns the view to the object and opens its card | DEC-022 |
| Clear checks | A confirmation: "This clears every check. You can't bring them back." On confirm, all markers go and the list is empty. It can't be undone | DEC-022, DEC-034 |
| Empty | No count. "Nothing to check" | DEC-022 |
| Not here | Kept checks (they can't be restored), priorities (they're in Settings), corrections (they use Undo) | DEC-022, DEC-024 |

## 6. Words (DEC-045)

| Use | Don't use |
|---|---|
| **Check** (a card or a marker), Room Check, Clear checks | Warning, error, violation, invalid |
| **Room facts** · **Your priorities** | Hard and soft constraints (internal terms only) |
| The effect, calmly: "This would block the door's swing." | A verdict: "Bad placement." |
| The priority by name: "You chose Privacy." | "Privacy issue detected." |
| Words for distance: "a long way from a plug", "a tight walkway" | Numbers |
| An offer: Show options · Keep it · Undo | An instruction: "Please move the desk." |

## 7. Out

| Out | Why |
|---|---|
| Watching qualities the user didn't pick | DEC-029 |
| Restoring a kept or cleared check | DEC-022 |
| Telling the user why a spot is blocked | DEC-020 |
| More than one signal at a time | DEC-041 |
| A gate that stops Confirm | P1. "Confirm anyway" is always there |
