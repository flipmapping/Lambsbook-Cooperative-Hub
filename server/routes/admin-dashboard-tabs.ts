import { Router, type Request, type Response, type NextFunction, type RequestHandler } from "express";
import { z } from "zod";
import { insertNotificationTemplateSchema } from "@shared/schema";
import { attachUserContext } from "../middleware/attachUserContext";
import { detectPlatformAdmin } from "../middleware/requirePlatformAdmin";
import type { AuthenticatedRequest } from "../types/requestContext";
import { adminDashboardStorage } from "../storage/admin-dashboard-tabs";

export function requireDashboardAdmin(req: Request, res: Response, next: NextFunction) {
  const identity = req as AuthenticatedRequest;
  if (!identity.user?.id) return res.status(401).json({ error: "Authentication required" });
  if (
    identity.isPlatformAdmin !== true &&
    identity.user.is_super_admin !== true
  ) {
    return res.status(403).json({ error: "Platform administrator access required" });
  }
  next();
}

export function validateTemplate(fields: Record<string, unknown>): string | null {
  const approved = new Set(Array.isArray(fields.approvedVariables) ? fields.approvedVariables : []);
  let completeLocales = 0;
  for (const locale of ["en", "vi", "zh"]) {
    const subject = String(fields[`${locale}Subject`] ?? "");
    const message = String(fields[`${locale}Message`] ?? "");
    for (const value of [subject, message]) {
      if (/\{\{|\}\}/.test(value.replace(/\{\{\w+\}\}/g, ""))) {
        return "Template contains an incomplete or invalid variable.";
      }
      for (const match of Array.from(value.matchAll(/\{\{(\w+)\}\}/g))) {
        if (!approved.has(match[1])) return `Declare every variable used in the template: ${match[1]}.`;
      }
    }
    if (fields.status === "active" && Boolean(subject.trim()) !== Boolean(message.trim())) {
      return `${locale.toUpperCase()} needs both a subject and a message, or neither.`;
    }
    if (subject.trim() && message.trim()) completeLocales++;
  }
  if (fields.status === "active" && !completeLocales) return "An active template needs at least one complete language.";
  return null;
}

// Dependency injection is for isolated tests; production always uses verified identity middleware.
export function createAdminDashboardTabsRouter(
  store = adminDashboardStorage,
  identityMiddleware: RequestHandler[] = [attachUserContext, detectPlatformAdmin],
) {
  const router = Router();
  // Apply only to these restored paths; existing dashboard routes retain their behavior.
  router.use(["/prospects", "/notification-templates"], ...identityMiddleware, requireDashboardAdmin);
  router.get("/prospects", async (_req, res) => {
    try { res.json(await store.getProspects()); }
    catch { res.status(500).json({ error: "Failed to fetch prospects" }); }
  });
  router.get("/notification-templates", async (_req, res) => {
    try { res.json(await store.getNotificationTemplates()); }
    catch { res.status(500).json({ error: "Failed to fetch notification templates" }); }
  });
  router.post("/notification-templates", async (req, res) => {
    try {
      const data = insertNotificationTemplateSchema.parse(req.body);
      const error = validateTemplate(data);
      if (error) return res.status(400).json({ error });
      return res.status(201).json(await store.createNotificationTemplate(data, (req as AuthenticatedRequest).user!.id));
    } catch (error) {
      return res.status(error instanceof z.ZodError ? 400 : 500)
        .json({ error: error instanceof z.ZodError ? error.errors : "Failed to create notification template" });
    }
  });
  router.patch("/notification-templates/:id", async (req, res) => {
    try {
      // partial() leaves absent fields absent; never default or clear untouched locale content.
      const data = insertNotificationTemplateSchema.partial().parse(req.body);
      const existing = await store.getNotificationTemplate(req.params.id);
      if (!existing) return res.status(404).json({ error: "Notification template not found" });
      if (!Object.keys(data).length) return res.json(existing);
      const error = validateTemplate({ ...existing, ...data });
      if (error) return res.status(400).json({ error });
      const updated = await store.updateNotificationTemplate(req.params.id, data, (req as unknown as AuthenticatedRequest).user!.id);
      return updated ? res.json(updated) : res.status(404).json({ error: "Notification template not found" });
    } catch (error) {
      return res.status(error instanceof z.ZodError ? 400 : 500)
        .json({ error: error instanceof z.ZodError ? error.errors : "Failed to update notification template" });
    }
  });
  return router;
}

export default createAdminDashboardTabsRouter();
