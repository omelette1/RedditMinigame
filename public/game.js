const routes = [
  { id: "causeway", label: "Raised Causeway", mapName: "CAUSEWAY", mapClaim: "DRY · QUICK", traits: { quiet: 0, quick: 2, shelter: 0, discovery: 0 } },
  { id: "reeds", label: "Through the Reeds", mapName: "REED BEDS", mapClaim: "QUIET · SLOW", traits: { quiet: 2, quick: 0, shelter: 1, discovery: 0 } },
  { id: "boardwalk", label: "Old Boardwalk", mapName: "OLD WALK", mapClaim: "SHELTERED", traits: { quiet: 1, quick: 1, shelter: 2, discovery: 1 } },
];

const routePaths = {
  causeway: [[87, 371], [211, 279], [330, 216], [441, 174], [553, 115], [676, 70]],
  reeds: [[87, 371], [173, 284], [270, 279], [350, 216], [450, 208], [529, 145], [633, 132], [676, 70]],
  boardwalk: [[87, 371], [172, 393], [263, 345], [356, 370], [435, 322], [525, 336], [617, 280], [676, 70]],
};

// Curated daily cases. The date picks a known, authored case; it never rolls a
// result. Each case changes the clue logic, traveler promises, and route costs.
const cases = [
  {
    title: "The Bell Marsh", district: "MARSH DISTRICT", chart: "CHART 04-A", coords: "41° 08′ N\n72° 34′ W",
    notes: ["The bells mark the firmest ground.", "Never follow a bell after the sun leaves."], noteSources: ["Surveyor’s mark", "From a ferryman"],
    travelers: [
      { id: "mara", name: "Mara Vale", goal: "KEEP THE MOTH ASLEEP", need: "quiet", description: "carrying a sleeping moth" },
      { id: "oren", name: "Oren Pike", goal: "DELIVER BEFORE DARK", need: "quick", description: "carrying a sealed letter" },
    ],
    routeCost: { causeway: { hazard: 1, secret: false }, reeds: { hazard: 0, secret: false }, boardwalk: { hazard: 2, secret: true } },
  },
  {
    title: "The Lantern Pool", district: "LOW MARSH", chart: "CHART 04-B", coords: "41° 10′ N\n72° 31′ W",
    notes: ["Blue lights gather over deep water.", "A light held low will show the stones."], noteSources: ["Field sketch", "A child’s warning"],
    travelers: [
      { id: "mara", name: "Mara Vale", goal: "KEEP THE MOTH IN SHADE", need: "shelter", description: "carrying a sleeping moth" },
      { id: "oren", name: "Oren Pike", goal: "REACH THE NORTH BANK", need: "quick", description: "carrying a sealed letter" },
    ],
    routeCost: { causeway: { hazard: 0, secret: false }, reeds: { hazard: 1, secret: true }, boardwalk: { hazard: 1, secret: false } },
  },
  {
    title: "The Drowned Orchard", district: "EASTERN MARSH", chart: "CHART 04-C", coords: "41° 06′ N\n72° 39′ W",
    notes: ["The red fruit marks the old road.", "Nothing red grows where the ground is sound."], noteSources: ["Orchard ledger", "A ferryman’s rhyme"],
    travelers: [
      { id: "mara", name: "Mara Vale", goal: "KEEP THE MOTH DRY", need: "shelter", description: "carrying a sleeping moth" },
      { id: "oren", name: "Oren Pike", goal: "BRING BACK A RED SEED", need: "discovery", description: "carrying an empty tin" },
    ],
    routeCost: { causeway: { hazard: 2, secret: false }, reeds: { hazard: 1, secret: false }, boardwalk: { hazard: 1, secret: true } },
  },
  {
    title: "The Silt Chapel", district: "SOUTHERN MARSH", chart: "CHART 04-D", coords: "41° 04′ N\n72° 35′ W",
    notes: ["The chapel door faces the rising tide.", "The tide has not risen here in forty years."], noteSources: ["Parish map", "Tide table"],
    travelers: [
      { id: "mara", name: "Mara Vale", goal: "AVOID THE OPEN SKY", need: "shelter", description: "carrying a sleeping moth" },
      { id: "oren", name: "Oren Pike", goal: "RING THE CHAPEL BELL", need: "discovery", description: "carrying a brass key" },
    ],
    routeCost: { causeway: { hazard: 2, secret: false }, reeds: { hazard: 1, secret: false }, boardwalk: { hazard: 0, secret: true } },
  },
  {
    title: "The Borrowed Shore", district: "WESTERN MARSH", chart: "CHART 04-E", coords: "41° 09′ N\n72° 42′ W",
    notes: ["The shore moves one field each night.", "A shore cannot move; the markers do."], noteSources: ["Surveyor’s mark", "Local account"],
    travelers: [
      { id: "mara", name: "Mara Vale", goal: "FOLLOW THE MOVING SHORE", need: "discovery", description: "carrying a sleeping moth" },
      { id: "oren", name: "Oren Pike", goal: "STAY ON DRY GROUND", need: "shelter", description: "carrying a sealed letter" },
    ],
    routeCost: { causeway: { hazard: 1, secret: false }, reeds: { hazard: 2, secret: true }, boardwalk: { hazard: 1, secret: false } },
  },
  {
    title: "The Quiet Mile", district: "NORTH MARSH", chart: "CHART 04-F", coords: "41° 12′ N\n72° 32′ W",
    notes: ["No birds cross the old walk.", "The birds leave before the old walk begins."], noteSources: ["Naturalist’s log", "A child’s warning"],
    travelers: [
      { id: "mara", name: "Mara Vale", goal: "KEEP THE MOTH ASLEEP", need: "quiet", description: "carrying a sleeping moth" },
      { id: "oren", name: "Oren Pike", goal: "FIND THE MISSING BELL", need: "discovery", description: "carrying a brass key" },
    ],
    routeCost: { causeway: { hazard: 1, secret: false }, reeds: { hazard: 0, secret: false }, boardwalk: { hazard: 1, secret: true } },
  },
  {
    title: "The Last Ferry", district: "FAR MARSH", chart: "CHART 04-G", coords: "41° 02′ N\n72° 37′ W",
    notes: ["The ferry leaves when the bell rings.", "The ferryman sold the bell last spring."], noteSources: ["Dock notice", "A ferryman’s account"],
    travelers: [
      { id: "mara", name: "Mara Vale", goal: "CROSS WITHOUT A SOUND", need: "quiet", description: "carrying a sleeping moth" },
      { id: "oren", name: "Oren Pike", goal: "CATCH THE LAST FERRY", need: "quick", description: "carrying a sealed letter" },
    ],
    routeCost: { causeway: { hazard: 1, secret: false }, reeds: { hazard: 2, secret: false }, boardwalk: { hazard: 0, secret: true } },
  },
];

