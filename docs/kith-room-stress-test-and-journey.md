# Kith: Room Stress Test and the Core Journey

Version 0.1 working draft, 2026-11-11. Companion to [kith-design-documentation.md](./kith-design-documentation.md), [kith-open-questions.md](./kith-open-questions.md), [kith-user-journeys.md](./kith-user-journeys.md) and [kith-scenarios-and-flows.md](./kith-scenarios-and-flows.md). IDs such as `H-7`, `T-10`, `D-31` and `F8` refer to those files.

**Part 1 tests the draft constraint rules against the real 3D room. Part 2 is a new user journey built from what Part 1 found.** It replaces the journeys in the other files as the proposed core journey. It does not edit them.

**What I read.** The 3D scene ([proceduralRoom3D.ts](../src/utils/proceduralRoom3D.ts)), the fixed-element and object data ([identificationData.ts](../src/data/identificationData.ts), [mockData.ts](../src/data/mockData.ts)), and the draft rules in design documentation 7.4 and 7.4b. I recomputed the room on a 5 cm grid with throwaway scripts that are not in the repo. Nothing here comes from the `plan/` folder.

**Labels:** **Found** = computed or read from the code. **Proposed** = my recommendation. **Needs your call** = a decision for the team. **To verify** = I could not check it.

---

## 1. Short answer

1. **I now have the 3D room, and the docs described it with errors.** The scene has a ceiling (2.75 m), window sills that stick out 22 cm, two positions for the wardrobe and two for the entry plug. None of this is in design documentation section 7 (table in 2.2).
2. **The draft rules run on this room, with sharp edges.** Five results change the design:
   - **Plug colours depend on modelling choices.** The same room is 59% green and 11% red, or 28% green and 55% red, depending on whether the fan "hides" a plug and how distance is measured (2.3, F1).
   - **"The fan hides the plug" rests on a 7.5 cm gap.** The beat the earlier journeys were built on is a knife-edge (F2).
   - **The room has one daylit area for a desk.** It is in front of window 2, and it only becomes clean once the fan is gone (F3).
   - **Privacy, as written, can never clear.** The only screen in the room is the mirror table (F4).
   - **The window desk and the exercise patch cannot both be clean** at the draft patch size. Three levers resolve it, each with a price (F5).
3. **The journey, "Before Saturday", walks that tension.** Aarav has one afternoon of help to move furniture, four activities and one room. He starts with a plan in his head. The app shows him what each part costs, and he ends with a layout he understands and can carry out in the right order.

---

## 2. Part 1: the stress test

### 2.1 Method and limits

- The room is 3.40 × 3.40 m. Objects are full-height boxes at their scene positions. Placements are tested on a 5 cm grid, in two orientations.
- Rules and thresholds are the draft ones (7.4, 7.4b). Where a rule needed a definition the docs do not give (for example how to test a walkway), I picked the simplest one and say so.
- I treated the door hinge as unknown and ran both sides.
- This tests how the **draft rules map onto this geometry**. It does not test the final rule engine, which does not exist yet (D-24).

### 2.2 Where the scene, the data and the docs disagree (**Found**)

| # | Item | Docs say | Scene and data say | Why it matters |
|---|---|---|---|---|
| 1 | Ceiling height | Not recorded, likely about 2.5 m (7.1) | **2.75 m** in the scene. The AC spans 2.24 to 2.52 m | No rule uses it yet. Update 7.1 |
| 2 | Wardrobe position | Flush, x from −1.68 to −0.48 (7.2) | The data says that. **The scene overrides it to x = −1.42**, so the wardrobe pokes 0.32 m through the west wall. Only 0.88 m is visible, and a 0.38 m strip of bare wall sits beside the door frame | The wardrobe-front zone (H-5) and the north-west clear patch move by about 0.34 m. One of the two is wrong |
| 3 | Entry plug (plug A) | x = 0.58 | 0.58 in the data and the first build. **0.85 in the scenario update**, which is what you see once the editor runs | Plug A moves by 27 cm. Anything standing beside it changes verdict |
| 4 | Window sills and curtains | Sill top 0.675 m (T-07) | Marble sills stick out **22 cm** into the room (z from 1.48 to 1.70), at 0.65 to 0.70 m high, over both windows. Curtains hang to about 0.4 to 0.5 m at z ≈ 1.52 to 1.54 | No rule knows about them. Nothing taller than 0.65 m can touch the south wall under a window. A window desk stops 22 cm short |
| 5 | Overlaps in the starting layout | Bed and fan; desk and chair (7.6) | Those two, plus **bed and window-1 sill (0.23 m²)** and fan and sill | The accepted base (D-28) has more overlaps than listed |
| 6 | Dimension order | "Different axis order for some objects" | Every tuple is `[x-extent, height, z-extent]` in world axes. The bed `[1.52, 0.85, 1.95]` is 1.52 m along x | Consistent, but a rotated object swaps two of them |
| 7 | Door swing | Hinge side not recorded | Still unrecorded ("Inward Right Swing") | Of 1,213 feasible desk placements, 90% hit the swing zone with the hinge east and 82% with it west. About 8% of verdicts depend on a side nobody recorded |
| 8 | Plug B socket | Plug B at x = 0 | x = 0 is the plate centre. The **socket is 6.5 cm east of it** (the plate is mirrored by the 180° rotation) | Matters for finding F2 |

