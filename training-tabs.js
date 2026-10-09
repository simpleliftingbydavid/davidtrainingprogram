// The three pages that make up "Tập luyện": the workout, the programme, the history.
// One navigation item for the student, three pages behind it, joined by this bar.

export const TRAINING_TABS = Object.freeze([
  Object.freeze({ id: 'workout', label: 'Buổi tập', href: 'client.html' }),
  Object.freeze({ id: 'program', label: 'Giáo án', href: 'program.html' }),
  Object.freeze({ id: 'history', label: 'Lịch sử', href: 'history.html' }),
]);

export function trainingTabsMarkup(active) {
  return `<nav class="training-tabs" aria-label="Tập luyện">${TRAINING_TABS.map((tab) => (
    `<a class="training-tab${tab.id === active ? ' active' : ''}" href="${tab.href}"${tab.id === active ? ' aria-current="page"' : ''}>${tab.label}</a>`
  )).join('')}</nav>`;
}

export function mountTrainingTabs(active, host = document.getElementById('training-tabs')) {
  if (host) host.innerHTML = trainingTabsMarkup(active);
}
