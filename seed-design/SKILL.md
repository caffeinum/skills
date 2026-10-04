---
name: seed-design
description: Break out of default AI design (purple gradients, text-left/graphic-right, the same fonts every time) by deriving the creative direction from a truly random seed string. Use when designing a landing page, app UI, poster, slide, logo or any visual from a blank page, when the user wants several distinct directions, asks for something "unique", "bold" or "not AI-looking", or when earlier designs keep converging on the same look.
---

# seed-design

Models can't act randomly. Asked for "something unique, decide at random", they
still predict the most likely tokens, so every run lands on the same palette,
structure and metaphors. Variety has to come from outside the model. This is
String Seed of Thought (Sakana AI): generate a real random string, then let it
drive the design decisions.

## Procedure

1. Generate a long random alphanumeric string with a shell command. Don't make one
   up: an invented string is just as predictable as an invented design.
   `scripts/seed` in this skill's folder prints 64 characters (`scripts/seed 128` for more).
2. Read the string for direction: color scheme, layout, typography, density,
   motion, imagery, tone. Look past the surface for subpatterns: repeated letters,
   digit runs, special numbers, letter shapes, case rhythm, what the string sounds
   like read aloud. Write down the direction it suggests and the reason for each
   choice before you build.
3. Use your judgment to bring that direction to life and make it look great. The
   seed picks the direction; craft still decides the quality.
4. Never reveal the string in the design. It's only for your inspiration.

## Going broad

For several directions, generate a separate seed for each one, ideally in
parallel subagents, so they can't drift back toward each other. Show them side by
side, then go deep on the one the user picks.

## Example prompt

> Build me a landing page for my productivity app. Follow this procedure:
> generate a long, random alphanumeric string using a shell script. Define the
> creative direction (color scheme, layout, typography, etc.) based on the string.
> Look beyond the surface for subpatterns, special numbers, anything that inspires
> you. Use your judgment to bring this direction to life and make it look great.
> Don't reveal the string in the design. It's only for your inspiration.

Source: "How to turn your AI into a world-class designer", Lenny's Newsletter
(https://www.lennysnewsletter.com/p/how-to-turn-your-ai-into-a-world), technique 1;
String Seed of Thought, Sakana AI.
