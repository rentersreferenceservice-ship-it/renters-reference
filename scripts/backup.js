const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const SUPABASE_URL = "https://iwfnkmgiittsxylwxydz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3Zm5rbWdpaXR0c3h5bHd4eWR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTAyOTQ3NiwiZXhwIjoyMDk0NjA1NDc2fQ.sFopfbO1csW48fuDLoYbDTIzBx_VB8nLT-Lu5a0jW1s";

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
