export function explainRecipe(recipeId, userContext, indexes) {
  const recipe = indexes.recipeById[recipeId];
  const reasons = [];

  if (userContext.goals?.includes("high_protein")) {
    reasons.push("high protein");
  }
  
  if (userContext.restrictions?.includes("vegetarian")) {
    reasons.push("vegetarian");
  }

  if (userContext.budget === "cheap") {
    reasons.push("budget-friendly");
  }

  if (userContext.caloriePref === "low") {
    reasons.push("low calorie");
  }

  return `Recommended because it is ${reasons.join(", ")} and matches your preferences.`;
}
