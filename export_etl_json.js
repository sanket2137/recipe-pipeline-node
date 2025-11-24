// export_etl_json.js – EXPORT FIRESTORE TO JSON

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const serviceAccount = require("./serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const OUTPUT_DIR = path.join(__dirname, "output");

function writeJSON(filename, data) {
  fs.writeFileSync(
    path.join(OUTPUT_DIR, filename),
    JSON.stringify(data, null, 2),
    "utf8"
  );
  console.log(`${filename} written.`);
}

// -----------------------------
// EXPORT USERS → users.json
// -----------------------------
async function exportUsers() {
  const snap = await db.collection("users").get();
  const rows = [];

  snap.forEach((doc) => {
    const d = doc.data();
    rows.push({
      user_id: d.user_id || doc.id,
      name: d.name || "",
      email: d.email || "",
      country: d.country || "",
      created_at: d.created_at ? d.created_at.toDate().toISOString() : "",
    });
  });

  writeJSON("users.json", rows);
  return rows;
}

// -----------------------------
// EXPORT RECIPES → recipes.json
// -----------------------------
async function exportRecipes() {
  const snap = await db.collection("recipes").get();
  const rows = [];

  snap.forEach((doc) => {
    const d = doc.data();
    const prep = d.prep_time_min || 0;
    const cook = d.cook_time_min || 0;

    rows.push({
      recipe_id: doc.id,
      name: d.name || "",
      description: d.description || "",
      servings: d.servings ?? "",
      prep_time_min: prep,
      cook_time_min: cook,
      total_time_min: d.total_time_min || prep + cook,
      difficulty: d.difficulty || "",
      cuisine: d.cuisine || "",
      tags: Array.isArray(d.tags) ? d.tags : [],
      author_user_id: d.author_user_id || "",
      created_at: d.created_at ? d.created_at.toDate().toISOString() : "",
    });
  });

  writeJSON("recipes.json", rows);
  return rows;
}

// -----------------------------
// EXPORT INGREDIENTS + STEPS
// ingredients.json, steps.json
// -----------------------------
async function exportIngredientsAndSteps(recipeList) {
  const ingredients = [];
  const steps = [];

  for (const r of recipeList) {
    const rid = r.recipe_id;

    // INGREDIENTS
    const ingSnap = await db
      .collection("recipes")
      .doc(rid)
      .collection("ingredients")
      .get();

    ingSnap.forEach((doc) => {
      const d = doc.data();
      ingredients.push({
        recipe_id: rid,
        ingredient_id: d.ingredient_id || doc.id,
        name: d.name || "",
        quantity: d.quantity ?? "",
        unit: d.unit || "",
        notes: d.notes || "",
        order: d.order ?? "",
      });
    });

    // STEPS
    const stepSnap = await db
      .collection("recipes")
      .doc(rid)
      .collection("steps")
      .get();

    stepSnap.forEach((doc) => {
      const d = doc.data();
      steps.push({
        recipe_id: rid,
        step_id: d.step_id || doc.id,
        order: d.order ?? "",
        text: d.text || "",
      });
    });
  }

  writeJSON("ingredients.json", ingredients);
  writeJSON("steps.json", steps);
}

// -----------------------------
// EXPORT INTERACTIONS → interactions.json
// -----------------------------
async function exportInteractions() {
  const snap = await db.collection("interactions").get();
  const rows = [];

  snap.forEach((doc) => {
    const d = doc.data();
    rows.push({
      interaction_id: d.interaction_id || doc.id,
      user_id: d.user_id || "",
      recipe_id: d.recipe_id || "",
      type: d.type || "",
      rating: d.rating ?? "",
      difficulty_used: d.difficulty_used || "",
      source: d.source || "",
      created_at: d.created_at ? d.created_at.toDate().toISOString() : "",
    });
  });

  writeJSON("interactions.json", rows);
}

// -----------------------------
// MAIN PIPELINE
// -----------------------------
async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }

  const users = await exportUsers();
  const recipes = await exportRecipes();
  await exportIngredientsAndSteps(recipes);
  await exportInteractions();

  console.log("JSON export complete.");
}

main();
