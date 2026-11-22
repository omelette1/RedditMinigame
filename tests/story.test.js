import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { QUESTS, HEROES, OMENS, getDispatch, pacificDayKey, startRun, chooseRoute, scout, advanceToEncounter, advanceEncounter, conclude } from "../public/story.js";

test("authored episodes have complete routes and branch choices", () => {
  assert.equal(QUESTS.length, 12);
  assert.equal(OMENS.length, 7);
  assert.equal(HEROES.length, 3);
  for (const quest of QUESTS) {
    assert.equal(quest.routes.length, 3, quest.id);
    assert.equal(quest.encounterChoices.length, 2, quest.id);
    assert.equal(quest.finaleChoices.length, 2, quest.id);
    assert.ok(quest.introduction && quest.promise && quest.witness, quest.id);
    for (const route of quest.routes) assert.ok(route.scene && route.claim && route.evidence, quest.id);
    for (const choice of [...quest.encounterChoices, ...quest.finaleChoices]) {
      assert.ok(choice.label && choice.detail && choice.result, quest.id);
      assert.ok(Object.keys(choice.effects).every((stat) => ["resolve", "supplies", "insight", "oath"].includes(stat)));
    }
  }
});

test("date in Pacific time changes only at midnight, including winter", () => {
  assert.equal(pacificDayKey(new Date("2026-11-22T07:59:59Z")), "2026-11-21");
  assert.equal(pacificDayKey(new Date("2026-11-22T08:00:00Z")), "2026-11-22");
  assert.equal(pacificDayKey(new Date("2026-07-21T06:59:59Z")), "2026-07-20");
  assert.equal(pacificDayKey(new Date("2026-07-21T07:00:00Z")), "2026-07-21");
});

test("the same date produces identical chapters, omens and map reliability", () => {
  assert.deepEqual(getDispatch("2026-11-22"), getDispatch("2026-11-22"));
  assert.notEqual(getDispatch("2026-11-22").id, getDispatch("2026-11-23").id);
});

test("84 consecutive daily combinations are distinct before the deck cycles", () => {
  const seen = new Set();
  const start = Date.UTC(2026, 10, 11);
  for (let i = 0; i < 84; i++) {
    const key = new Date(start + i * 86400000).toISOString().slice(0, 10);
    const d = getDispatch(key);
    seen.add(d.id + ":" + d.omen.id);
    assert.equal(d.routes.length, 3);
    assert.ok(d.routes.some((route) => route.reliable), "At least one map route should be truthful");
  }
  assert.equal(seen.size, 84);
});

test("every hero / route / encounter / finale branch completes without a roll", () => {
  const start = Date.UTC(2026, 10, 11);
  let runs = 0;
  let success = 0;
  let retreats = 0;
  for (let i = 0; i < 84; i++) {
    const d = getDispatch(new Date(start + i * 86400000).toISOString().slice(0, 10));
    for (const hero of HEROES) for (const route of d.routes) for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) {
      let run = startRun(d, hero.id);
      run = chooseRoute(d, run, route.id);
      if (a === 1) run = scout(d, run);
      run = advanceToEncounter(d, run);
      run = advanceEncounter(d, run, a);
      run = conclude(d, run, b);
      assert.equal(run.phase, "report");
      assert.equal(run.history.length, 3);
      assert.equal(run.ending.routeName, route.name);
      assert.ok(Number.isFinite(run.ending.score));
      runs++;
      if (run.ending.keptPromise) success++;
      if (!run.ending.arrived) retreats++;
    }
  }
  assert.equal(runs, 3024);
  assert.ok(success > 0);
  assert.ok(retreats > 0);
});

test("branch decisions change the chronicle and outcome", () => {
  const d = getDispatch("2026-11-22");
  const start = advanceToEncounter(d, chooseRoute(d, startRun(d, "warden"), "0"));
  const brave = conclude(d, advanceEncounter(d, start, 0), 0);
  const careful = conclude(d, advanceEncounter(d, start, 1), 1);
  assert.notDeepEqual(brave.ending.path, careful.ending.path);
  assert.notEqual(brave.ending.score, careful.ending.score);
});

test("invalid interactions are rejected", () => {
  const d = getDispatch("2026-11-22");
  let run = startRun(d, "scribe");
  assert.throws(() => scout(d, run));
  assert.throws(() => chooseRoute(d, run, "bad"));
  run = chooseRoute(d, run, "0");
  run = scout(d, run);
  assert.throws(() => scout(d, run));
  run = advanceToEncounter(d, run);
  assert.throws(() => chooseRoute(d, run, "1"));
  assert.throws(() => conclude(d, run, 0));
});

test("all dynamic UI element IDs referenced by game.js are present in HTML", () => {
  const js = readFileSync(new URL("../public/game.js", import.meta.url), "utf8");
  const html = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
  const ids = [...js.matchAll(/\$\("([^"]+)"\)/g)].map((match) => match[1]);
  const unique = [...new Set(ids)];
  for (const id of unique) assert.ok(html.includes('id="' + id + '"'), "Missing element ID: " + id);
  assert.ok(unique.length > 35);
});
