export const AUTH_PERSISTENCE_MODE = 'session';

export function roleDestination(role) {
  if (role === 'coach') return 'coach.html';
  if (role === 'student') return 'client.html';
  return null;
}

export function redirectForUnexpectedRole(role, allowedRoles = []) {
  if (allowedRoles.includes(role)) return null;
  return roleDestination(role);
}

export async function signInAfterPersistence({ persistenceReady, signIn }) {
  await persistenceReady;
  return signIn();
}
