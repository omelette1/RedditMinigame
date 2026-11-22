import { HEROES, pacificDayKey, getDispatch, canAfford } from "./story.js";
import { loadPlayer, submitPlayerAction, erasePlayer, playerMode } from "./account.js";

const $ = (id) => document.getElementById(id);
const screens = ["cover", "hero", "route", "encounter", "finale", "report", "history"];
const validRunPhases = new Set(["route", "encounter", "finale", "report"]);
let dispatch;
let run = null;
let heroDraft = null;
let screen = "cover";
let player = null;
let busy = false;
let lastError = null;

function refreshAccountLabel() {
  const mode = player?.mode ?? playerMode();
  const synced = mode === "reddit";
  const local = mode === "local";
  $("account-sync").textContent = synced
    ? "✓ PROGRESS SYNCED TO YOUR REDDIT ACCOUNT · " + player.totalCompleted + " COMPLETED JOURNEYS"
    : local
      ? "LOCAL DEVELOPMENT MODE · SAVES ONLY ON THIS BROWSER"
      : "REDDIT ACCOUNT SYNC UNAVAILABLE · SIGN IN TO PLAY";
  $("history-open").disabled = !player;
  $("start-button").disabled = !player;
  $("account-result").textContent = synced ? "Your story is saved to your Reddit account." :
    local ? "Local-only development save. Not attached to a Reddit account." : "Not saved.";
}

function applyPlayerData(data, destination = "cover") {
  player = data;
  lastError = null;
  run = data.run;
  dispatch = getDispatch(data.dayKey);
  heroDraft = null;
  $("today-date").textContent = dateLabel(data.dayKey);
  $("dispatch-issue").textContent = String(Math.max(1, dispatch.dispatchNumber)).padStart(3, "0");
  $("cover-emblem").textContent = dispatch.icon;
  $("cover-title").textContent = dispatch.title;
  $("cover-intro").textContent = dispatch.introduction;
  $("map-edition").textContent = dispatch.omen.title.toUpperCase();
  $("start-button").firstChild.textContent = run ? "CONTINUE YOUR STORY " : "OPEN THE DISPATCH ";
  refreshAccountLabel();
  show(destination === "current" && run ? run.phase : destination);
}

async function refreshPlayer(force = false) {
  if (busy) return;
  if (!force && player?.dayKey === pacificDayKey()) return;
  try {
    const data = await loadPlayer();
    const newDay = player && data.dayKey !== player.dayKey;
    const changedElsewhere = player && data.revision !== player.revision && !newDay;
    const next = screen === "history" ? "history" : newDay ? "cover" : (changedElsewhere ? "current" : screen);
    applyPlayerData(data, next);
    if (newDay) toast("A new Pacific day has begun. Your previous completed stories remain in your Chronicle.");
    else if (changedElsewhere) toast("Adventure progress updated from your Reddit account.");
  } catch (error) {
    lastError = error;
    if (!player) {
      dispatch = getDispatch(pacificDayKey());
      $("today-date").textContent = dateLabel(dispatch.dayKey);
      $("cover-title").textContent = dispatch.title;
      $("cover-intro").textContent = dispatch.introduction;
      $("cover-emblem").textContent = dispatch.icon;
      $("start-button").disabled = true;
      refreshAccountLabel();
    }
    toast(error.message || "Could not load your Reddit account progress.");
  }
}

