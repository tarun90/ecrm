import React, { useEffect, useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar as CalendarIcon, LogIn, AlertCircle, List } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { EventModal } from './EventModal';
import {
  authenticate,
  initializeGoogleCalendar,
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../../lib/google-calendar';
import "./EvenetManager.css"
import MainLayout from '../../components/MainLayout';
import { Layout } from 'antd';

function EventManager() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewType, setViewType] = useState('calendar');

  const fetchEvents = useCallback(async () => {
    try {
      const events = await listEvents();
      setEvents(events);
      setIsLoading(false);
      setError(null);
    } catch (error) {
      const message = error?.message || 'Failed to fetch events';
      console.error('Error fetching events:', error);
      setError(message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeGoogleCalendar();
        setError(null);
      } catch (error) {
        const message = error?.message || 'Failed to initialize Google Calendar';
        console.error('Failed to initialize Google Calendar:', error);
        setError(message);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents();
      const interval = setInterval(fetchEvents, 30 * 1000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchEvents]);

  const handleAuth = async () => {
    try {
      await authenticate();
      setIsAuthenticated(true);
      setError(null);
      toast.success('Successfully connected to Google Calendar');
    } catch (error) {
      const message = error?.message || 'Authentication failed';
      console.error('Authentication error:', error);
      setError(message);
      toast.error('Failed to connect to Google Calendar');
    }
  };

  const handleDateClick = (arg) => {
    setSelectedDate(arg.date);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (arg) => {
    const event = events.find((e) => e.id === arg.event.id);
    if (event) {
      setSelectedEvent(event);
      setSelectedDate(event.start);
      setIsModalOpen(true);
    }
  };

  const handleEventCreate = async (eventData) => {
    try {
      const newEvent = await createEvent(eventData);

      if (!newEvent || !newEvent.id) {
        throw new Error('Google Calendar did not return an event ID');
      }

      const fullEvent = {
        ...eventData,
        EventId: newEvent.id,
      };

      const response = await fetch(`${import.meta.env.VITE_TM_API_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fullEvent),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save event to MongoDB');
      }

      setEvents((prev) => [...prev, fullEvent]);

      toast.success('Event created successfully');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(error.message || 'Failed to create event');
    }
  };

  const handleEventUpdate = async (eventData) => {
    try {
      const updatedEvent = await updateEvent(eventData);

      if (!updatedEvent || !updatedEvent.id) {
        throw new Error('Failed to retrieve updated event ID from Google Calendar');
      }

      const response = await fetch(`${import.meta.env.VITE_TM_API_URL}/api/events/${eventData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEvent),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update event in MongoDB');
      }

      setEvents((prev) => prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)));

      toast.success('Event updated successfully');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error(error.message || 'Failed to update event');
    }
  };

  const handleEventDelete = async (eventId, deleteType) => {
    try {
      await deleteEvent(eventId, deleteType);
      await fetchEvents();
      toast.success('Event deleted successfully');
      setIsModalOpen(false);
    } catch (error) {
      const message = error?.message || 'Failed to delete event';
      console.error('Error deleting event:', error);
      toast.error(message);
    }
  };

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <AlertCircle className="error-icon" />
          <h2 className="error-title">Calendar Error</h2>
          <p className="error-message">{ error }</p>
          <button
            onClick={ () => window.location.reload() }
            className="error-retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-icon-container">
            <CalendarIcon className="auth-icon" />
          </div>
          <h1 className="auth-title">Calendar Event Manager</h1>
          <p className="auth-description">Connect with Google Calendar to manage your events</p>
          <button
            onClick={ handleAuth }
            className="auth-button"
          >
            <LogIn className="button-icon" />
            Connect with Google Calendar
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout className='main-content-wrapper'>
      <Header className="content-header">
        <div className="header-content">
          <h1 className="header-title">Event Planner</h1>
          <div className="view-toggle">
            <button
              onClick={ () => setViewType('calendar') }
              className={ `view-button ${viewType === 'calendar' ? 'active' : ''}` }
            >
              <CalendarIcon className="button-icon" />
              <span>Calendar</span>
            </button>
            <button
              onClick={ () => setViewType('list') }
              className={ `view-button ${viewType === 'list' ? 'active' : ''}` }
            >
              <List className="button-icon" />
              <span>List</span>
            </button>
          </div>
        </div>
      </Header>

      <Content className="content-warpper">
        <div className="calendar-container">
          <FullCalendar
            plugins={ [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin] }
            initialView={ viewType === 'calendar' ? 'dayGridMonth' : 'listMonth' }
            headerToolbar={ {
              left: 'prev,next today',
              center: 'title',
              right: viewType === 'calendar'
                ? 'dayGridMonth,timeGridWeek,timeGridDay'
                : 'listDay,listWeek,listMonth,listYear',
            } }
            views={ {
              listDay: { buttonText: 'Day' },
              listWeek: { buttonText: 'Week' },
              listMonth: { buttonText: 'Month' },
              listYear: { buttonText: 'Year' },
            } }
            events={ events.map((event) => ({
              id: event.id,
              title: event.title,
              start: event.start,
              end: event.end,
              description: event.description,
              location: event.location,
              className: 'custom-calendar-event',
            })) }
            dateClick={ handleDateClick }
            eventClick={ handleEventClick }
            height="auto"
            aspectRatio={ 2 }
            dayMaxEvents={ 4 }
          />
        </div>
      </Content>

      <footer className="site-footer">
        <p>Copyright © { new Date().getFullYear() } Elsner Technologies Private Limited</p>
      </footer>

      <EventModal
        isOpen={ isModalOpen }
        onClose={ () => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        } }
        onSubmit={ selectedEvent ? handleEventUpdate : handleEventCreate }
        onDelete={ handleEventDelete }
        selectedDate={ selectedDate }
        event={ selectedEvent }
      />

      <Toaster position="bottom-right" />
    </Layout>
  );
}

export default EventManager;