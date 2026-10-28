import { reply } from "../lib/agent.js";

// Vercel entry point.
export default async function handler(req, res) {
  const { status, json } = await reply(req.method, req.headers["x-demo-code"], req.body);
  return res.status(status).json(json);
}
