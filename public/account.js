import { emptyProfile, applyProgressAction, projectProfile } from "./progress.js";
import { pacificDayKey } from "./story.js";

// For the actual Devvit game, the Reddit server is authoritative.
// Standalone localhost development uses an explicitly labeled local-only save.
const LOCAL_KEY = "unreliable-map:localhost:profile:v1";
let mode = "loading";
let profile = null;

const localHost = () => ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);

function localLoad() {
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : emptyProfile();
  } catch { return emptyProfile(); }
}


// In the localhost demo, use the browser's cryptographic generator rather
// than Math.random. Reddit play uses the server's node:crypto randomInt.
function localD20() {
  if (!globalThis.crypto?.getRandomValues) throw new Error("Secure dice are unavailable in this browser.");
  const number = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / 20) * 20;
  do { globalThis.crypto.getRandomValues(number); } while (number[0] >= limit);
  return (number[0] % 20) + 1;
}

function localSave(value) {
  try { window.localStorage.setItem(LOCAL_KEY, JSON.stringify(value)); }
  catch { throw new Error("This browser cannot save your local demo progress."); }
}

function assertPayload(payload) {
  if (!payload || typeof payload.dayKey !== "string" || !Number.isSafeInteger(payload.revision) ||
    !Array.isArray(payload.history) || typeof payload.totalCompleted !== "number") {
    throw new Error("The progress server returned an invalid response.");
  }
  return payload;
}

async function request(path, options) {
  const result = await fetch(path, { cache: "no-store", credentials: "same-origin", ...options });
  let json = null;
  try { json = await result.json(); } catch { /* server unavailable or not JSON */ }
  if (!result.ok) {
    const error = new Error(json?.error ?? (result.status === 401 ? "Sign in to Reddit to save progress." : "Unable to contact the save server."));
    error.status = result.status;
    throw error;
  }
  return assertPayload(json);
}

function localView() {
  const dayKey = pacificDayKey();
  return { mode, ...projectProfile(profile, dayKey) };
}

export async function loadPlayer() {
  try {
    const data = await request("/api/progress");
    mode = "reddit";
    return { mode, ...data };
  } catch (error) {
    if (localHost()) {
      mode = "local";
      profile = localLoad();
      return localView();
    }
    mode = error.status === 401 ? "signed-out" : "unavailable";
    throw error;
  }
}

export async function submitPlayerAction(revision, action) {
  if (mode === "local") {
    if (localView().revision !== revision) throw new Error("The demo progress changed in another tab. Reload to continue.");
    profile = applyProgressAction(profile, pacificDayKey(), action, action?.type === "roll" ? localD20() : undefined);
    localSave(profile);
    return localView();
  }
  if (mode !== "reddit") throw new Error("Reddit account sync is unavailable. Your choice was not saved.");
  const data = await request("/api/progress/action", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ revision, action }),
  });
  return { mode, ...data };
}

export async function erasePlayer() {
  if (mode === "local") {
    profile = emptyProfile();
    try { window.localStorage.removeItem(LOCAL_KEY); } catch { /* no data to remove */ }
    return localView();
  }
  if (mode !== "reddit") throw new Error("Not connected to Reddit.");
  const data = await request("/api/progress", { method: "DELETE" });
  return { mode, ...data };
}

export function playerMode() { return mode; }
