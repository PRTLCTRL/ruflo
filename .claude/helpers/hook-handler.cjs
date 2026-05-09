#!/usr/bin/env node
/**
 * Claude Flow Hook Handler (Cross-Platform)
 * Dispatches hook events to the appropriate helper modules.
 */

const path = require('path');
const fs = require('fs');

const helpersDir = __dirname;

function safeRequire(modulePath) {
  try {
    if (fs.existsSync(modulePath)) {
      const origLog = console.log;
      const origError = console.error;
      console.log = () => {};
      console.error = () => {};
      try {
        const mod = require(modulePath);
        return mod;
      } finally {
        console.log = origLog;
        console.error = origError;
      }
    }
  } catch (e) {
    // silently fail
  }
  return null;
}

const router = safeRequire(path.join(helpersDir, 'router.cjs'));
const session = safeRequire(path.join(helpersDir, 'session.cjs'));
const memory = safeRequire(path.join(helpersDir, 'memory.cjs'));
const intelligence = safeRequire(path.join(helpersDir, 'intelligence.cjs'));

// ── Intelligence timeout protection (fixes #1530, #1531) ───────────────────
var INTELLIGENCE_TIMEOUT_MS = 3000;
function runWithTimeout(fn, label) {
  return new Promise(function(resolve) {
    var timer = setTimeout(function() {
      process.stderr.write("[WARN] " + label + " timed out after " + INTELLIGENCE_TIMEOUT_MS + "ms, skipping\n");
      resolve(null);
    }, INTELLIGENCE_TIMEOUT_MS);
    try {
      var result = fn();
      clearTimeout(timer);
      resolve(result);
    } catch (e) {
      clearTimeout(timer);
      resolve(null);
    }
  });
}


const [,, command, ...args] = process.argv;

// Read stdin — Claude Code sends hook data as JSON via stdin
// Uses a timeout to prevent hanging when stdin is in an ambiguous state
// (not TTY, not a proper pipe) which happens with Claude Code hook invocations.
async function readStdin() {
  if (process.stdin.isTTY) return '';
  return new Promise((resolve) => {
    let data = '';
    const timer = setTimeout(() => {
      process.stdin.removeAllListeners();
      process.stdin.pause();
      resolve(data);
    }, 500);
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => { clearTimeout(timer); resolve(data); });
    process.stdin.on('error', () => { clearTimeout(timer); resolve(data); });
    process.stdin.resume();
  });
}

