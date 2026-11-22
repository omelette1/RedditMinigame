import { requestExpandedMode } from "@devvit/web/client";
import { getDispatch, pacificDayKey } from "../../public/story.js";

function refreshPreview() {
  const key = pacificDayKey();
  const quest = getDispatch(key);
  document.getElementById("day-label").textContent = key;
  document.getElementById("quest-icon").textContent = quest.icon;
  document.getElementById("quest-name").textContent = quest.title;
  document.getElementById("quest-detail").textContent = quest.introduction;
}
document.getElementById("launch").addEventListener("click", (event) => {
  try {
    requestExpandedMode(event, "game", { title: "The Unreliable Map" });
  } catch (error) {
    const message = document.getElementById("launch-error");
    message.hidden = false;
    message.textContent = "Expanded mode unavailable here. Open the full game in your browser.";
    // Outside Reddit, keep the locally hosted preview useful.
    if (window.top === window.self) window.location.assign("./index.html");
    console.error("Could not enter expanded mode:", error);
  }
});
refreshPreview();
window.addEventListener("focus", refreshPreview);
document.addEventListener("visibilitychange", () => { if (!document.hidden) refreshPreview(); });
