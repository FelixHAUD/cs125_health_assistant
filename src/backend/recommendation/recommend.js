import { getRecommendations } from "./queryEngine.js";

function runTest(name, userContext) {
  console.log("\n==============================");
  console.log(`TEST: ${name}`);
  console.log("==============================");

  const results = getRecommendations(userContext, 15);

  if (!results.length) {
    console.log("No results found.");
    return;
  }

  results.forEach((r, i) => {
    console.log(
      `${i + 1}. Recipe ${r.recipeId} | score=${r.score}`
    );
    console.log(`   ${r.explanation}`);
  });
}

// ---- Test cases ----

runTest("Cheap high-protein dinner", {
  mealType: "dinner",
  goals: ["high_protein"],
  budget: "cheap",
  restrictions: []
});

runTest("Vegetarian lunch", {
  mealType: "lunch",
  restrictions: ["vegetarian"]
});

runTest("Low calorie breakfast", {
  mealType: "breakfast",
  caloriePref: "low"
});
