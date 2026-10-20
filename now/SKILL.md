---
name: now
description: A short status check on the current session — what got done, what is mid-flight, what is left. Use when the user types /now or just "now", or asks "where are we now", "what now", "where are we", "summarize so far", "what's done", "what's left", "status?", or wants a recap before stepping away, switching tasks or compacting.
---

# now

Review the conversation so far and give a concise summary:

1. **done** — what was accomplished this session (one line each)
2. **in progress** — anything mid-flight or partially done
3. **left** — remaining work or open threads

If the project has a task tracker you can query from the shell (`bd`, `gh issue`,
a `TASKS.md`, a `TODO` file), check its in-progress and open items too and fold the
relevant ones into the lists above. Skip this step when there is none — don't go
looking for one.

Only list what actually happened. If something was claimed but never verified, put it
under **in progress**, not **done**.

Keep it short. No fluff, no preamble, no closing offer.
