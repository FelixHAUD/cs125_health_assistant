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

  if (userContext.budget) {
    if (userContext.budget === "cheap" && recipe.estimatedCost < 2) {
      reasons.push("budget-friendly");
    } else if (userContext.budget === "moderate" && recipe.estimatedCost >= 2 && recipe.estimatedCost < 5) {
      reasons.push("moderately priced");
    } else if (userContext.budget === "expensive" && recipe.estimatedCost >= 5) {
      reasons.push("premium cost");
    }
  }

  if (userContext.caloriePref) {
    if (userContext.caloriePref === "low" && recipe.calories < 300) {
      reasons.push("low calorie");
    } else if (userContext.caloriePref === "medium" && recipe.calories >= 300 && recipe.calories < 700) {
      reasons.push("medium calorie");
    } else if (userContext.caloriePref === "high" && recipe.calories >= 700) {
      reasons.push("high calorie");
    }
  }

  if (!reasons.length) {
    reasons.push("a balanced match for your preferences");
  }

  return reasons.join(", ");
}
