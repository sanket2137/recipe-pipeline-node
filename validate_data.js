// validate_data.js
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const OUTPUT_DIR = path.join(__dirname, "output");

const errors = [];

function addError(table, rowIndex, message) {
  errors.push({ table, row_index: rowIndex, error: message });
}

function readCsv(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => rows.push(data))
      .on("end", () => resolve(rows))
      .on("error", (err) => reject(err));
  });
}

async function main() {
  const recipePath = path.join(OUTPUT_DIR, "recipe.csv");
  const ingPath = path.join(OUTPUT_DIR, "ingredients.csv");
  const stepsPath = path.join(OUTPUT_DIR, "steps.csv");
  const interPath = path.join(OUTPUT_DIR, "interactions.csv");

  const recipes = await readCsv(recipePath);
  const ingredients = await readCsv(ingPath);
  const steps = await readCsv(stepsPath);
  const interactions = await readCsv(interPath);

  validateRecipes(recipes);
  validateIngredients(ingredients);
  validateSteps(steps);
  validateInteractions(interactions);

  const reportPath = path.join(OUTPUT_DIR, "validation_report.csv");
  const writer = createCsvWriter({
    path: reportPath,
    header: [
      { id: "table", title: "table" },
      { id: "row_index", title: "row_index" },
      { id: "error", title: "error" },
    ],
  });

  await writer.writeRecords(errors);
  if (errors.length === 0) {
    console.log("✅ All records passed validation. No errors.");
  } else {
    console.log(
      `⚠ Found ${errors.length} validation errors. See validation_report.csv`
    );
  }
}

function validateRecipes(rows) {
  const validDifficulties = new Set(["easy", "medium", "hard"]);
  rows.forEach((row, idx) => {
    if (!row.recipe_id) addError("recipe", idx, "recipe_id is null/empty");
    if (!row.name) addError("recipe", idx, "name is null/empty");

    const servings = Number(row.servings);
    if (isNaN(servings) || servings <= 0) {
      addError("recipe", idx, "servings must be > 0");
    }

    const prep = Number(row.prep_time_min || 0);
    const cook = Number(row.cook_time_min || 0);
    if (prep < 0) addError("recipe", idx, "prep_time_min must be >= 0");
    if (cook < 0) addError("recipe", idx, "cook_time_min must be >= 0");

    const diff = (row.difficulty || "").toLowerCase();
    if (!validDifficulties.has(diff)) {
      addError("recipe", idx, `invalid difficulty: ${row.difficulty}`);
    }
  });
}

function validateIngredients(rows) {
  rows.forEach((row, idx) => {
    if (!row.recipe_id)
      addError("ingredients", idx, "recipe_id is null/empty");
    if (!row.name) addError("ingredients", idx, "name is null/empty");
    if (row.quantity !== "") {
      const q = Number(row.quantity);
      if (isNaN(q) || q < 0) {
        addError(
          "ingredients",
          idx,
          `quantity must be >= 0 or empty, got: ${row.quantity}`
        );
      }
    }
  });
}

function validateSteps(rows) {
  rows.forEach((row, idx) => {
    if (!row.recipe_id) addError("steps", idx, "recipe_id is null/empty");
    if (!row.text) addError("steps", idx, "text is null/empty");
    const order = Number(row.order);
    if (isNaN(order) || order <= 0) {
      addError("steps", idx, "order must be > 0");
    }
  });
}

function validateInteractions(rows) {
  const validTypes = new Set(["view", "like", "cook_attempt", "rating"]);

  rows.forEach((row, idx) => {
    if (!row.interaction_id)
      addError("interactions", idx, "interaction_id is null/empty");
    if (!row.user_id)
      addError("interactions", idx, "user_id is null/empty");
    if (!row.recipe_id)
      addError("interactions", idx, "recipe_id is null/empty");

    const t = (row.type || "").toLowerCase();
    if (!validTypes.has(t)) {
      addError("interactions", idx, `invalid type: ${row.type}`);
    }

    if (row.rating !== "") {
      const r = Number(row.rating);
      if (isNaN(r) || r < 0 || r > 5) {
        addError("interactions", idx, `invalid rating: ${row.rating}`);
      }
    }
  });
}

main().catch((err) => {
  console.error("❌ Error in validate_data:", err);
});
