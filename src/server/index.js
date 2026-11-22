import { createServer, getServerPort, reddit, context, redis } from "@devvit/web/server";
import { pacificDayKey } from "../../public/story.js";
import { ProgressError } from "../../public/progress.js";
import { getAccountProgress, updateAccountProgress, deleteAccountProgress } from "./progress-service.js";

function reply(response, status, body) {
  const payload = JSON.stringify(body);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Content-Length": Buffer.byteLength(payload),
  });
  response.end(payload);
}

async function readAction(request) {
  let raw = "";
  for await (const chunk of request) {
    raw += chunk.toString("utf8");
    if (raw.length > 4096) throw new ProgressError("Action is too large", 413);
  }
  if (!request.headers["content-type"]?.toLowerCase().startsWith("application/json")) {
    throw new ProgressError("Actions must use JSON");
  }
  try {
    const body = JSON.parse(raw);
    if (!body || Array.isArray(body) || typeof body !== "object") throw new Error();
    return body;
  } catch { throw new ProgressError("Invalid JSON action"); }
}

const app = createServer(async (request, response) => {
  const path = request.url?.split("?")[0];
  const dayKey = pacificDayKey(); // Server time is authoritative.
  try {
    if (path === "/api/progress") {
      // Identity comes only from Reddit's authenticated request context. The
      // client NEVER sends an account name or user ID.
      const userId = context.userId;
      if (request.method === "GET") {
        return reply(response, 200, {
          account: "reddit",
          ...(await getAccountProgress(redis, userId, dayKey)),
        });
      }
      if (request.method === "DELETE") {
        return reply(response, 200, {
          account: "reddit",
          ...(await deleteAccountProgress(redis, userId, dayKey)),
        });
      }
      return reply(response, 405, { error: "Method not allowed" });
    }

    if (path === "/api/progress/action") {
      if (request.method !== "POST") return reply(response, 405, { error: "Method not allowed" });
      const body = await readAction(request);
      const result = await updateAccountProgress(redis, context.userId, dayKey, body.revision, body.action);
      return reply(response, 200, { account: "reddit", ...result });
    }

    if (path === "/internal/on/menu/new-post" && request.method === "POST") {
      const post = await reddit.submitCustomPost({
        title: "The Unreliable Map · Today's Story Expedition",
        entry: "default",
        textFallback: "A daily fantasy expedition. Choose a route through an unreliable world and compare your ending.",
      });
      return reply(response, 200, {
        navigateTo: post.url,
        showToast: { appearance: "success", text: "Daily adventure post created." },
      });
    }

    return reply(response, 404, { error: "Not found" });
  } catch (error) {
    const known = error instanceof ProgressError;
    if (!known) console.error("Unreliable Map API failure:", error);
    return reply(response, known ? error.status : 500, {
      error: known ? error.message : "The adventure could not be saved. Please retry.",
    });
  }
});
app.on("error", (error) => console.error("Devvit server error", error));
app.listen(getServerPort(), () => console.log("Reddit adventure server ready"));
