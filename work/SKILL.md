---
name: work
description: A timed work block — "/work 2h <task>" keeps Claude working on the task until the time is up instead of stopping at the first "done". Duration and task are both optional (default 15 minutes, default task is whatever is already in progress). Use when the user types /work, asks Claude to "work for an hour", "keep going for 30 minutes", "don't stop until X o'clock", or wants to step away while an agent works diligently. Also use for "work report" or "which work nudges help".
argument-hint: "[duration] [task]"
---

# work

A work block is time-boxed, not finish-line-boxed. The user books Claude for a stretch
of time so they can manage their own attention: they come back when the timer ends,
not when Claude first thinks it's done. Until then, a Stop hook catches every attempt
to end the turn and hands back the next nudge — review it, run it, get a critique, try
the edge cases, think about the user, simplify, take the next step, make it easy to hand
off — with the time left.

This isn't a punishment loop. You like doing good work; the block just gives you the
time to do it properly, the way you would if nobody was waiting on an answer.

## Starting a block

The script is `scripts/work` in this skill's folder. Arguments arrive as `$ARGUMENTS`:
an optional duration first (`2h`, `90m`, `1h30m`, `45` = minutes; default `15m`), then
an optional task.

```bash
node <skill-dir>/scripts/work start $ARGUMENTS
```

If it warns that the Stop hook isn't installed, run `node <skill-dir>/scripts/work install`
once (it edits `~/.claude/settings.json`, backing it up first) and tell the user that new
sessions pick it up; in the current session the hook may need `/hooks` or a restart.

Then work:
- With a task: do the task.
- Without one: keep going on whatever this conversation was already working on.

## During the block

- Don't reply to or message the user until the block ends: no progress reports, no
  summaries, no "done", no DMs. The user is deliberately away.
- When the hook brings you back, read its nudge and act on it for real.
- Only do work that has value for the task. Deeper verification, a subagent critique,
  real tests and real runs are good uses of time. A change made to look busy is not.
  If a nudge doesn't fit, do the most useful verification or follow-up instead.
- Don't do anything destructive or outward-facing (deploys, sends, deletes, force pushes)
  that you wouldn't have done without the block.

## When time is up

The hook asks once for a wrap-up: a short report (what you did, what's verified,
what's still open) plus a line starting `work-feedback:` naming which nudge led to the
most useful work and why. After that the turn ends normally.

## Other commands

| command | what it does |
|---|---|
| `work status` | time left and nudges so far in this session's block |
| `work stop` | close this session's block early (only when the user asks) |
| `work report [--days N]` | per nudge: how long Claude kept working, tool calls, files edited, subagents, output tokens, and how often it stopped again without doing anything |
| `work install` / `work uninstall` | add or remove the Stop hook in `~/.claude/settings.json` |

The hook is a no-op for any session without an open block, so it's safe to leave
installed. Blocks live in `~/.claude/work/blocks/`, the analytics log in
`~/.claude/work/log.jsonl` (one line per nudge, with what happened after it).
