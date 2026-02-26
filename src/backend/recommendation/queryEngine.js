import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { rankRecipes } from "./ranker.js";
import { explainRecipe } from "./explanation.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const indexesPath = path.join(__dirname, "../indexing/indexes.json");
const mealsPath = path.join(__dirname, "../indexing/meals.json");
let meals = JSON.parse(fs.readFileSync(mealsPath, "utf-8"));
let indexes = JSON.parse(fs.readFileSync(indexesPath, "utf-8"));
let mealsReloadTimer = null;

//Watch for meal logs.
function reloadMeals() {
  try {
    const raw = fs.readFileSync(mealsPath, "utf-8");
    meals = JSON.parse(raw);
    console.log("Reloaded meals.json:", meals.length);
  } catch (err) {
    console.error("Failed to reload meals.json:", err);
  }
}
fs.watch(mealsPath, (eventType) => {
  clearTimeout(mealsReloadTimer);
  mealsReloadTimer = setTimeout(reloadMeals, 100);
});

function violatesRestrictions(recipeId, restrictions, indexes) {
  if (!Array.isArray(restrictions) || restrictions.length === 0) return false;

  return restrictions.some((r) => {
    const allowed = indexes.dietaryTags?.[r];
    return Array.isArray(allowed) && !allowed.includes(recipeId);
  });
}

function intersectSets(sets) {
  if (!sets.length) return new Set();

  let result = new Set(sets[0]);
  for (let i = 1; i < sets.length; i++) {
    const next = new Set(sets[i]);
    result = new Set([...result].filter((id) => next.has(id)));
    if (result.size === 0) break;
  }
  return result;
}

function unionSets(sets) {
  const result = new Set();
  for (const s of sets) {
    for (const id of s) result.add(id);
  }
  return result;
}

export function getRecommendations(userContext, limit = 10) {
  const ingredientSets = [];
  const preferenceSets = [];
  const restrictionSets = [];

  if (Array.isArray(userContext.ingredients)) {
    for (const term of userContext.ingredients) {
      const ids = indexes.ingredientIndex?.[term.toLowerCase()];
      if (Array.isArray(ids) && ids.length) {
        ingredientSets.push(new Set(ids));
      }
    }
  }

  if (userContext.mealType) {
    preferenceSets.push(
      new Set(indexes.mealType?.[userContext.mealType] || []),
    );
  }

  if (userContext.budget) {
    preferenceSets.push(
      new Set(indexes.costBucket?.[userContext.budget] || []),
    );
  }

  if (userContext.caloriePref) {
    preferenceSets.push(
      new Set(indexes.calorieBucket?.[userContext.caloriePref] || []),
    );
  }

  if (userContext.healthLevel) {
    preferenceSets.push(
      new Set(indexes.healthLevel?.[userContext.healthLevel] || []),
    );
  }

  if (userContext.cuisineType) {
    preferenceSets.push(
      new Set(indexes.cuisineType?.[userContext.cuisineType] || []),
    );
  }

  if (userContext.dishType) {
    preferenceSets.push(
      new Set(indexes.dishType?.[userContext.dishType] || []),
    );
  }

  if (Array.isArray(userContext.goals)) {
    if (userContext.goals.includes("high_protein")) {
      preferenceSets.push(new Set(indexes.proteinBucket?.high || []));
    } else if (userContext.goals.includes("medium_protein")) {
      preferenceSets.push(new Set(indexes.proteinBucket?.medium || []));
    } else if (userContext.goals.includes("low_protein")) {
      preferenceSets.push(new Set(indexes.proteinBucket?.low || []));
    }
  }

  if (Array.isArray(userContext.restrictions)) {
    for (const r of userContext.restrictions) {
      restrictionSets.push(new Set(indexes.dietaryTags?.[r] || []));
    }
  }

  let candidates = new Set();

  candidates = intersectSets([
    ...ingredientSets,
    ...preferenceSets,
    ...restrictionSets,
  ]);

  if (candidates.size < limit) {
    candidates = intersectSets([...preferenceSets, ...restrictionSets]);
  }

  if (candidates.size < limit) {
    candidates = unionSets([...preferenceSets, ...restrictionSets]);
  }

  if (candidates.size < limit) {
    candidates = new Set(
      Object.keys(indexes.recipeById).filter(
        (id) => !violatesRestrictions(id, userContext.restrictions, indexes),
      ),
    );
  }

  console.log("Candidate count:", candidates.size);

  const ranked = rankRecipes(
    [...candidates].filter((id) => indexes.recipeById?.[id]),
    userContext,
    indexes,
    meals,
  );

  return ranked.slice(0, limit).map((item) => ({
    ...item,
    explanation: explainRecipe(item.recipeId, userContext, indexes),
  }));
}
