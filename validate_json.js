// validate_json.js
const fs = require("fs");
const path = require("path");

const OUTPUT_DIR = path.join(__dirname, "output");
const errors = [];

function addError(table, index, message) {
  errors.push({ table, index, error: message });
}

// Read JSON file safely
function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (err) {
    console.error(`❌ Failed to read JSON file: ${filePath}`);
    throw err;
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

async function main() {
  const recipePath = path.join(OUTPUT_DIR, "recipe.json");
  const ingPath = path.join(OUTPUT_DIR, "ingredients.json");
  const stepsPath = path.join(OUTPUT_DIR, "steps.json");
  const interPath = path.join(OUTPUT_DIR, "interactions.json");

  const recipes = readJson(recipePath);
  const ingredients = readJson(ingPath);
  const steps = readJson(stepsPath);
  const interactions = readJson(interPath);

  validateRecipes(recipes);
  validateIngredients(ingredients);
  validateSteps(steps);
  validateInteractions(interactions);

  const reportPath = path.join(OUTPUT_DIR, "validation_report.json");
  writeJson(reportPath, errors);

  if (errors.length === 0) {
    console.log("✅ All JSON records passed validation. No errors.");
  } else {
    console.log(`⚠ Found ${errors.length} validation errors. See validation_report.json`);
  }
}

// ---------------- VALIDATION LOGIC ----------------

function validateRecipes(rows) {
  const validDifficulties = new Set(["easy", "medium", "hard"]);

  rows.forEach((row, idx) => {
    if (!row.recipe_id) addError("recipe", idx, "recipe_id is null/empty");
    if (!row.name) addError("recipe", idx, "name is null/empty");

    const servings = Number(row.servings);
    if (isNaN(servings) || servings <= 0)
      addError("recipe", idx, "servings must be > 0");

    const prep = Number(row.prep_time_min || 0);
    const cook = Number(row.cook_time_min || 0);

    if (prep < 0) addError("recipe", idx, "prep_time_min must be >= 0");
    if (cook < 0) addError("recipe", idx, "cook_time_min must be >= 0");

    const diff = (row.difficulty || "").toLowerCase();
    if (!validDifficulties.has(diff))
      addError("recipe", idx, `invalid difficulty: ${row.difficulty}`);
  });
}

function validateIngredients(rows) {
  rows.forEach((row, idx) => {
    if (!row.recipe_id)
      addError("ingredients", idx, "recipe_id is null/empty");
    if (!row.name)
      addError("ingredients", idx, "name is null/empty");

    if (row.quantity !== "" && row.quantity !== undefined) {
      const q = Number(row.quantity);
      if (isNaN(q) || q < 0)
        addError("ingredients", idx, `quantity must be >= 0 or empty, got: ${row.quantity}`);
    }
  });
}

function validateSteps(rows) {
  rows.forEach((row, idx) => {
    if (!row.recipe_id)
      addError("steps", idx, "recipe_id is null/empty");
    if (!row.text)
      addError("steps", idx, "text is null/empty");

    const order = Number(row.order);
    if (isNaN(order) || order <= 0)
      addError("steps", idx, "order must be > 0");
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
    if (!validTypes.has(t))
      addError("interactions", idx, `invalid type: ${row.type}`);

    if (row.rating !== "" && row.rating !== undefined) {
      const r = Number(row.rating);
      if (isNaN(r) || r < 0 || r > 5)
        addError("interactions", idx, `invalid rating: ${row.rating}`);
    }
  });
}

// ---------------- RUN ----------------
main().catch((err) => console.error("❌ Error in validate_json:", err));
