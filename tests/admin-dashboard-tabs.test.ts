import assert from "node:assert/strict";
import test from "node:test";
import express, { type RequestHandler } from "express";
import { createAdminDashboardTabsRouter, validateTemplate } from "../server/routes/admin-dashboard-tabs";
import { changedTemplateFields } from "../client/src/components/admin/NotificationTemplatesPanel";
import type { adminDashboardStorage } from "../server/storage/admin-dashboard-tabs";

const template = {
  id: "test-template", templateKey: "test", version: 1, status: "draft",
  enSubject: "Hello {{name}}", enMessage: "Original English ",
  viSubject: "Xin chào", viMessage: "Nội dung", zhSubject: null, zhMessage: null,
  approvedVariables: ["name"], createdAt: new Date(0), updatedAt: new Date(0), updatedBy: null,
};

test("template validation and field preservation", () => {
  assert.equal(validateTemplate(template), null);
  assert.match(validateTemplate({ ...template, approvedVariables: [] })!, /Declare/);
  assert.match(validateTemplate({ ...template, enMessage: "{{broken" })!, /invalid/);
  assert.match(validateTemplate({ ...template, status: "active", viMessage: "" })!, /VI needs/);
  assert.deepEqual(changedTemplateFields(template, { ...template }), {});
  assert.deepEqual(changedTemplateFields(template, { ...template, enSubject: "New subject" }), { enSubject: "New subject" });
  assert.deepEqual(changedTemplateFields(template, { ...template, zhSubject: "" }), { zhSubject: "" });
});

test("restored endpoints enforce admin access and do not write on reads or empty saves", async () => {
  const writes: unknown[] = [];
  let reads = 0;
  const store: typeof adminDashboardStorage = {
    async getProspects() { reads++; return [{ id: "test-prospect", full_name: "Test prospect" }]; },
    async getNotificationTemplates() { reads++; return [{ ...template }]; },
    async getNotificationTemplate(id) { reads++; return id === template.id ? { ...template } : undefined; },
    async createNotificationTemplate(data, actor) {
      writes.push({ data, actor });
      return { ...template, ...data, updatedBy: actor };
    },
    async updateNotificationTemplate(id, data, actor) {
      writes.push({ id, data, actor });
      return { ...template, ...data, updatedBy: actor };
    },
  };
  // Identity is injected only into this isolated test server, never the app.
  const identity: RequestHandler = (req, _res, next) => {
    if (req.headers["x-test-role"]) {
      Object.assign(req, { user: { id: "test-admin" }, isPlatformAdmin: req.headers["x-test-role"] === "admin" });
    }
    next();
  };
  const app = express();
  app.use(express.json());
  app.use("/api/admin", createAdminDashboardTabsRouter(store, [identity]));
  app.get("/api/admin/stats", (_req, res) => res.json({ unchanged: true }));
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>(resolve => server.once("listening", resolve));
  const address = server.address();
  assert(address && typeof address !== "string");
  const base = `http://127.0.0.1:${address.port}/api/admin`;
  const request = (path: string, method = "GET", role?: string, body?: unknown) =>
    fetch(base + path, { method, headers: { "Content-Type": "application/json", ...(role ? { "x-test-role": role } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  try {
    for (const [url, method, body] of [
      ["/prospects", "GET", undefined], ["/notification-templates", "GET", undefined],
      ["/notification-templates", "POST", {}], ["/notification-templates/test-template", "PATCH", {}],
    ] as const) {
      assert.equal((await request(url, method, undefined, body)).status, 401);
      assert.equal((await request(url, method, "member", body)).status, 403);
    }
    assert.equal(reads, 0);
    assert.equal((await request("/stats")).status, 200);
    assert.equal((await request("/prospects", "GET", "admin")).status, 200);
    assert.equal((await request("/notification-templates", "GET", "admin")).status, 200);
    assert.equal(writes.length, 0);
    assert.equal((await request("/notification-templates/test-template", "PATCH", "admin", {})).status, 200);
    assert.equal(writes.length, 0);
    const saved = await request("/notification-templates/test-template", "PATCH", "admin", { enSubject: "Changed" });
    assert.equal(saved.status, 200);
    const result = await saved.json();
    assert.equal(result.viMessage, template.viMessage);
    assert.equal(result.zhSubject, null);
    assert.equal(result.enMessage, template.enMessage);
    assert.deepEqual(writes[0], { id: template.id, data: { enSubject: "Changed" }, actor: "test-admin" });
    assert.equal((await request("/notification-templates/test-template", "PATCH", "admin", { updatedBy: "forged" })).status, 400);
    assert.equal((await request("/notification-templates/test-template", "PATCH", "admin", { status: "invalid" })).status, 400);
    assert.equal((await request("/notification-templates/missing", "PATCH", "admin", {})).status, 404);
    assert.equal((await request("/notification-templates", "POST", "admin", { templateKey: "new", enSubject: "", enMessage: "" })).status, 201);
    assert.equal((await request("/prospects", "DELETE", "admin", { ids: ["test-prospect"] })).status, 404);
    assert.equal((await request("/prospects/all", "DELETE", "admin")).status, 404);
    assert.equal(writes.length, 2);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
  }
});
