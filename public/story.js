// Pure, deterministic story rules. No hidden rolls or per-player randomness.
export const HEROES = [
  { id: "warden", name: "The Warden", subtitle: "Stand between danger and your oath", symbol: "✦", stats: { resolve: 4, supplies: 1, insight: 0 } },
  { id: "scribe", name: "The Scribe", subtitle: "Read what the map leaves unsaid", symbol: "✧", stats: { resolve: 3, supplies: 1, insight: 1 } },
  { id: "tinker", name: "The Tinker", subtitle: "Carry one more thing than you should", symbol: "⌘", stats: { resolve: 3, supplies: 2, insight: 0 } },
];

const r = (name, claim, sound, danger, insight, oath, scene, evidence) =>
  ({ name, claim, sound, danger, insight, oath, scene, evidence });
const c = (label, detail, effects, result) => ({ label, detail, effects, result });
const quest = (id, title, place, icon, introduction, promise, witness, routes, encounter, encounterChoices, finale, finaleChoices) =>
  ({ id, title, place, icon, introduction, promise, witness, routes, encounter, encounterChoices, finale, finaleChoices });

export const QUESTS = [
  quest("bell-marsh", "The Bell Marsh", "A marsh of drowned roads", "♧",
    "The bell keeper has vanished. At dusk, every bell in the reeds rings once, even the ones beneath the water.",
    "Carry the sleeping moth to the north tower before the last bell.",
    "The ferryman says: 'The newest ink is not always the truest.'",
    [r("Raised Causeway", "Dry and quick", true, 1, 0, 1, "The stones are warm beneath your boots. Someone has laid a fresh bell clapper in the road.", "A row of dry white stones"),
     r("Whisper Reeds", "Quiet passage", true, 0, 1, 0, "A voice in the reeds repeats your last sentence a moment before you speak it.", "Reeds bowing against the current"),
     r("Old Boardwalk", "Shelter from the rain", false, 1, 1, 1, "The roof is intact, but the planks below it are threaded with black water.", "New moss covering an old gap")],
    "An exhausted keeper begs you to ring a small copper bell. The moth stirs in its box.",
    [c("Take the bell and promise silence", "Protect the keeper's dignity; risk your strength.", { resolve: -1, oath: 2 }, "You wrap the bell in cloth. The keeper gives you the tower key."),
     c("Ask why the bell must ring", "Uncover the price of an old ritual.", { insight: 2 }, "The keeper admits that the bells were meant to frighten travelers away from a nesting place.")],
    "At the tower, the missing keeper's name has been scratched from the door.",
    [c("Open the tower for everyone", "Spend your last strength on the promise.", { resolve: -1, oath: 2 }, "You throw the doors wide. Moonlight reaches the sleeping moth."),
     c("Seal the door and preserve the secret", "Keep the old place safe, but leave the tale untold.", { insight: 1, oath: 1 }, "You close the copper lock. One bell remains silent.")]),
  quest("glass-orchard", "The Glass Orchard", "An orchard in winter", "❖",
    "Every fruit in the orchard holds one forgotten memory. A child needs the right one before her father forgets her.",
    "Bring home the memory that belongs to Iona's family.",
    "Iona says: 'My father never liked the sweetest fruit.'",
    [r("Mirror Walk", "Fast, no broken glass", false, 1, 1, 0, "Your reflection steps around a crack you have not seen yet.", "A silver shard tucked in snow"),
     r("Root Passage", "Slow but untouched", true, 0, 1, 1, "The roots murmur names that are almost familiar.", "Roots curled around a wooden toy"),
     r("Gardener's Gate", "Watched and secure", true, 1, 0, 1, "The gatekeeper offers you three shining apples and refuses to say which is real.", "Old boot prints beside the gate")],
    "A tree offers you a memory in your own voice, though it knows nothing about the child.",
    [c("Trade a memory of your own", "Lose a little strength; keep faith with Iona.", { resolve: -1, oath: 2 }, "You give up a summer afternoon. In return, the roots whisper Iona's mother's name."),
     c("Compare the fruit with Iona's clue", "Trust evidence over a flattering voice.", { insight: 2 }, "The sour fruit carries a familiar lullaby.")],
    "At the orchard wall, Iona waits for an answer she is afraid to hear.",
    [c("Give her the uncertain memory", "Risk a mistake rather than abandon her.", { oath: 2, resolve: -1 }, "She holds the fruit to her ear. A father's laugh sounds from inside."),
     c("Bring the memory to the archivist first", "Choose certainty over speed.", { insight: 1, oath: 1 }, "The archivist verifies the name, but the winter deepens.")]),
  quest("ember-rail", "The Last Ember Train", "A railway above the ash", "✺",
    "The last night train is leaving a city with no sunrise. Its conductor is missing, and something still wants a ticket.",
    "Get the orphaned passengers through the mountain tunnel.",
    "A station hand says: 'A route without smoke may have no fire left.'",
    [r("Signal Bridge", "Shortest crossing", true, 2, 1, 1, "The signal lamps spell a warning in the old railway code.", "A fresh signal ribbon"),
     r("Coal Cut", "Protected from wind", false, 1, 0, 1, "The cut is cold. Beneath the black stones, something knocks twice.", "Ash that has not settled"),
     r("Switchback Trail", "Long but reliable", true, 0, 1, 0, "A rusted switch points toward an abandoned engine.", "Two sets of parallel tracks")],
    "An old conductor steps from the dark and offers to take the passengers, provided no one asks his name.",
    [c("Board first and test the train", "Take the risk upon yourself.", { resolve: -1, oath: 2 }, "The ghost conductor bows. A warm light spreads through the carriage."),
     c("Inspect the engine ledger", "Find out who is actually at the controls.", { insight: 2 }, "The final page records a rescue, not a derailment.")],
    "At the tunnel mouth, the line splits: one track leads to daylight, the other to a lost station.",
    [c("Follow the passengers' singing", "Trust them to show the way.", { oath: 2, resolve: -1 }, "Their voices guide the train through the smoke."),
     c("Follow the oldest track markings", "Find the safe way without trusting the ghost.", { insight: 1, oath: 1 }, "The sleepers hold, though some passengers never learn why.")]),
  quest("drowned-library", "The Drowned Library", "A library under the tide", "✒",
    "Each midnight, the tide uncovers one room of a library that should have burned a century ago.",
    "Recover the missing page before the sea erases its author's name.",
    "A diver says: 'The books that float are not the ones you want.'",
    [r("Upper Gallery", "High, dry shelves", false, 1, 1, 0, "Water drips upward from the ceiling onto a ledger that writes itself.", "Salt rings above the doorframe"),
     r("Archive Stairs", "Steady descent", true, 1, 1, 1, "A librarian's lantern illuminates a stair that is missing from the chart.", "A new chalk arrow"),
     r("Flooded Atrium", "Direct to the vault", true, 2, 2, 1, "A giant book drifts through the water with its pages closed tight.", "A chain pulled taut beneath the surface")],
    "A book opens to a page describing what you will do next. The last sentence has been torn out.",
    [c("Write a different ending", "Defy the page at a cost.", { resolve: -1, oath: 2 }, "The ink struggles, then yields. The missing author has a choice again."),
     c("Look for the ink's source", "Follow the evidence into the stacks.", { insight: 2 }, "You find the page caught under a glass weight.")],
    "The sea rises. You can take the recovered page, but the library's doors will close behind you.",
    [c("Save the author's page", "Honor the promise, even if the library is lost.", { oath: 2, resolve: -1 }, "You fold the page into a watertight case."),
     c("Copy the page before leaving", "Preserve more truth, but spend precious time.", { insight: 1, oath: 1 }, "You leave a copy beneath the lantern for whoever comes next.")]),
  quest("hollow-festival", "The Festival of Masks", "A town without faces", "◈",
    "A town holds a festival in which every visitor borrows a name. By morning, one name will belong to nobody.",
    "Find the musician whose true name was stolen.",
    "A masked baker says: 'Nobody lies while the clock is striking.'",
    [r("Lantern Street", "Bright and crowded", true, 1, 0, 1, "The parade halts whenever a violin plays a single low note.", "A tune scratched on a sign"),
     r("Backstage Alley", "Unseen entrance", false, 1, 2, 0, "A dressing-room mirror shows a fourth mask behind you.", "A discarded invitation"),
     r("Clock Square", "Safest crossing", true, 0, 1, 1, "A crowd stands utterly still beneath a clock with thirteen hands.", "Footsteps that stop at the hour")],
    "A masked dancer knows the lost song but will sing it only if you remove your own mask.",
    [c("Reveal your face", "Offer trust to someone who has none.", { oath: 2, resolve: -1 }, "The dancer sings the melody. Several masks turn toward the sound."),
     c("Wait for the clock to strike", "Use the baker's clue to learn who lies.", { insight: 2 }, "At the stroke, one silent guest speaks the musician's name.")],
    "The musician stands on stage with no face beneath their mask.",
    [c("Sing the name to the crowd", "Risk their anger to restore a person.", { oath: 2, resolve: -1 }, "The crowd sings along, and the stage lights warm."),
     c("Whisper the name to the musician", "Return what was stolen without exposing them.", { insight: 1, oath: 1 }, "A face reappears beneath the mask, unseen by the crowd.")]),
  quest("ghost-ridge", "Lanterns on Ghost Ridge", "A mountain under stars", "△",
    "Seven rescue lanterns burn on the ridge. There should be only six climbers.",
    "Find the seventh lantern before the storm reaches the pass.",
    "A climber says: 'The highest light is not always the farthest.'",
    [r("North Spine", "Direct climb", true, 2, 1, 1, "A line of lanterns flickers along the narrow cornice.", "Fresh rope tied to a cairn"),
     r("Pine Traverse", "Wind sheltered", false, 1, 1, 0, "Pines bow beneath a wind that blows from three directions.", "Snapped branches across the trail"),
     r("Old Cable Lift", "Quick ascent", true, 1, 0, 1, "An empty lift creaks upward, carrying a seventh pair of boots.", "A cable newly wound")],
    "A stranded climber asks you to carry an extra lantern, but its flame is blue and cold.",
    [c("Carry the blue lantern", "Take the weight so they can walk.", { resolve: -1, oath: 2 }, "The flame grows warm enough to reveal footprints in the snow."),
     c("Count the shadows before moving", "Look for the person the storm conceals.", { insight: 2 }, "You see seven lanterns but only six shadows.")],
    "A seventh voice calls from the pass, where the path vanishes into cloud.",
    [c("Answer and follow the voice", "Risk the last climb for a stranger.", { oath: 2, resolve: -1 }, "A gloved hand reaches back out of the white."),
     c("Light a beacon from the safe side", "Bring the missing climber to you.", { insight: 1, oath: 1 }, "A lantern answers your signal across the ravine.")]),
  quest("salt-basilica", "The Salt Basilica", "A cathedral in the sea", "✣",
    "At low tide, a cathedral rises from the salt flats. Inside, one bell rings for someone still alive.",
    "Take the warning to the person named by the bell.",
    "A salt worker says: 'The bells ring first where the water will return.'",
    [r("Tidal Steps", "Open and direct", false, 2, 0, 1, "The steps shine with a thin film of fast-moving water.", "Seaweed above the highest step"),
     r("Choir Tunnel", "Dry and echoing", true, 1, 2, 0, "Your own footsteps answer from farther inside the passage.", "An untouched salt lantern"),
     r("Pilgrim Causeway", "Safe while the tide sleeps", true, 0, 1, 1, "A row of names is carved into the stones, with one empty place.", "An empty carving at the end")],
    "The bell tolls a stranger's name. A nun insists the name belongs to a person who died years ago.",
    [c("Ask the nun to guide you", "Trust a stranger with the last hour.", { oath: 2, resolve: -1 }, "She leads you to a hidden stair and admits the records were altered."),
     c("Read the oldest memorial stones", "Search for the name in the tide-worn script.", { insight: 2 }, "The old engraving proves the name was passed to a living child.")],
    "The water returns as the named child approaches the cathedral door.",
    [c("Carry the child across", "Put your own footing at risk.", { oath: 2, resolve: -1 }, "You lift the child above the rising saltwater."),
     c("Ring the warning from the roof", "Give everyone the chance to escape.", { insight: 1, oath: 1 }, "The bell speaks once, and the flats empty.")]),
  quest("threadwood", "The Threadwood", "A forest stitched with silk", "❦",
    "Red thread ties the trees together. Every cut makes a path vanish somewhere else.",
    "Lead a lost tailor out without severing the forest's oldest knot.",
    "The tailor says: 'The path that offers a shortcut has already taken one.'",
    [r("Silk Arch", "Direct and untouched", false, 1, 1, 1, "A curtain of red thread parts before your hand reaches it.", "A loose knot on the arch"),
     r("Moss Hollow", "Long but quiet", true, 0, 1, 0, "Little bells sewn into the moss ring each time you change direction.", "Thread caught on a compass"),
     r("Needle Bridge", "Suspended above roots", true, 2, 2, 1, "Silver needles hold the bridge together in place of nails.", "A new stitch beside an old tear")],
    "A fox offers to cut the oldest knot for you. It claims it can do so without hurting the wood.",
    [c("Refuse and mend the knot", "Choose the slower path and keep your word.", { resolve: -1, oath: 2 }, "The fox watches as the tailor stitches the torn thread by hand."),
     c("Ask the fox to show the hidden seam", "Learn why the forest has so many knots.", { insight: 2 }, "The seam runs through the fox's own shadow.")],
    "At the forest edge, the tailor discovers the exit is tied shut from the outside.",
    [c("Pull the final thread yourself", "Bear the cost to free the tailor.", { oath: 2, resolve: -1 }, "The forest loosens around you, knot by knot."),
     c("Teach the tailor the hidden stitch", "Give them the means to open it safely.", { insight: 1, oath: 1 }, "The tailor opens the path without cutting a single strand.")]),
  quest("clock-ferry", "The Clockwork Ferry", "A canal between hours", "⌛",
    "A ferry can cross the canal only at the hour that has not happened yet.",
    "Deliver a medicine chest before the town clock strikes thirteen.",
    "The ferryman says: 'The clocks that agree are the ones to fear.'",
    [r("Iron Towpath", "Fast and level", true, 1, 0, 1, "The path runs beside a clock that ticks backward.", "Fresh chalk marks at noon"),
     r("Waterwheel Bridge", "Safe crossing", false, 1, 1, 0, "The wheel freezes each time you look directly at it.", "An unmoving hand on a dial"),
     r("Ferry Deck", "Moves before dawn", true, 0, 1, 1, "The boat shudders when a passenger names the wrong hour.", "A ticket stamped TOMORROW")],
    "The ferryman offers you a ticket dated tomorrow, but the sick are waiting tonight.",
    [c("Board with the medicine", "Risk crossing at the wrong hour.", { resolve: -1, oath: 2 }, "The boat slips between two strokes of the clock."),
     c("Recalculate the ferry's hour", "Use the gears to find a safer moment.", { insight: 2 }, "A missing tooth reveals why the clock keeps skipping thirteen.")],
    "On the opposite shore, a bell begins its thirteenth stroke.",
    [c("Run the medicine to the infirmary", "Keep your promise before the final stroke.", { oath: 2, resolve: -1 }, "The chest reaches the doctor as the bell falls silent."),
     c("Stop the clock mechanism", "Give the town a few more minutes.", { insight: 1, oath: 1 }, "The great hand hangs still above the square.")]),
  quest("starfall", "The Starfall Observatory", "A dome above the clouds", "✴",
    "A star has gone missing from the sky. At the observatory, an astronomer insists it is hiding indoors.",
    "Return the lost star to the sky before the horizon goes dark.",
    "The astronomer says: 'A bright light is often only a reflection.'",
    [r("Solar Stair", "Lit all night", false, 1, 1, 0, "The steps are lit by a star that is no longer overhead.", "A shadow pointing the wrong way"),
     r("Comet Walk", "Wind swept but true", true, 1, 2, 1, "White dust trails from the edge of the path.", "Fresh ash from the telescope"),
     r("Service Lift", "Fast to the dome", true, 2, 0, 1, "The lift hums with an engine that has never been built.", "A cold brass key")],
    "A second astronomer offers you a convincing painted star to hang in the empty place.",
    [c("Refuse the imitation", "Keep searching, even as darkness grows.", { oath: 2, resolve: -1 }, "The painted star cracks, revealing a real point of light trapped inside."),
     c("Measure the light's shadow", "Determine which glow is genuine.", { insight: 2 }, "The true star casts no shadow at all.")],
    "The dome opens. The trapped star pulses in your hands, asking whether you will keep it.",
    [c("Let the star go", "Complete the task at a personal cost.", { oath: 2, resolve: -1 }, "Light pours upward and repairs a gap in the heavens."),
     c("Return it with the astronomer's machine", "Preserve your strength and leave a record.", { insight: 1, oath: 1 }, "The machine releases the star, drawing a new constellation.")]),
  quest("ash-market", "The Ash Market", "A bazaar under the volcano", "♜",
    "At dawn, the market sells the last raincloud of the season. Two villages have both paid for it.",
    "Find a way to bring rain to the villages without starting a war.",
    "A vendor says: 'Clouds cannot be owned, but contracts can.'",
    [r("Cinder Arcade", "Quick route to the auction", true, 1, 1, 1, "A merchant is hiding a second deed beneath a brass scale.", "Ash disturbed beneath a desk"),
     r("Fountain Lane", "Sheltered in heat", false, 1, 1, 0, "The fountain is filled with hot dust, not water.", "A still-wet jug behind a shutter"),
     r("Roof Bazaar", "Clear sight of bidders", true, 2, 2, 1, "Two village banners hang from the same pole.", "Fresh thread on a shared knot")],
    "The auctioneer shows you two signed deeds to the same cloud. Both signatures are genuine.",
    [c("Offer to divide the rain", "Take responsibility for the impossible bargain.", { oath: 2, resolve: -1 }, "The two village elders agree to meet beneath the same awning."),
     c("Examine the auction's fine print", "Look for a loophole in the sale.", { insight: 2 }, "The deeds promise rain, but never ownership of the cloud.")],
    "The raincloud trembles in its glass jar. The villages wait for your decision.",
    [c("Break the jar between them", "Risk the market's anger to share the rain.", { oath: 2, resolve: -1 }, "Rain splashes across both banners, washing the ash away."),
     c("Return the jar to the mountain", "Restore a shared source of water.", { insight: 1, oath: 1 }, "The cloud rises to the summit, where it can reach both valleys.")]),
  quest("crown-road", "The Old Crown Road", "A kingdom without a throne", "♛",
    "A messenger carries a crown that nobody wants. Every village along the road claims the last king was someone else.",
    "Bring the crown to its rightful keeper without naming a new ruler.",
    "A shepherd says: 'The best guide remembers who walked here before.'",
    [r("Royal Road", "Straight and well marked", false, 1, 1, 0, "Fresh banners conceal holes beneath the cobbles.", "A banner tied over a warning"),
     r("Shepherd's Track", "Slow and unguarded", true, 0, 1, 1, "An old shepherd leads you past stones engraved with ordinary names.", "A weathered staff mark"),
     r("Ruined Aqueduct", "High above patrols", true, 2, 2, 1, "Broken statues point to a hall beneath the road.", "A new flower at an old statue")],
    "An armored stranger offers to take the crown and rule wisely. Their horse refuses to cross the threshold.",
    [c("Carry the crown yourself", "Accept the burden for one more mile.", { oath: 2, resolve: -1 }, "The stranger removes their helmet and lets you pass."),
     c("Ask the horse why it stopped", "Seek an older witness than the stranger.", { insight: 2 }, "The horse leads you toward a chapel with no royal crest.")],
    "At the empty throne, a plain wooden chair stands beside the gold one.",
    [c("Place the crown on the wooden chair", "Return power to the people who must live with it.", { oath: 2, resolve: -1 }, "The hall fills with voices instead of a royal command."),
     c("Leave the crown with the chapel keeper", "Keep it out of ambitious hands.", { insight: 1, oath: 1 }, "The keeper seals the crown beneath an ordinary stone.")]),
];