### 2.3 What the recomputation confirms (**Found**)

- About **47% of the floor** is covered (5.48 of 11.56 m²). The bed alone is 2.96 m². The docs said 46% and 3.0 m².
- The largest empty rectangle today is **2.30 × 1.40 m**, in the north-west, around the door and in front of the wardrobe. The docs said the same.
- Plug reach with both plugs usable, measured centre to plug at 1.5 and 2.0 m: **59% green, 31% amber, 11% red**. The docs said about 60, 30 and 10.
- The bed–chair gap is 0.77 m along x, as the docs said. See F7 for why that number is softer than it looks.

### 2.4 Findings

#### F1. The red state depends on three modelling choices

The "never red" problem the docs flagged is real, and it is not a threshold problem alone. Share of the whole floor in each state:

| Plug B usable? | Distance measured | Thresholds 1.5 / 2.0 m | Thresholds 1.2 / 1.8 m |
|---|---|---|---|
| Yes (fan does not block it) | Centre of object to plug | 59 / 31 / **11** | 39 / 42 / **19** |
| Yes | Nearest edge of object to plug | 92 / 8 / **0** | 73 / 25 / **1** |
| **No** (fan blocks it) | Centre to plug | 28 / 17 / **55** | 19 / 19 / **62** |
| No | Nearest edge to plug | 45 / 18 / **37** | 34 / 22 / **44** |

Each cell is green / amber / red. A 1.05 m desk's centre is about 0.5 m further from a plug than its edge, so the choice of metric moves more than the choice of threshold. Moving plug A from 0.58 to 0.85 shifts red by 3 to 4 points.

**Proposed:** choose the metric first (the thing a cable has to cover is closer to nearest-edge), then recalibrate T-05 against it. Until then the passive plug signal is not tuned to anything.

#### F2. "The fan hides the plug" rests on 7.5 cm

The fan's footprint overlaps plug B's 15 cm-deep plate strip but **not the socket**: its east edge is 7.5 cm west of it. Test the plate and the plug is hidden. Test the socket and it is not. The journeys we wrote on top of this beat inherited the same fragility.

**Proposed (H-7, T-06):** define the access zone as a **15 cm radius around the socket**, which is what a plug and its cable bend need. The fan, 7.5 cm away, is then inside it with a comfortable margin, and the verdict holds for about ±7 cm of error in either number.

#### F3. The room has one daylit area for a desk, and the fan guards it

I tested 10,716 desk variants (every position, two orientations, two seat sides) with a 0.5 × 0.7 m seat zone. "No hard heads-up" means clear of the door swing, entry strip and wardrobe front, a plug line that is not red, and the walkway to the wardrobe and the bed side kept open.

| Situation | Physically possible | No hard heads-up | …and within 1.5 m of a window | …and hidden from the door |
|---|---|---|---|---|
| Room as it is | 1,213 | **11** | 0 | 0 |
| Clutter, hamper, stool gone | 1,500 | 11 | 0 | 0 |
| Fan also gone (plug B free) | 1,527 | **78** | **67** | 0 |

- **89% of desk placements are blocked outright**, and in the room as it is **0.1% are clean**. Those 11 are all in the old north-east area (centres x 0.85 to 1.15 m, z −1.4 to −0.5 m), with no daylight.
- Clearing the clutter, hamper and stool changes nothing for the clean count. It makes room, but the plug line is red at the window, because the fan hides plug B. In that cleared room 193 placements show a red plug line.
- **Only when the fan is also gone** do clean, daylit spots appear: 67 of them, all in front of window 2 (centres x about 0.4 to 0.95 m, z about 0.6 to 1.15 m). 56 face along the window and 11 are turned side-on.
- The hamper only forces the desk about 14 cm to the left of the frame. It does not rule the spot out.

