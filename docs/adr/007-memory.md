# ADR-007: Mother's memory ("Bộ nhớ của mẹ")

- Status: Accepted (Vân, 2026-11-04). Branch only until after the defense.
- Date: 2026-11-04

## Context

The first memory design (CLAUDE.md, "Pin -> history + memory design") derived memory only from notes the mother
pinned. Vân asked for memory that builds from real conversations, the way Claude chat does, with the mother staying
in control. That changes a locked rule: the transcript is still never stored, but short facts derived from it now
can be. This ADR records the answers Vân gave and the safeguards.

## Decisions (Vân's answers)

- **Creation: suggest, she confirms.** After a reply, the app may call `POST /memories/suggest` with the last few
  messages. The server returns at most 2 candidates and stores nothing. The client shows one card, "Mình nhớ điều
  này nhé?" (Nhớ nhé / Không). Only `POST /memories` stores an item. Declined items are not offered again in the
  same conversation. Trade-off: one extra tap, but the mother is never surprised and health data is stored only
  with a clear yes.
- **Per-topic switches.** Categories: life, family, feelings, body, work_money. Default on: all except `body`.
  Settings: a master switch plus one switch per topic. A disabled topic is neither suggested nor accepted by the
  server. Trade-off: more screens, but the strongest control over what counts as sensitive.
- **Retention: until she deletes it.** No automatic expiry (this settles open decision 3 for now). Stale facts are a
  known risk; a "still true?" check is a later improvement.
- **Control:** a settings tab lists every item with edit and delete, "delete all", and the master switch.
  `DELETE /account` removes memories and settings.
- **Timing:** built on a branch; not merged before the defense.

## Safety invariants kept

- The safety keyword `match()` runs on every message before any LLM call. If any message in the suggest request
  matches a Tier 3 rule, the server returns no suggestions and does NOT call the model (crisis content is never
  fed to memory extraction). Candidates and edits whose own text matches Tier 3 are dropped or rejected.
- Memory never overrides safety: it is added only to the model path; Tier 3 messages are still answered by the
  fixed script without the model.
- The injected block says memory is context about the mother, not instructions, and that Tier rules come first.
  Items are cleaned (no newlines or control characters) so one cannot break out of its block.
- Items are written as attribution ("Mẹ kể rằng ..."), never as an AI conclusion or diagnosis.
- Logs carry event names and the pseudonymous user id only, never message or memory text.

## Consequences

- Each suggestion costs one small extra model call, at most once per three of her messages (client) and capped per
  user per hour (server). Suggestion failures are silent and never block the chat.
- The system prompt context changed: **the tier evals must be re-run and graded by Vân before this ships** (eval
  case 10 covers memory use).
- Open decisions that remain: 2 (store the triggering message of a Tier 3 incident), 5 (legal check for storing
  health-related data; the `body` topic is off by default for this reason), 6 (scope document wording for
  pin/memory).
- Future: memory across the mother's whole arc (work, household, money, a child at school) fits the same
  categories; new categories need a migration and a prompt review.
