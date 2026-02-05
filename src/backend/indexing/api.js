import express from "express";
import indexes from "./indexes.json" with { type: "json" };
import { getRecommendations } from "../recommendation/queryEngine.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const api = express.Router();

app.use(express.json());
// gets recipes based on meal type. 
function getRecipesForMeal(meal) {
  const ids = indexes.mealType?.[meal] ?? [];
  return ids
    .map((id) => indexes.recipeById[String(id)])
    .filter(Boolean);
}

// --- routes ---
api.get("/breakfast", (req, res) => res.json(getRecipesForMeal("breakfast")));
api.get("/lunch", (req, res) => res.json(getRecipesForMeal("lunch")));
api.get("/dinner", (req, res) => res.json(getRecipesForMeal("dinner")));
// recipes based on userContext
api.post("/recommend", (req, res) => {
  try {
    const userContext = req.body;

    const results = getRecommendations(userContext, 10);
    res.json({
      count: results.length,
      results
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Recommendation failed" });
  }
});
//get profile info
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROFILE_PATH = path.join(__dirname, "profile.json");
const EXERCISES_PATH = path.join(__dirname, "exercises.json");
const MEALS_PATH = path.join(__dirname, "meals.json");

async function readProfile() {
  const raw = await fs.readFile(PROFILE_PATH, "utf-8");
  const data = JSON.parse(raw);

  // Default goal to first option if missing
  const firstGoal = data.goalOptions?.[0] ?? "";
  if (!data.user.goal) {
    data.user.goal = firstGoal;
  }

  return data;
}

async function writeProfile(profile) {
  await fs.writeFile(
    PROFILE_PATH,
    JSON.stringify(profile, null, 2),
    "utf-8"
  );
}

async function readMeals() {
  try {
    const raw = await fs.readFile(MEALS_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

async function writeMeals(meals) {
  await fs.writeFile(
    MEALS_PATH,
    JSON.stringify(meals, null, 2),
    "utf-8"
  );
}

async function readExercises() {
  try {
    const raw = await fs.readFile(EXERCISES_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

async function writeExercises(exercises) {
  await fs.writeFile(
    EXERCISES_PATH,
    JSON.stringify(exercises, null, 2),
    "utf-8"
  );
}

// --- routes ---
api.get("/exercises", async (req, res) => {
  try {
    const data = await readExercises();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to read exercises" });
  }
});

api.post("/exercises", async (req, res) => {
  try {
    const newLog = req.body;
    const logs = await readExercises();
    logs.unshift(newLog); // Add to beginning
    await writeExercises(logs);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save exercise" });
  }
});

api.delete("/exercises/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    let logs = await readExercises();
    logs = logs.filter(l => l.id !== id);
    await writeExercises(logs);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete exercise" });
  }
});

api.get("/meals", async (req, res) => {
  try {
    const meals = await readMeals();
    res.json(meals);
  } catch (err) {
    res.status(500).json({ error: "Failed to read meals" });
  }
});

api.post("/meals", async (req, res) => {
  try {
    const newMeal = req.body;

    if (!newMeal?.id || !newMeal?.meal || !newMeal?.type || !newMeal?.date) {
      return res.status(400).json({ error: "Invalid meal format" });
    }

    const meals = await readMeals();
    meals.unshift(newMeal); // Add to beginning
    await writeMeals(meals);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save meal" });
  }
});

api.delete("/meals/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    let meals = await readMeals();

    meals = meals.filter(m => m.id !== id);
    await writeMeals(meals);

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete meal" });
  }
});

api.get("/profile", async (req, res) => {
  try {
    const profile = await readProfile();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "Failed to read profile.json" });
  }
});
api.put("/profile", async (req, res) => {
  try {
    const profile = req.body;

    if (!profile?.user || !profile?.vitals || !Array.isArray(profile.goalOptions)) {
      return res.status(400).json({ error: "Invalid profile format" });
    }

    const firstGoal = profile.goalOptions[0] ?? "";
    if (!profile.user.goal) profile.user.goal = firstGoal;

    await writeProfile(profile);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to write profile.json" });
  }
});

app.use("/api", api);

app.listen(3000, () => {
  console.log("API running on http://localhost:3000");
});