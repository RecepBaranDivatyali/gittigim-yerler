// Shared helpers for Gezgin agent hooks. Never throws: hooks must always print valid JSON.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const AGENTS_DIR = path.resolve(here, '..');
export const ROOT = path.resolve(AGENTS_DIR, '..');
export const RUNTIME_DIR = path.join(AGENTS_DIR, '.runtime');
export const FAILURE_FILE = path.join(RUNTIME_DIR, 'last_failure.json');
export const GUARD_FILE = path.join(RUNTIME_DIR, 'stop_guard.json');
export const STATE_FILE = path.join(ROOT, 'STATE.md');

export async function readStdinJson() {
  try {
    const chunks = [];
    for await (const c of process.stdin) chunks.push(c);
    const raw = Buffer.concat(chunks).toString('utf8').trim();
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function out(obj) {
  process.stdout.write(JSON.stringify(obj || {}));
}

export function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

export function writeJson(file, data) {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch {}
}

export function removeFile(file) {
  try { fs.unlinkSync(file); } catch {}
}

export function readText(file) {
  try { return fs.readFileSync(file, 'utf8'); } catch { return ''; }
}

/** Parses the "## Aktif Görev" section of STATE.md. */
export function parseActiveTask(stateText) {
  const m = stateText.match(/##\s*Aktif G[öo]rev\s*\n([\s\S]*?)(?=\n##\s|$)/i);
  const section = m ? m[1] : '';
  const task = (section.match(/AKTIF_GOREV:\s*(.*)/i)?.[1] || '').trim();
  const owner = (section.match(/MUDUR:\s*(.*)/i)?.[1] || '').trim();
  const open = [...section.matchAll(/^\s*-\s*\[\s\]\s*(.+)$/gm)].map(x => x[1].trim());
  const isIdle = !task || /^yok$/i.test(task);
  const isBlocked = /^BLOKE/i.test(task);
  const isWaiting = /BEKL[EİI]/i.test(task);
  return { task, owner, open, isIdle, isBlocked, isWaiting };
}
