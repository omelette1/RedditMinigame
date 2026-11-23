import test from "node:test";
import assert from "node:assert/strict";
import { DAILY_TWISTS, ALLIES } from "../public/generator.js";
import { getDispatch, HEROES, startRun, chooseRoute, advanceToEncounter,
  prepareRoll, resolvePendingRoll, continueAfterRoll, getFinaleChoices, canAfford } from "../public/story.js";
import { applyProgressAction, emptyProfile, ProgressError } from "../public/progress.js";

const FIRST = Date.UTC(2026, 10, 11);
const keyAt = (i) => new Date(FIRST + i * 86400000).toISOString().slice(0, 10);

test("all 4032 authored daily combinations are deterministic", () => {
  assert.equal(DAILY_TWISTS.length, 8);
  assert.equal(ALLIES.length, 6);
  const combos = new Set();
  for (let day = 0; day < 4032; day++) {
    const key = keyAt(day);
    const a = getDispatch(key), b = getDispatch(key);
    assert.deepEqual(a, b);
    combos.add(a.editionId);
    assert.equal(a.encounterChoices.length, 3);
    assert.equal(a.finaleChoices.length, 3);
    assert.equal(a.recoveryChoices.length, 3);
    assert.ok(a.introduction.includes(a.twist.description));
    assert.ok(a.witness.includes(a.ally.introduction));
    assert.ok(a.routes.some((route) => route.reliable));
    assert.equal(a.finaleChoices[2].effects.supplies, -1);
    assert.equal(a.recoveryChoices[2].effects.supplies, -1);
  }
  assert.equal(combos.size, 4032);
  assert.equal(getDispatch(keyAt(0)).editionId, getDispatch(keyAt(4032)).editionId);
  assert.notEqual(getDispatch(keyAt(0)).editionId, getDispatch(keyAt(84)).editionId);
});

test("every generated roll branch and three final alternatives play without exceptions", () => {
  let count = 0, detours = 0, keptPromises = 0;
  for (let day = 0; day < 84; day++) {
    const d = getDispatch(keyAt(day));
    for (const hero of HEROES) for (const route of d.routes)
      for (let encounter = 0; encounter < 3; encounter++)
        for (const firstRoll of [1, 20])
          for (let ending = 0; ending < 3; ending++)
            for (const lastRoll of [1, 20]) {
              let run = advanceToEncounter(d, chooseRoute(d, startRun(d, hero.id), route.id));
              if (!canAfford(run, d.encounterChoices[encounter])) continue;
              run = prepareRoll(d, run, "encounter", encounter);
              run = continueAfterRoll(resolvePendingRoll(d, run, firstRoll));
              const finals = getFinaleChoices(d, run);
              if (!canAfford(run, finals[ending])) continue;
              run = prepareRoll(d, run, "finale", ending);
              run = continueAfterRoll(resolvePendingRoll(d, run, lastRoll));
              assert.equal(run.phase, "report");
              assert.equal(run.ending.rolls.length, 2);
              assert.ok(Number.isInteger(run.ending.score));
              if (run.ending.detour) detours++;
              if (run.ending.keptPromise) keptPromises++;
              count++;
            }
  }
  assert.ok(count > 8000, "Expected many real branch/roll combinations");
  assert.ok(detours > 0 && keptPromises > 0);
});

test("a Reddit save accepts a third option, persists the two dice and rejects forged roll values", () => {
  const day = "2026-11-22";
  let p = emptyProfile();
  for (const action of [{ type: "start", heroId: "tinker" },
    { type: "route", routeId: "0" }, { type: "commit" },
    { type: "encounter", index: 2 }]) p = applyProgressAction(p, day, action);
  assert.equal(p.run.phase, "roll");
  assert.throws(() => applyProgressAction(p, day, { type: "roll", die: 20 }), ProgressError);
  p = applyProgressAction(p, day, { type: "roll", die: 1 }, 20);
  assert.equal(p.run.lastRoll.die, 20);
  assert.equal(p.run.stats.supplies, 1);
  p = applyProgressAction(p, day, { type: "continue" });
  p = applyProgressAction(p, day, { type: "finale", index: 2 });
  assert.equal(p.run.phase, "roll");
  assert.throws(() => applyProgressAction(p, day, { type: "finale", index: 3 }), ProgressError);
  p = applyProgressAction(p, day, { type: "roll" }, 20);
  assert.equal(p.run.stats.supplies, 0);
  assert.equal(p.history.length, 1);
  assert.equal(p.history[0].rolls.length, 2);
  p = applyProgressAction(p, day, { type: "continue" });
  assert.equal(p.run.phase, "report");
});

test("exhausted supplies block both ally options", () => {
  const d = getDispatch("2026-11-22");
  let run = advanceToEncounter(d, chooseRoute(d, startRun(d, "warden"), "0"));
  run = continueAfterRoll(resolvePendingRoll(d, prepareRoll(d, run, "encounter", 2), 20));
  assert.equal(run.stats.supplies, 0);
  assert.equal(canAfford(run, getFinaleChoices(d, run)[2]), false);
  assert.throws(() => prepareRoll(d, run, "finale", 2), /Not enough supplies/);
});
