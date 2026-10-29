// The client pages' shared pieces in David's chosen look (frame D, see client-ui.css): how
// a lift's numbers are written, and the plates to load, drawn. The home page and the
// workout page both use them, so a lift reads the same on both.
import { BAR_KG, plateLayout, platesPerSide } from './home-utils.js';

const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);

/** Vietnamese decimals: 57,5. */
export const kg = (value) => String(Math.round(Number(value) * 100) / 100).replace('.', ',');

const WEEKDAY_NAMES = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

/** "Thứ Năm 29/10" for '2026-10-29'; '' for anything that is not a date. */
export function weekdayDate(iso) {
  const [y, m, d] = String(iso || '').split('-').map(Number);
  if (!y || !m || !d) return '';
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${WEEKDAY_NAMES[weekday]} ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
}

/** "3×5" from `liftSummary`; a fixed-total-reps lift is its total ("tổng 40", or "3 set · tổng 40" in full). */
export function liftSetsReps(lift, { full = false } = {}) {
  if (!lift) return '';
  if (lift.totalReps) return full ? `${lift.sets} set · tổng ${lift.totalReps}` : `tổng ${lift.totalReps}`;
  return lift.reps ? `${lift.sets}×${lift.reps}` : `${lift.sets} set`;
}

/** "57,5 kg", "từ 80 kg" for a reverse pyramid, "thân người", or "tự chọn mức tạ" when no load is set. */
export function liftLoadText(lift) {
  if (!lift) return '';
  if (lift.weight) return `${lift.pyramid ? 'từ ' : ''}${kg(lift.weight)} kg`;
  return lift.bodyweight ? 'thân người' : 'tự chọn mức tạ';
}

const PLATE_FILL = { 25: '#dd7a3b', 20: '#dd7a3b', 15: '#f5f1ea', 10: '#f5f1ea', 5: '#a3b0c8', 2.5: '#a3b0c8', 1.25: '#a3b0c8' };

/** The plates a side for a barbell lift, or null: not a barbell, or the plates cannot make the weight exactly. */
function barbellPlates(lift, exercise) {
  if (!lift?.weight || !(exercise?.equipmentTags || []).includes('barbell')) return null;
  return platesPerSide(lift.weight);
}

/** The plates to load for a barbell lift, drawn large on navy (the home page's first lift). */
export function plateFigure(lift, exercise) {
  const plates = barbellPlates(lift, exercise);
  if (!plates) return '';
  const W = 350; const H = 150; const mid = W / 2;
  const list = plates.map(kg).join(' + ');
  const label = plates.length ? `Lắp tạ cho ${kg(lift.weight)} kg: đòn ${BAR_KG} kg, mỗi bên ${list} kg` : `Chỉ đòn ${BAR_KG} kg, không lắp bánh`;
  const shapes = plateLayout(plates, { width: W, height: H })
    .map((plate) => `<rect x="${plate.x}" y="${plate.y}" width="${plate.w}" height="${plate.h}" rx="3" fill="${PLATE_FILL[plate.kg] || '#a3b0c8'}"></rect>`).join('');
  return `<figure class="cu-plates">
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeHtml(label)}">
      <rect x="6" y="${H / 2 - 7}" width="${W - 12}" height="14" rx="3" fill="#5d6f92"></rect>
      <rect x="${mid - 62}" y="${H / 2 - 4}" width="124" height="8" rx="2" fill="#8796b3"></rect>
      <rect x="${mid - 70}" y="${H / 2 - 14}" width="8" height="28" rx="2" fill="#a3b0c8"></rect>
      <rect x="${mid + 62}" y="${H / 2 - 14}" width="8" height="28" rx="2" fill="#a3b0c8"></rect>
      ${shapes}
    </svg>
    <figcaption>${plates.length ? `Mỗi bên lắp ${list} kg <span>· đòn ${BAR_KG} kg</span>` : `Chỉ cần đòn ${BAR_KG} kg <span>· không lắp bánh</span>`}</figcaption>
  </figure>`;
}

// Plate width and height in the small drawing, by weight.
const STRIP_SIZE = { 25: [7, 30], 20: [6, 28], 15: [6, 25], 10: [5, 21], 5: [4, 16], 2.5: [3, 12], 1.25: [3, 10] };

/** The same on one line, small, on a light card: one end of the bar and the plates on it,
 *  with the plates written out (the exercise being trained). */
export function plateStrip(lift, exercise) {
  const plates = barbellPlates(lift, exercise);
  if (!plates) return '';
  const H = 34; const collar = 22;
  let x = collar + 4;
  const shapes = plates.map((plate) => {
    const [w, h] = STRIP_SIZE[plate] || [3, 12];
    const rect = `<rect x="${x}" y="${(H - h) / 2}" width="${w}" height="${h}" rx="1.5" fill="${PLATE_FILL[plate] || '#a3b0c8'}" stroke="#14213d" stroke-width="1"></rect>`;
    x += w + 1;
    return rect;
  }).join('');
  const W = Math.max(54, x + 6);
  const list = plates.map(kg).join(' + ');
  return `<div class="cu-plate-strip">
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true">
      <rect x="0" y="${H / 2 - 2}" width="${W}" height="4" rx="2" fill="#8796b3"></rect>
      <rect x="${collar - 4}" y="${H / 2 - 7}" width="4" height="14" rx="1" fill="#5b6578"></rect>
      ${shapes}
    </svg>
    <span>${plates.length ? `<strong>Mỗi bên ${list} kg</strong> <span>· đòn ${BAR_KG}</span>` : `<strong>Chỉ cần đòn ${BAR_KG} kg</strong> <span>· không lắp bánh</span>`}</span>
  </div>`;
}
