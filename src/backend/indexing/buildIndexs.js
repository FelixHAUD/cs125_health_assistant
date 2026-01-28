import fs from "fs";
import path from "path";

// ---- Load recipes ----
const dataDir = path.resolve("src/backend/json");

const recipesPath = path.join(dataDir, "recipes.json");
const nutritionPath = path.join(dataDir, "nutrition.json");

const recipes = JSON.parse(fs.readFileSync(recipesPath, "utf-8"));
const nutritionRaw = JSON.parse(fs.readFileSync(nutritionPath, "utf-8"));

const nutritionByFoodName = {};

nutritionRaw.FoundationFoods.forEach(food => {
  let calories = null;
  let protein = null;

  food.foodNutrients.forEach(n => {
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
      protein
    };
  }
});


// ---- Index containers ----
const indexes = {
  mealType: {},
  dietaryTags: {},
  costBucket: {},
  prepTimeBucket: {},
  calorieBucket: {},
  proteinBucket: {},
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

  const hasMeat =
    text.includes("chicken") ||
    text.includes("beef") ||
    text.includes("pork") ||
    text.includes("turkey");

  if (!hasMeat) tags.push("vegetarian");
  if (hasMeat) tags.push("high_protein");
  if (!text.includes("flour") && !text.includes("bread")) tags.push("gluten_free");

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
function calorieBucket(cals) {
  if (cals < 400) return "low";
  if (cals < 700) return "medium";
  return "high";
}

function proteinBucket(protein) {
  if (protein < 10) return "low";
  if (protein < 30) return "medium";
  return "high";
}

function estimateNutrition(ingredientsText) {
  let totalCalories = 0;
  let totalProtein = 0;

  const text = ingredientsText.toLowerCase();

  Object.entries(nutritionByFoodName).forEach(([food, values]) => {
    if (text.includes(food)) {
      if (values.calories) totalCalories += values.calories;
      if (values.protein) totalProtein += values.protein;
    }
  });

  if (totalCalories === 0 && totalProtein === 0) return null;

  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein)
  };
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

  const estimatedNutrition = estimateNutrition(recipe.Ingredients);

  if (estimatedNutrition) {
    indexes.recipeById[id].calories = estimatedNutrition.calories;
    indexes.recipeById[id].protein = estimatedNutrition.protein;

    const calBucket = calorieBucket(estimatedNutrition.calories);
    indexes.calorieBucket[calBucket] ??= [];
    indexes.calorieBucket[calBucket].push(id);

    const protBucket = proteinBucket(estimatedNutrition.protein);
    indexes.proteinBucket[protBucket] ??= [];
    indexes.proteinBucket[protBucket].push(id);
}

});


// ---- Write indexes ----
const outputPath = path.resolve("src/backend/indexing/indexes.json");
fs.writeFileSync(outputPath, JSON.stringify(indexes, null, 2));

console.log("Indexes built successfully from raw recipe JSON!");
