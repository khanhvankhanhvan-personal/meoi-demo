# ADR-003: Frontend port of prototype V28 (M2)

- Status: Accepted
- Date: 2026-10-30

## Context

M2 ports the V28 prototype to React + TypeScript and wires it to the API. The acceptance criterion is that
check-in, chat and the crisis banner work end to end. M2 was estimated at 6-10h; with the deadline of
2026-11-04, the port keeps the behaviour in the spec and drops what only served the demo.

## Decisions

- **Ported:** onboarding (3 slides), intake (3 steps, multi-baby), home (hero by week, 56-day bar, tip, chips,
  quick mood, reflect), check-in, chat (segments, quick replies, pin, crisis banner), history (calendar + notes),
  profile (birth data, trusted contact), baby profile, bottom navigation.
- **Not ported (demo-only or out of M2):** Telex keyboard (the phone's keyboard does it), phone-frame mockup and
  demo panel, animated onboarding demos, demo states, date-picker wheel (native `<input type="date">` instead).
- **Deferred to later milestones:** sign-up/nudge and account menu (M5, no accounts yet), feedback overlay
  (no `/feedback` endpoint yet), persistence of notes and memory (M6).
- **State is in memory only** (a page refresh starts over). CLAUDE.md forbids server-side transcripts and
  `window.storage`; browser storage of health data was not chosen without Vân's decision.
- **Support is always one tap away:** the "Hỗ trợ" button is in the header of every in-app screen and opens the
  support list. The list is fetched from `GET /support` (opening status computed on the server in Vietnam time)
  and falls back to a static list without status when the request fails, so the numbers never disappear.
- **Pin follows the server's `pinnable` flag and the tier:** Tier 3 replies, error bubbles and user messages
  have no pin; the reducer enforces it too. The server-side rejection comes with `/notes` in M6.
- **Crisis banner latches** until the mother dismisses it; a later normal reply does not clear it.
- **Chat history sent to the API** is the last 20 messages as role/content; the check-in opener (an assistant
  message) is first. The API accepts a leading assistant message (checked against the real model).
- The profile sent to the API uses structured fields (birth date, birth type, first-time, babies), never free
  text built by the client; the server flattens baby labels before they reach the prompt.

## Consequences

- Test coverage: reducer (check-ins, crisis latch, pin rules), `CrisisBanner`, chat pin/quick-reply visibility,
  history view, support access, and one smoke path (intake -> check-in -> chat with a mocked backend).
- Visual fidelity to V28 is approximate (colours, fonts and layout follow the spec section 7, but pixel
  parity was not a goal). Vân should review the screens on a phone.
