import test from "node:test";
import assert from "node:assert/strict";
import { DAILY_TWISTS, ALLIES } from "../public/generator.js";
import { getDispatch, HEROES, startRun, chooseRoute, advanceToEncounter, advanceEncounter, conclude, canAfford } from "../public/story.js";
import { applyProgressAction, emptyProfile, ProgressError } from "../public/progress.js";

const FIRST = Date.UTC(2026, 10, 11);
const keyAt = (i) => new Date(FIRST + i * 86400000).toISOString().slice(0, 10);

test("daily generator deterministically mixes original authored narrative pieces", () => {
  assert.equal(DAILY_TWISTS.length, 8);
  assert.equal(ALLIES.length, 6);
  for (let day = 0; day < 4032; day++) {
    const key = keyAt(day);
    const a = getDispatch(key);
    const b = getDispatch(key);
    assert.deepEqual(a, b);
    assert.equal(a.encounterChoices.length, 3);
    assert.equal(a.finaleChoices.length, 3);
    assert.ok(a.introduction.includes(a.twist.description));
    assert.ok(a.witness.includes(a.ally.introduction));
    assert.ok(a.encounter.includes(a.twist.encounter));
    assert.ok(a.finale.includes(a.twist.finale));
    assert.equal(a.routes.length, 3);
    assert.ok(a.routes.some((r) => r.reliable), "At least one trustworthy map route");
    assert.equal(a.encounterChoices[2].effects.supplies, -1);
    assert.equal(a.finaleChoices[2].effects.supplies, -1);
  }
});

test("4032 non-repeated date combinations before the modular deck cycles", () => {
  const combinations = new Set();
  for (let day = 0; day < 4032; day++) {
    combinations.add(getDispatch(keyAt(day)).editionId);
  }
  assert.equal(combinations.size, 4032);
  assert.equal(getDispatch(keyAt(0)).editionId, getDispatch(keyAt(4032)).editionId);
  assert.notEqual(getDispatch(keyAt(0)).editionId, getDispatch(keyAt(84)).editionId);
});

test("each generated branch is actionable and affects the saved outcome", () => {
  let visited = 0, kept = 0, returned = 0;
  for (let day = 0; day < 84; day++) {
    const d = getDispatch(keyAt(day));
    for (const hero of HEROES) for (const route of d.routes)
      for (let encounter = 0; encounter < 3; encounter++)
        for (let ending = 0; ending < 3; ending++) {
          let run = chooseRoute(d, startRun(d, hero.id), route.id);
          run = advanceToEncounter(d, run);
          if (!canAfford(run, d.encounterChoices[encounter])) continue;
          run = advanceEncounter(d, run, encounter);
          if (!canAfford(run, d.finaleChoices[ending])) continue;
          run = conclude(d, run, ending);
          assert.equal(run.phase, "report");
          assert.equal(run.ending.path.length, 3);
          assert.ok(Number.isInteger(run.ending.score));
          visited++;
          if (run.ending.keptPromise) kept++;
          if (!run.ending.arrived) returned++;
        }
  }
  assert.ok(visited > 4000);
  assert.ok(kept > 0);
  assert.ok(returned > 0);
});

test("saved Reddit progress accepts a generated third option but not forged indices", () => {
  const day = "2026-11-22";
  let p = emptyProfile();
  p = applyProgressAction(p, day, { type: "start", heroId: "tinker" });
  p = applyProgressAction(p, day, { type: "route", routeId: "0" });
  p = applyProgressAction(p, day, { type: "commit" });
  p = applyProgressAction(p, day, { type: "encounter", index: 2 });
  assert.equal(p.run.stats.supplies, 1);
  assert.throws(() => applyProgressAction(p, day, { type: "finale", index: 3 }), ProgressError);
  p = applyProgressAction(p, day, { type: "finale", index: 2 });
  assert.equal(p.run.stats.supplies, 0);
  assert.equal(p.history.length, 1);
  assert.equal(p.run.phase, "report");
});

test("a character with exhausted supplies cannot take another trade", () => {
  const d = getDispatch("2026-11-22");
  let run = advanceToEncounter(d, chooseRoute(d, startRun(d, "warden"), "0"));
  run = advanceEncounter(d, run, 2);
  assert.equal(run.stats.supplies, 0);
  assert.equal(canAfford(run, d.finaleChoices[2]), false);
  assert.throws(() => conclude(d, run, 2), /Not enough supplies/);
});
