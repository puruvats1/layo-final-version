# Scenario B: "Two places in one room" (second pass)

**Status:** In review · **Depends on:** [room-rules.md](room-rules.md), [A-aarav.md](A-aarav.md) · **Open items:** none

**Floor plans:** drawn to scale in [floor-plans.html](floor-plans.html) (published at https://claude.ai/artifact/FJ2TF3pTWAgyHx9mPweowb). The text grids below are the same plans on a 0.2 m grid; the legend is in [room-rules.md §1](room-rules.md).

## The story

**Mira, 31,** is a freelance illustrator. She lives and works in this same compact room. Her desk is a step from her bed, so the last thing she sees at night is the drawing she didn't finish. She works late, sleeps lightly, and never quite switches off.

**What she wants from Kith:** to see whether this one room can feel like **two places**, a bright corner for work and a calm side for sleep, before she moves a thing. She'd rather start from nothing than nudge the old layout.

**What she picks.**
- She skips references.
- Activities, Main: Working, Resting. Sometimes: Getting ready.
- Priorities: Restful sleep, Natural light.
- In the description she writes: "I work late and sleep lightly."

**Why a second pass.** The same room and the same desk spot get different guidance for a different person (H6). This pass also reaches what A doesn't: skipping steps, a rule taken from her own words, "Before you started", Clear the room, a wrong label fixed in Room edit, a refusal that points somewhere, an AI answer with a number, a wall object, and Clear checks.

---

## B0. The room as it is (start plan S0), with "Before you started"

```
 0  WWWWWW|||||a.....
 1  WWWWWW........KKK
 2  ............ccKKK
 3  ............ccKKK
 4  ............ccKKK
 5  ..............KKK
 6  .................
 7  BBBBBBBB.......tt
 8  BBBBBBBB.......tt
 9  BBBBBBBB.......MM
10  BBBBBBBB.....s.MM
11  BBBBBBBB.....s.MM
12  BBBBBBBB.......MM
13  BBBBBBBB.........
14  BBBBBBBB...xxx.hh
15  BBBBBBFF...xxx.hh      the pillow end is here, under the AC
16  BBBBBBFFb........
    =11111==b==22222=
```

## Act 1. Setup, the light way

| # | Mira | The app | Screens | Feature |
|---|---|---|---|---|
| 1 | Scans. Skips references | A pop-up: "We've picked *Soft Neutral* to start. Continue, or add your own references" | CP-01, PR-01, PR-02 | Skip and the default preset (DEC-035) |
| 2 | Puts Working and Resting in Main and Getting ready in Sometimes. Picks Restful sleep, then Natural light. Writes "I work late and sleep lightly" | The recap includes, phrased as hers: "You mentioned working late: we'll keep your desk out of sight from your bed." It can be removed | PR-03, PR-04, PR-05 | A rule from her words (DEC-039) |
| 3 | **Here's what we found:** splits the storage unit, as in A. Skips the second item, "Is this a light switch?" | | RE-01 | The skipped uncertain item comes back in act 5 |

## Act 2. Start from nothing

| # | Mira | The app | Screens | Feature |
|---|---|---|---|---|
| 4 | Lands in the room. **Room Check** shows "1": *Before you started: the AC blows straight at your pillow* | | ED-01, RC-01 | "Before you started" (DEC-022) |
| 5 | Taps the **Clear the room** pill | Every movable object goes to Assets → Your room. An empty floor. Undo is available | ED-01 | Clear the room (DEC-063) |

```
B1. The room cleared
 0  WWWWWW|||||a.....
 1  WWWWWW...........
 2  .................
 3  .................
 4  .................
 5  .................
 6  .................
 7  .................
 8  .................
 9  .................
10  .................
11  .................
12  .................
13  .................
14  .................
15  .................
16  ........b........
    =11111==b==22222=
```

## Act 3. The sleep side first

| # | Mira | The app | Screens | Feature |
|---|---|---|---|---|
| 6 | Drags the bed out of Assets onto the west wall | Card: "The AC would blow straight at your pillow. You chose Restful sleep." | AS-01, ED-03, AI-02 | A ranked-priority card |
| 7 | **Show options** → *Turn the bed so your head is at the other end.* She does it herself: **Rotate**, then a drag, 180° | The pillow end moves north, away from the AC, and the card clears. The wardrobe front stays clear | ED-02, ED-05 | Rotation, used realistically |
| 8 | Adds the framed print from a photo onto the wall above the bed | It snaps to the west wall | AS-03, EO-01, ED-03 | A wall object (DEC-038) |

```
B2. The bed against the west wall, head to the north
 0  WWWWWW|||||a.....
 1  WWWWWW...........
 2  .................      the wardrobe front, kept clear
 3  .................
 4  .................
 5  PPPPPPPP.........      the pillow end, more than 2 m from the AC
 6  BBBBBBBB.........
 7  BBBBBBBB.........
 8  BBBBBBBB.........      the print hangs on the west wall here
 9  BBBBBBBB.........
10  BBBBBBBB.........
11  BBBBBBBB.........
12  BBBBBBBB.........
13  BBBBBBBB.........
14  BBBBBBBB.........
15  .................      window 1 kept clear
16  ........b........
    =11111==b==22222=
```

## Act 4. Where does work go?

| # | Mira | The app | Screens | Feature |
|---|---|---|---|---|
| 9 | Drags the desk and chair to window 2, for the daylight she draws by | **Card**, from her own words: "From your pillow, you'd see your desk. You mentioned working late." Unlike Aarav, she gets this card for the same desk spot | ED-03, AI-02 | Personal guidance (H6) |
| 10 | **Show options** | *1 A tall screen between the bed and the desk: it makes the way to the bed tight.* *2 The desk in the corner by the door: out of sight from your pillow, but far from daylight.* *3 Keep it here.* "Each of these gives something up." | AI-04 | Honest options |
| 11 | Tries 1 (a folding screen from Suggested, a proposal, Apply) | A room-fact card: "This leaves a tight squeeze to the bed." She taps **Undo** | AI-03, AI-02 | Undo |
| 12 | Picks 2. The desk goes to the corner by the door, out of her line of sight | **"1 of 2":** "The nearest free plug is a long way off" (a room fact, first: the thing by the door is labelled a light switch) and "Your desk would be far from daylight. You chose Natural light." On the daylight card she thinks: sleep matters more. **Keep it.** The plug card she leaves open; it becomes a marker on the desk | AI-04, AI-02 | Her own trade-off (G3); a stack |

```
B3a. Tried: the desk at window 2 (the * line is the view from her pillow)
 5  PPPPPPPP.........
 6  BBBBBBBB*........
 7  BBBBBBBB.*.......
 8  BBBBBBBB..*......
 9  BBBBBBBB...*.....
10  BBBBBBBB....*....
11  BBBBBBBB...ccc...      in view from the bed
12  BBBBBBBB...ccc...
13  BBBBBBBB..KKKKK..
14  BBBBBBBB..KKKKK..
15  ..........KKKKK..
16  ........b........
    =11111==b==22222=

B3b. Chosen: the desk in the corner by the door, behind her pillow line
 0  WWWWWW|||||a.....
 1  WWWWWW........KKK
 2  ............ccKKK      out of sight from the bed
 3  ............ccKKK
 4  ............ccKKK
 5  PPPPPPPP......KKK
 6  BBBBBBBB.........
    (rows 7 to 14: the bed as in B2)
15  .................
16  ........b........
```

## Act 5. Light for late nights, and a wrong label

| # | Mira | The app | Screens | Feature |
|---|---|---|---|---|
| 13 | Asks the AI to add a floor lamp by the desk | Proposal, Apply. But the plug line runs all the way to plug B and goes red. "The nearest free plug is a long way off" | AI-03, AI-02 | |
| 14 | "Can you move the socket by the door closer?" | "I can't move a socket, but if we got it wrong, you can fix it in Room edit." With a link | AI-01 | A refusal that points somewhere (DEC-025) |
| 15 | Room edit shows the thing by the door labelled *light switch*. She knows it's a socket. **Change label → Socket** | Back in the room, the desk's and the lamp's lines both jump to plug A and turn green. Both plug checks clear | RE-01, RE-02 | A wrong label fixed (DEC-061) |
| 16 | Wants to check her A2 drawing board fits. Asks "How wide is my desk?" | "About 105 cm, from the scan. You can change it in Edit Object." It fits | AI-01 | A number when asked (DEC-021) |

## Act 6. The rest of the room, and finishing

| # | Mira | The app | Screens | Feature |
|---|---|---|---|---|
| 17 | Brings the dressing table and stool back to the east wall, and the hamper to the corner by window 2. Leaves the side cabinet, the boxes and the fan in Assets | A marker on the stool (Getting ready, Sometimes): a little tight | AS-02, ED-03 | Assets back into the room |
| 18 | **Room Check** shows 2 open markers. She's fine with both. **Clear checks** → "This clears every check. You can't bring them back." → Clear | | RC-01, RC-02 | Clear checks (DEC-022) |
| 19 | **Preview.** From the bed, the room is calm, and the work corner is behind her | | ED-08 | Look and feel |
| 20 | **Confirm** → the result → **What to move**: 1 Take out the boxes, the fan and the side cabinet. 2 Turn the bed so the head is at the wardrobe end. 3 Move the dressing table up the east wall… | | ED-06, ED-07, FN-01 | |

```
B4. Final: a work corner by the door, the sleep side to the west
 0  WWWWWW|||||al....      lamp (l) on plug A, now labelled a socket
 1  WWWWWW........KKK
 2  ............ccKKK
 3  ............ccKKK
 4  ............ccKKK
 5  PPPPPPPP......KKK
 6  BBBBBBBB.........
 7  BBBBBBBB.........
 8  BBBBBBBB.........      the print on the west wall
 9  BBBBBBBB.........
10  BBBBBBBB.......MM      the dressing table and stool, by the light
11  BBBBBBBB......sMM
12  BBBBBBBB......sMM
13  BBBBBBBB.......MM
14  BBBBBBBB.......hh
15  ...............hh
16  ........b........
    =11111==b==22222=
```

**The ending.** From her pillow she sees the window, not her work. She knows what that cost her (less daylight at the desk) and chose it.
