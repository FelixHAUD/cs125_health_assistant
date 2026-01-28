import fs from "fs";
import path from "path";

// ---- Load recipes ----
const dataDir = path.resolve("src/backend/json");
const recipesPath = path.join(dataDir, "recipes.json");

const recipes = JSON.parse(fs.readFileSync(recipesPath, "utf-8"));

// ---- Index containers ----
const indexes = {
  mealType: {},
  dietaryTags: {},
  costBucket: {},
  prepTimeBucket: {},
  recipeById: {}
};

// ---- Helpers ----
function inferMealType(title) {
  const t = title.toLowerCase();
  if (t.includes("breakfast")) return "breakfast";
  if (t.includes("salad") || t.includes("sandwich")) return "lunch";
  return "dinner"; // default
}

function inferDietaryTags(ingredientsText) {
  const text = ingredientsText.toLowerCase();
  const tags = [];

  if (!text.includes("chicken") && !text.includes("beef") && !text.includes("pork")) {
    tags.push("vegetarian");
  }

  if (text.includes("chicken") || text.includes("beef") || text.includes("pork")) {
    tags.push("high_protein");
  }

  if (!text.includes("flour") && !text.includes("bread")) {
    tags.push("gluten_free");
  }

  return tags;
}

function costBucket(ingredientCount) {
  if (ingredientCount <= 6) return "cheap";
  if (ingredientCount <= 12) return "moderate";
  return "expensive";
}

function prepTimeBucket(instructionLength) {
  if (instructionLength < 500) return "quick";
  if (instructionLength < 1200) return "medium";
  return "long";
}

// ---- Build indexes ----
recipes.forEach(recipe => {
  const id = String(recipe.id);

  // Normalize recipe object
  const normalizedRecipe = {
    id,
    title: recipe.Title,
    ingredients: recipe.Ingredients,
    instructions: recipe.Instructions
  };

  indexes.recipeById[id] = normalizedRecipe;

  // ---- Meal type ----
  const mealType = inferMealType(recipe.Title);
  indexes.mealType[mealType] ??= [];
  indexes.mealType[mealType].push(id);

  // ---- Dietary tags ----
  const tags = inferDietaryTags(recipe.Ingredients);
  tags.forEach(tag => {
    indexes.dietaryTags[tag] ??= [];
    indexes.dietaryTags[tag].push(id);
  });

  // ---- Cost ----
  const ingredientCount = recipe.Ingredients.split(",").length;
  const cost = costBucket(ingredientCount);
  indexes.costBucket[cost] ??= [];
  indexes.costBucket[cost].push(id);

  // ---- Prep time ----
  const prep = prepTimeBucket(recipe.Instructions.length);
  indexes.prepTimeBucket[prep] ??= [];
  indexes.prepTimeBucket[prep].push(id);
});

// ---- Write indexes ----
const outputPath = path.resolve("src/backend/indexing/indexes.json");
fs.writeFileSync(outputPath, JSON.stringify(indexes, null, 2));

console.log("Indexes built successfully from raw recipe JSON!");
