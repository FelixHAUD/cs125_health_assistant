const fs = require('fs');
const indexes = require('./src/backend/indexing/indexes.json');

const recipeIds = Object.keys(indexes.recipeById);
if (recipeIds.length > 0) {
    const firstRecipe = indexes.recipeById[recipeIds[0]];
    console.log(JSON.stringify(firstRecipe, null, 2));
} else {
    console.log("No recipes found");
}
