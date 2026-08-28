import {
  createExerciseNote, listExerciseNotesForExercise,
} from './training-data.js';
import {
  MAX_EXERCISE_NOTE_LENGTH, NOTE_VISIBILITY, normalizeExerciseNoteText,
  splitExerciseNotesBySession,
} from './exercise-feedback-utils.js';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));
}

function noteDate(value) {
  const date = value?.toDate ? value.toDate() : value instanceof Date ? value : null;
  return date ? date.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : 'Vừa xong';
}

function ensureDialog() {
  let dialog = document.getElementById('exercise-notes-dialog');
  if (dialog) return dialog;
  dialog = document.createElement('dialog');
  dialog.id = 'exercise-notes-dialog';
  dialog.className = 'exercise-notes-dialog';
  dialog.innerHTML = `
    <div class="exercise-notes-shell">
      <div class="exercise-notes-head">
        <div><span class="eyebrow">NHẬT KÝ BÀI TẬP</span><h3 id="exercise-notes-title"></h3><p id="exercise-notes-context" class="small-note"></p></div>
        <button type="button" class="exercise-notes-close" aria-label="Đóng">×</button>
      </div>
      <div id="exercise-notes-current" class="exercise-notes-list"></div>
      <details id="exercise-notes-history-wrap" class="exercise-notes-history">
        <summary>Xem lịch sử của bài tập này</summary>
        <div id="exercise-notes-history" class="exercise-notes-list"></div>
      </details>
      <form id="exercise-notes-form" class="exercise-notes-form">
        <p id="exercise-notes-replying" class="exercise-notes-replying" hidden></p>
        <label for="exercise-notes-text">Điều bạn muốn ghi lại</label>
        <textarea id="exercise-notes-text" maxlength="${MAX_EXERCISE_NOTE_LENGTH}" rows="4" placeholder="Cảm nhận kỹ thuật, điểm còn vướng hoặc điều cần điều chỉnh lần sau…" required></textarea>
        <div id="exercise-notes-visibility-wrap" class="exercise-notes-visibility" hidden>
          <label for="exercise-notes-visibility">Ai có thể xem</label>
          <select id="exercise-notes-visibility"><option value="shared">Chia sẻ với học viên</option><option value="private">Riêng tư — chỉ David</option></select>
        </div>
        <p id="exercise-notes-audience" class="small-note"></p>
        <div class="exercise-notes-actions"><button type="button" id="exercise-notes-cancel-reply" class="btn btn-outline" hidden>Hủy phản hồi</button><button type="submit" class="btn btn-primary" id="exercise-notes-submit">Gửi ghi chú</button></div>
      </form>
      <p id="exercise-notes-status" class="small-note" role="status" aria-live="polite"></p>
    </div>`;
  document.body.appendChild(dialog);
  return dialog;
}

function noteMarkup(note, role, focusNoteId) {
  const isCoach = note.authorRole === 'coach';
  const privateLabel = note.visibility === NOTE_VISIBILITY.PRIVATE ? '<span class="exercise-note-private">Riêng tư</span>' : '';
  const replyLabel = note.replyToNoteId ? '<span class="exercise-note-reply-label">Phản hồi</span>' : '';
  const replyButton = role === 'coach' && note.authorRole === 'student'
    ? `<button type="button" class="exercise-note-reply" data-reply-note="${escapeHtml(note.id)}" data-reply-name="${escapeHtml(note.authorName || 'học viên')}">Phản hồi</button>` : '';
  return `<article class="exercise-note-entry${note.id === focusNoteId ? ' focus' : ''}${note.replyToNoteId ? ' reply' : ''}" data-note-id="${escapeHtml(note.id)}">
    <div class="exercise-note-meta"><strong>${isCoach ? 'David' : escapeHtml(note.authorName || 'Học viên')}</strong><span>${noteDate(note.createdAt)}</span>${privateLabel}${replyLabel}</div>
    <p>${escapeHtml(note.body)}</p>${replyButton}
  </article>`;
}

