import { chromium } from "playwright";
import fs from "node:fs";

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
console.log("1. Login normally.");
console.log("2. Navigate to /hub/dashboard.");
console.log("3. Wait until the page settles.");
console.log("4. Press ENTER in this terminal.");
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

  console.log("Evidence written.");

  await browser.close();
});
