import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '🏠 Accueil' },
    { path: '/translate', label: '🎬 Traduction' },
    { path: '/history', label: '📊 Historique' },
    { path: '/guide', label: '📚 Guide' }
  ];

  return (
    <nav className="nav-container">
      <div className="nav-content">
        <div className="nav-logo">
          🎬 Traducteur Vidéo Pro
        </div>
        <div className="nav-menu">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;