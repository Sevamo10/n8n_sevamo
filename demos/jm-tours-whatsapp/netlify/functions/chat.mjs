import { reply } from "../../lib/agent.js";

// Netlify entry point, served at the same /api/chat path the page calls.
export default async (req) => {
  const payload = req.method === "POST" ? await req.json().catch(() => ({})) : {};
  const { status, json } = await reply(req.method, req.headers.get("x-demo-code"), payload);
  return Response.json(json, { status });
};

export const config = { path: "/api/chat" };
