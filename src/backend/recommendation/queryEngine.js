import fs from "fs";
import path from "path";
import { rankRecipes } from "./ranker.js";
import { explainRecipe } from "./explanation.js";

const indexesPath = path.resolve(
  "src/backend/indexing/indexes.json"
);

const indexes = JSON.parse(fs.readFileSync(indexesPath, "utf-8"));

function intersectSets(arrays) {
  if (arrays.length === 0) return [];

  return arrays.reduce((acc, curr) =>
    acc.filter(id => curr.includes(id))
  );
}



export function getRecommendations(userContext, limit = 10) {
  const filters = [];

  if (userContext.mealType) {
    filters.push(indexes.mealType[userContext.mealType] || []);
  }

  if (userContext.budget) {
    filters.push(indexes.costBucket[userContext.budget] || []);
  }

  if (userContext.caloriePref) {
    filters.push(indexes.calorieBucket[userContext.caloriePref] || []);
  }

  if (userContext.goals?.includes("high_protein")) {
    filters.push(indexes.proteinBucket["high"] || []);
  }

  if (userContext.restrictions?.length) {
    userContext.restrictions.forEach(r => {
      filters.push(indexes.dietaryTags[r] || []);
    });
  }

  const candidateIds = intersectSets(filters);

  const ranked = rankRecipes(candidateIds, userContext, indexes);

  return ranked.slice(0, limit).map(item => ({
    ...item,
    explanation: explainRecipe(item.recipeId, userContext, indexes)
  }));
}
