import React, { useEffect, useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar as CalendarIcon, LogIn, AlertCircle, List } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { EventModal } from './components/EventModal';
import {
  authenticate,
  initializeGoogleCalendar,
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  type CalendarEvent
} from './lib/google-calendar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<'calendar' | 'list'>('calendar');

  const fetchEvents = useCallback(async () => {
    try {
      const events = await listEvents();
      setEvents(events);
      setIsLoading(false);
      setError(null);
    } catch (error: any) {
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
      } catch (error: any) {
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
    } catch (error: any) {
      const message = error?.message || 'Authentication failed';
      console.error('Authentication error:', error);
      setError(message);
      toast.error('Failed to connect to Google Calendar');
    }
  };

  const handleDateClick = (arg: { date: Date }) => {
    setSelectedDate(arg.date);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (arg: { event: any }) => {
    const event = events.find(e => e.id === arg.event.id);
    if (event) {
      setSelectedEvent(event);
      setSelectedDate(event.start);
      setIsModalOpen(true);
    }
  };
  const handleEventCreate = async (eventData: Omit<CalendarEvent, 'id'>) => {
    try {
        console.log("Sending event data to Google Calendar:", eventData);

        // Call package function and capture response
        const newEvent = await createEvent(eventData);

        console.log("Google Calendar API Response:", newEvent);

        // Ensure the event ID is retrieved from Google Calendar
        if (!newEvent || !newEvent.id) {
            throw new Error('Google Calendar did not return an event ID');
        }

        // Construct a new event with the correct type
        const fullEvent: any = {
            ...eventData, // Spread original event data
            EventId: newEvent.id, // Assign the ID from Google Calendar
        };

        // Store the event ID from Google Calendar in MongoDB
        const response = await fetch('http://localhost:5000/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(fullEvent), // Now it includes `id`
        });

        const result = await response.json();
        console.log("MongoDB Save Response:", result);

        if (!response.ok) {
            throw new Error(result.error || 'Failed to save event to MongoDB');
        }

        // Update local event list with correct ID
        setEvents(prev => [...prev, fullEvent]);

        toast.success('Event created successfully');
        setIsModalOpen(false);
    } catch (error: any) {
        console.error('Error creating event:', error);
        toast.error(error.message || 'Failed to create event');
    }
};



const handleEventUpdate = async (eventData: CalendarEvent) => {
  try {
      console.log("Updating event in Google Calendar:", eventData);
      
      // Call Google API to update event
      const updatedEvent = await updateEvent(eventData);

      console.log("Updated Event from Google Calendar:", updatedEvent);

      if (!updatedEvent || !updatedEvent.id) {
          throw new Error('Failed to retrieve updated event ID from Google Calendar');
      }

      // Send updated event to MongoDB
      const response = await fetch(`http://localhost:5000/api/events/${eventData.id}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedEvent), // Ensure correct payload is sent
      });

      const result = await response.json();
      console.log("MongoDB Update Response:", result);

      if (!response.ok) {
          throw new Error(result.error || 'Failed to update event in MongoDB');
      }

      // Update state with the latest event data
      // setEvents(prev => prev.map(event => event.id === eventData.id ? updatedEvent : event));
      setEvents(prev => prev.map(event => 

        event.id === updatedEvent.id ? updatedEvent : event

      ));
      toast.success('Event updated successfully');
      setIsModalOpen(false);
  } catch (error: any) {
      console.error('Error updating event:', error);
      toast.error(error.message || 'Failed to update event');
  }
};


  const handleEventDelete = async (eventId: string, deleteType: 'single' | 'future' | 'all') => {
    try {
      await deleteEvent(eventId, deleteType);
      await fetchEvents();
      toast.success('Event deleted successfully');
      setIsModalOpen(false);
    } catch (error: any) {
      const message = error?.message || 'Failed to delete event';
      console.error('Error deleting event:', error);
      toast.error(message);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Calendar Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="flex justify-center mb-6">
            <CalendarIcon className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Calendar Event Manager</h1>
          <p className="text-gray-600 mb-6">
            Connect with Google Calendar to manage your events
          </p>
          <button
            onClick={handleAuth}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full"
          >
            <LogIn className="w-5 h-5" />
            Connect with Google Calendar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Event Planner</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewType('calendar')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                  viewType === 'calendar'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Calendar</span>
              </button>
              <button
                onClick={() => setViewType('list')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors ${
                  viewType === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="text-sm font-medium">List</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="bg-white rounded-lg shadow">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView={viewType === 'calendar' ? 'dayGridMonth' : 'listMonth'}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: viewType === 'calendar' 
                ? 'dayGridMonth,timeGridWeek,timeGridDay' 
                : 'listDay,listWeek,listMonth,listYear'
            }}
            views={{
              listDay: { buttonText: 'Day' },
              listWeek: { buttonText: 'Week' },
              listMonth: { buttonText: 'Month' },
              listYear: { buttonText: 'Year' }
            }}
            events={events.map(event => ({
              id: event.id,
              title: event.title,
              start: event.start,
              end: event.end,
              description: event.description,
              location: event.location,
              className: 'custom-calendar-event'
            }))}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height="auto"
            aspectRatio={2}
            dayMaxEvents={4}
          />
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-600">
          Copyright © {new Date().getFullYear()} Elsner Technologies Private Limited
         </div>
      </footer>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        onSubmit={selectedEvent ? handleEventUpdate : handleEventCreate}
        onDelete={handleEventDelete}
        selectedDate={selectedDate}
        event={selectedEvent}
      />

      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;