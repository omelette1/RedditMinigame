import { HEROES, pacificDayKey, getDispatch, startRun, chooseRoute, scout, advanceToEncounter, canAfford, advanceEncounter, conclude } from "./story.js";

const $ = (id) => document.getElementById(id);
const screens = ["cover", "hero", "route", "encounter", "finale", "report"];
const validRunPhases = new Set(["route", "encounter", "finale", "report"]);
let dispatch;
let run = null;
let heroDraft = null;
let screen = "cover";

function readJSON(key, fallback = null) {
  try { const raw = window.localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  catch { return fallback; }
}
function saveJSON(key, value) {
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* browser storage is optional */ }
}
const runKey = (day) => "um:run:v2:" + day;
const firstKey = (day) => "um:first:v2:" + day;

function safeSavedRun(dayKey) {
  const saved = readJSON(runKey(dayKey));
  if (!saved || saved.dayKey !== dayKey || !validRunPhases.has(saved.phase) || !HEROES.some((hero) => hero.id === saved.heroId) ||
    !saved.stats || !["resolve", "supplies", "insight", "oath"].every((key) => Number.isFinite(saved.stats[key])) ||
    !Array.isArray(saved.history) || (saved.phase !== "route" && !dispatch.routes.some((route) => route.id === saved.routeId)) ||
    (saved.phase === "report" && (!saved.finished || !saved.ending))) return null;
  return saved;
}

function remember() {
  if (run) saveJSON(runKey(dispatch.dayKey), run);
}

function dateLabel(key) {
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" })
    .format(new Date(key + "T12:00:00Z")).toUpperCase();
}

function toast(message) {
  $("toast").textContent = message;
  $("toast").hidden = false;
  window.clearTimeout(toast.timeout);
  toast.timeout = window.setTimeout(() => { $("toast").hidden = true; }, 3400);
}

function show(name) {
  if (!screens.includes(name)) return;
  screen = name;
  document.querySelectorAll(".screen").forEach((section) => section.classList.toggle("is-active", section.id === "screen-" + name));
  $("chapter-tracker").hidden = name === "cover";
  const steps = ["hero", "route", "encounter", "finale", "report"];
  const at = steps.indexOf(name);
  document.querySelectorAll("[data-step]").forEach((item) => {
    const index = steps.indexOf(item.dataset.step);
    item.classList.toggle("current", index === at);
    item.classList.toggle("done", index < at);
    if (index === at) item.setAttribute("aria-current", "step"); else item.removeAttribute("aria-current");
  });
  if (name === "hero") renderHeroes();
  if (name === "route") renderRoutes();
  if (name === "encounter") renderEncounter();
  if (name === "finale") renderFinale();
  if (name === "report") renderReport();
  window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
}

function resetForToday() {
  const key = pacificDayKey();
  if (dispatch && dispatch.dayKey === key) return;
  const changed = Boolean(dispatch);
  dispatch = getDispatch(key);
  run = safeSavedRun(key);
  heroDraft = null;
  $("today-date").textContent = dateLabel(key);
  $("dispatch-issue").textContent = String(Math.max(1, dispatch.dispatchNumber)).padStart(3, "0");
  $("cover-emblem").textContent = dispatch.icon;
  $("cover-title").textContent = dispatch.title;
  $("cover-intro").textContent = dispatch.introduction;
  $("map-edition").textContent = dispatch.omen.title.toUpperCase();
  $("start-button").firstChild.textContent = run ? "CONTINUE YOUR STORY " : "OPEN THE DISPATCH ";
  show("cover");
  if (changed) toast("A new Pacific day has begun. Today's journey is ready.");
}

function make(tag, cls, value) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (value !== undefined) el.textContent = value;
  return el;
}
function renderHeroes() {
  $("hero-promise").textContent = dispatch.promise;
  const holder = $("hero-options");
  holder.replaceChildren();
  HEROES.forEach((hero) => {
    const card = make("button", "role-card" + (heroDraft === hero.id ? " selected" : ""));
    card.type = "button";
    card.setAttribute("aria-pressed", String(heroDraft === hero.id));
    card.append(make("span", "role-icon", hero.symbol), make("strong", "", hero.name), make("span", "role-subtitle", hero.subtitle));
    const stats = make("span", "role-stats", "RESOLVE " + hero.stats.resolve + " · SUPPLIES " + hero.stats.supplies + " · CLUES " + hero.stats.insight);
    card.append(stats);
    card.addEventListener("click", () => {
      heroDraft = hero.id;
      renderHeroes();
    });
    holder.append(card);
  });
  $("hero-next").disabled = !heroDraft;
}

