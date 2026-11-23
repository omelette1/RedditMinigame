// Authored building blocks assembled deterministically by the Pacific date.
// No AI/API calls, no network dependency, and no Math.random.
// This changes daily complications and tradeoffs, not the underlying 12 story arcs.

export const DAILY_TWISTS = [
  {
    id: "copper-eclipse", title: "The Copper Eclipse", pressure: 0,
    description: "A copper eclipse stains the sky. Its heat has weakened the first passage.",
    encounter: "A red halo briefly illuminates something that was hidden in the terrain.",
    finale: "The eclipse is almost over. You can still act before the color fades.",
  },
  {
    id: "paper-rain", title: "The Paper Rain", pressure: 1,
    description: "Blank pages fall like rain. The middle passage has become treacherous beneath them.",
    encounter: "One fallen page bears a sentence written in your own handwriting.",
    finale: "The last page lands at your feet, waiting for someone to decide how the story ends.",
  },
  {
    id: "sleeping-roads", title: "The Sleeping Roads", pressure: 2,
    description: "The roads have begun to dream. The final passage shifts whenever no one looks.",
    encounter: "The ground repeats a memory that you have never lived.",
    finale: "For one moment, the road lies still, as though listening for your answer.",
  },
  {
    id: "second-sun", title: "The Second Sun", pressure: 0,
    description: "A pale second sun rises in the wrong direction, cracking the first passage's surface.",
    encounter: "Two shadows leave your boots; one points toward something deliberately concealed.",
    finale: "The false sun sinks first, leaving only one chance to finish the promise.",
  },
  {
    id: "quiet-hour", title: "The Quiet Hour", pressure: 1,
    description: "Every clock has stopped for an hour. The middle passage is fragile in the unnatural silence.",
    encounter: "A whispered warning remains audible even after its speaker falls silent.",
    finale: "The missing hour begins to return, and the world asks what you will do with it.",
  },
  {
    id: "wild-lanterns", title: "The Wild Lanterns", pressure: 2,
    description: "Unattended lanterns drift above the road, drawing travelers toward a dangerous third passage.",
    encounter: "One lantern descends, casting the outline of a doorway across bare ground.",
    finale: "The lanterns gather overhead like a small constellation, marking the final decision.",
  },
  {
    id: "ink-fog", title: "The Ink Fog", pressure: 1,
    description: "Dark fog spills from the oldest maps. It thickens around the middle passage.",
    encounter: "An erased warning reappears where your footsteps have disturbed the fog.",
    finale: "An unopened map unfolds in the mist, offering a route that ends at your own choice.",
  },
  {
    id: "borrowed-names", title: "The Borrowed Names", pressure: 0,
    description: "Travelers hear strangers calling them by forgotten names. The first passage trembles with echoes.",
    encounter: "Someone nearby speaks the name of a person you have not met yet.",
    finale: "The last name on the list is blank. You decide who deserves to be remembered.",
  },
];