**Why it matters:** the fan is the gate to the one place where Natural light, a green plug and a clean placement meet. "Show options" for a desk will rarely have a clean alternative to offer, so it must offer the **least bad** ones with their trade-offs, and say so.

*Correction note.* An earlier pass of mine counted only 11 daylit spots. That came from a walkway anchor point I put beside plug B, which a window desk covers by construction. I removed that anchor. Walkway checks in this document use the wardrobe front and the bed side only.

#### F4. Privacy, as written, can never clear

S-1 asks whether the bed, desk or dressing area is "in clear view from the door", and T-11 says an object at least 1.5 m tall blocks it. In this room only the **1.65 m dressing table with its mirror** is that tall.

- It hides **2%** of the free floor, in the south-east corner behind it (x 1.28 to 1.68, z 0.88 to 1.68). With no tall object, 0%.
- The bed's pillow end and the old desk chair are in full view from the door.
- **No desk placement is hidden**, because a 1.05 × 0.6 m desk does not fit in that shadow.
- The window-2 spot and the plug B front are in view. The hamper corner is not.

So a Privacy-first user would get an L2 card on every desk drop, with no way to clear it by moving the desk. A signal that is always on carries no information.

**Proposed (S-1):** make exposure depend on **which way the object faces**. For a desk the thing to protect is the screen side. A desk whose seat faces away from the door is private even though it is in view. Then privacy has two real levers: the desk's facing and a tall screen. The mirror table becomes the room's one existing screen, and the app can say so.

#### F5. The window desk and the exercise patch cannot both be clean

The draft patch (T-10) is 2.0 × 1.0 m. Patches that fit and avoid the door swing, the entry strip and the wardrobe front, with the desk at window 2 and its seat zone kept clear:

| What else is in the room | 2.0 × 1.0 | 1.8 × 1.0 | 1.8 × 0.9 | 1.6 × 0.9 | 1.4 × 0.8 |
|---|---|---|---|---|---|
| Bed, mirror table, side table stay | 0 | 0 | 0 | 0 | 0 |
| **Side table removed** | 0 | 6 | **9** | 45 | 118 |
| Side and mirror tables removed | 0 | 12 | 18 | 58 | 136 |
| Side and mirror removed, **mat may share the chair's pull-out space** | **72** | 110 | 144 | 262 | 468 |
| No desk at window 2 (for comparison) | 77 | 105 | 135 | 172 | 267 |

Three levers, three prices:

1. **Let the side table go.** The old bookshelf stands in the middle of the only usable strip along the east wall.
2. **Shrink the patch.** A real mat is about 1.8 × 0.6 m. A margin on the long sides but not the ends gives 1.8 × 0.9, which fits. The draft 2.0 × 1.0 never does.
3. **Share the chair's space.** The mat rolls out where the chair slides back. Only works with the side table and the mirror table both gone, which costs the privacy screen (F4).

**Proposed (S-4, T-10):** derive the patch from the actual mat, plus margin on the long sides only, and let it overlap a desk's pull-out zone. Treat flat, rollable things (a mat, a rug) as non-solids for walkway tests.

**Also:** with the desk at window 2, **every** patch that fits at all (241 of them) overlaps the door swing, the entry strip or the wardrobe front. If the patch has to be clean of those, it is the middle of the room or nothing.

#### F6. The north-east corner is wanted by three things

With the desk at window 2 and the mat across the middle, the lounge chair, the pedestal fan and the corner they both want compete:

- Lounge chair (0.8 × 0.8 m) with the fan in the corner and the mat reserved: **0 clean spots**.
- Same, with the fan elsewhere: **30**.
- The fan's own legal homes (within 1 m of a plug, not in front of one, not on the mat): **27**, all between x 0.1 and 0.7, meaning **in the walkway or squeezed beside the door**.

The pedestal fan has no good home. The honest outcome is that it leaves the room, or the lounge chair does.

#### F7. The comfortable-walkway threshold sits inside the measurement noise

T-03 is 0.75 m, and the docs put today's narrowest walkway at 0.77. Measured as the widest path from just inside the door:

| Destination | Width |
|---|---|
| Wardrobe front | 1.15 m |
| Bed, east side | 0.84 m |
| Desk, west of the chair | 0.71 m |
| Dressing stool | 0.57 m |
| Plug B front | 0.47 m (0.59 with the clutter gone) |
| Window 2 front | 0.19 m (0.53 with the clutter gone) |

