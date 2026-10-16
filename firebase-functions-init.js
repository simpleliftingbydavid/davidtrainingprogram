// Cloud Functions, for the coach pages that call them. Kept out of firebase-init.js so every
// other page skips downloading the Functions SDK.
import { getFunctions } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-functions.js';
import { app } from './firebase-init.js';

export const functions = getFunctions(app, 'asia-southeast1');
