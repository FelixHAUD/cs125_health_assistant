import fs from "fs";
import path from "path";
import { rankRecipes } from "./ranker.js";
import { explainRecipe } from "./explanation.js";

const indexesPath = path.resolve(
  "src/backend/indexing/indexes.json"
);

const indexes = JSON.parse(fs.readFileSync(indexesPath, "utf-8"));

function violatesRestrictions(recipeId, restrictions, indexes) {
  if (!restrictions || restrictions.length === 0) return false;

  return restrictions.some(r =>
    !indexes.dietaryTags[r]?.includes(recipeId)
  );
}

export function getRecommendations(userContext, limit = 10) {
  let candidateIds = Object.keys(indexes.recipeById);

  candidateIds = candidateIds.filter(id =>
    !violatesRestrictions(id, userContext.restrictions, indexes)
  );

  const ranked = rankRecipes(candidateIds, userContext, indexes);

  return ranked.slice(0, limit).map(item => ({
    ...item,
    explanation: explainRecipe(item.recipeId, userContext, indexes)
  }));
}
