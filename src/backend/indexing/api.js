import express from "express";
import indexes from "./indexes.json" with { type: "json" };
import { getRecommendations } from "../recommendation/queryEngine";
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

//get profile info
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROFILE_PATH = path.join(__dirname, "profile.json");

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

// --- routes ---
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