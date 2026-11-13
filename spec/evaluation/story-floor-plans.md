# Floor plans for the test story

**Status:** Draft · **Depends on:** [story.md](story.md), [scenarios/room-rules.md](../scenarios/room-rules.md) · **Open items:** OI-115, OI-116, OI-117

One plan for each point in [the story](story.md) where the room changes. They follow the owner's drawing of the final room (2026-11-13), so they are **turned a quarter turn from the earlier plans**: the windows are on the left and the door on the right. The drawing isn't to scale, so every position is snapped to the grid, and sizes come from the prototype's data (`src/v4/room.ts`).

**The grid.** 17 × 17 cells of 0.2 m. Rows run **west (top) to east (bottom)**. Columns run **south wall (left) to north wall (right)**. The two margin columns show what is on the wall: left is the south wall, right is the north wall.

```
Legend   W wardrobe   B bed   P bed, pillow end   K desk   c desk chair   t side cabinet
         M dressing table   s stool   h laundry hamper   x boxes   F pedestal fan
         r rug (flat)   p plant   l floor lamp   . floor
Left wall (south):  1 window 1   A the AC (above window 1)   2 window 2   b plug B   S wall shelf   = wall
Right wall (north): | door   a plug A   = wall
```

**Fixed in every plan:**
- The wardrobe: rows 0 to 4, columns 14 to 16. Its front, kept clear: rows 0 to 4, columns 11 to 13.
- The door's swing: rows 6 to 10, columns 13 to 16, kept clear.
- Window 1: rows 2 to 5. Window 2: rows 11 to 15. Each has a 0.4 m strip in front.
- Plug B on the south wall at row 8. Plug A on the north wall at row 12.

**What the drawing doesn't say, and what I assumed `[ASSUMED OI-117]`:**
- The bed's head is at the north wall, by the door.
- The dressing table sits one cell further from the wardrobe than drawn, so it stays clear of the wardrobe's front.
- The desk sits two cells back from plug B, so the plug stays free.
- The chair is one step out from the desk, on the rug's edge.
- The lamp stands one hand's width out from the south wall, so it doesn't stand in front of window 1.

---

## Plan 1. The room as it is (Part 0)

Everything is where it has always been. The thing on the wall at row 8 is labelled **light switch**. Aarav changes it to a plug. Nothing moves.

```
 0  =PPBBBBBBBB....WWW=
 1  =PPBBBBBBBB....WWW=
 2  1PPBBBBBBBB....WWW=
 3  APPBBBBBBBB....WWW=      the pillow end, under the AC
 4  APPBBBBBBBB....WWW=
 5  1.................=
 6  =FFF..............|
 7  =FFF..............|
 8  bFFF..............|      b: "We think this is a light switch"
 9  =.................|
10  =.xx..............|
11  2.xx..............=
12  2.xx.........cc...a
13  2.xx..ss.....cc...=
14  2.....ss....KKKKK.=
15  2.hh.MMMMtt.KKKKK.=
16  =.hh.MMMMtt.KKKKK.=
```

The pillow end of the bed (P) is at the south wall, under the AC.

## Plan 2. The room cleared (Part 1)

Every movable object is in Assets. Only the fixed elements and the floor are left.

```
 0  =..............WWW=
 1  =..............WWW=
 2  1..............WWW=
 3  A..............WWW=
 4  A..............WWW=
 5  1.................=
 6  =.................|
 7  =.................|
 8  b.................|
 9  =.................|
10  =.................|
11  2.................=
12  2.................a
13  2.................=
14  2.................=
15  2.................=
16  =.................=
```

## Plan 3. The AI's proposal for the bed and the desk (Part 1)

Aarav types **"Suggest places for the bed and the study desk."** The proposal shows two ghosts, rows 1 and 2 of its card. The spots are what the prototype proposed on 2026-11-13.

