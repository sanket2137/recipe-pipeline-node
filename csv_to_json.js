// csv_to_json.js
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const OUTPUT_DIR = path.join(__dirname, "output");

function csvToJson(csvPath, jsonPath) {
  return new Promise((resolve, reject) => {
    const rows = [];

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (data) => rows.push(data))
      .on("end", () => {
        fs.writeFileSync(jsonPath, JSON.stringify(rows, null, 2), "utf8");
        console.log(`Converted: ${path.basename(csvPath)} → ${path.basename(jsonPath)}`);
        resolve();
      })
      .on("error", reject);
  });
}

async function main() {
  const files = [
    ["recipe.csv", "recipe.json"],
    ["ingredients.csv", "ingredients.json"],
    ["steps.csv", "steps.json"],
    ["interactions.csv", "interactions.json"],
  ];

  for (const [csvName, jsonName] of files) {
    const csvPath = path.join(OUTPUT_DIR, csvName);
    const jsonPath = path.join(OUTPUT_DIR, jsonName);

    if (!fs.existsSync(csvPath)) {
      console.log(`CSV file missing: ${csvName}, skipping.`);
      continue;
    }

    await csvToJson(csvPath, jsonPath);
  }

  console.log("🎉 All CSV files converted to JSON!");
}

main().catch((err) => console.error("Error in csv_to_json:", err));
