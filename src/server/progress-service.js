import { randomInt } from "node:crypto";
import { applyProgressAction, emptyProfile, normalizeProfile, projectProfile, ProgressError } from "../../public/progress.js";

// Devvit Redis is namespaced by subreddit installation. Keys deliberately use
// the server-supplied context.userId, never a username or client-provided ID.
export const PROGRESS_TTL_SECONDS = 60 * 60 * 24 * 30;

export function accountKey(userId) {
  if (typeof userId !== "string" || !/^t2_[a-zA-Z0-9]+$/.test(userId)) {
    throw new ProgressError("Sign in to Reddit to save your adventure", 401);
  }
  return "unreliable-map:player:v1:" + userId;
}

async function load(redis, key) {
  const stored = await redis.get(key);
  if (stored == null) return emptyProfile();
  let profile;
  try { profile = JSON.parse(stored); }
  catch { throw new ProgressError("Saved adventure could not be read. Nothing was overwritten.", 500); }
  if (!profile || profile.schema !== 1) throw new ProgressError("Unsupported saved adventure version.", 500);
  return normalizeProfile(profile);
}

export async function getAccountProgress(redis, userId, dayKey) {
  const key = accountKey(userId);
  const profile = await load(redis, key);
  // Auto-delete account-linked data after 30 days without use, per Reddit guidance.
  if (profile.revision) await redis.expire(key, PROGRESS_TTL_SECONDS);
  return projectProfile(profile, dayKey);
}

export async function updateAccountProgress(redis, userId, dayKey, expectedRevision, action) {
  const key = accountKey(userId);
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) {
    throw new ProgressError("Missing or invalid revision number");
  }
  // WATCH prevents two devices from overwriting one another's progress after
  // both read the same revision. A transaction failure returns a conflict.
  const tx = await redis.watch(key);
  let finished = false;
  try {
    const previousValue = await tx.get(key);
    let previous;
    if (previousValue == null) previous = emptyProfile();
    else {
      try { previous = JSON.parse(previousValue); }
      catch { throw new ProgressError("Saved adventure could not be read. Nothing was overwritten.", 500); }
      if (previous?.schema !== 1) throw new ProgressError("Unsupported saved adventure version.", 500);
      previous = normalizeProfile(previous);
    }
    if (previous.revision !== expectedRevision) {
      throw new ProgressError("Another device updated this adventure. Reload to continue.", 409);
    }
    // Secure and authoritative: the client chooses an action, never the die.
    // Revisions/phase are checked before rolling; the result is committed with
    // the full player state so reloads cannot request a free reroll.
    const trustedDie = action?.type === "roll" ? randomInt(1, 21) : undefined;
    const next = applyProgressAction(previous, dayKey, action, trustedDie);
    await tx.multi();
    await tx.set(key, JSON.stringify(next));
    await tx.expire(key, PROGRESS_TTL_SECONDS);
    const result = await tx.exec();
    finished = true;
    if (result === null || result === false) {
      throw new ProgressError("Another device updated this adventure. Reload to continue.", 409);
    }
    return projectProfile(next, dayKey);
  } finally {
    if (!finished) {
      try { await tx.unwatch(); } catch { /* an aborted transaction is already closed */ }
    }
  }
}

export async function deleteAccountProgress(redis, userId, dayKey) {
  await redis.del(accountKey(userId));
  return projectProfile(emptyProfile(), dayKey);
}
