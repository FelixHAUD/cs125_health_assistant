import { useState } from 'react';

export default function Log() {
  const [exerciseType, setExerciseType] = useState('cardio');
  const [intensity, setIntensity] = useState('medium');
  const [duration, setDuration] = useState('');
  const [logs, setLogs] = useState([]);

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
    setDuration('');
    setExerciseType('cardio');
    setIntensity('medium');
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
                backgroundColor: '#f9f9f9'
              }}
            >
              <strong>{log.type === 'cardio' ? 'Cardio' : 'Weight Training'}</strong> - 
              <span style={{ marginLeft: '10px' }}>({log.intensity}, {log.duration} min)</span>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>{log.date}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
