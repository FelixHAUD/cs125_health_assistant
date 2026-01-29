import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', gap: '20px' }}>
      {/* Logo / Home */}
      <Link to="/" style={{ fontWeight: 'bold' }}>NutriLife</Link>
    
      <Link to="/">Dashboard</Link>
      <Link to="/profile">Profile</Link>
    </nav>
  );
}