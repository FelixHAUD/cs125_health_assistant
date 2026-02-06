import { useState } from "react";

export default function Search() {
  const [mealType, setMealType] = useState("breakfast");
  const [budget, setBudget] = useState("cheap");
  const [caloriePref, setCaloriePref] = useState("low");
  const [highProtein, setHighProtein] = useState(false);
  const [ingredients, setIngredients] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  async function handleGetRecs(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const userContext = {
      mealType,
      budget,
      caloriePref,
      goals: highProtein ? ["high_protein"] : [],
      ingredients:ingredients.trim() != "" ? ingredients.split(",").map((i) => i.trim()).filter(Boolean) : [],
    };

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
  }

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h1>Recipe Recommendations</h1>

      <form onSubmit={handleGetRecs} style={{ border: "1px solid #ccc", borderRadius: 8, padding: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <label>
            Meal type:
            <select value={mealType} onChange={(e) => setMealType(e.target.value)} style={{ marginLeft: 8 }}>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
            </select>
          </label>

          <label>
            Budget:
            <select value={budget} onChange={(e) => setBudget(e.target.value)} style={{ marginLeft: 8 }}>
              <option value="cheap">Cheap</option>
              <option value="moderate">Moderate</option>
              <option value="expensive">Expensive</option>
            </select>
          </label>

          <label>
            Calories:
            <select value={caloriePref} onChange={(e) => setCaloriePref(e.target.value)} style={{ marginLeft: 8 }}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={highProtein}
              onChange={(e) => setHighProtein(e.target.checked)}
            />
            High protein
          </label>
        </div>
        <div style={{ marginTop: 12 }}>
          <label>
            Ingredients (comma-separated):
            <input
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              style={{ marginLeft: 8, width: "60%" }}
              placeholder=""
            />
          </label>
        </div>

        <button type="submit" disabled={loading} style={{ marginTop: 12, padding: "8px 14px", backgroundColor: "#c11554", color: "#ffffff"}}>
          {loading ? "Loading..." : "Get recommendations"}
        </button>

        {error && <div style={{ marginTop: 10, color: "crimson" }}>{error}</div>}
      </form>

      <h2 style={{ marginTop: 20 }}>Results</h2>
      {results.length === 0 ? (
        <p>No results yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {results.map((r, idx) => (
            <li key={r.recipeId ?? idx} style={{ padding: 12, border: "1px solid #eee", borderRadius: 8, marginBottom: 10 }}>
              <div><strong>Recipe:</strong> {r.recipeTitle}</div>
              {r.explanation && <div style={{ marginTop: 6, color: "#555" }}>{r.explanation}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
