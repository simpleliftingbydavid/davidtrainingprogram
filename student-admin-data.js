import { httpsCallable } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-functions.js';
import { functions } from './firebase-init.js';

const deleteStudentCallable = httpsCallable(functions, 'deleteStudentAccountData', {
  timeout: 540000,
});

export async function deleteStudentAccountData(studentUid) {
  const response = await deleteStudentCallable({ studentUid });
  return response.data;
}
