import { workouts, weekSchedule, mesocycle, profile } from "./data.js";
import { getCurrentWeek, setCurrentWeek } from "./storage.js";

const weekPill = document.getElementById("weekPill");
const weekSelector = document.getElementById("weekSelector");
const weekNote = document.getElementById("weekNote");
const dayList = document.getElementById("dayList");
const prs = document.getElementById("prs");

function render() {
  const week = getCurrentWeek();
  weekPill.textContent = `W${week}`;

  weekSelector.innerHTML = mesocycle.map(m => `
    <button class="week-btn ${m.week === week ? "active" : ""}" data-week="${m.week}">
      <span class="num">W${m.week}</span>
      <span class="lbl">${m.label}</span>
    </button>
  `).join("");

  const meso = mesocycle[week - 1];
  weekNote.textContent = meso.note;

  dayList.innerHTML = weekSchedule.map(d => {
    if (!d.workoutId) {
      return `
        <div class="day-card rest">
          <div class="day-label">${d.day}</div>
          <div class="day-info">
            <div class="day-title">Rest</div>
            <div class="day-sub">Recovery day</div>
          </div>
        </div>
      `;
    }
    const w = workouts[d.workoutId];
    return `
      <a class="day-card ${w.color}" href="./workout.html?day=${w.id}">
        <div class="day-label">${d.day}</div>
        <div class="day-info">
          <div class="day-title">${w.title} — ${w.subtitle}${w.optional ? " (opt)" : ""}</div>
          <div class="day-sub">${w.focus} · ~${w.estMin} min</div>
        </div>
        <div class="chevron">›</div>
      </a>
    `;
  }).join("");

  prs.innerHTML = `
    <div class="pr"><div class="lift">Bench</div><div class="val">${profile.bench1RM}<span>lb</span></div></div>
    <div class="pr"><div class="lift">Squat</div><div class="val">${profile.squat1RM}<span>lb</span></div></div>
    <div class="pr"><div class="lift">Deadlift</div><div class="val">${profile.deadlift1RM}<span>lb</span></div></div>
  `;
}

weekSelector.addEventListener("click", e => {
  const btn = e.target.closest(".week-btn");
  if (!btn) return;
  const w = parseInt(btn.dataset.week, 10);
  setCurrentWeek(w);
  render();
});

weekPill.addEventListener("click", () => {
  const next = (getCurrentWeek() % 4) + 1;
  setCurrentWeek(next);
  render();
});

render();
