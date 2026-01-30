import { useEffect, useState } from "react";

function Dashboard() {
  const today = new Date().toLocaleDateString();
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const [breakfastRecipes, setBreakfastRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/breakfast") 
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setBreakfastRecipes)
      .catch((e) => console.error("Fetch /api/breakfast failed:", e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <main><h1>Dashboard</h1><p>Loading...</p></main>;
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Welcome, [name]</p>
      <p>It is {time} on {today}.</p>
      <p>Your recommended meal is {breakfastRecipes[0]?.title}, to be had for breakfast tomorrow morning.</p>
    </main>
  )
}

export default Dashboard;