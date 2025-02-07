import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import crypto from 'crypto';
import { dataForJWT } from './DataForJWT.js';
import { google } from 'googleapis';

const router = express.Router();
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ email, password, name });
    await user.save();

    const token = jwt.sign({ user: user }, process.env.JWT_SECRET);
    res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (error) {
    console.log("🚀 ~ router.post ~ error:", error)
    res.status(500).json({ message: 'Error creating user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const encryptedInputPassword = crypto
      .createHash("md5")
      .update(password)
      .digest("hex");

    console.log("🚀 ~ router.post ~ encryptedInputPassword:", encryptedInputPassword)
    if (user.password != encryptedInputPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ user: user }, process.env.JWT_SECRET);
    res.json({ token, user: user });
  } catch (error) {
    console.log("🚀 ~ router.post ~ error:", error)
    res.status(500).json({ message: 'Error logging in' });
  }
});

router.get('/url', (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URI
  );
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
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URI
  );
  if (error) {
    console.error('Auth error from Google:', error);
    return res.redirect(`${process.env.CLIENT_URL}/webmail-setup?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    console.error('No code received from Google');
    return res.redirect(`${process.env.CLIENT_URL}/webmail-setup?error=no_code`);
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
    const redirectUrl = `${process.env.CLIENT_URL}/webmail-setup?email=${encodeURIComponent(email)}&token=${sessionToken}`;
    console.log('Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Auth callback error:', error);
    const errorMessage = encodeURIComponent(error.message || 'Authentication failed');
    res.redirect(`${process.env.CLIENT_URL}/webmail-setup?error=${errorMessage}`);
  }
});





router.post('/redirectToBack', async (req, res) => {
  try {

    const { tokenData } = req.body;
    console.log("🚀 ~ router.post ~ tokenData:", tokenData)

    const decodedToken = jwt.verify(tokenData, process.env.JWT_SECRET);

    const user_details = await dataForJWT(decodedToken.user);
    console.log(user_details)
    const { email, password, first_name, last_name, user_img } = user_details;

    const user = await User.findOne({ email });
    if (!user) {
      let name = first_name.trim() + " " + last_name.trim();
      let img = user_img;
      const user = new User({ email, password, name, img });
      await user.save();

      const token = jwt.sign({ user: user }, process.env.JWT_SECRET);
      res.status(201).json({ token, user:user });
    } else {


      const token = jwt.sign({ user: user }, process.env.JWT_SECRET);
      res.json({ token, user: user });
    }


  } catch (error) {
    console.log("🚀 ~ router.post ~ error:", error)
    res.status(500).json({ message: 'Error logging in' });
  }
});


export default router;