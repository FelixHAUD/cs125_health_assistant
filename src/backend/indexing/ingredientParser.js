import nlp from "compromise";

const UNIT_TO_GRAMS = {
  g: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  lb: 453.6,
  lbs: 453.6,
  oz: 28.35,
  cup: 240,     
  cups: 240,
  tbsp: 15,
  tsp: 5,
};

function normalizeUnit(unit) {
  if (!unit) return null;
  return unit.toLowerCase();
}

function parseQuantity(value) {
  if (!value) return 1;
  if (value.includes("/")) {
    const [a, b] = value.split("/");
    return Number(a) / Number(b);
  }
  return Number(value);
}

export function parseIngredientLine(line) {
  const doc = nlp(line);

  const numbers = doc.numbers().out("array");
  const nouns = doc.nouns().out("array");
  const units = doc.match("#Unit").out("array");

  const quantity = numbers.length ? parseQuantity(numbers[0]) : 1;
  const unit = units.length ? normalizeUnit(units[0]) : null;
  const name = nouns.length ? nouns[nouns.length - 1].toLowerCase() : null;

  return {
    name,
    quantity,
    unit,
  };
}

export function parseIngredients(text) {
  const inner = text.slice(1, -1); 
  const items = inner.split(/',\s*'/).map(s => s.replace(/^'|'$/g, '').trim()); 
  return items.map(parseIngredientLine).filter(i => i.name);
}

export function toGrams(quantity, unit) {
  if (!unit || !UNIT_TO_GRAMS[unit]) return quantity * 100; 
  return quantity * UNIT_TO_GRAMS[unit];
}
