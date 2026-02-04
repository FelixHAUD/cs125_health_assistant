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
  tokenizeIngredients,
} from "./indexUtils.js";

// ---- Load data ----
const dataDir = path.resolve("src/backend/json");

const recipes = JSON.parse(
  fs.readFileSync(path.join(dataDir, "recipes.json"), "utf-8"),
);
const nutritionRaw = JSON.parse(
  fs.readFileSync(path.join(dataDir, "nutrition.json"), "utf-8"),
);
const prices = JSON.parse(
  fs.readFileSync(path.join(dataDir, "prices.json"), "utf-8"),
);

// ---- Nutrition lookup ----
const nutritionByFoodName = {};

nutritionRaw.FoundationFoods.forEach((food) => {
  let calories = null;
  let protein = null;

  food.foodNutrients.forEach((n) => {
    if (n.nutrient.id === 1008) calories = n.amount;
    if (n.nutrient.id === 1003) protein = n.amount;
  });

  if (calories || protein) {
    nutritionByFoodName[food.description.toLowerCase().split(",")[0]] = {
      calories,
      protein,
    };
  }
});

const priceByFoodName = {};
prices.forEach((item) => {
  const name = item.food_description.toLowerCase().split(",")[0];
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
  ingredientIndex: {},
  ingredientIdf: {},
  ingredientTfidf: {},
};

// ---- TF-IDF temp containers ----
const ingredientDocCount = {};
const ingredientTf = {};
const totalDocs = recipes.length;

// ---- Build indexes ----
recipes.forEach((recipe) => {
  const id = String(recipe.id);

  indexes.recipeById[id] = {
    id,
    title: recipe.Title,
    ingredients: recipe.Ingredients,
    instructions: recipe.Instructions,
  };

  // ---- Meal type ----
  const mealType = inferMealType(recipe.Title);
  indexes.mealType[mealType] ??= [];
  indexes.mealType[mealType].push(id);

  // ---- Dietary tags ----
  inferDietaryTags(recipe.Ingredients).forEach((tag) => {
    indexes.dietaryTags[tag] ??= [];
    indexes.dietaryTags[tag].push(id);
  });

  // ---- Cost ----
  const estimatedCost = estimateRecipeCost(recipe.Ingredients, priceByFoodName);

  if (estimatedCost !== null) {
    indexes.recipeById[id].estimatedCost = estimatedCost;
    const bucket = costBucket(estimatedCost);
    indexes.costBucket[bucket] ??= [];
    indexes.costBucket[bucket].push(id);
  }

  // ---- Prep time ----
  const prep = prepTimeBucket(recipe.Instructions.length);
  indexes.prepTimeBucket[prep] ??= [];
  indexes.prepTimeBucket[prep].push(id);

  // ---- Nutrition ----
  const nutrition = estimateNutrition(recipe.Ingredients, nutritionByFoodName);

  if (nutrition) {
    indexes.recipeById[id].calories = nutrition.calories;
    indexes.recipeById[id].protein = nutrition.protein;

    const calBucket = calorieBucket(nutrition.calories);
    indexes.calorieBucket[calBucket] ??= [];
    indexes.calorieBucket[calBucket].push(id);

    const protBucket = proteinBucket(nutrition.protein);
    indexes.proteinBucket[protBucket] ??= [];
    indexes.proteinBucket[protBucket].push(id);
  }

  const tokens = tokenizeIngredients(recipe.Ingredients);
  const tf = {};

  tokens.forEach((token) => {
    tf[token] = (tf[token] || 0) + 1;
  });

  ingredientTf[id] = tf;

  Object.keys(tf).forEach((term) => {
    ingredientDocCount[term] = (ingredientDocCount[term] || 0) + 1;
    indexes.ingredientIndex[term] ??= [];
    indexes.ingredientIndex[term].push(id);
  });
});

Object.entries(ingredientDocCount).forEach(([term, count]) => {
  indexes.ingredientIdf[term] = Math.log(totalDocs / (1 + count));
});

Object.entries(ingredientTf).forEach(([id, tfMap]) => {
  indexes.ingredientTfidf[id] = {};

  Object.entries(tfMap).forEach(([term, tf]) => {
    indexes.ingredientTfidf[id][term] = tf * indexes.ingredientIdf[term];
  });
});

fs.writeFileSync(
  path.resolve("src/backend/indexing/indexes.json"),
  JSON.stringify(indexes, null, 2),
);

console.log("Indexes built with TF-IDF + inverted index!");
