# Evaluation plan: the first prototype test

**Status:** Draft · **Depends on:** [00-aim.md](../00-aim.md), [modules/canvas.md](../modules/canvas.md), [modules/ai.md](../modules/ai.md), [modules/guidance.md](../modules/guidance.md), [screens/sitemap.md](../screens/sitemap.md), [scenarios/A-aarav.md](../scenarios/A-aarav.md), [scenarios/room-rules.md](../scenarios/room-rules.md) · **Open items:** OI-105, OI-106, OI-107, OI-108, OI-109, OI-110

Written at the owner's request on 2026-11-12, outside the numbered steps. It takes over the parked items OI-095 and OI-096, and replaces the suggested session in [UJ §8](../../docs/kith-user-journeys.md).

## 1. What the test is for

The test answers two questions, and each gets its own part of the session.

| Part | Question | How | Kind of evidence |
|---|---|---|---|
| **A. Objective** | Can people use the editor? Is it simple, do they get things right, and do they understand what the tool does? | Seven short tasks on single interactions, then four comprehension questions | What they did: completed or not, help needed, first thing tried, wrong attempts, time |
| **B. Subjective** | Does the app do what the aim says? Did they feel in control, was the AI in the way or helpful, did it tell them things they hadn't considered? | One scenario with goals, in Aarav's room, then a questionnaire and a short interview | What they said and rated, backed by what they did with each check and proposal |

The test is formative. With five or six people it finds problems and shows direction. It doesn't prove anything statistically, so results are reported as counts ("4 of 5"), never percentages.

**What the test build needs is in §7.** That list is the screen priority for the prototype: 17 of the 38 screens carry the whole test.

## 2. What we measure, and where it comes from

Every measure traces to a goal (G1 to G5) or principle (P1 to P9) in [00-aim.md](../00-aim.md), or to a hypothesis in [DD §9.2](../../docs/kith-design-documentation.md) (H1 to H8).

### 2.1 Objective measures (Part A, and logged through Part B)

| Measure | How it's recorded | Source |
|---|---|---|
| **Completion** | Per task: 0 unaided · 1 after one hint · 2 after being told · 3 not completed | G1 |
| **First action** | The first thing the participant tries, and whether it's the right gesture | P3, P9 |
| **Wrong attempts** | Count of actions that don't move the task forward (for example dragging without holding, which turns the view) | P3 |
| **Time on task** | From the end of the instruction to the result, to the nearest 5 seconds. Indicative only | G1 |
| **Ease, per task** | One question after each task: "How easy was that?", 1 (very hard) to 7 (very easy) | G1 |
| **Ease, overall** | The System Usability Scale, ten items, once, after Part A `[ASSUMED OI-109]` | G1 |
| **Comprehension** | Four explain-back questions, each scored 0 (wrong), 1 (partly), 2 (right) against the rubric in §4.3 | P8, P9 |

### 2.2 Subjective measures (Part B)

Each construct has rating statements (§5.4), an interview question (§5.5) and a behaviour that backs it up.

| Construct | What it means here | Behaviour that backs it up | Source |
|---|---|---|---|
| **Control** | The participant made every change, could take anything back, and wasn't steered to one answer | Keep it used at least once · proposals declined as well as applied · Undo used | P1, P4, G3 |
| **Interruption** | Checks came at sensible moments and didn't block the work | Time from a card appearing to the next action · cards ignored · sighs and remarks ("again?") | P9, [guidance.md §2](../modules/guidance.md), H2 |
| **Helpfulness** | Checks, options and AI answers helped the participant decide | Which card action was taken · Show options opened, and an option picked | G3, H2 |
| **New information** | The app raised things the participant hadn't considered | Per check met: "Had you thought of that?", asked in the interview, not during the task | G3 |
| **Understanding trade-offs** | They can say what the layout gives and what it costs. This is the aim's own success line | Trade-offs named at the end, against the trade-offs they actually met | Aim, G3 |
| **Personal** | The guidance was about what they said matters | They notice "You chose Open floor" and connect it to their own pick | G4, H6 |
| **Clear abilities** | They knew what the AI and the editor could do without being told | Chips used · requests the AI had to decline | P9 |
| **Ready for the real room** | They'd act on the plan, and know what to move first | Their answer to "what would you move first?" against the move list | G2 |
| **Tone** | The app informed and never judged | Remarks during the task | [guidance.md §6](../modules/guidance.md) |

