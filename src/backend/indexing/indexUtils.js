/**
 * Heuristic signal - not ground truth
 */
import { parseIngredients, toGrams } from "./ingredientParser.js";

export function estimateNutrition(ingredientsText, nutritionLookup) {
  if (!ingredientsText) return null;

  let totalCalories = 0;
  let totalProtein = 0;

  const ingredients = parseIngredients(ingredientsText);
  ingredients.forEach(({ name, quantity, unit }) => {
    const data = nutritionLookup[name];
    if (!data) return;

    const grams = toGrams(quantity, unit);
    const scale = grams / 100;

    if (typeof data.calories === "number") {
      totalCalories += data.calories * scale;
    }

    if (typeof data.protein === "number") {
      totalProtein += data.protein * scale;
    }
  });

  if (totalCalories === 0 && totalProtein === 0) return null;

  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein),
  };
}


export function calorieBucket(cals) {
  if (cals < 300) return "low";
  if (cals < 700) return "medium";
  return "high";
}

export function proteinBucket(protein) {
  if (protein < 15) return "low";
  if (protein < 30) return "medium";
  return "high";
}


export function inferMealType(title) {
  const t = title.toLowerCase();
  if (t.includes("breakfast")) return "breakfast";
  if (t.includes("salad") || t.includes("sandwich")) return "lunch";
  return "dinner";
}

export function inferDietaryTags(ingredientsText) {
  const text = ingredientsText.toLowerCase();
  const tags = [];

  const hasMeat =
    text.includes("chicken") ||
    text.includes("beef") ||
    text.includes("pork") ||
    text.includes("turkey");

  if (!hasMeat) tags.push("vegetarian");
  if (!text.includes("flour") && !text.includes("bread"))
    tags.push("gluten_free");

  return tags;
}

export function prepTimeBucket(len) {
  if (len < 500) return "quick";
  if (len < 1200) return "medium";
  return "long";
}

export function costBucket(cost) {
  if (cost < 2) return "cheap";
  if (cost < 5) return "moderate";
  return "expensive";
}

export function estimateRecipeCost(ingredientsText, priceLookup) {
  let totalCost = 0;

  const ingredients = parseIngredients(ingredientsText);

  ingredients.forEach(({ name, quantity, unit }) => {
    const pricePer100g = priceLookup[name];
    if (!pricePer100g) return;

    const grams = toGrams(quantity, unit);
    const scale = grams / 100;

    totalCost += pricePer100g * scale;
  });

  if (totalCost === 0) return null;
  return Number(totalCost.toFixed(2));
}
export function tokenizeIngredients(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 2);
}

export function inferCuisineType(ingredients) {
  const text = (Array.isArray(ingredients) ? ingredients.join(" ") : ingredients).toLowerCase();

  if (text.match(/soy sauce|ginger|sesame|rice vinegar|bok choy/)) return "Asian";
  if (text.match(/olive oil|basil|parmesan|oregano|pasta/)) return "Italian";
  if (text.match(/tortilla|cumin|chili|cilantro|lime/)) return "Mexican";
  if (text.match(/butter|cream|thyme|shallot/)) return "French";
  if (text.match(/garam masala|turmeric|curry powder/)) return "Indian";

  return "General";
}

export function inferHealthLevel(calories, protein) {
  if (calories == null) return "unknown";

  if (calories < 400) return "light";
  if (calories < 700 || protein >= 20) return "balanced";

  return "indulgent";
}

export function inferDishType(title, ingredientsText) {
  const t = title.toLowerCase();
  const i = ingredientsText.toLowerCase();

  if (
    t.includes("cake") ||
    t.includes("cookie") ||
    t.includes("dessert") ||
    i.includes("sugar") && i.includes("flour")
  ) return "dessert";

  if (
    t.includes("salad") ||
    t.includes("side") ||
    t.includes("fries")
  ) return "side";

  if (
    t.includes("smoothie") ||
    t.includes("drink") ||
    t.includes("juice")
  ) return "drink";

  if (
    t.includes("snack") ||
    t.includes("bar") ||
    t.includes("bite")
  ) return "snack";

  return "main";
}