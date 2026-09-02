---
name: cannibalize
description: "Resume any other claude code session INSIDE the current one: /cannibalize <folder> [session-name-or-id] finds that folder's transcript (newest, by uuid/prefix, or by /rename name), digests it, and continues its work in this window. Use whenever the user says cannibalize, 'pull in that session', 'continue what the other claude was doing in <folder>', 'resume session X here', or wants a session from another folder/window carried on in this one."
tags: [sessions, resume, transcript]
---

# cannibalize

"resume any other session inside the current one." you don't switch windows — you eat the other session's context and keep going here.

## usage
`/cannibalize <folder> [session-name-or-id]`
- no second arg → newest transcript in that folder
- a uuid or uuid prefix → that transcript
- anything else → a session name (`claude --session-name` / `/rename`), resolved via `~/.claude/sessions`

## steps
1. run the extractor (node, no deps):
   ```
   node ~/.claude/skills/cannibalize/scripts/extract.mjs <folder> [name|id] [--tail N]
   ```
   default tail is 40 blocks. it prints a header (session id, transcript path, cwd, last write, live warning) then the digest: `>` user turns, `●` assistant text and tool calls as one-liners, tool-result blobs skipped, errors marked `✗`.
2. read the digest. if the tail doesn't show enough to know what the session was doing, rerun with a bigger `--tail`, or `Read` the transcript path from the header (with offset/limit — these files can be hundreds of MB).
3. if it fails, it fails loud and lists what IS in that folder (id · time · size · «name» · first prompt). pick one and rerun; don't guess.
4. continue the work in THIS session. first say, in one line, which session you cannibalized and what it was doing, then pick up its last open task where it left off. the folder in the header is where that work lives — cd/use absolute paths there.

## rules
- read-only. never write to, rename, or delete anything under `~/.claude/projects` or `~/.claude/sessions`. the transcript is someone's conversation.
- the session may be LIVE in another claude (the header says `⚠ LIVE … pid N`). that's fine — we only read. don't kill it, don't `--resume` it (two writers corrupt a transcript); just continue here.
- the project-dir encoding is lossy (`/` and `.` both become `-`), so the script verifies the transcript's recorded `cwd`. if it refuses on a cwd mismatch, believe it.

## storage facts (for when the script isn't enough)
- transcripts: `~/.claude/projects/<cwd with / and . → ->/<uuid>.jsonl`; records carry `cwd`, `type` (`user`/`assistant`), `isMeta` (mesh/hook noise), `isSidechain` (subagent turns).
- sessions index: `~/.claude/sessions/<pid>.json` = `{pid, sessionId, cwd, name, nameSource: "user"|"derived", status, updatedAt}`. EVERY session has a `name` — derived ones look like `<folder>-xx`; only `nameSource:"user"` is a real `/rename`. the file outlives the process; probe the pid to know if it's live.