const statLabels = { resolve: "Resolve", supplies: "Supplies", insight: "Clues", oath: "Promise" };
function statsFor(id) {
  const holder = $(id);
  holder.replaceChildren();
  if (!run) return;
  for (const key of ["resolve", "supplies", "insight", "oath"]) {
    const item = make("div", "stat");
    item.append(make("small", "", statLabels[key]), make("strong", "", String(run.stats[key]) + (key === "insight" || key === "oath" ? " / 3" : "")));
    if (key === "resolve" && run.stats.resolve <= 1) item.classList.add("danger");
    if ((key === "insight" || key === "oath") && run.stats[key] >= 3) item.classList.add("achieved");
    holder.append(item);
  }
}
function routeById(id = run?.routeId) {
  return dispatch.routes.find((route) => route.id === id);
}
function renderRoutes() {
  if (!run) return show("hero");
  $("route-title").textContent = dispatch.title;
  $("route-intro").textContent = dispatch.introduction + " Your task: " + dispatch.promise;
  $("hero-chip").textContent = HEROES.find((hero) => hero.id === run.heroId).name.toUpperCase();
  $("field-witness").textContent = dispatch.witness;
  $("field-omen").textContent = dispatch.omen.description;
  statsFor("status-route");
  const holder = $("route-options");
  holder.replaceChildren();
  dispatch.routes.forEach((route, index) => {
    const selected = run.routeId === route.id;
    const button = make("button", "route-option" + (selected ? " selected" : ""));
    button.type = "button";
    button.setAttribute("aria-pressed", String(selected));
    const header = make("span", "route-head");
    header.append(make("span", "route-index", ["I", "II", "III"][index]), make("strong", "", route.name));
    const claim = make("span", "route-claim", "THE MAP SAYS: " + route.claim);
    const surveyed = run.scoutedId === route.id ? make("span", "route-scouted", route.reliable ? "✓ SCOUTED · MAP HOLDS" : "! SCOUTED · MAP STALE") : null;
    button.append(header, claim);
    if (surveyed) button.append(surveyed);
    button.addEventListener("click", () => { run = chooseRoute(dispatch, run, route.id); remember(); renderRoutes(); });
    holder.append(button);
  });
  document.querySelectorAll(".svg-route").forEach((line) => {
    line.classList.toggle("selected", line.dataset.line === run.routeId);
    line.classList.toggle("muted", run.routeId !== null && line.dataset.line !== run.routeId);
  });
  $("route-next").disabled = run.routeId === null;
  $("scout-button").disabled = run.scoutedId !== null || run.routeId === null;
  if (run.scoutedId !== null) {
    const route = routeById(run.scoutedId);
    $("scout-report").textContent = (route.reliable ? "CONFIRMED: The chart is accurate here. " : "STALE CHART: The passage changed. ") + route.evidence + ". Your lantern is spent.";
    $("scout-button").textContent = "LANTERN SPENT";
  } else {
    $("scout-report").textContent = run.routeId === null ? "Select a route first. You can scout one path before you commit." : "Scout " + routeById().name + " to verify this map claim. You can still choose another route afterward.";
    $("scout-button").textContent = "SCOUT SELECTED ROUTE";
  }
}

