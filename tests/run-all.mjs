// Runs every suite in this folder.  node tests/run-all.mjs
//
// Two things made "run the tests" harder than it should be, and both are
// handled here rather than left in a README nobody reads:
//
// 1. engine-harness, html-module-syntax, phase-template and session-save-emulator
//    load modules through node:vm, so they need --experimental-vm-modules. Run
//    without it they throw "vm.SourceTextModule is not a constructor", which
//    reads like a broken test rather than a missing flag. Every suite is spawned
//    with the flag, so it cannot be forgotten.
//
// 2. Three suites need the Firestore Emulator. Without it they fail on a
//    connection error that looks identical to a real regression. This probes the
//    emulator first and reports them as SKIP, with the command to start it, so a
//    green run is never confused with a run that silently tested less.
//
// The repository deliberately has no package.json — a root package.json would
// stop Vercel treating the app as a static site — so this is a plain script, and
// the emulator's own dependencies live outside the repository root.
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import net from 'node:net';

const here = dirname(fileURLToPath(import.meta.url));
const EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8085';
const NEEDS_EMULATOR = new Set([
  'firestore-rules.test.mjs', 'phase-template.test.mjs', 'session-save-emulator.test.mjs',
]);

/**
 * Every demo project id a suite names, read out of its own source.
 *
 * Scanned rather than listed here so a new emulator suite is wiped correctly
 * without anyone remembering to add it to this file.
 */
function projectIdsIn(source) {
  return [...new Set([...source.matchAll(/'(demo-[a-z0-9-]+)'/g)].map((match) => match[1]))];
}

/**
 * Wipe a project's documents before its suite runs.
 *
 * firestore-rules and phase-template share the project id demo-david-training-program
 * and both seed fixtures at fixed document paths, so whichever runs second finds
 * the first one's data already there and fails on a state it never created. They
 * passed the first time only because the emulator happened to be empty — exactly
 * the kind of green run that means nothing.
 */
async function clearProject(hostPort, projectId) {
  const url = `http://${hostPort}/emulator/v1/projects/${projectId}/databases/(default)/documents`;
  const response = await fetch(url, { method: 'DELETE' });
  if (!response.ok) throw new Error(`could not clear ${projectId}: HTTP ${response.status}`);
}

function emulatorReachable(hostPort) {
  const [host, port] = hostPort.split(':');
  return new Promise((resolve) => {
    const socket = net.connect({ host, port: Number(port) });
    const done = (result) => { socket.destroy(); resolve(result); };
    socket.setTimeout(1500);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
  });
}

const emulatorUp = await emulatorReachable(EMULATOR_HOST);
const files = readdirSync(here).filter((name) => name.endsWith('.test.mjs')).sort();

const passed = [];
const failed = [];
const skipped = [];

for (const file of files) {
  if (NEEDS_EMULATOR.has(file) && !emulatorUp) { skipped.push(file); continue; }
  if (NEEDS_EMULATOR.has(file)) {
    for (const projectId of projectIdsIn(readFileSync(join(here, file), 'utf8'))) {
      await clearProject(EMULATOR_HOST, projectId);
    }
  }
  const result = spawnSync(process.execPath, ['--experimental-vm-modules', join(here, file)], {
    encoding: 'utf8',
    env: { ...process.env, FIRESTORE_EMULATOR_HOST: EMULATOR_HOST },
  });
  const output = `${result.stdout || ''}${result.stderr || ''}`;
  if (result.status === 0) {
    // Suites print their own "NAME_OK n / n passed" line; echo just that.
    const summary = output.split(/\r?\n/).filter((line) => /_OK\s/.test(line)).pop();
    passed.push(file);
    console.log(`PASS  ${file}${summary ? `  —  ${summary.trim()}` : ''}`);
  } else {
    failed.push(file);
    console.log(`FAIL  ${file}`);
    console.log(output.split(/\r?\n/).filter((line) => !/ExperimentalWarning|trace-warnings/.test(line))
      .slice(-15).map((line) => `      ${line}`).join('\n'));
  }
}

console.log(`\n${passed.length} passed, ${failed.length} failed, ${skipped.length} skipped`);
if (skipped.length) {
  console.log(`\nSkipped — Firestore Emulator not reachable at ${EMULATOR_HOST}:`);
  skipped.forEach((file) => console.log(`  ${file}`));
  console.log('\nStart it from the tooling workspace outside this repository, then run again:');
  console.log('  cd ../.codex-tools/firebase-test');
  console.log('  PATH="$PWD/jre/jdk-21.0.12+8-jre/bin:$PATH" node node_modules/firebase-tools/lib/bin/firebase.js \\');
  console.log('    emulators:start --only firestore --project demo-david-training-program');
}
// A skipped suite is not a pass. Exit non-zero so a run that could not check the
// security rules can never be mistaken for a clean one in CI or a commit hook.
if (failed.length || skipped.length) process.exit(1);
