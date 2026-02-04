export function explainRecipe(recipeId, userContext, indexes) {
  const recipe = indexes.recipeById[recipeId];
  const reasons = [];

  if (
    userContext.mealType &&
    indexes.mealType[userContext.mealType]?.includes(recipeId)
  ) {
    reasons.push(`matches your ${userContext.mealType} preference`);
  }

  if (userContext.goals?.includes("high_protein") && recipe.protein >= 20) {
    reasons.push(`high in protein (${recipe.protein}g)`);
  }

  if (userContext.budget === "cheap" && recipe.estimatedCost < 2) {
    reasons.push("budget-friendly");
  }

  if (userContext.caloriePref === "low" && recipe.calories < 400) {
    reasons.push("low calorie");
  }

  if (!reasons.length) {
    reasons.push("a balanced match for your preferences");
  }

  return reasons.join(", ");
}
