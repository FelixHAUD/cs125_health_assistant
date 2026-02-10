import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { rankRecipes } from "./ranker.js";
import { explainRecipe } from "./explanation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const indexesPath = path.join(__dirname, "../indexing/indexes.json");

const indexes = JSON.parse(fs.readFileSync(indexesPath, "utf-8"));

function violatesRestrictions(recipeId, restrictions, indexes) {
  if (!restrictions || restrictions.length === 0) return false;

  return restrictions.some(r =>
    !indexes.dietaryTags[r]?.includes(recipeId)
  );
}

export function getRecommendations(userContext, limit = 10) {
  let candidateSets = [];

  if (userContext.ingredients?.length) {
    userContext.ingredients.forEach(term => {
      const ids = indexes.ingredientIndex?.[term.toLowerCase()];
      if (ids) candidateSets.push(ids);
    });
  }

  if (userContext.mealType) {
    candidateSets.push(indexes.mealType[userContext.mealType] || []);
  }

  if (userContext.budget) {
    candidateSets.push(indexes.costBucket[userContext.budget] || []);
  }

  if (userContext.caloriePref) {
    candidateSets.push(indexes.calorieBucket[userContext.caloriePref] || []);
  }

  if (userContext.goals?.includes("high_protein")) {
    candidateSets.push(indexes.proteinBucket["high"] || []);
  }
  if (userContext.goals?.includes("low_protein")) {
    candidateSets.push(indexes.proteinBucket["low"] || []);
  }
  if (userContext.goals?.includes("medium_protein")) {
      candidateSets.push(indexes.proteinBucket["medium"] || []);
    }
  if (userContext.restrictions?.length) {
    userContext.restrictions.forEach(r => {
      candidateSets.push(indexes.dietaryTags[r] || []);
    });
  }

  let candidateIds = [];

  if (candidateSets.length) {
    candidateIds = intersectSets(candidateSets);
  }

  // Loosen until 10 options
  if (candidateIds.length < limit) {
    const nonIngredientSets = candidateSets.slice(
      userContext.ingredients?.length || 0
    );
    candidateIds = intersectSets(nonIngredientSets);
  }

  if (candidateIds.length < limit) {
    if (userContext.mealType) {
      candidateIds = indexes.mealType[userContext.mealType] || [];
    }
  }

  if (candidateIds.length < limit) {
    candidateIds = Object.keys(indexes.recipeById);
  }

  console.log("Candidate count:", candidateIds.length);

  const ranked = rankRecipes(candidateIds, userContext, indexes);

  return ranked.slice(0, limit).map(item => ({
    ...item,
    explanation: explainRecipe(item.recipeId, userContext, indexes)
  }));
}



function intersectSets(arrays) {
  if (arrays.length === 0) return [];
  return arrays.reduce((acc, curr) =>
    acc.filter(id => curr.includes(id))
  );
}