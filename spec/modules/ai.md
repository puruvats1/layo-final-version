# Module: the AI

**Status:** Locked · **Depends on:** [00-aim.md](../00-aim.md), [decisions.md](../decisions.md), [canvas.md](canvas.md) · **Open items:** none

> Amended 2026-11-12 by DEC-072 and DEC-073: the AI's decisions come from a local model, with the rules and measurements in code; Undo is on every card that follows a change.
> Amended 2026-11-13 by DEC-074: a proposal that brings in several objects shows vertical tabs, one per object, and the tabs and the view follow each other.

The AI is a collaborator that **explains, suggests and proposes**. It never decides, and it never changes the room without the user's tap on Apply (DEC-018). It's also **the voice of the room's checks**: every check card is the AI speaking (DEC-019).

**Serves:** G3 (informed decisions), G4 (personalisation), G1 · **Themes:** Negotiate, Personalise, Imagine · **Screens:** AI-* in the [sitemap](../screens/sitemap.md)

**Prototype note (DEC-001, amended by DEC-072).** The room is still one prepared scan. The AI's decisions are made by a small model on the device: card or marker and their order, the wording, which options are shown, and what a message becomes. The room's measurements and rules are computed in code and given to the model as data, and it can't override a room fact or act without Apply. This module describes the behaviour the model is held to; the scripted version of it is the fallback.

---

## 1. Where the AI appears

| Surface | What it is | Screen |
|---|---|---|
| **The pill** (collapsed) | The input, a **context chip** and 2 or 3 **suggestion chips** | ED-01, with the toggle on AI |
| **The panel** (expanded) | The conversation so far, above the input | AI-01 |
| **Check cards** | The AI speaking about a problem, one card or a stack | AI-02 |
| **Proposals** | A change shown on the canvas with **Apply · Not now**. With several objects, vertical tabs, one per object: tapping a tab turns the view to that spot, and panning the view lights the tab of the object in view (DEC-074) | AI-03 |
| **Show options** | 2 or 3 ghost positions, each with its cost | AI-04 |

Ways in: the toggle; **Ask** in an object's tap menu (with that object as context); **Ask AI** in the selection bar (with the selection as context); a check card's **Show options**.

## 2. How it shows what it can do (P9, quietly: DEC-011, DEC-031)

1. **The context chip** always says what it's working on: "Whole room", "Desk", "3 objects". It changes with the selection.
2. **Two or three suggestion chips** that follow the context. They are the only explanation of what the AI can do:

| Context | Example chips |
|---|---|
| Whole room, no open checks | "Restyle like my references" · "Where could a reading corner go?" · "What's not working?" |
| One object | "Where else could it go?" · "Make it warmer" · "Remove it" |
| One object with an open check | "Why this check?" · "Show options" · "Keep it as is" |
| Several objects | "Where would these feel right?" · "Make these match" |
| Right after Confirm | "What do I move first?" · "Save this layout" |

3. **No capability list**, no tutorial, no "I can help with…" text.
4. **A "no" is one line that points somewhere** (§4).

## 3. What a message becomes

Every message ends in exactly one of **five outcomes** (SF §7.2):

| Outcome | When | What the user sees |
|---|---|---|
| **Propose** | A request to change the room | A proposal on the canvas with **Apply · Not now**. Apply stages the change, and it goes through the same checks as a touch change (DEC-018) |
| **Suggest** | "Where could…?", "What would…?" | Show options: 2 or 3 ghosts, each with its cost (DEC-032) |
| **Explain** | "Why…?", "How wide…?" | One or two sentences. A number only when asked directly, with "Change it in Edit Object" (DEC-021) |
| **Ask one question** | An unclear request ("Move it", "Make it better") | One short question with tap answers, using the current selection as context |
| **Decline, and point** | Something it can't do | One line, plus where to go (§4) |

**The chat is not a way around the rules.** A request to put the bed in front of the door becomes a proposal that triggers the same check a drag would.

## 4. What it can and can't do (DEC-025)

| It can | Example | Outcome |
|---|---|---|
| Move or turn objects | "Put the desk by the window" | Propose |
| Remove objects | "Get rid of the fan" | Propose |
| Add objects, such as a Suggested item | "Add a plant by the window" | Propose |
| Suggest positions | "Where would these feel right?" | Suggest |
| Explain any check | "Why is this flagged?" | Explain, naming the priority behind it |
| Change an object's finish | "Make the rug terracotta" | Propose |
| Restyle the whole room from the references | "Make it feel like my references" | Propose (§6) |
| Answer questions about the room | "How wide is my desk?" | Explain, with a number when asked |
| Switch a rule on from the user's words | "I take calls here" | A rule is added visibly (§7) |

