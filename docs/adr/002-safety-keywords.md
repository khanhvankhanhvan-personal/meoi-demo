# ADR-002: Server-side safety matching, prompt source, and defaults

- Status: Accepted (keyword list approved by Vân on 2026-10-30; tier default still open to change)
- Date: 2026-10-30

## Context

CLAUDE.md requires keyword matching on every message before the LLM, with Tier 3 never filtered. The
prototype's `match()` misses common phrasings (the v3 doc test #8 lists "chảy máu", "muốn chết",
"tự vẫn", "làm đau con"). The prototype also has no hotline-hours logic, and the v2 system prompt has
no `[TIER:X]` / `[GỢI_Ý]` instructions.

## Decisions

1. `app/safety.py` keeps the prototype rules and priority (phys > psy > safe > baby3 > T2 > T1), and adds a
   clearly separated `_DRAFT` list of extra phrases. Both are active. Over-triggering Tier 3 is the safe
   failure; a missed crisis is not. The draft list was reviewed and approved by Vân on 2026-10-30.
2. If the mother typed without diacritics ("em muon chet"), matching also runs on a diacritics-folded copy.
   Accented text is never folded, otherwise "từ từ" would match "tự tử".
3. Both spellings "đe dọa" and "đe doạ" are matched.
4. System prompt file `app/prompts/system_prompt_vi.md` is the prototype V28 `SYSTEM` text (needed for the tag
   format and texting style, which the v2 prompt lacks) plus the 3 money entries from the v2 prompt (35 entries).
   Entries #28-32 keep the V28 wording, which differs from v2. The 3 money entries are unreviewed AI drafts.
5. Missing or malformed `[TIER]` tag defaults to Tier 2 and logs a warning (no crisis banner for a formatting
   slip, but no Tier 1 "all fine" either). A bare `[TIER:3]` becomes `3-PHYSICAL` (115 is universal). If a
   reply holds several tags the most cautious wins. Tier 3 replies never carry quick-reply suggestions.
6. HOPE/Ngày Mai hours: window start inclusive, end exclusive, in `Asia/Ho_Chi_Minh`. The prompt receives the
   current time and HOPE status each turn so the model never promises a closed line.
7. The crisis banner is built by the server (`crisis` field) with the verified CSAGA number 024 3333 5599.
   Ngày Mai is not shown in banners: its phone number is unverified and its inclusion is undecided.

## Known gaps

- "sốt" triggers the baby script even when the mother has the fever (v3 test #11).
- No rate limit yet on the LLM path (cost control comes with auth/deploy). Tier 3 will stay exempt.
- No medical reviewer has seen the scripts, prompt or keyword list.
