// Firebase Storage, for the pages that upload or delete files (progress photos). Kept out of
// firebase-init.js so every other page skips downloading the Storage SDK.
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js';
import { app } from './firebase-init.js';

// Progress-photo storage lives in a separate, non-default bucket
// (david-training-program-progress-asia, asia-southeast1) shared with the
// David Coaching app — NOT the project's default bucket.
export const storage = getStorage(app, 'gs://david-training-program-progress-asia');
