// Stop: keep the manager working while a failed check or unfinished task steps remain.
// Safety: only for the manager conversation recorded in STATE.md (MUDUR:), never on user cancel / limits,
// never while background work is pending, and at most MAX_FORCES times for the same reason.
import crypto from 'node:crypto';
import { readStdinJson, out, readJson, writeJson, removeFile, readText, FAILURE_FILE, GUARD_FILE, STATE_FILE, parseActiveTask } from './lib.mjs';

const MAX_FORCES = 3;
const input = await readStdinJson();
const allow = () => { out({}); process.exit(0); };

if (input.terminationReason && input.terminationReason !== 'NO_TOOL_CALL') allow();
if (input.fullyIdle === false) allow(); // subagents/background tasks will wake the agent

const active = parseActiveTask(readText(STATE_FILE));
const convId = String(input.conversationId || '');
if (!active.owner || !convId || active.owner !== convId) allow(); // not the manager chat (or no task owner)
if (active.isBlocked) allow();

const reasons = [];
const failure = readJson(FAILURE_FILE);
if (failure) {
  reasons.push(`Son kontrol başarısız: \`${failure.command}\` → ${failure.error}. Hatayı düzelt ve \`npm run check\` ile yeniden doğrula.`);
}
if (!active.isIdle && active.open.length) {
  reasons.push(`Aktif görev "${active.task}" bitmedi. Açık adımlar: ${active.open.slice(0, 6).join(' | ')}.`);
}

if (!reasons.length) { removeFile(GUARD_FILE); allow(); }

const key = crypto.createHash('sha1').update(convId + reasons.join('|')).digest('hex');
const guard = readJson(GUARD_FILE) || {};
const count = guard.key === key ? (guard.count || 0) + 1 : 1;

if (count > MAX_FORCES) {
  // Give up forcing; the agent must report to the user instead of looping and burning quota.
  allow();
}
writeJson(GUARD_FILE, { key, count, at: new Date().toISOString() });

out({
  decision: 'continue',
  reason: `[Otomatik devam ${count}/${MAX_FORCES}] ${reasons.join(' ')} ` +
    'AGENTS.md "Bitti tanımı"na göre işi tamamla ve STATE.md/BACKLOG.md\'yi güncelle. ' +
    'Gerçekten takıldıysan STATE.md\'de AKTIF_GOREV satırını "BLOKE: <neden>" yap ve kullanıcıya kısaca sor.'
});