The bed–chair figure is 0.77 m along x, but the objects do not overlap in z, so the true gap between their corners is about 0.87 m, and the path measure gives 0.71 to 0.84. **T-03 falls inside that spread**, so the verdict depends on the measuring method. These widths also depend on where the anchor points sit. Read them as which destinations are tight, not as exact figures.

**Proposed (H-9, S-10):** fix the method (widest-path corridor from the door to a short list of anchors) and treat T-03 as a band, not a line.

#### F8. A free plug and a reachable plug are different things

In the journey's final layout plug B is free (nothing tall in its 15 cm zone), but the only way to it is a **0.39 m channel** between the bed and the desk (0.54 m if the desk is centred on the window). H-7 as written checks only that the plug is not covered. **To decide:** whether reaching a plug by hand is enough, or whether it needs a body-width path.

#### F9. Rules that cannot fire, and rules that always fire

| Rule | Behaviour in this room |
|---|---|
| H-8 window blocked | Needs a top above 1.05 m. A desk (0.75 m) never triggers it. Only the fan, the mirror table and tall added objects can |
| H-7 plug hidden | Needs an object at least as tall as the plug (0.95 m for B, 1.15 m for A). A desk never hides a plug. The fan can |
| S-1 privacy | Always on, as in F4 |
| S-6 bed under the AC | Always on. Only 18% of bed placements (367 of 2,010) are 1.2 m from the AC, and that ignores every other piece of furniture. This is "about your room today", not a rule a move can fix |
| S-2 daylight | True for only 12% of feasible desk placements (182 of 1,500, with the clutter, hamper and stool gone) |

**Why it matters:** the guidance has two kinds of rule, the ones that decide something (plug, window, door) and the ones that are always on (privacy, AC). The always-on ones must not look like the others.

#### F10. Bounding boxes are too coarse for some objects

The pedestal fan is a 0.42 m base, a thin pole and a head. As a full-height box it overlaps the window-1 sill, which a pole does not. The dressing table is a 0.75 m table under a mirror that reaches 1.65 m. A single box over-blocks both. Since staging shows boxes (D-27), the Block tests should use a footprint for each height band, or at least a lower footprint for these two.

#### F11. Several blocks are physical and invisible, and the user will not know why

D-31 makes blocks silent. In the journey the desk will stop **22 cm short of the wall** (the sill) and **14 cm left of the window frame** (the hamper), and nothing says why. That is the exact case the design note on B-F anticipated for typed values. It needs a test moment (journey beat 14) and a fallback: on a long press on a blocked object, show what stopped it.

### 2.5 What this asks of the rules (**Proposed**, all need your call)

| # | Change | Touches |
|---|---|---|
| R1 | Plug access is a 15 cm radius around the socket, using the socket position, not the plate centre | H-7, T-06 |
| R2 | Pick the reach metric (nearest edge is closer to cable run), then recalibrate | H-6, T-05 |
| R3 | Privacy depends on facing. The lever is the desk's facing or a tall screen | S-1, T-11 |
| R4 | The exercise patch is the mat plus long-side margin, and may overlap a pull-out zone | S-4, T-10 |
| R5 | Flat and rollable objects are non-solid for walkways | H-9, S-10, B-D |
| R6 | Add the sill ledge as a Block, and the curtains as a note | B-C |
| R7 | Resolve the data conflicts: wardrobe, plug A, hinge side | D-28, E-1 |
| R8 | Define the walkway method and treat T-03 as a band | H-9, S-10 |
| R9 | Add rules for Gaming (screen, glare, plug) and Relaxing (a seat, soft light) | F1.1, S-2 |
| R10 | Use lower footprints for the fan and the mirror table in Block tests | B-C, B-D |

---

## 3. Part 2: the core journey, "Before Saturday"

### 3.1 What this journey is meant to prove

It covers the three flows end to end and puts the five project goals under load. Every moment is anchored to a result in Part 1, so it works in this room and not only in the telling.

| Goal | Where the journey tests it |
|---|---|
| 1. Explore possibilities | Beats 8 to 12: the desk, the fan, the corner |
| 2. Less physical trial and error | The stakes. One afternoon of help, and a wrong move means carrying a solid-wood desk across and back (beats 1 and 24) |
| 3. Informed decisions | Beats 9 to 19 and 22: the app shows what each choice costs, and the user chooses |
| 4. Personalisation | Beats 4, 16, 19 to 21: references, what he lets go, a warm and playful finish |
| 5. Evolve | Beat 25, an epilogue. Deferred (D-29) |

### 3.2 The story

