import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2, ChevronDown, Video, Link, Copy, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import type { CalendarEvent } from '../lib/google-calendar';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: CalendarEvent | Omit<CalendarEvent, 'id'>) => void;
  onDelete?: (eventId: string, deleteType: 'single' | 'future' | 'all') => void;
  selectedDate: Date;
  event?: CalendarEvent | null;
}

export function EventModal({ isOpen, onClose, onSubmit, onDelete, selectedDate, event }: EventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [recurrence, setRecurrence] = useState('');
  const [reminderMethod, setReminderMethod] = useState<'email' | 'popup'>('popup');
  const [reminderTime, setReminderTime] = useState('30');
  const [useDefaultReminder, setUseDefaultReminder] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const deleteOptionsRef = useRef<HTMLDivElement>(null);
  const [showMeetingLinkCopied, setShowMeetingLinkCopied] = useState(false);
  
  // Autocomplete states
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Check if the event is recurring (either existing or new)
  const isRecurringEvent = Boolean(event?.recurrence || event?.recurringEventId || recurrence);

  // Get previously used attendees from localStorage
  const getPreviousAttendees = (): string[] => {
    const stored = localStorage.getItem('previousAttendees');
    return stored ? JSON.parse(stored) : [];
  };

  // Save attendees to localStorage
  const savePreviousAttendees = (emails: string[]) => {
    const previous = new Set([...getPreviousAttendees(), ...emails]);
    localStorage.setItem('previousAttendees', JSON.stringify([...previous]));
  };

  // Reset all form states to their default values
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
    const handleClickOutside = (event: MouseEvent) => {
      if (deleteOptionsRef.current && !deleteOptionsRef.current.contains(event.target as Node)) {
        setShowDeleteOptions(false);
      }
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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
      ...(event && { id: event.id }),
      title,
      description,
      start,
      end,
      location,
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
    } catch (error: any) {
      setError(error.message || 'Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (deleteType: 'single' | 'future' | 'all') => {
    if (!event?.id || !onDelete) return;
    
    const messages = {
      single: 'Are you sure you want to delete this event?',
      future: 'Are you sure you want to delete this and all following events?',
      all: 'Are you sure you want to delete all events in this series?'
    };
    
    if (window.confirm(messages[deleteType])) {
      setIsDeleting(true);
      setError(null);
      try {
        await onDelete(event.id, deleteType);
        onClose();
      } catch (error: any) {
        setError(error.message || 'Failed to delete event');
      } finally {
        setIsDeleting(false);
        setShowDeleteOptions(false);
      }
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.trim()) {
      try {
        // Get suggestions from Google Contacts
        const contactSuggestions = await searchContacts(value);
        
        // Get previously used attendees
        const previousAttendees = getPreviousAttendees();
        
        // Combine and filter suggestions
        const allSuggestions = [...new Set([...contactSuggestions, ...previousAttendees])];
        const filtered = allSuggestions.filter(email => 
          email.toLowerCase().includes(value.toLowerCase()) &&
          !selectedAttendees.includes(email)
        );
        
        setSuggestions(filtered);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error getting suggestions:', error);
        // Fallback to local storage suggestions
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

  const addAttendee = (email: string) => {
    if (email && !selectedAttendees.includes(email)) {
      setSelectedAttendees([...selectedAttendees, email]);
      setInputValue('');
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const removeAttendee = (email: string) => {
    setSelectedAttendees(selectedAttendees.filter(a => a !== email));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {event ? 'Edit Event' : 'Create Event'}
          </h2>
          <div className="flex items-center gap-3">
            {event && onDelete && (
              <div className="relative" ref={deleteOptionsRef}>
                <button
                  type="button"
                  onClick={() => setShowDeleteOptions(!showDeleteOptions)}
                  disabled={isDeleting || isSubmitting}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                  <ChevronDown className={`w-4 h-4 ml-1 transform transition-transform ${showDeleteOptions ? 'rotate-180' : ''}`} />
                </button>
                
                {showDeleteOptions && (
                  <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu">
                      <button
                        type="button"
                        onClick={() => handleDelete('single')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                        role="menuitem"
                      >
                        Delete this event
                      </button>
                      {isRecurringEvent && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDelete('future')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                            role="menuitem"
                          >
                            Delete this and following events
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete('all')}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                            role="menuitem"
                          >
                            Delete all events in series
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="text"
                  value={format(selectedDate, 'MMMM d, yyyy')}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      if (e.target.value > endTime) {
                        setEndTime(e.target.value);
                      }
                    }}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    min={startTime}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Repeat</label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {recurrenceOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add description"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Attendees</label>
                <div className="min-h-[42px] flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
                  {selectedAttendees.map((email) => (
                    <div
                      key={email}
                      className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-md"
                    >
                      <span className="text-sm">{email}</span>
                      <button
                        type="button"
                        onClick={() => removeAttendee(email)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      if (inputValue.trim()) {
                        setShowSuggestions(true);
                      }
                    }}
                    className="flex-1 min-w-[200px] outline-none border-none p-1"
                    placeholder="Add attendees..."
                  />
                </div>
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg"
                  >
                    {suggestions.map((email) => (
                      <button
                        key={email}
                        type="button"
                        onClick={() => addAttendee(email)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                      >
                        {email}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {event?.meetingLink && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Google Meet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={event.meetingLink}
                      readOnly
                      className="flex-1 bg-white px-3 py-1.5 text-sm border border-blue-200 rounded-md"
                    />
                    <button
                      type="button"
                      onClick={copyMeetingLink}
                      className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
                      title="Copy link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <a
                      href={event.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-md transition-colors"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  {showMeetingLinkCopied && (
                    <p className="text-sm text-blue-600 mt-1">Meeting link copied!</p>
                  )}
                </div>
              )}

              {!event?.meetingLink && selectedAttendees.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                  <Video className="w-4 h-4" />
                  <span>A Google Meet link will be added automatically</span>
                </div>
              )}

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={!useDefaultReminder}
                    onChange={(e) => setUseDefaultReminder(!e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Custom reminder</span>
                </label>

                {!useDefaultReminder && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <select
                        value={reminderMethod}
                        onChange={(e) => setReminderMethod(e.target.value as 'email' | 'popup')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="popup">Notification</option>
                        <option value="email">Email</option>
                      </select>
                    </div>
                    <div>
                      <select
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        {reminderTimeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end items-center pt-6 border-t border-gray-200">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting || isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}