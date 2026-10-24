import { Router, type IRouter } from "express";
import {
  GetInterpretStatusResponse,
  InterpretNoticeBody,
  InterpretNoticeResponse,
} from "@workspace/api-zod";
import { HttpError, MODEL, interpret, isConfigured } from "../lib/interpret";

const router: IRouter = Router();

// Simple in-memory per-IP limiter: protects the API key from abuse.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;
const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  }
  return recent.length > MAX_PER_WINDOW;
}

router.get("/interpret/status", (_req, res) => {
  res.json(GetInterpretStatusResponse.parse({ connected: isConfigured(), model: MODEL }));
});

router.post("/interpret", async (req, res) => {
  const parsed = InterpretNoticeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request.", code: "invalid_request" });
    return;
  }
  if (limited(req.ip ?? "unknown")) {
    res.status(429).json({ error: "Too many requests. Please wait a minute and try again.", code: "rate_limited" });
    return;
  }
  try {
    const plan = await interpret(parsed.data);
    res.json(InterpretNoticeResponse.parse({ plan, mode: "live" }));
  } catch (err) {
    if (err instanceof HttpError) {
      req.log.warn({ status: err.status }, err.message);
      res.status(err.status).json({ error: err.message, code: err.code });
      return;
    }
    req.log.error({ err }, "interpret failed");
    res.status(500).json({ error: "Something went wrong. Please try again.", code: "server_error" });
  }
});

export default router;
