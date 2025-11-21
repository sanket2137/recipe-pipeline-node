// insert_data.js
const admin = require("firebase-admin");
const path = require("path");

// ----------------------
// FIREBASE INIT
// ----------------------
const serviceAccount = require("./serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// ----------------------
// MAIN
// ----------------------
async function main() {
  await insertChickenCurry();
  await insertSyntheticRecipes();
  await insertUsers();
  await insertInteractions();

  console.log("✅ All data inserted successfully.");
}

async function insertChickenCurry() {
  const chickenCurry = {
    name: "Chicken Curry",
    description: "Chicken curry for 2 people.",
    servings: 2,
    prep_time_min: 15,
    cook_time_min: 25,
    total_time_min: 40,
    difficulty: "medium",
    cuisine: "Indian",
    tags: ["curry", "chicken", "dinner"],
    author_user_id: "user_sanket",
    created_at: admin.firestore.Timestamp.now(),
  };

  const recipeRef = db.collection("recipes").doc("recipe_chicken_curry");
  await recipeRef.set(chickenCurry);

  const ingredients = [
    ["boneless chicken", 300, "g", "cut into bite-sized pieces"],
    ["cooking oil", 1, "tbsp", ""],
    ["onions", 2, "unit", "finely chopped"],
    ["tomatoes", 2, "unit", "chopped"],
    ["garlic", 2, "cloves", "minced"],
    ["ginger", 1, "tsp", "paste"],
    ["turmeric powder", 1, "tsp", ""],
    ["chili powder", 1, "tsp", ""],
    ["cumin powder", 1, "tsp", ""],
    ["coriander powder", 1, "tsp", ""],
    ["garam masala", 1, "tsp", ""],
    ["water", 1, "cup", ""],
    ["salt", 1, "tsp", ""],
    ["coriander leaves", 1, "bunch", "chopped"],
  ];

  for (let i = 0; i < ingredients.length; i++) {
    const [name, quantity, unit, notes] = ingredients[i];
    await recipeRef.collection("ingredients").doc(`ing${i + 1}`).set({
      ingredient_id: `ing${i + 1}`,
      name,
      quantity,
      unit,
      notes,
      order: i + 1,
    });
  }

  const steps = [
    "Wash the chicken and cut into pieces.",
    "Chop onions and tomatoes; mince garlic and ginger.",
    "Heat the pan for 30 seconds.",
    "Add oil and sauté onions 3–5 minutes.",
    "Add garlic and ginger, cook 20 seconds.",
    "Add dry spices and roast 20–30 seconds.",
    "Add tomatoes and cook 4–6 minutes.",
    "Add chicken and cook 5 minutes.",
    "Add water and salt, simmer 10–12 minutes.",
    "Add garam masala and cook 2 minutes.",
    "Adjust seasoning, garnish with coriander and serve.",
  ];

  for (let i = 0; i < steps.length; i++) {
    await recipeRef.collection("steps").doc(`step${i + 1}`).set({
      step_id: `step${i + 1}`,
      order: i + 1,
      text: steps[i],
    });
  }

  console.log("✅ Chicken Curry recipe, ingredients, steps inserted.");
}

async function insertSyntheticRecipes() {
  const sampleRecipes = [
    "Pasta Alfredo",
    "Veg Biryani",
    "Aloo Paratha",
    "Egg Fried Rice",
    "Mutton Masala",
    "Paneer Butter Masala",
    "Fish Curry",
    "Dal Tadka",
    "Chapati",
    "Idli Sambhar",
    "Chicken Biryani",
    "Veg Sandwich",
    "Tomato Soup",
    "Pav Bhaji",
    "Upma",
    "Poha",
    "Omelette",
    "Maggi",
    "Fried Chicken",
    "Chicken Kebab",
  ];

  const difficulties = ["easy", "medium", "hard"];
  const authors = ["user1", "user2", "user3"];

  for (const name of sampleRecipes) {
    const rid = "recipe_" + name.toLowerCase().replace(/\s+/g, "_");
    await db.collection("recipes").doc(rid).set({
      name,
      description: `Synthetic recipe: ${name}`,
      servings: randInt(1, 6),
      prep_time_min: randInt(10, 30),
      cook_time_min: randInt(10, 40),
      total_time_min: null, // will derive in ETL
      difficulty: sample(difficulties),
      cuisine: "Indian",
      tags: ["synthetic"],
      author_user_id: sample(authors),
      created_at: admin.firestore.Timestamp.now(),
    });
  }

  console.log("✅ Synthetic recipes inserted.");
}

async function insertUsers() {
  const batch = db.batch();

  const sanketRef = db.collection("users").doc("user_sanket");
  batch.set(sanketRef, {
    user_id: "user_sanket",
    name: "Sanket Raut",
    email: "sanket@example.com",
    country: "IN",
    created_at: admin.firestore.Timestamp.now(),
  });

  for (let i = 1; i <= 10; i++) {
    const uref = db.collection("users").doc(`user${i}`);
    batch.set(uref, {
      user_id: `user${i}`,
      name: `User ${i}`,
      email: `user${i}@test.com`,
      country: "IN",
      created_at: admin.firestore.Timestamp.now(),
    });
  }

  await batch.commit();
  console.log("✅ Users inserted.");
}

async function insertInteractions() {
  const recipesSnapshot = await db.collection("recipes").get();
  const recipeIds = [];
  recipesSnapshot.forEach((doc) => recipeIds.push(doc.id));

  const interactionTypes = ["view", "like", "cook_attempt", "rating"];
  const difficultyUsed = ["easy", "medium", "hard"];
  const sources = ["web", "mobile"];

  const batchSize = 500;
  let batch = db.batch();
  let count = 0;

  for (let i = 0; i < 300; i++) {
    const docRef = db.collection("interactions").doc(`int_${i}`);
    const type = sample(interactionTypes);
    const rating =
      type === "rating" ? sample([null, 3, 4, 5]) : null;

    batch.set(docRef, {
      interaction_id: `int_${i}`,
      recipe_id: sample(recipeIds),
      user_id: sample([
        "user_sanket",
        ...Array.from({ length: 10 }, (_, idx) => `user${idx + 1}`),
      ]),
      type,
      rating,
      difficulty_used: sample(difficultyUsed),
      source: sample(sources),
      created_at: admin.firestore.Timestamp.now(),
    });

    count++;
    if (count === batchSize) {
      await batch.commit();
      batch = db.batch();
      count = 0;
    }
  }

  if (count > 0) {
    await batch.commit();
  }

  console.log("✅ Interactions inserted.");
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

main().catch((err) => {
  console.error("❌ Error inserting data:", err);
});
