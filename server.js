// server.js - Complete MediCare Backend in One File
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// === Middleware ===
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// === Environment ===
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medicare';

// === Mongoose Models ===
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  joinDate: { type: Date, default: Date.now },
});
userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});
userSchema.methods.comparePassword = function (pwd) {
  return bcrypt.compare(pwd, this.password);
};
const User = mongoose.model('User', userSchema);

const doctorSchema = new mongoose.Schema({
  name: String,
  specialty: String,
  rating: { type: Number, default: 4.5 },
  reviews: { type: Number, default: 0 },
  location: String,
  availability: String,
  fee: String,
  image: String,
});
const Doctor = mongoose.model('Doctor', doctorSchema);

const appointmentModelSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: Date,
  time: String,
  symptoms: String,
  phone: String,
  status: { type: String, default: 'Confirmed' },
});
const Appointment = mongoose.model('Appointment', appointmentModelSchema);

const feedbackSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
});
const Feedback = mongoose.model('Feedback', feedbackSchema);

// === Authentication Middleware ===
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// === Validation Schemas ===
const signupSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const appointmentValidationSchema = Joi.object({
  doctorId: Joi.string().required(),
  date: Joi.date().required(),
  time: Joi.string().required(),
  symptoms: Joi.string().required(),
  phone: Joi.string().required(),
});

// === Seed Doctors (Run Once) ===
const seedDoctors = async () => {
  const count = await Doctor.countDocuments();
  if (count === 0) {
    const doctors = [
      {
        name: "Dr. Sarah Johnson",
        specialty: "Cardiology",
        rating: 4.8,
        reviews: 245,
        location: "Downtown Medical Center",
        availability: "Mon-Fri 9AM-5PM",
        fee: "$100",
        image: "https://placehold.co/600x400/007bff/ffffff?text=Dr+Johnson",
      },
      {
        name: "Dr. Michael Chen",
        specialty: "Dermatology",
        rating: 4.9,
        reviews: 312,
        location: "Skin Care Clinic",
        availability: "Mon-Sat 10AM-6PM",
        fee: "$80",
        image: "https://placehold.co/600x400/28a745/ffffff?text=Dr+Chen",
      },
      {
        name: "Dr. Emily Rodriguez",
        specialty: "Pediatrics",
        rating: 4.7,
        reviews: 189,
        location: "Children's Hospital",
        availability: "Tue-Thu 8AM-4PM",
        fee: "$90",
        image: "https://placehold.co/600x400/ffc107/ffffff?text=Dr+Rodriguez",
      },
      {
        name: "Dr. James Wilson",
        specialty: "Orthopedics",
        rating: 4.6,
        reviews: 278,
        location: "Sports Medicine Center",
        availability: "Mon-Fri 9AM-5PM",
        fee: "$120",
        image: "https://placehold.co/600x400/17a2b8/ffffff?text=Dr+Wilson",
      },
      {
        name: "Dr. Lisa Anderson",
        specialty: "Neurology",
        rating: 4.9,
        reviews: 156,
        location: "Neurological Institute",
        availability: "Wed-Fri 1PM-7PM",
        fee: "$110",
        image: "https://placehold.co/600x400/6610f2/ffffff?text=Dr+Anderson",
      },
      {
        name: "Dr. Robert Martinez",
        specialty: "General Medicine",
        rating: 4.5,
        reviews: 423,
        location: "Primary Care Clinic",
        availability: "Mon-Sun 9AM-9PM",
        fee: "$70",
        image: "https://placehold.co/600x400/dc3545/ffffff?text=Dr+Martinez",
      },
    ];
    await Doctor.insertMany(doctors);
    console.log('Doctors seeded');
  }
};

// === Routes ===
app.get('/api', (req, res) => res.json({ message: 'MediCare API Running' }));

// === Auth Routes ===
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { error } = signupSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { name, email, phone, password } = req.body;
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ name, email, phone, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name, email, phone } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// === Doctors ===
app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// === Appointments ===
app.get('/api/appointments', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate('doctor', 'name specialty')
      .populate('patient', 'name');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/appointments', auth, async (req, res) => {
  try {
    const { error } = appointmentValidationSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { doctorId, date, time, symptoms, phone } = req.body;
    const appointment =