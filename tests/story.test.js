import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  QUESTS, HEROES, OMENS, getDispatch, pacificDayKey,
  startRun, chooseRoute, scout, advanceToEncounter, canAfford,
  getFinaleChoices, getFinaleScene, getRollPreview, prepareRoll,
  resolvePendingRoll, continueAfterRoll,
} from "../public/story.js";

test("authored episodes have complete routes and branch choices", () => {
  assert.equal(QUESTS.length, 12);
  assert.equal(OMENS.length, 7);
  assert.equal(HEROES.length, 3);
  for (const quest of QUESTS) {
    assert.equal(quest.routes.length, 3, quest.id);
    assert.equal(quest.encounterChoices.length, 2, quest.id);
    assert.equal(quest.finaleChoices.length, 2, quest.id);
    assert.ok(quest.introduction && quest.promise && quest.witness, quest.id);
  }
});

test("Pacific day changes at midnight, including winter and summer", () => {
  assert.equal(pacificDayKey(new Date("2026-11-22T07:59:59Z")), "2026-11-21");
  assert.equal(pacificDayKey(new Date("2026-11-22T08:00:00Z")), "2026-11-22");
  assert.equal(pacificDayKey(new Date("2026-07-21T06:59:59Z")), "2026-07-20");
  assert.equal(pacificDayKey(new Date("2026-07-21T07:00:00Z")), "2026-07-21");
});

test("same day is the same adventure and 84 days have distinct chapter/omen pairs", () => {
  assert.deepEqual(getDispatch("2026-11-22"), getDispatch("2026-11-22"));
  const seen = new Set(), start = Date.UTC(2026, 10, 11);
  for (let i = 0; i < 84; i++) {
    const d = getDispatch(new Date(start + i * 86400000).toISOString().slice(0, 10));
    seen.add(d.id + ":" + d.omen.id);
    assert.ok(d.routes.some((route) => route.reliable));
    assert.equal(d.encounterChoices.length, 3);
    assert.equal(d.finaleChoices.length, 3);
    assert.equal(d.recoveryChoices.length, 3);
  }
  assert.equal(seen.size, 84);
});

test("all characters, routes and branching outcomes can be completed", () => {
  let successes = 0, setbacks = 0, paths = 0;
  const first = Date.UTC(2026, 10, 11);
  for (let day = 0; day < 28; day++) {
    const d = getDispatch(new Date(first + day * 86400000).toISOString().slice(0, 10));
    for (const hero of HEROES) for (const route of d.routes)
      for (let choice = 0; choice < 3; choice++)
        for (const firstDie of [1, 20]) for (const lastDie of [1, 20]) {
          let run = advanceToEncounter(d, chooseRoute(d, startRun(d, hero.id), route.id));
          if (!canAfford(run, d.encounterChoices[choice])) continue;
          run = prepareRoll(d, run, "encounter", choice);
          run = resolvePendingRoll(d, run, firstDie);
          if (run.lastRoll.success) successes++; else setbacks++;
          assert.equal(run.phase, "result");
          assert.equal(run.lastRoll.die, firstDie);
          assert.equal(run.branch, firstDie === 20 ? "clear" : "detour");
          run = continueAfterRoll(run);
          assert.equal(run.phase, "finale");
          assert.equal(getFinaleChoices(d, run).length, 3);
          run = prepareRoll(d, run, "finale", 0);
          run = resolvePendingRoll(d, run, lastDie);
          assert.equal(run.phase, "result");
          assert.equal(run.finished, true);
          assert.equal(run.ending.rolls.length, 2);
          assert.equal(run.ending.path.length, 3);
          run = continueAfterRoll(run);
          assert.equal(run.phase, "report");
          paths++;
        }
  }
  assert.ok(paths > 1000);
  assert.ok(successes > 0 && setbacks > 0);
});

test("a failed roll branches to a different finale scene and three recovery actions", () => {
  const d = getDispatch("2026-11-22");
  const start = advanceToEncounter(d, chooseRoute(d, startRun(d, "warden"), "0"));
  const good = continueAfterRoll(resolvePendingRoll(d, prepareRoll(d, start, "encounter", 0), 20));
  const bad = continueAfterRoll(resolvePendingRoll(d, prepareRoll(d, start, "encounter", 0), 1));
  assert.notEqual(getFinaleScene(d, good), getFinaleScene(d, bad));
  assert.notDeepEqual(getFinaleChoices(d, good), getFinaleChoices(d, bad));
  assert.equal(getFinaleChoices(d, bad)[2].effects.supplies, -1);
});

test("natural 20 succeeds and natural 1 fails, even outside the raw target", () => {
  const d = getDispatch("2026-11-22");
  const start = advanceToEncounter(d, chooseRoute(d, startRun(d, "warden"), "0"));
  const preview = getRollPreview(d, start, "encounter", 2);
  assert.ok(preview.dc > 0);
  assert.equal(resolvePendingRoll(d, prepareRoll(d, start, "encounter", 2), 20).lastRoll.success, true);
  assert.equal(resolvePendingRoll(d, prepareRoll(d, start, "encounter", 2), 1).lastRoll.success, false);
});

test("a final failure cannot satisfy the oath even if prior stats were high", () => {
  const d = getDispatch("2026-11-22");
  let run = advanceToEncounter(d, chooseRoute(d, startRun(d, "warden"), "1"));
  run = continueAfterRoll(resolvePendingRoll(d, prepareRoll(d, run, "encounter", 0), 20));
  run = resolvePendingRoll(d, prepareRoll(d, run, "finale", 0), 1);
  assert.equal(run.ending.keptPromise, false);
  assert.equal(run.ending.rolls[1].success, false);
  assert.equal(run.lastRoll.stage, "finale");
});

test("dice cannot be rerolled or injected at the wrong phase", () => {
  const d = getDispatch("2026-11-22");
  let run = startRun(d, "scribe");
  assert.throws(() => scout(d, run));
  assert.throws(() => chooseRoute(d, run, "bad"));
  run = chooseRoute(d, run, "0");
  run = scout(d, run);
  assert.throws(() => scout(d, run));
  run = advanceToEncounter(d, run);
  assert.throws(() => resolvePendingRoll(d, run, 20));
  run = prepareRoll(d, run, "encounter", 1);
  assert.throws(() => prepareRoll(d, run, "encounter", 1));
  assert.throws(() => resolvePendingRoll(d, run, 0));
  assert.throws(() => resolvePendingRoll(d, run, 21));
  assert.throws(() => resolvePendingRoll(d, run, 10.5));
  run = resolvePendingRoll(d, run, 12);
  assert.throws(() => resolvePendingRoll(d, run, 20));
  assert.throws(() => continueAfterRoll(continueAfterRoll(run)));
});

test("all game.js DOM IDs exist in index.html", () => {
  const js = readFileSync(new URL("../public/game.js", import.meta.url), "utf8");
  const html = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
  const ids = [...new Set([...js.matchAll(/\$\("([^"]+)"\)/g)].map((match) => match[1]))];
  for (const id of ids) assert.ok(html.includes('id="' + id + '"'), "Missing UI element: " + id);
  assert.ok(ids.length > 55);
});
