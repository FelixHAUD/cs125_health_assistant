function buildQueryVector(terms, indexes) {
  // tfidf
  const tf = Object.create(null);
  for (const t of terms) {
    const term = String(t).toLowerCase().trim();
    if (!term) continue;
    tf[term] = (tf[term] ?? 0) + 1;
  }

  const q = Object.create(null);
  for (const term of Object.keys(tf)) {
    const idf = indexes.ingredientIdf?.[term] ?? 1; 
    const wtf = 1 + Math.log(tf[term]);
    q[term] = wtf * idf;
  }

  return q;
}

function vectorNorm(vec) {
  let sumSq = 0;
  for (const k of Object.keys(vec)) {
    const w = vec[k];
    sumSq += w * w;
  }
  return Math.sqrt(sumSq);
}

function cosineSimilarity(queryVec, queryNorm, docVec) {
  if (!docVec) return 0;

  let dot = 0;
  for (const term of Object.keys(queryVec)) {
    const qW = queryVec[term];
    const dW = docVec[term] ?? 0;
    dot += qW * dW;
  }
  let sumSq = 0;
    for (const k of Object.keys(docVec)) {
      const w = docVec[k];
      sumSq += w * w;
    }
  const docNorm = Math.sqrt(sumSq);

  if (queryNorm === 0 || docNorm === 0) return 0;
  return dot / (queryNorm * docNorm);
}

export function rankRecipes(recipeIds, userContext, indexes) {
  const hasIngredients = Array.isArray(userContext.ingredients) && userContext.ingredients.length > 0;
  const queryVec = hasIngredients ? buildQueryVector(userContext.ingredients, indexes) : null;
  const queryNorm = queryVec ? vectorNorm(queryVec) : 0;

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

      // cosine similarity + tfidf if ingredients is provided.
      if (queryVec) {
        const docVec = indexes.ingredientTfidf?.[id] || null;

        const sim = cosineSimilarity(queryVec, queryNorm, docVec);
        score += sim * 0.5; 
      }
      return { recipeId: id, recipeTitle: recipe.title, score };
    })
    .sort((a, b) => b.score - a.score);
}
