// Run with:  node tests/working-copy-current.test.mjs
//
// Fails when this folder is BEHIND origin/main — that is, when GitHub has
// commits this working copy has never seen.
//
// This exists because of a live outage on 2026-09-28. This folder had drifted
// 21 commits behind origin/main. A file was edited here, uploaded whole, and
// the upload silently replaced a newer training-data.js with an older copy
// missing eleven exports that coach.html and client.html import. An ES import
// of a missing export fails at link time, so both pages died on their loading
// screen for every user, and every test still passed — because the tests were
// reading the same stale folder.
//
// Deliberately one-directional. Being AHEAD of origin/main is the normal state
// of doing work, and failing on that would make this noise to be ignored.
// Being BEHIND is the state in which uploading a file destroys someone's work.
//
// Skips rather than fails when the remote cannot be reached: offline is not a
// reason to block, and a check that cries wolf on a train gets deleted.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// fileURLToPath, not URL.pathname: on Windows the latter yields
// "/G:/Claude%20Code/..." — a leading slash and a percent-encoded space — and
// git is then spawned with a directory that does not exist. The first version
// of this file did exactly that, and the catch below reported it as "offline".
const root = fileURLToPath(new URL('../', import.meta.url));
const git = (args) => execFileSync('git', args, {
  cwd: root, encoding: 'utf8', env: { ...process.env, MSYS_NO_PATHCONV: '1' },
}).trim();

// Prove git works here before treating anything as a network problem. Without
// this, the skip below swallows every local misconfiguration and the check
// reports success while having checked nothing — which is worse than no check,
// because it is trusted.
git(['rev-parse', '--git-dir']);

try {
  git(['fetch', 'origin', 'main']);
} catch (error) {
  console.log(`WORKING_COPY_SKIPPED — không kết nối được GitHub (${String(error.message).split('\n')[0]})`);
  process.exit(0);
}

const behind = Number(git(['rev-list', '--count', 'HEAD..origin/main']));
const ahead = Number(git(['rev-list', '--count', 'origin/main..HEAD']));

assert.equal(behind, 0, `\n  Thư mục này đang chậm hơn GitHub ${behind} commit.\n`
  + '  Đừng upload file nào từ đây: bản trên GitHub mới hơn, upload sẽ xoá mất phần mới.\n'
  + '  Chạy: git fetch origin main && git reset --hard origin/main\n');

console.log(`WORKING_COPY_CURRENT_OK — ngang GitHub${ahead ? ` (đang có thêm ${ahead} commit chưa đẩy)` : ''}`);
