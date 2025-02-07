import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2, ChevronDown, Video, Link, Copy, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import "./EventModal.css"

export function EventModal({ isOpen, onClose, onSubmit, onDelete, selectedDate, event }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [recurrence, setRecurrence] = useState('');
  const [reminderMethod, setReminderMethod] = useState('popup');
  const [reminderTime, setReminderTime] = useState('30');
  const [useDefaultReminder, setUseDefaultReminder] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const deleteOptionsRef = useRef(null);
  const [showMeetingLinkCopied, setShowMeetingLinkCopied] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedAttendees, setSelectedAttendees] = useState([]);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const isRecurringEvent = Boolean(event?.recurrence || event?.recurringEventId || recurrence);

  const getPreviousAttendees = () => {
    const stored = localStorage.getItem('previousAttendees');
    return stored ? JSON.parse(stored) : [];
  };

  const savePreviousAttendees = (emails) => {
    const previous = new Set([...getPreviousAttendees(), ...emails]);
    localStorage.setItem('previousAttendees', JSON.stringify([...previous]));
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartTime('09:00');
    setEndTime('10:00');
    setLocation('');
    setSelectedAttendees([]);
    setRecurrence('');
    setReminderMethod('popup');
    setReminderTime('30');
    setUseDefaultReminder(true);
    setError(null);
    setInputValue('');
    setShowDeleteOptions(false);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
      return;
    }

    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setStartTime(format(event.start, 'HH:mm'));
      setEndTime(format(event.end, 'HH:mm'));
      setLocation(event.location || '');
      setSelectedAttendees(event.attendees || []);
      setRecurrence(event.recurrence || '');
      setUseDefaultReminder(event.reminders?.useDefault ?? true);
      if (event.reminders?.overrides?.[0]) {
        setReminderMethod(event.reminders.overrides[0].method);
        setReminderTime(event.reminders.overrides[0].minutes.toString());
      }
    } else {
      resetForm();
    }
  }, [event, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deleteOptionsRef.current && !deleteOptionsRef.current.contains(event.target)) {
        setShowDeleteOptions(false);
      }
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const start = new Date(selectedDate);
    const [startHours, startMinutes] = startTime.split(':');
    start.setHours(parseInt(startHours), parseInt(startMinutes));

    const end = new Date(selectedDate);
    const [endHours, endMinutes] = endTime.split(':');
    end.setHours(parseInt(endHours), parseInt(endMinutes));

    const eventData = {
      id: event?.id || Date.now().toString(),
      title,
      description,
      start,
      end,
      location,
      eventId: event?.id,
      attendees: selectedAttendees,
      recurrence: recurrence || undefined,
      reminders: {
        useDefault: useDefaultReminder,
        overrides: !useDefaultReminder ? [{
          method: reminderMethod,
          minutes: parseInt(reminderTime),
        }] : undefined,
      },
    };

    try {
      await onSubmit(eventData);
      savePreviousAttendees(selectedAttendees);
      onClose();
    } catch (error) {
      setError(error.message || 'Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (deleteType) => {
    const eventId = event?.id;
    if (!eventId || !onDelete) {
      setError('Event ID or onDelete callback is missing');
      return;
    }

    const messages = {
      single: 'Are you sure you want to delete this event?',
      future: 'Are you sure you want to delete this and all following events?',
      all: 'Are you sure you want to delete all events in this series?',
    };

    if (window.confirm(messages[deleteType])) {
      setIsDeleting(true);
      setError(null);

      try {
        await onDelete(eventId, deleteType);
        const response = await fetch(`http://localhost:5000/api/events/${eventId}`, { method: 'DELETE' });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || 'Failed to delete event from MongoDB');
        }

        onClose();
      } catch (error) {
        setError(error.message || 'Failed to delete event');
      } finally {
        setIsDeleting(false);
        setShowDeleteOptions(false);
      }
    }
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.trim()) {
      try {
        const contactSuggestions = await searchContacts(value);
        const previousAttendees = getPreviousAttendees();
        const allSuggestions = [...new Set([...contactSuggestions, ...previousAttendees])];
        const filtered = allSuggestions.filter(email =>
          email.toLowerCase().includes(value.toLowerCase()) &&
          !selectedAttendees.includes(email)
        );

        setSuggestions(filtered);
        setShowSuggestions(true);
      } catch (error) {
        const previousAttendees = getPreviousAttendees();
        const filtered = previousAttendees.filter(email =>
          email.toLowerCase().includes(value.toLowerCase()) &&
          !selectedAttendees.includes(email)
        );
        setSuggestions(filtered);
        setShowSuggestions(true);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const addAttendee = (email) => {
    if (email && !selectedAttendees.includes(email)) {
      setSelectedAttendees([...selectedAttendees, email]);
      setInputValue('');
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const removeAttendee = (email) => {
    setSelectedAttendees(selectedAttendees.filter(a => a !== email));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      if (showSuggestions && suggestions.length > 0) {
        addAttendee(suggestions[0]);
      } else if (inputValue.includes('@')) {
        addAttendee(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && selectedAttendees.length > 0) {
      removeAttendee(selectedAttendees[selectedAttendees.length - 1]);
    }
  };

  const copyMeetingLink = async () => {
    if (event?.meetingLink) {
      try {
        await navigator.clipboard.writeText(event.meetingLink);
        setShowMeetingLinkCopied(true);
        setTimeout(() => setShowMeetingLinkCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy meeting link:', err);
      }
    }
  };

  const recurrenceOptions = [
    { value: '', label: 'No repeat' },
    { value: 'RRULE:FREQ=DAILY', label: 'Daily' },
    { value: 'RRULE:FREQ=WEEKLY', label: 'Weekly' },
    { value: 'RRULE:FREQ=MONTHLY', label: 'Monthly' },
    { value: 'RRULE:FREQ=YEARLY', label: 'Yearly' },
  ];

  const reminderTimeOptions = [
    { value: '0', label: 'At time of event' },
    { value: '5', label: '5 minutes before' },
    { value: '10', label: '10 minutes before' },
    { value: '15', label: '15 minutes before' },
    { value: '30', label: '30 minutes before' },
    { value: '60', label: '1 hour before' },
    { value: '120', label: '2 hours before' },
    { value: '1440', label: '1 day before' },
  ];

  return (
    <div className="modal-overlay">
    <div className="modal-container">
      <div className="modal-header">
        <h2 className="modal-title">{event ? 'Edit Event' : 'Create Event'}</h2>
        <div className="modal-actions">
          {event && onDelete && (
            <div className="delete-container" ref={deleteOptionsRef}>
              <button 
                className="delete-button"
                onClick={() => setShowDeleteOptions(!showDeleteOptions)} 
                disabled={isDeleting || isSubmitting}
              >
                <Trash2 className="delete-icon" /> 
                <span>Delete</span>
              </button>

              {showDeleteOptions && (
                <div className="delete-options">
                  <button className="delete-option" onClick={() => handleDelete('single')}>
                    Delete this event
                  </button>
                  {isRecurringEvent && (
                    <>
                      <button className="delete-option" onClick={() => handleDelete('future')}>
                        Delete this and following events
                      </button>
                      <button className="delete-option" onClick={() => handleDelete('all')}>
                        Delete all events in series
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form className="event-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Event Title</label>
          <input
            className="form-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Enter event title"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Date</label>
          <input
            className="form-input disabled"
            type="text"
            value={format(selectedDate, 'MMMM d, yyyy')}
            disabled
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Time</label>
            <input
              className="form-input"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">End Time</label>
            <input
              className="form-input"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              min={startTime}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Location</label>
          <input
            className="form-input"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Add location"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Attendees</label>
          <div className="attendees-container">
            <div className="attendees-input-wrapper">
              <input
                className="form-input"
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Enter attendee email"
                ref={inputRef}
              />
            </div>
            {selectedAttendees.length > 0 && (
              <div className="attendees-list">
                {selectedAttendees.map((attendee) => (
                  <div key={attendee} className="attendee-chip">
                    <span className="attendee-email">{attendee}</span>
                    <button
                      type="button"
                      className="remove-attendee"
                      onClick={() => removeAttendee(attendee)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {showSuggestions && suggestions.length > 0 && (
              <div className="suggestions-list" ref={suggestionsRef}>
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="suggestion-item"
                    onClick={() => addAttendee(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Repeat</label>
          <select 
            className="form-select"
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value)}
          >
            {recurrenceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Reminder</label>
          <div className="reminder-settings">
            <select
              className="form-select"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              disabled={useDefaultReminder}
            >
              {reminderTimeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>


        {event?.meetingLink && (
          <div className="meeting-link">
            <Link size={20} />
            <span className="meeting-link-text">{event.meetingLink}</span>
            <button
              type="button"
              className="copy-link-button"
              onClick={copyMeetingLink}
            >
              <Copy size={16} />
            </button>
            {showMeetingLinkCopied && (
              <span className="copied-message">Link copied!</span>
            )}
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting || isDeleting}
          >
            {isSubmitting ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  </div>
  );
}