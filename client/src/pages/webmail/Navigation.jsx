import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  return (
    <nav className="nav-sidebar">
      <div className="nav-header">Gmail Client</div>
      <Link to="/compose" className="compose-button">Compose</Link>
      <ul className="nav-links">
        <li>
          <Link to="/" className="nav-link">Inbox</Link>
        </li>
        <li>
          <Link to="/sent" className="nav-link">Sent</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation; 