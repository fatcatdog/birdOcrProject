const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Signup
// 4242 4242 4242 4242


router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.status(201).json({ token });
  } catch (err) {
    console.log("our error message: " + err)

    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (user.subscriptionStatus !== 'active') {
      return res.status(403).json({ error: 'Active subscription required' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/logout', async (req, res) => {

  console.log("what do we have here " + req.body)

  // const { email, password } = req.body;
  // try {
  //   const user = await User.findOne({ email });
  //   if (!user || !await bcrypt.compare(password, user.password)) {
  //     return res.status(401).json({ error: 'Invalid credentials' });
  //   }
  //   if (user.subscriptionStatus !== 'active') {
  //     return res.status(403).json({ error: 'Active subscription required' });
  //   }
  //   const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  //   res.json({ token });
  // } catch (err) {
  //   res.status(400).json({ error: err.message });
  // }
});

module.exports = router;