```
 0  =..............WWW=
 1  =..............WWW=
 2  1..............WWW=
 3  A..............WWW=
 4  A..............WWW=
 5  1.................=
 6  =.................|
 7  =.................|
 8  b.................|
 9  =.................|
10  =.................|
11  2KKK..............=
12  2KKK....PPBBBBBBBBa      the bed, against the east wall
13  2KKK....PPBBBBBBBB=      the desk, under window 2
14  2KKK....PPBBBBBBBB=
15  2KKK....PPBBBBBBBB=
16  =.......PPBBBBBBBB=
```

The bed is against the east wall, head at the south end, under the window side. The desk is under **window 2**.

## Plan 4. Aarav's changes (Part 1)

**4a. He drags the desk's ghost to window 1, and puts the chair beside it, then taps Apply.** The window frame glows. A line runs from the desk to plug B. The chair was proposed on its own, against the west wall, so he moves it to the desk.

```
 0  =..............WWW=
 1  =..............WWW=
 2  1KKK...........WWW=
 3  AKKKcc.........WWW=      the desk, dragged to window 1; the chair beside it
 4  AKKKcc.........WWW=
 5  1KKKcc............=
 6  =KKK..............|
 7  =.................|
 8  b.................|
 9  =.................|
10  =.................|
11  2.................=
12  2.......PPBBBBBBBBa
13  2.......PPBBBBBBBB=
14  2.......PPBBBBBBBB=
15  2.......PPBBBBBBBB=
16  =.......PPBBBBBBBB=
```

**4b. He turns the bed so his head is by the door.** Rotate in the tap menu, a drag, Done [ASSUMED OI-117].

```
 0  =..............WWW=
 1  =..............WWW=
 2  1KKK...........WWW=
 3  AKKKcc.........WWW=
 4  AKKKcc.........WWW=
 5  1KKKcc............=
 6  =KKK..............|
 7  =.................|
 8  b.................|
 9  =.................|
10  =.................|
11  2.................=
12  2.......BBBBBBBBPPa      the bed turned: head by the door
13  2.......BBBBBBBBPP=
14  2.......BBBBBBBBPP=
15  2.......BBBBBBBBPP=
16  =.......BBBBBBBBPP=
```

## Plan 5. The rest, applied from the AI's proposal (Part 2)

The AI proposed the laundry hamper under window 2 (kept), the dressing table in the corner by the door and the side cabinet against the east wall. Aarav dragged the dressing table's copy to the west wall, clear of the wardrobe's front, and the cabinet's copy between the windows, beside plug B. The middle stays open.

```
 0  =.......MMMM...WWW=
 1  =.......MMMM...WWW=
 2  1KKK...........WWW=
 3  AKKKcc.........WWW=
 4  AKKKcc.........WWW=
 5  1KKKcc............=
 6  =KKK..............|
 7  =.................|
 8  b.................|
 9  =tt...............|      the side cabinet, beside plug B
10  =tt...............|
11  2.................=
12  2.......BBBBBBBBPPa
13  2.......BBBBBBBBPP=
14  2hh.....BBBBBBBBPP=      the laundry hamper, under window 2
15  2hh.....BBBBBBBBPP=
16  =.......BBBBBBBBPP=
```

The dressing table is at columns 7 to 10, so it ends at the edge of the wardrobe's front zone, not inside it. The prototype's own proposals are in [story-check.md](story-check.md).

## Plan 6. The rug, and the chair pulled out (Part 3)

The Jute rug lies flat in the middle. The chair is unlinked, moved one step out onto the rug's edge, and linked again.

```
 0  =.......MMMM...WWW=
 1  =.......MMMM...WWW=
 2  1KKK...........WWW=
 3  AKKK.ccrrrrrrr.WWW=
 4  AKKK.ccrrrrrrr.WWW=
 5  1KKK.ccrrrrrrr....=
 6  =KKK..rrrrrrrr....|
 7  =.....rrrrrrrr....|
 8  b.....rrrrrrrr....|
 9  =tt...rrrrrrrr....|
10  =tt...rrrrrrrr....|
11  2.................=
12  2.......BBBBBBBBPPa
13  2.......BBBBBBBBPP=
14  2hh.....BBBBBBBBPP=
15  2hh.....BBBBBBBBPP=
16  =.......BBBBBBBBPP=
```

