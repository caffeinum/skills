#!/usr/bin/env node
// cannibalize: resolve a claude code session for a folder and print a readable digest.
// usage: extract.mjs <folder> [name|uuid|uuid-prefix] [--tail N]
// read-only. never writes or deletes anything under ~/.claude.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { homedir } from "node:os";

const args = process.argv.slice(2);
let tail = 40;
const pos = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--tail") tail = Number(args[++i]);
  else pos.push(args[i]);
}
const [folderArg, sel] = pos;
if (!folderArg) die("usage: extract.mjs <folder> [session-name|uuid|prefix] [--tail N]");
const folder = resolve(folderArg.replace(/^~(?=\/|$)/, homedir()));
const home = homedir();
const projDir = join(home, ".claude", "projects", folder.replace(/[\/.]/g, "-"));
const sessDir = join(home, ".claude", "sessions");
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function die(msg) { console.error(msg); process.exit(1); }

function firstUserText(file) {
  for (const line of readFileSync(file, "utf8").split("\n")) {
    if (!line.includes('"type":"user"')) continue;
    let r; try { r = JSON.parse(line); } catch { continue; }
    if (r.type !== "user" || r.isMeta) continue;
    const t = contentText(r.message?.content);
    if (t && !t.startsWith("<")) return t.slice(0, 80).replace(/\s+/g, " ");
  }
  return "";
}
function contentText(c) {
  if (typeof c === "string") return c;
  if (Array.isArray(c)) return c.filter(p => p.type === "text").map(p => p.text).join("\n");
  return "";
}
function recordedCwd(file) {
  const fd = readFileSync(file, "utf8").slice(0, 200_000).split("\n");
  for (const line of fd) { const m = line.match(/"cwd":"([^"]+)"/); if (m) return m[1]; }
  return undefined;
}

// live session index: pid -> {name, cwd, sessionId, status}
const live = [];
if (existsSync(sessDir)) for (const f of readdirSync(sessDir)) {
  if (!f.endsWith(".json")) continue;
  try {
    const j = JSON.parse(readFileSync(join(sessDir, f), "utf8"));
    let alive = false; try { process.kill(j.pid, 0); alive = true; } catch (e) { alive = e.code === "EPERM"; }
    live.push({ ...j, alive });
  } catch {}
}

if (!existsSync(projDir)) die(`no claude project dir for ${folder}\n  expected ${projDir}\n  (has claude ever been run in that folder?)`);
const transcripts = readdirSync(projDir).filter(f => f.endsWith(".jsonl"))
  .map(f => ({ id: f.slice(0, -6), file: join(projDir, f), mtime: statSync(join(projDir, f)).mtimeMs, size: statSync(join(projDir, f)).size }))
  .sort((a, b) => b.mtime - a.mtime);
if (!transcripts.length) die(`no transcripts under ${projDir}`);

function listAvailable() {
  const lines = transcripts.slice(0, 15).map(t => {
    const l = live.find(s => s.sessionId === t.id);
    const nm = l?.name ? ` «${l.name}»${l.alive ? " (live pid " + l.pid + ")" : ""}` : "";
    return `  ${t.id}  ${new Date(t.mtime).toISOString().slice(0, 16)}  ${(t.size / 1024).toFixed(0)}KB${nm}  ${firstUserText(t.file)}`;
  });
  return `available in ${folder} (newest first${transcripts.length > 15 ? ", 15 of " + transcripts.length : ""}):\n${lines.join("\n")}`;
}

let chosen;
if (!sel) chosen = transcripts[0];
else if (UUID_RE.test(sel)) chosen = transcripts.find(t => t.id === sel);
else if (/^[0-9a-f-]{4,}$/.test(sel)) {
  const m = transcripts.filter(t => t.id.startsWith(sel));
  if (m.length > 1) die(`prefix "${sel}" is ambiguous:\n${m.map(t => "  " + t.id).join("\n")}`);
  chosen = m[0];
}
if (!chosen && sel) {
  const named = live.filter(s => s.name === sel && s.cwd === folder).sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  const hit = named.find(s => transcripts.some(t => t.id === s.sessionId));
  if (hit) chosen = transcripts.find(t => t.id === hit.sessionId);
  else if (named.length) die(`session "${sel}" is known (id ${named[0].sessionId}) but its transcript is not under ${projDir}`);
}
if (!chosen) die(`no session matching "${sel}" in ${folder}\n${listAvailable()}`);

const cwd = recordedCwd(chosen.file);
if (cwd && cwd !== folder) die(`transcript ${chosen.id} records cwd ${cwd}, not ${folder} (the project-dir encoding is lossy)\n${listAvailable()}`);
const liveEntry = live.find(s => s.sessionId === chosen.id);

// ---- digest ----
const blocks = [];
const toolUses = new Map();
for (const line of readFileSync(chosen.file, "utf8").split("\n")) {
  if (!line) continue;
  let r; try { r = JSON.parse(line); } catch { continue; }
  if (r.isSidechain) continue;
  if (r.type === "user") {
    const c = r.message?.content;
    if (Array.isArray(c)) {
      for (const p of c) {
        if (p.type === "tool_result") {
          const name = toolUses.get(p.tool_use_id);
          const err = p.is_error ? " ✗ " + contentText(p.content).slice(0, 120).replace(/\s+/g, " ") : "";
          if (err && blocks.length) blocks[blocks.length - 1] += err;
        } else if (p.type === "text" && !r.isMeta) blocks.push(`> ${p.text.trim()}`);
      }
    } else if (typeof c === "string" && !r.isMeta) blocks.push(`> ${c.trim()}`);
    else if (typeof c === "string" && r.isMeta && c.startsWith("<channel")) blocks.push(`> [mesh] ${c.replace(/<[^>]+>/g, "").trim().slice(0, 200)}`);
  } else if (r.type === "assistant") {
    for (const p of r.message?.content ?? []) {
      if (p.type === "text" && p.text.trim()) blocks.push(`● ${p.text.trim()}`);
      else if (p.type === "tool_use") {
        toolUses.set(p.id, p.name);
        blocks.push(`● ${p.name}(${mainArg(p.name, p.input)})`);
      }
    }
  }
}
function mainArg(name, input = {}) {
  const v = input.command ?? input.file_path ?? input.pattern ?? input.description ?? input.prompt ?? input.skill ?? input.to ?? input.url ?? Object.values(input)[0] ?? "";
  return String(v).replace(/\s+/g, " ").slice(0, 100);
}

console.log(`# cannibalized session`);
console.log(`session:    ${chosen.id}${liveEntry?.name ? `  «${liveEntry.name}»` : ""}`);
console.log(`transcript: ${chosen.file}`);
console.log(`cwd:        ${cwd ?? folder}`);
console.log(`last write: ${new Date(chosen.mtime).toISOString()}  size ${(chosen.size / 1024).toFixed(0)}KB  turns ${blocks.length}`);
if (liveEntry?.alive) console.log(`⚠ LIVE in another claude (pid ${liveEntry.pid}, status ${liveEntry.status}) — read-only here, don't touch its transcript`);
console.log(`showing last ${Math.min(tail, blocks.length)} of ${blocks.length} blocks (--tail N for more, or Read the transcript path)\n`);
console.log(blocks.slice(-tail).join("\n"));
