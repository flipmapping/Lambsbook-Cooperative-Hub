
const { chromium } = require("playwright");
const fs = require("fs");

(async () => {

  const browser = await chromium.launch({
    headless: false
  });

  const page = await browser.newPage();

  const events = [];

  page.on("console", msg => {
    events.push({
      type: "console",
      level: msg.type(),
      text: msg.text()
    });
  });

  page.on("pageerror", err => {
    events.push({
      type: "pageerror",
      message: err.message,
      stack: err.stack
    });
  });

  page.on("requestfailed", req => {
    events.push({
      type: "requestfailed",
      url: req.url(),
      failure: req.failure()
    });
  });

  page.on("response", res => {
    if (res.status() >= 400) {
      events.push({
        type: "http",
        status: res.status(),
        url: res.url()
      });
    }
  });

  console.log("");
  console.log("Log into the application if prompted.");
  console.log("Navigate to /hub/dashboard.");
  console.log("Wait until the page settles.");
  console.log("Press ENTER here to finish capture.");
  console.log("");

  await page.goto("http://127.0.0.1:5000/hub/dashboard");

  process.stdin.resume();

  process.stdin.once("data", async () => {

      fs.writeFileSync(
          "execution/packages/APP-REC-029/EVIDENCE/browser-runtime-events.json",
          JSON.stringify(events, null, 2)
      );

      await browser.close();

      console.log("");
      console.log("Evidence written:");
      console.log("execution/packages/APP-REC-029/EVIDENCE/browser-runtime-events.json");
  });

})();
