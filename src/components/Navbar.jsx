import { Link } from 'react-router-dom';
import "./Navbar.css";
import { MdHealthAndSafety } from "react-icons/md";

export default function Navbar() {
  return (
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', gap: '20px' }}>
      {/* Logo / Home */}
      <Link to="/" style={{ fontWeight: 'bold', fontSize: '1.5rem', display: 'flex', alignItems: 'center' }}>
        {/* <MdHealthAndSafety style={{ marginRight: '0.5rem', fontSize: '2rem' }} /> */}
        <img src="/NUTRILIFE.png" style={{height: '2rem', marginRight: '0.5rem'}}/>
        <span>NutriLife</span>
      </Link>
    
      <Link to="/">Dashboard</Link>
      <Link to="/profile">Profile</Link>
    </nav>
  );
}