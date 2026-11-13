# Working rules for this repository

The current work is the **Kith screen spec**, which lives in `spec/`. Its method is `spec/process.md`. Follow it.

## Start of every session

1. Read `spec/README.md` (the status board), then `spec/open-items.md`.
2. Run `npm run spec:check`. Handle any filled-in `Answer:` lines and any `> [YOU]` notes it lists before starting new work, following process.md §5.
3. Work only on the step the status board names as current.

## Rules

- Write only in `spec/` and `docs/`. "Old files" means only the five files in `docs/`. Don't read, cite or change anything else in the repository for this work (not `plan/`, `src/`, `PROTOTYPE.md`), unless the owner asks.
- Change `docs/` only through a decision in `spec/decisions.md`, and tick each change off as it's made.
- Never settle an open question quietly. If something is unsettled, add it to `spec/open-items.md` and mark the text `[OPEN OI-nnn]` or `[ASSUMED OI-nnn]`.
- If a new answer contradicts a Locked file, don't overwrite it. Raise an open item that quotes both sides.
- Every spec file starts with `**Status:** … · **Depends on:** … · **Open items:** …`.
- Screens exist only as rows in `spec/screens/sitemap.md`. Flows are routes through sitemap IDs.
- Check every spec claim against `spec/00-aim.md` (the goals, the "how might we" themes, the principles).
- A step is done only when `npm run spec:check` passes. Paste its output to the owner.
- Ask the owner questions in chat, in batches, each with a recommendation. Lead the conversation.
- At the end of every work session: update the status board and its change log, then commit on the `spec/foundation` branch.
