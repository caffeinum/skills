---
name: echo-writer
description: Draft or rewrite user-facing text through Echo (echo.fulcrum.inc), a writing model that writes as a chosen author. The default persona is Julia Evans, the voice picked for vibeOS. Use this whenever the user wants copy written or reworded in a house voice, such as landing pages, UI strings, buttons, error messages, onboarding, emails, launch posts, articles, video scripts or hooks, or asks to "run it through Echo", "use the writer", "in our voice" or "as <author>", or wants to compare how different writers would phrase the same thing. Not for code comments, commit messages or text read by models (tool descriptions, prompts).
---

# echo-writer

Echo is a writing model behind an OpenAI-compatible API that takes a `persona`: the
name of a writer to write as. **Echo is the writer, not you.** Your whole job is to
prompt it well and hand back its output, verbatim, as the prose that was asked for.

Never edit, polish, trim or "fact-fix" what Echo returns. If the output is wrong
(a lost fact, an invented claim, the wrong length or format), fix the **prompt** and
run it again.

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

If Echo is unreachable, say so and stop. Don't write the text yourself instead.

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

The prompt is the only lever you have, so put the work there. Every prompt carries:

1. **The facts it may use, and that it may add none.** For example: "vibeOS is a desktop
   in a browser tab; a real Linux machine runs in WebAssembly; the desktop works
   without an agent." Give it the real source material (notes, bullet points, the old
   draft), not your own rewrite of it.
2. **The constraints:** the length, the format ("return three numbered lines", "return
   only JSON with the same keys"), what must survive byte for byte (names,
   `{placeholders}`, links, code, numbers), and the casing and punctuation you want.
3. **The text or the ask**, labelled, with a hint of where it appears ("button", "error
   under the email field", "X article", "boot screen hint").

For a batch of UI strings, send one JSON object of `id → string` and ask for the same
keys back. It keeps context across strings and makes applying the result mechanical.

## Returning the output

Hand back exactly what Echo returned. When it misses, re-prompt with the miss named:

- **It added a claim or number:** list the allowed facts more tightly and repeat "add
  no facts, claims or numbers".
- **It dropped a fact or a limit:** name it in the prompt as something that must stay.
- **Wrong casing, `--` dashes, drifted into first person:** state the casing,
  punctuation and person you want.
- **Structure drifted** (headings, links, code blocks): say they must stay as they
  are. A script can compare links, numbers and heading counts before and after, so
  you know when to re-run.

If text is asserted by tests (e2e suites grepping for a string), grep for it before
applying Echo's output. Then either change the test in the same commit or leave that
string out of the request.

## Choosing or comparing writers

To help someone pick a voice, run the same 3 real strings through 5-7 personas in
parallel and show them side by side with a one-line recommendation. Mix product voices
and essayists: Julia Evans, E. B. White, Jason Fried, Paul Graham, Ursula K. Le Guin,
Kurt Vonnegut, a house style such as "Apple copywriter".

## Picked voices

| Project | Persona | Decided |
|---|---|---|
| vibeOS (vibeos.sh) | Julia Evans | aleks, 2026-10-03, for the landing page and the app |

Add a row when a project settles on a voice, so the next run starts from it.
