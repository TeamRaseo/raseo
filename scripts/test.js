import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function getTestFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getTestFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".test.ts")) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = getTestFiles("tests");
if (files.length === 0) {
  console.error("No test files found in tests/");
  process.exit(1);
}

const res = spawnSync(process.execPath, ["--import", "tsx", "--test", ...files], {
  stdio: "inherit",
});

process.exit(res.status ?? 0);
