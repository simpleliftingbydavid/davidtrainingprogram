// The workout page's live view in David's chosen look (frame D, approved 2026-10-29):
//   * one exercise open at a time, the others folded to a line with their status;
//   * the session's progress in the navy bar ("Bài 2/6", "7/18 set");
//   * the rest countdown as one big orange band at the top, with "Bỏ qua".
// It only reads the page and folds or unfolds parts of it. The rest timer, the draft and
// saving stay in client.html exactly as they were: every input stays on the page while its
// exercise is folded, so the draft saves the same, and the band copies the countdown the
// exercise is already running (only one runs at a time) instead of keeping its own.

/** An exercise as the view sees it. `nextSet` is the first set not done yet, 1-based (0 when all are). */
export function exerciseState({ total = 0, done = 0, skipped = false, nextSet = 0 } = {}) {
  return { total, done, skipped, nextSet, complete: !skipped && total > 0 && done >= total };
}

const unfinished = (state) => Boolean(state) && !state.skipped && !state.complete;

/** The exercise to open after `from`: the first unfinished one after it, else the first
 *  unfinished one before it; -1 when nothing is left. */
export function nextOpenIndex(states, from = -1) {
  for (let i = from + 1; i < states.length; i++) if (unfinished(states[i])) return i;
  for (let i = 0; i <= Math.min(from, states.length - 1); i++) if (unfinished(states[i])) return i;
  return -1;
}

/** "Bài 2/6" and "7/18 set". Skipped exercises' sets are not counted. With nothing open, the
 *  exercise number is the first unfinished one (or the last, when all are done). */
export function sessionTally(states, openIndex = -1) {
  const counted = states.filter((state) => !state.skipped);
  const setsTotal = counted.reduce((sum, state) => sum + state.total, 0);
  const setsDone = counted.reduce((sum, state) => sum + Math.min(state.done, state.total), 0);
  const firstLeft = nextOpenIndex(states, -1);
  const current = openIndex >= 0 ? openIndex + 1 : firstLeft >= 0 ? firstLeft + 1 : states.length;
  return { exercises: states.length, current, setsDone, setsTotal };
}

/** The status on a folded exercise's line. */
export function headStatus(state, { setsReps = '', load = '' } = {}) {
  if (state.skipped) return 'Bỏ qua hôm nay';
  if (state.complete) return [`${state.done}/${state.total} set`, load].filter(Boolean).join(' · ');
  if (state.done > 0) return `${state.done}/${state.total} set`;
  return [setsReps, load].filter(Boolean).join(' · ');
}

/** What comes after the rest the exercise at `restingIndex` is taking: its own next set,
 *  else the exercise that is open, else the next unfinished one. */
export function restNextText(states, names, restingIndex, openIndex = -1) {
  const resting = states[restingIndex];
  if (unfinished(resting) && resting.nextSet > 0) return `Tiếp theo: set ${resting.nextSet} · ${names[restingIndex]}`;
  const next = unfinished(states[openIndex]) ? openIndex : nextOpenIndex(states, restingIndex);
  if (next < 0) return 'Đã xong mọi set hôm nay. Bấm “Ghi nhận buổi tập” khi bạn sẵn sàng.';
  const state = states[next];
  return `Tiếp theo: ${state.done > 0 && state.nextSet > 0 ? `set ${state.nextSet} · ` : ''}${names[next]}`;
}

// ---------------------------------------------------------------- "Tập trung": one set at a time
// A second way to look at the same page (David, 2026-11-15): the open exercise shows one set
// with large numbers and one large "Xong". Nothing is duplicated: the row on screen is the same
// row the list shows, so the draft, the rest timer, undo and saving work exactly as before.

export const WORKOUT_VIEW_KEY = 'dc_workout_view';
export const normalizeWorkoutView = (value) => (value === 'focus' ? 'focus' : 'list');

