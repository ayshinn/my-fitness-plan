import { workouts, mesocycle, adjustForWeek } from "./data.js";
import {
  getCurrentWeek, setCurrentWeek,
  getSets, addSet, removeSet, getLastWeekSets,
} from "./storage.js";

const params = new URLSearchParams(location.search);
const dayId = params.get("day");
const workout = workouts[dayId];

const titleEl = document.getElementById("title");
const weekPillEl = document.getElementById("weekPill");
const contentEl = document.getElementById("content");
const modeBtn = document.getElementById("modeBtn");
const timerBar = document.getElementById("timerBar");
const timerDisplayEl = document.getElementById("timerDisplay");
const timerLabelEl = document.getElementById("timerLabel");
const timerToggleBtn = document.getElementById("timerToggle");
const timerCancelBtn = document.getElementById("timerCancel");

let workoutMode = localStorage.getItem("mfp:workoutMode") === "1";

// Timer state — uses wall-clock end time so it survives background throttling
let timerEndTime = null;
let timerSavedMs = 0;
let timerRunning = false;
let timerRemaining = 0;
let timerHandle = null;
let timerExName = "";

applyMode();

if (!workout) {
  contentEl.innerHTML = `<p>Workout not found. <a href="./index.html">Back home</a></p>`;
  titleEl.textContent = "Not found";
} else {
  titleEl.textContent = `${workout.day} · ${workout.title}`;
  render();
}

