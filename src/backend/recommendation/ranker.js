export function rankRecipes(recipeIds, userContext, indexes) {
  return recipeIds
    .map(id => {
      const recipe = indexes.recipeById[id];
      let score = 0;

      if (userContext.mealType) {
        const match =
          indexes.mealType[userContext.mealType]?.includes(id);
        if (match) score += 3;
      }

      if (userContext.goals?.includes("high_protein") && recipe.protein) {
        score += Math.min(recipe.protein / 10, 4); // capped
      }

      if (userContext.budget === "cheap" && recipe.estimatedCost != null) {
        score += Math.max(0, 3 - recipe.estimatedCost);
      }

      if (userContext.caloriePref === "low" && recipe.calories) {
        score += Math.max(0, (500 - recipe.calories) / 100);
      }

      return { recipeId: id, score };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);
}
