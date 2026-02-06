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
  const clean = normalizeFractions(line)
    .toLowerCase()
    .replace(/(\d+(?:\.\d+)?)([a-zA-Z]+)/g, "$1 $2")
    .replace(/[\[\]"']/g, "")
    .trim();

  const match = clean.match(/^(\d+(?:\.\d+)?)(?:\s+)?([a-zA-Z]+)?\s+(.*)$/);

  let quantity = 1;
  let unit = null;
  let nameText = clean;

  if (match) {
    quantity = Number(match[1]);
    unit = normalizeUnit(match[2]);
    nameText = match[3];
  }

  const doc = nlp(nameText);
  const nouns = doc.nouns().out("array");

  const name =
    nouns.length
      ? nouns[nouns.length - 1]
      : nameText.split(" ").pop();

  return {
    name,
    quantity,
    unit,
  };
}


export function parseIngredients(text) {
  if (!text) return [];

  let items = [];

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) {
      items = parsed;
    }
  } catch {
    const inner = text.slice(1, -1);
    items = inner
      .split(/['"],\s*['"]/)
      .map((s) => s.replace(/^['"]|['"]$/g, "").trim());
  }

  return items
    .filter(Boolean)
    .map(parseIngredientLine)
    .filter((i) => i.name);
}

export function toGrams(quantity, unit) {
  if (!unit || !UNIT_TO_GRAMS[unit]) return quantity * 100;
  return quantity * UNIT_TO_GRAMS[unit];
}

export function normalizeFractions(text) {
  if (!text) return text;

  return text
    .replace(/½/g, "0.5")
    .replace(/¼/g, "0.25")
    .replace(/¾/g, "0.75")
    .replace(/⅓/g, "0.333")
    .replace(/⅔/g, "0.667")

    .replace(/(\d+)\s+(\d+)\/(\d+)/g, (_, w, n, d) =>
      (Number(w) + Number(n) / Number(d)).toString()
    )

    .replace(/(\d+)\/(\d+)/g, (_, n, d) =>
      (Number(n) / Number(d)).toString()
    );
}