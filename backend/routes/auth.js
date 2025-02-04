const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const User = require('../models/user');

console.log('Setting up auth routes...');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

// Log the credentials being used (safely)
console.log('OAuth2 config:', {
  clientId: process.env.GOOGLE_CLIENT_ID ? `...${process.env.GOOGLE_CLIENT_ID.slice(-6)}` : 'not set',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'set' : 'not set',
  redirectUri: process.env.REDIRECT_URI
});

router.get('/url', (req, res) => {
  console.log('Handling /url request');
  try {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent', // Force consent screen to always appear
      scope: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    });
    console.log('Generated auth URL:', url);
    res.json({ url });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate auth URL', details: error.message });
  }
});

router.get('/callback', async (req, res) => {
  console.log('Handling /callback request');
  const { code, error } = req.query;

  if (error) {
    console.error('Auth error from Google:', error);
    return res.redirect(`http://localhost:3000/login?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    console.error('No code received from Google');
    return res.redirect('http://localhost:3000/login?error=no_code');
  }

  try {
    console.log('Getting tokens with code');
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    console.log('Getting user profile');
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const email = profile.data.emailAddress;

    console.log('Storing tokens for email:', email);
    const user = await User.findOneAndUpdate(
      { email },
      { 
        email, 
        tokens,
        lastLogin: new Date(),
        isActive: true
      },
      { upsert: true, new: true }
    );

    console.log('User stored:', user);

    // Add session token to the redirect URL
    const sessionToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');
    const redirectUrl = `http://localhost:3000/?email=${encodeURIComponent(email)}&token=${sessionToken}`;
    console.log('Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Auth callback error:', error);
    const errorMessage = encodeURIComponent(error.message || 'Authentication failed');
    res.redirect(`http://localhost:3000/login?error=${errorMessage}`);
  }
});

// Add session verification endpoint
router.get('/verify', async (req, res) => {
  const { email, token } = req.query;
  
  if (!email || !token) {
    return res.status(401).json({ error: 'Missing credentials' });
  }

  try {
    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    res.json({ valid: true, email: user.email });
  } catch (error) {
    console.error('Session verification error:', error);
    res.status(500).json({ error: 'Failed to verify session' });
  }
});

console.log('Auth routes setup complete');
module.exports = router; 