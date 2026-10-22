// SessionStart: inject a compact STATE.md summary so a fresh chat resumes where the last one left off.
import { readStdinJson, out, readText, readJson, STATE_FILE, FAILURE_FILE, parseActiveTask } from './lib.mjs';

await readStdinJson();
const state = readText(STATE_FILE);
if (!state) { out({}); process.exit(0); }

const pick = (title, maxLines) => {
  const m = state.match(new RegExp(`##\\s*${title}[^\\n]*\\n([\\s\\S]*?)(?=\\n##\\s|$)`, 'i'));
  return m ? m[1].trim().split('\n').slice(0, maxLines).join('\n') : '';
};

const active = parseActiveTask(state);
const failure = readJson(FAILURE_FILE);
const parts = [
  'GEZGIN PROJE DURUMU (STATE.md özeti — kurallar AGENTS.md, yapılacaklar BACKLOG.md):',
  pick('Özet', 6),
  active.isIdle ? 'Aktif görev: yok.' : `Aktif görev: ${active.task}${active.open.length ? `\nAçık adımlar:\n- ${active.open.slice(0, 8).join('\n- ')}` : ''}`,
  pick('Bilinen Sorunlar', 5),
  failure ? `UYARI: Son kontrol başarısızdı → ${failure.command} (${failure.at})` : ''
].filter(Boolean);

out({ injectSteps: [{ systemMessage: { systemMessage: parts.join('\n\n').slice(0, 2500) } }] });
