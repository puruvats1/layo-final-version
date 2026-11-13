# Kith: User Journey Map

Version 0.1 working draft, 2026-11-10. Companion to [kith-design-documentation.md](./kith-design-documentation.md) and [kith-open-questions.md](./kith-open-questions.md). IDs such as `H-6`, `S-1`, `D-36` and `F8` refer to those files.

---

## Index

1. [Purpose and status](#1-purpose-and-status)
2. [Aarav and the story](#2-aarav-and-the-story)
3. [The journey backbone](#3-the-journey-backbone)
4. [The journeys](#4-the-journeys)
5. [Which features each journey exercises](#5-which-features-each-journey-exercises)
6. [The objects the journeys need](#6-the-objects-the-journeys-need)
7. [What the journeys say about the design](#7-what-the-journeys-say-about-the-design)
8. [Suggested test session (for planning, not a decision)](#8-suggested-test-session-for-planning-not-a-decision)
9. [Wireframe inventory (for the low-fidelity round)](#9-wireframe-inventory-for-the-low-fidelity-round)
10. [Open questions from the journey mapping](#10-open-questions-from-the-journey-mapping)

---

## 1. Purpose and status

The team's next steps are, in order (D-40): **map the user journeys**, refine the plan from them, then make **low-fidelity wireframes and options**.

This file is the first step. It does three jobs:

1. Describes the journeys the prototype must support, stage by stage.
2. Derives from them **what the prototype needs**: the objects, the rules and the screens.
3. Ends in a **wireframe inventory** (section 9), so the low-fidelity work starts from a list of frames and the question each one answers.

**Labels:** *Known* = in the code or the docs. *Assumed* = my reading of the scenario, to be confirmed. *Needed* = information only the team has.

---

## 2. Aarav and the story

### 2.1 What we know and what we assume

| Topic | Content | Label |
|---|---|---|
| Who | Aarav, living alone in a compact rented bedroom | Known (room name, room data) |
| The room | About 3.4 × 3.4 m. Bed on the west wall, desk and chair, dressing table, side cabinet, laundry, boxes and a pedestal fan. Built-in wardrobe, two south windows, a split AC | Known |
| How he uses it | Sleeps, studies at the desk, gets ready at the dressing table. Dries laundry near a window. Occasionally has guests | Known from the default description, the activity list and the scenario |
| What he cares about | Privacy, natural light. The story also cares about calm (hiding a plug), airflow and a cosy feel | Known from the scenario steps and the default priorities |
| Why now | Not recorded | **Needed** |
| Age, occupation, tech comfort, time to spend | Not recorded | **Needed** |
| Who visits and how often | The last scenario step adds a folding chair for guests | Assumed |

### 2.2 The existing ten-step story, read against the new model

The prototype's scripted scenario has ten steps. This is what each one tells us.

| # | Scenario step | What the story shows | Where it lands in the new model |
|---|---|---|---|
| 1 | Bed fixed in place | The starting layout. The bed stays | Starting state of every journey. A bed the user won't move needs no lock (D-38) |
| 2 | Desk placed near the big south window, with a privacy concern | The core tension: daylight against being seen from the door | **J2** |
| 3 | Two options to choose between | The user compares trade-offs | "Show options" in **J2** |
| 4 | Second option chosen, a room divider added | A privacy fix by adding a screen | **J2** (divider from the Suggested tab) |
| 5 | "Ghost state": the remaining pieces appear | Many staged changes at once | Staging and Confirm in **J2** |
| 6 | Side table moved to hide the plug | The user wants a plug *out of sight*, the opposite of needing it | Finding F-2 in section 8 |
| 7 | Fan added near the window | Airflow | Soft rule S-3. Part of **J2** (the fan is in the way) |
| 8 | Personalisation: storage, lamp, plant, rug | Making the room feel like his | **J7** |
| 9 | Colour palette | A style choice for the whole room | Open: no home in the new model (JQ-2) |
| 10 | Folding chair added | Space for a guest | **J6** |

---

## 3. The journey backbone

The whole experience as one line. Each journey in section 4 is a slice of it.

| Stage | The user is asking | What carries them | Journeys |
|---|---|---|---|
| 1. Arrive and capture | "Can this really work for my room?" | Home, scan | Outside this map (existing, simulated) |
| 2. Tell the room about me | "Does it understand how I live?" | Onboarding: references, intent, activities, priorities | **J0** |
| 3. Get oriented | "What can I touch? What happens if I do?" | First view of the room, hold and drag | **J1** |
| 4. Move things | "What if I put this over there?" | Hold, drag, passive signals | **J2** |
| 5. Understand a clash | "Is this a problem, and why?" | Cards, markers, Room Check | **J2, J3** |
| 6. Decide | "Do I still want it?" | Keep it, Undo, Show options | **J2, J3** |
| 7. Fix the system | "That's not right." | Edit Object, the Fix sheet | **J4, J5** |
| 8. Bring something new | "What about this thing I saw?" | Add object | **J6** |
| 9. Make it mine | "Can it feel more like me?" | Suggested objects, finishes | **J7** |
| 10. See it | "Show me." | Confirm, 3D models | **J2** onwards |

---

## 4. The journeys

Each journey lists the context, the stages, the rules and signals it triggers, the success signal and the frames it needs (section 9). Emotions are my reading and should be checked in testing.

### J0. Tell the room about me

**Goal:** Aarav's life becomes something the room will respond to. **HMW:** Personalise. **Flow:** F1.

| Stage | Aarav does | System does | Feels | Risk and opportunity |
|---|---|---|---|---|
| Name and references | Keeps the name. Adds one reference, or skips | Pre-fills the name. Accepts a preset, a photo or a link | Light, a bit of fun | References are a weak signal. Keep this quick |
| Choose a mode | Taps Redesign | Stores it | Certain | None |
| Sort activities | Sees Resting, Studying and Getting ready already in **Main**. Drags Hosting friends into **Sometimes**. Leaves the others in the tray | Pre-sorted from the scan. Composes the description from the two sections | "It already knows me. I only fix it" | Drag precision on a phone (tap fallback). Feeling that the guess is final |
| Pick what matters | Taps Privacy, then Natural light | Records the order. Shows "We'll watch what can be seen from the door" | In control | Does ranking feel like homework? Three taps is the budget |
| Wait | Watches processing. Reads the recap | Recap: "We'll look out for Privacy, then Natural light" | Trusting | The recap must match what the editor really does |

**Success signal:** he finishes in about two minutes and can say what the room will watch for.
**Frames:** W1, W2, W3.

### J1. The first minute in the room

**Goal:** he learns, without a tutorial, that objects can be held and moved. **HMW:** Imagine. **Flow:** F2 (first use).

| Stage | Aarav does | System does | Feels | Risk and opportunity |
|---|---|---|---|---|
| Look around | Turns the view | The 3D room responds | Curious | The room is a 3D model, not his photo (open note in `PROTOTYPE.md`) |
| Spot a thing to try | Presses and holds the desk | The desk becomes a wireframe box. The floor under it shows | "It came off the floor" | **The gesture is not obvious.** Needs a hint (W15) |
| Drag it a little | Drags and releases | The box follows, snaps, scales with distance | Playful | Box and model must feel like the same object |
| Undo | Puts it back, or taps Undo | Returns to the start, no penalty | Safe | "No dead ends" starts here |

**Success signal:** he picks up an object within 30 seconds, unprompted. **Frames:** W4, W15.

### J2. Make my desk work (the core journey)

**Goal:** move the study desk to the window for daylight without breaking anything. **HMW:** Imagine, Negotiate, Evaluate. **Flows:** F2, F5, F6.
**Starting state:** desk on the east wall near the north socket. Profile: Privacy first, Natural light second. Main activities: Resting, Studying, Getting ready.

| # | Stage | Aarav does | System does (passive, then active) | Rules and signals | Feels | Risk and opportunity |
|---|---|---|---|---|---|---|
| 1 | Lift | Holds the desk | Desk becomes a box. The chair box follows (linked pair) | Overlap blocks run silently | "Okay" | The chair travelling with the desk must be understood |
| 2 | Drag toward the windows | Drags across the room | **Passive:** a connection line runs from the desk to the nearest *usable* plug. The south plug is hidden behind the fan, so it does not count. The line stays tied to the north socket and goes **amber, then red**, as the desk nears the windows. The hidden south plug is softly outlined. The window edge glows | H-6 reach, H-7 hidden plug, edge glow. T-17 radius | "The line is stretching. Why not the plug right there?" | Line and tint must read without words (H8). The hidden plug must be visible as a *reason* |
| 3 | Drop | Releases in front of window 2 | **Active, L2 card:** "The plug between the windows is behind the fan, so the nearest free plug is a long way off." A chip says "1 more thing to know" | H-6 and H-7 Warn. S-1 Privacy rank 1 queued behind it | "Fair. What about the other thing?" | Two issues. Show the most serious in full. The card names the fan |
| 4 | Read the second issue | Taps the chip | "From the door, your screen would be in view. You chose Privacy." Keep it · Undo · Show options | S-1 sightline, L2 because Privacy is ranked first | "It remembered I said privacy" | Naming the priority builds trust (H6) |
| 5 | Ignore for now | Taps elsewhere to carry on | The card **collapses to a marker on the desk** (D-36) | L1 marker, open | "I'll come back to it" | The marker must be noticeable but quiet |
| 6 | Clear the plug | Picks up the fan and moves it | The plug marker on the desk **disappears by itself**. The south plug becomes usable and the connection line jumps to it and turns green | H-7 resolved, H-6 now fine | "Oh, that's what it meant" | Cause-and-effect across two objects. Satisfying if it is instant |
| 7 | Handle privacy | Taps the marker, then **Show options** | Two ghost positions for the desk, each with one line: *face the wall (private, less light)* and *add a screen between the door and the desk* | Options for S-1. Never "best" | "Two real choices" | Options must differ in a meaningful way |
| 8 | Add a screen | Opens the Assets tab, drags the **room divider** (Suggested) in | Divider shows as a box. The sightline turns from clear to interrupted. The desk marker clears | S-1 resolved by a blocker at least 1.5 m tall (T-11) | "It worked" | The divider's height must exceed T-11 |
| 9 | Confirm | Taps Confirm | **Confirm review:** "0 open". Then every box becomes a 3D model | L3 review | "Let me see it" | The review must never feel like a gate |
| 10 | Look around | Turns the view in the 3D room | Models are in place | Pleased, or unsure | The 3D model must look like what he expected |

**Success signal:** he reaches a layout he is happy with, and says he understood *why* each flag appeared.
**Edge cases:** he drops the desk and never opens the card (J3). He picks Undo. He moves the desk where *nothing* is flagged, which is a useful control case.
**Frames:** W5 to W9, W12.

### J3. I know, and I still want it

**Goal:** the user overrides a heads-up and the system respects it. **HMW:** Negotiate. **Flow:** F5.

| Stage | Aarav does | System does | Feels | Risk and opportunity |
|---|---|---|---|---|
| Ignore | Drops the desk with the privacy flag showing, and moves on | Card collapses to a marker on the desk (D-36) | In charge | Markers should not stack into clutter |
| Notice later | Sees the marker, taps it | Card reopens. The door and sightline are softly highlighted | "Right, that one" | The highlight must show the *other* thing in the clash |
| Decide | Taps **Keep it** | Marker disappears. Dismissal stored for (desk, privacy) | Settled | No repeat on later drags |
| Move slightly | Nudges the desk within the same area | **No new card** (same situation) | Not nagged | The system must tell "same situation" from "new problem" |
| New problem | Moves the desk where the door swing would be blocked | A fresh card appears | Fair | Dismissal must not hide *different* problems |
| Check | Opens Room Check | Sees "Kept" and "Open". Can restore | Safe | Room Check is the safety net |

**Success signal:** he never feels nagged and never loses a flag he wants back. **Frames:** W7, W13.

### J4. That's not the size of my bed

**Goal:** correct a wrong detected size so the checks are accurate. **HMW:** Evaluate. **Flow:** F3.

| Stage | Aarav does | System does | Feels | Risk and opportunity |
|---|---|---|---|---|
| Notice | Sees the bed's box is shorter than his bed | Nothing special | "That's off" | The wireframe makes the error visible. It is the discovery tool |
| Open | Taps the bed, then **Edit** | Edit Object opens with the detected size shown | "Where do I fix it?" | **Edit** must be a clear action, not buried |
| Correct | Lengthens the bed | Box lengthens in the room. Source chip becomes *You edited* | "Matches now" | Limits and proportion lock must help, not block (B-F) |
| Return | Taps Done | Back in the room, bed staged. A card says the walkway to the windows is now tight | "Ah, that's why size matters" | The walkway is about 0.77 m today and T-03 is 0.75 m, so a small change trips it. Check it feels fair |
| Confirm | Taps Confirm | Bed appears at the new size | Relieved | Only the bed's own checks change (D-05) |

**Success signal:** he finds Edit without help and never asks for a resize handle (H3). **Frames:** W10, W6.

### J5. That's not what that is

**Goal:** a wrong detection is fixed without leaving the room. **HMW:** Evaluate. **Flow:** F8. **Uses a seeded error (D-41):** the facilitator switches on S-1, so the entry socket is labelled as a light switch.

| Stage | Aarav does | System does | Feels | Risk and opportunity |
|---|---|---|---|---|
| Doubt | Moves the desk back toward the door and reads a card that seems wrong ("We don't see a plug near here. If there is one, tell us.") | Hedged wording because the detection is uncertain (D-Q17). The connection line is red | "There's a socket right there" | The doubt must lead somewhere |
| Open | Taps **Not right?** | Fix sheet opens over the room | In control | Must not take him out of the room |
| Fix | Chooses **What is it?** then *Socket* | Applies at once. Rules re-run | Quick | Chips must be few and plain |
| See the result | Looks at the room | The connection line now reaches the socket. The card closes | Trusting | The effect must be immediate |
| Record | Opens Room Check | "You corrected 1 thing", with undo | Safe | The correction is visible and reversible |

**Success signal:** he finds **Not right?** unaided and trusts later cards more (H7). **Frames:** W14, W6.

### J6. Someone's coming over

**Goal:** make space for a guest. **HMW:** Imagine, Personalise. **Flows:** F4, F3, F2. **Story source:** scenario step 10 (the folding chair).

| Stage | Aarav does | System does | Feels | Risk and opportunity |
|---|---|---|---|---|
| Trigger | Thinks: "My friend visits on Saturday. Where do they sit?" | | A small worry | A believable reason to add an object |
| Add | Opens Assets, taps **Add**, picks **Gallery**, picks a chair from the prepared images | Scripted: type, box, 3D model and source chip ready | Easy | The set of images is small. Make that feel natural |
| Check | Edit Object opens. Confirms the type | Shows the dimensions with the chip *Estimated from photo* | "Close enough" | The chip must read as "approximate", not "wrong" (H4) |
| Place | Finds the chip under **Added**, drags it in | A wireframe box (it was never in the room) | Experimental | The first moment is a box, so say so |
| Clash | Drops it by the door | L2 card: it narrows the entry | "Not there" | H-10 uses its strongest wording |
| Settle | Moves it beside the desk | Green. Linked behaviour: none | Satisfied | |
| Confirm | Taps Confirm | The chair appears as a 3D model | "Is that mine?" | A scripted model is generic. Label it approximate |

**Success signal:** he places a new object and understands it is an approximation until it is real. **Frames:** W11, W12, W10.

### J7. Make it cosy

**Goal:** personalise the room. **HMW:** Personalise. **Flows:** F2, F3. **Story source:** scenario steps 8 and 9.

| Stage | Aarav does | System does | Feels | Risk and opportunity |
|---|---|---|---|---|
| Browse | Opens the **Suggested** tab | Shows objects from his references that the room lacks: rug, plant, lamp | Inspired | Suggested stand-ins are generic. Say so |
| Place | Drags a plant toward the window | Daylight need for plants (an activity-linked rule) | Playful | A plant needs light, so it tests S-2 |
| Restyle | Opens Edit Object on the rug. Asks for a warmer colour | Finish changes (preview). Shape and size don't | "Like my moodboard" | The AI must not change what the object *is* (A-7) |
| Palette | Wants the whole room warmer | **Open:** the old story had a whole-room palette (JQ-2) | | Decide whether it exists |

**Success signal:** the room feels like his, and he did not feel the system took over. **Frames:** W10, W12.

---

## 5. Which features each journey exercises

| Feature | J0 | J1 | J2 | J3 | J4 | J5 | J6 | J7 |
|---|---|---|---|---|---|---|---|---|
| Sorting activities (Main / Sometimes) | ✓ | | | | | | | |
| Ranked priorities | ✓ | | ✓ | ✓ | | | | |
| Hold and drag | | ✓ | ✓ | ✓ | | | ✓ | ✓ |
| Passive connection line and tint | | | ✓ | | | ✓ | ✓ | |
| Passive floor zone or glow | | | ✓ | ✓ | | | ✓ | ✓ |
| Sightline | | | ✓ | ✓ | | | | |
| L2 card | | | ✓ | ✓ | ✓ | ✓ | ✓ | |
| Marker on the object | | | ✓ | ✓ | | | | |
| Show options (ghost positions) | | | ✓ | | | | | |
| Confirm review | | | ✓ | | | | ✓ | |
| Room Check | | | | ✓ | | ✓ | | |
| Edit Object | | | | | ✓ | | ✓ | ✓ |
| Add object | | | | | | | ✓ | |
| Suggested tab | | | ✓ | | | | | ✓ |
| Fix sheet (Not right?) | | | | | | ✓ | | |
| AI finish change | | | | | | | | ✓ |

**Reading the table:** J2 carries most of the product. If testing time is short, J2 is the one that must be perfect.

---

## 6. The objects the journeys need

You asked for the prepared set to follow the journeys. Reading the journeys, the story demands very little.

| Object | Needed by | Why | Origin |
|---|---|---|---|
| Bed, desk, chair, fan, side cabinet | J2, J4 | Already in the room | Detected |
| **Room divider** (slatted) | J2 | The privacy fix in the story | **Suggested** (already exists) |
| Rug, plant, lamp | J7 | Personalising | Suggested (already exist) |
| **A guest chair** | J6 | The only thing in the story that the *user* brings | **Added**, from the prepared images |
| A tall narrow bookcase | J2 (alternative screen) | A second way to solve privacy. Shows that an *added* object can also fix a clash | **Added**, from a link |

**Recommendation (provisional, for the team to decide):** a prepared set of **two** objects, not five.
1. **Guest chair**, via **Gallery**, chip *Estimated from photo*. Serves J6.
2. **Tall narrow bookcase**, via **Link**, chip *From product page*. Serves J2 and J6, and exercises the link path.

The other three from the earlier list (TV on a stand, wall mirror, yoga mat) are not needed by any journey. Add them only if the team wants more rule coverage. Two objects with two different entry paths and two different chips is enough to test the add-object flow.

---

## 7. What the journeys say about the design

Findings from walking the journeys against the rules and the room data. Two of them already changed the design doc.

| # | Finding | Effect |
|---|---|---|
| F-1 | **A desk under a window would have been flagged as blocking the window.** The window rule (H-8) used the sill height (0.675 m), and the desk is 0.75 m. A window desk is the core story | **Fixed:** the rule now flags objects whose top is above 1.05 m, a third of the way up the window (T-07) |
| F-2 | **The story hides a plug on purpose** (scenario step 6) while the rules protect plugs. These conflict | H-7 fires only for a plug a placed object *needs* and can reach. A plug nobody needs can be hidden freely |
| F-3 | **The first desk move starts with a clash another object causes**: the fan stands in front of the south plug. This is the best demonstration of a multi-object clash | The card must name the *other* object. The marker clears when that other object moves. "Usable plug" is now defined (4.6.4) |
| F-4 | **Privacy only matters if it is ranked.** The same drop gives an L2 card for a Privacy-first user and a quiet marker for someone who didn't pick it | Good for testing H6. Use two different profiles in testing |
| F-5 | **The starting layout already has flags** (the bed under the AC, the fan hiding the plug) | Keep them out of pop-ups. List them in Room Check as "about your room today" (D-Q13) |
| F-6 | **A whole-room palette (scenario step 9) has no home in the new model** | Decide whether it is in scope (JQ-2) |
| F-7 | **The testers are not Aarav.** They sit in his room, not theirs | Give a short persona card and task prompts. Ask "would you do this in your own room?" (JQ-5) |

---

## 8. Suggested test session (for planning, not a decision)

About 30 minutes, ~ estimated.

| Block | Journey | Time (~) | What we watch |
|---|---|---|---|
| Setup | J0 (or pre-done) | 3 min | Does the Main / Sometimes sorting make sense? |
| Orientation | J1 | 3 min | Do they find hold-and-drag unprompted? |
| Core | J2 | 10 min | H1, H2, H6, H8. The conversation about why flags appear |
| Override | J3 | 3 min | H2. Marker and Keep it |
| Correct size | J4 | 4 min | H3. Do they find Edit? |
| Add a thing | J6 | 4 min | H4. Do they treat the model as approximate? |
| Fix a wrong detection | J5 | 3 min | H7. The facilitator switches on seeded error S-1 first (D-41) |

J7 is optional and only needed if personalisation is a research question.

---

## 9. Wireframe inventory (for the low-fidelity round)

Each frame answers one question. P0 frames come first. Each frame should be drawn in more than one option where marked **options**.

| ID | Frame | States to draw | The question it answers | Journeys | Pri |
|---|---|---|---|---|---|
| **W1** | Onboarding step 3: sort activities into Main and Sometimes | Pre-sorted. Dragging a bubble. Main full (cap). Add your own. Tap alternative | Is dragging into two sections easy and clear? **Options:** side-by-side sections, stacked sections | J0 | P0 |
| **W2** | Onboarding step 4: pick up to three priorities, in order | Nothing picked. Two picked (numbered). Three picked. Each with its "what we'll watch" line | Does ranking feel light? **Options:** numbered chips, drag to reorder | J0 | P0 |
| **W3** | Processing recap | The three-line recap | Does it build trust? | J0 | P1 |
| **W4** | Editor, resting state | Tabs. Room Check count. A marker on an object | What is on screen when nothing is happening? | J1, all | P0 |
| **W5** | Dragging with passive signals | Connection line and plug tint (green, amber, red). Floor zone. Window glow. Sightline | Are the signals readable without text? **Options:** line weight, tint, ring | J2 | P0 |
| **W6** | The L2 card | One issue. Two issues with a chip. Hedged wording ("If that's a plug…") with **Not right?** | What does the card say and where does it sit without covering the object? **Options:** bottom card, attached bubble | J2, J4, J5, J6 | P0 |
| **W7** | The marker and the reopened card | Marker on an object. Tapped, with the other thing highlighted | Is the marker noticeable but quiet? | J2, J3 | P0 |
| **W8** | Show options | Two or three ghost positions with one-line trade-offs | Are the options clearly different? | J2 | P0 |
| **W9** | Confirm review | Zero open. Two open. "Confirm anyway" | Does it feel like a summary, not a gate? | J2, J6 | P1 |
| **W10** | Edit Object | A detected object. An added object with the source chip. Finish change | Where do numbers live? How is the source shown? **Options:** full screen, sheet | J4, J6, J7 | P0 |
| **W11** | Add object | Source pop-up. Prepared gallery. Type confirmation | Is the scripted add flow believable? | J6 | P0 |
| **W12** | Assets tab | In this room · Suggested · Added | Are the three groups clear? | J2, J6, J7 | P1 |
| **W13** | Room Check | Open. Kept. "About your room today". Priorities. Corrections | Is this a calm safety net? | J3, J5 | P1 |
| **W14** | Fix sheet (Not right?) | Type chips. Fixed or movable. Remove | Can the user fix a wrong detection in two taps? | J5 | P1 |
| **W15** | First-use hint for hold-and-drag | Hint on first view. Hint after hesitation | Does the user find the gesture? | J1 | P0 |

**Suggested order for the low-fi round:** W5, W6 and W7 together (the guidance system is the heart of the product and the biggest unknown), then W1 and W2 (onboarding), then W10 and W11, then the rest.

---

## 10. Open questions from the journey mapping

> Superseded by [spec/open-items.md](../spec/open-items.md) (2026-11-11). Each open question here carries a pointer to its new ID (→ OI-nnn).

| ID | Question | Rec | Pri |
|---|---|---|---|
| JQ-1 | Seeded errors in the prototype (H-4)? Needed for J5 and H7 | **Resolved (D-41):** yes. S-1 is the working choice, S-2 is optional | Resolved |
| JQ-2 → OI-023 (closed: DEC-026) | Is a whole-room palette (scenario step 9) in scope? | No for this phase. It has no home in the new features | P1 |
| JQ-3 → OI-052 (closed: DEC-059) | Aarav's missing details: why now, age, occupation, who visits, time available | The team supplies them. A short persona card for testers needs them | P1 |
| JQ-4 → OI-096 | One long test session or separate tasks? | One session with tasks in the order of section 8 | P2 |
| JQ-5 → OI-096 | Testers are in Aarav's room, not their own. How do we handle that? | A persona card and task prompts. Ask "would you do this in your room?" at the end of each task | P1 |
| JQ-6 → OI-056 (closed: DEC-058) | What are the two profiles to test (F-4)? | Aarav (Privacy first) and a second with a different first priority, such as Open floor | P1 |
| JQ-7 → OI-054 (closed: DEC-060) | Is the prepared set two objects or five (section 6)? | Two | P1 |
| JQ-8 → OI-096 | Which options does the low-fi round compare first (section 9)? | The guidance system (W5 to W7) | P0 |
