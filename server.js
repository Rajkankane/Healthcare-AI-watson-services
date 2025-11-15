// server.js — Advanced Full-Stack Backend for MediCare (Single File)

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const { z } = require('zod');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-prod';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-in-prod';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medicare';

// === Middleware ===
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));
app.use('/uploads', express.static('uploads'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// === MongoDB Connection ===
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

// === Schemas & Models ===
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'admin'], default: 'patient' },
  joinDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  rating: { type: Number, min: 0, max: 5, default: 4.5 },
  reviews: { type: Number, default: 0 },
  location: { type: String, required: true },
  availability: { type: String, required: true },
  fee: { type: String, required: true },
  image: { type: String, required: true }
});

const AppointmentSchema = new mongoose.Schema({
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

const FeedbackSchema = new mongoose.Schema({
  patient: String,
  doctor: String,
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Doctor = mongoose.model('Doctor', DoctorSchema);
const Appointment = mongoose.model('Appointment', AppointmentSchema);
const Feedback = mongoose.model('Feedback', FeedbackSchema);

// === Validation Schemas (Zod) ===
const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^[\d\+\-\s]{10,15}$/),
  password: z.string().min(6),
  confirmPassword: z.string()
}).refine(d => d.password === d.confirmPassword, { message: "Passwords don't match" });

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const appointmentSchema = z.object({
  doctorId: z.string().length(24),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  symptoms: z.string().min(10),
  phone: z.string().regex(/^[\d\+\-\s]{10,15}$/)
});

// === JWT Helpers ===
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

// === Auth Middleware ===
const authenticate = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Access denied' });

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

// === Seed Initial Data ===
const seedData = async () => {
  if (await Doctor.countDocuments() === 0) {
    const doctors = [
      { name: "Dr. Sarah Johnson", specialty: "Cardiology", rating: 4.8, reviews: 245, location: "Downtown Medical Center", availability: "Mon-Fri 9AM-5PM", fee: "$100", image: "https://placehold.co/600x400/007bff/ffffff?text=Dr+Johnson" },
      { name: "Dr. Michael Chen", specialty: "Dermatology", rating: 4.9, reviews: 312, location: "Skin Care Clinic", availability: "Mon-Sat 10AM-6PM", fee: "$80", image: "https://placehold.co/600x400/28a745/ffffff?text=Dr+Chen" },
      // Add more...
    ];
    await Doctor.insertMany(doctors);
    console.log('Doctors seeded');
  }

  if (await User.countDocuments() === 0) {
    const hashed = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin', email: 'admin@medicare.com', phone: '9999999999',
      password: hashed, role: 'admin'
    });
    console.log('Admin user created: admin@medicare.com / admin123');
  }
};

// === Routes ===

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    delete data.confirmPassword;

    if (await User.findOne({ email: data.email })) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    data.password = await bcrypt.hash(data.password, 10);
    const user = await User.create(data);
    const { accessToken, refreshToken } = generateTokens(user);

    res.json({
      message: 'Registered successfully',
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(400).json({ error: err.errors?.[0]?.message || err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    res.json({
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(400).json({ error: err.errors?.[0]?.message || 'Invalid input' });
  }
});

// Refresh Token
app.post('/api/auth/refresh', (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ error: 'No token' });

  jwt.verify(token, JWT_REFRESH_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid refresh token' });
    const { accessToken } = generateTokens({ _id: user.id, role: user.role });
    res.json({ accessToken });
  });
});

// Get Doctors
app.get('/api/doctors', async (req, res) => {
  const { specialty, search } = req.query;
  let query = {};
  if (specialty) query.specialty = specialty;
  if (search) query.name = { $regex: search, $options: 'i' };

  const doctors = await Doctor.find(query).select('-__v');
  res.json(doctors);
});

// Book Appointment
app.post('/api/appointments', authenticate, async (req, res) => {
  try {
    const data = appointmentSchema.parse(req.body);
    const doctor = await Doctor.findById(data.doctorId);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

    const appointment = await Appointment.create({
      ...data,
      doctor: doctor._id,
      doctorName: doctor.name,
      specialty: doctor.specialty,
      patient: req.user.id,
      patientName: (await User.findById(req.user.id)).name
    });

    res.json({ message: 'Appointment booked', appointment });
  } catch (err) {
    res.status(400).json({ error: err.errors?.[0]?.message || err.message });
  }
});

// Get My Appointments
app.get('/api/appointments', authenticate, async (req, res) => {
  const appointments = await Appointment.find({ patient: req.user.id })
    .populate('doctor', 'name specialty')
    .sort({ date: -1 });
  res.json(appointments);
});

// === Admin Routes ===
app.use('/api/admin', authenticate, adminOnly);

// Admin: Dashboard Stats
app.get('/api/admin/stats', async (req, res) => {
  const [totalUsers, totalAppointments, totalDoctors] = await Promise.all([
    User.countDocuments({ role: 'patient' }),
    Appointment.countDocuments(),
    Doctor.countDocuments()
  ]);
  res.json({ totalUsers, totalAppointments, totalDoctors });
});

// Admin: All Appointments
app.get('/api/admin/appointments', async (req, res) => {
  const appointments = await Appointment.find({})
    .populate('doctor', 'name')
    .populate('patient', 'name email')
    .sort({ createdAt: -1 });
  res.json(appointments);
});

// Admin: All Users
app.get('/api/admin/users', async (req, res) => {
  const users = await User.find({ role: 'patient' }).select('-password');
  res.json(users);
});

// Admin: Feedback
app.get('/api/admin/feedback', async (req, res) => {
  const feedback = await Feedback.find().sort({ date: -1 });
  res.json(feedback);
});

app.post('/api/feedback', async (req, res) => {
  const { patient, doctor, rating, comment } = req.body;
  const fb = await Feedback.create({ patient, doctor, rating, comment });
  res.json(fb);
});

// === Swagger API Docs ===
const swaggerDocument = {
  openapi: '3.0.0',
  info: { title: 'MediCare API', version: '1.0.0' },
  servers: [{ url: `http://localhost:${PORT}/api` }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } }
  },
  paths: {
    '/auth/register': { post: { summary: 'Register user', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Register' } } } }, responses: { '200': { description: 'Success' } } } },
    // Add more paths as needed
  },
  components: { schemas: { Register: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string' }, password: { type: 'string' } } } } }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// === Serve Frontend (Production) ===
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/dist')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'frontend/dist/index.html')));
} else {
  app.use(express.static(path.join(__dirname, 'frontend')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'frontend/index.html')));
}

// === Error Handler ===
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// === Start Server ===
app.listen(PORT, async () => {
  await seedData();
  console.log(`MediCare Backend running on http://localhost:${PORT}`);
  console.log(`API Docs: http://localhost:${PORT}/api-docs`);
});