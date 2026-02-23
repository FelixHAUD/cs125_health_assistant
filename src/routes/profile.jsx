import { useEffect, useState } from "react";
import { LuHeartPulse } from "react-icons/lu";
import { MdBloodtype } from "react-icons/md";
import { GiFat } from "react-icons/gi";
import toast from "react-hot-toast";

const GOAL_OPTIONS = [
  "I want to lose weight and become more lean.",
  "I want to maintain my weight, but change fat to muscle.",
  "I want to gain muscle (and weight along with that).",
];

const BUDGET_OPTIONS = ["cheap", "moderate", "expensive"];
const CALORIE_OPTIONS = ["low", "medium", "high"];
const HEALTH_OPTIONS = ["light", "balanced", "indulgent"];
const DIETARY_OPTIONS = [
  "vegetarian",
  "vegan",
  "gluten_free",
  "dairy_free",
  "keto",
];

function Profile() {
  // -------------------------
  // User state
  // -------------------------
  const [user, setUser] = useState({
    name: "John Doe",
    age: 21,
    heightFt: 5,
    heightIn: 10,
    weight: 160,
    goal: "",
    budget: "moderate",
    caloriePref: "medium",
    healthLevel: "balanced",
    dietaryRestrictions: [],
  });

  // -------------------------
  // Vitals state (simulated)
  // -------------------------
  const [vitals, setVitals] = useState({
    heartrate: 72,
    bpSys: 120,
    bpDia: 80,
    bfPct: 15.6,
  });

  const [saving, setSaving] = useState(false);

  // -------------------------
  // Load profile
  // -------------------------
  useEffect(() => {
    fetch("/api/profile")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          setUser((prev) => ({
            ...prev,
            ...data.user,
            goal: data.user.goal || GOAL_OPTIONS[0],
          }));
        }
        if (data?.vitals) setVitals(data.vitals);
      })
      .catch((e) => console.error("Fetch /api/profile failed:", e));
  }, []);

  // -------------------------
  // Handlers
  // -------------------------
  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoalChange = (e) => {
    setUser((prev) => ({ ...prev, goal: e.target.value }));
  };

  const handleDietaryChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (o) => o.value);
    setUser((prev) => ({ ...prev, dietaryRestrictions: selected }));
  };

  const handleSave = () => {
    setSaving(true);
    const payload = { user, vitals, goalOptions: GOAL_OPTIONS };

    fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(() => toast.success("Profile saved!"))
      .catch((e) => {
        console.error("PUT /api/profile failed:", e);
        toast.error("Failed to save profile");
      })
      .finally(() => setSaving(false));
  };

  // -------------------------
  // Computed values
  // -------------------------
  const heightTotalInches =
    parseInt(user.heightFt || 0) * 12 + parseInt(user.heightIn || 0);
  const bmiValue =
    heightTotalInches > 0
      ? (
          (703 * parseInt(user.weight || 0)) /
          (heightTotalInches * heightTotalInches)
        ).toFixed(1)
      : 0;

  // -------------------------
  // Render
  // -------------------------
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h1>Profile</h1>

      {/* Basic Info */}
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
            style={{ width: "120px" }}
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
              value={user.heightFt}
              onChange={handleUserChange}
              className="input-field short"
            />
            <span>'</span>
            <input
              type="number"
              name="heightIn"
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

      {/* Vitals */}
      <h2>Vitals</h2>
      <span className="subtitle">Simulated data for demo purposes</span>
      <div className="info-list">
        <label className="info-line">
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <LuHeartPulse className="icon" /> Heart rate
          </span>
          <div>{vitals.heartrate} bpm</div>
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
          <div>{vitals.bfPct}%</div>
        </label>
      </div>

      {/* Goals */}
      <h2>Goals</h2>
      <select name="goal" value={user.goal} onChange={handleGoalChange}>
        {GOAL_OPTIONS.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>

      {/* Facet Preferences */}
      <h2>Preferences</h2>
      <div className="info-list">
        <label className="info-line">
          <span>Budget</span>
          <select name="budget" value={user.budget} onChange={handleUserChange}>
            {BUDGET_OPTIONS.map((b) => (
              <option key={b} value={b}>
                {b.charAt(0).toUpperCase() + b.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label className="info-line">
          <span>Calorie Preference</span>
          <select
            name="caloriePref"
            value={user.caloriePref}
            onChange={handleUserChange}
          >
            {CALORIE_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label className="info-line">
          <span>Health Level</span>
          <select
            name="healthLevel"
            value={user.healthLevel}
            onChange={handleUserChange}
          >
            {HEALTH_OPTIONS.map((h) => (
              <option key={h} value={h}>
                {h.charAt(0).toUpperCase() + h.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <label className="info-line">
          <span>Dietary Restrictions</span>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              marginTop: "4px",
            }}
          >
            {DIETARY_OPTIONS.map((d) => (
              <label
                key={d}
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <input
                  type="checkbox"
                  value={d}
                  checked={user.dietaryRestrictions.includes(d)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setUser((prev) => {
                      const newList = checked
                        ? [...prev.dietaryRestrictions, d]
                        : prev.dietaryRestrictions.filter((x) => x !== d);
                      return { ...prev, dietaryRestrictions: newList };
                    });
                  }}
                />
                {d.replace("_", " ")}
              </label>
            ))}
          </div>
        </label>
      </div>

      {/* Save */}
      <div style={{ marginTop: "16px" }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            backgroundColor: "#c11554",
            color: "#ffffff",
            border: "none",
            padding: "8px 14px",
            borderRadius: "6px",
            cursor: saving ? "not-allowed" : "pointer",
          }}
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </main>
  );
}

export default Profile;
