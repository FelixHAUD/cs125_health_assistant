import { parseIngredientLine, parseIngredients, toGrams, normalizeFractions } from './ingredientParser.js';

describe('ingredientParser', () => {
  test('parseIngredientLine parses simple ingredient', () => {
    const result = parseIngredientLine('1 cup flour');
    expect(result).toEqual({ name: 'flour', quantity: 1, unit: 'cup' });
  });

  test('parseIngredientLine handles fractions', () => {
    const result = parseIngredientLine('½ cup sugar');
    expect(result.quantity).toBe(0.5);
    expect(result.unit).toBe('cup');
  });

  test('normalizeFractions converts unicode', () => {
    expect(normalizeFractions('½ tsp salt')).toBe('0.5 tsp salt');
  });

  test('toGrams converts units', () => {
    expect(toGrams(1, 'cup')).toBe(240);
    expect(toGrams(2, 'tbsp')).toBe(30);
  });

  test('parseIngredients handles list', () => {
    const text = "['1 cup flour', '2 eggs']";
    const result = parseIngredients(text);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('flour');
  });
});