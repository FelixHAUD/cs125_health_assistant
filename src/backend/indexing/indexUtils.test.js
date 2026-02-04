import { estimateNutrition, calorieBucket, inferMealType } from './indexUtils.js';

describe('indexUtils', () => {
  test('estimateNutrition calculates totals', () => {
    const ingredients = "['100g chicken', '50g rice']";
    const lookup = {
      chicken: { calories: 200, protein: 25 }, // per 100g
      rice: { calories: 130, protein: 2.5 }    // per 100g
    };

    const result = estimateNutrition(ingredients, lookup);

    expect(result.calories).toBeGreaterThan(300);
    expect(result.protein).toBeGreaterThan(25);
  });

  test('calorieBucket categorizes', () => {
    expect(calorieBucket(200)).toBe('low');
    expect(calorieBucket(600)).toBe('medium');
    expect(calorieBucket(800)).toBe('high');
  });

  test('inferMealType detects breakfast', () => {
    expect(inferMealType('Pancakes for breakfast')).toBe('breakfast');
    expect(inferMealType('Chicken stir fry')).toBe('dinner');
  });
});
