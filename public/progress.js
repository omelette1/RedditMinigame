// Pure state transitions shared by the standalone client and trusted Reddit server.
// The caller NEVER supplies an identity, score, history, stat block or full run.
import { getDispatch, HEROES, startRun, chooseRoute, scout, advanceToEncounter, advanceEncounter, conclude } from "./story.js";

export const MAX_HISTORY = 40;
export const PROFILE_SCHEMA = 1;
const ACTIONS = new Set(["start", "route", "scout", "commit", "encounter", "finale", "restart"]);

export function emptyProfile() {
  return { schema: PROFILE_SCHEMA, revision: 0, currentDay: null, run: null,
    firstByDay: {}, history: [], totalCompleted: 0 };
}

export class ProgressError extends Error {
  constructor(message, status = 400) { super(message); this.name = "ProgressError"; this.status = status; }
}

export function normalizeProfile(value) {
  if (!value || typeof value !== "object" || value.schema !== PROFILE_SCHEMA ||
    !Number.isSafeInteger(value.revision) || value.revision < 0 ||
    !Array.isArray(value.history) || !Number.isSafeInteger(value.totalCompleted) ||
    !value.firstByDay || typeof value.firstByDay !== "object" || Array.isArray(value.firstByDay)) return emptyProfile();
  const p = emptyProfile();
  p.revision = value.revision;
  p.currentDay = typeof value.currentDay === "string" ? value.currentDay : null;
  p.run = value.run && typeof value.run === "object" ? value.run : null;
  p.firstByDay = value.firstByDay;
  p.history = value.history.slice(0, MAX_HISTORY);
  p.totalCompleted = Math.max(0, value.totalCompleted);
  return p;
}

function currentProfile(value, dayKey) {
  const p = normalizeProfile(value);
  // Old completed outcomes live in history; an unfinished older day cannot
  // silently become the next day's quest.
  if (p.currentDay !== dayKey) {
    p.currentDay = dayKey;
    p.run = null;
  }
  return p;
}

export function projectProfile(value, dayKey) {
  const p = currentProfile(value, dayKey);
  return { dayKey, revision: p.revision, run: p.run,
    first: p.firstByDay[dayKey] ?? null, history: p.history,
    totalCompleted: p.totalCompleted };
}

function simpleText(value, max = 64) {
  return typeof value === "string" && value.length <= max;
}

export function applyProgressAction(value, dayKey, action) {
  if (!action || typeof action !== "object" || Array.isArray(action) || !ACTIONS.has(action.type)) {
    throw new ProgressError("Unknown progress action");
  }
  // Clone after normalization; never mutate the previous profile or the Redis
  // copy referenced by another request.
  const p = structuredClone(currentProfile(value, dayKey));
  const d = getDispatch(dayKey);
  const current = p.run;
  try {
    switch (action.type) {
      case "start":
        if (!simpleText(action.heroId) || !HEROES.some((h) => h.id === action.heroId)) throw new ProgressError("Invalid character");
        if (current && current.phase !== "report") throw new ProgressError("Finish or restart the current journey first");
        p.run = startRun(d, action.heroId);
        break;
      case "restart":
        // Explicitly discard only the current run, not the archive.
        p.run = null;
        break;
      case "route":
        if (!current || !simpleText(action.routeId) || current.phase !== "route") throw new ProgressError("Cannot choose a route now");
        p.run = chooseRoute(d, current, action.routeId);
        break;
      case "scout":
        if (!current) throw new ProgressError("Start an expedition first");
        p.run = scout(d, current);
        break;
      case "commit":
        if (!current) throw new ProgressError("Start an expedition first");
        p.run = advanceToEncounter(d, current);
        break;
      case "encounter":
        if (!current || !Number.isInteger(action.index) || ![0, 1].includes(action.index)) throw new ProgressError("Invalid encounter decision");
        p.run = advanceEncounter(d, current, action.index);
        break;
      case "finale": {
        if (!current || !Number.isInteger(action.index) || ![0, 1].includes(action.index)) throw new ProgressError("Invalid final decision");
        p.run = conclude(d, current, action.index);
        const e = p.run.ending;
        const record = {
          dayKey, questId: d.id, questTitle: d.title, heroId: p.run.heroId,
          routeName: e.routeName, title: e.title, rank: e.rank,
          score: e.score, arrived: e.arrived, keptPromise: e.keptPromise, discovered: e.discovered,
          // Store outcome/choices only. No Reddit post, comment or user content.
          encounterChoice: p.run.encounterChoice, finalChoice: p.run.finalChoice,
        };
        if (!p.firstByDay[dayKey]) p.firstByDay[dayKey] = record;
        p.history = [record, ...p.history].slice(0, MAX_HISTORY);
        p.totalCompleted++;
        // Retain the latest N first results rather than growing profile forever.
        const days = Object.keys(p.firstByDay).sort().reverse();
        for (const stale of days.slice(MAX_HISTORY)) delete p.firstByDay[stale];
        break;
      }
    }
  } catch (error) {
    if (error instanceof ProgressError) throw error;
    throw new ProgressError("This action is unavailable at the current stage");
  }
  p.revision++;
  return p;
}