### 2.3 The first-test hypotheses

| Hypothesis | Where it's tested |
|---|---|
| H1, H8: the plug line and tint are read without text | B1 (the desk drag). Asked afterwards: "What was that line?" |
| H2: Keep it, Undo and Show options read as guidance, not nagging | B1, B2, and the Interruption and Helpfulness ratings |
| H3: people correct a size in Edit Object without wanting a resize handle | A7 |
| H4: an added object is understood as an approximation | B2, and interview question 6 |
| H5: people judge clearances without numbers | Count of "how many centimetres?" questions across the session |
| H6: seeing their own priority named builds trust | B2 (the Open floor card), and the Personal rating |
| H7: people find "Not right?" when a check looks wrong | **Not tested this round** `[ASSUMED OI-106]`. The correction flow is still open (OI-060) |

## 3. The session

About 45 minutes, one person at a time `[ASSUMED OI-108]`.

| Block | Minutes | What happens |
|---|---|---|
| Welcome | 3 | Consent, recording, "we're testing the app, not you" |
| **Part A:** tasks | 10 | Seven tasks, with the ease question after each. The participant works quietly |
| Part A: comprehension and SUS | 5 | Four questions, then the ten SUS items |
| Reset and brief | 4 | The room goes back to its starting layout. The persona card. The participant enters Aarav's activities and priorities |
| **Part B:** scenario | 14 | Four goals. The participant thinks aloud |
| Part B: questionnaire | 4 | Fourteen statements |
| Part B: interview | 6 | Eight questions |

**Roles.** One facilitator. A note-taker if possible; otherwise the recording is scored afterwards.

**Help in Part A.** After 30 seconds without progress, one neutral hint ("What else could you try on the object itself?"). After another 30 seconds, the facilitator says how. Two minutes at most per task.

**Help in Part B.** None on the checks or the AI: what the participant makes of them is the data. If a gesture from Part A blocks them, the facilitator reminds them, and it's noted.

## 4. Part A: the interaction tasks

### 4.1 Setup

- The room in its starting layout (S0 in [room-rules.md §6](../scenarios/room-rules.md)).
- **Checks are switched off** `[ASSUMED OI-107]`, so that each task measures one gesture, and the participant's first sight of a check is kept for Part B.
- No persona. The facilitator reads each task aloud.

### 4.2 The tasks

Each task is a route through the [sitemap](../screens/sitemap.md). The objects named are to be confirmed on the pilot run.

| # | Task as read out | Route | Done when | What we watch |
|---|---|---|---|---|
| A1 | "Have a look around the room." | ED-01 | The view has turned at least a quarter of the way round | Do they drag on empty space unprompted? |
| A2 | "Move the laundry hamper to the other side of the room." | ED-01 → ED-03 → ED-01 | The hamper is staged somewhere new | Do they find hold-and-drag? Is the hint read? Does a plain drag (which turns the view) confuse them? |
| A3 | "Turn the desk a quarter turn." | ED-01 → ED-02 → ED-05 → ED-01, or ED-01 → ED-05 → ED-01 by twisting | The desk is staged at a new angle | Which way in: the twist or Rotate? Do they find Done? |
| A4 | "You've changed your mind. Put the desk back how it was." | ED-01 | The desk is at its earlier angle | Do they find Undo, or turn it back by hand? |
| A5 | "Take the boxes out of the room. Now bring them back." | ED-01 → ED-02 → ED-01, then the Undo toast, or ED-01 → AS-01 → ED-03 → ED-01 | The boxes are gone, then in the room again | Do they tap for the menu? Where do they think the boxes went? |
| A6 | "Take out the boxes and the pedestal fan in one go." | ED-01 → ED-04 → ED-01 | Both are removed with one Remove | Do they find hold-and-release? Do they mix it up with hold-and-drag? Do they see the selection bar? |
| A7 | "The app has the bed's length slightly wrong. It's really 200 cm. Fix it." | ED-01 → ED-02 → EO-01 → ED-01 | The length reads 200 and Done is tapped | H3: do they go to Edit, or try to drag an edge? Do they notice the source chip? |

