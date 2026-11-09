import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
const commit = process.env.RENBLOOD_RELEASE_COMMIT || execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
writeFileSync("dist/release.json", JSON.stringify({ environment: process.argv[2] || "unknown", commit, builtAt: new Date().toISOString() }, null, 2));
