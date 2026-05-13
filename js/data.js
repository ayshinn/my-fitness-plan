// Workout plan data. Single source of truth for the app.
// 1RMs in lb. Edit here to update everywhere.

export const profile = {
  bench1RM: 205,
  squat1RM: 265,
  deadlift1RM: 315,
};

// 4-week mesocycle. Each week tweaks intensity/volume on the same base plan.
export const mesocycle = [
  {
    week: 1,
    label: "Acclimation",
    rpeShift: -1,        // compounds run RPE 7 instead of 8
    loadFactor: 0.95,    // ~5% lighter on suggested compound load
    setMultiplier: 1,
    note: "Find your working weights. Nothing should feel brutal.",
  },
  {
    week: 2,
    label: "Build",
    rpeShift: 0,
    loadFactor: 1.0,
    setMultiplier: 1,
    note: "Add weight or squeeze an extra rep. Real work.",
  },
  {
    week: 3,
    label: "Overreach",
    rpeShift: 0,         // accessories stay; compounds may push RPE 8-9
    loadFactor: 1.025,   // ~2.5% over baseline
    setMultiplier: 1,
    note: "Hardest week. Fatigue is the point. Push it.",
  },
  {
    week: 4,
    label: "Deload",
    rpeShift: -2,
    loadFactor: 0.85,
    setMultiplier: 0.6,  // cut ~40% of sets
    note: "Drop volume, keep movement quality. Recover.",
  },
];

// RPE % of 1RM table (approximate, for 1-10 rep work).
// Maps [reps][rpe] -> percent of 1RM.
const rpeTable = {
  1: { 7: 0.91, 8: 0.955, 9: 0.98, 10: 1.0 },
  2: { 7: 0.89, 8: 0.93, 9: 0.955, 10: 0.98 },
  3: { 7: 0.86, 8: 0.905, 9: 0.93, 10: 0.955 },
  4: { 7: 0.838, 8: 0.882, 9: 0.907, 10: 0.93 },
  5: { 7: 0.815, 8: 0.86, 9: 0.885, 10: 0.907 },
  6: { 7: 0.793, 8: 0.838, 9: 0.862, 10: 0.886 },
  7: { 7: 0.77, 8: 0.815, 9: 0.84, 10: 0.862 },
  8: { 7: 0.747, 8: 0.793, 9: 0.817, 10: 0.838 },
  9: { 7: 0.725, 8: 0.77, 9: 0.795, 10: 0.815 },
  10: { 7: 0.704, 8: 0.747, 9: 0.77, 10: 0.793 },
};

// Pick the heavier-rep end of a range for conservative load suggestion.
export function suggestedLoad(oneRM, reps, rpe) {
  if (!oneRM) return null;
  const cleanRpe = Math.max(6, Math.min(10, Math.round(rpe)));
  const cleanReps = Math.max(1, Math.min(10, Math.round(reps)));
  const pct = rpeTable[cleanReps]?.[cleanRpe];
  if (!pct) return null;
  // Round to nearest 5 lb for barbell loading.
  return Math.round((oneRM * pct) / 5) * 5;
}

