# Aim

**Status:** Locked · **Depends on:** [decisions.md](decisions.md) DEC-001 to DEC-012 · **Open items:** none

This page is what every module, scenario beat, flow and screen is checked against. If something serves none of the goals below, or breaks a principle, it's cut or raised as an open item.

## 1. The problem

People with many needs and little space struggle to make one room work for all of them. They can imagine layouts but only find out what works by moving heavy furniture and living with it. ([DD §1.1](../docs/kith-design-documentation.md))

**Who it's for:** people who have primary control over a small living space and shape it around how they live, work, relax and express themselves. ([DD §1.2](../docs/kith-design-documentation.md))

**The aim in one line:** let people see how their room could look and feel before they move a thing, understand what each choice gives and takes, and leave knowing what to do. *(Amended by DEC-068, 2026-11-11.)*

## 2. Goals

Every spec item is tagged with the goals it serves: **G1** to **G5**.

| ID | Goal | What it asks of the screens | This round |
|---|---|---|---|
| **G1** | Make spatial possibilities easier to explore | Moving, adding and removing take a gesture, not a form. Trying something costs nothing and undoes cleanly | Full |
| **G2** | Reduce reliance on physical trial and error | The room is captured, not rebuilt by hand. The app ends with what to do in the real room, in order (DEC-005) | Full |
| **G3** | Enable more informed spatial decisions | Trade-offs show while you act, name the reason, and leave the choice to you | Full |
| **G4** | Support meaningful personalisation | Your activities, priorities and taste shape what the room watches and suggests. You decide what stays and what goes | Full |
| **G5** | Enable the space to evolve with the person | Layouts can be saved, reopened and duplicated (DEC-004, DEC-009) | Small. Comparing is deferred |

## 3. How-might-we themes

| Theme | Question | Mainly served by |
|---|---|---|
| **Imagine** | How might we make it easy and fast to imagine possibilities? | The canvas: hold, drag, add, remove |
| **Negotiate** | How might we help people understand the trade-offs of their choices? | Guidance: signals, heads-ups, Show options |
| **Evaluate** | How might we help people judge a layout before doing it for real? | Staging, Confirm, Room Check, the move list |
| **Personalise** | How might we let people bring their routines and identity into the room? | Preferences, Suggested and Added objects, finishes |
| **Adapt** | How might we let the space change as the person does? | Saved layouts (small this round) |

Source: [DD §1.7](../docs/kith-design-documentation.md).

## 4. Principles

Carried from [DD §2.2](../docs/kith-design-documentation.md), plus one new one, P9.

| # | Principle | Test for any screen or behaviour |
|---|---|---|
| P1 | **Agency over automation** | Does the user make every change themselves? The only thing ever refused is a physically impossible placement |
| P2 | **Automatic by default, no numbers in the flow** | Are numbers shown anywhere other than Edit Object (or a direct question to the AI, if OI-022 allows it)? |
| P3 | **Tactile** | Does it feel like moving a sticker, with no handles and no gizmos? |
| P4 | **No dead ends** | From here, can the user always continue, undo or go back? *Known exception: the Zone tile on Home (DEC-008)* |
| P5 | **Less typing** | Do pills, presets and detected values do the remembering? |
| P6 | **Facts before opinions** | Are room facts shown before preferences, and calmly? |
| P7 | **Remember what the user decided** | Does a dismissed heads-up stay dismissed unless the situation changes? |
| P8 | **Honest about fidelity** | Does every object and size show where it came from? Is a wireframe visibly a stand-in until Confirm? |
| P9 | **Clear about its abilities, quietly** *(new, DEC-011)* | Can the user tell what's possible from what's on offer (the actions shown on an object, the suggestion chips, what is dimmed), without reading any explanation? Does a "no" take one short line and point to what *is* possible? Does the screen stay as light as it would be without P9? |

## 5. Scope this round

**Fidelity (DEC-001).** The screens describe the **test prototype**:
- The room is a 3D model of Aarav's room, and it's the only room.
- An object you're moving, or haven't confirmed yet, is a bounding box.
- Confirm turns every box into a 3D model.
- Scanning, detection, the objects you can add and the AI's answers are scripted.

The intended product, which edits 360° photos, is a later phase.

**Platform (DEC-007).** Phone first, portrait.

**The two levels of editing (DEC-003).**

| Level | What it is | This round |
|---|---|---|
| **Room** (macro) | The whole room, captured in 360°. Furniture layout: what goes where and what it costs | In: the whole app |
| **Zone** (micro) | One photo of one section of the room, for fine work the room view is too coarse for: posters and frames on a wall, arranging things on a desk top | A tile on Home that does nothing yet (DEC-008). To be planned later |

**In scope:**
- **Capture:** start a project, simulated 360° scan, preferences while the room processes, "Here's what we found", corrections.
- **Preferences:** name and references, activities sorted into Main and Sometimes, up to three ranked priorities, a recap.
- **Canvas:** look around, hold and drag, staging, Confirm. Turn, remove and restore, select several objects (exact form decided in step 2). Undo.
- **Objects:**
  - Adding objects that are not in the room: by photo or product link (from a scripted set), or from Suggested.
  - Edit Object for **any** object, including added ones. It corrects sizes (an added object's size is often an estimate from a photo) and changes finishes (DEC-010).
- **Guidance:** signals while dragging, heads-up cards, markers, Show options, Room Check.
- **AI:** asking, suggesting, explaining, restyling, and proposing changes the user applies.
- **Finish:** the Confirm review, the 3D result, the ordered move list, saving, reopening and duplicating layouts.

**Out of scope, and why:**

| Out | Why |
|---|---|
| Refine mode, and the Redesign/Refine choice (DEC-002) | Never defined. Personalisation is covered by finishes and added objects |
| Zone flows and screens (DEC-003, DEC-008) | Defined later |
| Comparing layouts side by side | Deferred (D-29, as narrowed by DEC-004) |
| Shopping, prices, a catalogue or search (D-08) | It drifts into selling. Kith never sells |
| Resizing existing furniture to try out a bigger or smaller version (D-02) | Edit Object corrects a size to the real one, for every object, including added ones (DEC-010). A different desk is a different object: add it |
| Changing walls, doors, windows or built-ins | Structural change is out of scope. Fixed elements change only by correcting a detection |
| Shared or communal spaces | Out of scope. The user has primary control of the room |
| A single "best" layout | The product shows trade-offs and options, never a verdict |
| Image generation and 360° photos | A later phase (D-27) |

## 6. The room

Aarav's room is the only room (D-28). Its facts are the values in the 3D scene (DEC-012), as measured in the stress test ([ST §2](../docs/kith-room-stress-test-and-journey.md)):

- The ceiling is 2.75 m.
- The window sills stick out 22 cm.
- The wardrobe and plug A are where the scene draws them.
- The door hinge is on the east side until it's measured.

[DD §7](../docs/kith-design-documentation.md) has been updated to match.

## 7. How to use this page

For every module feature, scenario beat, flow and screen, ask:

1. **Which goal does it serve?** Tag it G1 to G5. No tag means cut it, or raise it as an open item.
2. **Which theme does it carry?** Imagine, Negotiate, Evaluate, Personalise or Adapt.
3. **Does it pass all nine principle tests in §4?** A failure is either fixed or recorded as a known exception with a decision behind it, like P4 and the Zone tile.
4. **Is it in scope (§5)?** If not, cut it.

**What success looks like for a user:** they leave with a layout they chose, can say what each part cost them, and know what to move first.
