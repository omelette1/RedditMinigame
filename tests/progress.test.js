import test from "node:test";
import assert from "node:assert/strict";
import { emptyProfile, applyProgressAction, projectProfile, ProgressError } from "../public/progress.js";
import { accountKey, getAccountProgress, updateAccountProgress, deleteAccountProgress, PROGRESS_TTL_SECONDS } from "../src/server/progress-service.js";

const DAY = "2026-11-22";
const OTHER = "2026-11-23";
const firstActions = [
  { type: "start", heroId: "warden" }, { type: "route", routeId: "0" },
  { type: "commit" }, { type: "encounter", index: 0 },
];
const finish = async (db, id, state, firstDie = undefined, finalDie = undefined) => {
  // Caller never sends the die. The trusted service injects a secure D20.
  state = await updateAccountProgress(db, id, DAY, state.revision, { type: "roll", die: firstDie });
  state = await updateAccountProgress(db, id, DAY, state.revision, { type: "continue" });
  state = await updateAccountProgress(db, id, DAY, state.revision, { type: "finale", index: 0 });
  state = await updateAccountProgress(db, id, DAY, state.revision, { type: "roll", die: finalDie });
  return state;
};

class FakeRedis {
  constructor() { this.data = new Map(); this.ttls = new Map(); this.writes = 0; }
  async get(key) { return this.data.get(key) ?? null; }
  async set(key, value) { this.data.set(key, value); this.writes++; }
  async del(key) { this.data.delete(key); this.ttls.delete(key); }
  async expire(key, ttl) { this.ttls.set(key, ttl); return true; }
  async watch(key) {
    const version = this.data.get(key);
    const ops = [];
    let transaction = false;
    return {
      get: async (k) => this.get(k),
      multi: async () => { transaction = true; },
      set: async (k,v) => { if (!transaction) throw Error("transaction required"); ops.push(["set",k,v]); },
      expire: async (k,v) => { if (!transaction) throw Error("transaction required"); ops.push(["expire",k,v]); },
      exec: async () => {
        if (this.data.get(key) !== version) return null;
        for (const [op,k,v] of ops) await this[op](k,v);
        return [];
      },
      unwatch: async () => {},
    };
  }
}

test("saves are isolated by authenticated Reddit user ID", async () => {
  const db = new FakeRedis(), a = "t2_alpha", b = "t2_bravo";
  assert.notEqual(accountKey(a), accountKey(b));
  assert.throws(() => accountKey("../alpha"), ProgressError);
  const state = await updateAccountProgress(db, a, DAY, 0, {
    type: "start", heroId: "scribe", userId: b, stats: { oath: 999 },
  });
  assert.equal(state.run.heroId, "scribe");
  assert.equal(state.run.stats.oath, 0);
  assert.equal((await getAccountProgress(db,b,DAY)).run, null);
});

test("each pending action and dice outcome survives a fresh account read", async () => {
  const db = new FakeRedis(), id = "t2_saved";
  let state = await getAccountProgress(db,id,DAY);
  for (const action of firstActions) {
    state = await updateAccountProgress(db,id,DAY,state.revision,action);
    assert.deepEqual((await getAccountProgress(db,id,DAY)).run,state.run);
  }
  assert.equal(state.run.phase, "roll");
  state = await updateAccountProgress(db,id,DAY,state.revision,{ type: "roll", die: 999 });
  assert.equal(state.run.phase, "result");
  assert.ok(state.run.lastRoll.die >= 1 && state.run.lastRoll.die <= 20);
  assert.deepEqual((await getAccountProgress(db,id,DAY)).run,state.run);
  assert.equal(db.ttls.get(accountKey(id)),PROGRESS_TTL_SECONDS);
  const savedDie = state.run.lastRoll.die;
  await assert.rejects(updateAccountProgress(db,id,DAY,state.revision,{ type: "roll", die: 20 }), (e) => e.status === 400);
  assert.equal((await getAccountProgress(db,id,DAY)).run.lastRoll.die,savedDie);
});

