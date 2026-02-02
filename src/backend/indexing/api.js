import express from "express";
import indexes from "./indexes.json" with { type: "json" };
import { getRecommendations } from "../recommendation/queryEngine";

const app = express();
const api = express.Router();

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

app.post("./api/recommend", (req, res) => {
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

app.use("/api", api);

app.listen(3000, () => {
  console.log("API running on http://localhost:3000");
});