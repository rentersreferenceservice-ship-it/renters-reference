const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const SEEDS_DIR = "I:\\My Drive\\state seeds";

const FILES = fs.readdirSync(SEEDS_DIR).filter(f => f.endsWith(".csv") && (f.includes("_FIXED") || f.includes("_clean") || f.includes("_upload") || f.includes("_2026_clean")));

function parseCSV(filePath) {
  const lines = fs.readFileSync(filePath, "utf8").trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const vals = line.split(",").map(v => v.trim());
    const obj = {};
    headers.forEach((h, i) => obj[h] = vals[i] ?? "");
    return obj;
  });
}

async function run() {
  let total = 0;
  let errors = 0;

  for (const file of FILES) {
    const filePath = path.join(SEEDS_DIR, file);
    const rows = parseCSV(filePath);

    const landlords = rows.map(r => ({
      name: r.name || r["company name"] || "",
      city: r.city || "",
      state: r.state || "",
      borough: r.borough || null,
      verified: false,
    })).filter(l => l.name && l.state);

    if (landlords.length === 0) continue;

    const { error } = await supabase.from("landlords").insert(landlords);
    if (error) {
      console.error(`Error in ${file}:`, error.message);
      errors++;
    } else {
      console.log(`✓ ${file}: ${landlords.length} landlords`);
      total += landlords.length;
    }
  }

  console.log(`\nDone! ${total} landlords imported, ${errors} files with errors.`);
}

run();
