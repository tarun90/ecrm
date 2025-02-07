import express from 'express';
import { google } from 'googleapis';
import User from '../models/User.js';
import dotenv from 'dotenv';
import auth from '../middleware/auth.js';

const router = express.Router();
dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

router.get('/:type',auth, async (req, res) => {
  try {
    const { type } = req.params;
    const {  token, q } = req.query;
    let email = req?.user?.user?.email;
    console.log(req.user,"ketul")
    console.log('Email request:', { type, email, hasQuery: !!q });

    const user = await User.findOne({ email:email });
    if (!user) {
      console.log('User not found or inactive:', email);
      return res.status(401).json({ error: 'User not authenticated' });
    }

    oauth2Client.setCredentials(user.tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    let searchQuery = '';
    
    // Build search query
    if (type === 'search' && q) {
      searchQuery = q;
    } else if (type === 'sent') {
      searchQuery = 'in:sent';
      if (q) searchQuery += ` ${q}`;
    } else {
      searchQuery = 'in:inbox';
      if (q) searchQuery += ` ${q}`;
    }

    console.log('Gmail search query:', searchQuery);

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: searchQuery,
      maxResults: 20
    });

    if (!response.data.messages) {
      console.log('No messages found for query:', searchQuery);
      return res.json([]);
    }

    console.log(`Found ${response.data.messages.length} messages`);

    const emails = await Promise.all(
      response.data.messages.map(async (message) => {
        const email = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full'
        });
        
        const headers = email.data.payload.headers;
        const subject = headers.find(h => h.name === 'Subject')?.value || '(no subject)';
        const from = headers.find(h => h.name === 'From')?.value || '';
        const date = headers.find(h => h.name === 'Date')?.value || '';
        
        let body = '';
        if (email.data.payload.parts) {
          const textPart = email.data.payload.parts.find(part => part.mimeType === 'text/plain');
          if (textPart && textPart.body.data) {
            body = Buffer.from(textPart.body.data, 'base64').toString();
          }
        } else if (email.data.payload.body.data) {
          body = Buffer.from(email.data.payload.body.data, 'base64').toString();
        }

        return {
          id: email.data.id,
          subject,
          from,
          date,
          snippet: email.data.snippet,
          body
        };
      })
    );

    console.log(`Processed ${emails.length} emails`);
    res.json(emails);
  } catch (error) {
    console.error('Failed to fetch emails:', error);
    res.status(500).json({ error: 'Failed to fetch emails', details: error.message });
  }
});

router.post('/send',auth,  async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    let email = req?.user?.user?.email;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    oauth2Client.setCredentials(user.tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `From: ${email}`,
      `To: ${to}`,
      `Subject: ${utf8Subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=utf-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      message
    ];
    const emailContent = messageParts.join('\n');

    const encodedMessage = Buffer.from(emailContent)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to send email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, token, folder } = req.query;

    console.log('Deleting email:', { id, email, folder });

    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    oauth2Client.setCredentials(user.tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // First, get the message to check its labels
    const message = await gmail.users.messages.get({
      userId: 'me',
      id: id,
      format: 'minimal'
    });

    // Check if message exists
    if (!message.data) {
      throw new Error('Message not found');
    }

    try {
      // Try to move to trash first
      await gmail.users.messages.trash({
        userId: 'me',
        id: id
      });
      console.log('Email moved to trash successfully');
    } catch (trashError) {
      console.error('Failed to move to trash, attempting permanent deletion:', trashError);
      
      // If trash fails, try permanent deletion
      await gmail.users.messages.delete({
        userId: 'me',
        id: id
      });
      console.log('Email permanently deleted');
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete email:', error);
    res.status(500).json({ error: 'Failed to delete email', details: error.message });
  }
});

router.get('/contacts', async (req, res) => {
  try {
    const { email } = req.query;
    
    console.log('Fetching contacts for:', email);

    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'User not authenticated' });
    }

    oauth2Client.setCredentials(user.tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Get contacts using Gmail API's users.messages endpoint
    const [inboxResponse, sentResponse] = await Promise.all([
      gmail.users.messages.list({
        userId: 'me',
        maxResults: 30,
        q: 'in:inbox'
      }),
      gmail.users.messages.list({
        userId: 'me',
        maxResults: 30,
        q: 'in:sent'
      })
    ]);

    const messages = [
      ...(inboxResponse.data.messages || []),
      ...(sentResponse.data.messages || [])
    ];

    console.log(`Found ${messages.length} total messages to process`);

    if (!messages.length) {
      return res.json([]);
    }

    // Get unique contacts from messages
    const contacts = new Map();

    await Promise.all(
      messages.slice(0, 40).map(async (message) => {
        try {
          const emailData = await gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'metadata',
            metadataHeaders: ['From', 'To']
          });

          const headers = emailData.data.payload.headers;
          const fromHeader = headers.find(h => h.name === 'From')?.value;
          const toHeader = headers.find(h => h.name === 'To')?.value;

          const processHeader = (headerValue) => {
            if (!headerValue) return [];
            
            // Match email patterns with or without names
            const emailPattern = /(?:"?([^"<]+)"?\s*)?<?([^>,]+@[^>,]+)>?,?/g;
            const matches = [...headerValue.matchAll(emailPattern)];
            
            return matches.map(match => ({
              name: match[1]?.trim() || '',
              email: match[2].trim()
            }));
          };

          const extractedContacts = [
            ...processHeader(fromHeader),
            ...processHeader(toHeader)
          ];

          extractedContacts.forEach(contact => {
            if (contact.email && contact.email !== email) {
              contacts.set(contact.email, {
                name: contact.name || contact.email.split('@')[0],
                email: contact.email
              });
            }
          });
        } catch (error) {
          console.error('Error processing message:', message.id, error);
        }
      })
    );

    const contactsList = Array.from(contacts.values());
    console.log(`Found ${contactsList.length} unique contacts`);
    console.log('Sample contacts:', contactsList.slice(0, 3));

    res.json(contactsList);
  } catch (error) {
    console.error('Failed to fetch contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts', details: error.message });
  }
});

export default router;