The rug is drawn at the drawing's size, about 1.5 × 1.5 m (rows 3 to 10, columns 5 to 12). The prototype's rug is 1.6 × 1.1 m `[OPEN OI-117]`. It lies under the wardrobe's front and doesn't count there, because it's flat.

## Plan 7. The shelf (Part 3)

The wall shelf is on the south wall, in the gap beside window 1.

**7a. As it arrives, 60 cm wide.** It runs across the start of window 1. The card appears.

```
 0  S.......MMMM...WWW=      the shelf, 60 cm: rows 0 to 2
 1  S.......MMMM...WWW=
 2  SKKK...........WWW=
 3  AKKK.ccrrrrrrr.WWW=
 4  AKKK.ccrrrrrrr.WWW=
 5  1KKK.ccrrrrrrr....=
 6  =KKK..rrrrrrrr....|
 7  =.....rrrrrrrr....|
 8  b.....rrrrrrrr....|
 9  =tt...rrrrrrrr....|
10  =tt...rrrrrrrr....|
11  2.................=
12  2.......BBBBBBBBPPa
13  2.......BBBBBBBBPP=
14  2hh.....BBBBBBBBPP=
15  2hh.....BBBBBBBBPP=
16  =.......BBBBBBBBPP=
```

**7b. Edited to 40 cm.** It fits the gap. The card clears.

```
 0  S.......MMMM...WWW=      the shelf, 40 cm: rows 0 to 1
 1  S.......MMMM...WWW=
 2  1KKK...........WWW=
 3  AKKK.ccrrrrrrr.WWW=
 4  AKKK.ccrrrrrrr.WWW=
 5  1KKK.ccrrrrrrr....=
 6  =KKK..rrrrrrrr....|
 7  =.....rrrrrrrr....|
 8  b.....rrrrrrrr....|
 9  =tt...rrrrrrrr....|
10  =tt...rrrrrrrr....|
11  2.................=
12  2.......BBBBBBBBPPa
13  2.......BBBBBBBBPP=
14  2hh.....BBBBBBBBPP=
15  2hh.....BBBBBBBBPP=
16  =.......BBBBBBBBPP=
```

The shelf hangs high on the wall, so the lamp can stand under it `[ASSUMED OI-116]`.

## Plan 8. The final room: the plant and the lamp added (the owner's drawing)

```
 0  S..ll.ppMMMM...WWW=
 1  S..ll.ppMMMM...WWW=
 2  1KKK...........WWW=
 3  AKKK.ccrrrrrrr.WWW=
 4  AKKK.ccrrrrrrr.WWW=
 5  1KKK.ccrrrrrrr....=
 6  =KKK..rrrrrrrr....|
 7  =.....rrrrrrrr....|
 8  b.....rrrrrrrr....|
 9  =tt...rrrrrrrr....|
10  =tt...rrrrrrrr....|
11  2.................=
12  2.......BBBBBBBBPPa
13  2.......BBBBBBBBPP=
14  2hh.....BBBBBBBBPP=
15  2hh.....BBBBBBBBPP=
16  =.......BBBBBBBBPP=
```

The plant is at the west wall, between the lamp and the dressing table. The lamp is in the corner by window 1, under the shelf, with its line to plug B. The pedestal fan, the storage boxes and the stool are in Assets.

## What moved between plan 1 and plan 8

| Object | Plan 1 | Plan 8 |
|---|---|---|
| Bed | West wall, head under the AC | East wall, head by the door |
| Desk and chair | East side, by the door | Under window 1, the chair a step out |
| Side cabinet | East wall | Between the windows, beside plug B |
| Dressing table | East wall | West wall |
| Laundry hamper | East wall, near window 2 | Under window 2 |
| Boxes, pedestal fan, stool | In the room | In Assets, out for good |
| Rug, plant, floor lamp, wall shelf | Not in the room | Added |
