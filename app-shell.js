const ICONS = Object.freeze({
  today: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.5 12 5l8 6.5V20H4z"/><path d="M9 20v-6h6v6"/></svg>',
  nutrition: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21c5-3 7-7.2 7-12.5C14.2 8.5 10.2 10.8 9 15c-.8-3.2.2-6.2 3-9-4.7.3-7 3.2-7 7 0 4.4 3 7 7 8Z"/><path d="M9 15c1.8-1.7 4-3 7-4"/></svg>',
  history: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h10"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></svg>',
  progress: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 17 5-5 4 3 7-8"/><path d="M15 7h5v5"/></svg>',
  review: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5z"/><path d="M8 9h8M8 13h5"/><circle cx="17" cy="17" r="3"/></svg>',
  programs: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5zM20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5z"/></svg>',
  students: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><path d="M3.5 20c.4-4 2.2-6 5.5-6s5.1 2 5.5 6"/><circle cx="17" cy="9" r="2"/><path d="M15.5 14.5c3.3-.6 5 1.2 5 4.5"/></svg>',
  collapse: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg>',
  account: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 21c.5-5 2.8-7.5 7-7.5s6.5 2.5 7 7.5"/></svg>',
});

const NAV_ITEMS = Object.freeze({
  student: Object.freeze([
    { id: 'today', label: 'Hôm nay', href: 'client.html' },
    { id: 'nutrition', label: 'Dinh dưỡng', href: 'nutrition.html' },
    { id: 'history', label: 'Lịch sử', href: 'history.html' },
    { id: 'progress', label: 'Tiến trình', href: 'progress-photos.html' },
  ]),
  coach: Object.freeze([
    { id: 'review', label: 'Cần xem lại', href: 'coach.html?focus=review#review-dashboard' },
    { id: 'programs', label: 'Giáo án', href: 'program-library.html' },
    { id: 'nutrition', label: 'Dinh dưỡng', href: 'coach.html?focus=nutrition#student-groups' },
    { id: 'students', label: 'Học viên', href: 'coach.html?focus=students#student-groups' },
  ]),
});

export function appShellItems(role) {
  return (NAV_ITEMS[role] || []).map((item) => ({ ...item }));
}

function navMarkup(items, active, className) {
  return `<nav class="${className}" aria-label="Điều hướng chính">${items.map((item) => `
    <a class="app-shell-link${item.id === active ? ' active' : ''}" href="${item.href}" ${item.id === active ? 'aria-current="page"' : ''} data-shell-destination="${item.id}">
      <span class="app-shell-icon">${ICONS[item.id]}</span><span class="app-shell-label">${item.label}</span>
    </a>`).join('')}</nav>`;
}

function setWorkoutState() {
  const workout = document.getElementById('day-content');
  if (!workout) return;
  const active = getComputedStyle(workout).display !== 'none';
  document.body.classList.toggle('app-shell-workout-active', active);
}

function removeShell() {
  document.getElementById('app-shell-sidebar')?.remove();
  document.getElementById('app-shell-bottom')?.remove();
  document.getElementById('app-shell-account')?.remove();
  document.getElementById('app-shell-account-menu')?.remove();
}

export function mountAppShell({ role, active, logoutButtonId = 'logout-btn', nutritionHref = '' } = {}) {
  if (!NAV_ITEMS[role]) return null;
  removeShell();

  const items = appShellItems(role);
  if (role === 'coach' && nutritionHref) {
    const nutrition = items.find((item) => item.id === 'nutrition');
    if (nutrition) nutrition.href = nutritionHref;
  }

  const collapsed = localStorage.getItem('dc_app_shell_collapsed') === '1';
  document.body.classList.add('has-app-shell');
  document.body.classList.toggle('app-shell-collapsed', collapsed);

  const sidebar = document.createElement('aside');
  sidebar.id = 'app-shell-sidebar';
  sidebar.className = 'app-shell-sidebar';
  sidebar.innerHTML = `
    <a class="app-shell-brand" href="${role === 'coach' ? 'coach.html' : 'client.html'}" aria-label="David Coaching">
      <span class="app-shell-brand-mark">DC</span><span class="app-shell-brand-copy"><strong>David Coaching</strong><small>${role === 'coach' ? 'Coach workspace' : 'Training companion'}</small></span>
    </a>
    ${navMarkup(items, active, 'app-shell-side-links')}
    <button type="button" class="app-shell-collapse" aria-label="Thu gọn thanh công cụ" aria-pressed="${collapsed}">${ICONS.collapse}<span>Thu gọn</span></button>`;
  document.body.prepend(sidebar);

  const bottom = document.createElement('div');
  bottom.id = 'app-shell-bottom';
  bottom.className = 'app-shell-bottom';
  bottom.innerHTML = navMarkup(items, active, 'app-shell-bottom-links');
  document.body.appendChild(bottom);

  const account = document.createElement('button');
  account.id = 'app-shell-account';
  account.className = 'app-shell-account';
  account.type = 'button';
  account.setAttribute('aria-label', 'Mở menu tài khoản');
  account.setAttribute('aria-expanded', 'false');
  account.innerHTML = ICONS.account;
  document.body.appendChild(account);

  const menu = document.createElement('div');
  menu.id = 'app-shell-account-menu';
  menu.className = 'app-shell-account-menu';
  menu.hidden = true;
  menu.innerHTML = `<strong>Tài khoản</strong><button type="button" data-shell-logout>Đăng xuất</button>`;
  document.body.appendChild(menu);

  const originalLogout = document.getElementById(logoutButtonId);
  if (originalLogout) originalLogout.dataset.appShellHidden = 'true';

  account.addEventListener('click', () => {
    const opening = menu.hidden;
    menu.hidden = !opening;
    account.setAttribute('aria-expanded', String(opening));
  });
  document.addEventListener('click', (event) => {
    if (menu.hidden || account.contains(event.target) || menu.contains(event.target)) return;
    menu.hidden = true;
    account.setAttribute('aria-expanded', 'false');
  });
  menu.querySelector('[data-shell-logout]').addEventListener('click', () => originalLogout?.click());

  sidebar.querySelector('.app-shell-collapse').addEventListener('click', (event) => {
    const next = !document.body.classList.contains('app-shell-collapsed');
    document.body.classList.toggle('app-shell-collapsed', next);
    localStorage.setItem('dc_app_shell_collapsed', next ? '1' : '0');
    event.currentTarget.setAttribute('aria-pressed', String(next));
  });

  document.querySelectorAll('.app-shell-link').forEach((link) => link.addEventListener('click', () => {
    const destination = link.dataset.shellDestination;
    document.querySelectorAll('.app-shell-link').forEach((candidate) => {
      const isActive = candidate.dataset.shellDestination === destination;
      candidate.classList.toggle('active', isActive);
      if (isActive) candidate.setAttribute('aria-current', 'page');
      else candidate.removeAttribute('aria-current');
    });
  }));

  document.querySelectorAll('.app-header a').forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (items.some((item) => href === item.href || href.split('?')[0] === item.href.split('?')[0])) {
      link.dataset.appShellHidden = 'true';
    }
  });

  const workout = document.getElementById('day-content');
  if (role === 'student' && workout) {
    setWorkoutState();
    new MutationObserver(setWorkoutState).observe(workout, { attributes: true, attributeFilter: ['style', 'class', 'hidden'] });
  }

  if (location.hash) {
    requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView({ block: 'start' }));
  }
  return { items };
}
