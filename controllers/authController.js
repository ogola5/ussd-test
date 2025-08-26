import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your preferred email provider
  auth: {
    user: process.env.EMAIL_USER, // e.g., ogolaevance5@gmail.com
    pass: process.env.EMAIL_PASS, // Gmail app password
  }
});

// ------------------ Register Admin ------------------
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    // Optional: send welcome email
    await transporter.sendMail({
      from: '"Sheria Link" <no-reply@sherialink.com>',
      to: email,
      subject: 'Welcome to Sheria Link',
      text: `Hello ${name}, your admin account has been created successfully!`
    });

    res.status(201).json({ message: 'Admin registered successfully', user: { name, email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ------------------ Register Normal User ------------------
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user'
    });

    // Optional: send welcome email
    await transporter.sendMail({
      from: '"Sheria Link" <no-reply@sherialink.com>',
      to: email,
      subject: 'Welcome to Sheria Link',
      text: `Hello ${name}, your account has been created successfully!`
    });

    res.status(201).json({ message: 'User registered successfully', user: { name, email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ------------------ Login (password check only) ------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    // Only return user info; no JWT
    res.json({ message: 'Login successful', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