### 4.3 Comprehension questions

Asked straight after A7, before the SUS.

| # | Question | Scores 2 when they say | Source |
|---|---|---|---|
| Q1 | "In your own words, what is this app for?" | Trying out a room layout before moving anything for real | Aim |
| Q2 | "Some things turned into plain boxes. What does a box mean?" | It's a change not yet confirmed; it becomes the real thing on Confirm | P8 |
| Q3 | "Where do things go when you remove them?" | Into Assets, and they can come back | P4, DEC-033 |
| Q4 | "Where would you go to see or change an object's size?" | Edit, from the object's menu | P2 |

A fifth question comes after Part B, because it needs the AI: "What can you ask the AI to do here? Is there anything it can't do?" (P9).

## 5. Part B: the scenario

### 5.1 How the AI and the checks run `[ASSUMED OI-105]`

The scenario is led by goals, not by steps. The participant decides where things go, and the room answers.

| Part | In the test |
|---|---|
| **The room's rules** | Live, in code, as in [room-rules.md](../scenarios/room-rules.md). A check appears wherever the participant actually drops something, so nobody has to follow a script |
| **Card or marker, and their order** | Fixed by [guidance.md §2](../modules/guidance.md): a card for room facts, ranked priorities and Main activities; a marker for the rest |
| **Card wording** | The fixed lines in room-rules.md §2 to §4 |
| **Show options** | Prepared options for the desk, the mat and the lounge chair, each with its cost |
| **The chat** | The suggestion chips, plus a table of prepared replies matched to what's typed (§5.6). Anything else gets one of two spec'd outcomes: one short question, or a one-line "no" that points somewhere ([ai.md §3](../modules/ai.md)) |
| **The local model** | **Off.** Every participant has to meet the same check with the same words at the same moment, or their ratings can't be compared. A model that varies its wording, order or speed would be measured in place of the design |

This is the scripted fallback that ai.md's prototype note already names. It isn't a new design.

### 5.2 Setup

- The room reset to S0, **checks on**.
- The participant gets a persona card and enters the activities and priorities from it themselves (PR-03, PR-04, PR-05) `[ASSUMED OI-106]`. The scan, references and "Here's what we found" are skipped.
- Scenario A only `[ASSUMED OI-106]`.

**The persona card.**

> You're Aarav, 27. You've moved back to your hometown for a remote job and live in this compact room. It's Thursday night. Your brother can help you move furniture on Saturday, and that's your one chance to shift the heavy desk.
>
> You work from this room every day, want to get back to yoga, and like to sit back in the evening. You game now and then. What matters most to you: daylight, open floor, fresh air.
>
> **Tell the app:** Main: Working, Exercising, Relaxing · Sometimes: Gaming · Priorities, in this order: Natural light, Open floor, Fresh air.

### 5.3 The goals

The facilitator gives one goal at a time. Each goal has things the participant must meet. If their own route doesn't reach one, the facilitator uses the nudge, and notes that it was used.

