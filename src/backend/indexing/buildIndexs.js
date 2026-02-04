import fs from "fs";
import path from "path";
import {
  estimateNutrition,
  calorieBucket,
  proteinBucket,
  inferDietaryTags,
  inferMealType,
  prepTimeBucket,
  costBucket,
  estimateRecipeCost,
} from "./indexUtils.js";

// ---- Load recipes ----
const dataDir = path.resolve("src/backend/json");

const recipesPath = path.join(dataDir, "recipes.json");
const nutritionPath = path.join(dataDir, "nutrition.json");
const pricePath = path.join(dataDir, "prices.json");

const recipes = JSON.parse(fs.readFileSync(recipesPath, "utf-8"));
const nutritionRaw = JSON.parse(fs.readFileSync(nutritionPath, "utf-8"));
const prices = JSON.parse(fs.readFileSync(pricePath, "utf-8"));

const nutritionByFoodName = {};

nutritionRaw.FoundationFoods.forEach((food) => {
  let calories = null;
  let protein = null;

  food.foodNutrients.forEach((n) => {
    if (n.nutrient.id === 1008) {
      calories = n.amount;
    }
    if (n.nutrient.id === 1003) {
      protein = n.amount;
    }
  });

  if (calories !== null || protein !== null) {
    nutritionByFoodName[food.description.toLowerCase().split(",")[0]] = {
      calories,
      protein,
    };
  }
});

const priceByFoodName = {};
prices.forEach((item) => {
  const name = item.food_description.toLowerCase().split(",")[0].trim();

  priceByFoodName[name] = Number(item.price_100gm);
});

// ---- Index containers ----
const indexes = {
  mealType: {},
  dietaryTags: {},
  costBucket: {},
  prepTimeBucket: {},
  calorieBucket: {},
  proteinBucket: {},
  recipeById: {},
};

// ---- Build indexes ----
recipes.forEach((recipe) => {
  const id = String(recipe.id);

  // Normalize recipe object
  const normalizedRecipe = {
    id,
    title: recipe.Title,
    ingredients: recipe.Ingredients,
    instructions: recipe.Instructions,
  };

  indexes.recipeById[id] = normalizedRecipe;

  // ---- Meal type ----
  const mealType = inferMealType(recipe.Title);
  indexes.mealType[mealType] ??= [];
  indexes.mealType[mealType].push(id);

  // ---- Dietary tags ----
  const tags = inferDietaryTags(recipe.Ingredients);
  tags.forEach((tag) => {
    indexes.dietaryTags[tag] ??= [];
    indexes.dietaryTags[tag].push(id);
  });

  // ---- Cost ----
  const estimatedCost = estimateRecipeCost(recipe.Ingredients, priceByFoodName);

  if (estimatedCost !== null) {
    indexes.recipeById[id].estimatedCost = estimatedCost;

    const cost = costBucket(estimatedCost);
    indexes.costBucket[cost] ??= [];
    indexes.costBucket[cost].push(id);
  }
  // ---- Prep time ----
  const prep = prepTimeBucket(recipe.Instructions.length);
  indexes.prepTimeBucket[prep] ??= [];
  indexes.prepTimeBucket[prep].push(id);
  const estimatedNutrition = estimateNutrition(
    recipe.Ingredients,
    nutritionByFoodName,
  );

  if (estimatedNutrition) {
    const calBucket = calorieBucket(estimatedNutrition.calories);
    const protBucket = proteinBucket(estimatedNutrition.protein);

    indexes.recipeById[id].nutrition = {
      calorieBucket: calBucket,
      proteinBucket: protBucket,
      confidence: estimatedNutrition.confidence,
    };

    indexes.calorieBucket[calBucket] ??= [];
    indexes.calorieBucket[calBucket].push(id);

    indexes.proteinBucket[protBucket] ??= [];
    indexes.proteinBucket[protBucket].push(id);
  }
});

// ---- Write indexes ----
const outputPath = path.resolve("src/backend/indexing/indexes.json");
fs.writeFileSync(outputPath, JSON.stringify(indexes, null, 2));

console.log("Indexes built successfully from raw recipe JSON!");