function applyMode() {
  modeBtn.classList.toggle("active", workoutMode);
  modeBtn.setAttribute("aria-label", workoutMode ? "Exit workout mode" : "Enter workout mode");
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function parseRestSeconds(restStr) {
  if (!restStr) return 120;
  const lower = restStr.split(/[–\-]/)[0].trim();
  const num = parseFloat(lower);
  if (isNaN(num)) return 120;
  if (/min/i.test(restStr)) return Math.round(num * 60);
  if (/sec/i.test(restStr)) return Math.round(num);
  return 120;
}

// ── Timer ────────────────────────────────────────────────────────────────────

function startRestTimer(seconds, exName) {
  clearInterval(timerHandle);
  timerExName = exName;
  timerEndTime = Date.now() + seconds * 1000;
  timerSavedMs = seconds * 1000;
  timerRunning = true;
  timerRemaining = seconds;
  timerBar.classList.remove("hidden", "done", "warn", "danger");
  contentEl.classList.add("timer-active");
  updateTimerDisplay();
  timerHandle = setInterval(timerTick, 500);
}

function timerTick() {
  const remaining = Math.ceil((timerEndTime - Date.now()) / 1000);
  timerRemaining = Math.max(0, remaining);
  updateTimerDisplay();
  if (timerRemaining <= 0) finishTimer();
}

function updateTimerDisplay() {
  const m = Math.floor(timerRemaining / 60);
  const s = timerRemaining % 60;
  timerDisplayEl.textContent = `${m}:${String(s).padStart(2, "0")}`;
  timerLabelEl.textContent = timerExName ? `Rest · ${timerExName}` : "Rest";
  timerToggleBtn.textContent = timerRunning ? "⏸" : "▶";
  timerBar.classList.remove("warn", "danger");
  if (!timerBar.classList.contains("done")) {
    if (timerRemaining <= 10) timerBar.classList.add("danger");
    else if (timerRemaining <= 30) timerBar.classList.add("warn");
  }
}

function finishTimer() {
  clearInterval(timerHandle);
  timerHandle = null;
  timerRunning = false;
  timerBar.classList.remove("warn", "danger");
  timerBar.classList.add("done");
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  updateTimerDisplay();
  setTimeout(dismissTimer, 3000);
}

function pauseResumeTimer() {
  if (timerBar.classList.contains("done")) return;
  if (timerRunning) {
    clearInterval(timerHandle);
    timerHandle = null;
    timerSavedMs = Math.max(0, timerEndTime - Date.now());
    timerRemaining = Math.ceil(timerSavedMs / 1000);
    timerRunning = false;
  } else {
    timerEndTime = Date.now() + timerSavedMs;
    timerHandle = setInterval(timerTick, 500);
    timerRunning = true;
  }
  updateTimerDisplay();
}

function dismissTimer() {
  clearInterval(timerHandle);
  timerHandle = null;
  timerRunning = false;
  timerRemaining = 0;
  timerEndTime = null;
  timerBar.classList.add("hidden");
  timerBar.classList.remove("done", "warn", "danger");
  contentEl.classList.remove("timer-active");
}

// ── Rendering ────────────────────────────────────────────────────────────────

function render() {
  const week = getCurrentWeek();
  weekPillEl.textContent = `W${week}`;
  const meso = mesocycle[week - 1];

  let html = `
    <div class="workout-meta">
      <span class="pill">${escapeHtml(workout.subtitle)}</span>
      <span class="pill">~${workout.estMin} min</span>
      <span class="pill">${escapeHtml(meso.label)}</span>
    </div>
    <div class="week-note">${escapeHtml(meso.note)}</div>
  `;

  let exerciseCounter = 0;
  for (const group of workout.groups) {
    html += `<div class="group-label">▸ ${escapeHtml(group.label)}</div>`;
    for (const ex of group.items) {
      const idx = exerciseCounter++;
      const adj = adjustForWeek(ex, week);
      const logged = getSets(workout.id, week, idx);
      const last = getLastWeekSets(workout.id, week, idx);

      html += workoutMode
        ? renderFull(ex, idx, adj, logged, last)
        : renderCondensed(ex, idx, adj, logged, last);
    }
  }

  contentEl.innerHTML = html;
  bindHandlers(week);
}

function setRows(logged) {
  return logged.map((s, i) => `
    <div class="set-row logged" data-set="${i}">
      <span class="n">${i + 1}</span>
      <input type="number" inputmode="decimal" value="${s.weight ?? ""}" data-field="weight" disabled>
      <input type="number" inputmode="numeric" value="${s.reps ?? ""}" data-field="reps" disabled>
      <input type="number" inputmode="decimal" value="${s.rpe ?? ""}" data-field="rpe" disabled>
      <button class="del" data-action="delete" aria-label="Delete set">×</button>
    </div>
  `).join("");
}

function inputRow(logged, adj, ex) {
  return `
    <div class="set-row input-row">
      <span class="n">${logged.length + 1}</span>
      <input type="number" inputmode="decimal" placeholder="${adj.load ?? ""}" data-field="weight" data-new>
      <input type="number" inputmode="numeric" placeholder="${ex.repsMid ?? ""}" data-field="reps" data-new>
      <input type="number" inputmode="decimal" placeholder="${adj.rpe}" data-field="rpe" data-new>
      <button class="del" data-action="log" aria-label="Log set">✓</button>
    </div>
  `;
}

function renderFull(ex, idx, adj, logged, last) {
  const restSecs = parseRestSeconds(ex.rest);
  return `
    <div class="exercise ${ex.compound ? "compound" : ""}" data-idx="${idx}">
      <div class="ex-head">
        <div class="ex-name">${escapeHtml(ex.name)}${ex.compound ? '<span class="badge">Main</span>' : ""}</div>
        <div class="ex-note">${escapeHtml(ex.note || "")}</div>
      </div>
      <div class="ex-targets">
        <div class="t"><div class="t-lbl">Sets</div><div class="t-val">${adj.sets}</div></div>
        <div class="t"><div class="t-lbl">Reps</div><div class="t-val">${escapeHtml(ex.reps)}</div></div>
        <div class="t"><div class="t-lbl">RPE</div><div class="t-val">${adj.rpe}</div></div>
        <div class="t">
          <div class="t-lbl">${adj.load ? "Target" : "Rest"}</div>
          <div class="t-val ${adj.load ? "suggested" : ""}">${adj.load ? adj.load + " lb" : escapeHtml(ex.rest)}</div>
        </div>
      </div>
      <button class="rest-btn" data-action="start-timer" data-rest="${restSecs}" data-name="${escapeHtml(ex.name)}">
        ⏱ Rest Timer · ${escapeHtml(ex.rest)}
      </button>
      ${last ? `<div class="last-week">Last (W${last.week}): ${last.sets.map(s => `<strong>${s.weight}×${s.reps}</strong>${s.rpe ? "@" + s.rpe : ""}`).join(" · ")}</div>` : ""}
      <div class="set-fields-head">
        <span class="first">#</span><span>Weight</span><span>Reps</span><span>RPE</span><span></span>
      </div>
      <div class="sets-list">
        ${setRows(logged)}
        ${inputRow(logged, adj, ex)}
      </div>
    </div>
  `;
}

function renderCondensed(ex, idx, adj, logged, last) {
  const targetText = adj.load
    ? `${adj.sets}×${escapeHtml(ex.reps)} · RPE ${adj.rpe} · <span class="suggested">${adj.load} lb</span>`
    : `${adj.sets}×${escapeHtml(ex.reps)} · RPE ${adj.rpe} · ${escapeHtml(ex.rest)}`;

  return `
    <div class="exercise condensed ${ex.compound ? "compound" : ""}" data-idx="${idx}">
      <div class="ex-summary">
        <div class="ex-name">${escapeHtml(ex.name)}${ex.compound ? '<span class="badge">Main</span>' : ""}</div>
        <div class="ex-meta">${targetText}</div>
      </div>
      ${last ? `<div class="last-week">Last W${last.week}: ${last.sets.map(s => `${s.weight}×${s.reps}`).join(" · ")}</div>` : ""}
      <div class="set-fields-head">
        <span class="first">#</span><span>Weight</span><span>Reps</span><span>RPE</span><span></span>
      </div>
      <div class="sets-list">
        ${setRows(logged)}
        ${inputRow(logged, adj, ex)}
      </div>
    </div>
  `;
}

// ── Event handlers ────────────────────────────────────────────────────────────

function getExerciseByIdx(targetIdx) {
  let i = 0;
  for (const g of workout.groups) {
    for (const e of g.items) {
      if (i === targetIdx) return e;
      i++;
    }
  }
  return null;
}

function bindHandlers(week) {
  contentEl.querySelectorAll(".exercise").forEach(card => {
    const idx = parseInt(card.dataset.idx, 10);
    card.querySelectorAll("[data-action]").forEach(btn => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.action;
        if (action === "log") {
          const row = btn.closest(".set-row");
          const get = field => row.querySelector(`[data-field="${field}"]`).value.trim();
          const weight = parseFloat(get("weight"));
          const reps = parseInt(get("reps"), 10);
          const rpe = parseFloat(get("rpe"));
          if (isNaN(weight) || isNaN(reps)) return;
          addSet(workout.id, week, idx, { weight, reps, rpe: isNaN(rpe) ? null : rpe });
          if (workoutMode) {
            const ex = getExerciseByIdx(idx);
            if (ex) startRestTimer(parseRestSeconds(ex.rest), ex.name);
          }
          render();
        } else if (action === "delete") {
          const row = btn.closest(".set-row");
          removeSet(workout.id, week, idx, parseInt(row.dataset.set, 10));
          render();
        } else if (action === "start-timer") {
          startRestTimer(parseInt(btn.dataset.rest, 10), btn.dataset.name);
        }
      });
    });
  });
}

modeBtn.addEventListener("click", () => {
  workoutMode = !workoutMode;
  localStorage.setItem("mfp:workoutMode", workoutMode ? "1" : "0");
  applyMode();
  if (!workoutMode) dismissTimer();
  render();
});

timerToggleBtn.addEventListener("click", pauseResumeTimer);
timerCancelBtn.addEventListener("click", dismissTimer);

weekPillEl.addEventListener("click", () => {
  const next = (getCurrentWeek() % 4) + 1;
  setCurrentWeek(next);
  render();
});
