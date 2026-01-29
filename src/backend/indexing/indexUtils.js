/**
 * Estimates calories and protein from ingredient text
 * using a nutrition lookup table.
 *
 * @param {string} ingredientsText
 * @param {Object} nutritionLookup
 * @returns {{ calories: number, protein: number } | null}
 */
export function estimateNutrition(ingredientsText, nutritionLookup) {
  if (!ingredientsText || !nutritionLookup) return null;

  let totalCalories = 0;
  let totalProtein = 0;

  const text = ingredientsText.toLowerCase();

  for (const [foodName, values] of Object.entries(nutritionLookup)) {
    if (!text.includes(foodName)) continue;

    if (typeof values.calories === "number") {
      totalCalories += values.calories;
    }

    if (typeof values.protein === "number") {
      totalProtein += values.protein;
    }
  }

  if (totalCalories === 0 && totalProtein === 0) return null;

  return {
    calories: Math.round(totalCalories),
    protein: Math.round(totalProtein)
  };
}

/**
 * Returns the calorie bucket
 *
 * @param {number} calories
 * @returns {{ calorieBucket: string } | null}
 */
export function calorieBucket(cals) {
  if (cals < 400) return "low";
  if (cals < 700) return "medium";
  return "high";
}
/**
 * Returns the protein bucket
 *
 * @param {number} protein
 * @returns {{ proteinBucket: string } | null}
 */
export function proteinBucket(protein) {
  if (protein < 10) return "low";
  if (protein < 30) return "medium";
  return "high";
}
/**
 * Infers the meal type using parsing
 *
 * @param {string} title
 * @returns {{ mealType: string } | null}
 */
export function inferMealType(title) {
  const t = title.toLowerCase();
  if (t.includes("breakfast")) return "breakfast";
  if (t.includes("salad") || t.includes("sandwich")) return "lunch";
  return "dinner"; // default
}
/**
 * Returns the dietary tags
 *
 * @param {string} ingredientsText
 * @returns {{ dietaryTags: Array<string> } | null}
 */
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
  if (!text.includes("flour") && !text.includes("bread")) tags.push("gluten_free");

  return tags;
}
/**
 * Returns the cost buckets
 * General heuristic based on the ingredients
 * TODO: count the ingredients vs. cost. 
 *
 * @param {number} ingredientCount
 * @returns {{ costBucket: string } | null}
 */
export function costBucket(ingredientCount) {
  if (ingredientCount <= 6) return "cheap";
  if (ingredientCount <= 12) return "moderate";
  return "expensive";
}
/**
 * Returns the prepTimeBucket
 *
 * @param {number} instructionLength
 * @returns {{ prepTimeBucket: string } | null}
 */
export function prepTimeBucket(instructionLength) {
  if (instructionLength < 500) return "quick";
  if (instructionLength < 1200) return "medium";
  return "long";
}
/**
 * Estimates total recipe cost based on ingredient matches.
 *
 * @param {string} ingredientsText 
 * @param {{ [foodName: string]: number }} priceLookup 
 * @returns {number | null} 
 */
export function estimateRecipeCost(ingredientsText, priceLookup) {
  let totalCost = 0;
  const text = ingredientsText.toLowerCase();

  Object.entries(priceLookup).forEach(([food, price]) => {
    if (text.includes(food)) {
      totalCost += price;
    }
  });

  if (totalCost === 0) return null;

  return Number(totalCost.toFixed(2));
}