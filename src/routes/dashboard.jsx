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

  // figure out which mealtime to suggest
  const mealLabel = chooseNextMeal();
  const apiEndpoint = mealLabel === "breakfast tomorrow" ? "breakfast" : mealLabel;

  // state for recipes and user name
  const [recipes, setRecipes] = useState([]);
  const [userName, setUserName] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // hook to fetch recipes and user profile on mount
  useEffect(() => {
    const fetchRecipes = fetch(`/api/${apiEndpoint}`) 
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setRecipes(data);
        // Initially show the first recipe while personalized recommendation loads
        if (data && data.length > 0 && !chosenRecipe) {
          setChosenRecipe(data[0]);
        }
      })
      .catch((e) => console.error(`Fetch /api/${apiEndpoint} failed:`, e));

    const fetchProfile = fetch("/api/profile")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data?.user?.name) setUserName(data.user.name);
        if (data?.user) setUserProfile(data.user);
      })
      .catch((e) => console.error("Fetch /api/profile failed:", e));

    Promise.all([fetchRecipes, fetchProfile])
      .finally(() => setLoading(false));
  }, []);

  // call recommendation API to get top recipe for this mealtime
  const [chosenRecipe, setChosenRecipe] = useState(null);
  useEffect(() => {
    if (recipes.length === 0) return;

    const userContext = {
      mealType: apiEndpoint,
      goals: [],
      budget: userProfile?.budget || "cheap", // Default to cheap if not set
    };

    // 1. Use persisted preferences if available
    if (userProfile?.caloriePref) {
      userContext.caloriePref = userProfile.caloriePref;
    }
    if (userProfile?.highProtein) {
      userContext.goals.push("high_protein");
    }

    // 2. Fallback: If preferences are missing (not saved yet), infer from goal string
    if (userProfile?.goal) {
      const goal = userProfile.goal.toLowerCase();
      
      // Infer low calorie if not explicitly set
      if (!userContext.caloriePref && goal.includes("lose weight")) {
        userContext.caloriePref = "low";
      }
      
      // Infer high protein if preference field is completely missing (undefined)
      // (If user explicitly saved "highProtein: false", we respect that)
      if (userProfile.highProtein === undefined && goal.includes("gain muscle")) {
        userContext.goals.push("high_protein");
      }
    }

    fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userContext),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data.results) && data.results.length > 0) {
          // The recommendation API returns { recipeId, recipeTitle, score, explanation }
          // We need to look up the full recipe object from our 'recipes' list
          const topRecId = data.results[0].recipeId;
          const fullRecipe = recipes.find(r => String(r.id) === String(topRecId));
          
          if (fullRecipe) {
            // Merge explanation
            setChosenRecipe({ ...fullRecipe, explanation: data.results[0].explanation });
          } else {
            // If we can't find it in the current list, fallback or use what we have
            // (Note: this shouldn't happen if indexes are consistent)
             console.warn("Recommended recipe not found in current meal list", topRecId);
             setChosenRecipe(recipes[0]);
          }
        } else {
          setChosenRecipe(recipes[0]); // fallback to first recipe if no recommendations
        }
      })
      .catch((e) => console.error("Fetch /api/recommend failed:", e));
  }, [recipes, apiEndpoint, userProfile]);

  if (loading) {
    return <main><h1>Dashboard</h1><p>Loading...</p></main>;
  }


  return (
    <main>
      <h1>Dashboard</h1>
      <span className="db-name">Welcome, {userName}!</span>
      <p>It is <b>{time}</b> on <b>{today}</b>.</p>
      <h2>Recommended meal</h2>
      <p>Your recommended meal is <b>{chosenRecipe?.title}</b>, to be had for <i>{mealLabel}</i>.</p>
      {chosenRecipe?.explanation && (
        <p style={{ fontSize: "0.9em", color: "#666", marginTop: "-10px" }}>
          <i>Reason: {chosenRecipe.explanation}</i>
        </p>
      )}
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