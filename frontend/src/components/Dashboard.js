import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import EmailList from './EmailList';
import ComposeEmail from './ComposeEmail';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { userEmail, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Get search query from URL when component mounts
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setSearchQuery(q);
    }
  }, [location.search]);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearching(false);
    }
  };

  if (!userEmail) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="user-info">
          <span className="user-email">{userEmail}</span>
          <button onClick={logout} className="logout-button">Logout</button>
        </div>
        <Link to="/compose" className="compose-btn">
          Compose
        </Link>
        <nav className="nav-menu">
          <Link to="/" className={`nav-item ${isActive('/')}`}>
            <i className="fas fa-inbox"></i> Inbox
          </Link>
          <Link to="/sent" className={`nav-item ${isActive('/sent')}`}>
            <i className="fas fa-paper-plane"></i> Sent
          </Link>
        </nav>
      </aside>
      <main className="main-content">
        <div className="search-bar">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isSearching}
            />
            <button type="submit" disabled={isSearching}>
              {isSearching ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-search"></i>
              )}
            </button>
          </form>
        </div>
        <Routes>
          <Route path="/" element={<EmailList type="inbox" />} />
          <Route path="/sent" element={<EmailList type="sent" />} />
          <Route path="/search" element={<EmailList type="search" />} />
          <Route path="/compose" element={<ComposeEmail />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard; 