**Aarav** is the sample user. He took a remote job and moved back to his hometown nine days ago. His old room was built for his teenage self. He has been working from a folding table. He wants to work, game, relax and exercise in it, and he wants it warm and a bit playful, not minimal.

**The stakes (proposed story detail, change freely).** His brother can help for one afternoon, Saturday. That is one chance to lift the solid-wood desk. It is Thursday night. He has a layout in his head: desk by the window, yoga mat in the middle, an armchair in the corner. He does not want to find out on Saturday that it does not fit.

### 3.3 The room, before and after

Each character is 0.2 m. North wall at the top, door in the middle, two windows on the south wall. `W` wardrobe, `B` bed, `K` desk, `c` chair, `t` side table, `M` mirror table, `s` stool, `h` hamper, `x` clutter pile, `F` pedestal fan, `m` exercise mat, `L` lounge chair, `a` and `b` the two plugs.

```
START                         END (after Saturday)
WWWWWW|||||a.....             WWWWWW|||||a.LLLL
WWWWWW........KKK             WWWWWW.......LLLL
............ccKKK             .............LLLL
............ccKKK             .............LLLL
............ccKKK             ........mmmmmmmmm
..............KKK             ........mmmmmmmmm
.................             ........mmmmmmmmm
BBBBBBBB.......tt             BBBBBBBBmmmmmmmmm
BBBBBBBB.......tt             BBBBBBBBmmmmmmmmm
BBBBBBBB.......MM             BBBBBBBB.......MM
BBBBBBBB.....s.MM             BBBBBBBB......ssM
BBBBBBBB.....s.MM             BBBBBBBB...ccc.MM
BBBBBBBB.......MM             BBBBBBBB...ccc.MM
BBBBBBBB.........             BBBBBBBB..KKKKK..
BBBBBBBB...xxx.hh             BBBBBBBB..KKKKKhh
BBBBBBFF...xxx.hh             BBBBBBBB..KKKKKhh
BBBBBBFFb........             BBBBBBBBb........
```

The wardrobe is drawn at its data position (see 2.2, item 2). In the end layout the desk faces the window with its seat on the north side, the pile, the pedestal fan and the side table are gone, the stool is tucked under the mirror table, and the mat lies across the middle with a 0.1 m margin to the lounge chair.

I checked this layout against the draft rules. **To verify:** the facing and glare rules do not exist yet, so those two behaviours are described, not checked.

| Check | Result |
|---|---|
| Overlaps | Only the allowed tucked pairs (desk and chair, stool and mirror table) and the bed's existing overlap with the sill |
| Door swing, entry strip, wardrobe front | No object is in any of them |
| Mat patch (1.8 × 0.9 m) | Clear of solids and of all three zones |
| Plug B | Free. Desk is 0.93 m from it, centre to plug |
| Walkway from the door | Wardrobe 1.15 m, bed side 0.93 m, desk approach 1.15 m |
| Plug B access | Free of anything tall, but reachable only through a 0.39 m channel between the bed and the desk (F8) |
| Exposure | The desk and the bed pillow are in view of the door. The hamper corner is hidden |

### 3.4 Act 1: Capture (Thursday night, about four minutes)

| # | What Aarav does and thinks | What the app does | Behind it |
|---|---|---|---|
| 1 | In the old room with boxes still stacked, he opens Kith, starts a project and taps *Scan my room*. "I am not measuring this" | Simulated sweep. A line says to stand in the middle and turn slowly | C1, C2. The value of capture. Stakes set up in 3.2 |
| 2 | While it works out the room, he is asked about himself | Preferences fill the processing wait | The wait is real in the intended product |
| 3 | *Here's what we found.* Two items are marked "not sure": a pile that might be several things, and a power strip inside it. He taps **Not right?** on the pile and says it is junk he is clearing. It goes to the **Removed** group | Fix sheet. The pile stops being an object. A quiet line says the pile held the power strip | Merged objects (F8). The data has the pile with a power strip in it. This is the seeded misdetection (H-4, JQ-1) |

### 3.5 Act 2: Preferences (about two minutes)

| # | What Aarav does and thinks | What the app does | Behind it |
|---|---|---|---|
| 4 | Names it *Back home*. Adds two references: warm wood and plants, a playful rug | Presets and a Pinterest link. They feed the Suggested tab and finishes later | Taste creates no rules (F1.2) |
| 5 | Picks **Redesign**. "I am moving things" | Stored | F1 step 2 |
| 6 | Sorts activities. Pre-sorted: Resting, Working, Getting ready in Main. He drags in Exercising and Relaxing. **Main refuses a fourth**. He puts Resting, Gaming and Getting ready in Sometimes | A gentle line: Main is for the few things this room is mostly for | Cap of three (F1.3). Four activities force a real choice, which is the point |
| 7 | Ranks **Natural light**, **Open floor**, **Privacy** | Each shows what will be watched. The recap says daylight at the desk and windows kept usable, clear floor and walking room, and what can be seen from the door | F1.1, F1.2. Natural light and Open floor will collide (F3, F5) |

