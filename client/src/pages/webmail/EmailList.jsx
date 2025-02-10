import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EmailList.css';
import DOMPurify from 'dompurify';
import { useAuth } from '../../contexts/AuthContext';

const EmailList = ({ type, searchQuery }) => {
  const { userEmail, sessionToken } = useAuth();
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [summary, setSummary] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Current folder type:', type);
    fetchEmails();
  }, [type, searchQuery]);

  const fetchEmails = async () => {
    try {
      setLoading(true);


      const response = await axios.get(`${import.meta.env.VITE_TM_API_URL}/api/emails/${type}`, {
        params: {
          email: userEmail,
          token: sessionToken,
          q: searchQuery
        }
      });
      console.log('Received emails:', response.data.length);
      setEmails(response.data);
    } catch (error) {
      console.error('Failed to fetch emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const isThisYear = date.getFullYear() === now.getFullYear();
    if (isThisYear) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatEmailAddress = (address) => {
    const match = address.match(/"?([^"<]+)"?\s*<?([^>]*)>?/);
    if (match) {
      const [, name, email] = match;
      return name.trim() || email.trim();
    }
    return address;
  };

  const formatEmailContent = (content) => {
    if (!content) return '';

    // Remove email forwarding marks
    content = content.replace(/>\s*>/g, '');

    // Convert plain text URLs to clickable links
    content = content.replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Convert line breaks to <br> tags
    content = content.replace(/\n/g, '<br>');

    // Sanitize the HTML
    return DOMPurify.sanitize(content);
  };

  const generateSummary = (content) => {
    if (!content) return '';

    // Clean the content
    let text = content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .trim();

    // Split into sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];

    // Score sentences based on word frequency
    const wordFrequency = {};
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];

    words.forEach(word => {
      // Ignore common words
      if (word.length > 3) { // Skip short words
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });

    // Score each sentence
    const sentenceScores = sentences.map(sentence => {
      const sentenceWords = sentence.toLowerCase().match(/\b\w+\b/g) || [];
      const score = sentenceWords.reduce((total, word) =>
        total + (wordFrequency[word] || 0), 0);
      return { sentence, score };
    });

    // Get top 3 sentences
    const topSentences = sentenceScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.sentence.trim());

    return topSentences.join(' ');
  };

  const handleReply = async (e) => {
    e.stopPropagation();
    if (selectedEmail) {
      try {
        // Extract email from "From" field
        const fromMatch = selectedEmail.from.match(/<(.+?)>/) || [null, selectedEmail.from];
        const replyTo = fromMatch[1];

        // Format reply subject
        const subject = selectedEmail.subject.startsWith('Re:')
          ? selectedEmail.subject
          : `Re: ${selectedEmail.subject}`;

        // Format reply body with quote
        const replyBody = `\n\nOn ${formatDate(selectedEmail.date)}, ${selectedEmail.from} wrote:\n> ${selectedEmail.body.split('\n').join('\n> ')
          }`;

        // Navigate to compose with pre-filled data
        navigate('/compose', {
          state: {
            to: replyTo,
            subject,
            body: replyBody,
            isReply: true
          }
        });
      } catch (error) {
        console.error('Failed to prepare reply:', error);
        alert('Failed to prepare reply');
      }
    }
  };

  const handleForward = (e) => {
    e.stopPropagation();
    if (selectedEmail) {
      try {
        // Format forward subject
        const subject = selectedEmail.subject.startsWith('Fwd:')
          ? selectedEmail.subject
          : `Fwd: ${selectedEmail.subject}`;

        // Format forwarded message with headers
        const forwardBody = `
---------- Forwarded message ---------
From: ${selectedEmail.from}
Date: ${formatDate(selectedEmail.date)}
Subject: ${selectedEmail.subject}

${selectedEmail.body}`;

        // Navigate to compose with pre-filled data
        navigate('/compose', {
          state: {
            subject,
            body: forwardBody,
            isForward: true
          }
        });
      } catch (error) {
        console.error('Failed to prepare forward:', error);
        alert('Failed to prepare forward');
      }
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (selectedEmail && window.confirm('Are you sure you want to delete this message?')) {
      try {
        console.log('Deleting email:', selectedEmail.id);

        const response = await axios.delete(
          `${import.meta.env.VITE_TM_API_URL}/api/emails/${selectedEmail.id}`,
          {
            params: {
              email: userEmail,
              token: sessionToken,
              folder: type // 'inbox' or 'sent'
            }
          }
        );

        if (response.data.success) {
          // Remove from local state
          setEmails(prevEmails =>
            prevEmails.filter(email => email.id !== selectedEmail.id)
          );
          setSelectedEmail(null);

          // Show success message
          const message = type === 'sent' ?
            'Message moved to trash' :
            'Conversation moved to trash';
          alert(message);
        } else {
          throw new Error('Failed to delete email');
        }
      } catch (error) {
        console.error('Failed to delete email:', error);
        alert('Failed to delete email. Please try again.');
      }
    }
  };

  const handleSummarize = (e) => {
    e.stopPropagation();
    if (selectedEmail) {
      const summary = generateSummary(selectedEmail.body);
      setSummary(summary);
      setShowSummary(true);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="email-container">
      <div className="email-list">
        <div className="email-list-header">
          <h2>{ type.charAt(0).toUpperCase() + type.slice(1) }</h2>
          <span className="email-count">{ emails.length } messages</span>
        </div>
        <div className='main-mail-wrapper scroll'>
          { emails.map((email) => (
            <div
              key={ email.id }
              className={ `email-item ${selectedEmail?.id === email.id ? 'selected' : ''}` }
              onClick={ () => setSelectedEmail(email) }
            >
              <div className="email-sender">{ formatEmailAddress(email.from) }</div>
              <div className="email-content-preview">
                <div className="email-subject">{ email.subject }</div>
                <div className="email-snippet">{ email.snippet }</div>
              </div>
              <div className="email-date">{ formatDate(email.date) }</div>
            </div>
          )) }
        </div>
      </div>
      { selectedEmail && (
        <div className="email-detail">
          <div className="email-detail-header">
            <h3>{ selectedEmail.subject }</h3>
            <div className="email-detail-meta">
              <div className="meta-item">
                <span className="meta-label">From:</span>
                <span className="meta-value">{ formatEmailAddress(selectedEmail.from) }</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Date:</span>
                <span className="meta-value">{ formatDate(selectedEmail.date) }</span>
              </div>
            </div>
          </div>
          <div className="email-actions">
            <button className="email-action-btn" onClick={ handleReply }>
              <i className="fas fa-reply"></i>
              Reply
            </button>
            <button className="email-action-btn" onClick={ handleForward }>
              <i className="fas fa-share"></i>
              Forward
            </button>
            <button className="email-action-btn" onClick={ handleDelete }>
              <i className="fas fa-trash"></i>
              Delete
            </button>
            <button
              className="email-action-btn"
              onClick={ handleSummarize }
            >
              <i className="fas fa-compress-alt"></i>
              { showSummary ? 'Show Full' : 'Summarize' }
            </button>
          </div>
          <div className="email-detail-body scroll">
            { showSummary ? (
              <div className="email-summary">
                <h4>Summary</h4>
                <p>{ summary }</p>
                <button
                  className="show-full-btn"
                  onClick={ () => setShowSummary(false) }
                >
                  Show Full Email
                </button>
              </div>
            ) : (
              <div
                className="email-content"
                dangerouslySetInnerHTML={ {
                  __html: formatEmailContent(selectedEmail.body)
                } }
              />
            ) }
          </div>
        </div>
      ) }
    </div>
  );
};

export default EmailList; 