| # | Goal as read out | Must meet | Nudge if they don't | Route | From scenario A |
|---|---|---|---|---|---|
| B1 | "You want daylight at your desk. Put the desk where you'd want to work." | A signal while dragging · a card on drop · a marker | "Try it under the right-hand window." | ED-01 → ED-03 → AI-02 → ED-01 | Act 3 |
| B2 | "You want room for yoga. Your mat is in your photos. Bring it in and find it a place." | The add flow · a stack of two cards · Show options · a choice between options that each cost something | "Try the middle of the room." Then: "See what else the card offers." | ED-01 → AS-01 → AS-03 → AS-04 → EO-01 → ED-03 → AI-02 → AI-04 → ED-01 | Act 5 |
| B3 | "Ask the app about anything in this room you're unsure of. Then get it to make one change for you." | One explanation · one proposal with Apply and Not now | "Ask it whether you still need the pedestal fan." Then: "Ask it to take something out." | ED-01 → AI-01 → AI-03 → ED-01 | Act 6 |
| B4 | "You're happy with it. Finish up, and find out what to tell your brother to carry first." | Room Check if anything is open · the Confirm review · the result · the move list | "Is there anything the app still wants you to look at?" | ED-01 → RC-01 → AI-02 → ED-01 → ED-06 → ED-07 → FN-01 → ED-01 | Act 8 |

**Logged for every check and proposal:** which one it was, what the participant did (Show options, Keep it, Undo, moved the object again, ignored it; Apply or Not now), how long they took, and what they said.

**Scored objectively in Part B**, on the same 0 to 3 scale as Part A: adding the mat, acting on a card, picking an option, asking the AI, applying or declining a proposal, confirming, finding the move list.

### 5.4 The questionnaire

Fourteen statements, each rated 1 (strongly disagree) to 7 (strongly agree). **(R)** marks a statement where a low score is the good one.

| # | Statement | Construct |
|---|---|---|
| 1 | I decided every change that was made to the room. | Control |
| 2 | I could always take back something I'd tried. | Control |
| 3 | The app pushed me towards its own idea of a good room. **(R)** | Control |
| 4 | The checks appeared at moments that made sense. | Interruption |
| 5 | The checks got in the way of what I was doing. **(R)** | Interruption |
| 6 | The checks told me things about the room I hadn't thought about. | New information |
| 7 | I understood why each check appeared. | Helpfulness |
| 8 | The options the app showed helped me choose. | Helpfulness |
| 9 | The AI's answers were useful to me. | Helpfulness |
| 10 | What the app pointed out was about the things I'd said matter. | Personal |
| 11 | I knew what I could ask the AI for. | Clear abilities |
| 12 | I know what this layout gives me and what it costs me. | Understanding trade-offs |
| 13 | I'd feel confident moving the real furniture this way without trying it first. | Ready for the real room |
| 14 | I felt judged for my choices. **(R)** | Tone |

### 5.5 The interview

| # | Question | Listens for |
|---|---|---|
| 1 | "Walk me through the room you ended up with. What did you give up to get it?" | The number of real trade-offs named, against those they met |
| 2 | "What would you move first on Saturday?" | A match with the move list |
| 3 | "Think back to the first card that appeared. What did you take it to be? Who was speaking?" | Whether the card reads as the AI's voice (DEC-019), as an error, or as advice |
| 4 | "Was there a moment the app got in your way? And one where it helped?" | Interruption and Helpfulness, in their words |
| 5 | Going through each check they met: "Had you thought of that before the app said it?" | New information, as a count |
| 6 | "The mat you added: is that your exact mat?" | H4 |
| 7 | "What can you ask the AI to do here? Was there anything you wanted from it that it couldn't do?" | Clear abilities (the fifth comprehension question) |
| 8 | "You were playing Aarav. Would you do this for your own room? What would have to be true?" | The gap between the persona and the person ([UJ F-7](../../docs/kith-user-journeys.md)) |

### 5.6 Prepared AI replies

The chat must answer these in the test build. Wording comes from scenario A and [ai.md](../modules/ai.md).