export const OMENS = [
  { id: "clear", title: "The Quiet Sky", description: "The morning was clear. Yesterday's charts are more trustworthy than usual.", staleRoute: -1 },
  { id: "flood", title: "The Sudden Flood", description: "The lowest crossing changed overnight. The first route has fresh damage.", staleRoute: 0 },
  { id: "mist", title: "The White Mist", description: "A traveler reports that the middle passage no longer matches its sign.", staleRoute: 1 },
  { id: "collapse", title: "The Broken Marker", description: "The final route has shifted since its last survey.", staleRoute: 2 },
  { id: "echo", title: "The Second Bell", description: "A witness heard a warning at the first route just before dawn.", staleRoute: 0 },
  { id: "drift", title: "The Turning Wind", description: "Fresh marks suggest the last crossing has become unreliable.", staleRoute: 2 },
  { id: "night", title: "The Lantern Watch", description: "Last night's patrol returned with doubts about the middle route.", staleRoute: 1 },
];

export function pacificDayKey(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const p = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return p.year + "-" + p.month + "-" + p.day;
}

export function getDispatch(dayKey) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dayKey) || !Number.isFinite(Date.parse(dayKey + "T00:00:00Z"))) {
    throw new Error("Invalid Pacific day key");
  }
  const number = Math.floor(Date.parse(dayKey + "T00:00:00Z") / 86400000);
  const chapterIndex = ((number % QUESTS.length) + QUESTS.length) % QUESTS.length;
  const omenIndex = ((Math.floor(number / QUESTS.length) % OMENS.length) + OMENS.length) % OMENS.length;
  const chapter = QUESTS[chapterIndex];
  const omen = OMENS[omenIndex];
  const routes = chapter.routes.map((route, index) => ({
    ...route, id: String(index), reliable: route.sound && omen.staleRoute !== index,
  }));
  return { ...chapter, routes, omen, dayKey, number, chapterIndex, omenIndex, dispatchNumber: number - Math.floor(Date.UTC(2026, 10, 11) / 86400000) + 1 };
}

