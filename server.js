// server.js
// Single-file backend for MediCare (Node + Express + MongoDB + Mongoose)
// Features:
// - User / Doctor / Appointment / Feedback models
// - Auth: register, login, refresh token (JWT + refresh token)
// - Protected routes (authenticate + adminOnly)
// - Seeding for initial doctors + admin
// - Input validation with Zod
// - Rate limiting, helmet, cors, morgan
// - Simple error handling

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medicare';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_access';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'supersecret_refresh';
const CLIENT_URL = process.env.CLIENT_URL || '*';

// --- Middleware ---
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('tiny'));
app.use(cors({ origin: CLIENT_URL }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiter (basic)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests from this IP, try again later.' }
});
app.use('/api/', apiLimiter);

// --- Mongoose connect ---
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected ✅'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// --- Schemas & Models ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'admin'], default: 'patient' },
  joinDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});
const User = mongoose.model('User', userSchema);

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  rating: { type: Number, default: 4.5 },
  reviews: { type: Number, default: 0 },
  location: String,
  availability: String,
  fee: String,
  image: String,
});
const Doctor = mongoose.model('Doctor', doctorSchema);

const appointmentSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  doctorName: String,
  specialty: String,
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: String,
  date: { type: Date, required: true },
  time: { type: String, required: true },
  symptoms: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});
const Appointment = mongoose.model('Appointment', appointmentSchema);

const feedbackSchema = new mongoose.Schema({
  patient: String,
  doctor: String,
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
  date: { type: Date, default: Date.now }
});
const Feedback = mongoose.model('Feedback', feedbackSchema);

// --- Zod Validation schemas ---
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  password: z.string().min(6),
  confirmPassword: z.string().min(6)
}).refine(data => data.password === data.confirmPassword, { message: "Passwords must match" });

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const appointmentZ = z.object({
  doctorId: z.string().length(24),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  time: z.string().min(3),
  symptoms: z.string().min(5),
  phone: z.string().min(6)
});

// --- JWT helpers ---
function generateTokens(user) {
  const accessToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user._id, role: user.role }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

// --- Auth middleware ---
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function adminOnly(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
}

// --- Seed data (doctors + admin) ---
async function seedData() {
  try {
    const docCount = await Doctor.countDocuments();
    if (docCount === 0) {
      const seedDoctors = [
        { name: "Dr. Sarah Johnson", specialty: "Cardiology", rating: 4.8, reviews: 245, location: "Downtown Medical Center", availability: "Mon-Fri 9AM-5PM", fee: "$100", image: "https://placehold.co/600x400/007bff/ffffff?text=Dr+Sarah" },
        { name: "Dr. Michael Chen", specialty: "Dermatology", rating: 4.9, reviews: 312, location: "Skin Care Clinic", availability: "Mon-Sat 10AM-6PM", fee: "$80", image: "https://placehold.co/600x400/28a745/ffffff?text=Dr+Michael" },
        { name: "Dr. Emily Rodriguez", specialty: "Pediatrics", rating: 4.7, reviews: 189, location: "Children's Hospital", availability: "Tue-Thu 8AM-4PM", fee: "$90", image: "https://placehold.co/600x400/ffc107/ffffff?text=Dr+Emily" },
        { name: "Dr. James Wilson", specialty: "Orthopedics", rating: 4.6, reviews: 278, location: "Sports Medicine Center", availability: "Mon-Fri 9AM-5PM", fee: "$120", image: "https://placehold.co/600x400/17a2b8/ffffff?text=Dr+James" },
        { name: "Dr. Lisa Anderson", specialty: "Neurology", rating: 4.9, reviews: 156, location: "Neurological Institute", availability: "Wed-Fri 1PM-7PM", fee: "$110", image: "https://placehold.co/600x400/6610f2/ffffff?text=Dr+Lisa" }
      ];
      await Doctor.insertMany(seedDoctors);
      console.log('Seeded doctors.');
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const hashed = await bcrypt.hash('admin123', 10);
      await User.create({ name: 'Admin', email: 'admin@medicare.com', phone: '9999999999', password: hashed, role: 'admin' });
      console.log('Admin user created: admin@medicare.com / admin123');
    }
  } catch (err) {
    console.error('Seed error:', err);
  }
}

// call seed (non-blocking)
seedData().catch(console.error);

