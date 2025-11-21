// analytics.js
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const OUTPUT_DIR = path.join(__dirname, "output");

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
  const interPath = path.join(OUTPUT_DIR, "interactions.csv");

  const recipes = await readCsv(recipePath);
  const ingredients = await readCsv(ingPath);
  const interactions = await readCsv(interPath);

  const lines = [];
  const add = (txt = "") => {
    console.log(txt);
    lines.push(txt);
  };

  add("=== ANALYTICS SUMMARY ===");

  // 1. Most common ingredients
  add("\n1. Most common ingredients:");
  const ingCount = countBy(ingredients, (r) => r.name);
  add(topNToString(ingCount, 10));

  // 2. Average preparation time
  add("\n2. Average preparation time (min):");
  add(avg(recipes.map((r) => Number(r.prep_time_min))).toFixed(2));

  // 3. Average cook time
  add("\n3. Average cook time (min):");
  add(avg(recipes.map((r) => Number(r.cook_time_min))).toFixed(2));

  // 4. Difficulty distribution
  add("\n4. Difficulty distribution:");
  const diffCount = countBy(recipes, (r) => r.difficulty);
  add(objToString(diffCount));

  // 5. Most viewed recipes
  add("\n5. Most viewed recipes:");
  const views = interactions.filter((r) => r.type === "view");
  const viewsCount = countBy(views, (r) => r.recipe_id);
  add(topNToString(viewsCount, 10));

  // 6. Most liked recipes
  add("\n6. Most liked recipes:");
  const likes = interactions.filter((r) => r.type === "like");
  const likesCount = countBy(likes, (r) => r.recipe_id);
  add(topNToString(likesCount, 10));

  // 7. Recipes with most cook attempts
  add("\n7. Recipes with most cook attempts:");
  const attempts = interactions.filter((r) => r.type === "cook_attempt");
  const attemptsCount = countBy(attempts, (r) => r.recipe_id);
  add(topNToString(attemptsCount, 10));

  // 8. Average rating per recipe
  add("\n8. Average rating per recipe:");
  const ratings = interactions.filter(
    (r) => r.type === "rating" && r.rating !== ""
  );
  if (ratings.length > 0) {
    const recipeToRatings = {};
    ratings.forEach((r) => {
      const rid = r.recipe_id;
      const val = Number(r.rating);
      if (!isNaN(val)) {
        if (!recipeToRatings[rid]) recipeToRatings[rid] = [];
        recipeToRatings[rid].push(val);
      }
    });
    const avgRatings = {};
    Object.keys(recipeToRatings).forEach((rid) => {
      avgRatings[rid] = avg(recipeToRatings[rid]);
    });
    add(topNObjToString(avgRatings, 10));
  } else {
    add("No rating data available.");
  }

  // 9. Prep time vs likes correlation
  add("\n9. Correlation between prep time and likes:");
  const likesPerRecipe = likes.reduce((acc, r) => {
    acc[r.recipe_id] = (acc[r.recipe_id] || 0) + 1;
    return acc;
  }, {});
  const prepTimes = [];
  const likeCounts = [];
  recipes.forEach((r) => {
    const rid = r.recipe_id;
    const prep = Number(r.prep_time_min);
    if (!isNaN(prep)) {
      prepTimes.push(prep);
      likeCounts.push(likesPerRecipe[rid] || 0);
    }
  });
  const corr = correlation(prepTimes, likeCounts);
  add(`Correlation (prep_time_min vs like_count): ${corr.toFixed(4)}`);

  // 10. Ingredients in top liked recipes
  add("\n10. Ingredients associated with high engagement (top liked recipes):");
  const topLikedIds = Object.entries(likesCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([rid]) => rid);

  const topIng = ingredients.filter((ing) =>
    topLikedIds.includes(ing.recipe_id)
  );
  const topIngCount = countBy(topIng, (r) => r.name);
  add(topNToString(topIngCount, 10));

  const outPath = path.join(OUTPUT_DIR, "analytics_summary.txt");
  fs.writeFileSync(outPath, lines.join("\n"), "utf8");
  add("\n✅ Analytics summary saved to analytics_summary.txt");
}

function countBy(arr, keyFn) {
  const res = {};
  arr.forEach((r) => {
    const k = keyFn(r) || "";
    if (!k) return;
    res[k] = (res[k] || 0) + 1;
  });
  return res;
}

function objToString(obj) {
  return Object.entries(obj)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}

function topNToString(obj, n) {
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}

function topNObjToString(obj, n) {
  return topNToString(obj, n);
}

function avg(arr) {
  if (!arr.length) return 0;
  const sum = arr.reduce((s, v) => s + v, 0);
  return sum / arr.length;
}

function correlation(x, y) {
  if (x.length !== y.length || x.length === 0) return 0;
  const n = x.length;
  const meanX = avg(x);
  const meanY = avg(y);
  let num = 0;
  let denX = 0;
  let denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  if (denX === 0 || denY === 0) return 0;
  return num / Math.sqrt(denX * denY);
}

main().catch((err) => {
  console.error("❌ Error in analytics:", err);
});
