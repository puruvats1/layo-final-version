# The room's rules (Aarav's room)

**Status:** Draft · **Depends on:** [modules/guidance.md](../modules/guidance.md), [00-aim.md](../00-aim.md) §6 · **Open items:** OI-111, OI-112, OI-120

The specific rules the scenarios run on. They fit the mechanism in [guidance.md](../modules/guidance.md). The thresholds are starting values, and their calibration is parked for the build (OI-091). Distances are given in words on screen and in metres here.

## 1. Floor plans: how to read them

Every scenario step has a top-down plan on a **0.2 m grid**: 17 × 17 cells for the 3.4 × 3.4 m room (DEC-064). North is at the top. The line under each grid is the south wall.

```
Legend   W wardrobe   | door   a plug A (north wall)   b plug B (south wall)
         B bed   P bed, pillow end   K desk   c desk chair   t side cabinet
         M dressing table   s stool   h hamper   x boxes   F pedestal fan
         m yoga mat   L lounge chair   l floor lamp   U the merged unit
         * a line of sight   . floor
South wall line:   1 window 1 (the AC above it)   2 window 2   b plug B   = wall
```

The fixed elements, and the zones they make:

| Element | Where on the grid | Zone kept clear |
|---|---|---|
| Wardrobe | Row 0 to 1, columns 0 to 5 | Its front: rows 2 to 4, columns 0 to 5 |
| Door (opens inward, hinge east) | Row 0, columns 6 to 10 | Its swing: rows 1 to 4, columns 6 to 10 |
| Plug A | Row 0, column 11 | — |
| Plug B | Row 16, column 8 (the socket, R1) | 15 cm around the socket |
| Window 1 with the AC above | South wall, columns 1 to 5 | A 0.4 m strip in front, for anything taller than 1.05 m. The AC's outflow reaches about 1.2 m into the room `[OPEN OI-120]` |
| Window 2 | South wall, columns 11 to 15 | A 0.4 m strip in front, for anything taller than 1.05 m |
| The sills | Stick out 22 cm under both windows | Physical. Nothing taller than 0.65 m can stand against the wall there (a silent block) `[OPEN OI-112]` |

## 2. Room facts (always watched)

| Rule | Test | Clears when | Card wording |
|---|---|---|---|
| Door swing (H-3) | The object's footprint is in the swing zone | It's moved out | "This would be in the door's way." |
| Entrance (H-4, H-10) | No passable gap of 0.6 m from the door into the room | A gap opens | "This would close off the way in." |
| Wardrobe (H-5) | The object is in the wardrobe's front zone | It's moved out | "The wardrobe doors wouldn't open freely." |
| Plug reach (H-6) | A powered object is more than 2.0 m from the nearest usable socket (amber from 1.5 m) | It's moved closer, or a nearer socket is freed | "The nearest free plug is a long way off." |
| Plug hidden (H-7, R1) | Something at least as tall as the socket stands within 15 cm of a socket a powered object needs | It's moved | "The plug between the windows is behind the fan." |
| Window (H-8) | Something taller than 1.05 m stands in a window's strip | It's moved | "This would block window 2." |
| Walkway (H-9) | The path from the door to the bed, desk or wardrobe narrows below 0.6 m. Flat things (mat, rug) don't count (R5) | It widens | "This leaves a tight squeeze to the bed." |

## 3. Your priorities (watched only if picked, DEC-029, DEC-069)

| Priority | Test | Clears when | Card wording |
|---|---|---|---|
| Privacy | A line of sight from the door to the pillow end or the desk seat. A thing at least 1.5 m tall on the line breaks it `[OPEN OI-111]` | Something tall stands between them, or the bed or desk moves out of the line | "From the door, your desk would be in view. You chose Privacy." |
| Natural light | The desk (or drawing spot) is more than 1.5 m from a window | It's moved nearer a window | "Your desk would be far from daylight. You chose Natural light." |
| Fresh air | A window strip is blocked (H-8), or the pedestal fan has less than 0.3 m around it | It's cleared | "The air from window 2 would be cut off. You chose Fresh air." |
| Open floor | No clear patch the size of the mat, plus 0.15 m on its long sides (R4). It may overlap a chair's pull-out space | A patch opens | "There's no clear space for your mat here. You chose Open floor." |
| Easy storage access | A drawer front or the wardrobe front is blocked | It's cleared | "The cabinet drawers would be hard to open." |
| Restful sleep | The pillow end is within 1.2 m of the AC | The bed is turned (head to the other end) or moved | "The AC would blow straight at your pillow. You chose Restful sleep." |

**No rule is permanently on (DEC-070):**
- Privacy clears with something tall in the way, not by turning a desk. The facing-based idea, R3, is dropped (DEC-064).
- The bed under the AC clears by turning the bed. Scenario B shows this.

## 4. Your activities (watched only if picked, DEC-069)

**Main** activities speak like ranked priorities (a card). **Sometimes** activities get a marker. (DD F1.3 table; DEC-019 extended to Main activities.)

| Activity | Test | Wording |
|---|---|---|
| Working or studying | The desk has a usable plug within reach and is within 1.5 m of a window | "Your desk would be far from daylight." |
| Gaming (R9) | The screen faces a window within 1.5 m in daylight (backlit), or a window is directly behind the seat (reflections) | "Afternoon light would sit right behind your screen." |
| Relaxing (R9) | A seat (lounge chair or armchair) has no soft light within 1.0 m | "There's no soft light by your chair." |
| Exercising | The same patch as Open floor | "There's no clear space for your mat." |
| Getting ready | The dressing table has less than 0.5 m of stool space, or no window or light near it | "There's little room for the stool." |
| Resting | The bed has less than 0.5 m of access along one long side | "It's a squeeze to get into bed." |
| Hosting friends | No two seats within 1.5 m of each other | "There's nowhere for a friend to sit near you." |
| Hobbies | A surface with daylight (as Working) | "Your table would be far from daylight." |
| Drying laundry | A window strip is kept free | "There'd be no free window for drying." |
| Keeping plants | The plants are within 1.0 m of a window | "The plant would be far from light." |

## 5. From the user's words (DEC-039)

| Words | Inferred rule | Test | Clears when |
|---|---|---|---|
| "I work late and sleep lightly" | **Keep work out of sight from bed** | A line of sight from the pillow end to the desk seat, within the view of someone lying in bed (in front of the pillow) | The desk is behind the pillow line, or something at least 1.5 m tall stands between them |

## 6. Starting plans (DEC-062)

| Plan | Used by | What's in it |
|---|---|---|
| **S0, the room as recorded** | A, B | The stress test's starting layout (ST §3.3). See A0 in [A-aarav.md](A-aarav.md) |
| **C0** | C | The end of A ("My room") |