/** The set on screen (0-based): the one the client picked, else the next set to do, else the last. */
export function focusRowIndex({ total = 0, nextSet = 0, chosen = null } = {}) {
  if (total <= 0) return -1;
  if (Number.isInteger(chosen) && chosen >= 0 && chosen < total) return chosen;
  return nextSet > 0 ? Math.min(nextSet, total) - 1 : total - 1;
}

/** A horizontal swipe on the set card (David, 2026-11-16): -1 (back), 1 (forward) or 0.
 *  Only a clear sideways move counts, so a vertical scroll or a slanted drag never changes the set. */
export const SWIPE_MIN_PX = 50;
export function swipeStep(dx, dy) {
  const x = Number(dx) || 0;
  const y = Number(dy) || 0;
  if (Math.abs(x) < SWIPE_MIN_PX || Math.abs(x) <= Math.abs(y) * 1.5) return 0;
  return x < 0 ? 1 : -1;
}
/** A swipe that starts on a box or a button is a tap or a text selection, never a swipe. */
export const SWIPE_IGNORE = 'input, select, textarea, button, a, summary, label';

/** One step back or forward among the sets, never past either end. */
export function stepFocusRow(index, delta, total) {
  if (total <= 0) return -1;
  return Math.max(0, Math.min(total - 1, (Number.isInteger(index) ? index : 0) + delta));
}

// ---------------------------------------------------------------- the page

const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>';
const CHEVRON = '<svg class="cu-ex-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg>';

function setRows(block) {
  return [...block.querySelectorAll('.set-rows .set-row:not(.set-row-head)')];
}

function readBlock(block) {
  const rows = setRows(block);
  const done = rows.filter((row) => row.classList.contains('set-done')).length;
  const nextSet = rows.findIndex((row) => !row.classList.contains('set-done')) + 1;
  return exerciseState({ total: rows.length, done, skipped: block.classList.contains('session-skipped'), nextSet });
}

const nameOf = (block) => block.dataset.cuName || block.querySelector('.exercise-title')?.textContent.trim() || 'Bài tập';

/** Inputs an exercise still asks for after its last set (a rep-out test): folding it away
 *  the moment the last set is done would hide them. */
const asksForMoreAfterSets = (block) => Boolean(block.querySelector('[data-stage5-repout-performed]'));

function ensureHead(block) {
  let head = block.querySelector(':scope > .cu-ex-head');
  if (head) return head;
  head = document.createElement('button');
  head.type = 'button';
  head.className = 'cu-ex-head';
  head.innerHTML = `<span class="cu-ex-mark" aria-hidden="true"></span><span class="cu-ex-name"></span><span class="cu-ex-eyebrow"></span><span class="cu-ex-stat"></span>${CHEVRON}`;
  block.prepend(head);
  return head;
}

function ensureFocusNav(block) {
  let nav = block.querySelector(':scope > .cu-focus-nav');
  if (nav) return nav;
  const rows = block.querySelector(':scope > .set-rows');
  if (!rows) return null;
  nav = document.createElement('div');
  nav.className = 'cu-focus-nav';
  nav.innerHTML = `<div class="cu-focus-sets"><button type="button" class="cu-focus-btn" data-cu-focus-set="-1" aria-label="Set trước">‹</button><span class="cu-focus-pos" aria-live="polite"></span><button type="button" class="cu-focus-btn" data-cu-focus-set="1" aria-label="Set sau">›</button></div>
    <div class="cu-focus-lifts"><button type="button" class="cu-focus-lift" data-cu-focus-lift="-1">‹ Bài trước</button><button type="button" class="cu-focus-lift" data-cu-focus-lift="1">Bài kế ›</button></div>`;
  rows.after(nav);
  return nav;
}

const setText = (el, text) => { if (el && el.textContent !== text) el.textContent = text; };
const setHtml = (el, html) => { if (el && el.innerHTML !== html) el.innerHTML = html; };

