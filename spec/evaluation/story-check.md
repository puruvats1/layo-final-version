# Walking the story through the prototype

**Status:** Draft · **Depends on:** [story.md](story.md), [story-floor-plans.md](story-floor-plans.md) · **Open items:** OI-115, OI-116, OI-117

On 2026-11-13 the story was followed step by step in the running prototype (`npm run dev`, Chrome, a phone-sized window, the AI model **off** for most of it and **on** for the multi-add request and "What do I move first?"). The spec was not changed to fit what was found. Each row is a gap between the story and the prototype. "Seen" means it happened on screen. "Code" means it was read in `src/v4/` and not seen.

**What worked as the story says:** the scan, preferences and recap; "Here's what we found" with the plug question; Clear the room; the bed's AC card ("The AC would blow straight at your pillow. You chose Restful sleep."); Show options for the bed and the desk, with "Under window 1"; the rug from a product link with a size correction; the plant, lamp and fan from Assets; Confirm; Save this layout; Duplicate.

**What I did not drive:** hold-and-drag to a precise spot (the bed's drag worked, but landing an object on a given wall by hand was too fiddly, so I used Show options); Rotate; the tap menu on a staged object (taps on a translucent box did not register); Unlink and Link (read in code); the fan's two cards; Part 5 beyond Duplicate. These need a person with a phone.

## Gaps, most important first

| # | What the story says | What the prototype does | Seen or code | What it means for the story |
|---|---|---|---|---|
| 1 | Part 2: one request adds the side cabinet, the dressing table and the laundry hamper | **Corrected 2026-11-13.** "Add the …" does not work (scripted: "Add a plant"; with the model: only the first object). **"Suggest places for laundry basket, dressing table and side table" works**, and "Suggest places for the bed and the study desk" works too. The story now uses those prompts | Seen | Resolved in the story |
| 2 | Part 2: tabs, and the view follows | **It exists, as numbered rows on the proposal card** (not tabs). Tapping a row turns the view to that spot. Panning the view lights the row of the copy in view: I saw the lit row change from 2 to 1 after three drags, when the first copy came into view. Each row has a − to take it out, and the button reads "Apply 3". A copy can be held and dragged to a new spot | Seen, and `Editor.tsx` | Done in the build. The story now describes it as built |
| 3 | Part 1: "Put the desk under window 1" | The AI answers "under window 2" whatever the window. The same proposal sends **the storage boxes to Assets**, although they are already in Assets after Clear the room, and puts the chair "in the middle of the room" | Seen | The story uses Show options for the desk, which does offer "Under window 1" |
| 4 | Part 1: the desk arrives with its chair, linked | The chair is a separate asset. It arrives in the middle of the room, and only the study desk and chair start linked in the original room | Seen | The story must say: bring the desk, then the chair, then they are a pair only if the app links them |
| 5 | Part 1: Show options includes "Turn it round where it stands" | The options are only places (middle, east wall, west wall, under window 1). None turns the bed. The "turn it round" idea is in the model's notes only | Seen, and `src/v4/room.ts` | Drop that option from the story, or add one |
| 6 | Part 1: the east-wall option says it covers a plug | It says "Takes a little floor. Nothing else we can see." | Seen | The cost line is missing. The rules don't know a bed can hide a plug that nothing needs |
| 7 | Every Assets item arrives where Aarav can see it | Each arrives in the middle of the room and is checked there. The bed in the middle gets two cards: "This would be in the door's way" and **"There's no clear space for your mat here. You chose Open floor."** | Seen | The Open floor wording says "mat" even for a bed or a lamp. The story needs wording that doesn't name a mat unless there is one |
| 8 | Part 4: Room Check is reachable before Confirm | While anything is staged, **Room Check, Save and ⋯ are hidden**. Only Confirm shows at the top right | Seen | Room Check is only reachable when nothing is staged. The story's order (Room Check, then Confirm) can't happen |
| 9 | Part 4: "Nothing open." then Confirm | With nothing open, Confirm goes straight through with a toast, "Done. Your room is updated." With a check open it shows the review ("1 check still open") | Seen | The story's Confirm sheet for the clean case doesn't exist |
| 10 | Part 4: "What to move" | There is no button. It opens from the chip "What do I move first?" (scripted), from a nudge "Get the move checklist?" that shows after a delay, or from the AI. **With the model on the chip returns a question ("Move the bed first.") instead of the list.** Typing "Show me the list of what to move in the real room, **in order**" returns "I can't shop for you", because the word "order" matches the shop rule | Seen, and `room.ts` line 342 | The list can't be relied on to appear. Fix the shop rule and make the sheet reachable |
| 11 | Part 3: a wall shelf from a photo | Any gallery photo gives the same **Bookshelf, 80 × 160 × 30 cm**, a floor bookcase. Width can go down to half (40 cm) | Seen | New type needed (OI-116). The size correction itself works |
| 12 | Part 3: the rug from a product link, 150 × 150 | Any link gives **160 × 110**. The depth can be raised in steps of 5 up to 165, so 150 takes eight taps. The rug does appear in Assets under Added once it has been read | Seen | The size is correctable but the page value is fixed. The owner asked to add the rug properly |
| 13 | Part 0: "We think this is a light switch" | The prototype asks **"Is this a plug?"**, with the type already set to Plug. The button reads "Yes, it's a plug" | Seen | The story says a wrong label is fixed. The prototype asks a question instead, which is a smaller correction |
| 14 | Part 1: "Clear the room" pill on landing | Not seen on landing. In code it is a nudge that shows after a delay | Code | The story says it's on landing. The spec says so too (DEC-067) |
| 15 | Linking two objects Aarav chooses | The selection bar offers **Link or Unlink** when two linked or unlinked objects are selected | Code | This is already built, so OI-113 is answered by the build |
| 16 | Activities: "Keeping plants" as Sometimes | After Main is full, one tap on "Keeping plants" gave no label, and a second tap turned it off. There is no rule behind it anyway | Seen | Pick it differently, or leave it out of the story |
| 17 | Part 5: the chair intrudes on the mat's space | The Open floor rule fires for any **non-flat object standing in a fixed patch in the middle** of the room. It doesn't use the mat's real position | Code | The card in Part 5 will fire for a chair only if the chair stands in that fixed patch |

## Added on 2026-11-13, after the owner said multi-add works

The building was reloaded between runs (the AI is now called **Layo**, and the room returned to its starting layout with default preferences, where Privacy is a priority).

| # | What I tried | What the prototype did | What it means |
|---|---|---|---|
| 18 | "Suggest places for the bed and the study desk" | **Bed: Against the east wall. Study desk: Under window 2.** The chat line: "Here are spots for the bed and the study desk. Look around, and tap a row to see each one. You can drag any of them, or take one out." | The bed lands where the owner's drawing has it. The desk goes to window 2, the drawing has window 1, so Aarav moves that copy himself |
| 19 | "Suggest places for laundry basket, dressing table and side table" | **Laundry hamper: Under window 2** (matches the drawing). **Dressing table: In the corner by the door** (the drawing: west wall). **Side cabinet: Against the east wall** (the drawing: between the windows) | Two of the three spots differ from the drawing, so Aarav moves two copies himself. One run only, with the model on |
| 20 | "Suggest places for the study desk and the desk chair" | The chair was proposed **Against the west wall**, away from the desk | The chair is not placed with its desk. The story brings the chair in separately |
| 21 | "Why did you put the bed against the east wall?" | **"Nothing is open here right now."** | The AI can explain a check but not a placement. The story no longer has "a reason for each place". OI-119 |
| 22 | After Apply on the bed and desk | A marker on the desk, whose card was "From the door, your desk would be in view. You chose Privacy." | This run had default preferences. With Aarav's own picks (no Privacy) there would be no such card |
| 23 | The bed is proposed on the east wall | No check fires, because the AC check needs the pillow near the AC and the AI never proposes the old wall | The AC moment in the old Part 1 can't happen unless Aarav puts the bed on its old wall himself. The story dropped it, and dropped Restful sleep from his priorities |

## What follows

- Items 1 to 3, 5, 8, 10, 11 and 12 are changes to the prototype before the story can be run for a participant.
- Items 4, 6, 7, 9, 13, 16 and 17 are changes to the story's wording to match the build, unless the owner prefers to change the build.
- Item 15 closes the linking question.
