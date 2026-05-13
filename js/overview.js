import { workouts, weekSchedule } from "./data.js";

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

const strip = document.getElementById("weekStrip");
strip.innerHTML = weekSchedule.map(d => {
  if (!d.workoutId) {
    return `<div class="d rest"><div class="day">${d.day}</div><div class="what">Rest</div></div>`;
  }
  const w = workouts[d.workoutId];
  return `<div class="d ${w.color}"><div class="day">${d.day}</div><div class="what">${escapeHtml(w.title)}</div></div>`;
}).join("");

const cards = document.getElementById("cards");
const ordered = weekSchedule.filter(d => d.workoutId).map(d => workouts[d.workoutId]);

cards.innerHTML = ordered.map(w => `
  <div class="ov-card ${w.color}">
    <div class="ov-head">
      <div class="row">
        <span class="day-tag">${w.day}</span>
        <span class="title">${escapeHtml(w.title)} — ${escapeHtml(w.subtitle)}${w.optional ? " · opt" : ""}</span>
      </div>
      <div class="sub">${escapeHtml(w.focus)} · ~${w.estMin} min</div>
    </div>
    ${w.groups.map(g => `
      <div class="ov-group">
        <div class="ov-group-label">▸ ${escapeHtml(g.label)}</div>
        ${g.items.map(ex => `
          <div class="ov-ex">
            <div class="nm ${ex.compound ? "compound" : ""}">${escapeHtml(ex.name)}</div>
            <div class="spec"><strong>${ex.sets}</strong>×${escapeHtml(ex.reps)} @ RPE ${ex.rpe}</div>
          </div>
        `).join("")}
      </div>
    `).join("")}
  </div>
`).join("");
