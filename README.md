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

---

## ownership

**Take over a project and run it, rather than being asked to do things in it.**
For when someone says "you own this" and then stops telling you what to work on.

```
/ownership [which parts of the stack]
```

It settles the arrangement first — **inferring before asking**, then one
question per message rather than a numbered list that gets a one-word reply:
what is yours to change without asking, what is theirs alone (money, accounts,
publishing under their name), how often the loop runs and why, who else is
working on it, and what would count as success *with a read date set in
advance*. The answers get written into a project-specific skill and a memory
file, so the arrangement survives a compaction.

Then it holds two disciplines that are easy to state and hard to keep.

**Reporting: silence is the default.** They handed it over so they would not
have to think about it. Answering a question is not reporting — volunteering
is, and so is closing the loop after they delegate something. A live security
finding, a broken deploy, "no action needed but" — none of those are
exceptions. The trap has a shape: they catch something you had not told them,
you conclude "escalate more", and you start sending notices, which is the
behaviour they asked you to stop.

**Verification: most of what goes wrong is a check that agreed with you.** A
pass means nothing without a negative control — run it against the known-bad
version and watch it fail first. Positive controls too, because "nothing got
through" also passes on a system that does nothing at all. A check that could
not run is UNVERIFIED, not a pass. An error is not a refusal: a 500, a 502 and
zero bytes all satisfy "it didn't work" while proving nothing about
enforcement. A check cannot see what it stands on, so watch the *client* as
well as the assertion — if every test drives the system as the trusted party,
an untrusted party is not a case you have, and therefore not a thing you can
fail.

And a failing check may simply be right. Loosening an assertion that fails a
good build is how instruments die; "it's an environment artifact" and "it must
be flaky" are the tells, because both explain a failure without examining it.
