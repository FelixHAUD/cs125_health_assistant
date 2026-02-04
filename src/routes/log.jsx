import { useState, useEffect } from 'react';

export default function Log() {
  const [exerciseType, setExerciseType] = useState('cardio');
  const [intensity, setIntensity] = useState('medium');
  const [duration, setDuration] = useState('');
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch('/api/exercises')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setLogs(data);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!duration) {
      alert('Please enter a duration');
      return;
    }
    
    const newLog = {
      id: Date.now(),
      type: exerciseType,
      intensity,
      duration: parseInt(duration),
      date: new Date().toLocaleString(),
    };
    
    setLogs([newLog, ...logs]);
    
    fetch('/api/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLog)
    }).catch(err => console.error("Failed to save log:", err));

    setDuration('');
    setExerciseType('cardio');
    setIntensity('medium');
  };

  const handleRemove = (id) => {
    setLogs(logs.filter(log => log.id !== id));
    fetch(`/api/exercises/${id}`, { method: 'DELETE' })
      .catch(err => console.error("Failed to delete log:", err));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Exercise Logger</h1>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Exercise Type:
            <select 
              value={exerciseType} 
              onChange={(e) => setExerciseType(e.target.value)}
              style={{ marginLeft: '10px', padding: '5px' }}
            >
              <option value="cardio">Cardio</option>
              <option value="weightTraining">Weight Training</option>
            </select>
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            Intensity:
            <select 
              value={intensity} 
              onChange={(e) => setIntensity(e.target.value)}
              style={{ marginLeft: '10px', padding: '5px' }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            Duration (minutes):
            <input 
              type="number" 
              value={duration} 
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Enter duration"
              style={{ marginLeft: '10px', padding: '5px' }}
              min="1"
            />
          </label>
        </div>

        <button type="submit" style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}>
          Log Exercise
        </button>
      </form>

      <h2>Exercise History</h2>
      {logs.length === 0 ? (
        <p>No exercises logged yet!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {logs.map((log) => (
            <li 
              key={log.id} 
              style={{ 
                padding: '10px', 
                marginBottom: '10px', 
                border: '1px solid #e0e0e0', 
                borderRadius: '4px',
                backgroundColor: '#f9f9f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <strong>{log.type === 'cardio' ? 'Cardio' : 'Weight Training'}</strong> - 
                <span style={{ marginLeft: '10px' }}>({log.intensity}, {log.duration} min)</span>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>{log.date}</div>
              </div>
              <button 
                onClick={() => handleRemove(log.id)}
                style={{
                  backgroundColor: '#ff4d4d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
