---
name: echo-writer
description: Draft or rewrite user-facing text through Echo (echo.fulcrum.inc), a writing model that writes as a chosen author. The default persona is Julia Evans, the voice picked for vibeOS. Use this whenever the user wants copy written or reworded in a house voice, such as landing pages, UI strings, buttons, error messages, onboarding, emails, launch posts, video scripts or hooks, or asks to "run it through Echo", "use the writer", "in our voice" or "as <author>", or wants to compare how different writers would phrase the same thing. Not for code comments, commit messages or text read by models (tool descriptions, prompts).
---

# echo-writer

Echo is a writing model behind an OpenAI-compatible API that takes a `persona`: the
name of a writer to write as. It is good at voice and bad at facts. It rewords
confidently, drops or invents details, and changes person and tense. So the shape of
the job is always: **Echo drafts, you edit.** You own every word that ships.

## Setup: where the key lives

`scripts/echo.py` looks for the key in this order and uses the first it finds:

1. `$ECHO_API_KEY`
2. `~/.config/echo/key`
3. `~/.config/vibeos-writer/echo_key` (where aleks's key is today)

Each file holds just the key, on one line. Check without printing it:

```bash
python3 <skill-dir>/scripts/echo.py --check
```

Never print, log, paste or commit the key. If none is configured, tell the user to
put one in `~/.config/echo/key`. Don't go looking for it anywhere else.

Other settings (all optional):
- `ECHO_PERSONA` changes the default writer.
- `ECHO_BASE_URL` points at another Echo deployment (default `https://echo.fulcrum.inc/api/v1`).

## Calling it

```bash
S=<skill-dir>/scripts/echo.py
python3 $S "Rewrite this button label, 2-5 words: Continue without AI features"
cat page.md | python3 $S "Rewrite this page in your voice. Keep every heading, link, code block and number:"
python3 $S --persona "E. B. White" "…"
```

The prompt is the argument, stdin, or both (argument first). The script prints only
the reply text. It exits non-zero with Echo's own error message: an HTTP status and
body, or the network error. Over raw HTTP, `persona` is a top-level field of
`POST /responses` with `model: "echo"`, and the reply text is in
`output[].content[].text`, after a reasoning item.

A call takes a few seconds to a minute or more, depending on length. Run independent
pieces in parallel (`&` plus `wait`, or a thread pool) rather than one long prompt per
thing.

## Writing a good Echo prompt

Echo writes better from facts than from vibes. Put three things in every prompt:

1. **The facts it may use, and that it may add none.** For example: "vibeOS is a desktop
   in a browser tab; a real Linux machine runs in WebAssembly; the desktop works
   without an agent." Without this it fills gaps with plausible inventions.
2. **The constraints:** the length ("about as long as the original"), the format
   ("return three numbered lines", "return only JSON with the same keys"), what must
   survive byte for byte (names, `{placeholders}`, links, code, numbers), and sentence
   case.
3. **The text**, labelled, with a hint of where it appears ("button", "error under the
   email field", "boot screen hint").

For a batch of UI strings, send one JSON object of `id → string` and ask for the same
keys back. It keeps context across strings and makes applying the result mechanical.

## Editing what comes back (the part that matters)

Check every line against what the product actually does before it ships. These are the
failure modes seen in practice:

- **New claims.** "can't run without an agent" for a desktop that runs fine without
  one; an "Export" button that doesn't exist; "your computer is now just a URL".
  Delete or correct them; a claim the product can't keep is worse than a dull line.
- **Lost facts.** It drops the "why" ("we'll be in touch" instead of "we'll ask you a
  couple of questions") or a limit ("unless you hand it a folder").
- **Persona tics.** The Julia Evans persona writes UI strings all in lowercase and uses
  `--` for dashes. Restore sentence case and real punctuation. Other personas drift
  into first person ("When I search for…") on pages that aren't first-person.
- **Too little change.** Echo often barely touches already-plain copy. That's fine: keep
  the original where the draft isn't better, and don't ship churn.
- **Structure drift on long pages.** It merges or drops `---` rules and rewords
  headings. For markdown, compare links, code blocks, numbers and heading counts
  before and after with a script, and restore any heading that carries a search term.

If text is asserted by tests (e2e suites grepping for a string), grep for it before
changing it. Either change the test in the same commit, or leave the string alone.

## Choosing or comparing writers

To help someone pick a voice, run the same 3 real strings through 5-7 personas in
parallel and show them side by side with a one-line recommendation. Mix product voices
and essayists: Julia Evans, E. B. White, Jason Fried, Paul Graham, Ursula K. Le Guin,
Kurt Vonnegut, a house style such as "Apple copywriter". Flag any draft that broke a
fact; that alone can rule a voice out.

## Picked voices

| Project | Persona | Decided |
|---|---|---|
| vibeOS (vibeos.sh) | Julia Evans | aleks, 2026-10-03, for the landing page and the app |

Add a row when a project settles on a voice, so the next run starts from it.
