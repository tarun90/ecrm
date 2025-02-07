import { format, isWithinInterval } from 'date-fns';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/contacts.readonly';

let tokenClient;
let gapiInited = false;
let gisInited = false;
let initializationPromise = null;

// Cache for contacts
let contactsCache = [];
let lastContactsFetch = 0;
const CONTACTS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function validateConfig() {
  if (!CLIENT_ID || CLIENT_ID.trim() === '') {
    throw new Error('Google Calendar Client ID is missing or empty. Please check your environment variables.');
  }
  if (!API_KEY || API_KEY.trim() === '') {
    throw new Error('Google Calendar API Key is missing or empty. Please check your environment variables.');
  }
}

async function loadScript(src) {
  return new Promise((resolve, reject) => {
    try {
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        script.onerror = null;
        script.onload = null;
        resolve();
      };

      script.onerror = () => {
        script.onerror = null;
        script.onload = null;
        reject(new Error(`Failed to load script: ${src}`));
      };

      document.head.appendChild(script);
    } catch (error) {
      reject(new Error(`Error while loading script ${src}: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
}

export async function initializeGoogleCalendar() {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      validateConfig();

      if (!window.gapi) {
        try {
          await loadScript('https://apis.google.com/js/api.js');
        } catch (error) {
          throw new Error(`Failed to load Google API script: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (!gapiInited) {
        await new Promise((resolve, reject) => {
          try {
            gapi.load('client', {
              callback: async () => {
                try {
                  await gapi.client.init({
                    apiKey: API_KEY,
                    discoveryDocs: [
                      DISCOVERY_DOC,
                      'https://people.googleapis.com/$discovery/rest?version=v1'
                    ],
                  });
                  gapiInited = true;
                  resolve();
                } catch (error) {
                  const errorMessage = error?.error?.message || error?.message || 'Unknown error occurred';
                  reject(new Error(`Failed to initialize GAPI client: ${errorMessage}`));
                }
              },
              onerror: (error) => {
                reject(new Error(`Failed to load GAPI client: ${error?.error?.message || error?.message || 'Unknown error'}`));
              },
            });
          } catch (error) {
            reject(new Error(`Error during GAPI client initialization: ${error instanceof Error ? error.message : 'Unknown error'}`));
          }
        });
      }

      if (!window.google?.accounts) {
        try {
          await loadScript('https://accounts.google.com/gsi/client');
        } catch (error) {
          throw new Error(`Failed to load Google Identity Services: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (!tokenClient && window.google?.accounts?.oauth2) {
        try {
          tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: '', // defined at request time
          });
          gisInited = true;
        } catch (error) {
          throw new Error(`Failed to initialize token client: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (!gapiInited || !gisInited) {
        throw new Error('Google Calendar API components failed to initialize completely');
      }

    } catch (error) {
      gapiInited = false;
      gisInited = false;
      tokenClient = undefined;
      initializationPromise = null;

      console.error('Google Calendar initialization error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        error
      });

      throw error instanceof Error ? error : new Error('Failed to initialize Google Calendar');
    }
  })();

  return initializationPromise;
}

export async function authenticate() {
  if (!gapiInited || !gisInited) {
    try {
      await initializeGoogleCalendar();
    } catch (error) {
      throw new Error('Failed to initialize Google Calendar. Please refresh the page and try again.');
    }
  }

  return new Promise((resolve, reject) => {
    try {
      tokenClient.callback = (resp) => {
        if (resp.error !== undefined) {
          reject(new Error(resp.error));
          return;
        }
        resolve();
      };

      if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
      } else {
        tokenClient.requestAccessToken({ prompt: '' });
      }
    } catch (err) {
      reject(new Error('Authentication failed. Please try again.'));
    }
  });
}

export async function searchContacts(query) {
  if (!query.trim()) return [];

  try {
    const now = Date.now();
    if (contactsCache.length > 0 && now - lastContactsFetch < CONTACTS_CACHE_DURATION) {
      return contactsCache.filter(email =>
        email.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Fetch contacts using People API's searchContacts method
    const [contactsResponse, directoryResponse] = await Promise.all([
      gapi.client.people.people.connections.list({
        resourceName: 'people/me',
        pageSize: 1000,
        personFields: 'names,emailAddresses',
        sortOrder: 'LAST_MODIFIED_DESCENDING'
      }),
      gapi.client.people.people.searchDirectoryPeople({
        query: query,
        readMask: 'names,emailAddresses',
        sources: ['DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE'],
        pageSize: 30
      })
    ]);

    const suggestions = new Set();

    // Process contacts
    const contacts = contactsResponse.result.connections || [];
    contacts.forEach((contact) => {
      if (contact.emailAddresses?.length && contact.names?.length) {
        const name = contact.names[0].displayName;
        const email = contact.emailAddresses[0].value;
        if (email) {
          suggestions.add(email);
          if (name) {
            suggestions.add(`${name} <${email}>`);
          }
        }
      }
    });

    // Process directory results
    const directoryPeople = directoryResponse.result.people || [];
    directoryPeople.forEach((person) => {
      if (person.emailAddresses?.length && person.names?.length) {
        const name = person.names[0].displayName;
        const email = person.emailAddresses[0].value;
        if (email) {
          suggestions.add(email);
          if (name) {
            suggestions.add(`${name} <${email}>`);
          }
        }
      }
    });

    // Update cache
    contactsCache = Array.from(suggestions);
    lastContactsFetch = now;

    // Filter and return results
    return Array.from(suggestions).filter(suggestion =>
      suggestion.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching contacts:', error);
    // Fallback to previously used attendees
    const previousAttendees = localStorage.getItem('previousAttendees');
    const storedAttendees = previousAttendees ? JSON.parse(previousAttendees) : [];
    return storedAttendees.filter((email) =>
      email.toLowerCase().includes(query.toLowerCase())
    );
  }
}

export async function listEvents() {
  if (!gapiInited || !gisInited) {
    throw new Error('Google Calendar API not initialized');
  }

  try {
    const timeMin = new Date();
    timeMin.setMonth(timeMin.getMonth() - 1);

    const response = await gapi.client.calendar.events.list({
      'calendarId': 'primary',
      'timeMin': timeMin.toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      'maxResults': 2500,
      'orderBy': 'startTime',
      'syncToken': localStorage.getItem('calendarSyncToken') || undefined,
    });

    if (response.result.nextSyncToken) {
      localStorage.setItem('calendarSyncToken', response.result.nextSyncToken);
    }

    return response.result.items?.map(event => ({
      id: event.id,
      title: event.summary,
      start: new Date(event.start?.dateTime || event.start?.date),
      end: new Date(event.end?.dateTime || event.end?.date),
      description: event.description || '',
      location: event.location || '',
      attendees: event.attendees?.map(attendee => attendee.email) || [],
      recurrence: event.recurrence?.[0] || '',
      recurringEventId: event.recurringEventId,
      meetingLink: event.hangoutLink || '',
      reminders: event.reminders || { useDefault: true },
    })) || [];
  } catch (err) {
    if (err?.result?.error?.code === 410) {
      localStorage.removeItem('calendarSyncToken');
      return listEvents();
    }
    console.error('Error fetching events:', err);
    throw err;
  }
}

async function checkEventConflicts(start, end, excludeEventId) {
  if (!gapiInited || !gisInited) {
    throw new Error('Google Calendar API not initialized');
  }

  try {
    const response = await gapi.client.calendar.events.list({
      'calendarId': 'primary',
      'timeMin': format(start, "yyyy-MM-dd'T'HH:mm:ssxxx"),
      'timeMax': format(end, "yyyy-MM-dd'T'HH:mm:ssxxx"),
      'singleEvents': true,
    });

    const events = response.result.items || [];
    return events.some(event => {
      if (excludeEventId && event.id === excludeEventId) {
        return false;
      }

      const eventStart = new Date(event.start?.dateTime || event.start?.date);
      const eventEnd = new Date(event.end?.dateTime || event.end?.date);

      return (
        isWithinInterval(start, { start: eventStart, end: eventEnd }) ||
        isWithinInterval(end, { start: eventStart, end: eventEnd }) ||
        isWithinInterval(eventStart, { start, end }) ||
        isWithinInterval(eventEnd, { start, end })
      );
    });
  } catch (err) {
    console.error('Error checking event conflicts:', err);
    throw err;
  }
}

export async function createEvent(event) {
  if (!gapiInited || !gisInited) {
    throw new Error('Google Calendar API not initialized');
  }

  const hasConflicts = await checkEventConflicts(event.start, event.end);
  if (hasConflicts) {
    throw new Error('There is already an event scheduled during this time slot');
  }

  try {
    const response = await gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: {
        summary: event.title,
        description: event.description || '',
        location: event.location || '',
        start: {
          dateTime: format(event.start, "yyyy-MM-dd'T'HH:mm:ssxxx"),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: format(event.end, "yyyy-MM-dd'T'HH:mm:ssxxx"),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        attendees: event.attendees?.map(email => ({ email })) || [],
        recurrence: event.recurrence ? [event.recurrence] : undefined,
        reminders: event.reminders || { useDefault: true },
        conferenceData: {
          createRequest: {
            requestId: crypto.randomUUID(),
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        }
      },
      conferenceDataVersion: 1
    });

    const createdEvent = response.result;
    return {
      id: createdEvent.id,
      title: createdEvent.summary,
      start: new Date(createdEvent.start?.dateTime || createdEvent.start?.date),
      end: new Date(createdEvent.end?.dateTime || createdEvent.end?.date),
      description: createdEvent.description || '',
      location: createdEvent.location || '',
      attendees: createdEvent.attendees?.map(attendee => attendee.email) || [],
      recurrence: createdEvent.recurrence?.[0] || '',
      recurringEventId: createdEvent.recurringEventId,
      meetingLink: createdEvent.hangoutLink || '',
      reminders: createdEvent.reminders || { useDefault: true },
    };
  } catch (err) {
    console.error('Error creating event:', err);
    throw err;
  }
}


export async function updateEvent(event) {
  if (!gapiInited || !gisInited) {
    throw new Error('Google Calendar API not initialized');
  }

  try {
    const originalEvent = await gapi.client.calendar.events.get({
      calendarId: 'primary',
      eventId: event.id
    });

    const isRecurring = originalEvent.result.recurringEventId || originalEvent.result.recurrence;
    let updatedEvent;

    const hasConflicts = await checkEventConflicts(event.start, event.end, event.id);
    if (hasConflicts) {
      throw new Error('There is already an event scheduled during this time slot');
    }

    const eventResource = {
      summary: event.title,
      description: event.description || '',
      location: event.location || '',
      start: {
        dateTime: format(event.start, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: format(event.end, "yyyy-MM-dd'T'HH:mm:ssxxx"),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: event.attendees?.map(email => ({ email })) || [],
      recurrence: event.recurrence ? [event.recurrence] : undefined,
      reminders: event.reminders || { useDefault: true },
      conferenceData: originalEvent.result.conferenceData || {
        createRequest: {
          requestId: crypto.randomUUID(),
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      }
    };

    if (isRecurring) {
      const response = await gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: {
          ...eventResource,
          originalStartTime: originalEvent.result.originalStartTime || originalEvent.result.start,
          recurringEventId: originalEvent.result.recurringEventId || event.id,
        },
        conferenceDataVersion: 1
      });
      updatedEvent = response.result;
    } else {
      const response = await gapi.client.calendar.events.update({
        calendarId: 'primary',
        eventId: event.id,
        resource: eventResource,
        conferenceDataVersion: 1
      });
      updatedEvent = response.result;
    }

    return {
      id: updatedEvent.id,
      title: updatedEvent.summary,
      start: new Date(updatedEvent.start?.dateTime || updatedEvent.start?.date),
      end: new Date(updatedEvent.end?.dateTime || updatedEvent.end?.date),
      description: updatedEvent.description || '',
      location: updatedEvent.location || '',
      attendees: updatedEvent.attendees?.map(attendee => attendee.email) || [],
      recurrence: updatedEvent.recurrence?.[0] || '',
      recurringEventId: updatedEvent.recurringEventId,
      meetingLink: updatedEvent.hangoutLink || '',
      reminders: updatedEvent.reminders || { useDefault: true },
    };
  } catch (err) {
    console.error('Error updating event:', err);
    throw err;
  }
}

export async function deleteEvent(eventId, deleteType) {
  if (!gapiInited || !gisInited) {
    throw new Error('Google Calendar API not initialized');
  }

  try {
    // First, get the event to check if it's recurring
    const event = await gapi.client.calendar.events.get({
      calendarId: 'primary',
      eventId: eventId
    });

    const recurringEventId = event.result.recurringEventId || eventId;
    const isRecurring = Boolean(event.result.recurringEventId || event.result.recurrence);

    if (!isRecurring) {
      // For non-recurring events, simple deletion
      await gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
        sendUpdates: 'all'
      });
      return;
    }

    switch (deleteType) {
      case 'single':
        // For single instance deletion of a recurring event
        await gapi.client.calendar.events.delete({
          calendarId: 'primary',
          eventId: eventId,
          sendUpdates: 'all'
        });
        break;

      case 'future':
        // Get the start time of the current instance
        const instanceStart = event.result.start.dateTime || event.result.start.date;

        // Get all instances of the recurring event
        const instances = await gapi.client.calendar.events.instances({
          calendarId: 'primary',
          eventId: recurringEventId,
          timeMin: instanceStart,
          showDeleted: false,
          singleEvents: true,
          maxResults: 2500
        });

        // Delete each future instance
        await Promise.all((instances.result.items || []).map(instance =>
          gapi.client.calendar.events.delete({
            calendarId: 'primary',
            eventId: instance.id,
            sendUpdates: 'all'
          })
        ));
        break;

      case 'all':
        // Delete the master recurring event
        await gapi.client.calendar.events.delete({
          calendarId: 'primary',
          eventId: recurringEventId,
          sendUpdates: 'all'
        });
        break;
    }
  } catch (err) {
    console.error('Error deleting event:', err);
    const message = err?.result?.error?.message || 'Failed to delete event';
    throw new Error(message);
  }
}