import { useEffect, useState } from "react";

const MEAL_OPTIONS = ["breakfast", "lunch", "dinner"];
const BUDGET_OPTIONS = ["cheap", "moderate", "expensive"];
const CALORIE_OPTIONS = ["low", "medium", "high"];
const HEALTH_OPTIONS = ["light", "balanced", "indulgent"];
const CUISINE_OPTIONS = ["Italian", "Mexican", "Asian", "American", "Mediterranean"];
const DISH_OPTIONS = ["main", "side", "dessert", "snack", "drink"];
const DIETARY_OPTIONS = ["vegetarian", "vegan", "gluten_free", "dairy_free", "keto"];

export default function Search() {
  const [mealType, setMealType] = useState("breakfast");
  const [budget, setBudget] = useState("moderate");
  const [caloriePref, setCaloriePref] = useState("medium");
  const [healthLevel, setHealthLevel] = useState("balanced");
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [ingredients, setIngredients] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [dishType, setDishType] = useState("");
  const [highProtein, setHighProtein] = useState(false);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  // Load profile defaults
  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        const user = data?.user;
        if (!user) return;
        if (user.mealType) setMealType(user.mealType);
        if (user.budget) setBudget(user.budget);
        if (user.caloriePref) setCaloriePref(user.caloriePref);
        if (user.healthLevel) setHealthLevel(user.healthLevel);
        if (Array.isArray(user.dietaryRestrictions)) setDietaryRestrictions(user.dietaryRestrictions);
        if (Array.isArray(user.goals) && user.goals.includes("high_protein")) setHighProtein(true);
      })
      .catch((e) => console.error("Failed to load profile:", e));
  }, []);

  // Handlers
  const handleGetRecs = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const userContext = {
      mealType,
      budget,
      caloriePref,
      healthLevel,
      dietaryRestrictions,
      goals: highProtein ? ["high_protein"] : [],
      ingredients:
        ingredients.trim() !== ""
          ? ingredients.split(",").map((i) => i.trim()).filter(Boolean)
          : [],
    };

    if (cuisineType) userContext.cuisineType = cuisineType;
    if (dishType) userContext.dishType = dishType;

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userContext),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Request failed (${res.status})`);
      }

      const data = await res.json();
      setResults(Array.isArray(data.results) ? data.results : []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch recommendations.");
    } finally {
      setLoading(false);
    }
  };

  const toggleDietary = (option) => {
    setDietaryRestrictions((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  };

  // Render
  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h1>Recipe Recommendations</h1>

      <form
        onSubmit={handleGetRecs}
        style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16 }}
      >
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {/* Meal Type */}
          <label>
            Meal type:
            <select value={mealType} onChange={(e) => setMealType(e.target.value)} style={{ marginLeft: 8 }}>
              {MEAL_OPTIONS.map((m) => (
                <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
              ))}
            </select>
          </label>

          {/* Budget */}
          <label>
            Budget:
            <select value={budget} onChange={(e) => setBudget(e.target.value)} style={{ marginLeft: 8 }}>
              {BUDGET_OPTIONS.map((b) => (
                <option key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</option>
              ))}
            </select>
          </label>

          {/* Calories */}
          <label>
            Calories:
            <select value={caloriePref} onChange={(e) => setCaloriePref(e.target.value)} style={{ marginLeft: 8 }}>
              {CALORIE_OPTIONS.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </label>

          {/* Health Level */}
          <label>
            Health Level:
            <select value={healthLevel} onChange={(e) => setHealthLevel(e.target.value)} style={{ marginLeft: 8 }}>
              {HEALTH_OPTIONS.map((h) => (
                <option key={h} value={h}>{h.charAt(0).toUpperCase() + h.slice(1)}</option>
              ))}
            </select>
          </label>

          {/* Cuisine */}
          <label>
            Cuisine:
            <select value={cuisineType} onChange={(e) => setCuisineType(e.target.value)} style={{ marginLeft: 8 }}>
              <option value="">Any</option>
              {CUISINE_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          {/* Dish Type */}
          <label>
            Dish type:
            <select value={dishType} onChange={(e) => setDishType(e.target.value)} style={{ marginLeft: 8 }}>
              <option value="">Any</option>
              {DISH_OPTIONS.map((d) => (
                <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
              ))}
            </select>
          </label>

          {/* High Protein */}
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={highProtein} onChange={(e) => setHighProtein(e.target.checked)} />
            High protein
          </label>
        </div>

        {/* Ingredients */}
        <div style={{ marginTop: 12 }}>
          <label>
            Ingredients (comma-separated):
            <input
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              style={{ marginLeft: 8, width: "60%" }}
            />
          </label>
        </div>

        {/* Dietary Restrictions */}
        <div style={{ marginTop: 12 }}>
          <span>Dietary Restrictions:</span>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
            {DIETARY_OPTIONS.map((d) => (
              <label key={d} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input
                  type="checkbox"
                  checked={dietaryRestrictions.includes(d)}
                  onChange={() => toggleDietary(d)}
                />
                {d.replace("_", " ")}
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 12,
            padding: "8px 14px",
            backgroundColor: "#c11554",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
          }}
        >
          {loading ? "Loading..." : "Get recommendations"}
        </button>

        {error && <div style={{ marginTop: 10, color: "crimson" }}>{error}</div>}
      </form>

      {/* Results */}
      <h2 style={{ marginTop: 20 }}>Results</h2>
      {results.length === 0 ? (
        <p>No results yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {results.map((r, idx) => (
            <li
              key={r.recipeId ?? idx}
              style={{ padding: 12, border: "1px solid #eee", borderRadius: 8, marginBottom: 10 }}
            >
              <div>
                <strong>Recipe:</strong> {r.recipeTitle}
              </div>
              {r.explanation && <div style={{ marginTop: 6, color: "#555" }}>{r.explanation}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}