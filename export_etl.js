// export_etl.js – COMPLETE VERSION WITH USERS EXPORT

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

const serviceAccount = require("./serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const OUTPUT_DIR = path.join(__dirname, "output");

// -----------------------------
// EXPORT USERS
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
      created_at: d.created_at
        ? d.created_at.toDate().toISOString()
        : "",
    });
  });

  const writer = createCsvWriter({
    path: path.join(OUTPUT_DIR, "users.csv"),
    header: [
      { id: "user_id", title: "user_id" },
      { id: "name", title: "name" },
      { id: "email", title: "email" },
      { id: "country", title: "country" },
      { id: "created_at", title: "created_at" },
    ],
  });

  await writer.writeRecords(rows);
  console.log("✅ users.csv written.");
}

// -----------------------------
// EXPORT RECIPES
// -----------------------------
async function exportRecipes() {
  const snapshot = await db.collection("recipes").get();
  const rows = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    const prep = data.prep_time_min || 0;
    const cook = data.cook_time_min || 0;
    const total = data.total_time_min || prep + cook;

    rows.push({
      recipe_id: doc.id,
      name: data.name || "",
      description: data.description || "",
      servings: data.servings ?? "",
      prep_time_min: prep,
      cook_time_min: cook,
      total_time_min: total,
      difficulty: data.difficulty || "",
      cuisine: data.cuisine || "",
      tags: Array.isArray(data.tags) ? data.tags.join(",") : "",
      author_user_id: data.author_user_id || "",
      created_at: data.created_at
        ? data.created_at.toDate().toISOString()
        : "",
    });
  });

  const csvWriter = createCsvWriter({
    path: path.join(OUTPUT_DIR, "recipe.csv"),
    header: [
      { id: "recipe_id", title: "recipe_id" },
      { id: "name", title: "name" },
      { id: "description", title: "description" },
      { id: "servings", title: "servings" },
      { id: "prep_time_min", title: "prep_time_min" },
      { id: "cook_time_min", title: "cook_time_min" },
      { id: "total_time_min", title: "total_time_min" },
      { id: "difficulty", title: "difficulty" },
      { id: "cuisine", title: "cuisine" },
      { id: "tags", title: "tags" },
      { id: "author_user_id", title: "author_user_id" },
      { id: "created_at", title: "created_at" },
    ],
  });

  await csvWriter.writeRecords(rows);
  console.log("✅ recipe.csv written.");
  return rows;
}

// -----------------------------
// EXPORT INGREDIENTS + STEPS
// -----------------------------
async function exportIngredientsAndSteps(recipesRows) {
  const ingredientsRows = [];
  const stepsRows = [];

  for (const r of recipesRows) {
    const rid = r.recipe_id;

    // Ingredients
    const ingSnap = await db
      .collection("recipes")
      .doc(rid)
      .collection("ingredients")
      .get();

    ingSnap.forEach((doc) => {
      const d = doc.data();
      ingredientsRows.push({
        recipe_id: rid,
        ingredient_id: d.ingredient_id || doc.id,
        name: d.name || "",
        quantity: d.quantity ?? "",
        unit: d.unit || "",
        notes: d.notes || "",
        order: d.order ?? "",
      });
    });

    // Steps
    const stepSnap = await db
      .collection("recipes")
      .doc(rid)
      .collection("steps")
      .get();

    stepSnap.forEach((doc) => {
      const d = doc.data();
      stepsRows.push({
        recipe_id: rid,
        step_id: d.step_id || doc.id,
        order: d.order ?? "",
        text: d.text || "",
      });
    });
  }

  const ingWriter = createCsvWriter({
    path: path.join(OUTPUT_DIR, "ingredients.csv"),
    header: [
      { id: "recipe_id", title: "recipe_id" },
      { id: "ingredient_id", title: "ingredient_id" },
      { id: "name", title: "name" },
      { id: "quantity", title: "quantity" },
      { id: "unit", title: "unit" },
      { id: "notes", title: "notes" },
      { id: "order", title: "order" },
    ],
  });

  const stepWriter = createCsvWriter({
    path: path.join(OUTPUT_DIR, "steps.csv"),
    header: [
      { id: "recipe_id", title: "recipe_id" },
      { id: "step_id", title: "step_id" },
      { id: "order", title: "order" },
      { id: "text", title: "text" },
    ],
  });

  await ingWriter.writeRecords(ingredientsRows);
  await stepWriter.writeRecords(stepsRows);

  console.log("✅ ingredients.csv and steps.csv written.");
}

// -----------------------------
// EXPORT INTERACTIONS
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
      created_at: d.created_at
        ? d.created_at.toDate().toISOString()
        : "",
    });
  });

  const writer = createCsvWriter({
    path: path.join(OUTPUT_DIR, "interactions.csv"),
    header: [
      { id: "interaction_id", title: "interaction_id" },
      { id: "user_id", title: "user_id" },
      { id: "recipe_id", title: "recipe_id" },
      { id: "type", title: "type" },
      { id: "rating", title: "rating" },
      { id: "difficulty_used", title: "difficulty_used" },
      { id: "source", title: "source" },
      { id: "created_at", title: "created_at" },
    ],
  });

  await writer.writeRecords(rows);
  console.log("✅ interactions.csv written.");
}

// -----------------------------
// MAIN PIPELINE
// -----------------------------
async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }

  await exportUsers(); // ⭐ NEW ADDITION

  const recipes = await exportRecipes();
  await exportIngredientsAndSteps(recipes);
  await exportInteractions();

  console.log("🏁 Export complete.");
}

main();
