---
name: design-critic
description: Run an independent visual critique loop on something you designed — screenshot it headless, have a fresh subagent that sees only the pixels score it against a concrete rubric, fix the top issues, repeat until it clears the bar. Use after building or restyling any web page, landing page, app screen, dashboard or HTML artifact, before showing it to the user, and whenever the user says a design "looks AI-made", "meh", "not polished" or asks for a design review.
---

# design-critic

The model that built a design is the worst judge of it: it knows what it meant, so
it sees that instead of what's on screen, and it will happily accept its own
mediocre first draft. Split the roles. The builder builds; a separate critic, in a
fresh context, sees only screenshots and grades them hard.

## Loop

1. **Shoot it.** `scripts/shoot <url-or-html-file> <outdir>` takes headless
   1280×800 screenshots down the page (one per screen, up to 6) with webkit-cli,
   no window. For mobile, also check a 390px-wide render if the page is
   responsive (Playwright or the browser's device mode).
2. **Critique in a fresh subagent.** Give it ONLY the screenshot paths and the
   one-line purpose of the page (who it's for, what it must get them to do). No
   code, no design rationale, no history: it must judge what a visitor sees. Use
   the rubric below and ask for JSON.
3. **Fix.** The builder takes the critic's top 3 issues (highest impact first) and
   fixes those, not everything at once.
4. **Repeat** from step 1 until overall ≥ 8 and no item < 6, or 3 rounds have
   passed. Stop there. More rounds polish noise, and the critic starts
   contradicting itself.
5. **Report** the final scores and the screenshots to the user alongside the work.

## Critic prompt

> You are a senior designer at a top studio reviewing a page cold. Here are
> screenshots of <purpose>. Score each criterion 1–10, where 10 is studio-quality
> work you would ship and 5 is a competent template. Be harsh: an unremarkable but
> clean page is a 5. For every score below 8, name the exact element and the exact
> fix ("hero headline wraps to 4 lines at 1280px: cut to 6 words or drop to 56px"),
> never "make it pop". Return JSON:
> `{ "scores": {criterion: n}, "overall": n, "top_issues": [{ "element", "problem", "fix", "impact": 1-3 }] }`

## Rubric

- **hierarchy**: one obvious focal point per screen. The eye knows where to go next.
- **typography**: a deliberate pairing and scale. Line length ~45–75 characters,
  no orphaned words in headings, consistent weights.
- **color**: a chosen palette, contrast that passes AA, accent used sparingly
  and meaningfully.
- **spacing & alignment**: a consistent rhythm, real grid alignment, nothing
  cramped or floating.
- **originality**: would this be mistaken for a template or a generic AI page?
  (10 = unmistakably its own.)
- **craft**: no overlaps, clipped text, broken images, misaligned icons, or
  leftover placeholder copy.
- **purpose**: is the single thing the visitor should do obvious and easy?

Keep the criteria objective. Vague words ("modern", "clean", "pops") produce vague
scores. The critic costs a small fraction of the build tokens and catches what the
builder can't see.

Pairs with `seed-design` (pick a direction first) and `design-cleanup` (cut what
the critic didn't ask for).
