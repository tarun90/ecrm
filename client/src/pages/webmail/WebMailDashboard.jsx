import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import EmailList from './EmailList';
import ComposeEmail from './ComposeEmail';
import './WebMailDashboard.css';
import { EditOutlined, InboxOutlined, SearchOutlined, SendOutlined, SyncOutlined } from '@ant-design/icons';

const WebMailDashboard = () => {
  // const { userEmail, logout } = useAuth();
  const userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : {};
  const userEmail = userData?.email;
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeState, setActiveState] = useState("inbox")

  useEffect(() => {
    // Get search query from URL when component mounts
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
      setSearchQuery(q);
    }
  }, [location.search]);

  const isActive = (path) => {
    return activeState == path ? 'active' : '';
  };

  const changeActiveState = (newState) => {
    setActiveState(newState)
    setSearchQuery('');
  }

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      setActiveState(newState)
      setIsSearching(false);
    }
  };

  if (!userEmail) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="mail-dashboard">
      <aside className="sidebar">
        <div className="user-info">
          <span className="user-email">{ userEmail }</span>

        </div>
        <div onClick={ () => { changeActiveState('compose') } } className="compose-btn">
          <EditOutlined />
          Compose
        </div>
        <nav className="nav-menu">
          <div onClick={ () => { changeActiveState('inbox') } } className={ `nav-item ${isActive('inbox')}` }>
            <InboxOutlined /> Inbox
          </div>
          <div onClick={ () => { changeActiveState('sent') } } className={ `nav-item ${isActive('sent')}` }>
            <SendOutlined /> Sent
          </div>
        </nav>
      </aside>
      <main className="main-content">
        <div className="search-bar">
          <form onSubmit={ handleSearch }>
            <input
              type="text"
              placeholder="Search emails..."
              value={ searchQuery }
              onChange={ (e) => setSearchQuery(e.target.value) }
              disabled={ isSearching }
            />
            <button className='close-btn' disabled={ isSearching }>
              { isSearching ? (
                <SyncOutlined spin />
              ) : (
                <SearchOutlined />
              ) }
            </button>
          </form>
        </div>
        {/* <Routes>  
          <Route path="/" element={<EmailList type="inbox" />} />
          <Route path="/sent" element={<EmailList type="sent" />} />
          <Route path="/webmail/search" element={<EmailList type="search" />} />
          <Route path="/webmail/compose" element={<ComposeEmail />} />
        </Routes> */}

        { activeState === 'inbox' && <EmailList type="inbox" searchQuery={ searchQuery } /> }
        { activeState === 'compose' && <ComposeEmail /> }
        { activeState === 'sent' && <EmailList type="sent" searchQuery={ searchQuery } /> }
        { activeState === 'search' && <EmailList type="search" searchQuery={ searchQuery } /> }

      </main>
    </div>
  );
};

export default WebMailDashboard; 