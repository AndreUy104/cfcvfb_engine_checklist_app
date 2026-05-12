import { createClient } from "@supabase/supabase-js";
import * as readline from "readline";

// ============================================================
// Config
// ============================================================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "\n❌  Missing env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY\n",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================================
// Helpers
// ============================================================
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

function askYesNo(question: string): Promise<boolean> {
  return new Promise((resolve) => {
    rl.question(`${question} (y/n): `, (answer) => {
      resolve(answer.trim().toLowerCase() === "y");
    });
  });
}

/** Convert any string to kebab-case */
function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function printDivider() {
  console.log("\n" + "─".repeat(50) + "\n");
}

// ============================================================
// List existing components
// ============================================================
async function listExisting() {
  const { data, error } = await supabase
    .from("component_settings")
    .select("component_key, label, is_enabled")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("⚠️  Could not fetch existing components:", error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log("📭  No components registered yet.\n");
    return;
  }

  console.log("📋  Existing components:\n");
  data.forEach(({ component_key, label, is_enabled }) => {
    const status = is_enabled ? "✅" : "⛔";
    console.log(`  ${status}  ${component_key}`);
    console.log(`       ${label}\n`);
  });
}

// ============================================================
// Add a single component interactively
// ============================================================
async function addComponent(): Promise<boolean> {
  printDivider();
  console.log("➕  Register a new component\n");

  // Label
  let label = "";
  while (!label) {
    label = await ask("  Component label (human-readable name)\n  > ");
    if (!label) console.log("  ⚠️  Label cannot be empty.\n");
  }

  // Auto-suggest a key from the label
  const suggested = toKebabCase(label);
  console.log(`\n  Suggested key: ${suggested}`);
  const usesuggested = await askYesNo("  Use this as the component_key?");

  let component_key = suggested;
  if (!usesuggested) {
    while (true) {
      const raw = await ask("  Enter custom component_key\n  > ");
      component_key = toKebabCase(raw);
      if (component_key) {
        console.log(`  ✔  Key will be saved as: ${component_key}`);
        break;
      }
      console.log("  ⚠️  Key cannot be empty.\n");
    }
  }

  // Description
  const description = await ask(
    "\n  Description (what does this component do? leave blank to skip)\n  > ",
  );

  // is_enabled
  const is_enabled = await askYesNo("\n  Enable this component right now?");

  // Confirm
  printDivider();
  console.log("  📝  About to save:\n");
  console.log(`     key         : ${component_key}`);
  console.log(`     label       : ${label}`);
  console.log(`     description : ${description || "(none)"}`);
  console.log(`     is_enabled  : ${is_enabled}\n`);

  const confirmed = await askYesNo("  Confirm?");
  if (!confirmed) {
    console.log("\n  ↩️  Cancelled. Entry was not saved.\n");
    return false;
  }

  // Insert
  const { error } = await supabase.from("component_settings").insert({
    component_key,
    label,
    description: description || null,
    is_enabled,
  });

  if (error) {
    if (error.code === "23505") {
      console.log(
        `\n  ❌  A component with key "${component_key}" already exists.\n`,
      );
    } else {
      console.error("\n  ❌  Insert failed:", error.message, "\n");
    }
    return false;
  }

  console.log(`\n  ✅  "${component_key}" registered successfully!\n`);
  return true;
}

// ============================================================
// Main loop
// ============================================================
async function main() {
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║       Component Settings — Registration CLI      ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  await listExisting();

  while (true) {
    await addComponent();

    const another = await askYesNo("  Add another component?");
    if (!another) break;
  }

  printDivider();
  console.log("👋  Done. Exiting.\n");
  rl.close();
}

main();