// --- Routes ---
// health
app.get('/api/ping', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const parsed = registerSchema.parse(req.body);
    const { name, email, phone, password } = parsed;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone, password: hashed });

    const tokens = generateTokens(user);
    return res.json({ message: 'Registered', user: { id: user._id, name: user.name, email: user.email }, ...tokens });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors.map(e => e.message).join(', ') });
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const { email, password } = parsed;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const tokens = generateTokens(user);
    return res.json({ message: 'Logged in', user: { id: user._id, name: user.name, email: user.email, role: user.role }, ...tokens });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors.map(e => e.message).join(', ') });
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Refresh access token
app.post('/api/auth/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ error: 'No refresh token provided' });

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, payload) => {
      if (err) return res.status(403).json({ error: 'Invalid refresh token' });
      // NOTE: payload contains id, role
      const accessToken = jwt.sign({ id: payload.id, role: payload.role }, JWT_SECRET, { expiresIn: '15m' });
      return res.json({ accessToken });
    });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get doctors (with optional search & specialty)
app.get('/api/doctors', async (req, res) => {
  try {
    const { specialty, search } = req.query;
    const q = {};
    if (specialty) q.specialty = specialty;
    if (search) q.name = { $regex: search, $options: 'i' };
    const docs = await Doctor.find(q).select('-__v').lean();
    return res.json(docs);
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Create doctor (admin only)
app.post('/api/admin/doctors', authenticate, adminOnly, async (req, res) => {
  try {
    const { name, specialty, rating, reviews, location, availability, fee, image } = req.body;
    if (!name || !specialty) return res.status(400).json({ error: 'name & specialty required' });
    const d = await Doctor.create({ name, specialty, rating, reviews, location, availability, fee, image });
    return res.json(d);
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Book appointment (authenticated)
app.post('/api/appointments', authenticate, async (req, res) => {
  try {
    const parsed = appointmentZ.parse(req.body);
    const { doctorId, date, time, symptoms, phone } = parsed;

    // check doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    // convert date string to Date object (store as Date)
    const appointmentDate = new Date(date + 'T00:00:00'); // store midnight (time in separate field)
    const patient = await User.findById(req.user.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });

    const appointment = await Appointment.create({
      doctor: doctor._id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      patient: patient._id,
      patientName: patient.name,
      date: appointmentDate,
      time,
      symptoms,
      phone,
      status: 'confirmed'
    });

    return res.json({ message: 'Appointment booked', appointment });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors.map(e => e.message).join(', ') });
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get my appointments
app.get('/api/appointments', authenticate, async (req, res) => {
  try {
    const appts = await Appointment.find({ patient: req.user.id })
      .populate('doctor', 'name specialty image')
      .sort({ date: -1, createdAt: -1 });
    return res.json(appts);
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Cancel appointment (patient)
app.patch('/api/appointments/:id/cancel', authenticate, async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found' });
    if (appt.patient.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not allowed' });
    }
    appt.status = 'cancelled';
    await appt.save();
    return res.json({ message: 'Appointment cancelled', appointment: appt });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Admin: stats
app.get('/api/admin/stats', authenticate, adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalAppointments, totalDoctors] = await Promise.all([
      User.countDocuments({ role: 'patient' }),
      Appointment.countDocuments(),
      Doctor.countDocuments()
    ]);
    return res.json({ totalUsers, totalAppointments, totalDoctors });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Admin: list appointments
app.get('/api/admin/appointments', authenticate, adminOnly, async (req, res) => {
  try {
    const appts = await Appointment.find()
      .populate('doctor', 'name specialty')
      .populate('patient', 'name email phone')
      .sort({ createdAt: -1 });
    return res.json(appts);
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Admin: list users
app.get('/api/admin/users', authenticate, adminOnly, async (req, res) => {
  try {
    const users = await User.find({ role: 'patient' }).select('-password').sort({ joinDate: -1 });
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Feedback: post & get
app.post('/api/feedback', async (req, res) => {
  try {
    const { patient, doctor, rating, comment } = req.body;
    if (!rating || !comment) return res.status(400).json({ error: 'rating and comment required' });
    const fb = await Feedback.create({ patient, doctor, rating, comment });
    return res.json(fb);
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});
app.get('/api/feedback', async (req, res) => {
  try {
    const all = await Feedback.find().sort({ date: -1 });
    return res.json(all);
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Basic error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
