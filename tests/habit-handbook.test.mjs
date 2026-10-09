// Run with:  node tests/habit-handbook.test.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  HANDBOOK_INTRO, HANDBOOK_PARTS, HANDBOOK_STRUGGLES, handbookMarkup, handbookSections,
} from '../habit-handbook.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) {
    console.error(`FAIL ${name}\n  ${error.message}`);
    process.exitCode = 1;
  }
}

const everyText = JSON.stringify([HANDBOOK_INTRO, HANDBOOK_PARTS]);
const client = handbookMarkup({ forCoach: false });
const coach = handbookMarkup({ forCoach: true });

check('every section has a unique id and the parts run A to D', () => {
  const ids = handbookSections().map((section) => section.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.deepEqual(HANDBOOK_PARTS.map((part) => part.id), ['A', 'B', 'C', 'D']);
  assert.deepEqual(ids, ['intro', 'a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'b4', 'c1', 'c2', 'c3', 'd1', 'd3']);
});

check('every "I am struggling with" chip lands on a real section', () => {
  const ids = new Set(handbookSections().map((section) => section.id));
  assert.ok(HANDBOOK_STRUGGLES.length >= 5);
  for (const item of HANDBOOK_STRUGGLES) assert.ok(ids.has(item.target), `${item.label} → ${item.target}`);
});

check('the tools and promises that no longer apply are not in the text', () => {
  for (const banned of [/cronometer/i, /hevy/i, /worksheet/i, /photocopy/i, /chỉu/, /quyên góp/i, /hợp đồng thói quen/i, /phụ lục/i, /chữ ký/i]) {
    assert.doesNotMatch(everyText, banned, String(banned));
  }
});

check('the site is named where the handbook used to name other tools', () => {
  assert.match(everyText, /cập nhật trên David Coaching/);
  assert.match(everyText, /mở David Coaching ghi lại bữa trưa/);
  assert.match(everyText, /ghi bữa ăn trên David Coaching/);
});

check('the twenty principles are all there', () => {
  const d1 = handbookSections().find((section) => section.id === 'd1');
  const list = d1.blocks.find((block) => block.kind === 'ol');
  assert.equal(list.items.length, 20);
});

check('a client never sees the passages written for the coach', () => {
  for (const coachOnly of ['Ghi chú cho HLV', 'đừng vội đổi chương trình', 'Bài tập cho buổi onboarding', 'onboarding']) {
    assert.doesNotMatch(client, new RegExp(coachOnly));
    assert.match(coach, new RegExp(coachOnly));
  }
});

check('a client gets buttons to the tools, a coach does not', () => {
  assert.match(client, /data-goto="setup"/);
  assert.match(client, /data-goto="today"/);
  assert.doesNotMatch(coach, /data-goto/);
});

check('every button leads to a tab that exists', () => {
  const targets = [...client.matchAll(/data-goto="([^"]+)"/g)].map((match) => match[1]);
  assert.ok(targets.length > 0);
  for (const target of targets) assert.ok(['setup', 'today'].includes(target), target);
});

check('no markup can be smuggled in through the text', () => {
  assert.doesNotMatch(client, /<script|<img|onerror=/i);
  const tags = new Set([...client.matchAll(/<\/?([a-z0-9]+)/gi)].map((match) => match[1].toLowerCase()));
  for (const tag of tags) assert.ok(['div', 'span', 'h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'strong', 'button', 'details', 'summary', 'blockquote', 'cite', 'aside'].includes(tag), tag);
});

check('the page renders the handbook from this module', () => {
  const page = readFileSync(new URL('../habits.html', import.meta.url), 'utf8');
  assert.match(page, /import \{ handbookMarkup \} from '\.\/habit-handbook\.js'/);
  assert.match(page, /handbookMarkup\(\{ forCoach: state\.readOnly \}\)/);
});

console.log(`habit-handbook: ${passed} passed`);
