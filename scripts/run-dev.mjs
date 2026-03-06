#!/usr/bin/env node
/**
 * Run Next.js dev server with port 3000 and temp NEXT_DIST_DIR.
 * Use: npm run start-dev (or node scripts/run-dev.mjs)
 * This ensures the correct command runs even if another task overrides "dev".
 */
import { spawn } from "child_process";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NEXT_DIST_DIR = path.join(os.tmpdir(), "car-discovery-next");
process.env.NODE_OPTIONS = "--dns-result-order=ipv4first";
process.env.NEXT_DIST_DIR = NEXT_DIST_DIR;

console.log("[car-discovery] run-dev.mjs: port 3000, NEXT_DIST in tmp (use http://localhost:3000)");
const child = spawn(
  "npx",
  ["next", "dev", "-p", "3000", "--hostname", "localhost", "--webpack"],
  { stdio: "inherit", env: process.env, cwd: path.resolve(__dirname, "..") }
);
child.on("exit", (code) => process.exit(code ?? 0));
