// David, 2026-11-18: Weighted Back Extension thuộc Lưng (1 set), Đùi sau & Mông 0,5 set — cho bài mới
// gán, giáo án đã gán và lịch sử đã ghi (không sửa dữ liệu đã lưu). Bản David tự chỉnh tay giữ nguyên.
//   node tests/back-extension-volume.test.mjs
import assert from 'node:assert/strict';
import { defaultVolumeCredits, normalizeVolumeCredits, plannedVolumeByMuscle, actualVolumeByMuscle, volumeNoteFor } from '../volume-engine.js';
import { EXERCISES, getExerciseById } from '../exercise-seed-data.js';
import { setLang } from '../i18n.js';

let passed = 0;
function check(name, fn) {
  try { fn(); passed++; } catch (error) { console.error(`FAIL ${name}\n  ${error.message}`); process.exitCode = 1; }
}
const ex = getExerciseById('weighted_back_extension');
const NEW = [{ muscleGroup: 'Lưng', credit: 1 }, { muscleGroup: 'Đùi sau & Mông', credit: 0.5 }];
const sort = (list) => [...list].sort((a, b) => a.muscleGroup.localeCompare(b.muscleGroup));

check('library: the exercise is a Back exercise, Back 1 + Hamstrings & glutes 0.5', () => {
  assert.equal(ex.muscleGroup, 'Lưng');
  assert.deepEqual(sort(defaultVolumeCredits(ex)), sort(NEW));
  assert.deepEqual(sort(normalizeVolumeCredits(null, ex)), sort(NEW));
});

check('a programme assigned before (old default copy) counts the new way', () => {
  assert.deepEqual(sort(normalizeVolumeCredits([{ muscleGroup: 'Đùi sau & Mông', credit: 1 }], ex)), sort(NEW));
});

check("David's own hand-set credits are kept", () => {
  const own = [{ muscleGroup: 'Đùi sau & Mông', credit: 1 }, { muscleGroup: 'Lưng', credit: 0.5 }];
  assert.deepEqual(sort(normalizeVolumeCredits(own, ex)), sort(own));
  assert.deepEqual(normalizeVolumeCredits([{ muscleGroup: 'Lưng', credit: 0.5 }], ex), [{ muscleGroup: 'Lưng', credit: 0.5 }]);
});

check('other exercises are unchanged (leg curl, deadlift)', () => {
  const curl = EXERCISES.find((item) => item.movementPattern === 'isolation_hip' && item.exerciseId !== 'weighted_back_extension');
  assert.deepEqual(normalizeVolumeCredits([{ muscleGroup: 'Đùi sau & Mông', credit: 1 }], curl), [{ muscleGroup: 'Đùi sau & Mông', credit: 1 }]);
  const dl = getExerciseById('deadlift');
  assert.equal(normalizeVolumeCredits(null, dl).find((item) => item.muscleGroup === 'Lưng').credit, 0.5);
});

check('weekly sets: each Back Extension set moves +1 Back, −0.5 Hamstrings & glutes', () => {
  const assignments = [
    { exerciseId: 'weighted_back_extension', dayLabel: 'A', scheme: 4, schemeParams: { plannedSets: 3 }, volumeConfig: { credits: [{ muscleGroup: 'Đùi sau & Mông', credit: 1 }] }, active: true },
  ];
  const planned = plannedVolumeByMuscle(assignments, getExerciseById, { A: 1 });
  assert.equal(planned['Lưng'], 3);
  assert.equal(planned['Đùi sau & Mông'], 1.5);
  const now = Date.parse('2026-11-18T10:00:00Z');
  const sessions = [{ performedAt: new Date(now - 86400000), exerciseLogs: [{ exerciseId: 'weighted_back_extension', volumeCredits: [{ muscleGroup: 'Đùi sau & Mông', credit: 1 }], actualSets: [1, 2, 3].map((i) => ({ setIndex: i, weight: 10, reps: 12 })) }] }];
  const actual = actualVolumeByMuscle(sessions, getExerciseById, { now });
  assert.equal(actual['Lưng'], 3, 'logged history counts the new way');
  assert.equal(actual['Đùi sau & Mông'], 1.5);
});

check('note for David, VI and EN; none for other exercises', () => {
  setLang('vi');
  assert.equal(volumeNoteFor(ex), 'Tính volume: Lưng 1 set, Đùi sau & Mông 0,5 set.');
  setLang('en');
  assert.equal(volumeNoteFor(ex), 'Volume: Back 1 set, Hamstrings & glutes 0.5 set.');
  setLang('vi');
  assert.equal(volumeNoteFor(getExerciseById('deadlift')), '');
});

console.log(`BACK_EXTENSION_VOLUME_OK ${passed} passed`);