### 3.6 Act 3: Edit (about 25 minutes)

**First look and the plan.**

| # | What Aarav does and thinks | What the app does | Behind it |
|---|---|---|---|
| 8 | Turns the view. Presses and holds the old desk. It comes off the floor as a box | Hold turns the model into a bounding box. A hint appears if he hesitates | E1, E2. The gesture must be found |
| 9 | Drags it toward window 2. "This is where I always wanted it" | Window 2's frame glows. A connection line runs from the desk to a plug, and it stays tied to the **entry plug** on the far wall, going amber then red. The plug between the windows is outlined with a dashed ring | F1, F2. With the fan blocking plug B, red covers 55% of the floor. At window 2 the nearest usable plug is about 2.9 m away |
| 10 | Releases it in front of window 2 | The desk **stops short of the wall and slightly left of the frame**, with no message. A card opens: "The plug between the windows is mostly hidden by the fan." A small quiet marker also appears on the desk | Invisible blocks (F11). The sill stops it 22 cm short and the hamper 14.5 cm left. L2 card for H-7 (needs R1). The marker is the privacy item, which is L1 at rank three |
| 11 | Taps the marker: "From the door, your desk would be in view. You ranked Privacy third." | A calm one-line card. **Keep it, Undo, Show options** | Rank three gives an L1 marker, not a card (4.6.3a). Needs R3 |

**The fan and the plug.**

| # | What Aarav does and thinks | What the app does | Behind it |
|---|---|---|---|
| 12 | Picks up the fan and drags it toward the entry plug. "So it is the fan." Then he tucks the vanity stool under the mirror table so the chair, which travels with the desk, has room | The line to plug B turns **green** the moment the fan leaves. The card and the plug marker clear by themselves. The fan, dropped in the north-east corner, gets a green line to the entry plug and no card. The stool tucks under the table, an allowed pair | Cause and effect across two objects. The corner is clean for the fan (F6). The desk is 0.93 m from plug B, centre to plug |

**Exercising: the real conflict.**

| # | What Aarav does and thinks | What the app does | Behind it |
|---|---|---|---|
| 13 | Opens Assets, taps **Add**, picks **Gallery**, chooses his yoga mat. It appears under **Added** with the chip *Estimated from photo*. He drags it into the middle of the room | A wireframe box. A floor zone shows "your workout space" | F4, E12. Scripted object. The estimate is deliberately short (about 1.4 m) |
| 14 | Releases it. A card: "There is no clear space for this except by the door, where it would be in the way of the door." It names **Open floor, your second priority** | L2 card. **Keep it, Undo, Show options** | F5. 0 clean patches with the desk at window 2 and the side table in place (F5). The conflict was invisible until now |
| 15 | Taps **Show options**. Three ghost positions, each with one line: *Let the bookshelf go, and a mat this size fits across the middle.* *Share the chair's space, but the bookshelf and the mirror table both go.* *Put the desk back in its old corner: no zones in the way, no window light, and the fan has to move again.* | Three ghosts, numbered, never ranked. Wording is hedged ("a mat this size") because the size is an estimate | D-Q10. Options differ in a meaningful way. The costs are real (F5 lever table) |
| 16 | Thinks about the second option and the mirror: "That is my getting-ready mirror." Chooses the first. Picks up the old side table and **removes** it. It goes to Removed | The card clears. A floor zone for the patch turns solid | E11. The "let go" beat. The bookshelf has his old reference books |
| 17 | Opens **Edit Object** on the mat. The chip says *Estimated from photo*. He enters his real mat size | Dimension fields with the detected value beside them. The source chip becomes *You edited*. The rules re-run. The patch now fits across the middle with nothing to spare | F3, D-02. Without this edit, he would plan for a smaller patch and find out on the floor. The plan **still fits**, tightly (9 positions at 1.8 × 0.9) |

**Relaxing and the corner.**

