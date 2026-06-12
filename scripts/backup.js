const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BACKUP_DIR = "I:\\My Drive\\RentersReference Backups";
const date = new Date().toISOString().slice(0, 10);

async function fetchAll(table) {
  let all = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase.from(table).select("*").range(from, from + 999);
    if (error || !data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < 1000) break;
    from += 1000;
  }
  return all;
}

function toCSV(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map(h => {
      const val = row[h] ?? "";
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(","));
  }
  return lines.join("\n");
}

async function run() {
  console.log(`Starting backup for ${date}...`);

  const landlords = await fetchAll("landlords");
  const reports = await fetchAll("reports");

  fs.writeFileSync(path.join(BACKUP_DIR, `landlords_${date}.csv`), toCSV(landlords));
  fs.writeFileSync(path.join(BACKUP_DIR, `reports_${date}.csv`), toCSV(reports));

  console.log(`✓ Backed up ${landlords.length} landlords and ${reports.length} reports`);
  console.log(`Files saved to ${BACKUP_DIR}`);
}

run();
