import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import crypto from 'crypto';
import { dataForJWT } from './DataForJWT.js';
const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ email, password, name });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
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

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user._id, email: user.email, name: user.name, img: user.img } });
  } catch (error) {
    console.log("🚀 ~ router.post ~ error:", error)
    res.status(500).json({ message: 'Error logging in' });
  }
});




router.post('/redirectToBack', async (req, res) => {
  try {

    const { tokenData } = req.body;

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

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name } });
    } else {


      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      res.json({ token, user: { id: user._id, email: user.email, name: user.name, img: user.img } });
    }


  } catch (error) {
    console.log("🚀 ~ router.post ~ error:", error)
    res.status(500).json({ message: 'Error logging in' });
  }
});


export default router;