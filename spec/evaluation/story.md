# The test story: "Ready for Saturday"

**Status:** Draft · **Depends on:** [plan.md](plan.md), [story-floor-plans.md](story-floor-plans.md), [scenarios/room-rules.md](../scenarios/room-rules.md), [modules/canvas.md](../modules/canvas.md), [modules/ai.md](../modules/ai.md) · **Open items:** OI-113, OI-114, OI-115, OI-116, OI-117

The story a participant follows in Part B of the [evaluation plan](plan.md). Rewritten on 2026-11-13 around the owner's own drawing of the final room and their three parts: **(1)** clear the room and place the two most important things, **(2)** ask the AI for the rest, **(3)** add the finishing pieces. It replaces the four goals in plan.md §5.3 once approved. The floor plan for every step is in [story-floor-plans.md](story-floor-plans.md).

**The rule for every AI moment:** Aarav never makes a move a sensible person wouldn't. The AI speaks only about something the picture of the room doesn't show.

**Names.** The story uses the prototype's names: Study desk, Desk chair, Side cabinet (your "side table"), Laundry hamper (your "storage laundry"), Jute rug (your "carpet"). "Window 1" is the window under the AC.

## Who, and why tonight

Aarav, 27, has moved back to his hometown for a remote job. His room is compact and still set up the way it was years ago: the desk is jammed in the corner by the door, boxes and a fan sit where they landed, and his bed stands against the wall with the windows.

It's Thursday night. His brother can help him move furniture on Saturday, and that's his one chance to shift the heavy pieces. He wants to walk into Saturday with a plan.

**What he tells the app** `[ASSUMED OI-114]`
- Main: Working or studying, Resting, Exercising. Sometimes: Getting ready, Keeping plants.
- What matters most, in order: Natural light, Open floor, Fresh air.
- Why these tags: Natural light is the desk under window 1 (Part 1). Open floor is the middle of the room, kept free for the rug and later the yoga mat (Parts 3 and 5). Fresh air is the windows kept free: the shelf and the fan in Part 3 both touch window 1. Exercising is Main so that the mat in Part 5 has a reason to be there [ASSUMED OI-114]. Restful sleep was dropped: nothing in this story puts the bed near the AC.

**The final room** is the owner's drawing, in [story-floor-plans.md](story-floor-plans.md) plan 8.

---

## Part 0. "That's a socket, not a light switch"

*Screens: RE-01, RE-02.*

| What Aarav is thinking | What he does | What the screen shows |
|---|---|---|
| "Let's see if it got my room right." | Finishes the scan and his preferences and reaches **Here's what we found** | His room in 3D, everything in place. One thing on the wall between the windows is highlighted: "We think this is a light switch" |
| "No, that's where I plug in my laptop." | Taps it. **Change label → Plug** | The label changes. A small plug sign appears |
| | **Done** | The room opens in the editor |

## Part 1. A clean start: the bed and the desk

*Screens: ED-01, SE-01, AI-01, AI-03, ED-02, ED-05, AS-01.*

| What Aarav is thinking | What he does | What the screen shows |
|---|---|---|
| "I can't think with all this in the way. I'd rather start from the empty room." | Taps **⋯ → Clear the room** (or the "Clear the room?" prompt, if it has appeared) | Every piece of furniture goes into Assets. Only the door, wardrobe, windows, AC, plugs and an empty floor are left. A toast: "Room cleared. Everything is in Assets." with Undo |
| "Bed and desk first. Everything else works around them." | Opens the AI and types: **"Suggest places for the bed and the study desk."** | A short wait, then two faint copies in the room and a card: **Layo proposes · Spots for the bed and the study desk.** Row 1 **Bed: Against the east wall.** Row 2 **Study desk: Under window 2.** In the chat: *"Here are spots for the bed and the study desk. Look around, and tap a row to see each one. You can drag any of them, or take one out."* |
| "East wall, away from the windows. Fine." | Taps row 1 | The view turns to the bed's copy. Row 1 is lit |
| "I wanted the window with the morning sun, the one under the AC." | Taps row 2, then holds the desk's copy and drags it under window 1 | The view turns to the desk. As he drags, the window frame glows and a green line runs to the plug between the windows, the one he fixed in Part 0. Row 2 now reads *Under window 1* |
| "Good." | Taps **Apply 2** | Both copies become boxes in the room. No card |
| "The chair isn't with the desk." | **Assets** → taps the desk chair, then holds and drags it beside the desk | The chair arrives in front of him as a box, and he drags it to the desk. The two are a pair: the desk's menu shows **Unlink** |
| "My head shouldn't be under the window. I want it by the door." | Taps the bed. A small menu opens on it: Edit · Rotate · Remove. Taps **Rotate**, slides his finger sideways, then **Done** | The bed turns end to end and clicks square to the wall [ASSUMED OI-117] |

