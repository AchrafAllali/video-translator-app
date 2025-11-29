import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🎬 VideoTranslator AI
        </Link>
        
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">Accueil</Link>
          </li>
          <li className="nav-item">
            <Link to="/translate" className="nav-link">Traduire</Link>
          </li>
          <li className="nav-item">
            <Link to="/guide" className="nav-link">Guide</Link>
          </li>
          <li className="nav-item">
            <Link to="/history" className="nav-link">Historique</Link>
          </li>
        </ul>

        <div className="navbar-right">
          <div className="user-menu">
            <User size={20} />
            <span>{user?.name || user?.email}</span>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;