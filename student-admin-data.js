import { httpsCallable } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-functions.js';
import { functions } from './firebase-init.js';

const deleteStudentCallable = httpsCallable(functions, 'deleteStudentAccountData', {
  timeout: 540000,
});

const refreshActivitiesCallable = httpsCallable(functions, 'refreshStudentActivities');

/** Fills in each of the coach's students' last-session summary (see functions/student-activity-utils.js). */
export async function refreshStudentActivities() {
  const response = await refreshActivitiesCallable({});
  return response.data;
}

export async function deleteStudentAccountData(studentUid) {
  const response = await deleteStudentCallable({ studentUid });
  return response.data;
}
