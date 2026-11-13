# Scenario A: "See it before Saturday" (main)

**Status:** In review · **Depends on:** [room-rules.md](room-rules.md), [modules/](../modules/canvas.md), [sitemap](../screens/sitemap.md) · **Open items:** none

**Floor plans:** drawn to scale in [floor-plans.html](floor-plans.html) (published at https://claude.ai/artifact/FJ2TF3pTWAgyHx9mPweowb). The text grids below are the same plans on a 0.2 m grid; the legend is in [room-rules.md §1](room-rules.md).

## The story

**Aarav, 27,** has moved back to his hometown for a remote job. He lives in a compact room he hasn't touched since: the desk is jammed in the corner by the door, the boxes are still where they landed, and he works on his laptop from the bed. He games in the evenings, wants to start doing yoga again, and would love a corner to sit back in. He wants the room warm and a bit playful, not minimal.

**Why now.** His brother can help him move furniture on Saturday afternoon, and that's the only time he'll get help with the solid-wood desk. It's Thursday night. He has a picture in his head (the desk by the window, a mat in the middle, a comfy chair somewhere), but he can't tell how it would actually look and feel, and he doesn't want to spend Saturday shoving furniture around to find out.

**What he wants from Kith:** to see the room the way it could be, try his ideas against the real room, and go into Saturday with a plan he likes.

**What he picks.**
- Activities, Main: Working, Exercising, Relaxing. Gaming goes to Sometimes when the cap bounces it.
- Priorities: Natural light, Open floor, Fresh air.
- References: two warm-wood boards and a playful rug pin.

**Goals:** G1, G2, G3, G4. G5 is in scenario C.

---

## A0. The room as it is (start plan S0)

```
 0  WWWWWW|||||a.....
 1  WWWWWW........KKK      The desk and chair are jammed by the door.
 2  ............ccKKK
 3  ............ccKKK
 4  ............ccKKK
 5  ..............KKK
 6  .................
 7  BBBBBBBB.......tt      side cabinet (t), dressing table (M) and
 8  BBBBBBBB.......tt      stool (s) on the east wall
 9  BBBBBBBB.......MM
10  BBBBBBBB.....s.MM
11  BBBBBBBB.....s.MM
12  BBBBBBBB.......MM
13  BBBBBBBB.........
14  BBBBBBBB...xxx.hh      boxes (x) in front of window 2, hamper (h)
15  BBBBBBFF...xxx.hh      pedestal fan (F) in front of plug B
16  BBBBBBFFb........
    =11111==b==22222=
```

## Act 1. Capture (Thursday, 9 pm)

| # | Aarav | The app | Screens | Feature |
|---|---|---|---|---|
| 1 | Opens Kith and taps **Scan my room**. Turns slowly in the middle of the room | A simulated sweep | HM-01, CP-01 | Capture |
| 2 | While the room builds, names it "My room", adds two warm-wood presets and pastes a Pinterest link | Stacked reference cards | CP-02, PR-01 | References (G4) |
| 3 | Drags Working, Exercising and Relaxing into **Main**, then tries Gaming. It bounces: "Main is for the few things this room is mostly for." He puts Gaming in Sometimes | | PR-03 | The cap of three |
| 4 | Picks Natural light, Open floor, Fresh air, in that order | Each shows its line ("We'll keep daylight at your desk in mind") | PR-04 | Ranked priorities |
| 5 | Reads the recap: a warm line about keeping daylight, floor space and fresh air in mind as he shapes his room | | PR-05 | Recap (DEC-048) |
| 6 | **Here's what we found** highlights one thing: "We think this is one storage unit." He knows it's two pieces. **Not right?** → "It's two things" | The unit splits into the side cabinet and the dressing table | RE-01, RE-02 | A merged detection, split (DEC-061, DEC-066) |

```
A1. Here's what we found: the merged unit (U)
 7  BBBBBBBB.......UU
 8  BBBBBBBB.......UU      ← the cabinet and the dressing table, read as one
 9  BBBBBBBB.......UU
10  BBBBBBBB.....s.UU
11  BBBBBBBB.....s.UU
12  BBBBBBBB.......UU      (other rows as A0)
```

## Act 2. Look around, clear the clutter

| # | Aarav | The app | Screens | Feature |
|---|---|---|---|---|
| 7 | Lands in the room. A "Clear the room" pill is offered; he ignores it, because he wants to work with what he has. A hint near the bed: "Hold to pick it up" | | ED-01 | First view (DEC-067) |
| 8 | Taps the boxes. The name and the menu appear. **Remove** | The boxes go to Assets → Your room. An Undo toast | ED-02 | Remove (DEC-033) |
| 9 | Taps **Preview** to see the room without controls. Already roomier | | ED-08 | Preview |

```
A2. The boxes are gone
13  BBBBBBBB.........
14  BBBBBBBB.......hh      the space in front of window 2 is free
15  BBBBBBFF.......hh
16  BBBBBBFFb........      (rows 0 to 12 as A0)
    =11111==b==22222=
```

## Act 3. The desk by the window

| # | Aarav | The app | Screens | Feature |
|---|---|---|---|---|
| 10 | Holds the desk and drags it toward window 2, twisting it with two fingers so it runs along the wall. The chair travels with it | A box, snapping parallel to the wall with a tick. The window frame glows. **One signal at a time:** the plug line runs to plug A by the door and turns red, and plug B is ringed | ED-03 | Hold and drag, twist, linked pair, signals (DEC-016, DEC-041) |
| 11 | Lets go. The desk stops just short of the wall (the sill) and slightly left of the frame (the hamper), with nothing said | **Card:** "The plug between the windows is behind the fan. The nearest free one is by the door." A quiet marker also appears: *Gaming (Sometimes): afternoon light would sit behind your screen* | AI-02 | A room-fact card, a Sometimes marker, a silent block (DEC-019, DEC-020) |
| 12 | Holds the fan and drags it to the empty corner by the door | The desk's plug line jumps to plug B and turns green, and the card closes by itself. The fan's line reaches plug A, green | ED-03 | Cause and effect across two objects |
| 13 | Tucks the stool under the dressing table so the chair has room | Allowed pair | ED-03 | |

```
A3. The desk under window 2; the fan in the corner by the door
 0  WWWWWW|||||a.....
 1  WWWWWW.........FF      the fan, now next to plug A
 2  ...............FF
 3  .................
 4  .................
 5  .................
 6  .................
 7  BBBBBBBB.......tt
 8  BBBBBBBB.......tt
 9  BBBBBBBB.......MM
10  BBBBBBBB......ssM      the stool tucked under the dressing table
11  BBBBBBBB...ccc.MM
12  BBBBBBBB...ccc.MM
13  BBBBBBBB..KKKKK..      the desk faces window 2; plug B is free
14  BBBBBBBB..KKKKKhh
15  BBBBBBBB..KKKKKhh
16  BBBBBBBBb........
    =11111==b==22222=
```

## Act 4. How does it feel? His work day

| # | Aarav | The app | Screens | Feature |
|---|---|---|---|---|
| 14 | Turns on **Preview** and turns the view to sit "at" the desk. Daylight on the desk, the window ahead | | ED-08 | Look and feel (DEC-057) |
| 15 | Asks the AI: "What will people see behind me on calls?" | "The wardrobe and the end of your bed." He's fine with that | AI-01 | Explain, about his work |

The plan is unchanged from A3.

## Act 5. Room for yoga

| # | Aarav | The app | Screens | Feature |
|---|---|---|---|---|
| 16 | **Assets → Add → Gallery**, and picks his yoga mat photo | Edit Object opens: "Yoga mat · Estimated from photo". The length looks short; he types 180 cm. **Done** | AS-03, AS-04, EO-01 | Add from a photo; size correction as the safety net (DEC-010, DEC-017) |
| 17 | The mat appears held mid-view. He drags it across the middle and lets go | It slides off the side cabinet (a silent block) and ends up half in the door's swing. **A stack of two cards, "1 of 2":** "This would be in the door's way." and "There's no clear space for your mat here. You chose Open floor." | ED-03, AI-02 | Card stack (DEC-040) |
| 18 | **Show options** | Three ghosts, each with what it costs: *1 Let the side cabinet go: the mat fits across the middle.* *2 Desk back in its old corner: the mat fits by the window, but the desk loses its daylight.* *3 Mat along the foot of the bed: a tight squeeze past it.* "Each of these gives something up." | AI-04 | Least-bad options (DEC-032) |
| 19 | Thinks about the old reference books in the cabinet, and decides they can live in the wardrobe. Taps the cabinet → **Remove**. That only works because he split it in act 1 | The cabinet goes to Assets → Your room. The stack re-checks and clears. The mat's floor zone turns solid | ED-02 | Remove, re-check |

```
A5. The mat across the middle; the side cabinet gone
 0  WWWWWW|||||a.....
 1  WWWWWW.........FF
 2  ...............FF
 3  .................
 4  ........mmmmmmmmm      the mat, 1.8 × 1.0 m with its margin
 5  ........mmmmmmmmm
 6  ........mmmmmmmmm
 7  BBBBBBBBmmmmmmmmm
 8  BBBBBBBBmmmmmmmmm
 9  BBBBBBBB.......MM
10  BBBBBBBB......ssM
11  BBBBBBBB...ccc.MM
12  BBBBBBBB...ccc.MM
13  BBBBBBBB..KKKKK..
14  BBBBBBBB..KKKKKhh
15  BBBBBBBB..KKKKKhh
16  BBBBBBBBb........
    =11111==b==22222=
```

## Act 6. A corner to sit back in

| # | Aarav | The app | Screens | Feature |
|---|---|---|---|---|
| 20 | **Assets → Add → Product link**, and pastes a lounge chair he's been eyeing | Edit Object: "Lounge chair · From product page". **Done** | AS-05, EO-01 | Add from a link |
| 21 | Drags it to the corner by the door. The fan is there, so the chair slides onto the mat's edge | **"1 of 2":** "This would sit on your exercise space." and "There's no soft light by your chair." (Relaxing, Main) | ED-03, AI-02 | Stack |
| 22 | Asks the AI: "Do I even need the pedestal fan?" | "You have the AC and the ceiling fan, and window 2 is clear for fresh air." | AI-01 | Explain |
| 23 | "Remove the fan." | **Proposal:** the fan ghosted out, with **Apply · Not now**. He taps Apply | AI-03 | AI proposal (DEC-018) |
| 24 | Back on the chair's card, **Show options** → "In the corner by the door". Apply | The chair settles in the corner and the first card clears. One remains: no soft light | AI-04 | |
| 25 | On that card, the AI chip: "Add a floor lamp beside it" | **Proposal:** a floor lamp from Suggested, next to plug A. Apply. Green line, and the card clears | AI-03 | The AI adds (DEC-025) |

```
A6. The lounge chair and lamp in the corner; the fan gone
 0  WWWWWW|||||alLLLL      lamp (l) on plug A; lounge chair (L)
 1  WWWWWW.......LLLL
 2  .............LLLL
 3  .............LLLL
 4  ........mmmmmmmmm
 5  ........mmmmmmmmm
 6  ........mmmmmmmmm
 7  BBBBBBBBmmmmmmmmm
 8  BBBBBBBBmmmmmmmmm
 9  BBBBBBBB.......MM
10  BBBBBBBB......ssM
11  BBBBBBBB...ccc.MM
12  BBBBBBBB...ccc.MM
13  BBBBBBBB..KKKKK..
14  BBBBBBBB..KKKKKhh
15  BBBBBBBB..KKKKKhh
16  BBBBBBBBb........
    =11111==b==22222=
```

## Act 7. Make it his

| # | Aarav | The app | Screens | Feature |
|---|---|---|---|---|
| 26 | The AI chip: "Restyle like my references" | **Proposal:** warm oak and terracotta across the desk, chair, bed frame, lounge chair, lamp, curtains and bedding. Each has a tick | AI-03 | Whole-room restyle (DEC-026, DEC-030) |
| 27 | Unticks the bedding (his grandmother's bedspread stays). **Apply** | The finishes preview on the models | AI-03 | Ticks (DEC-052) |
| 28 | **Preview.** He walks the view around the room. It feels like his | | ED-08 | Look and feel |
| 29 | The desk looks too dark. Taps it → **Edit** → **Finish history** → back to the original teak | | ED-02, EO-01 | Finish history |

The plan is unchanged from A6. Only finishes change.

## Act 8. Confirm, and the plan for Saturday

| # | Aarav | The app | Screens | Feature |
|---|---|---|---|---|
| 30 | **Room Check** shows "1". It's the Gaming marker. He taps it; the view turns to the desk and the card opens. **Keep it**: he games in the evening | The count goes | RC-01, AI-02 | Room Check, Keep it |
| 31 | **Confirm** | "Nothing open." **Confirm** | ED-06 | |
| 32 | Every box becomes a 3D model in its new finish. He looks around | | ED-07 | Result |
| 33 | **What to move** | 1 Clear out the boxes. 2 Take out the pedestal fan and the side cabinet. 3 Move the desk and chair under window 2, and tuck the stool under the dressing table. 4 Unroll the mat across the middle. 5 Bring in the lounge chair and a floor lamp for the corner by the door. He shares it with his brother | FN-01 | Move list (DEC-005) |

The final plan is A6.

**The ending.** He goes into Saturday knowing what the room will look like, why each piece goes where it does, and what to carry first.

## What this scenario doesn't reach

These go to the flows (step 4):
- selecting several objects
- Discard
- Undo across Confirm
- the AI asking one clarifying question
- Mark something we missed
- skipping steps (scenario B)
- saving and switching layouts (scenario C)