test("final dice result and chronicle are persisted once, not per resume", async () => {
  const db = new FakeRedis(), id = "t2_finished";
  let state = await getAccountProgress(db,id,DAY);
  for (const action of firstActions) state = await updateAccountProgress(db,id,DAY,state.revision,action);
  state = await finish(db,id,state,999,999);
  assert.equal(state.run.phase,"result");
  assert.equal(state.totalCompleted,1);
  assert.equal(state.history[0].rolls.length,2);
  assert.equal(state.first.rolls.length,2);
  const score = state.run.ending.score;
  state = await updateAccountProgress(db,id,DAY,state.revision,{ type: "continue" });
  assert.equal(state.run.phase,"report");
  assert.equal(state.totalCompleted,1);
  assert.equal((await getAccountProgress(db,id,DAY)).run.ending.score,score);
});

test("invalid actions and concurrent stale revisions cannot alter a saved run", async () => {
  const db = new FakeRedis(), id = "t2_race";
  await updateAccountProgress(db,id,DAY,0,{ type:"start",heroId:"warden" });
  await assert.rejects(updateAccountProgress(db,id,DAY,0,{ type:"restart" }), (e) => e.status === 409);
  await assert.rejects(updateAccountProgress(db,id,DAY,1,{ type:"roll",die:20 }), (e) => e.status === 400);
  assert.equal((await getAccountProgress(db,id,DAY)).revision,1);
});

test("a failed encounter opens recovery choices on a saved run", () => {
  let p = emptyProfile();
  for (const action of firstActions) p = applyProgressAction(p,DAY,action);
  p = applyProgressAction(p,DAY,{ type:"roll" },1);
  assert.equal(p.run.branch,"detour");
  assert.equal(p.run.phase,"result");
  p = applyProgressAction(p,DAY,{ type:"continue" });
  assert.equal(p.run.phase,"finale");
  p = applyProgressAction(p,DAY,{ type:"finale",index:2 });
  assert.equal(p.run.pendingRoll.stage,"finale");
});

test("after Pacific midnight the unfinished run resets but history remains", async () => {
  const db = new FakeRedis(), id = "t2_daily";
  let state = await getAccountProgress(db,id,DAY);
  for (const action of firstActions) state = await updateAccountProgress(db,id,DAY,state.revision,action);
  state = await finish(db,id,state);
  const next = await getAccountProgress(db,id,OTHER);
  assert.equal(next.run,null);
  assert.equal(next.totalCompleted,1);
  assert.equal(next.history[0].dayKey,DAY);
});

test("replay retains history and deleting user saves clears it", async () => {
  const db = new FakeRedis(), id = "t2_erase";
  let state = await getAccountProgress(db,id,DAY);
  for (const action of firstActions) state = await updateAccountProgress(db,id,DAY,state.revision,action);
  state = await finish(db,id,state);
  state = await updateAccountProgress(db,id,DAY,state.revision,{ type:"continue" });
  state = await updateAccountProgress(db,id,DAY,state.revision,{ type:"restart" });
  assert.equal(state.run,null);
  assert.equal(state.history.length,1);
  const erased = await deleteAccountProgress(db,id,DAY);
  assert.equal(erased.history.length,0);
  assert.equal((await getAccountProgress(db,id,DAY)).revision,0);
});

test("bounded 40-result archive retains first-play score and two dice per entry", () => {
  let p = emptyProfile();
  const start = Date.UTC(2026,10,1);
  for(let i=0;i<48;i++) {
    const key = new Date(start+i*86400000).toISOString().slice(0,10);
    const actions=[{ type:"start",heroId:"scribe" },{ type:"route",routeId:"0" },
      { type:"commit" },{ type:"encounter",index:0 },{ type:"roll" },
      { type:"continue" },{ type:"finale",index:1 },{ type:"roll" }];
    for(const action of actions) p = applyProgressAction(p,key,action,action.type === "roll" ? 20 : undefined);
  }
  const lastKey = new Date(start+47*86400000).toISOString().slice(0,10);
  const view = projectProfile(p,lastKey);
  assert.equal(view.history.length,40);
  assert.equal(p.totalCompleted,48);
  assert.equal(Object.keys(p.firstByDay).length,40);
  assert.equal(view.first.rolls.length,2);
});
