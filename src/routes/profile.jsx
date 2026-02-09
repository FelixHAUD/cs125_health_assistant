import { useEffect, useState } from "react";
import { LuHeartPulse } from "react-icons/lu";
import { MdBloodtype } from "react-icons/md";
import { GiFat } from "react-icons/gi";
import toast from "react-hot-toast";

const GOAL_OPTIONS = [
  "I want to lose weight and become more lean.",
  "I want to maintain my weight, but change fat to muscle.",
  "I want to gain muscle (and weight along with that)."
]

function Profile() {
  // 1. Initialize state for Basic Info (Manual Inputs)
  const [user, setUser] = useState({
    name: "John Doe",
    age: 21,
    heightFt: 5,
    heightIn: 10,
    weight: 160,
    goal: "",
    budget: "cheap",
    caloriePref: "medium",
    highProtein: false
  });

  // 2. Initialize state for Vitals (Simulated/Editable for Prototype)
  const [vitals, setVitals] = useState({
    heartrate: 72,
    bpSys: 120,
    bpDia: 80,
    bfPct: 15.6
  });

  // State for saving status
  const [saving, setSaving] = useState(false);

  // Load in user profile
  useEffect(() => {
    fetch("/api/profile")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          setUser({
            ...data.user,
            goal: data.user.goal || (data.goalOptions?.[0] ?? GOAL_OPTIONS[0]),
            budget: data.user.budget || "cheap",
            caloriePref: data.user.caloriePref || "medium",
            highProtein: data.user.highProtein || false
          });
        }
        if (data?.vitals) setVitals(data.vitals);
      })
      .catch((e) => console.error("Fetch /api/profile failed:", e));
  }, []);

  // Helper function to handle changes for basic info
  const handleUserChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUser((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  // Helper function to handle changes for vitals
  // const handleVitalChange = (e) => {
  //   const { name, value } = e.target;
  //   setVitals((prev) => ({ ...prev, [name]: value }));
  // };

  // Helper function handle changes for vitals
  const handleGoalChange = (e) => {
    setUser((prev) => ({ ...prev, goal: e.target.value }));
  };

  //Save changes to json
  const handleSave = () => {
    setSaving(true);

    const payload = {
      user: { ...user, goal: user.goal || GOAL_OPTIONS[0] },
      vitals,
      goalOptions: GOAL_OPTIONS
    };

    fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(() => {
        toast.success("Profile saved!");
      })
      .catch((e) => {
        console.error("PUT /api/profile failed:", e);
        toast.error("Failed to save profile");
      })
      .finally(() => setSaving(false));
  };

  const heightTotalInches = (parseInt(user.heightFt || 0) * 12) + parseInt(user.heightIn || 0);
  const bmiValue = heightTotalInches > 0 
    ? ((703 * parseInt(user.weight || 0)) / (heightTotalInches * heightTotalInches)).toFixed(1)
    : 0;

  return (
    <main>
      <h1>Profile</h1>

      <h2>Basic Information</h2>
      <div className="info-list">
        
        <label className="info-line">
          <span>Name</span>
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleUserChange}
            className="input-field"
            style={{width: '120px'}}
          />
        </label>

        <label className="info-line">
          <span>Age</span>
          <input
            type="number"
            name="age"
            value={user.age}
            onChange={handleUserChange}
            className="input-field short"
          />
        </label>

        <label className="info-line">
          <span>Height</span>
          <div style={{ display: "flex", gap: "5px" }}>
            <input
              type="number"
              name="heightFt"
              placeholder="ft"
              value={user.heightFt}
              onChange={handleUserChange}
              className="input-field short"
            />
            <span>'</span>
            <input
              type="number"
              name="heightIn"
              placeholder="in"
              value={user.heightIn}
              onChange={handleUserChange}
              className="input-field short"
            />
            <span>"</span>
          </div>
        </label>

        <label className="info-line">
          <span>Weight (lb)</span>
          <input
            type="number"
            name="weight"
            value={user.weight}
            onChange={handleUserChange}
            className="input-field short"
          />
        </label>

        <label className="info-line">
          <span>BMI</span>
          <div>{bmiValue}</div>
        </label>
      </div>

      <h2>Vitals</h2>
      <span className="subtitle">Data fetched from Apple Health 23 min ago... (just kidding, simulated data)</span>
      
      <div className="info-list">
        <label className="info-line">
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <LuHeartPulse className="icon" /> Heart rate
          </span>
          <div>
            {vitals.heartrate} bpm
          </div>
        </label>

        <label className="info-line">
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MdBloodtype className="icon" /> Blood pressure
          </span>
          <div>
            {vitals.bpSys}/{vitals.bpDia}
          </div>
        </label>

        <label className="info-line">
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <GiFat className="icon" /> Body fat (%)
          </span>
          <div>
            {vitals.bfPct}%
          </div>
        </label>
      </div>

      <h2>Goals</h2>
      <select name="goals" value={user.goal} onChange={handleGoalChange} className="input-field" style={{ width: "100%" }}>
        {GOAL_OPTIONS.map((x) => {
          return <option key={x} value={x}>{x}</option>
        })}
      </select>

      <h2>Meal Preferences</h2>
      <div className="info-list">
        <label className="info-line">
          <span>Budget</span>
          <select name="budget" value={user.budget} onChange={handleUserChange} className="input-field">
            <option value="cheap">Cheap</option>
            <option value="moderate">Moderate</option>
            <option value="expensive">Expensive</option>
          </select>
        </label>

        <label className="info-line">
          <span>Calorie Level</span>
          <select name="caloriePref" value={user.caloriePref} onChange={handleUserChange} className="input-field">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        <label className="info-line" style={{ justifyContent: "flex-start", gap: "10px" }}>
          <span>High Protein Required</span>
          <input
            type="checkbox"
            name="highProtein"
            checked={user.highProtein}
            onChange={handleUserChange}
            style={{ width: "20px", height: "20px" }}
          />
        </label>
      </div>

      <div style={{ marginTop: "16px"}}>
        <button style={{
          backgroundColor: "#c11554", 
          color: "#ffffff", 
          border: "none", 
          padding: "8px 14px",
          borderRadius: "6px",
          cursor: saving ? "not-allowed" : "pointer"
  }} onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </main>
  );
}

export default Profile;