import test from "node:test";
import assert from "node:assert/strict";
import { emptyProfile, applyProgressAction, projectProfile, ProgressError } from "../public/progress.js";
import { accountKey, getAccountProgress, updateAccountProgress, deleteAccountProgress, PROGRESS_TTL_SECONDS } from "../src/server/progress-service.js";

const DAY = "2026-11-22";
const OTHER = "2026-11-23";

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

test("progress is strictly keyed by the authenticated server Reddit ID", async () => {
  const store = new FakeRedis();
  const a = "t2_alpha";
  const b = "t2_bravo";
  assert.notEqual(accountKey(a), accountKey(b));
  assert.throws(() => accountKey("../alpha"), ProgressError);
  let one = await getAccountProgress(store, a, DAY);
  assert.equal(one.revision, 0);
  one = await updateAccountProgress(store, a, DAY, 0, { type: "start", heroId: "scribe", userId: b, stats: { oath: 999 } });
  assert.equal(one.run.heroId, "scribe");
  assert.equal(one.run.stats.oath, 0);
  const other = await getAccountProgress(store, b, DAY);
  assert.equal(other.run, null);
  assert.equal(other.totalCompleted, 0);
});

test("restores the entire current run across reads and never trusts client score", async () => {
  const store = new FakeRedis();
  const id = "t2_reader";
  let state = await getAccountProgress(store,id,DAY);
  for (const action of [
    {type:"start",heroId:"warden"},{type:"route",routeId:"0"},{type:"scout"},
    {type:"commit"},{type:"encounter",index:0},{type:"finale",index:0,score:999999}
  ]) {
    state = await updateAccountProgress(store,id,DAY,state.revision,action);
    const roundTrip = await getAccountProgress(store,id,DAY);
    assert.deepEqual(roundTrip.run,state.run);
  }
  assert.equal(state.run.phase,"report");
  assert.equal(state.totalCompleted,1);
  assert.notEqual(state.history[0].score,999999);
  assert.equal(state.first.score,state.run.ending.score);
  assert.equal(store.ttls.get(accountKey(id)),PROGRESS_TTL_SECONDS);
});

test("stale revisions and invalid actions cannot modify another device's save", async () => {
  const store = new FakeRedis();
  const id = "t2_collision";
  await updateAccountProgress(store,id,DAY,0,{type:"start",heroId:"warden"});
  await assert.rejects(updateAccountProgress(store,id,DAY,0,{type:"restart"}),e=>e.status===409);
  await assert.rejects(updateAccountProgress(store,id,DAY,1,{type:"finale",index:1}),e=>e.status===400);
  assert.equal((await getAccountProgress(store,id,DAY)).revision,1);
});

test("untrusted run objects are ignored and invalid transitions rejected", () => {
  let p = emptyProfile();
  p = applyProgressAction(p,DAY,{type:"start",heroId:"scribe",run:{stats:{oath:999}}});
  assert.equal(p.run.stats.oath,0);
  assert.throws(()=>applyProgressAction(p,DAY,{type:"finale",index:0}),ProgressError);
  assert.throws(()=>applyProgressAction(p,DAY,{type:"route",routeId:"99"}),ProgressError);
});

test("new Pacific day clears active progress but retains completed history", async () => {
  const store = new FakeRedis();
  const id = "t2_daily";
  let state = await getAccountProgress(store,id,DAY);
  for (const action of [{type:"start",heroId:"tinker"},{type:"route",routeId:"1"},
    {type:"commit"},{type:"encounter",index:1},{type:"finale",index:1}]) {
      state=await updateAccountProgress(store,id,DAY,state.revision,action);
  }
  const tomorrow=await getAccountProgress(store,id,OTHER);
  assert.equal(tomorrow.run,null);
  assert.equal(tomorrow.totalCompleted,1);
  assert.equal(tomorrow.history[0].dayKey,DAY);
  assert.equal(tomorrow.first,null);
});

test("replay preserves history but deleting account clears everything",async()=>{
  const store=new FakeRedis(), id="t2_erase";
  let state=await getAccountProgress(store,id,DAY);
  for(const action of [{type:"start",heroId:"warden"},{type:"route",routeId:"2"},{type:"commit"},
    {type:"encounter",index:0},{type:"finale",index:1},{type:"restart"}]){
      state=await updateAccountProgress(store,id,DAY,state.revision,action);
  }
  assert.equal(state.run,null);
  assert.equal(state.history.length,1);
  const erased=await deleteAccountProgress(store,id,DAY);
  assert.equal(erased.history.length,0);
  assert.equal(erased.totalCompleted,0);
  assert.equal((await getAccountProgress(store,id,DAY)).revision,0);
});

test("profile history remains bounded",()=>{
  let p=emptyProfile();
  let day=Date.UTC(2026,10,1);
  for(let i=0;i<48;i++){
    const key=new Date(day+i*86400000).toISOString().slice(0,10);
    for (const action of [{type:"start",heroId:"scribe"},{type:"route",routeId:"0"},
    {type:"commit"},{type:"encounter",index:0},{type:"finale",index:0}]) p=applyProgressAction(p,key,action);
  }
  const view=projectProfile(p,new Date(day+47*86400000).toISOString().slice(0,10));
  assert.equal(view.history.length,40);
  assert.equal(p.totalCompleted,48);
  assert.equal(Object.keys(p.firstByDay).length,40);
});
