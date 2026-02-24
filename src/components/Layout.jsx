import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

export default function Layout() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="page-content">
        <Outlet />
      </main>
      <hr />
      <footer>
        Copyright © 2026 Felix Hallmann, Tyler Thiem & Ethan Yim. For CS 125 at UC Irvine.
      </footer>
    </div>
  );
}