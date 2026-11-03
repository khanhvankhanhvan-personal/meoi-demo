---
name: ship
description: Turn a short change request from Van (text, pasted screenshot, or both) into a tested, reviewed, deployed change to MeOi!. Use when Van says "/ship", "đổi ...", "sửa ...", "chỉnh giao diện ...", or pastes a screenshot of the app with a wish.
---

# /ship: the low-effort change flow

Van is a non-technical solo founder with ~10 hrs/week. Her whole input is a few words, usually plus a screenshot.
Your job is to do everything else. Reply to her in Vietnamese, short, plain words. Code, commits, PR text in English.
Process background: `docs/process/quy-trinh-cai-tien.md` (lanes A/B/C). Safety invariants: `CLAUDE.md`.

## 1. Understand without interviewing
- Read the request and screenshot. Infer the screen, the problem and the likely fix. Do NOT ask her to describe more.
- Ask at most ONE batched `AskUserQuestion`, and only when (a) the request is genuinely ambiguous, or (b) it is Lane B/C and needs a product/safety decision. Each option gets a one-line trade-off. Put your recommendation first.
- Number multiple requests and handle them as one change unless they are different lanes (then split).

## 2. Say the lane in one line, then act
| Lane | What | Ships how |
|---|---|---|
| A | Look and feel only: layout, colour, button style, wording of non-medical UI text, date/age formatting. Files allowed by `scripts/lane-check.sh`. | Auto: push a `ui/<slug>` branch, the `Ship UI change (Lane A)` workflow merges when CI is green and Render deploys. |
| B | New behaviour, data, endpoints, new screens. | PR on `feature/<slug>`; Van merges. Write acceptance criteria (3-6 "Khi... thì...") first, she approves, tests before code. |
| C | Anything touching Tier 3 keywords, scripted replies, prompts, model name, hotlines, medical content, `content.ts`, `Chat.tsx`, `CrisisBanner`, `SupportList`. | PR on `safety/<slug>`; golden set + 7 evals + Van's pass; ADR. Never auto-merged. |
When unsure, take the higher lane. If a request mixes lanes, split it.

## 3. Build (all lanes)
1. `git fetch origin && git switch -c <prefix>/<slug> origin/main`. One purpose per branch.
2. Make the change in the existing style. Add or update tests. Never hard-code the model name or secrets; keep every safety invariant in CLAUDE.md.
3. In `frontend/`: `npm run lint && npx tsc --noEmit && npm test && npm run build`. Backend changes: `ruff`, `mypy`, `pytest`. Fix failures; do not skip.

## 4. Show, don't explain (Lane A)
- Start the preview (`preview_start` name `web`), walk to the affected screen, screenshot after (and before, if Van did not supply one). Check a phone-width viewport too.
- Send Van the screenshot(s) and ask one thing: ship it? Her "ok" is the approval. Nothing is pushed before it.

## 5. Ship
- Lane A, approved: `git push -u origin ui/<slug>`. That is the whole deploy. Tell her it goes live in about 5-8 minutes.
  **Freeze:** from 2026-11-03 21:00 to the end of 2026-11-04 (ICT) do not push Lane A; keep the branch local and say why.
- Lane B/C: push the branch and give her the "compare" link to open the PR; fill `.github/pull_request_template.md`. She merges.
- `gh` may not be installed; do not depend on it.

## 6. Confirm it is live
After a Lane A push, check `https://meoi.onrender.com/health` (it reports the commit) every few minutes in the background until it matches `origin/main`, then tell her it is live. If it has not changed after ~20 minutes, say so plainly and point at the Actions tab (workflow "Ship UI change (Lane A)" and "Verify deployment").

## 7. Report format (always)
Three lines: what changed (user words) / lane + how it shipped / what she should check on her phone. Say plainly what was not verified.

## Rules that never bend
- Do not enable auto-merge or push to `main` outside this flow. Do not touch Lane C files from a `ui/` branch (the workflow would refuse, and so should you).
- Not Lane A means a person merges. Kill switch for auto-shipping: repo variable `AUTO_SHIP=off`.
- Open decisions in CLAUDE.md still need Van's answer before any work on them.
