import {
  parseIngredientLine,
  parseIngredients,
  toGrams,
} from "./ingredientParser.js";

describe("ingredientParser", () => {
  test("parseIngredientLine parses simple ingredient", () => {
    const result = parseIngredientLine("1 cup flour");
    expect(result).toEqual({ name: "flour", quantity: 1, unit: "cup" });
  });

  test("parseIngredientLine handles fractions", () => {
    const result = parseIngredientLine("½ cup sugar");
    expect(result.quantity).toBe(0.5);
    expect(result.unit).toBe("cup");
  });

  test("toGrams converts units", () => {
    expect(toGrams(1, "cup")).toBe(240);
    expect(toGrams(2, "tbsp")).toBe(30);
  });

  test("parseIngredients handles list", () => {
    const text = "['1 cup flour', '2 eggs']";
    const result = parseIngredients(text);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("flour");
  });
  test("normalizeFractions handles mixed fractions", () => {
    const r = parseIngredientLine("1 1/2 cups milk");
    expect(r.quantity).toBe(1.5);
  });
  test("parseIngredientLine defaults quantity to 1", () => {
    const r = parseIngredientLine("salt");
    expect(r.quantity).toBe(1);
    expect(r.unit).toBe(null);
  });
  test("toGrams defaults to 100g when unit unknown", () => {
    expect(toGrams(2, "clove")).toBe(200);
  });
});