| It can't | Its one line |
|---|---|
| Change an object's size, shape or type | "I can't change its size, but you can correct it in Edit Object." → opens EO-01 |
| Change walls or fixed elements | "I can't move the plug, but if we got it wrong, you can fix it in Room edit." → opens RE-01 |
| Shop or find products | "I can't shop for you. If you have a link, add it from Assets." |
| Pick the best layout | "There isn't one best layout. Here are some options and what each costs." → Suggest |
| Get round the room's rules | The request becomes a proposal, and the check appears as usual |
| Anything unrelated | One friendly line, and the room is left as it was |

## 5. The check card (AI-02)

Guidance decides **when** a check exists ([guidance.md](guidance.md)). This section decides **how it speaks**.

**When it shows:**
- On drop, for room facts and ranked priorities.
- When a marker is tapped, for everything else.
- When an item is tapped in Room Check or the Confirm review.

All three per DEC-019 and DEC-022.

**Anatomy:**

| Part | Content | Decision |
|---|---|---|
| Line | One sentence. The effect, and the priority behind it if there is one ("From the door, your desk would be in view. You chose Privacy.") | DEC-045, DD §8.5 |
| Hedge | "We think…" or "If that's a plug…" when it rests on an estimate or an uncertain detection. The check is then one step quieter | DEC-043 |
| Actions | **Show options** · **Keep it** · **Undo** (whenever the object has an unconfirmed change; not on "Before you started") · **Not right?**. The model sets their order | DEC-023, DEC-073 |
| Stack | Several checks on one object: a stack, top card in full, the next card's edge showing, "1 of 3", swipe or ‹ ›. Room facts first, then priorities by rank | DEC-040 |
| "Before you started" | A check about the starting layout has no Undo, and is labelled as such | DEC-022 |

**Behaviour:**
- **Placement.** The card never covers the object or the thing it's about, and it sits above the bottom bar.
- **Ignoring it.** Moving on without choosing collapses the card to the object's marker. It stays open (D-36).
- **Keep it.** It closes that check with no confirmation, and it's remembered (DEC-042).
- **Picking up again.** If the object is picked up again within about a second, the card disappears and nothing is counted (DD §4.6.3a).
- **Re-checking.** Any move or applied option re-checks the whole stack (DEC-040).

## 6. Restyle (DEC-026, DEC-030)

- **The source.** The look (colours, materials, styles) is taken from the user's references, or from the default preset if they skipped references (DEC-035).
- **The proposal.** A restyle is one proposal that changes several objects: furniture plus curtains, bedding and rugs. **Never walls or floor.**
- **How it shows.** Each changed object previews its new finish on its 3D model, with a small tick, all on by default. Unticking an object keeps its current finish. **Apply** stages the ticked ones; **Not now** drops them all (DEC-052).
- **Afterwards.** Each object's new finish is recorded in its own **finish history** in Edit Object, so a single object can go back on its own.

## 7. The user's words (DEC-039)

- **What the AI reads.** The free-text description and "Add your own" activities. It may switch on a matching rule ("I take calls here" switches on the privacy sightline).
- **How the user sees it.** An inferred rule always appears as a removable item marked "From what you wrote", in the recap and in Settings → Preferences. It's never silent.

## 8. Show options (AI-04, DEC-032)

- **What it shows.** Always 2 or 3 ghost positions, numbered, each with one line on what it costs.
- **When none is clean.** It says so: "Each of these gives something up."
- **Other objects.** An option may involve another object ("if the fan goes").
- **Never "best".**
- **Picking one.** It previews; Apply stages it, and Back returns to the card.

## 9. What it remembers

- The conversation for this layout, shown when the panel is expanded.
- Everything else it knows comes from the room and the preferences. It keeps no separate memory of the user.

## 10. Out

| Out | Why |
|---|---|
| Acting without Apply | P1, DEC-018 |
| Ranking a layout as "best" | Scope (00-aim §5) |
| Changing size, shape or type | D-02. Redirects to Edit Object |
| Walls, floor, fixed elements | DEC-002, DEC-030. Redirects to Room edit for corrections |
| Shopping, prices, search | D-08 |
| A capability list or tutorial | P9, quietly (DEC-011) |