| The participant asks for | Outcome | Reply |
|---|---|---|
| Whether the fan is needed | Explain | "You have the AC and the ceiling fan, and window 2 is clear for fresh air." |
| Removing a named object | Propose | The object ghosted out, with Apply · Not now |
| Moving a named object to a named place | Propose | A ghost at the place, with Apply · Not now. The usual checks run on Apply |
| Where something could go | Suggest | Show options, with a cost on each |
| Why a check appeared | Explain | The card's line, plus the priority behind it |
| An object's size | Explain | "About 105 cm, from the scan. You can change it in Edit Object." |
| Adding a floor lamp | Propose | A lamp from Suggested beside the object, with Apply · Not now |
| Changing a size, or moving a plug, window or door | Decline, and point | The one-line "no" from ai.md §4 |
| Something unclear | Ask one question | One short question with tap answers |
| Anything else | Decline, and point | One friendly line; the room is left as it was |

## 6. Reading the results

- **Per task:** a table of completion level, first action and wrong attempts for each participant. A task where two or more people needed to be told how is a problem to fix before the next round.
- **Per problem:** what happened, how many people hit it, and how bad it was (blocked the task · slowed it · noticed only). Each is tagged with the goal or principle it breaks.
- **Ratings:** the middle value and the spread for each construct, with the reversed statements flipped. No averages across five people.
- **Subjective against behaviour:** a rating is read next to what the person did. "Felt in control" from someone who never used Keep it, Undo or Not now is weaker evidence than from someone who did.
- **Targets** `[ASSUMED OI-109]`:

| Measure | Target |
|---|---|
| Each Part A task | At least 4 of 5 people complete it unaided or with one hint |
| Ease per task | A middle score of 5 or above |
| SUS | 68 or above, the usual benchmark for "acceptable" |
| Comprehension | At least 6 of 8 points on Q1 to Q4, for at least 4 of 5 people |
| Control, statements 1 to 3 | A middle score of 6 or above (2 or below for statement 3) |
| Interruption, statement 5 | A middle score of 3 or below |
| New information | Every participant names at least one thing they hadn't considered |
| Understanding trade-offs | Every participant names at least two real trade-offs of their layout |

## 7. What the test build needs

### 7.1 Screens

| Needed | Screens |
|---|---|
| **Yes, both parts depend on them (17)** | ED-01 Editor · ED-02 Tap menu · ED-03 Moving · ED-04 Several selected · ED-05 Rotating · ED-06 Confirm review · ED-07 Result · EO-01 Edit Object · AS-01 Assets row · AS-03 Add · AS-04 Gallery · AI-01 AI panel · AI-02 Check cards · AI-03 Proposal · AI-04 Show options · RC-01 Room Check · FN-01 What to move |
| **Yes, if participants enter preferences (3)** `[ASSUMED OI-106]` | PR-03 Activities · PR-04 Priorities · PR-05 Recap |
| **Not needed for this test (18)** | HM-01 beyond a way in · CP-01 · CP-02 · PR-01 · PR-02 · RE-01 · RE-02 · RE-03 · ED-08 · ED-09 · AS-02 · AS-05 · AS-06 · RC-02 · SE-01 · SE-02 · LY-01 · FN-02 |

The test runs on the prototype as it is built, including the compact frame that differs from canvas.md (OI-104). The tasks name behaviours, not button positions, so they hold either way.

### 7.2 Facilitator controls `[ASSUMED OI-107]`

1. **Checks off / on**, for Part A and Part B.
2. **Reset to the starting layout**, between the parts and between participants.
3. **Model off**, so the AI runs on the prepared replies (§5.1).

### 7.3 Content

- The rules and card wording for what the four goals can produce: plug reach and plug hidden, door swing, walkway, window, Natural light, Open floor, Fresh air, and the Gaming marker.
- Show options for the desk and the mat.
- The yoga mat in the Gallery set, arriving as "Estimated from photo".
- The prepared replies in §5.6.
- A move list built from the participant's actual changes.

## 8. Before the first participant

1. Settle OI-105 to OI-109.
2. Check the test build against §7.
3. Run one pilot with someone outside the project. Confirm the Part A objects, the timings and every nudge. Adjust this plan.
4. Write the facilitator's script and the note-taker's sheet from §4 and §5.
5. Prepare the consent form and the recording setup.
