// The places a student measures with a tape, as the "Cách lấy số đo vòng" guide describes them.
// One measuring day is one record holding any of these (a student rarely measures all nine at
// once). `waistCm` keeps its old name: it is the measurement at the navel, so every waist
// number recorded before the other sites existed stays part of the same series.
//
// The limits are repeated in firestore.rules (validBodyMeasurementValues); a test keeps the
// two lists the same. Pure: no DOM, no Firebase.

export const MEASURE_SITES = Object.freeze([
  { key: 'chestCm', label: 'Ngực / Lưng', group: 'Ngực / Lưng', min: 40, max: 250 },
  { key: 'armLeftCm', label: 'Tay trái', group: 'Tay', min: 10, max: 100 },
  { key: 'armRightCm', label: 'Tay phải', group: 'Tay', min: 10, max: 100 },
  { key: 'waistAboveCm', label: 'Trên rốn 5cm', group: 'Bụng', min: 30, max: 250 },
  { key: 'waistCm', label: 'Ngang rốn', group: 'Bụng', min: 30, max: 250 },
  { key: 'waistBelowCm', label: 'Dưới rốn 5cm', group: 'Bụng', min: 30, max: 250 },
  { key: 'hipsCm', label: 'Hông', group: 'Hông', min: 40, max: 250 },
  { key: 'thighLeftCm', label: 'Đùi trái', group: 'Chân', min: 20, max: 150 },
  { key: 'thighRightCm', label: 'Đùi phải', group: 'Chân', min: 20, max: 150 },
]);

export const MEASURE_KEYS = Object.freeze(MEASURE_SITES.map((site) => site.key));

/** The sites in the order the guide describes them, grouped: [{ group, sites: [...] }]. */
export function measureGroups() {
  const groups = [];
  for (const site of MEASURE_SITES) {
    let entry = groups.find((item) => item.group === site.group);
    if (!entry) { entry = { group: site.group, sites: [] }; groups.push(entry); }
    entry.sites.push(site);
  }
  return groups;
}

/**
 * Reads what was typed: blank sites are skipped, the rest must be a number within that site's
 * limits. Returns { values, error } where error is '' when everything usable is fine.
 */
export function cleanMeasurements(input = {}) {
  const values = {};
  for (const site of MEASURE_SITES) {
    const raw = input[site.key];
    if (raw === undefined || raw === null || String(raw).trim() === '') continue;
    const value = Number(String(raw).replace(',', '.'));
    if (!Number.isFinite(value) || value < site.min || value > site.max) {
      return { values: {}, error: `Nhập ${site.label.toLowerCase()} từ ${site.min} đến ${site.max} cm.` };
    }
    values[site.key] = Math.round(value * 10) / 10;
  }
  if (!Object.keys(values).length) return { values: {}, error: 'Nhập ít nhất một số đo.' };
  return { values, error: '' };
}
