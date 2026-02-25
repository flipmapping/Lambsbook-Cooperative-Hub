import type { Express } from "express";

export function serveStatic(app: Express) {
  app.get("*", (_req, res) => {
    res.send("NEW PRODUCTION SERVER IS RUNNING");
  });
}