**What the app gave him:** the AI did the first placing, and he made it his: he moved one copy to the window he wanted, and added the chair the AI hadn't. The AI never said why it chose a spot [OPEN OI-119].

## Part 2. "Put the rest back for me"

*Screens: AI-01, AI-03, ED-01.*

| What Aarav is thinking | What he does | What the screen shows |
|---|---|---|
| "The rest is just where things go. I'll let it suggest." | Types: **"Suggest places for the laundry basket, dressing table and side table."** | Three faint copies and a card: **Layo proposes · Spots for the laundry hamper, the dressing table and the side cabinet.** Row 1 **Laundry hamper: Under window 2.** Row 2 **Dressing table: In the corner by the door.** Row 3 **Side cabinet: Against the east wall.** Each row has a small − to take it out. The button reads **Apply 3** |
| "Let me see each one." | Taps row 1 | The view turns to the hamper's copy under window 2. Row 1 is lit |
| "That's right. Next." | Drags the view round with his finger until the dressing table's copy is the main thing on screen | Row 2 lights up by itself |
| "I want it on the west wall, clear of the wardrobe doors." | Holds the dressing table's copy and drags it to the west wall | The copy moves. Row 2 now reads *Against the west wall* |
| "The cabinet next to the socket, between the windows." | Taps row 3, then holds its copy and drags it between the windows | Row 3 now reads *Between the windows* |
| "Good." | Taps **Apply 3** | The three copies become boxes in the room. No cards |

**What the app gave him:** he could look around the whole proposal, and the rows and the view follow each other both ways (DEC-074). The prototype's answers are wording from the build, not from the story [OPEN OI-119].

## Part 3. Making it his

*Screens: AS-03, AS-04, AS-05, EO-01, ED-03, ED-02, AI-02, AS-02.*

| What Aarav is thinking | What he does | What the screen shows |
|---|---|---|
| "A rug in the middle would make it feel like a room." | **Assets → Add → Product link**, and pastes a jute rug he's been looking at | Edit Object: "Jute rug · From product page" `[OPEN OI-117]`. **Done** |
| | Drags it to the middle | It lies flat under everything. No card: it's flat, and the middle stays open |
| "The chair sits right against the desk. I'd like to pull it out." | Taps the chair → **Unlink**. Slides it a step onto the rug's edge. Taps it again → **Link** | The pair separates, then joins again. They'll still travel together |
| "I want a shelf up on the wall, in that gap beside window 1." | **Assets → Add → Gallery**, and picks a photo of a wall shelf | Edit Object: "Wall shelf · Estimated from photo · 60 cm wide" `[OPEN OI-116]`. **Done**. The shelf appears held mid-view, "Drag to place" |
| | Drags it to the wall, in the gap by the AC window | It hangs on the wall. A card: **"This would cover part of window 1."** |
| "The gap is smaller than it looked. I measured it: about 40 cm." | Taps the shelf → **Edit** → width **40** → **Done** | The source reads "You edited". The card clears |
| "A plant. I said I keep plants." | **Assets → Suggested** → drags the plant to the west wall, between the corner and the dressing table | It clicks to the wall. No card |
| "It's hot at night. The pedestal fan was always in that corner." | **Assets → Your room** → drags the pedestal fan into the corner by window 1 | A card: **"This would block window 1."** |
| "And a lamp for the evenings. It's the same corner." | **Suggested** → drags the floor lamp to the same corner | A card: **"This overlaps the pedestal fan."** |
| "I can't have both. I've got the AC and the ceiling fan. The fan goes." | Taps the fan → **Remove** | The fan goes to Assets, with an Undo for a few seconds. Both cards clear by themselves |
| "Lamp, then." | Drags the lamp into the corner | A green line runs from the lamp to the plug between the windows. The window frame stays lit |

**What the app gave him:** the window card was something he couldn't see until the shelf was on the wall. The two cards on the fan were about the window and the lamp, and the removing was his own decision. The green line from the lamp only works because he fixed the plug's label in Part 0.

## Part 4. Is this the room? And Saturday

*Screens: ED-08, RC-01, ED-06, ED-07, FN-01.*

