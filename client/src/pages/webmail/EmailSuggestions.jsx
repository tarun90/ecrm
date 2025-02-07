import React from 'react';
import './EmailSuggestions.css';

const EmailSuggestions = ({ suggestions, onSelect, visible }) => {
  if (!visible || !suggestions.length) return null;

  return (
    <div className="email-suggestions">
      {suggestions.map((suggestion, index) => (
        <div
          key={index}
          className="suggestion-item"
          onClick={() => onSelect(suggestion)}
        >
          <i className="fas fa-user"></i>
          <div className="suggestion-details">
            {suggestion.name ? (
              <>
                <div className="suggestion-name">{suggestion.name}</div>
                <div className="suggestion-email">{suggestion.email}</div>
              </>
            ) : (
              <div className="suggestion-email">{suggestion.email}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmailSuggestions; 