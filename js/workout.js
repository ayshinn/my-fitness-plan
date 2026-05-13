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

if (!workout) {
  contentEl.innerHTML = `<p>Workout not found. <a href="./index.html">Back home</a></p>`;
  titleEl.textContent = "Not found";
} else {
  titleEl.textContent = `${workout.day} · ${workout.title}`;
  render();
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

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

      html += `
        <div class="exercise ${ex.compound ? "compound" : ""}" data-idx="${idx}">
          <div class="ex-head">
            <div class="ex-name">${escapeHtml(ex.name)}${ex.compound ? '<span class="badge">Main</span>' : ""}</div>
            <div class="ex-note">${escapeHtml(ex.note || "")}</div>
          </div>
          <div class="ex-targets">
            <div class="t"><div class="t-lbl">Sets</div><div class="t-val">${adj.sets}</div></div>
            <div class="t"><div class="t-lbl">Reps</div><div class="t-val">${escapeHtml(ex.reps)}</div></div>
            <div class="t"><div class="t-lbl">RPE</div><div class="t-val">${adj.rpe}</div></div>
            <div class="t"><div class="t-lbl">${adj.load ? "Target" : "Rest"}</div><div class="t-val ${adj.load ? "suggested" : ""}">${adj.load ? adj.load + " lb" : escapeHtml(ex.rest)}</div></div>
          </div>
          ${last ? `<div class="last-week">Last (W${last.week}): ${last.sets.map(s => `<strong>${s.weight}×${s.reps}</strong>${s.rpe ? "@" + s.rpe : ""}`).join(" · ")}</div>` : ""}
          <div class="set-fields-head">
            <span class="first">#</span>
            <span>Weight</span>
            <span>Reps</span>
            <span>RPE</span>
            <span></span>
          </div>
          <div class="sets-list">
            ${logged.map((s, i) => `
              <div class="set-row logged" data-set="${i}">
                <span class="n">${i + 1}</span>
                <input type="number" inputmode="decimal" value="${s.weight ?? ""}" data-field="weight" disabled>
                <input type="number" inputmode="numeric" value="${s.reps ?? ""}" data-field="reps" disabled>
                <input type="number" inputmode="decimal" value="${s.rpe ?? ""}" data-field="rpe" disabled>
                <button class="del" data-action="delete" aria-label="Delete set">×</button>
              </div>
            `).join("")}
            <div class="set-row input-row">
              <span class="n">${logged.length + 1}</span>
              <input type="number" inputmode="decimal" placeholder="${adj.load ?? ""}" data-field="weight" data-new>
              <input type="number" inputmode="numeric" placeholder="${ex.repsMid ?? ""}" data-field="reps" data-new>
              <input type="number" inputmode="decimal" placeholder="${adj.rpe}" data-field="rpe" data-new>
              <button class="del" data-action="log" aria-label="Log set">✓</button>
            </div>
          </div>
        </div>
      `;
    }
  }

  contentEl.innerHTML = html;
  bindHandlers(week);
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
          addSet(workout.id, week, idx, {
            weight,
            reps,
            rpe: isNaN(rpe) ? null : rpe,
          });
          render();
        } else if (action === "delete") {
          const row = btn.closest(".set-row");
          const setIdx = parseInt(row.dataset.set, 10);
          removeSet(workout.id, week, idx, setIdx);
          render();
        }
      });
    });
  });
}

weekPillEl.addEventListener("click", () => {
  const next = (getCurrentWeek() % 4) + 1;
  setCurrentWeek(next);
  render();
});
