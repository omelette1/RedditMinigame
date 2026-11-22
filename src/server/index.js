import { createServer, getServerPort, reddit } from "@devvit/web/server";

const app = createServer(async (request, response) => {
  if (request.method !== "POST" || request.url?.split("?")[0] !== "/internal/on/menu/new-post") {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Not found", status: 404 }));
    return;
  }
  try {
    const post = await reddit.submitCustomPost({
      title: "The Unreliable Map · Today's Story Expedition",
      entry: "default",
      textFallback: "A new daily story expedition. Enter the game to choose a role and a route through an unreliable world.",
    });
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({
      navigateTo: post.url,
      showToast: { appearance: "success", text: "Daily adventure post created." },
    }));
  } catch (error) {
    console.error("Unable to create the expedition post", error);
    response.writeHead(500, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ status: 500, error: "Could not create a game post." }));
  }
});
app.on("error", (error) => console.error("Devvit server error", error));
app.listen(getServerPort(), () => console.log("Expedition post server ready"));