export function startRun(dispatch, heroId) {
  const hero = HEROES.find((item) => item.id === heroId);
  if (!hero) throw new Error("Unknown hero");
  return {
    dayKey: dispatch.dayKey, heroId, phase: "route", routeId: null, scoutedId: null,
    encounterChoice: null, finalChoice: null, finished: false,
    stats: { ...hero.stats, oath: 0 }, history: [], ending: null,
  };
}

export function chooseRoute(dispatch, run, routeId) {
  if (run.phase !== "route" || !dispatch.routes.some((route) => route.id === routeId)) throw new Error("Route unavailable");
  return { ...run, routeId };
}

export function scout(dispatch, run) {
  if (run.phase !== "route" || run.scoutedId !== null || run.routeId === null) throw new Error("Scouting unavailable");
  return { ...run, scoutedId: run.routeId };
}

export function advanceToEncounter(dispatch, run) {
  if (run.phase !== "route" || run.routeId === null) throw new Error("Choose a route first");
  const route = dispatch.routes.find((item) => item.id === run.routeId);
  const hazard = Math.min(2, route.danger + (route.reliable ? 0 : 1));
  const stats = { ...run.stats, resolve: run.stats.resolve - hazard, insight: run.stats.insight + route.insight, oath: run.stats.oath + route.oath };
  return { ...run, phase: "encounter", stats, history: [...run.history, { title: "The path", text: route.scene, cost: hazard }] };
}

