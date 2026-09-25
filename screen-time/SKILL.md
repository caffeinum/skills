---
name: screen-time
description: A daily time limit for Claude Code — once today's limit is used up, Claude still runs but only replies that the limit was reached. Use when the user wants to set up, check, change, extend or remove their Claude screen-time limit, asks "how much Claude time do I have left", or says they're spending too much time in Claude.
---

# screen-time

Screen Time for Claude. Pick a daily limit; once you've used it, every Claude Code
session still starts and answers — but the only answer is that today's limit was
reached. Nothing is blocked or disabled, so you can always extend if you really need to.

## Commands

The script is `scripts/screen-time` in this skill's folder. Run it with the user's
consent; `install` and `uninstall` edit their global `~/.claude/settings.json`.

| command | what it does |
|---|---|
| `screen-time install` | adds the hook to `~/.claude/settings.json` (backs it up first), creates the config. New sessions pick it up. |
| `screen-time status` | today's minutes used vs the limit, and whether the hook is installed |
| `screen-time set <min>` | set the daily limit (default 180) |
| `screen-time extend <min>` | add minutes for today only |
| `screen-time uninstall` | removes the hook; usage history stays |

To set it up: `install`, then `set <minutes>` with the limit the user wants.

## How it works

- A `UserPromptSubmit` hook runs on every prompt.
- **Time counted:** the gap between two prompts counts as active time, unless it's longer
  than the idle gap (10 min by default) — so walking away doesn't eat your budget.
  One counter per day across all sessions (local midnight resets it).
- **At the limit** the hook tells Claude not to do the task and to reply only that the
  limit was reached. Prompts that mention `screen-time` / `screen time` still go through,
  so you can ask Claude to check or extend.
- **Agents aren't you.** Sessions with any variable in `exempt_env` set (default
  `COTAL_AGENT_FILE`, i.e. paw/cotal mesh agents) are neither counted nor limited.
- A hook error never blocks Claude — it's logged to stderr and the prompt goes through.

## Files

`~/.claude/screen-time/config.json` — `daily_minutes`, `idle_gap_minutes`, `exempt_env`.
`~/.claude/screen-time/usage-YYYY-MM-DD.json` — one file per day.