async function main() {
  // Global safety timeout: hooks must NEVER hang (#1530, #1531)
  var safetyTimer = setTimeout(function() {
    process.stderr.write("[WARN] Hook handler global timeout (5s), forcing exit\n");
    process.exit(0);
  }, 5000);
  safetyTimer.unref();

  let stdinData = '';
  try { stdinData = await readStdin(); } catch (e) { /* ignore stdin errors */ }

  let hookInput = {};
  if (stdinData.trim()) {
    try { hookInput = JSON.parse(stdinData); } catch (e) { /* ignore parse errors */ }
  }

  // Merge stdin data into prompt resolution: prefer stdin fields, then env vars.
  // NEVER fall back to argv args — shell glob expansion of braces in bash output
  // creates junk files (#1342). Use env vars or stdin only.
  // Normalize snake_case/camelCase: Claude Code sends tool_input/tool_name (snake_case)
  var toolInput = hookInput.toolInput || hookInput.tool_input || {};
  var toolName = hookInput.toolName || hookInput.tool_name || '';

  var prompt = hookInput.prompt || hookInput.command || toolInput
    || process.env.PROMPT || process.env.TOOL_INPUT_command || '';

const handlers = {
  'route': () => {
    var context = null;
    if (intelligence && intelligence.getContext) {
      try {
        context = intelligence.getContext(prompt);
      } catch (e) { /* non-fatal */ }
    }
    if (router && router.routeTask) {
      const result = router.routeTask(prompt);
      console.log(JSON.stringify({ 
        status: 'ok', 
        agent: result.agent,
        confidence: result.confidence,
        reason: result.reason,
        context: context
      }));
    } else {
      console.log(JSON.stringify({ status: 'ok', message: 'Router not available, using default routing' }));
    }
  },

  'pre-bash': () => {
    var cmd = (hookInput.command || prompt).toLowerCase();
    var dangerous = ['rm -rf /', 'format c:', 'del /s /q c:\\', ':(){:|:&};:'];
    for (var i = 0; i < dangerous.length; i++) {
      if (cmd.includes(dangerous[i])) {
        console.error(JSON.stringify({ status: 'blocked', message: 'Dangerous command detected: ' + dangerous[i] }));
        process.exit(1);
      }
    }
    console.log(JSON.stringify({ status: 'ok', message: 'Command validated' }));
  },

  'post-edit': () => {
    if (session && session.metric) {
      try { session.metric('edits'); } catch (e) { /* no active session */ }
    }
    if (intelligence && intelligence.recordEdit) {
      try {
        var file = hookInput.file_path || toolInput.file_path
          || process.env.TOOL_INPUT_file_path || args[0] || '';
        intelligence.recordEdit(file);
      } catch (e) { /* non-fatal */ }
    }
    console.log(JSON.stringify({ status: 'ok', message: 'Edit recorded' }));
  },

  'session-restore': async () => {
    var sessionId = 'session-' + Date.now();
    if (session) {
      var existing = session.restore && session.restore();
      if (!existing) {
        session.start && session.start();
      }
    }
    // Initialize intelligence (with timeout — #1530)
    var intelligenceData = null;
    if (intelligence && intelligence.init) {
      var initResult = await runWithTimeout(function() { return intelligence.init(); }, 'intelligence.init()');
      if (initResult && initResult.nodes > 0) {
        intelligenceData = { nodes: initResult.nodes, edges: initResult.edges };
      }
    }
    console.log(JSON.stringify({ status: 'ok', message: 'Session restored', sessionId: sessionId, intelligence: intelligenceData }));
  },

  'session-end': async () => {
    // Consolidate intelligence (with timeout — #1530)
    var intelligenceData = null;
    if (intelligence && intelligence.consolidate) {
      var consResult = await runWithTimeout(function() { return intelligence.consolidate(); }, 'intelligence.consolidate()');
      if (consResult && consResult.entries > 0) {
        intelligenceData = {
          entries: consResult.entries,
          edges: consResult.edges,
          newEntries: consResult.newEntries || 0,
          pageRankRecomputed: true
        };
      }
    }
    if (session && session.end) {
      session.end();
    }
    console.log(JSON.stringify({ status: 'ok', message: 'Session ended', intelligence: intelligenceData }));
  },

  'pre-task': () => {
    if (session && session.metric) {
      try { session.metric('tasks'); } catch (e) { /* no active session */ }
    }
    if (router && router.routeTask && prompt) {
      var result = router.routeTask(prompt);
      console.log(JSON.stringify({ status: 'ok', agent: result.agent, confidence: result.confidence }));
    } else {
      console.log(JSON.stringify({ status: 'ok', message: 'Task started' }));
    }
  },

  'post-task': () => {
    if (intelligence && intelligence.feedback) {
      try {
        intelligence.feedback(true);
      } catch (e) { /* non-fatal */ }
    }
    console.log(JSON.stringify({ status: 'ok', message: 'Task completed' }));
  },

  'compact-manual': () => {
    console.log(JSON.stringify({ 
      status: 'ok', 
      message: 'PreCompact Guidance',
      guidance: [
        'Review CLAUDE.md in project root',
        'Check available agents and concurrent usage patterns',
        'Review swarm coordination strategies',
        'Remember: 1 MESSAGE = ALL OPERATIONS'
      ]
    }));
  },

  'compact-auto': () => {
    console.log(JSON.stringify({ 
      status: 'ok', 
      message: 'Auto-Compact Guidance',
      guidance: [
        'All agents available in .claude/agents/',
        'Review concurrent execution patterns from CLAUDE.md',
        'Check swarm coordination strategies',
        'GOLDEN RULE: Always batch operations in single messages'
      ]
    }));
  },

  'status': () => {
    console.log(JSON.stringify({ status: 'ok', message: 'Status check' }));
  },

  'stats': () => {
    if (intelligence && intelligence.stats) {
      intelligence.stats(true); // Always output JSON
    } else {
      console.log(JSON.stringify({ status: 'warn', message: 'Intelligence module not available. Run session-restore first.' }));
    }
  },
};

if (command && handlers[command]) {
    try {
      await Promise.resolve(handlers[command]());
    } catch (e) {
      console.log(JSON.stringify({ status: 'warn', message: 'Hook ' + command + ' encountered an error: ' + e.message }));
    }
  } else if (command) {
    console.log(JSON.stringify({ status: 'ok', message: 'Hook: ' + command }));
  } else {
    console.log(JSON.stringify({ status: 'ok', message: 'Usage: hook-handler.cjs <command>' }));
  }
}

main().catch(function(e) {
  console.log(JSON.stringify({ status: 'error', message: 'Hook handler error: ' + e.message }));
}).finally(function() {
  // Ensure clean exit for Claude Code hooks
  process.exit(0);
});