export function createExerciseNotesController({ role, authorUid, authorName = '', getStudentUid, onSaved = () => {} }) {
  const dialog = ensureDialog();
  const title = dialog.querySelector('#exercise-notes-title');
  const contextLabel = dialog.querySelector('#exercise-notes-context');
  const currentRoot = dialog.querySelector('#exercise-notes-current');
  const historyRoot = dialog.querySelector('#exercise-notes-history');
  const historyWrap = dialog.querySelector('#exercise-notes-history-wrap');
  const form = dialog.querySelector('#exercise-notes-form');
  const text = dialog.querySelector('#exercise-notes-text');
  const visibilityWrap = dialog.querySelector('#exercise-notes-visibility-wrap');
  const visibility = dialog.querySelector('#exercise-notes-visibility');
  const audience = dialog.querySelector('#exercise-notes-audience');
  const status = dialog.querySelector('#exercise-notes-status');
  const submit = dialog.querySelector('#exercise-notes-submit');
  const replying = dialog.querySelector('#exercise-notes-replying');
  const cancelReply = dialog.querySelector('#exercise-notes-cancel-reply');
  let activeContext = null;
  let replyToNoteId = '';
  let saving = false;

  visibilityWrap.hidden = role !== 'coach';
  audience.textContent = role === 'coach'
    ? 'Ghi chú chia sẻ chỉ hiện với đúng học viên này. Ghi chú riêng tư chỉ David nhìn thấy.'
    : 'Feedback này chỉ được chia sẻ với David, không hiển thị cho học viên khác.';

  function resetReply() {
    replyToNoteId = '';
    replying.hidden = true;
    cancelReply.hidden = true;
  }

  async function refresh() {
    if (!activeContext) return;
    status.textContent = 'Đang tải nhật ký…';
    try {
      const notes = await listExerciseNotesForExercise(getStudentUid(), activeContext.exerciseId, { sharedOnly: role !== 'coach' });
      const split = splitExerciseNotesBySession(notes, activeContext.sessionId);
      currentRoot.innerHTML = split.current.length
        ? split.current.map((note) => noteMarkup(note, role, activeContext.focusNoteId)).join('')
        : '<p class="exercise-notes-empty">Chưa có ghi chú nào trong buổi này.</p>';
      historyRoot.innerHTML = split.previous.length
        ? split.previous.map((note) => noteMarkup(note, role, activeContext.focusNoteId)).join('')
        : '<p class="exercise-notes-empty">Chưa có ghi chú từ các buổi trước.</p>';
      historyWrap.hidden = split.previous.length === 0;
      status.textContent = '';
      const focused = dialog.querySelector('.exercise-note-entry.focus');
      if (focused) focused.scrollIntoView({ block: 'center' });
    } catch (error) {
      console.error(error);
      status.textContent = 'Chưa thể tải ghi chú. Kiểm tra kết nối rồi thử lại.';
    }
  }

  dialog.addEventListener('click', (event) => {
    const replyButton = event.target.closest('[data-reply-note]');
    if (replyButton) {
      replyToNoteId = replyButton.dataset.replyNote;
      replying.textContent = `Đang phản hồi ${replyButton.dataset.replyName}`;
      replying.hidden = false;
      cancelReply.hidden = false;
      visibility.value = NOTE_VISIBILITY.SHARED;
      visibility.disabled = true;
      text.focus();
    }
  });
  cancelReply.addEventListener('click', () => { visibility.disabled = false; resetReply(); });
  dialog.querySelector('.exercise-notes-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { form.reset(); visibility.disabled = false; resetReply(); status.textContent = ''; });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!activeContext || saving) return;
    const body = normalizeExerciseNoteText(text.value);
    if (!body) { status.textContent = 'Hãy nhập nội dung trước khi gửi.'; return; }
    saving = true; submit.disabled = true; submit.textContent = 'Đang gửi…'; status.textContent = '';
    try {
      const note = await createExerciseNote(getStudentUid(), {
        ...activeContext,
        authorUid,
        authorRole: role,
        authorName,
        visibility: replyToNoteId ? NOTE_VISIBILITY.SHARED : visibility.value,
        replyToNoteId,
        body,
      });
      text.value = '';
      visibility.disabled = false;
      resetReply();
      status.textContent = role === 'student' ? 'Đã gửi feedback cho David.' : 'Đã lưu ghi chú.';
      activeContext.focusNoteId = note.id;
      await refresh();
      onSaved(note);
    } catch (error) {
      console.error(error);
      status.textContent = `Chưa thể gửi ghi chú: ${error.message}`;
    } finally {
      saving = false; submit.disabled = false; submit.textContent = role === 'student' ? 'Gửi cho David' : 'Lưu ghi chú';
    }
  });

  return {
    async open(context) {
      activeContext = { ...context };
      title.textContent = context.exerciseName || 'Bài tập';
      contextLabel.textContent = context.sessionLabel ? `Buổi ${context.sessionLabel}` : 'Nhật ký riêng của bài tập';
      submit.textContent = role === 'student' ? 'Gửi cho David' : 'Lưu ghi chú';
      if (!dialog.open) dialog.showModal();
      await refresh();
      text.focus();
    },
    refresh,
  };
}