| # | What Aarav does and thinks | What the app does | Behind it |
|---|---|---|---|
| 18 | Taps **Add**, pastes a link to a lounge chair he saw. The chip says *From product page*. He drags it to the north-east corner | The chair **slides away from the corner** (the fan is there) and lands on the workout zone. A card: "This would take your workout space." **Show options**: *the corner, if the fan goes*, *skip the chair*, *in front of the wardrobe, where it blocks the doors* | F6. With the fan in the corner and the mat reserved, 0 clean chair spots. Without the fan, 30 |
| 19 | Selects the fan and types in the chat: "get rid of the fan". "I have the AC and the ceiling fan" | The assistant stages the removal as a proposal with an **Apply** tap. He taps Apply. The fan goes to Removed. The chair settles in the corner. No card | Chat command staged, not executed (decision 7 in the scenarios file). The user's own example task. The fan is the second time it has been the problem |

**Making it his.**

| # | What Aarav does and thinks | What the app does | Behind it |
|---|---|---|---|
| 20 | Opens **Suggested**. Drags in the rug, a lamp and a plant, anywhere. Selects all three and types: "where would these feel right?" | The assistant proposes two ghost positions for each, with a one-line trade-off. Nothing moves by itself | E4, E13. The user's own example task. No catalogue (D-08) |
| 21 | Picks the lamp beside the lounge chair, near the entry plug. Types: "make the rug warmer, like terracotta". Opens Edit Object on the rug | The rug's finish changes in the preview. Its shape and size do not | A-7, finish only |

**Facing: privacy and glare in one choice.**

| # | What Aarav does and thinks | What the app does | Behind it |
|---|---|---|---|
| 22 | Taps the quiet privacy marker on the desk. "I sit with my back to the door anyway" | The card offers **Which way will you face?** with two chips: *toward the window*, *toward the room*. He chooses the window. The marker clears. A new quiet marker says screens near a bright window can glare, and he games on this desk | Needs R3 and the glare rule from R9. **To verify** that facing clears privacy as the proposal says. Facing toward the window turns the screen away from the door and onto the daylight |

**Confirming and leaving.**

| # | What Aarav does and thinks | What the app does | Behind it |
|---|---|---|---|
| 23 | Taps **Confirm** | A short review: nothing open except the glare marker, which he keeps. Then every box becomes a 3D model. He turns the view | F6, 3D models (D-27). The review is not a gate |
| 24 | "I have to move this in order." The app gives him a short list for Saturday | A dependency-ordered list: *1 Clear the pile. 2 Take the fan and the side table out. 3 Move the desk and chair to window 2, tuck the stool under the mirror table. 4 Unroll the mat. 5 Bring the lounge chair.* Each line is a step the layout forces or makes easier: the pile first because it blocks the desk spot, the fan before the desk so the plug is free when the desk lands, the side table before the mat | A take-away (E15 in the scenarios file). **Needs your call.** The order falls out of the rules |

### 3.7 Act 4: after Saturday (epilogue, deferred)

| # | What Aarav does and thinks | What the app does | Behind it |
|---|---|---|---|
| 25 | A month later he has started going to the gym. He wants a weekday layout and a weekend layout. The room has changed in real life too | Nothing in this phase. The prototype has no flow for it | S3 in the scenarios file. Goal 5, deferred (D-29). Interview prompt only |

### 3.8 Branches (what else might happen)

| Where | He does | What should happen |
|---|---|---|
| Beat 10 | Taps **Keep it** on the plug card | The fan stays. The desk stays at window 2 with a red plug line. The card is dismissed for (desk, plug). Room Check lists it as kept. Nothing nags |
| Beat 10 | Ignores the card | It collapses to a marker on the desk and stays open (D-36) |
| Beat 14 | Picks the second option | The mirror table goes too. The app says the corner behind it stops being private. The privacy screen is gone |
| Beat 14 | Picks the third option | The desk returns to its old corner. The plug line is green. There is no window light, and Natural light, his first priority, raises a card |
| Beat 15 | Never removes the side table | The card stays open, collapsed to a marker on the mat |
| Beat 18 | Skips the chair | Relaxing stays in Main with no seat. Room Check says no seat was placed. He is not blocked |
| Beat 19 | Types "remove the pile" | The pile is already gone. The assistant says so and does nothing |
| Beat 19 | Types "make the fan quieter" | Out of scope. The assistant says plainly what it can do |
| Beat 20 | Selects the rug, lamp and plant and types "put them anywhere" | The assistant asks one question or offers positions, never "the best" |
| Any | Moves the mirror table away | The south-east corner stops being private. A quiet note, not a card |
| **Hard mode** | The patch stays at the draft 2.0 × 1.0 m | No option satisfies it with the desk at window 2 unless the side table, the mirror table and the shared pull-out space all go (F5). A good test of how the app says no |

