# My Fitness Plan

**Live:** https://ayshinn.github.io/my-fitness-plan/

Mobile-first static site for tracking an Upper/Lower strength + hypertrophy program with weekly undulating periodization. Built to be readable in the gym on a phone, with localStorage logging of sets.

## Structure

```
index.html         home — week selector, day picker, 1RMs, references
workout.html       single workout view (?day=upper-a etc.)
rpe.html           RPE 6–10 reference
mesocycle.html     4-week phase + overload rules
css/styles.css     mobile-first dark theme
js/data.js         workouts, mesocycle config, load suggester
js/storage.js      localStorage CRUD
js/home.js         home renderer
js/workout.js      workout page + set logging
.nojekyll          tell GitHub Pages to skip Jekyll
```

## Local preview

ES modules need an HTTP server (file:// blocks them):

```sh
python3 -m http.server 8080
# open http://localhost:8080
```

## Deploy to GitHub Pages

1. Push to GitHub.
2. Repo Settings → Pages → Source: `Deploy from a branch`, Branch: `main`, Folder: `/ (root)`.
3. Site lives at `https://<user>.github.io/<repo>/`.

No build step. Edit files, commit, push.

## Editing the plan

All workout data lives in `js/data.js`. Update 1RMs in `profile`, change exercises in `workouts`, tune mesocycle in `mesocycle`. Page re-renders from this on next load.

## Data

`localStorage` keys (all prefixed `mfp:`):
- `mfp:currentWeek` — active mesocycle week (1–4)
- `mfp:log` — `{ workoutId: { weekNum: { exerciseIdx: [ {weight, reps, rpe, ts} ] } } }`

Reset via DevTools: `localStorage.clear()`.
