export function rankRecipes(recipeIds, userContext, indexes) {
  return recipeIds
    .map((id) => {
      let score = 0;
      const recipe = indexes.recipeById[id];

      if (userContext.goals?.includes("high_protein") && recipe.protein >= 25) {
        score += 2;
      }

      if (userContext.budget === "cheap" && recipe.estimatedCost < 2) {
        score += 1;
      }

      if (userContext.caloriePref === "low" && recipe.calories < 400) {
        score += 1;
      }

      if (userContext.ingredients?.length) {
        userContext.ingredients.forEach((term) => {
          const tfidf = indexes.ingredientTfidf[id]?.[term.toLowerCase()] || 0;
          score += tfidf * 0.5;
        });
      }

      return { recipeId: id, score };
    })
    .sort((a, b) => b.score - a.score);
}
