# The Unreliable Map

A solo daily expedition for Reddit’s Devvit Interactive Posts. Get a traveler to the bell tower while protecting the promise they carry. The map may be right, partly stale, or out of date; compare its survey with two field accounts, choose a route, and watch the crossing play out.

## How to play

1. **Cover:** open today’s dispatch.
2. **Dispatch:** choose a traveler. Their promise is your goal: keep a moth asleep, deliver a letter, find an object, or protect someone from the weather.
3. **Planning:** compare the route claims with the field notes. The survey date is evidence, not a guarantee. Optionally spend your one scouting lantern to verify the selected route.
4. **Preparation:** the game confirms the traveler and route before the crossing begins.
5. **Crossing:** follow the traveler on the map. A field log explains when the ground matches or contradicts the chart and whether the promise survives.
6. **Report:** read and share the outcome. Replay with the other traveler to see a different tradeoff.

The screens are sequential: each action unlocks the next stage, and the report is available only after the crossing simulation finishes.

There are no dice rolls. Each daily case has authored route conditions and outcomes, so the journey is deterministic and the clues explain what happened.

## Current prototype

The prototype has seven authored cases, a Pacific-time daily selector, two traveler goals per case, three routes, optional scouting, an animated crossing, clear arrival/promise outcomes, and a shareable result card. Some map marks are current and some are stale. The seven-case deck currently repeats weekly; expanding it is a major content milestone before submission.

The map is inline SVG. The layout supports a tall post and narrow mobile screens, with system font fallbacks and no external game server. The app does not request Reddit account data or save player history.

## Play locally

From the repository root, run:

```sh
python3 -m http.server 8000 --directory public
```

Then visit `http://localhost:8000`.

## Play on Reddit

The app is configured as a Devvit Web custom post in `devvit.json`. Install and authenticate the Devvit CLI, then run `npm run devvit:upload` and `npm run devvit:playtest` from the repository root. The playtest command opens the app in a Reddit test subreddit. The date selector refreshes when the Pacific calendar date changes; it does not publish a new post automatically.

## Hackathon submission checklist

The official challenge requires a game built on Devvit using Interactive Posts. A submission also needs a project description, an app listing link created after upload, a link to a running game post in a public subreddit (or the specified admin-access setup), and a root README explaining the game. The demo video is optional; if included, it must be under one minute and show the game running on its target device.

Judging gives equal weight to Delightful UX, Polish, Reddity/community fit, and Daily Content. The current prototype still needs a much larger authored case library and playtesting on Reddit before it is ready to submit. Official rules: https://redditgameofday2026.devpost.com/rules
