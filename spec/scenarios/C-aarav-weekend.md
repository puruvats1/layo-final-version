# Scenario C: "A weekend version" (layouts)

**Status:** In review · **Depends on:** [A-aarav.md](A-aarav.md), [room-rules.md](room-rules.md) · **Open items:** none

**Floor plans:** drawn to scale in [floor-plans.html](floor-plans.html) (published at https://claude.ai/artifact/FJ2TF3pTWAgyHx9mPweowb). The text grids below are the same plans on a 0.2 m grid; the legend is in [room-rules.md §1](room-rules.md).

## The story

**A month after A.** The room is set up the way Aarav planned on Thursday. He has since joined a gym, so the mat mostly stays rolled up. On weekends a friend comes over to game. He wants a **weekend version** of the room without losing the weekday one.

**Goals:** G5 (the room changes with him), G1, G3.

---

## C0. "My room", as confirmed in A (plan A6)

```
 0  WWWWWW|||||alLLLL
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

## Act 1. A copy to play with

| # | Aarav | The app | Screens | Feature |
|---|---|---|---|---|
| 1 | Opens the project. It opens clean, on "My room" | | HM-01, ED-01 | Reopening (DEC-055) |
| 2 | Layout name ▾ → **Duplicate** → names it "Weekend" | | LY-01 | Layouts (DEC-009) |

## Act 2. Make it a weekend room

| # | Aarav | The app | Screens | Feature |
|---|---|---|---|---|
| 4 | Taps the mat → **Remove** | It goes to Assets → Added. The floor in the middle is open | ED-02 | |
| 5 | Games in the afternoon on weekends, with the sun right behind his screen. Selects the curtains and asks the AI: "Make these block the light" | **Proposal:** the curtains' finish becomes a heavy blackout fabric, previewed. **Apply** | AI-01, AI-03 | A soft-furnishing finish, asked for directly (DEC-030) |
| 6 | Twists the lounge chair to face the desk, so his friend can watch | It snaps to the room's planes with a tick | ED-03 | Rotation |

```
C2. "Weekend": mat rolled away, lounge chair turned toward the desk
 0  WWWWWW|||||alLLLL      L now faces south, toward the desk
 1  WWWWWW.......LLLL
 2  .............LLLL
 3  .............LLLL
 4  .................      open floor in the middle
 5  .................
 6  .................
 7  BBBBBBBB.........
 8  BBBBBBBB.........
 9  BBBBBBBB.......MM
10  BBBBBBBB......ssM
11  BBBBBBBB...ccc.MM
12  BBBBBBBB...ccc.MM
13  BBBBBBBB..KKKKK..      blackout curtains on window 2
14  BBBBBBBB..KKKKKhh
15  BBBBBBBB..KKKKKhh
16  BBBBBBBBb........
    =11111==b==22222=
```

## Act 3. Switching between them

| # | Aarav | The app | Screens | Feature |
|---|---|---|---|---|
| 7 | Wants to look at "My room" again. Layout name ▾ → My room | "Confirm or discard your changes first?" **Confirm** | LY-01, ED-09, ED-07 | Switching with staged changes (DEC-051) |
| 8 | Back in "Weekend", opens **What to move** | Going from My room to Weekend: 1 Roll up the mat. 2 Turn the lounge chair toward the desk. 3 Draw the blackout curtains | FN-01 | The move list, between layouts |

**The ending.** Two versions of one room. Switching between them on a Friday is three small moves, not a rebuild.
