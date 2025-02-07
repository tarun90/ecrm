import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './ComposeEmail.css';
import EmailSuggestions from './EmailSuggestions';
import { useAuth } from '../../contexts/AuthContext';
const ComposeEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userEmail, sessionToken } = useAuth();
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentContacts, setRecentContacts] = useState([]);

  useEffect(() => {
    if (location.state) {
      const { to, subject, body, isReply, isForward } = location.state;
      if (to) setTo(to);
      if (subject) setSubject(subject);
      if (body) {
        setMessage(body);
        const textarea = document.querySelector('.compose-body textarea');
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(0, 0);
        }
      }
    }
  }, [location.state]);

  useEffect(() => {
    const fetchRecentContacts = async () => {
      try {
        console.log('Fetching contacts with:', { userEmail, sessionToken });
        const response = await axios.get(`${import.meta.env.VITE_TM_API_URL}/api/emails/contacts`, {
          params: {
            email: userEmail,
            token: sessionToken
          }
        });
        console.log('Received contacts:', response.data);
        if (Array.isArray(response.data)) {
          setRecentContacts(response.data);
        } else {
          console.error('Received invalid contacts data:', response.data);
        }
      } catch (error) {
        console.error('Failed to fetch contacts:', error);
      }
    };

    if (userEmail && sessionToken) {
      fetchRecentContacts();
    }
  }, [userEmail, sessionToken]);

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleRecipientChange = (e) => {
    const value = e.target.value;
    setTo(value);
    console.log('Recipient input changed:', value);
    
    if (value.trim()) {
      try {
        const searchTerm = value.toLowerCase();
        console.log('Filtering contacts with term:', searchTerm);
        console.log('Available contacts:', recentContacts);
        
        const filtered = recentContacts.filter(contact => {
          if (!contact || typeof contact !== 'object') return false;
          
          const emailMatch = contact.email?.toLowerCase().includes(searchTerm);
          const nameMatch = contact.name?.toLowerCase().includes(searchTerm);
          return emailMatch || nameMatch;
        });
        
        console.log('Filtered contacts:', filtered);
        setSuggestions(filtered);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error filtering contacts:', error);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    console.log('Selected suggestion:', suggestion);
    setTo(suggestion.email);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.compose-field')) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSending(true);
      await axios.post(`${import.meta.env.VITE_TM_API_URL}/api/emails/send`, {
        to,
        subject,
        message,
        email: userEmail,
        token: sessionToken
      });
      alert('Mail Send Successfully.');

      navigate('/webmail-setup')

    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (to || subject || message) {
      if (window.confirm('Discard draft?')) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  const composerClass = `compose-container ${minimized ? 'minimized' : ''} ${
    fullscreen ? 'fullscreen' : ''
  }`;

  return (
    <div className={composerClass}>
      <div className="compose-header">
        <h2>New Message</h2>
        <div className="compose-controls">
          <button 
            className="control-btn" 
            onClick={() => setMinimized(!minimized)}
            title={minimized ? 'Maximize' : 'Minimize'}
          >
            <i className={`fas fa-${minimized ? 'expand' : 'minus'}`}></i>
          </button>
          <button 
            className="control-btn" 
            onClick={() => setFullscreen(!fullscreen)}
            title={fullscreen ? 'Exit full screen' : 'Full screen'}
          >
            <i className={`fas fa-${fullscreen ? 'compress' : 'expand-arrows-alt'}`}></i>
          </button>
          <button 
            className="control-btn" 
            onClick={handleClose}
            title="Close"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="compose-field">
          <label>To:</label>
          <div className="input-wrapper">
            <input
              type="email"
              value={to}
              onChange={handleRecipientChange}
              onFocus={() => {
                console.log('Input focused, current value:', to);
                if (to.trim()) setShowSuggestions(true);
              }}
              required
              placeholder="Recipients"
            />
            <EmailSuggestions
              suggestions={suggestions}
              onSelect={handleSuggestionSelect}
              visible={showSuggestions}
            />
          </div>
        </div>
        <div className="compose-field">
          <label>Subject:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            placeholder="Subject"
          />
        </div>
        <div className="compose-body">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            placeholder="Write your message here..."
          />
        </div>
        <div className="compose-footer">
          <div className="compose-actions">
            <button 
              type="submit" 
              className="send-btn" 
              disabled={sending}
            >
              {sending ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Sending...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  Send
                </>
              )}
            </button>
            <button 
              type="button" 
              className="discard-btn"
              onClick={handleClose}
            >
              <i className="fas fa-trash"></i>
              Discard
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ComposeEmail; 