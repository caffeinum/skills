# skills

Claude Code skills.

## Install

Copy a skill folder into `~/.claude/skills/`:

```bash
git clone https://github.com/caffeinum/skills.git
cp -R skills/cannibalize ~/.claude/skills/
```

Claude Code picks it up on the next session.

---

## cannibalize

**Resume any other Claude Code session inside the current one.** You don't switch
windows — you read the other session's transcript and continue its work here.

```
/cannibalize <folder> [session-name-or-id]
```

| argument | resolves to |
|---|---|
| *(omitted)* | newest transcript in that folder |
| a uuid or uuid prefix | that transcript |
| anything else | a session name (`claude --session-name` / `/rename`) |

It digests the transcript rather than dumping it — user turns, assistant text and
tool calls as one-liners, tool-result blobs skipped, errors marked. Default tail
is 40 blocks; raise it with `--tail N` when the tail isn't enough to tell what the
session was doing.

**It is strictly read-only.** It never writes to, renames, or deletes anything
under `~/.claude/projects` or `~/.claude/sessions` — those are real conversations.
If the target session is still live in another window it says so and reads anyway;
it will not `--resume` it, because two writers corrupt a transcript.

Failure is loud: if it can't resolve what you asked for, it lists what *is* in the
folder (id · time · size · name · first prompt) so you can pick, rather than
guessing and silently reading the wrong session.

Requires `node` (no dependencies).