export const ALLIES = [
  {
    id: "lantern-archivist", name: "The Lantern Archivist",
    introduction: "A lantern archivist walks beside the road, collecting stories nobody finished.",
    help: "Ask the lantern archivist for the missing account",
    price: "Spend 1 Supply to compare the conflicting reports.",
    discovery: "The archivist opens an annotated diary and points to a detail that everyone else missed.",
    final: "Let the archivist witness your promise",
    finalDetail: "Spend 1 Supply to call on an impartial witness.",
    ending: "The archivist records your choice beneath an unbroken seal.",
  },
  {
    id: "quiet-cartographer", name: "The Quiet Cartographer",
    introduction: "A cartographer with no voice offers to follow your journey by drawing in the dust.",
    help: "Ask the cartographer to redraw the last mile",
    price: "Spend 1 Supply to repair the cartographer's broken pen.",
    discovery: "A new line appears on the sketch, revealing a hidden turning.",
    final: "Trust the cartographer's final mark",
    finalDetail: "Spend 1 Supply to follow their carefully drawn signal.",
    ending: "The cartographer signs their name beneath the final mark.",
  },
  {
    id: "bridge-mender", name: "The Bridge Mender",
    introduction: "A bridge mender carrying mismatched tools follows the same route as you.",
    help: "Trade a tool for a safer crossing",
    price: "Spend 1 Supply so the mender can reinforce a dangerous step.",
    discovery: "A repaired plank holds under your feet, revealing an old inscription beneath it.",
    final: "Ask the mender to secure the way home",
    finalDetail: "Spend 1 Supply to leave the route safer for those behind you.",
    ending: "The mender secures a marker that will guide the next traveler.",
  },
  {
    id: "wandering-bellkeeper", name: "The Wandering Bellkeeper",
    introduction: "A wandering bellkeeper says they have heard this road's warning before.",
    help: "Borrow the bellkeeper's listening horn",
    price: "Spend 1 Supply to fix a crack in the listening horn.",
    discovery: "The horn catches a quiet sound from the safer side of the obstacle.",
    final: "Sound the bellkeeper's warning",
    finalDetail: "Spend 1 Supply to alert everyone near the final crossing.",
    ending: "A clear note carries your warning far beyond the road.",
  },
  {
    id: "moth-messenger", name: "The Moth Messenger",
    introduction: "A cloaked messenger follows a pale moth that seems to recognize the old paths.",
    help: "Feed the messenger's guiding moth",
    price: "Spend 1 Supply to help the tired moth scout ahead.",
    discovery: "The moth settles on a forgotten marker, revealing where the path used to turn.",
    final: "Send a message ahead with the moth",
    finalDetail: "Spend 1 Supply to carry a warning before you arrive.",
    ending: "The moth reaches the far side, carrying a scrap of your story.",
  },
  {
    id: "ink-trader", name: "The Ink Trader",
    introduction: "An ink trader offers to exchange one honest memory for a map that has never been altered.",
    help: "Purchase a fragment of the true survey",
    price: "Spend 1 Supply for an original, uncopied map fragment.",
    discovery: "Under the old ink, you can finally see where the newer survey went wrong.",
    final: "Leave an honest account for tomorrow",
    finalDetail: "Spend 1 Supply to leave a truthful marker for other travelers.",
    ending: "The ink trader seals your account in a glass bottle by the road.",
  },
];

const extra = (label, detail, effects, result) => ({ label, detail, effects, result });

export function generateDailyModules(chapter, omen, number) {
  const chapterCount = 12;
  const omenCount = 7;
  const twistIndex = ((Math.floor(number / (chapterCount * omenCount)) % DAILY_TWISTS.length) + DAILY_TWISTS.length) % DAILY_TWISTS.length;
  const allyIndex = ((Math.floor(number / (chapterCount * omenCount * DAILY_TWISTS.length)) % ALLIES.length) + ALLIES.length) % ALLIES.length;
  const twist = DAILY_TWISTS[twistIndex];
  const ally = ALLIES[allyIndex];
  const encounterChoices = [
    ...chapter.encounterChoices,
    extra(ally.help, ally.price, { supplies: -1, insight: 1, resolve: 1 }, ally.discovery),
  ];
  const finaleChoices = [
    ...chapter.finaleChoices,
    extra(ally.final, ally.finalDetail, { supplies: -1, oath: 2 }, ally.ending),
  ];
  // If the first attempt fails, the story opens an alternate rescue/detour
  // scene with three genuinely different actions—not just a red failure label.
  const recoveryChoices = [
    extra("Restore the broken promise", "Take the hard way back to the original objective, despite the setback.",
      { resolve: -1, oath: 2 },
      "You find another opening and make your way back toward " + chapter.place.toLowerCase() + ", determined not to abandon the promise."),
    extra("Follow the hidden evidence", "Find a new approach using the clues that the setback revealed.",
      { insight: 1, oath: 1 },
      "The evidence overlooked along the first road points to a quieter way through " + chapter.place.toLowerCase() + "."),
    extra("Ask " + ally.name + " for rescue", ally.finalDetail,
      { supplies: -1, oath: 2 },
      ally.ending + " Together you return to the quest by a different road."),
  ];
  return {
    twist,
    ally,
    twistIndex,
    allyIndex,
    editionId: [chapter.id, omen.id, twist.id, ally.id].join(":"),
    introduction: chapter.introduction + " " + twist.description,
    witness: chapter.witness + " " + ally.introduction,
    encounter: chapter.encounter + " " + twist.encounter,
    finale: chapter.finale + " " + twist.finale,
    encounterChoices,
    finaleChoices,
    recoveryChoices,
    routePressureIndex: twist.pressure,
  };
}
