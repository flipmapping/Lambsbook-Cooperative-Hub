const { chromium } = require("playwright");
const fs = require("fs");

(async () => {

  const browser = await chromium.launch({
    headless: false
  });

  const page = await browser.newPage({
    viewport: {
      width: 1600,
      height: 1000
    }
  });

  const consoleEvents = [];

  page.on("console", msg => {
    consoleEvents.push({
      type: msg.type(),
      text: msg.text()
    });
  });

  console.log("");
  console.log("1. Log into the application.");
  console.log("2. Navigate to /hub/dashboard.");
  console.log("3. Wait until the dashboard finishes rendering.");
  console.log("4. Return to this terminal and press ENTER.");
  console.log("");

  await page.goto("http://127.0.0.1:5000");

  process.stdin.resume();

  process.stdin.once("data", async () => {

    await page.screenshot({
      path: "execution/packages/APP-REC-029/EVIDENCE/memberhub.png",
      fullPage: true
    });

    fs.writeFileSync(
      "execution/packages/APP-REC-029/EVIDENCE/memberhub.html",
      await page.content()
    );

    fs.writeFileSync(
      "execution/packages/APP-REC-029/EVIDENCE/console.json",
      JSON.stringify(consoleEvents, null, 2)
    );

    console.log("");
    console.log("Evidence captured:");
    console.log("  memberhub.png");
    console.log("  memberhub.html");
    console.log("  console.json");

    await browser.close();
  });

})();