### 3.9 What the prototype needs for this journey

| Item | Real or scripted |
|---|---|
| The rules in 2.5, at least R1, R3, R4, R5, R6 | Real |
| The pile of boxes as a merged object with a power strip | Scripted seeded error |
| Prepared added objects: a yoga mat (gallery, estimated) and a lounge chair (link, from the product page) | Scripted (D-33). Two objects with two entry paths and two chips |
| The Suggested items rug, lamp and plant | Already exist in the scenario |
| The three ghost positions for the mat, the chair and the objects in beat 20 | Scripted from computed positions |
| Chat commands that stage a proposal and the single "get rid of the fan" intent | Scripted for the objects and phrases in the journey |
| The dependency-ordered list in beat 24 | Scripted from the order of the staged changes |
| Facing chips on the desk | New. **To verify** the behaviour once R3 and the glare rule exist |

### 3.10 What to watch in a test

1. **Beat 8.** Does he find hold-and-drag unprompted? (H3 and the first-minute risk.)
2. **Beat 10.** Does he understand why the desk stopped short, or does he fight it? (F11, D-31.)
3. **Beat 12.** Does he say the line "stretched" or "reached" before reading the card? (H1, H8.)
4. **Beat 14.** Does he treat the card as help or as nagging? (H2.)
5. **Beat 15.** Does he read the three options as different, and does he name what each costs? (H5.)
6. **Beat 17.** Does he find Edit Object and correct the size without asking for a resize handle? (H3, H4.)
7. **Beats 11 and 22.** Does naming Privacy as his third priority build or cost trust? (H6.)
8. **Beat 24.** Does the list feel like a bridge to the real room, or like homework?
9. **Throughout.** Does he say he understood why each flag appeared?

**Success signal for the whole journey:** he leaves with a layout he chose, can say what each part cost, and knows what to lift first.

---

## 4. Decisions needed

> Superseded by [spec/open-items.md](../spec/open-items.md) (2026-11-11). Each open question here carries a pointer to its new ID (→ OI-nnn).

| # | Question | Recommendation |
|---|---|---|
| 1 → OI-050 (closed: DEC-012) | **Which room is true?** Wardrobe at −1.08 or −1.42. Plug A at 0.58 or 0.85. Door hinge side (R7) | Decide from the real room. The wardrobe and the plug move verdicts by 0.3 m and 0.27 m |
| 2 → OI-057 (closed: DEC-069) | **Plug access** as a 15 cm radius around the socket (R1) | Yes. It makes "the fan hides the plug" robust |
| 3 → OI-092 | **Plug reach metric**, then thresholds (R2) | Nearest edge, then recalibrate T-05 |
| 4 → OI-057 (closed: DEC-069) | **Privacy depends on facing** (R3) | Yes. Otherwise the rule is always on |
| 5 → OI-057 (closed: DEC-069) | **Exercise patch** from the mat plus long-side margin, overlapping pull-out zones allowed (R4, R5) | Yes. Without it the room cannot host both |
| 6 → OI-016 (closed: DEC-020) | **Sill ledge as a Block** and a long-press reason for invisible blocks (R6, F11) | Yes to both. A first-time exception to D-31 |
| 7 → OI-057 (closed: DEC-069) | **Rules for Gaming and Relaxing** (R9) | Yes. The journey needs them |
| 8 → OI-005 (closed: DEC-005) | **The take-away** at beat 24: an ordered list of moves | Yes. It is the smallest bridge to the real room |
| 9 → OI-054 (closed: DEC-060) | **The two prepared objects**: a yoga mat (gallery) and a lounge chair (link) | Yes. They replace the earlier recommended pair |
| 10 → OI-051 (closed: DEC-058) | **Is "Before Saturday" the core journey** to design wireframes from? | Your call. It reuses the first minute, the fan-and-plug clash, Keep it and Edit Object from the earlier journeys, and drops the room divider and the guest chair |

---

## 5. What this does not cover

- I did not run the prototype. The scene was read from code, not rendered.
- The rules are drafts and the thresholds are placeholders. The point of the stress test is the shape of the problems, not the exact counts. Counts will move when thresholds do.
- Facing, glare, Gaming and Relaxing have no rules yet. Beats 11 and 22 depend on them.
- The scripts that produced the numbers are in my scratch folder, not the repo. I can add them as a small test harness if you want the numbers to be repeatable.
- I did not update the other documents. Section 2.2 lists the room facts that are wrong in design documentation section 7.
