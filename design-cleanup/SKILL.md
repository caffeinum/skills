---
name: design-cleanup
description: A subtraction pass that makes a design look intentional instead of AI-generated — delete every element without a job, then hunt the common AI tells (purple gradient hero, text-left/graphic-right, Inter everywhere, emoji section markers, rounded cards in cards, fake 01/02/03 numbering) and replace them with a deliberate choice. Use as the last step before showing any web page, app UI, deck or HTML artifact, or when the user says it "looks AI-made", "busy", "cluttered" or "generic".
---

# design-cleanup

Models add; they rarely take away. Every extra glow, badge, label and container
reads as "a machine was unsure what mattered". Restraint is what reads as
expensive. Run this after the build (and after `design-critic`, if you used it).

## Pass 1: subtract

Go element by element and ask: **what is this for?** If you can't name the job in
a few words, delete it. Usual suspects:

- labels and eyebrows that repeat the heading next to them
- decorative icons beside every heading or list item
- glows, gradients, blurs and shadows layered on top of each other
- cards inside cards, borders around sections that already have a background
- a subheading that restates the headline, a paragraph that restates the subheading
- three CTAs where one would do. Secondary links styled as buttons
- stats, badges, logos or testimonials that are placeholders, not real
- hover effects and animations that don't communicate anything

Then cut words: headlines to the fewest that still say the thing, body copy by a
third. Re-shoot and compare. If nothing got deleted, look again.

## Pass 2: remove AI tells

The look that tells people "AI made this". Replace each one you find with a choice
that comes from the subject itself. Don't just swap in another default.

- purple-to-blue (or teal-to-violet) gradient hero
- headline on the left, floating graphic or mock screenshot on the right, every time
- Inter / Space Grotesk / system sans as the only typeface
- warm cream background + serif display + terracotta accent
- near-black page with a single neon green or orange accent
- emoji as section markers or bullet points
- `rounded-xl` cards with a soft shadow for everything, an accent stripe on one edge
- everything centered, symmetric, the same width
- 01 / 02 / 03 numbering on things that aren't a sequence
- "Supercharge your workflow" / "Unlock" / "Seamless" / "Effortless" copy
- three feature cards with an icon, a two-word title and one line each
- glassmorphism panels and blurred blobs as decoration

If the user explicitly asked for one of these, keep it. Their call wins.

## Done when

- every remaining element has a job you could state
- none of the tells above survive by accident
- the page still does its one job (re-check the main CTA after cutting)

Pairs with `seed-design` (direction) and `design-critic` (the scored review loop).
