// The three pages that make up "Tập luyện": the workout, the programme, the history.
// One navigation item for the student, three pages behind it, joined by this bar.

import { t } from './i18n.js';
export const TRAINING_TABS = Object.freeze([
  Object.freeze({ id: 'workout', key: 'tabs.workout', href: 'client.html' }),
  Object.freeze({ id: 'program', key: 'tabs.program', href: 'program.html' }),
  Object.freeze({ id: 'history', key: 'tabs.history', href: 'history.html' }),
]);

export function trainingTabsMarkup(active) {
  return `<nav class="training-tabs" aria-label="${t('tabs.label')}">${TRAINING_TABS.map((tab) => (
    `<a class="training-tab${tab.id === active ? ' active' : ''}" href="${tab.href}"${tab.id === active ? ' aria-current="page"' : ''}>${t(tab.key)}</a>`
  )).join('')}</nav>`;
}

export function mountTrainingTabs(active, host = document.getElementById('training-tabs')) {
  if (host) host.innerHTML = trainingTabsMarkup(active);
}
