// PostToolUse(run_command): remember failed build/lint/test commands; clear the record when they pass again.
import { readStdinJson, out, writeJson, removeFile, FAILURE_FILE } from './lib.mjs';

const input = await readStdinJson();
const cmd = String(input?.toolCall?.args?.CommandLine || '');
const CHECK_RE = /npm\s+run\s+(check|build|lint|test)|npx\s+eslint|vite\s+build|gradlew(\.bat)?\s+\w*(assemble|bundle|build)/i;

if (CHECK_RE.test(cmd)) {
  if (input.error) {
    writeJson(FAILURE_FILE, {
      command: cmd.slice(0, 300),
      error: String(input.error).slice(0, 500),
      conversationId: input.conversationId || '',
      at: new Date().toISOString()
    });
  } else {
    removeFile(FAILURE_FILE);
  }
}
out({});