| What Aarav is thinking | What he does | What the screen shows |
|---|---|---|
| "Let me just look at it." | Taps **Preview** and turns the view: from the door, from the desk, from the bed | The buttons disappear. Only the room is left |
| "Is it all fine?" | Taps **Preview** again, then **Room Check** | "Nothing to check" |
| "Done." | Taps **Confirm** | "Nothing open." He taps Confirm, and every box becomes the real piece of furniture |
| "So what do we carry, and in what order?" | Taps **What to move** | A numbered list, below |
| "The bed and the desk swap sides. That's what I need him for." | Taps **Share** and sends it to his brother | The list goes out as a message |

**What to move** (built from what he changed `[OPEN OI-117]`):
1. Take the boxes, the pedestal fan and the stool out of the room.
2. Move the side cabinet between the windows, and the laundry hamper under window 2.
3. Slide the desk, its chair and the dressing table into the middle for now. This clears the east wall.
4. Move the bed against the east wall, head by the door.
5. Move the desk and chair under window 1, and the dressing table against the west wall.
6. Put the rug in the middle, with the chair at its edge. Bring in the plant (west wall) and the floor lamp (corner by window 1). Hang the shelf above the lamp.

**How it ends.** He knows what the room will look like, why the bed moved, and what to carry first.

---

## Part 5. A yoga version of the room

*Screens: LY-01, ED-01, ED-02, AS-02, ED-03, AI-02, ED-06, ED-07, FN-01.*

Aarav comes back to the project a few days later. He has started exercising again and wants a version of the room for it, without losing the one he made. This is the second layout in the project, started from the final one (DEC-009).

| What Aarav is thinking | What he does | What the screen shows |
|---|---|---|
| "I want to keep the room as it is, and try a yoga version." | Taps the layout name → **Duplicate**, and names it "Yoga" | A copy of the final room, open in the editor |
| "The rug is for everyday. A mat on top of it would slide." | Taps the rug → **Remove** | The rug goes to Assets, with an Undo for a few seconds. The middle of the floor is bare |
| "Now the mat." | **Assets → Suggested** → the yoga mat, dragged to the middle | It lies flat. A card: **"There's no clear space for your mat here. You chose Open floor."** The chair, which he pulled out in Part 3, is in the way of the mat |
| "I didn't think of the chair. I pulled it out for the desk, but it sits on the mat's end." | Holds the chair and slides it back under the desk. The desk comes with it, because they are linked, so he **Unlink**s them first | The card clears by itself |
| "Good." | Taps **Confirm**, then **What to move** | A short list from the original room to the Yoga layout: the rug stays out, and the mat is rolled out in the middle |

**What the app gave him:** the chair was a small thing he had moved earlier for another reason. The card caught it for the new use of the floor.

## What the story covers

| Asked for | Where |
|---|---|
| Fix a wrongly identified part of the room, at the start | Part 0 |
| Clear the room before starting | Part 1 |
| Move an object | Parts 1, 2, 3 (dragging a proposed copy, then a placed object) |
| Rotate an object | Part 1 (the bed) |
| Add from Assets | Parts 1, 3 (the chair from Your room, then the plant and lamp from Suggested) |
| Add an object and adjust its size | Part 3 (the shelf, 60 to 40 cm) |
| Link objects | Parts 1, 3 (the desk and chair arrive as a pair; Unlink, then Link) |
| Remove a single object | Part 3 (the fan, after the two cards) |
| Another layout from the final one | Part 5 (a yoga layout: no rug, the mat in) |
| The AI proposes and the user looks around | Part 2 |
| The AI helps with what they hadn't seen | Parts 3 (the shelf and fan cards), 5 (the chair on the mat) |
| Reach the room they want, step by step | Parts 1 to 3 |
| Leave with the move list | Part 4 |

## How it serves the aim

| From [00-aim.md](../00-aim.md) | In the story |
|---|---|
| "See how their room could look and feel before they move a thing" | The empty room (Part 1); looking round each proposal (Part 2); Preview (Part 4) |
| "Understand what each choice gives and takes" | The shelf covering part of window 1, and the fan and lamp wanting the same corner (Part 3) |
| "Leave knowing what to do" | The move list, with its "slide to the middle for now" step (Part 4) |
| G1, easy to explore | Everything is one drag; Clear the room and Undo make trying free |
| G3, informed decisions | Each card names its reason and leaves the choice to him |
| G4, personal | The cards name what he chose: Open floor (Part 5). The tags come from his own picks |
| P1, agency | He places everything. The AI's only change is the three-piece proposal, and it waits for his Apply |
| P9, quiet | No card in Parts 0, 2 or 4, and only two in the whole story |

## What the prototype can't do yet

See [story-check.md](story-check.md): the story was walked through in the running prototype on 2026-11-13, and every gap is listed there.
