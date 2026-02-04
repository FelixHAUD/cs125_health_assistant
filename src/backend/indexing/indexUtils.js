/**
 * Heuristic signal - not ground truth
 */
export function estimateNutrition(ingredientsText, nutritionLookup) {
  if (!ingredientsText || !nutritionLookup) return null;

  const text = ingredientsText.toLowerCase();

  let calorieScore = 0;
  let proteinScore = 0;
  let matches = 0;

  const matchedFoods = new Set();

  for (const [foodName, values] of Object.entries(nutritionLookup)) {
    if (!text.includes(foodName)) continue;
    if (matchedFoods.has(foodName)) continue;

    matchedFoods.add(foodName);
    matches++;

    if (typeof values.calories === "number") {
      calorieScore += values.calories;
    }
    if (typeof values.protein === "number") {
      proteinScore += values.protein;
    }
  }

  if (matches === 0) return null;

  return {
    calories: calorieScore,
    protein: proteinScore,
    confidence: Math.min(1, 0.3 + matches * 0.15),
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
  if (hasMeat) tags.push("high_protein");
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
  const text = ingredientsText.toLowerCase();
  const matched = new Set();

  for (const [food, price] of Object.entries(priceLookup)) {
    if (text.includes(food) && !matched.has(food)) {
      matched.add(food);
      totalCost += price;
    }
  }

  return totalCost > 0 ? Number(totalCost.toFixed(2)) : null;
}