export function canAfford(run, choice) {
  return Object.entries(choice.effects).every(([key, delta]) => delta >= 0 || key !== "supplies" || run.stats.supplies + delta >= 0);
}

function applyChoice(run, choice, key, phase, title) {
  if (!canAfford(run, choice)) throw new Error("Not enough supplies");
  const stats = { ...run.stats };
  for (const [stat, delta] of Object.entries(choice.effects)) stats[stat] += delta;
  return { ...run, [key]: choice.label, phase, stats, history: [...run.history, { title, text: choice.result }] };
}

export function advanceEncounter(dispatch, run, index) {
  const choice = dispatch.encounterChoices[index];
  if (run.phase !== "encounter" || !choice) throw new Error("Encounter choice unavailable");
  return applyChoice(run, choice, "encounterChoice", "finale", "Your decision");
}

export function conclude(dispatch, run, index) {
  const choice = dispatch.finaleChoices[index];
  if (run.phase !== "finale" || !choice) throw new Error("Finale choice unavailable");
  const next = applyChoice(run, choice, "finalChoice", "report", "At the threshold");
  const route = dispatch.routes.find((item) => item.id === next.routeId);
  const arrived = next.stats.resolve > 0;
  const keptPromise = arrived && next.stats.oath >= 3;
  const discovered = arrived && next.stats.insight >= 3;
  const rank = keptPromise ? "oathkeeper" : arrived ? "survivor" : "lost";
  const ending = {
    rank, arrived, keptPromise, discovered,
    title: keptPromise ? "The oath was kept" : arrived ? "The road demanded a price" : "The road turned you back",
    description: keptPromise
      ? "Against the changing chart, you saw " + dispatch.promise.toLowerCase() + " through to its end."
      : arrived
        ? "You reached " + dispatch.place.toLowerCase() + ", but the promise changed hands before it could be fulfilled."
        : "Your strength ran out before the final mile. You turned back alive, carrying the weight of an unfinished promise.",
    detail: choice.result, routeName: route.name,
    path: next.history.map((item) => item.title + ": " + item.text),
    score: Math.max(0, next.stats.oath * 2 + next.stats.insight + Math.max(0, next.stats.resolve)),
  };
  return { ...next, finished: true, ending };
}