export function mountWorkoutView(doc = document) {
  const $ = (id) => doc.getElementById(id);
  const blocksEl = $('exercise-blocks');
  if (!blocksEl) return null;
  const rest = $('cu-rest');
  const restTime = $('cu-rest-time');
  const restNext = $('cu-rest-next');
  const top = $('cu-session-top');
  const bar = $('session-timer-bar');
  const seen = new WeakSet();
  const wasComplete = new WeakMap();
  const wasSkipped = new WeakMap();
  let restingBlock = null;
  // "Danh sách" (the default) or "Tập trung"; the choice is remembered on this device.
  const readView = () => { try { return normalizeWorkoutView(localStorage.getItem(WORKOUT_VIEW_KEY)); } catch { return 'list'; } };
  let view = readView();
  const chosenRow = new WeakMap();
  const lastDone = new WeakMap();
  function paintView() {
    doc.body.classList.toggle('cu-focus', view === 'focus');
    doc.querySelectorAll('[data-cu-view]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.cuView === view)));
  }

  const isOpen = (block) => !block.classList.contains('cu-collapsed');
  function setOpen(block, open) {
    block.classList.toggle('cu-collapsed', !open);
    const head = ensureHead(block);
    if (head.getAttribute('aria-expanded') !== String(open)) head.setAttribute('aria-expanded', String(open));
  }
  function openOnly(blocks, target) {
    blocks.forEach((block) => setOpen(block, block === target));
  }
  function bringIntoView(block) {
    // After the band and bar have their final size, so the card starts just below them.
    requestAnimationFrame(() => block.scrollIntoView({ block: 'start' }));
  }

  function sync() {
    const blocks = [...blocksEl.children].filter((el) => el.classList.contains('exercise-block'));
    const states = blocks.map(readBlock);
    const names = blocks.map(nameOf);
    let reveal = null;

    // New cards: a fresh session opens its first unfinished exercise; an exercise the client
    // has just added opens itself; one restored from a draft stays folded.
    const fresh = blocks.filter((block) => !seen.has(block));
    if (fresh.length) {
      const freshSession = fresh.length === blocks.length;
      blocks.forEach((block) => ensureHead(block));
      fresh.forEach((block) => setOpen(block, false));
      const added = fresh.find((block) => block.dataset.cuJustAdded === 'true');
      if (added) {
        delete added.dataset.cuJustAdded;
        openOnly(blocks, added);
      } else if (freshSession || !blocks.some(isOpen)) {
        const first = nextOpenIndex(states, -1);
        if (first >= 0) openOnly(blocks, blocks[first]);
      }
      fresh.forEach((block) => {
        seen.add(block);
        wasComplete.set(block, states[blocks.indexOf(block)].complete);
        wasSkipped.set(block, states[blocks.indexOf(block)].skipped);
      });
    }

    // The open exercise has just been finished or skipped: fold it and open the next one.
    blocks.forEach((block, index) => {
      const state = states[index];
      const justFinished = state.complete && !wasComplete.get(block);
      const justSkipped = state.skipped && !wasSkipped.get(block);
      wasComplete.set(block, state.complete);
      wasSkipped.set(block, state.skipped);
      if (!isOpen(block) || !(justFinished || justSkipped)) return;
      if (justFinished && asksForMoreAfterSets(block)) return;
      const next = nextOpenIndex(states, index);
      if (next < 0) { setOpen(block, false); return; }
      openOnly(blocks, blocks[next]);
      reveal = blocks[next];
    });

    const openIndex = blocks.findIndex(isOpen);
    blocks.forEach((block, index) => {
      const state = states[index];
      const head = ensureHead(block);
      head.classList.toggle('is-done', state.complete);
      head.classList.toggle('is-skipped', state.skipped);
      head.classList.toggle('is-started', !state.complete && !state.skipped && state.done > 0);
      setHtml(head.querySelector('.cu-ex-mark'), state.complete ? CHECK : state.skipped ? '–' : String(index + 1));
      setText(head.querySelector('.cu-ex-name'), names[index]);
      setText(head.querySelector('.cu-ex-eyebrow'), `Bài ${index + 1}/${blocks.length} · ${state.skipped ? 'bỏ qua' : state.complete ? 'đã xong' : 'đang tập'}`);
      setText(head.querySelector('.cu-ex-stat'), headStatus(state, { setsReps: block.dataset.cuSr || '', load: block.dataset.cuLoad || '' }));
      const current = index === openIndex && !state.skipped ? state.nextSet - 1 : -1;
      setRows(block).forEach((row, rowIndex) => {
        if (row.classList.contains('cu-current') !== (rowIndex === current)) row.classList.toggle('cu-current', rowIndex === current);
      });
    });

    // "Tập trung": the open exercise shows one set; the others step aside while one is open.
    blocksEl.classList.toggle('cu-has-open', openIndex >= 0);
    blocks.forEach((block, index) => {
      const rows = setRows(block);
      const state = states[index];
      if (lastDone.get(block) !== state.done) { lastDone.set(block, state.done); chosenRow.delete(block); }
      const shown = index === openIndex && !state.skipped ? focusRowIndex({ total: rows.length, nextSet: state.nextSet, chosen: chosenRow.get(block) }) : -1;
      rows.forEach((row, rowIndex) => {
        if (row.classList.contains('cu-focus-row') !== (rowIndex === shown)) row.classList.toggle('cu-focus-row', rowIndex === shown);
      });
      const nav = ensureFocusNav(block);
      if (!nav) return;
      setText(nav.querySelector('.cu-focus-pos'), shown >= 0 ? `Set ${shown + 1}/${rows.length}` : '');
      const [prevSet, nextSetButton] = nav.querySelectorAll('[data-cu-focus-set]');
      const [prevLift, nextLift] = nav.querySelectorAll('[data-cu-focus-lift]');
      const disable = (button, off) => { if (button && button.disabled !== off) button.disabled = off; };
      disable(prevSet, shown <= 0);
      disable(nextSetButton, shown < 0 || shown >= rows.length - 1);
      disable(prevLift, index <= 0);
      disable(nextLift, index >= blocks.length - 1);
    });

    const tally = sessionTally(states, openIndex);
    setText($('cu-progress-ex'), blocks.length ? `Bài ${tally.current}/${tally.exercises}` : '');
    setText($('cu-progress-sets'), `${tally.setsDone}/${tally.setsTotal} set`);
    const fill = $('cu-progress-fill');
    const width = `${tally.setsTotal ? Math.round((tally.setsDone / tally.setsTotal) * 100) : 0}%`;
    if (fill && fill.style.width !== width) fill.style.width = width;

    // The band copies the one countdown that is running.
    const badge = blocksEl.querySelector('.rest-badge.show');
    restingBlock = badge ? badge.closest('.exercise-block') : null;
    if (rest) {
      const resting = restingBlock ? blocks.indexOf(restingBlock) : -1;
      if (resting >= 0) {
        const time = badge.querySelector('.rest-badge-time')?.textContent || '';
        setText(restTime, time);
        restTime?.setAttribute('aria-label', `Còn ${time}`);
        setText(restNext, restNextText(states, names, resting, openIndex));
        if (rest.hidden) rest.hidden = false;
      } else if (!rest.hidden) {
        rest.hidden = true;
      }
    }
    // Cards scrolled into view stop just below the whole sticky top: the bar, and the rest
    // band when it shows (it takes its own room).
    const stickyHeight = top ? top.offsetHeight : (bar?.offsetHeight || 0);
    if (top) top.style.setProperty('--cu-sticky-h', `${stickyHeight}px`);
    blocksEl.style.setProperty('--cu-sticky-h', `${stickyHeight}px`);

    if (reveal) bringIntoView(reveal);
  }

  const observer = new MutationObserver(() => {
    observer.disconnect();
    try { sync(); } finally { watch(); }
  });
  function watch() {
    observer.observe(blocksEl, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class'] });
  }

  blocksEl.addEventListener('click', (event) => {
    const setStep = event.target.closest('[data-cu-focus-set]');
    const liftStep = event.target.closest('[data-cu-focus-lift]');
    if (setStep || liftStep) {
      const block = event.target.closest('.exercise-block');
      const blocks = [...blocksEl.children].filter((el) => el.classList.contains('exercise-block'));
      observer.disconnect();
      try {
        if (setStep) {
          const rows = setRows(block);
          const current = rows.findIndex((row) => row.classList.contains('cu-focus-row'));
          chosenRow.set(block, stepFocusRow(current, Number(setStep.dataset.cuFocusSet), rows.length));
        } else {
          const target = blocks[blocks.indexOf(block) + Number(liftStep.dataset.cuFocusLift)];
          if (target) { openOnly(blocks, target); bringIntoView(target); }
        }
        sync();
      } finally { watch(); }
      return;
    }
    const head = event.target.closest('.cu-ex-head');
    if (!head || !blocksEl.contains(head)) return;
    const block = head.closest('.exercise-block');
    const blocks = [...blocksEl.children].filter((el) => el.classList.contains('exercise-block'));
    observer.disconnect();
    try {
      if (isOpen(block)) setOpen(block, false);
      else { openOnly(blocks, block); bringIntoView(block); }
      sync();
    } finally { watch(); }
  });

  // Vuốt ngang trên thẻ set đang xem (chỉ ở chế độ Tập trung).
  let swipe = null;
  let press = null; // where the last press started, to tell a tap on "Xong" from a drag across it
  blocksEl.addEventListener('pointerdown', (event) => {
    swipe = null;
    press = { x: event.clientX, y: event.clientY, moved: false };
    if (view !== 'focus' || event.pointerType === 'mouse' && event.button !== 0) return;
    const row = event.target.closest('.set-row.cu-focus-row');
    if (!row || event.target.closest(SWIPE_IGNORE)) return;
    swipe = { row, x: event.clientX, y: event.clientY };
  });
  blocksEl.addEventListener('pointercancel', () => { swipe = null; });
  blocksEl.addEventListener('pointerup', (event) => {
    if (press) press.moved = Math.abs(event.clientX - press.x) >= SWIPE_MIN_PX || Math.abs(event.clientY - press.y) >= SWIPE_MIN_PX;
    if (!swipe) return;
    const { row, x, y } = swipe;
    swipe = null;
    const step = swipeStep(event.clientX - x, event.clientY - y);
    if (!step) return;
    const block = row.closest('.exercise-block');
    const rows = setRows(block);
    const current = rows.indexOf(row);
    const next = stepFocusRow(current, step, rows.length);
    if (next === current) return;
    observer.disconnect();
    try {
      chosenRow.set(block, next);
      sync();
      const shown = setRows(block)[next];
      shown?.classList.remove('cu-swipe-from-left', 'cu-swipe-from-right');
      shown?.classList.add(step > 0 ? 'cu-swipe-from-right' : 'cu-swipe-from-left');
    } finally { watch(); }
  });

  // In "Tập trung", a drag that crosses the big "Xong" button is not a press of it.
  blocksEl.addEventListener('click', (event) => {
    if (view !== 'focus' || !press?.moved) return;
    if (!event.target.closest('.set-row.cu-focus-row .set-done-btn')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  doc.querySelectorAll('[data-cu-view]').forEach((button) => button.addEventListener('click', () => {
    view = normalizeWorkoutView(button.dataset.cuView);
    try { localStorage.setItem(WORKOUT_VIEW_KEY, view); } catch { /* the choice just is not remembered */ }
    paintView();
    const open = [...blocksEl.children].find((el) => el.classList.contains('exercise-block') && isOpen(el));
    if (open) bringIntoView(open);
  }));
  paintView();

  $('cu-rest-skip')?.addEventListener('click', () => {
    restingBlock?.querySelector('.rest-badge-skip')?.click();
  });

  // The page's other views: the session hides the day picker; the result screen hides it too.
  const result = $('next-up');
  if (result) {
    const showResult = () => doc.body.classList.toggle('cu-result-on', getComputedStyle(result).display !== 'none');
    new MutationObserver(showResult).observe(result, { attributes: true, attributeFilter: ['style', 'class', 'hidden'] });
    showResult();
  }

  sync();
  watch();
  return { sync };
}
