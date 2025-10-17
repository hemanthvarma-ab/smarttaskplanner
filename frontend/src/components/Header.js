// frontend/src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <h1>Smart Task Planner</h1>
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/my-plans" className="nav-link">My Plans</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;