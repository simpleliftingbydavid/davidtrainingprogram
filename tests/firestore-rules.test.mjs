// Run with Firestore Emulator plus @firebase/rules-unit-testing and firebase installed.
// This repository intentionally has no package.json; keep test dependencies outside the
// production root so Vercel continues treating the app as a static site.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, deleteDoc, serverTimestamp, where, writeBatch } from 'firebase/firestore';

const projectId = 'demo-david-training-program';
const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
const env = await initializeTestEnvironment({ projectId, firestore: { rules } });

try {
  await env.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'coaches', 'coach-1'), { displayName: 'David' });
    await setDoc(doc(context.firestore(), 'students', 'student-1'), { coachUid: 'coach-1', clientCategory: 'online' });
    await setDoc(doc(context.firestore(), 'students', 'student-2'), { coachUid: 'coach-1', clientCategory: 'online' });
    await setDoc(doc(context.firestore(), 'coaches', 'coach-1', 'notifications', 'feedback-server'), {
      type: 'exercise-feedback', studentUid: 'student-1', noteId: 'student-note', sessionId: 'fixed-session-id',
      exerciseId: 'machine_rows', exerciseName: 'Machine Rows', preview: 'Cần David xem kỹ thuật', readAt: null,
      createdAt: new Date('2026-08-28T01:00:00Z'),
    });
    await setDoc(doc(context.firestore(), 'students', 'student-1', 'phases', 'phase-active'), { status: 'active' });
    await setDoc(doc(context.firestore(), 'students', 'student-1', 'phases', 'phase-old'), { status: 'completed' });
    const assignmentBase = {
      exerciseId: 'bench_press', exerciseNameSnapshot: { vi: 'Bench Press' }, dayLabel: 'A', orderInDay: 1,
      scheme: 2, schemeParams: { restSeconds: 120 }, state: { trainingMax: 80 }, phaseId: 'phase-active',
      note: '', active: true,
    };
    await setDoc(doc(context.firestore(), 'students', 'student-1', 'assignments', 'assignment-replace'), assignmentBase);
    await setDoc(doc(context.firestore(), 'students', 'student-1', 'assignments', 'assignment-remove'), {
      ...assignmentBase, exerciseId: 'lat_pulldown', exerciseNameSnapshot: { vi: 'Lat Pulldown' }, orderInDay: 2,
    });
    await setDoc(doc(context.firestore(), 'students', 'student-1', 'assignments', 'assignment-reorder'), {
      ...assignmentBase, exerciseId: 'military_press', exerciseNameSnapshot: { vi: 'Military Press' }, orderInDay: 3,
    });
  });

  const ownDb = env.authenticatedContext('student-1').firestore();
  const otherDb = env.authenticatedContext('student-2').firestore();
  const coachDb = env.authenticatedContext('coach-1').firestore();
  const sessionRef = doc(ownDb, 'students', 'student-1', 'sessions', 'fixed-session-id');
  const validSession = {
    studentUid: 'student-1', dayLabel: 'A', performedAt: new Date('2026-08-23T12:00:00Z'),
    clientNote: '', coachNote: '', durationSeconds: 1800, loggedAt: serverTimestamp(),
    performedAssignmentIds: ['assignment-replace', 'assignment-remove'],
    performedExerciseIds: ['machine_rows', 'lat_pulldown', 'bayesian_curls'],
    exerciseLogs: [{ assignmentId: 'assignment-replace', exerciseId: 'bench_press', substitutedExerciseId: 'machine_rows', actualSets: [{ weight: 30, reps: 10, rir: 2 }] }],
  };
  await assertSucceeds(setDoc(sessionRef, validSession));
  await assertFails(setDoc(sessionRef, validSession));
  await assertFails(setDoc(doc(ownDb, 'students', 'student-1', 'sessions', 'invalid-session'), {
    dayLabel: 'A', exerciseLogs: [],
  }));
  await assertSucceeds(setDoc(doc(ownDb, 'students', 'student-1', 'sessions', 'context-session-id'), {
    ...validSession,
    loggedAt: serverTimestamp(),
    completionContext: {
      endedEarly: true, earlyEndReason: 'time', earlyEndReasonNote: '',
      incompleteAssignmentIds: ['assignment-remove'],
    },
  }));

  const ownState = doc(ownDb, 'students', 'student-1', 'extraExerciseStates', 'machine_rows');

  await assertSucceeds(setDoc(ownState, {
    exerciseId: 'machine_rows', exerciseNameSnapshot: { vi: 'Machine Rows' }, scheme: 8,
    schemeParams: { restSeconds: 90 },
    state: { workingWeight: 30, lastSessionId: 'fixed-session-id' }, updatedAt: serverTimestamp(),
  }));
  await assertSucceeds(getDoc(ownState));
  await assertSucceeds(updateDoc(ownState, {
    state: { workingWeight: 35, lastSessionId: 'fixed-session-id' }, updatedAt: serverTimestamp(),
  }));
  await assertFails(updateDoc(ownState, { exerciseId: 'bayesian_curls' }));
  await assertFails(updateDoc(ownState, {
    state: { workingWeight: 40, lastSessionId: 'missing-session' }, updatedAt: serverTimestamp(),
  }));
  await assertFails(updateDoc(ownState, {
    state: { workingWeight: 40, lastSessionId: 'fixed-session-id' }, clientOverride: true, updatedAt: serverTimestamp(),
  }));
  await assertFails(getDoc(doc(otherDb, 'students', 'student-1', 'extraExerciseStates', 'machine_rows')));
  await assertFails(setDoc(doc(otherDb, 'students', 'student-1', 'extraExerciseStates', 'bayesian_curls'), { exerciseId: 'bayesian_curls' }));
  await assertFails(deleteDoc(ownState));

  const replacementRef = doc(ownDb, 'students', 'student-1', 'assignments', 'assignment-replace');
  await assertSucceeds(updateDoc(replacementRef, {
    exerciseId: 'machine_rows', exerciseNameSnapshot: { vi: 'Machine Rows' }, scheme: 8,
    schemeParams: { restSeconds: 90 }, state: { workingWeight: 30 }, volumeConfig: { credits: [] },
    sourceSessionId: 'fixed-session-id', studentEditedAt: serverTimestamp(), updatedAt: serverTimestamp(),
  }));
  await assertSucceeds(updateDoc(replacementRef, {
    state: {
      workingWeight: 30, progressionStep: 1, progressionCycle: 0,
      techniqueChecklist: { cycle: 0, checks: [true, true, false, false, false] },
      lastSessionId: 'fixed-session-id',
    },
    updatedAt: serverTimestamp(),
  }));
  await assertFails(updateDoc(doc(otherDb, 'students', 'student-1', 'assignments', 'assignment-replace'), {
    state: {
      workingWeight: 30, progressionStep: 1, progressionCycle: 0,
      techniqueChecklist: { cycle: 0, checks: [true, true, true, true, true] },
      lastSessionId: 'fixed-session-id',
    },
    updatedAt: serverTimestamp(),
  }));
  await assertFails(updateDoc(replacementRef, {
    dayLabel: 'B', sourceSessionId: 'fixed-session-id', studentEditedAt: serverTimestamp(), updatedAt: serverTimestamp(),
  }));
  await assertFails(updateDoc(doc(otherDb, 'students', 'student-1', 'assignments', 'assignment-replace'), {
    exerciseId: 'bayesian_curls', sourceSessionId: 'fixed-session-id', studentEditedAt: serverTimestamp(), updatedAt: serverTimestamp(),
  }));

  const removeRef = doc(ownDb, 'students', 'student-1', 'assignments', 'assignment-remove');
  await assertSucceeds(updateDoc(removeRef, {
    active: false, sourceSessionId: 'fixed-session-id', studentEditedAt: serverTimestamp(), updatedAt: serverTimestamp(),
  }));
  await assertFails(deleteDoc(removeRef));

  const addedRef = doc(ownDb, 'students', 'student-1', 'assignments', 'student-added');
  const studentAdded = {
    exerciseId: 'bayesian_curls', exerciseNameSnapshot: { vi: 'Bayesian Curls' }, dayLabel: 'A', orderInDay: 3,
    scheme: 8, schemeParams: { restSeconds: 90 }, state: { workingWeight: 10 }, phaseId: 'phase-active',
    note: '', volumeConfig: { credits: [] }, active: true, studentCreated: true,
    sourceSessionId: 'fixed-session-id', studentEditedAt: serverTimestamp(), createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  };
  await assertSucceeds(setDoc(addedRef, studentAdded));
  await assertFails(updateDoc(addedRef, {
    exerciseId: 'machine_rows', exerciseNameSnapshot: { vi: 'Machine Rows' }, scheme: 8,
    schemeParams: { restSeconds: 90 }, state: { workingWeight: 30 }, volumeConfig: { credits: [] },
    sourceSessionId: 'fixed-session-id', studentEditedAt: serverTimestamp(), updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(doc(ownDb, 'students', 'student-1', 'assignments', 'student-added-old-phase'), {
    ...studentAdded, phaseId: 'phase-old',
  }));
  await assertFails(setDoc(doc(ownDb, 'students', 'student-1', 'assignments', 'student-added-fake-session'), {
    ...studentAdded, sourceSessionId: 'missing-session',
  }));

  const workoutDraft = doc(ownDb, 'students', 'student-1', 'workoutDrafts', 'active');
  await assertSucceeds(setDoc(workoutDraft, {
    studentUid: 'student-1', day: 'Upper 1', sessionId: 'draft-session-1', exercises: [], revision: 1,
    updatedAt: serverTimestamp(),
  }));
  await assertSucceeds(getDoc(workoutDraft));
  await assertSucceeds(updateDoc(workoutDraft, { revision: 2, updatedAt: serverTimestamp() }));
  await assertFails(setDoc(doc(otherDb, 'students', 'student-1', 'workoutDrafts', 'active'), {
    studentUid: 'student-1', day: 'Upper 1', sessionId: 'foreign', exercises: [], revision: 1, updatedAt: serverTimestamp(),
  }));
  await assertFails(setDoc(doc(ownDb, 'students', 'student-1', 'workoutDrafts', 'other'), {
    studentUid: 'student-1', day: 'Upper 1', sessionId: 'wrong-id', exercises: [], revision: 1, updatedAt: serverTimestamp(),
  }));
  await assertSucceeds(getDoc(doc(coachDb, 'students', 'student-1', 'workoutDrafts', 'active')));
  await assertSucceeds(deleteDoc(workoutDraft));

  const studentNoteRef = doc(ownDb, 'students', 'student-1', 'exerciseNotes', 'student-note');
  const studentNote = {
    studentUid: 'student-1', sessionId: 'fixed-session-id', sessionLabel: 'A',
    sessionExerciseId: 'assigned:assignment-replace', assignmentId: 'assignment-replace',
    exerciseId: 'machine_rows', exerciseName: 'Machine Rows',
    authorUid: 'student-1', authorRole: 'student', authorName: 'Student 1', visibility: 'shared',
    replyToNoteId: '', body: 'Cần David xem lại đường kéo.', createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  };
  await assertSucceeds(setDoc(studentNoteRef, studentNote));
  await assertSucceeds(getDoc(studentNoteRef));
  await assertSucceeds(getDoc(doc(coachDb, 'students', 'student-1', 'exerciseNotes', 'student-note')));
  await assertFails(setDoc(doc(ownDb, 'students', 'student-1', 'exerciseNotes', 'student-private'), { ...studentNote, visibility: 'private' }));
  await assertFails(setDoc(doc(otherDb, 'students', 'student-1', 'exerciseNotes', 'foreign-note'), { ...studentNote, authorUid: 'student-2' }));
  await assertFails(getDoc(doc(otherDb, 'students', 'student-1', 'exerciseNotes', 'student-note')));
  await assertFails(updateDoc(studentNoteRef, { body: 'Ghi đè nội dung cũ', updatedAt: serverTimestamp() }));
  await assertFails(deleteDoc(studentNoteRef));

  const coachPrivateRef = doc(coachDb, 'students', 'student-1', 'exerciseNotes', 'coach-private');
  await assertSucceeds(setDoc(coachPrivateRef, {
    ...studentNote, authorUid: 'coach-1', authorRole: 'coach', authorName: 'David',
    visibility: 'private', replyToNoteId: 'student-note', body: 'Ghi chú riêng của David.',
  }));
  await assertSucceeds(getDoc(coachPrivateRef));
  await assertFails(getDoc(doc(ownDb, 'students', 'student-1', 'exerciseNotes', 'coach-private')));
  await assertSucceeds(getDocs(query(
    collection(ownDb, 'students', 'student-1', 'exerciseNotes'),
    where('exerciseId', '==', 'machine_rows'), where('visibility', '==', 'shared'),
  )));

  const notificationRef = doc(coachDb, 'coaches', 'coach-1', 'notifications', 'feedback-server');
  await assertSucceeds(getDoc(notificationRef));
  await assertSucceeds(updateDoc(notificationRef, { readAt: serverTimestamp() }));
  await assertFails(updateDoc(notificationRef, { preview: 'Giả mạo' }));
  await assertFails(setDoc(doc(coachDb, 'coaches', 'coach-1', 'notifications', 'client-created'), { readAt: null }));
  await assertFails(getDoc(doc(ownDb, 'coaches', 'coach-1', 'notifications', 'feedback-server')));

  const deviceRef = doc(coachDb, 'coaches', 'coach-1', 'notificationDevices', 'device-a');
  await assertSucceeds(setDoc(deviceRef, {
    token: 'fcm-token-a', enabled: true, platform: 'test-browser',
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  }));
  await assertSucceeds(updateDoc(deviceRef, { token: 'fcm-token-b', updatedAt: serverTimestamp() }));
  await assertSucceeds(deleteDoc(deviceRef));
  await assertFails(setDoc(doc(ownDb, 'coaches', 'coach-1', 'notificationDevices', 'student-device'), {
    token: 'bad', enabled: true, platform: 'test', createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  }));

  const atomicDraft = doc(ownDb, 'students', 'student-1', 'workoutDrafts', 'active');
  const atomicSession = doc(ownDb, 'students', 'student-1', 'sessions', 'atomic-session-id');
  await assertSucceeds(setDoc(atomicDraft, {
    studentUid: 'student-1', day: 'Upper 1', sessionId: 'atomic-session-id', exercises: [], revision: 1,
    updatedAt: serverTimestamp(),
  }));
  const finishBatch = writeBatch(ownDb);
  finishBatch.set(atomicSession, { ...validSession, loggedAt: serverTimestamp() });
  finishBatch.delete(atomicDraft);
  await assertSucceeds(finishBatch.commit());
  assert.equal((await getDoc(atomicSession)).exists(), true);
  assert.equal((await getDoc(atomicDraft)).exists(), false);

  const volumeCheckIn = doc(ownDb, 'students', 'student-1', 'checkIns', 'volume-2026-w33');
  await assertSucceeds(setDoc(volumeCheckIn, {
    type: 'volume-recovery', muscleRecovery: { 'Ngực': 4 }, fatigue: 2, jointPain: 0, performance: 2,
  }));
  await assertSucceeds(getDoc(volumeCheckIn));
  await assertFails(getDoc(doc(otherDb, 'students', 'student-1', 'checkIns', 'volume-2026-w33')));
  await assertFails(setDoc(doc(otherDb, 'students', 'student-1', 'checkIns', 'foreign-volume'), { type: 'volume-recovery' }));
  await assertSucceeds(getDoc(doc(coachDb, 'students', 'student-1', 'checkIns', 'volume-2026-w33')));

  const painAlertRef = doc(ownDb, 'students', 'student-1', 'coachingAlerts', 'exercise_assignment-replace');
  await assertSucceeds(setDoc(painAlertRef, {
    studentUid: 'student-1', type: 'exercise-pain', assignmentId: 'assignment-replace',
    exerciseId: 'bench_press', status: 'open', progressionHeld: true,
    lastDetectedAt: serverTimestamp(), updatedAt: serverTimestamp(),
  }));
  await assertSucceeds(getDoc(painAlertRef));
  await assertFails(updateDoc(painAlertRef, {
    status: 'resolved', progressionHeld: false, updatedAt: serverTimestamp(),
  }));
  const coachPainAlertRef = doc(coachDb, 'students', 'student-1', 'coachingAlerts', 'exercise_assignment-replace');
  await assertSucceeds(updateDoc(coachPainAlertRef, {
    status: 'resolved', progressionHeld: false, resolvedAt: serverTimestamp(),
    resolvedBy: 'coach-1', resolutionNote: 'Đã kiểm tra trực tiếp.', updatedAt: serverTimestamp(),
  }));
  await assertFails(deleteDoc(coachPainAlertRef));
  await assertFails(getDoc(doc(otherDb, 'students', 'student-1', 'coachingAlerts', 'exercise_assignment-replace')));

  const painEventRef = doc(ownDb, 'students', 'student-1', 'coachingAlertEvents', 'fixed-session-id_assignment-replace');
  await assertSucceeds(setDoc(painEventRef, {
    studentUid: 'student-1', alertId: 'exercise_assignment-replace', type: 'exercise-pain',
    assignmentId: 'assignment-replace', exerciseId: 'bench_press', sessionId: 'fixed-session-id',
    source: 'workout', createdBy: 'student-1', createdAt: serverTimestamp(),
  }));
  await assertFails(updateDoc(painEventRef, { source: 'changed' }));
  await assertFails(deleteDoc(painEventRef));

  const engineAuditRef = doc(ownDb, 'students', 'student-1', 'progressionAudits', 'fixed-session-id_assignment-replace');
  await assertSucceeds(setDoc(engineAuditRef, {
    studentUid: 'student-1', assignmentId: 'assignment-replace', exerciseId: 'bench_press',
    changes: [{ field: 'trainingMax', before: 80, after: 82.5 }], source: 'engine',
    reason: 'Đúng RIR mục tiêu', sessionId: 'fixed-session-id', actorUid: 'student-1',
    actorRole: 'engine', reviewDate: null, createdAt: serverTimestamp(),
  }));
  await assertFails(setDoc(doc(ownDb, 'students', 'student-1', 'progressionAudits', 'fake-session-audit'), {
    studentUid: 'student-1', assignmentId: 'assignment-replace', exerciseId: 'bench_press',
    changes: [], source: 'engine', reason: 'fake', sessionId: 'missing-session', actorUid: 'student-1',
    actorRole: 'engine', reviewDate: null, createdAt: serverTimestamp(),
  }));
  await assertFails(updateDoc(engineAuditRef, { reason: 'Ghi đè' }));
  await assertFails(deleteDoc(engineAuditRef));
  await assertFails(getDoc(doc(otherDb, 'students', 'student-1', 'progressionAudits', 'fixed-session-id_assignment-replace')));

  const coachAuditRef = doc(coachDb, 'students', 'student-1', 'progressionAudits', 'coach-manual-audit');
  await assertSucceeds(setDoc(coachAuditRef, {
    studentUid: 'student-1', assignmentId: 'assignment-replace', exerciseId: 'bench_press',
    changes: [{ field: 'trainingMax', before: 82.5, after: 80 }], source: 'coach-manual',
    reason: 'Reset sau khi kiểm tra kỹ thuật', sessionId: null, actorUid: 'coach-1', actorRole: 'coach',
    reviewDate: null, createdAt: serverTimestamp(),
  }));
  await assertFails(setDoc(doc(coachDb, 'students', 'student-1', 'progressionAudits', 'coach-missing-reason'), {
    studentUid: 'student-1', assignmentId: 'assignment-replace', exerciseId: 'bench_press',
    changes: [], source: 'coach-manual', reason: '', sessionId: null, actorUid: 'coach-1',
    actorRole: 'coach', reviewDate: null, createdAt: serverTimestamp(),
  }));
  await assertFails(updateDoc(coachAuditRef, { reason: 'Ghi đè' }));

  const coachState = doc(coachDb, 'students', 'student-1', 'extraExerciseStates', 'machine_rows');
  await assertSucceeds(updateDoc(coachState, { state: { workingWeight: 37.5 } }));
  await assertSucceeds(deleteDoc(coachState));
  assert.equal((await getDoc(coachState)).exists(), false);
  await assertSucceeds(updateDoc(doc(coachDb, 'students', 'student-1', 'assignments', 'assignment-reorder'), {
    dayLabel: 'B', orderInDay: 1, updatedAt: serverTimestamp(),
  }));
  await assertSucceeds(updateDoc(doc(coachDb, 'students', 'student-1', 'phases', 'phase-active'), {
    assignmentOrderRevision: 1, assignmentOrderUpdatedAt: serverTimestamp(),
  }));
  console.log('FIRESTORE_RULES_OK 80 / 80 passed');
} finally {
  await env.cleanup();
}
