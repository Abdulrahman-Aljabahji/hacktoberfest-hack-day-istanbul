import { Router, type IRouter } from "express";
import {
  GetInterpretStatusResponse,
  AskNoticeBody,
  AskNoticeResponse,
  InterpretNoticeBody,
  InterpretNoticeResponse,
} from "@workspace/api-zod";
import { askNotice } from "../lib/ask";
import { createLimiter } from "../lib/rateLimit";
import { HttpError, MODEL, interpret, isConfigured } from "../lib/interpret";

const router: IRouter = Router();

const limited = createLimiter(12);
const askLimited = createLimiter(20);

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

router.post("/ask", async (req, res) => {
  const parsed = AskNoticeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request.", code: "invalid_request" });
    return;
  }
  if (askLimited(req.ip ?? "unknown")) {
    res.status(429).json({ error: "Too many requests. Please wait a minute and try again.", code: "rate_limited" });
    return;
  }
  try {
    // Question and source are never logged or stored.
    res.json(AskNoticeResponse.parse(await askNotice(parsed.data)));
  } catch (err) {
    if (err instanceof HttpError) {
      req.log.warn({ status: err.status }, err.message);
      res.status(err.status).json({ error: err.message, code: err.code });
      return;
    }
    req.log.error({ err }, "ask failed");
    res.status(500).json({ error: "Something went wrong. Please try again.", code: "server_error" });
  }
});

export default router;