async function takeAction(action) {
  if (!player || busy) return;
  busy = true;
  const buttonStates = [...document.querySelectorAll("button")].map((button) => [button, button.disabled]);
  for (const [button] of buttonStates) button.disabled = true;
  let result = null;
  let failure = null;
  try {
    result = await submitPlayerAction(player.revision, action);
  } catch (error) {
    failure = error;
  } finally {
    busy = false;
    for (const [button, disabled] of buttonStates) button.disabled = disabled;
  }
  if (result) {
    const next = action.type === "restart" ? "hero" : (result.run?.phase ?? "cover");
    applyPlayerData(result, next);
  } else {
    toast(failure?.message || "Unable to save. Your choice was not applied.");
    if (failure?.status === 409) await refreshPlayer(true);
  }
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
  $("chapter-tracker").hidden = name === "cover" || name === "history";
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
  if (name === "history") renderHistory();
  window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
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
    button.addEventListener("click", () => takeAction({ type: "route", routeId: route.id }));
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
function presentChoices(holderId, choices, actionType) {
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
      if (affordable) takeAction({ type: actionType, index });
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
  presentChoices("encounter-options", dispatch.encounterChoices, "encounter");
}
function renderFinale() {
  $("finale-title").textContent = "What do you owe the world?";
  $("previous-action").textContent = run.history.at(-1)?.text || "";
  $("finale-scene").textContent = dispatch.finale;
  statsFor("status-finale");
  presentChoices("finale-options", dispatch.finaleChoices, "finale");
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
  const first = player?.first;
  $("first-run-note").textContent = first ? "Your first ending today: " + first.rank.replace("-", " ") + " via " + first.routeName + " · " + first.score + " points." : "Your first expedition will appear in your personal Chronicle.";
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
function renderHistory() {
  const mode = player?.mode;
  const label = mode === "reddit" ? "CONNECTED REDDIT ACCOUNT" : "STANDALONE BROWSER DEMO";
  $("history-account").textContent = label;
  $("history-count").textContent = String(player?.totalCompleted ?? 0);
  $("history-description").textContent = mode === "reddit"
    ? "Your completed expeditions are saved to this Reddit account. Open the game on another device in the same subreddit to continue. Reddit stores separate data for each subreddit installation."
    : "This is a standalone development preview. Progress lives in this browser only.";
  const list = $("history-list");
  list.replaceChildren();
  if (!player?.history?.length) {
    const empty = make("p", "history-empty", "No completed adventures yet. Start today's expedition to write your first chronicle.");
    list.append(empty);
  } else {
    player.history.forEach((entry) => {
      const item = make("article", "history-entry");
      const top = make("div", "history-entry-top");
      top.append(make("span", "label", entry.dayKey), make("span", "history-score", entry.score + " POINTS"));
      item.append(top, make("h3", "", entry.questTitle), make("p", "", entry.title),
        make("small", "", entry.heroId.toUpperCase() + " · " + entry.routeName + " · " +
          (entry.keptPromise ? "PROMISE KEPT" : entry.arrived ? "REACHED THE END" : "TURNED BACK")));
      list.append(item);
    });
  }
  $("erase-open").disabled = !player;
}

function begin() {
  if (!player) { toast(lastError?.message || "Sign into Reddit to play."); return; }
  if (run && validRunPhases.has(run.phase)) show(run.phase);
  else show("hero");
}

$("start-button").addEventListener("click", begin);
$("history-open").addEventListener("click", () => { if (player) show("history"); });
$("history-back").addEventListener("click", () => show("cover"));
$("hero-back").addEventListener("click", () => show("cover"));
$("hero-next").addEventListener("click", () => {
  if (heroDraft) takeAction({ type: "start", heroId: heroDraft });
});
$("route-next").addEventListener("click", () => {
  if (run?.routeId !== null) takeAction({ type: "commit" });
});
$("scout-button").addEventListener("click", () => takeAction({ type: "scout" }));
$("replay-button").addEventListener("click", () => takeAction({ type: "restart" }));
$("cover-button").addEventListener("click", () => show("cover"));
$("copy-button").addEventListener("click", copyEnding);
$("erase-open").addEventListener("click", () => $("erase-dialog").showModal());
$("erase-cancel").addEventListener("click", () => $("erase-dialog").close());
$("erase-confirm").addEventListener("click", async () => {
  if (busy) return;
  busy = true;
  $("erase-confirm").disabled = true;
  try {
    const data = await erasePlayer();
    $("erase-dialog").close();
    applyPlayerData(data, "history");
    toast("Saved adventures deleted.");
  } catch (error) {
    toast(error.message || "Deletion failed.");
  } finally {
    busy = false;
    $("erase-confirm").disabled = false;
  }
});
$("help-open").addEventListener("click", () => $("help-dialog").showModal());
$("help-close").addEventListener("click", () => $("help-dialog").close());
$("help-done").addEventListener("click", () => $("help-dialog").close());

refreshPlayer(true);
window.setInterval(() => refreshPlayer(false), 60000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) refreshPlayer(true); });
window.addEventListener("focus", () => refreshPlayer(true));
