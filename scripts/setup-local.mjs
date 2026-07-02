/**
 * One-click local database setup.
 * Reads .env.local, generates the SQLite Prisma client,
 * runs migrations, and seeds the database.
 *
 * Run with: node scripts/setup-local.mjs
 */

import { readFileSync, existsSync } from "fs";
import { execSync } from "child_process";

// ── Load .env.local ──────────────────────────────────────────────────────────
if (!existsSync(".env.local")) {
  console.error("❌  .env.local not found. Make sure you're in the project root.");
  process.exit(1);
}

const envContent = readFileSync(".env.local", "utf8");
const envVars = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
  envVars[key] = val;
}

const env = { ...process.env, ...envVars };
const prisma = "node node_modules/prisma/build/index.js";
const tsx = "node node_modules/tsx/dist/cli.cjs";

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("  Infinity PSR — Local Database Setup");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`  DB:  ${envVars.DATABASE_URL ?? "(not set)"}`);
console.log("");

try {
  // 1. Generate Prisma client from the local SQLite schema
  console.log("⚙️   Generating Prisma client (SQLite schema)…");
  execSync(
    `${prisma} generate --schema prisma/schema.local.prisma`,
    { stdio: "inherit", env }
  );

  // 2. Push schema to SQLite (creates the .db file + all tables)
  console.log("\n🗃️   Creating local database & tables…");
  execSync(
    `${prisma} db push --schema prisma/schema.local.prisma --skip-generate`,
    { stdio: "inherit", env }
  );

  // 3. Seed
  console.log("\n🌱  Seeding industries, types & admin user…");
  execSync(`${tsx} prisma/seed.ts`, { stdio: "inherit", env });

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅  Local database ready!");
  console.log("");
  console.log("   Start the app:  npm run dev:local");
  console.log("   Login:          admin@infinitypsr.com  /  admin123");
  console.log("   DB file:        infinity-psr/local.db");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
} catch (err) {
  console.error("\n❌  Setup failed:", err.message);
  process.exit(1);
}
