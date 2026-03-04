#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const ATTRIBUTION = { commit: "", pr: "" };

const GLOBAL_PATH = path.join(
  process.env.HOME || process.env.USERPROFILE,
  ".claude",
  "settings.json"
);
const PROJECT_PATH = path.resolve(".claude", "settings.json");
const LOCAL_PATH = path.resolve(".claude", "settings.local.json");

const TARGETS = [
  { label: "Global user settings", path: GLOBAL_PATH, alwaysDefault: true },
  { label: "Project-wide settings", path: PROJECT_PATH, alwaysDefault: false },
  { label: "Local project override", path: LOCAL_PATH, alwaysDefault: false },
];

function fileExists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function applyAttribution(filePath) {
  let config = {};
  if (fileExists(filePath)) {
    try {
      config = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (e) {
      console.log(`  Warning: Could not parse ${filePath}, overwriting.`);
    }
  } else {
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
  }
  config.attribution = ATTRIBUTION;
  fs.writeFileSync(filePath, JSON.stringify(config, null, 2) + "\n");
  console.log(`  Updated: ${filePath}`);
}

async function main() {
  console.log(
    "\nStop Claude Commit Dark Pattern\n" +
      "================================\n" +
      "This will set empty attribution in Claude Code settings\n" +
      "so commits and PRs don't include AI co-author lines.\n"
  );

  const defaults = TARGETS.map(
    (t) => t.alwaysDefault || fileExists(t.path)
  );
  const selected = [...defaults];

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // If not a TTY, just apply defaults
  if (!process.stdin.isTTY) {
    console.log("Non-interactive mode, applying defaults.\n");
    for (let i = 0; i < TARGETS.length; i++) {
      if (selected[i]) applyAttribution(TARGETS[i].path);
    }
    rl.close();
    console.log("\nDone!");
    return;
  }

  let cursor = 0;

  function render() {
    // Move cursor up to overwrite previous render
    process.stdout.write("\x1B[?25l"); // hide cursor
    for (let i = 0; i < TARGETS.length; i++) {
      const check = selected[i] ? "[x]" : "[ ]";
      const pointer = i === cursor ? ">" : " ";
      const exists = fileExists(TARGETS[i].path);
      const note = exists ? "" : TARGETS[i].alwaysDefault ? " (will create)" : " (does not exist)";
      console.log(`${pointer} ${check} ${TARGETS[i].label}${note}`);
    }
    console.log("\nSpace=toggle  Up/Down=move  Enter=apply  q=quit");
  }

  render();

  await new Promise((resolve) => {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    process.stdin.on("data", (key) => {
      if (key === "q" || key === "\x03") {
        process.stdout.write("\x1B[?25h");
        console.log("\nAborted.");
        process.exit(0);
      }
      if (key === "\r" || key === "\n") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdout.write("\x1B[?25h");
        resolve();
        return;
      }
      if (key === " ") {
        selected[cursor] = !selected[cursor];
      }
      // Arrow up
      if (key === "\x1B[A" && cursor > 0) cursor--;
      // Arrow down
      if (key === "\x1B[B" && cursor < TARGETS.length - 1) cursor++;

      // Clear and re-render
      process.stdout.write(`\x1B[${TARGETS.length + 2}A\x1B[0J`);
      render();
    });
  });

  console.log("");
  let applied = 0;
  for (let i = 0; i < TARGETS.length; i++) {
    if (selected[i]) {
      applyAttribution(TARGETS[i].path);
      applied++;
    }
  }

  rl.close();
  if (applied === 0) {
    console.log("No targets selected.");
  } else {
    console.log(`\nDone! Updated ${applied} settings file(s).`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