// The map is not a random liar. Each date has an authored reliability profile:
// some marks are stale, and some are fully accurate. The lantern verifies one.
const mapReports = [
  { survey: "FIELD SURVEY · 1897", truth: { causeway: true, reeds: true, boardwalk: false }, checks: { causeway: "The stone lip is still raised. The map’s dry mark is sound here.", reeds: "The reeds still hush a crossing, just as the old ink claims.", boardwalk: "The alder rail is loose. This shelter mark is from before the last flood." } },
  { survey: "FIELD CHECK · THIS MORNING", truth: { causeway: true, reeds: true, boardwalk: true }, checks: { causeway: "The raised stones are dry. Today the old mark is right.", reeds: "The reeds are quiet and slow, exactly as the map says.", boardwalk: "The boards are sheltered and intact. This mark is current." } },
  { survey: "FIELD SURVEY · 3 WEEKS AGO", truth: { causeway: false, reeds: true, boardwalk: true }, checks: { causeway: "Water covers the stones now. The dry mark predates the high water.", reeds: "The reeds hold above the floodline. This quiet-route mark remains right.", boardwalk: "The boards are high enough today. The shelter mark still holds." } },
  { survey: "FIELD SURVEY · 40 YEARS AGO", truth: { causeway: false, reeds: true, boardwalk: true }, checks: { causeway: "The chapel channel cut through the causeway. Its dry mark is decades out of date.", reeds: "The reed beds still quiet the water crossing.", boardwalk: "The old walk stands above the tide. The map has this shelter mark right." } },
  { survey: "FIELD SURVEY · LAST SEASON", truth: { causeway: true, reeds: false, boardwalk: true }, checks: { causeway: "The stones are still dry and direct. The causeway mark is true.", reeds: "This bank moved east. The quiet route now crosses open water.", boardwalk: "The boardwalk still has cover. Its mark survived the shifting shore." } },
  { survey: "FIELD CHECK · YESTERDAY", truth: { causeway: true, reeds: true, boardwalk: true }, checks: { causeway: "The causeway is dry and quick. The fresh survey agrees with the old line.", reeds: "The reeds stay quiet and slow. The map is right about this path.", boardwalk: "The boards are sheltered, with no fresh breaks. This mark is still true." } },
  { survey: "FIELD SURVEY · LAST SPRING", truth: { causeway: true, reeds: false, boardwalk: true }, checks: { causeway: "The raised stones are dry. The map’s quick route is still reliable.", reeds: "The ferryman pulled the reeds aside. This path is neither quiet nor passable now.", boardwalk: "The rope leads to the ferry. The boardwalk mark is right, despite the old survey." } },
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const state = { traveler: null, route: null, inspected: false, inspectedRoute: null, running: false, completed: false, caseIndex: 0, dayKey: "", scenario: null };

function showScreen(name) {
  const screenId = `screen-${name}`;
  $$(".screen").forEach((screen) => screen.classList.toggle("is-active", screen.id === screenId));
  const flow = $("#flow-progress");
  flow.hidden = name === "title";
  const currentStep = name === "loading" ? "plan" : name;
  const steps = ["briefing", "plan", "crossing", "report"];
  const currentIndex = steps.indexOf(currentStep);
  flow.querySelectorAll("[data-flow]").forEach((step) => {
    const index = steps.indexOf(step.dataset.flow);
    step.classList.toggle("is-current", index === currentIndex);
    step.classList.toggle("is-complete", index >= 0 && index < currentIndex);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function pacificDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  return Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
}

function loadDailyCase() {
  const parts = pacificDateParts();
  state.dayKey = `${parts.year}-${parts.month}-${parts.day}`;
  const day = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)) / 86_400_000;
  const index = ((day % cases.length) + cases.length) % cases.length;
  state.caseIndex = index;
  state.scenario = cases[index];
  const date = new Date(`${state.dayKey}T12:00:00-08:00`);
  const displayDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", timeZone: "America/Los_Angeles" }).format(date).toUpperCase();
  $("#today").textContent = displayDate;
  $("#today-cover").textContent = displayDate;
  $("#report-date").textContent = state.dayKey;
  $("#route-number").textContent = String(index + 1).padStart(2, "0");
  $(".day-stamp span:last-child").textContent = state.scenario.district;
  $(".panel-heading .eyebrow").textContent = state.scenario.chart;
  $(".panel-heading h2").textContent = state.scenario.title;
  $("#briefing-title").textContent = state.scenario.title;
  $("#briefing-copy").textContent = `Today’s dispatch is from ${state.scenario.district.toLowerCase()}. Get one traveler to the bell tower and protect the promise they carry.`;
  $("#crossing-title").textContent = `Across ${state.scenario.district.toLowerCase()}`;
  $(".map-coordinates").innerHTML = state.scenario.coords.replace("\n", "<br />");
  $(".map-footer span:first-child").textContent = mapReports[index].survey;
  $("#map-title").textContent = `Map of ${state.scenario.title}`;
  $("#map-desc").textContent = `Three routes cross ${state.scenario.district.toLowerCase()} toward the old tower.`;
  $(".note-surveyor strong").textContent = state.scenario.noteSources[0];
  $(".note-local strong").textContent = state.scenario.noteSources[1];
  $(".note-surveyor p").textContent = `“${state.scenario.notes[0]}”`;
  $(".note-local p").textContent = `“${state.scenario.notes[1]}”`;
  const marker = state.scenario.title.includes("Bell") ? "BELL TOWER" : state.scenario.title.replace("The ", "").toUpperCase();
  $(".tower text").textContent = marker;
  $$(".traveler-card").forEach((card, idx) => {
    const traveler = state.scenario.travelers[idx];
    card.dataset.traveler = traveler.id;
    card.querySelector("strong").textContent = traveler.name;
    card.querySelector("small").textContent = traveler.goal;
    card.setAttribute("aria-label", `${traveler.name}: ${traveler.goal.toLowerCase()}`);
  });
  $$(".route-card").forEach((card) => {
    const route = routes.find((item) => item.id === card.dataset.route);
    card.querySelector("small").textContent = `MAP CLAIM: ${route.mapClaim}`;
  });
  $("#inspect-message").textContent = "Optional: scout once to learn whether your chosen map mark is current.";
  $("#journey-state").textContent = "READY";
  $("#journey-message").textContent = "Choose a traveler and route. Run the crossing to watch what happens.";
  $("#journey-progress").style.width = "0%";
  $("#loading-progress").style.width = "0%";
  $("#crossing-log-list").replaceChildren();
  $("#traveler-token").setAttribute("transform", "translate(87 371)");
  $("#traveler-token").classList.remove("is-visible");
  updateButtons();
}

function selectedTraveler() { return state.scenario.travelers.find((traveler) => traveler.id === state.traveler); }
function selectedRoute() { return routes.find((route) => route.id === state.route); }

function updateButtons() {
  $("#to-plan-button").disabled = !state.traveler || state.running;
  $("#choose-button").disabled = !(state.traveler && state.route) || state.running;
  $("#choose-button span:first-child").textContent = state.running ? "PREPARING..." : "PREPARE CROSSING";
  $("#turn-note").textContent = state.route && state.traveler ? "Route selected. Your traveler and the chart determine the outcome." : "Choose one route to continue.";
  $("#inspect-button").disabled = state.running || state.inspected || !state.route;
  $("#oil-value").textContent = state.inspected ? "USED" : "READY";
}

function selectTraveler(id) {
  if (state.running) return;
  if (state.traveler && state.traveler !== id) clearRouteChoice();
  state.traveler = id;
  $$(".traveler-card").forEach((card) => {
    const selected = card.dataset.traveler === id;
    card.classList.toggle("selected", selected);
    card.setAttribute("aria-pressed", String(selected));
  });
  const traveler = selectedTraveler();
  $("#traveler-explainer").textContent = `${traveler.name}’s goal: ${traveler.goal.toLowerCase()}. Pick a path that gives them the best chance to keep that promise.`;
  updateButtons();
}

function clearRouteChoice() {
  state.route = null;
  state.inspected = false;
  state.inspectedRoute = null;
  $$(".route-card").forEach((card) => { card.classList.remove("selected"); card.setAttribute("aria-pressed", "false"); });
  $$(".map-node.selectable").forEach((node) => node.classList.remove("is-selected"));
  $$(".map-route").forEach((line) => line.classList.remove("is-selected", "is-muted"));
  $("#inspect-message").textContent = "Optional: scout once to learn whether your chosen map mark is current.";
  $("#inspect-message").classList.remove("is-clue");
  $("#inspect-button").textContent = "SCOUT THIS ROUTE";
  updateButtons();
}

function selectRoute(id) {
  if (state.running) return;
  if (!routes.some((route) => route.id === id)) return;
  state.route = id;
  $$(".route-card").forEach((card) => {
    const selected = card.dataset.route === id;
    card.classList.toggle("selected", selected);
    card.setAttribute("aria-pressed", String(selected));
  });
  $$(".map-node.selectable").forEach((node) => node.classList.toggle("is-selected", node.dataset.route === id));
  $$(".map-route").forEach((line) => {
    const selected = line.classList.contains(`route-${id}`);
    line.classList.toggle("is-selected", selected);
    line.classList.toggle("is-muted", !selected);
  });
  if (state.inspected) {
    const checked = routes.find((route) => route.id === state.inspectedRoute);
    $("#inspect-message").textContent = `Lantern spent on ${checked.label}: ${mapReports[state.caseIndex].checks[state.inspectedRoute]}`;
  }
  updateButtons();
}

function inspectClue() {
  if (state.inspected || !state.route) return;
  state.inspected = true;
  state.inspectedRoute = state.route;
  $("#inspect-message").textContent = `SCOUT REPORT: ${mapReports[state.caseIndex].checks[state.route]}`;
  $("#inspect-message").classList.add("is-clue");
  $("#inspect-button").textContent = "SCOUTED";
  updateButtons();
}

function evaluateExpedition() {
  const traveler = selectedTraveler();
  const route = selectedRoute();
  const cost = state.scenario.routeCost[route.id];
  const markWasTrue = mapReports[state.caseIndex].truth[route.id];
  const traits = { ...route.traits };
  let hazard = cost.hazard;
  if (!markWasTrue) {
    hazard = Math.min(2, hazard + 1);
    if (route.id === "causeway") traits.quick = 0;
    if (route.id === "reeds") traits.quiet = 0;
    if (route.id === "boardwalk") traits.shelter = 0;
  }
  const needMet = traveler.need === "quiet" ? traits.quiet >= 1
    : traveler.need === "quick" ? traits.quick >= 1
      : traveler.need === "shelter" ? traits.shelter >= 1
        : cost.secret || traits.discovery > 0;
  const arrived = hazard < 2;
  const found = cost.secret || (state.inspected && route.id === state.inspectedRoute);
  const keptPromise = needMet && arrived;
  const story = makeStory({ traveler, route, arrived, keptPromise, found, inspected: state.inspected });
  return { traveler, route, cost, markWasTrue, traits, arrived, keptPromise, found, story };
}

function pause(duration = 440) {
  const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : duration;
  return new Promise((resolve) => window.setTimeout(resolve, delay));
}

function animateTraveler(point, duration = 440) {
  const token = $("#traveler-token");
  token.setAttribute("transform", `translate(${point[0]} ${point[1]})`);
  return pause(duration);
}

function addCrossingEvent(label, message) {
  const item = document.createElement("li");
  const heading = document.createElement("strong");
  const copy = document.createElement("span");
  heading.textContent = label;
  copy.textContent = message;
  item.append(heading, copy);
  $("#crossing-log-list").append(item);
}

async function prepareCrossing() {
  if (state.running || !state.traveler || !state.route) return;
  state.running = true;
  updateButtons();
  const outcome = evaluateExpedition();
  const { traveler, route } = outcome;
  $("#loading-traveler").textContent = traveler.name.toUpperCase();
  $("#loading-route").textContent = route.label.toUpperCase();
  $("#loading-message").textContent = "Folding the chart and checking the lantern...";
  $("#loading-progress").style.width = "8%";
  showScreen("loading");
  await pause(300);
  $("#loading-message").textContent = "Marking the route and setting the departure point...";
  $("#loading-progress").style.width = "55%";
  await pause(350);
  $("#loading-message").textContent = "The dispatch is ready. The traveler is setting out.";
  $("#loading-progress").style.width = "100%";
  await pause(300);
  $("#crossing-map").append($(".map-panel"));
  $("#crossing-log-list").replaceChildren();
  $("#report-button").disabled = true;
  showScreen("crossing");
  await simulateExpedition(outcome);
}

async function simulateExpedition(outcome) {
  const { traveler, route, markWasTrue, arrived, keptPromise, story } = outcome;
  const report = mapReports[state.caseIndex];
  const token = $("#traveler-token");
  const points = routePaths[route.id];
  token.setAttribute("transform", `translate(${points[0][0]} ${points[0][1]})`);
  token.classList.add("is-visible");
  $(".map-panel").classList.add("is-simulating");
  $("#journey-state").textContent = "SETTING OUT";
  $("#journey-progress").style.width = "8%";
  const departure = `${traveler.name} leaves by ${route.label}. The map claims this way is ${route.mapClaim.toLowerCase()}.`;
  $("#journey-message").textContent = departure;
  addCrossingEvent("At the bank", departure);
  await animateTraveler(points[1]);
  $("#journey-state").textContent = "CROSSING";
  $("#journey-progress").style.width = "38%";
  const midCrossing = markWasTrue
    ? "The ground matches the map at the first marker. The route is holding."
    : report.checks[route.id];
  $("#journey-message").textContent = midCrossing;
  addCrossingEvent("First marker", midCrossing);
  await animateTraveler(points[Math.floor(points.length * 0.55)]);
  $("#journey-state").textContent = markWasTrue ? "ROUTE HOLDS" : "MAP WAS STALE";
  $("#journey-progress").style.width = "68%";
  const terrain = markWasTrue
    ? `${report.checks[route.id]} ${traveler.name} continues toward the tower.`
    : `${traveler.name} adjusts to the changed ground and loses time.`;
  $("#journey-message").textContent = terrain;
  addCrossingEvent(markWasTrue ? "The route holds" : "The chart is out of date", terrain);

  if (arrived) {
    await animateTraveler(points[points.length - 2]);
    $("#journey-progress").style.width = "88%";
    const outcomeText = keptPromise
      ? `${traveler.name} reaches the tower and keeps their promise.`
      : `${traveler.name} reaches the tower, but the promise is at risk.`;
    $("#journey-message").textContent = outcomeText;
    addCrossingEvent("At the tower", outcomeText);
    await animateTraveler(points[points.length - 1]);
  } else {
    await animateTraveler(points[Math.floor(points.length * 0.72)]);
    $("#journey-progress").style.width = "68%";
    const outcomeText = "The route gives way. The traveler turns back before reaching the tower.";
    $("#journey-message").textContent = outcomeText;
    addCrossingEvent("Turning back", outcomeText);
    await animateTraveler(points[0], 520);
  }
  $(".map-panel").classList.remove("is-simulating");
  $("#journey-state").textContent = arrived ? "ARRIVED" : "TURNED BACK";
  $("#journey-progress").style.width = arrived ? "100%" : "0%";
  $("#journey-message").textContent = arrived
    ? (keptPromise ? "Crossing complete · tower reached · promise kept." : "Crossing complete · tower reached · promise not kept.")
    : "Crossing complete · traveler safe · tower not reached.";
  state.running = false;
  showExpeditionReport({ ...outcome, story });
  $("#report-button").disabled = false;
  updateButtons();
}

function showExpeditionReport({ traveler, route, markWasTrue, arrived, keptPromise, found, story }) {
  const seals = [
    { label: "Tower reached", earned: arrived },
    { label: "Promise kept", earned: keptPromise },
    { label: "Extra clue found", earned: found },
  ];
  $("#result-title").textContent = arrived ? (keptPromise ? "A safe crossing" : "A costly crossing") : "The traveler turned back";
  $("#result-story").textContent = story;
  $("#result-route").textContent = `${traveler.name} · ${route.label} · ${arrived ? "Reached the tower" : "Returned to the bank"}`;
  $("#result-seals").replaceChildren(...seals.map(({ label, earned }) => {
    const badge = document.createElement("span");
    badge.className = `seal${earned ? "" : " missed"}`;
    badge.textContent = `${earned ? "✓" : "—"} ${label}`;
    return badge;
  }));
  $("#result-footnote").textContent = `The map was ${markWasTrue ? "right" : "stale"} about this route · ${mapReports[state.caseIndex].survey}${state.inspected ? " · Scouted before setting out" : ""}`;
  const result = { day: state.dayKey, traveler: traveler.name, route: route.label, seals: seals.filter((seal) => seal.earned).map((seal) => seal.label), ending: $("#result-title").textContent };
  $("#copy-result").dataset.share = `THE UNRELIABLE MAP · ${result.day}\n${result.traveler} took ${result.route}.\n${result.seals.length ? result.seals.join(" · ") : "The marsh sent them back."}\nEnding: ${result.ending}`;
  state.completed = true;
}

function makeStory({ traveler, route, arrived, keptPromise, found, inspected }) {
  if (!arrived) return `${traveler.name} reached the ${route.label.toLowerCase()} and felt the ground give way ahead. Turning back cost the crossing, but kept the traveler safe. The tower will have to wait for another day.`;
  const destination = state.scenario.title.toLowerCase().replace("the ", "");
  let first = `${traveler.name} crossed ${destination} by ${route.label.toLowerCase()}.`;
  if (traveler.need === "quiet" && keptPromise) first += " The moth slept through the crossing.";
  else if (traveler.need === "quick" && keptPromise) first += " The letter arrived before the last light left the tower.";
  else if (traveler.need === "shelter" && keptPromise) first += " The old route held its roof above the rain.";
  else if (traveler.need === "discovery" && keptPromise) first += " Beneath the route marker, the thing they came to find was still there.";
  else first += " They reached the far bank, though the promise they carried had to bend with the route.";
  if (found) first += inspected ? ` ${mapReports[state.caseIndex].checks[state.inspectedRoute]}` : " A second set of footprints appeared beside theirs, ending at a place the map left blank.";
  else if (!inspected) first += " A pale light moved once beneath the water. They kept walking.";
  return first;
}

function resetRun() {
  if ($(".map-panel").parentElement !== $("#plan-map")) $("#plan-map").append($(".map-panel"));
  state.traveler = null;
  state.route = null;
  state.inspected = false;
  state.inspectedRoute = null;
  state.running = false;
  state.completed = false;
  $(".map-panel").classList.remove("is-simulating");
  $("#traveler-token").classList.remove("is-visible");
  $("#traveler-token").setAttribute("transform", "translate(87 371)");
  $$(".traveler-card").forEach((card) => { card.classList.remove("selected"); card.setAttribute("aria-pressed", "false"); });
  $$(".route-card").forEach((card) => { card.classList.remove("selected"); card.setAttribute("aria-pressed", "false"); });
  $$(".map-node.selectable").forEach((node) => node.classList.remove("is-selected"));
  $$(".map-route").forEach((line) => line.classList.remove("is-selected", "is-muted"));
  $("#inspect-message").textContent = "Optional: scout once to learn whether your chosen map mark is current.";
  $("#inspect-message").classList.remove("is-clue");
  $("#journey-state").textContent = "READY";
  $("#journey-message").textContent = "Your traveler is preparing to leave the bank.";
  $("#journey-progress").style.width = "0%";
  $("#loading-progress").style.width = "0%";
  $("#crossing-log-list").replaceChildren();
  $("#report-button").disabled = true;
  $("#traveler-explainer").textContent = "Your traveler’s promise is the goal. The same route can help one traveler and fail another.";
  $("#copy-result").innerHTML = "COPY EXPEDITION CARD <span>↗</span>";
  $("#inspect-button").textContent = "SCOUT THIS ROUTE";
  updateButtons();
}

function resetForOtherTraveler() {
  resetRun();
  showScreen("briefing");
}

function openHelp() { $("#help-dialog").showModal(); }

$("#how-button").addEventListener("click", openHelp);
$("#close-help").addEventListener("click", () => $("#help-dialog").close());
$("#begin-button").addEventListener("click", () => showScreen("briefing"));
$("#back-to-title").addEventListener("click", () => { resetRun(); showScreen("title"); });
$("#to-plan-button").addEventListener("click", () => { if (state.traveler) showScreen("plan"); });
$("#back-to-briefing").addEventListener("click", () => showScreen("briefing"));
$("#inspect-button").addEventListener("click", inspectClue);
$("#choose-button").addEventListener("click", prepareCrossing);
$("#report-button").addEventListener("click", () => { if (state.completed) showScreen("report"); });
$("#play-again").addEventListener("click", resetForOtherTraveler);
$("#return-cover").addEventListener("click", () => { resetRun(); showScreen("title"); });
$("#copy-result").addEventListener("click", async (event) => {
  const button = event.currentTarget;
  try {
    await navigator.clipboard.writeText(button.dataset.share || "");
    button.innerHTML = "COPIED TO CLIPBOARD <span>✓</span>";
  } catch {
    button.textContent = "SELECT AND COPY YOUR RESULT FROM THE CARD";
  }
});

$$(".traveler-card").forEach((card) => card.addEventListener("click", () => selectTraveler(card.dataset.traveler)));
$$(".route-card").forEach((card) => card.addEventListener("click", () => selectRoute(card.dataset.route)));
$$(".map-node.selectable").forEach((node) => {
  node.addEventListener("click", () => selectRoute(node.dataset.route));
  node.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectRoute(node.dataset.route); } });
});

loadDailyCase();
