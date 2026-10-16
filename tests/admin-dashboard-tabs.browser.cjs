// Browser regression tests use synthetic responses only; never save real database records.
const assert = require("node:assert/strict");
const { existsSync } = require("node:fs");
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true,
    ...(existsSync("/repl/tools/bin/chromium") ? { executablePath: "/repl/tools/bin/chromium" } : {}) });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const base = `https://${process.env.REPLIT_DEV_DOMAIN}`;
    await page.goto(`${base}/hub/admin`);
    await page.getByTestId("tab-prospects").click();
    await page.getByRole("alert").filter({ hasText: "Failed to load prospects" }).waitFor();
    await page.getByTestId("tab-notification-templates").click();
    await page.getByRole("alert").filter({ hasText: "Failed to load notification templates" }).waitFor();
    console.log("PASS: real unauthenticated APIs produce visible access errors");
    await page.close();

    const ui = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const writes = [];
    const template = {
      id: "fixture", templateKey: "fixture", version: 1, status: "draft",
      enSubject: "English", enMessage: "Preserve English whitespace  ",
      viSubject: "Vietnamese", viMessage: "Preserve Vietnamese",
      zhSubject: null, zhMessage: null, approvedVariables: ["name"],
      updatedAt: null, updatedBy: null,
    };
    await ui.route("**/api/admin/notification-templates**", async route => {
      const request = route.request();
      if (request.method() !== "GET") writes.push({ method: request.method(), data: request.postDataJSON() });
      await route.fulfill({ json: request.method() === "GET" ? [template] : template });
    });
    await ui.route("**/api/admin/prospects", route => route.fulfill({
      json: [{ id: "fixture-prospect", full_name: "Test Prospect", email: "fixture@example.test", import_status: "imported" }],
    }));
    await ui.goto(`${base}/hub/admin`);
    await ui.getByTestId("tabs-admin").waitFor();
    assert.equal(await ui.getByRole("tab").count(), 11);
    await ui.getByTestId("tab-prospects").click();
    await ui.getByTestId("prospect-row-fixture-prospect").waitFor();
    assert.equal(await ui.getByRole("button", { name: /delete/i }).count(), 0);
    await ui.getByTestId("input-prospect-search").fill("no match");
    await ui.getByText("No prospects match your search.").waitFor();
    await ui.getByTestId("input-prospect-search").fill("Test Prospect");
    assert.equal(await ui.getByRole("link", { name: "Test Prospect" }).getAttribute("href"), "/hub/admin/prospects/fixture-prospect");
    await ui.getByTestId("tab-notification-templates").click();
    await ui.getByRole("button", { name: "View / Edit" }).click();
    assert.equal(await ui.getByLabel("vi message", { exact: true }).inputValue(), template.viMessage);
    assert.equal(await ui.getByLabel("zh subject", { exact: true }).inputValue(), "");
    assert.equal(writes.length, 0);
    await ui.getByLabel("en subject", { exact: true }).fill("Cancelled edit");
    await ui.getByRole("button", { name: "Cancel", exact: true }).click();
    assert.equal(writes.length, 0);
    await ui.getByRole("button", { name: "View / Edit" }).click();
    await ui.getByLabel("en subject", { exact: true }).fill("Explicit edit");
    await ui.getByTestId("button-save-notification-template").click();
    await ui.getByRole("button", { name: "View / Edit" }).waitFor();
    assert.deepEqual(writes, [{ method: "PATCH", data: { enSubject: "Explicit edit" } }]);
    await ui.getByTestId("button-new-notification-template").click();
    await ui.getByLabel("Template key", { exact: true }).fill("new-fixture");
    await ui.getByLabel("en subject", { exact: true }).fill("New subject");
    await ui.getByLabel("en message", { exact: true }).fill("New message");
    await ui.getByTestId("button-save-notification-template").click();
    await ui.getByRole("button", { name: "View / Edit" }).waitFor();
    assert.equal(writes.length, 2);
    assert.equal(writes[1].method, "POST");
    assert.equal(writes[1].data.zhMessage, null);
    await ui.setViewportSize({ width: 390, height: 844 });
    await ui.getByTestId("tab-prospects").click();
    assert.equal(await ui.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    console.log("PASS: 11 tabs, prospect search/detail link, no delete controls, multilingual fields, no autosave, cancel, partial save, create, mobile layout (synthetic fixtures)");
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
