import { useEffect, useState } from "react";

// Given time of day, choose which meal to suggest
const chooseNextMeal = () => {
  const hour = new Date().getHours();
  if (hour < 8) return "breakfast";
  if (hour < 12) return "lunch";
  if (hour < 20) return "dinner";
  return "breakfast tomorrow";
}

// Helper to parse the Python-style list string from the JSON
const parseIngredients = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val !== 'string') return [];
  // Remove brackets and split by "', '"
  const cleaned = val.replace(/^\[|\]$/g, '').trim();
  if (!cleaned) return [];
  return cleaned.split("', '").map(s => s.replace(/^'|'$/g, '').replace(/\\'/g, "'"));
};

function Dashboard() {

  // get date and time to display on dashboard
  const today = new Date().toLocaleDateString();
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // figure out which meal to suggest
  const mealLabel = chooseNextMeal();
  const apiEndpoint = mealLabel === "breakfast tomorrow" ? "breakfast" : mealLabel;

  // state for recipes and user name
  const [recipes, setRecipes] = useState([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  // hook to fetch recipes and user profile on mount
  useEffect(() => {
    const fetchRecipes = fetch(`/api/${apiEndpoint}`) 
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setRecipes)
      .catch((e) => console.error(`Fetch /api/${apiEndpoint} failed:`, e));

    const fetchProfile = fetch("/api/profile")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data?.user?.name) setUserName(data.user.name);
      })
      .catch((e) => console.error("Fetch /api/profile failed:", e));

    Promise.all([fetchRecipes, fetchProfile])
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <main><h1>Dashboard</h1><p>Loading...</p></main>;
  }

  // PLACEHOLDER!!!
  let chosenRecipe = recipes[0];

  return (
    <main>
      <h1>Dashboard</h1>
      <span className="db-name">Welcome, {userName}!</span>
      <p>It is <b>{time}</b> on <b>{today}</b>.</p>
      <h2>Recommended meal</h2>
      <p>Your recommended meal is <b>{chosenRecipe?.title}</b>, to be had for <i>{mealLabel}</i>.</p>
    <h3>Recipe</h3>
      <h4>Ingredients</h4>
      {chosenRecipe?.ingredients && (
        <ul>
        {parseIngredients(chosenRecipe.ingredients).map((ingredient, index) => (
          <li key={index}>{ingredient}</li>
        ))}
      </ul>
      )}
      <h4>Steps</h4>
      <ol>
        {chosenRecipe?.instructions.split(". ").map((step, index) => (
          <li key={index}>{step.trim()}.<br/></li>
        ))}
      </ol>
    </main>
  )
}

export default Dashboard;