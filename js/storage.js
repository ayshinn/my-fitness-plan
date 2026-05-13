// LocalStorage wrapper. Keys are namespaced under `mfp:` to avoid collision.

const KEYS = {
  week: "mfp:currentWeek",
  log: "mfp:log",          // { [workoutId]: { [weekNum]: { [exerciseIdx]: [ { weight, reps, rpe, ts } ] } } }
  profile: "mfp:profile",  // { bench1RM, squat1RM, deadlift1RM }
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota or private-mode failure. Silent — site still works without persistence.
  }
}

export function getCurrentWeek() {
  const w = parseInt(localStorage.getItem(KEYS.week) || "1", 10);
  return Math.min(4, Math.max(1, isNaN(w) ? 1 : w));
}

export function setCurrentWeek(week) {
  localStorage.setItem(KEYS.week, String(week));
}

export function getProfile() {
  return readJSON(KEYS.profile, null);
}

export function setProfile(p) {
  writeJSON(KEYS.profile, p);
}

export function getSets(workoutId, weekNum, exerciseIdx) {
  const log = readJSON(KEYS.log, {});
  return log?.[workoutId]?.[weekNum]?.[exerciseIdx] ?? [];
}

export function addSet(workoutId, weekNum, exerciseIdx, set) {
  const log = readJSON(KEYS.log, {});
  log[workoutId] ??= {};
  log[workoutId][weekNum] ??= {};
  log[workoutId][weekNum][exerciseIdx] ??= [];
  log[workoutId][weekNum][exerciseIdx].push({ ...set, ts: Date.now() });
  writeJSON(KEYS.log, log);
}

export function removeSet(workoutId, weekNum, exerciseIdx, setIdx) {
  const log = readJSON(KEYS.log, {});
  const arr = log?.[workoutId]?.[weekNum]?.[exerciseIdx];
  if (!arr) return;
  arr.splice(setIdx, 1);
  writeJSON(KEYS.log, log);
}

export function getLastWeekSets(workoutId, weekNum, exerciseIdx) {
  // Find the most recent prior week with logged sets, for "last time" hint.
  const log = readJSON(KEYS.log, {});
  const weeks = log?.[workoutId] ?? {};
  for (let w = weekNum - 1; w >= 1; w--) {
    const sets = weeks?.[w]?.[exerciseIdx];
    if (sets?.length) return { week: w, sets };
  }
  return null;
}

export function exportAll() {
  return {
    week: getCurrentWeek(),
    profile: getProfile(),
    log: readJSON(KEYS.log, {}),
  };
}

export function resetAll() {
  localStorage.removeItem(KEYS.log);
  localStorage.removeItem(KEYS.week);
}
