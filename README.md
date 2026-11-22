# The Unreliable Map

**An original branching daily fantasy expedition for Reddit Interactive Posts.**

Everyone gets the same quest on a given Pacific calendar day. You choose a role and a route through a map that may be partly outdated; a witness, a daily field report and one scouting lantern help you decide. Along the road, an encounter and a final dilemma change your Resolve, Clues and Promise. Your decisions determine whether you arrive, keep your oath or uncover a secret. The ending card can be copied into the Reddit post's comments to compare outcomes.

## How the game actually plays

1. **Cover:** Preview the current episode and its central promise.
2. **Traveler:** Choose Warden (more Resolve), Scribe (a head start on Clues), or Tinker (extra Supplies).
3. **Map:** Compare three route claims with a witness account and a daily omen. Optionally scout one route. Maps are **not always wrong**.
4. **Encounter:** Your chosen route adds a cost and can yield clues. Pick one of two authored responses; each displays its mechanical effects.
5. **Final decision:** Choose how to settle the quest. Resolve must remain above zero to reach the destination; 3 Promise completes your oath, and 3 Clues reveals the hidden truth.
6. **Chronicle:** See an ending and the story choices that caused it, then copy the compact result to Reddit comments or replay another branch.

This is a **deterministic game**, not a generative text chatbot. The story choices, encounters and outcomes are authored and designed to be legible without hidden dice rolls. Results are not controlled by votes. The same choices on the same day give the same result.

## Daily content and replayability

- 12 authored settings with their own introductions, witness accounts, paths, encounters and final dilemmas.
- 7 rotating conditions (omens) change route reliability. These combine into **84 different chapter/omen pairings** before repeating. This is **not 84 wholly original scripts**: each quest repeats with different conditions.
- 3 roles × 3 routes × 2 encounter responses × 2 final choices = **36 paths per daily pairing**, with outcomes influenced by role, route reliability, and accumulated resources.
- The chapter changes at **midnight America/Los_Angeles** and rechecks while open; a previous day's in-progress run is not migrated to the new day.
- Progress now syncs with each signed-in player's Reddit account using Devvit's server-authenticated `context.userId` and Redis. The current quest, its choices, first result, and a bounded history of 40 completed journeys are saved. Reopening the game on another device in **the same subreddit installation** restores the same progress. Reddit's Redis is siloed by subreddit; there is no global cross-subreddit account profile or automatic new-post scheduler.

The standalone localhost preview uses a separate browser-only save. In the Reddit app there is **no silent local fallback** if authenticated storage is unavailable: the game displays an error rather than falsely claiming that progress was saved. Old localhost saves from the earlier prototype are not automatically migrated.

### Limits and next creative milestones

Currently the journeys have one common structure (route → encounter → finale). The writing and mechanics differ, and branches affect scores, fate and chronicle, but this is not an open-ended tabletop roleplaying engine or a procedural infinite-world simulator. Further polish should prioritize **mid-journey branching scenes**, unlockable secrets, richer chapter-specific puzzles, and player research/playtests before claiming fully unique stories every day.

## Run in a regular browser

Node 24+ is used for the Devvit toolchain. For the standalone game:

```sh
python3 -m http.server 8000 --directory public
```

Visit `http://localhost:8000/index.html` to play the full game locally. The inline Reddit splash page requires a Devvit bundle and will not work from a plain Python server until built.

## Build, test and playtest on Reddit

```sh
npm install
npm run check
npm run devvit:playtest
```

The build bundles the Reddit client splash into `public/splash.js` and the Devvit Web server as CommonJS in `dist/server/index.js`. `devvit.json` declares `splash.html` as the compact inline preview and `index.html` as the expanded game; the opening button calls `requestExpandedMode` directly from a click.

Use the **Create today's Unreliable Map game** moderator subreddit action to create a game post once the app is installed. Alternatively use the Devvit CLI and Reddit developer tools to create a custom post. **The game does not schedule or automatically publish daily posts**. One existing game post will show the current Pacific day's quest whenever opened.

For upload and release, follow the current official [Devvit development docs](https://developers.reddit.com/docs/capabilities/devvit-web/devvit_web_overview). Before hackathon submission, run an actual on-Reddit desktop and mobile playtest, upload, set up the app listing, and submit a working public game-post link. Neither GitHub source inspection nor passing unit tests proves the packaged app operates on Reddit.

## Testing

`npm test` covers the 12 episode definitions, Pacific date boundaries, 84 unique rotations, 3,024 deterministic playthrough combinations, alternate branches, illegal actions, and UI element IDs. `npm run check` also checks JS syntax and bundles the Devvit client/server with esbuild. GitHub Actions runs these checks on new commits and pull requests. The new `tests/progress.test.js` also covers per-user isolation, save/resume, rejection of forged scores, stale revisions, day rollover, history bounds, and account data deletion.

## Hackathon

[Reddit Game of the Day Hackathon](https://redditgameofday2026.devpost.com/rules). Judges evaluate **Delightful UX**, **Polish**, **Reddity/community fit**, and **Daily Content**. The design aims to be a short daily challenge with clear shareable variation, not a generic collaborative writing prompt.

The README and GitHub repository provide the source, but do not replace the required app listing or a live public Reddit game post. A demo is optional; check official rules for the current submission specifics.

## Reddit account-linked progress

**No separate registration or Reddit password is required.** Reddit supplies the signed-in user's internal `t2_` identifier to the trusted Devvit server context. Save endpoints do not take a username or user ID. The server stores a record under a private account key in Reddit-hosted Redis for that subreddit installation. Clients send **actions** (select role, select route, scout, advance encounter/finale), rather than arbitrary stats or outcomes; the server replays each choice through the deterministic rule engine. The `WATCH`/transaction and revision checks reduce concurrent-device overwrite risks.

The **MY CHRONICLE** menu lists completed adventures and today's personal first ending. Use **DELETE MY SAVED ADVENTURES** in the Chronicle to delete that installation's save record. Data expires automatically after **30 days of inactivity** to minimize indefinitely retained account-linked data. A returning player after that period starts fresh; the game does not promise permanent lifetime saves. Account data is not shared between subreddit installations. The game doesn't post or comment automatically, and it doesn't store Reddit posts, comments, messages, or display names.

### API endpoints

- `GET /api/progress`: return the authenticated player's private current run and archive.
- `POST /api/progress/action`: accept a validated action and expected revision; reject stale revisions with HTTP 409.
- `DELETE /api/progress`: delete the requesting player's entire save record.

These use Reddit's built-in server identity, not client-submitted IDs. `devvit.json` enables Redis. To validate that sync works **inside Reddit**, run `npm run check` followed by `npm run devvit:playtest`; test as two distinct Reddit users and on two devices. No external identity provider or database is needed.