function effectText(choice) {
  const tags = [];
  for (const [key, amount] of Object.entries(choice.effects)) {
    const symbol = amount > 0 ? "+" : "";
    tags.push(symbol + amount + " " + statLabels[key].toUpperCase());
  }
  return tags.join("  ·  ");
}
function presentChoices(holderId, choices, callback) {
  const holder = $(holderId);
  holder.replaceChildren();
  choices.forEach((choice, index) => {
    const affordable = canAfford(run, choice);
    const button = make("button", "decision-button");
    button.type = "button";
    button.disabled = !affordable;
    const heading = make("span", "decision-line");
    heading.append(make("strong", "", choice.label), make("span", "", "↗"));
    button.append(heading, make("span", "decision-description", choice.detail), make("small", "decision-effects", effectText(choice)));
    if (!affordable) button.append(make("span", "decision-disabled", "NOT ENOUGH SUPPLIES"));
    button.addEventListener("click", () => {
      if (!affordable) return;
      try { run = callback(index); remember(); show(run.phase); }
      catch { toast("This choice is not available."); }
    });
    holder.append(button);
  });
}
function renderEncounter() {
  const route = routeById();
  $("encounter-route").textContent = dispatch.title.toUpperCase() + " · VIA " + route.name.toUpperCase();
  $("encounter-title").textContent = "The road answers.";
  $("encounter-mark").textContent = dispatch.icon;
  $("encounter-location").textContent = dispatch.place.toUpperCase();
  $("encounter-scene").textContent = route.scene;
  $("encounter-context").textContent = (route.reliable ? "The map held its promise." : "The map was out of date.") + " " + dispatch.encounter;
  statsFor("status-encounter");
  presentChoices("encounter-options", dispatch.encounterChoices, (index) => advanceEncounter(dispatch, run, index));
}
function renderFinale() {
  $("finale-title").textContent = "What do you owe the world?";
  $("previous-action").textContent = run.history.at(-1)?.text || "";
  $("finale-scene").textContent = dispatch.finale;
  statsFor("status-finale");
  presentChoices("finale-options", dispatch.finaleChoices, (index) => {
    const finished = conclude(dispatch, run, index);
    if (!readJSON(firstKey(dispatch.dayKey))) {
      saveJSON(firstKey(dispatch.dayKey), { heroId: finished.heroId, rank: finished.ending.rank, score: finished.ending.score, routeName: finished.ending.routeName });
    }
    return finished;
  });
}
function renderReport() {
  if (!run?.ending) return show("cover");
  const e = run.ending;
  $("report-day").textContent = dateLabel(dispatch.dayKey);
  $("report-emblem").textContent = dispatch.icon;
  $("report-rank").textContent = e.rank === "oathkeeper" ? "THE OATHKEEPER" : e.rank === "survivor" ? "THE SURVIVOR" : "THE ROAD-LOST";
  $("report-title").textContent = e.title;
  $("report-summary").textContent = e.description;
  $("report-detail").textContent = e.detail;
  const seals = [
    ["Reached the end", e.arrived],
    ["Promise kept", e.keptPromise],
    ["Hidden truth uncovered", e.discovered],
  ];
  $("report-seals").replaceChildren(...seals.map(([label, earned]) => make("span", "seal" + (earned ? " earned" : ""), (earned ? "✓ " : "— ") + label)));
  const log = $("report-path");
  log.replaceChildren(...e.path.map((line) => make("li", "", line)));
  $("report-hero").textContent = HEROES.find((hero) => hero.id === run.heroId).name.toUpperCase() + " · " + e.routeName.toUpperCase();
  $("report-score").textContent = "CHRONICLE SCORE " + e.score;
  const first = readJSON(firstKey(dispatch.dayKey));
  $("first-run-note").textContent = first ? "Your first ending today: " + first.rank.replace("-", " ") + " via " + first.routeName + " · " + first.score + " points. Saved in this browser only." : "Your first expedition is saved only on this device.";
}
function shareText() {
  const e = run.ending;
  return "THE UNRELIABLE MAP · " + dispatch.dayKey + "\n" +
    dispatch.title + " — " + dispatch.omen.title + "\n" +
    HEROES.find((hero) => hero.id === run.heroId).name + " via " + e.routeName + "\n" +
    e.title + " · " + e.score + " points\n" +
    (e.arrived ? "✓ Arrived" : "✕ Turned back") + " | " + (e.keptPromise ? "✓ Promise kept" : "✕ Promise lost") +
    " | " + (e.discovered ? "✓ Secret found" : "— No secret") + "\n" +
    "My choice: " + run.encounterChoice + " → " + run.finalChoice + "\n" +
    "What would you have done?";
}
async function copyEnding() {
  const text = shareText();
  try {
    await navigator.clipboard.writeText(text);
    toast("Copied! Paste it into the Reddit post's comments.");
  } catch {
    const area = make("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.append(area);
    area.select();
    let copied = false;
    try { copied = document.execCommand("copy"); } catch { /* WebView may block clipboard */ }
    area.remove();
    toast(copied ? "Copied! Paste it into the comments." : "Clipboard unavailable in this browser.");
  }
}
function begin() {
  if (run && validRunPhases.has(run.phase)) show(run.phase);
  else show("hero");
}

$("start-button").addEventListener("click", begin);
$("hero-back").addEventListener("click", () => show("cover"));
$("hero-next").addEventListener("click", () => {
  if (!heroDraft) return;
  run = startRun(dispatch, heroDraft);
  remember();
  show("route");
});
$("route-next").addEventListener("click", () => {
  if (!run || run.routeId === null) return;
  run = advanceToEncounter(dispatch, run);
  remember();
  show("encounter");
});
$("scout-button").addEventListener("click", () => {
  try { run = scout(dispatch, run); remember(); renderRoutes(); }
  catch { toast("Choose a route before using your lantern."); }
});
$("replay-button").addEventListener("click", () => {
  run = null;
  heroDraft = null;
  show("hero");
});
$("cover-button").addEventListener("click", () => show("cover"));
$("copy-button").addEventListener("click", copyEnding);
$("help-open").addEventListener("click", () => $("help-dialog").showModal());
$("help-close").addEventListener("click", () => $("help-dialog").close());
$("help-done").addEventListener("click", () => $("help-dialog").close());

resetForToday();
window.setInterval(resetForToday, 60000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) resetForToday(); });
window.addEventListener("focus", resetForToday);
