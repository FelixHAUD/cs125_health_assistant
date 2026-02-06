import {
  estimateNutrition,
  calorieBucket,
  inferMealType,
  inferDietaryTags,
  proteinBucket,
  prepTimeBucket,
  tokenizeIngredients,
  estimateRecipeCost,
  costBucket
} from "./indexUtils.js";

describe("indexUtils", () => {
  test("estimateNutrition calculates totals", () => {
    const ingredients = "['100g chicken', '50g rice']";
    const lookup = {
      chicken: { calories: 200, protein: 25 }, // per 100g
      rice: { calories: 130, protein: 2.5 }, // per 100g
    };
    const result = estimateNutrition(ingredients, lookup);
    expect(result.calories).toBeGreaterThan(200);
    expect(result.protein).toBeGreaterThan(25);
  });

  test("calorieBucket categorizes", () => {
    expect(calorieBucket(200)).toBe("low");
    expect(calorieBucket(600)).toBe("medium");
    expect(calorieBucket(800)).toBe("high");
  });

  test("inferMealType detects breakfast", () => {
    expect(inferMealType("Pancakes for breakfast")).toBe("breakfast");
    expect(inferMealType("Chicken stir fry")).toBe("dinner");
  });

  test("proteinBucket categorizes correctly", () => {
    expect(proteinBucket(10)).toBe("low");
    expect(proteinBucket(20)).toBe("medium");
    expect(proteinBucket(40)).toBe("high");
  });
  test("inferDietaryTags vegetarian & gluten free", () => {
    const tags = inferDietaryTags("rice beans vegetables");
    expect(tags).toContain("vegetarian");
    expect(tags).toContain("gluten_free");
  });

  test("inferDietaryTags meat adds high_protein", () => {
    const tags = inferDietaryTags("chicken rice");
    expect(tags).toContain("high_protein");
    expect(tags).not.toContain("vegetarian");
  });
  test("prepTimeBucket categorizes", () => {
    expect(prepTimeBucket(300)).toBe("quick");
    expect(prepTimeBucket(800)).toBe("medium");
    expect(prepTimeBucket(1500)).toBe("long");
  });
  test("estimateRecipeCost calculates cost", () => {
    const ingredients = "['100g rice']";
    const prices = { rice: 0.5 }; // per 100g
    expect(estimateRecipeCost(ingredients, prices)).toBeCloseTo(0.5);
  });

  test("costBucket categorizes", () => {
    expect(costBucket(1)).toBe("cheap");
    expect(costBucket(3)).toBe("moderate");
    expect(costBucket(10)).toBe("expensive");
  });
  test("tokenizeIngredients cleans and tokenizes", () => {
    const tokens = tokenizeIngredients("Chicken, Rice & Beans!");
    expect(tokens).toEqual(["chicken", "rice", "beans"]);
  });
});
