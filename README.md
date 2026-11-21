# The Unreliable Map

A solo, choice-driven daily expedition for Reddit’s Devvit Interactive Posts. Read two conflicting field notes, choose a traveler whose promise matters, and decide how to cross the marsh. There are no dice rolls: route outcomes are deterministic and follow from the scenario and the player’s choices.

## Current prototype

This first playable slice has seven authored daily cases, a date-based Pacific reset, two traveler goals per case, three route options, one lantern-powered map check, deterministic outcome badges, and a shareable result card. Map reliability is part of the puzzle: some routes are marked accurately, some marks are stale, and the survey date plus field notes give the player evidence. The lantern verifies one selected mark. Outcomes never use hidden dice rolls.

The content currently rotates through a compact seven-case deck; expanding and validating the scenario deck is part of the next content milestone.

The map illustration is an inline SVG so it stays crisp at different sizes and needs no external art download. The interface is designed to work in a tall Reddit post view and on narrow mobile screens. Google Fonts are a visual enhancement; system fallbacks are defined for offline or restricted environments.

## Play locally

Open `public/index.html` through any static file server. For example:

```sh
python3 -m http.server 8000 --directory public
```

Then visit `http://localhost:8000`.

## Devvit

The app is configured as a Devvit Web custom post in `devvit.json`. Install and authenticate the Devvit CLI, then use `devvit playtest` to launch it in a test subreddit. It does not request Reddit account data, use an external game server, or save player history. The current daily case is selected locally from the Pacific calendar date; for an initial demo, everyone on the same date receives the same case and their choices determine their ending.

Before submitting to the hackathon, the next implementation steps are:

1. Expand the authored case library and check every traveler/route outcome for clarity and fairness.
2. Playtest the post on Reddit mobile and desktop, then adjust map scale, text, and tap targets.
3. Add a concise root-level game guide and a public demo post in a test subreddit as required by the event.

The daily reset is a deterministic date selector, not a scheduled post publisher. It refreshes when the date changes in Pacific time. No hidden randomness or AI-generated scenario text is used.
