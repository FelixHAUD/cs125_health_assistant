import { useState } from "react";
import { LuHeartPulse } from "react-icons/lu";
import { MdBloodtype } from "react-icons/md";
import { GiFat } from "react-icons/gi";

const GOAL_OPTIONS = [
  "I want to lose weight and become more lean.",
  "I want to maintain my weight, but change fat to muscle.",
  "I want to gain muscle (and weight along with that)."
]

function Profile() {
  // 1. Initialize state for Basic Info (Manual Inputs)
  const [user, setUser] = useState({
    name: "Ethan Yim",
    age: 21,
    heightFt: 5,
    heightIn: 10,
    weight: 160,
    goal: ""
  });

  // 2. Initialize state for Vitals (Simulated/Editable for Prototype)
  const [vitals, setVitals] = useState({
    heartrate: 72,
    bpSys: 120,
    bpDia: 80,
    bfPct: 15.6
  });

  // Helper function to handle changes for basic info
  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  // Helper function to handle changes for vitals
  const handleVitalChange = (e) => {
    const { name, value } = e.target;
    setVitals((prev) => ({ ...prev, [name]: value }));
  };

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
          <div>{7.03 * Math.round(100 * user.weight/((12 * user.heightFt + user.heightIn) * (12 * user.heightFt + user.heightIn)))}</div>
        </label>
      </div>

      <h2>Vitals</h2>
      <span className="subtitle">Simulated data...</span>
      
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
      <select name="goals">
        {GOAL_OPTIONS.map((x) => {
          return <option value={x}>{x}</option>
        })}
      </select>
    </main>
  );
}

export default Profile;