// Workouts. Each exercise: name, sets, reps, rpe, rest, note, compound flag,
// and optional `lift` (bench|squat|deadlift) to resolve suggested load from 1RM.
export const workouts = {
  "upper-a": {
    id: "upper-a",
    day: "Mon",
    title: "Upper A",
    subtitle: "Strength",
    focus: "Push strength · Pull volume",
    estMin: 70,
    color: "blue",
    groups: [
      {
        label: "Compound",
        items: [
          {
            name: "Barbell Bench Press",
            sets: 4, reps: "4–6", repsMid: 5, rpe: 8, rest: "3–4 min",
            note: "Competition grip · full ROM · controlled eccentric",
            compound: true, lift: "bench",
          },
        ],
      },
      {
        label: "Push Accessories",
        items: [
          { name: "Incline DB Press", sets: 3, reps: "8–10", repsMid: 9, rpe: 8, rest: "90 sec", note: "30–45° · stretch at bottom" },
          { name: "Cable Lateral Raises", sets: 3, reps: "12–15", repsMid: 13, rpe: 8, rest: "60 sec", note: "Single arm · lean into cable" },
        ],
      },
      {
        label: "Pull Accessories",
        items: [
          { name: "Chest-Supported DB Row", sets: 4, reps: "8–10", repsMid: 9, rpe: 8, rest: "90 sec", note: "Drive elbow back · no hip drive" },
          { name: "Cable Pulldown (Wide Grip)", sets: 3, reps: "10–12", repsMid: 11, rpe: 8, rest: "75 sec", note: "Pull to upper chest · full stretch top" },
          { name: "Face Pulls", sets: 3, reps: "15–20", repsMid: 17, rpe: 7, rest: "60 sec", note: "Rope · pull to forehead · external rotation" },
        ],
      },
      {
        label: "Arms (superset)",
        items: [
          { name: "Tricep Rope Pushdown", sets: 3, reps: "12–15", repsMid: 13, rpe: 7, rest: "—", note: "Superset with curls" },
          { name: "EZ-Bar or DB Curl", sets: 3, reps: "10–12", repsMid: 11, rpe: 7, rest: "60 sec", note: "Full ROM · supinate at top" },
        ],
      },
    ],
  },

  "lower-a": {
    id: "lower-a",
    day: "Tue",
    title: "Lower A",
    subtitle: "Strength",
    focus: "Squat strength · Hinge accessory",
    estMin: 70,
    color: "orange",
    groups: [
      {
        label: "Compound",
        items: [
          {
            name: "Back Squat",
            sets: 4, reps: "4–6", repsMid: 5, rpe: 8, rest: "3–4 min",
            note: "Hit depth · brace hard · 3s eccentric",
            compound: true, lift: "squat",
          },
        ],
      },
      {
        label: "Hinge Accessory",
        items: [
          { name: "Romanian Deadlift", sets: 3, reps: "8–10", repsMid: 9, rpe: 7, rest: "2 min", note: "Big hamstring stretch · not to failure" },
        ],
      },
      {
        label: "Quad / Glute",
        items: [
          { name: "Leg Press", sets: 3, reps: "10–12", repsMid: 11, rpe: 8, rest: "2 min", note: "Mid-high foot position · full ROM" },
          { name: "Walking Lunges (DB)", sets: 3, reps: "10 / leg", repsMid: 10, rpe: 8, rest: "90 sec", note: "Controlled, unilateral" },
          { name: "Leg Curl (Lying or Seated)", sets: 3, reps: "10–12", repsMid: 11, rpe: 8, rest: "90 sec", note: "Peak contraction squeeze" },
        ],
      },
      {
        label: "Core + Calves",
        items: [
          { name: "Ab Wheel or Pallof Press", sets: 3, reps: "8–12", repsMid: 10, rpe: 7, rest: "60 sec", note: "Anti-extension / anti-rotation" },
          { name: "Calf Raises (Machine or Smith)", sets: 4, reps: "15–20", repsMid: 17, rpe: 8, rest: "60 sec", note: "Full ROM · 2s hold at top" },
        ],
      },
    ],
  },

  "upper-b": {
    id: "upper-b",
    day: "Thu",
    title: "Upper B",
    subtitle: "Hypertrophy",
    focus: "OHP primary · Pull volume",
    estMin: 75,
    color: "blue",
    groups: [
      {
        label: "Compound",
        items: [
          {
            name: "Seated DB Shoulder Press",
            sets: 4, reps: "8–10", repsMid: 9, rpe: 8, rest: "2–3 min",
            note: "Or barbell OHP · full lockout",
            compound: true,
          },
        ],
      },
      {
        label: "Push Accessories",
        items: [
          { name: "DB Flat Bench or Cable Fly", sets: 3, reps: "10–12", repsMid: 11, rpe: 8, rest: "90 sec", note: "Chest hypertrophy · slight stretch" },
          { name: "Machine Chest Press", sets: 3, reps: "12–15", repsMid: 13, rpe: 8, rest: "75 sec", note: "Higher rep work" },
          { name: "Lateral Raise Machine", sets: 4, reps: "12–15", repsMid: 13, rpe: 8, rest: "60 sec", note: "Lead with elbow · slightly bent" },
        ],
      },
      {
        label: "Pull Accessories",
        items: [
          { name: "Weighted Pull-Ups or Lat Pulldown", sets: 4, reps: "6–8", repsMid: 7, rpe: 8, rest: "2 min", note: "Strength-focused pull" },
          { name: "Seated Cable Row", sets: 3, reps: "10–12", repsMid: 11, rpe: 8, rest: "90 sec", note: "Neutral grip · scapular retraction" },
          { name: "Rear Delt Cable Fly", sets: 3, reps: "12–15", repsMid: 13, rpe: 7, rest: "60 sec", note: "Low cable · cross body" },
        ],
      },
      {
        label: "Arms (superset)",
        items: [
          { name: "Overhead Cable Tricep Extension", sets: 3, reps: "10–12", repsMid: 11, rpe: 7, rest: "—", note: "Long-head focus · full stretch" },
          { name: "Incline DB Curl", sets: 3, reps: "10–12", repsMid: 11, rpe: 7, rest: "60 sec", note: "Long-head bicep · no swinging" },
        ],
      },
    ],
  },

  "lower-b": {
    id: "lower-b",
    day: "Fri",
    title: "Lower B",
    subtitle: "Hypertrophy",
    focus: "Deadlift primary · Quad volume",
    estMin: 70,
    color: "orange",
    groups: [
      {
        label: "Compound",
        items: [
          {
            name: "Conventional Deadlift",
            sets: 3, reps: "5–8", repsMid: 6, rpe: 8, rest: "3 min",
            note: "Moderate vs. Mon squat · NOT max effort",
            compound: true, lift: "deadlift",
          },
        ],
      },
      {
        label: "Quad-Dominant",
        items: [
          { name: "Bulgarian Split Squat", sets: 3, reps: "10–12 / leg", repsMid: 11, rpe: 8, rest: "90 sec", note: "Torso forward for glutes" },
          { name: "Leg Extension", sets: 3, reps: "12–15", repsMid: 13, rpe: 8, rest: "75 sec", note: "Squeeze at top · slow eccentric" },
        ],
      },
      {
        label: "Hamstring / Glute",
        items: [
          { name: "Hip Thrust (Barbell)", sets: 3, reps: "10–12", repsMid: 11, rpe: 8, rest: "90 sec", note: "Full hip extension · squeeze top" },
          { name: "Seated Leg Curl", sets: 3, reps: "10–12", repsMid: 11, rpe: 8, rest: "75 sec", note: "Seated > lying · full ROM" },
        ],
      },
      {
        label: "Core + Calves",
        items: [
          { name: "Cable Crunch", sets: 3, reps: "10–15", repsMid: 12, rpe: 7, rest: "60 sec", note: "Loaded ab work" },
          { name: "Seated Calf Raise", sets: 4, reps: "12–15", repsMid: 13, rpe: 7, rest: "60 sec", note: "Soleus · pause at bottom stretch" },
        ],
      },
    ],
  },

  "day-5": {
    id: "day-5",
    day: "Sat",
    title: "Day 5",
    subtitle: "Arms & Shoulders",
    focus: "Optional · Pure hypertrophy · No compounds",
    estMin: 55,
    color: "purple",
    optional: true,
    groups: [
      {
        label: "Shoulders",
        items: [
          { name: "Cable Lateral Raises (Single Arm)", sets: 4, reps: "12–15", repsMid: 13, rpe: 8, rest: "60 sec", note: "Best for delt hypertrophy" },
          { name: "Rear Delt Machine Fly", sets: 3, reps: "15–20", repsMid: 17, rpe: 7, rest: "60 sec", note: "Feel the rear delt working" },
          { name: "DB Front Raise (alternating)", sets: 3, reps: "12 / arm", repsMid: 12, rpe: 7, rest: "60 sec", note: "Anterior delt top-off" },
        ],
      },
      {
        label: "Biceps",
        items: [
          { name: "Barbell or EZ-Bar Curl", sets: 3, reps: "8–10", repsMid: 9, rpe: 8, rest: "90 sec", note: "Heavier first · full supination" },
          { name: "Hammer Curl (DB)", sets: 3, reps: "10–12", repsMid: 11, rpe: 7, rest: "75 sec", note: "Brachialis · neutral grip" },
          { name: "Cable Concentration or Preacher", sets: 2, reps: "12–15", repsMid: 13, rpe: 7, rest: "60 sec", note: "Peak stretch and contraction" },
        ],
      },
      {
        label: "Triceps",
        items: [
          { name: "Overhead Cable Extension (rope)", sets: 3, reps: "10–12", repsMid: 11, rpe: 8, rest: "75 sec", note: "Long-head · full stretch" },
          { name: "Cable Pushdown", sets: 3, reps: "12–15", repsMid: 13, rpe: 7, rest: "60 sec", note: "Elbows pinned · squeeze extension" },
          { name: "Diamond Push-Ups or Dips", sets: 2, reps: "Max–2", repsMid: 10, rpe: 8, rest: "90 sec", note: "Burnout finisher" },
        ],
      },
    ],
  },
};

export const weekSchedule = [
  { day: "Mon", workoutId: "upper-a" },
  { day: "Tue", workoutId: "lower-a" },
  { day: "Wed", workoutId: null },
  { day: "Thu", workoutId: "upper-b" },
  { day: "Fri", workoutId: "lower-b" },
  { day: "Sat", workoutId: "day-5" },
  { day: "Sun", workoutId: null },
];

// Apply mesocycle adjustments to an exercise.
export function adjustForWeek(exercise, weekNum) {
  const m = mesocycle[weekNum - 1] || mesocycle[0];
  const adjustedRpe = exercise.compound
    ? Math.max(6, exercise.rpe + m.rpeShift)
    : exercise.rpe;
  const adjustedSets = Math.max(1, Math.round(exercise.sets * m.setMultiplier));
  let load = null;
  if (exercise.lift) {
    const oneRM = { bench: profile.bench1RM, squat: profile.squat1RM, deadlift: profile.deadlift1RM }[exercise.lift];
    const base = suggestedLoad(oneRM, exercise.repsMid, adjustedRpe);
    if (base) load = Math.round((base * m.loadFactor) / 5) * 5;
  }
  return { rpe: adjustedRpe, sets: adjustedSets, load };
}
