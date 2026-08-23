export function createAsyncActionGate() {
  let active = false;
  return Object.freeze({
    tryStart() {
      if (active) return false;
      active = true;
      return true;
    },
    finish() { active = false; },
    isActive() { return active; },
  });
}
