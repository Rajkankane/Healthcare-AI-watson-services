// --- UPGRADE: Encapsulated all application data into a single state object ---
const appState = {
  doctors: [
    {
      id: 1,
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
      id: 2,
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
      id: 3,
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
      id: 4,
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
      id: 5,
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
      id: 6,
      name: "Dr. Robert Martinez",
      specialty: "General Medicine",
      rating: 4.5,
      reviews: 423,
      location: "Primary Care Clinic",
      availability: "Mon-Sun 9AM-9PM",
      fee: "$70",
      image: "https://placehold.co/600x400/dc3545/ffffff?text=Dr+Martinez",
    },
    {
      id: 7,
      name: "Dr. Raj Kankane",
      specialty: "General Medicine",
      rating: 4.5,
      reviews: 423,
      location: "Primary Care Clinic",
      availability: "Mon-Sun 9AM-9PM",
      fee: "$70",
      image: "https://placehold.co/600x400/dc3545/ffffff?text=Dr+Raj",
    },
  ],
  appointments: [],
  users: [
    // --- UPGRADE: Added sample data here and included password for login demo ---
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "555-0101",
      joinDate: "2025-01-15",
      password: "password123",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "555-0102",
      joinDate: "2025-01-20",
      password: "password123",
    },
  ],
  feedback: [
    { id: 1, patient: "John Doe", rating: 5, comment: "Excellent service!" },
    { id: 2, patient: "Jane Smith", rating: 4, comment: "Good experience" },
  ],
  currentDoctor: null,
  isLoggedIn: false,
  currentUser: null,
};

// --- UPGRADE: Cached all DOM selectors for better performance ---
const domSelectors = {};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  // --- UPGRADE: Caching all selectors on load ---
  domSelectors.doctorsGrid = document.getElementById("doctorsGrid");
  domSelectors.searchDoctorInput = document.getElementById("searchDoctor");
  domSelectors.specialtyFilterInput = document.getElementById("specialtyFilter");
  domSelectors.authModal = document.getElementById("authModal");
  domSelectors.bookingModal = document.getElementById("bookingModal");
  domSelectors.authBtn = document.querySelector(".auth-btn");
  domSelectors.themeIcon = document.querySelector(".theme-icon");
  domSelectors.appointmentDate = document.getElementById("appointmentDate");
  domSelectors.appointmentsList = document.getElementById("appointmentsList");
  domSelectors.appointmentsTableBody = document.getElementById("appointmentsTableBody");
  domSelectors.usersTableBody = document.getElementById("usersTableBody");
  domSelectors.feedbackList = document.getElementById("feedbackList");
  domSelectors.totalAppointments = document.getElementById("totalAppointments");
  domSelectors.totalUsers = document.getElementById("totalUsers");

  loadTheme();
  renderDoctorGrid(appState.doctors); // --- UPGRADE: Changed from loadDoctors()
  setMinDate();
  updateAuthUI();
  
  // Load admin data on init
  updateAdminUsers();
  updateFeedbackDisplay();
});

// Navigation
function navigateTo(page) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  const targetPage = document.getElementById(page);
  if (targetPage) {
    targetPage.classList.add("active");
    window.scrollTo(0, 0);
  }
}

// Theme Toggle
function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark-mode") ? "dark" : "light"
  );
  updateThemeIcon();
}

function loadTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }
  updateThemeIcon();
}

function updateThemeIcon() {
  if (domSelectors.themeIcon) {
    domSelectors.themeIcon.textContent = document.body.classList.contains(
      "dark-mode"
    )
      ? "☀️"
      : "🌙";
  }
}

// --- UPGRADE: Created a reusable function to render a single doctor card ---
function renderDoctorCard(doctor) {
  return `
    <div class="doctor-card">
        <img src="${doctor.image}" alt="${doctor.name}" class="doctor-image">
        <div class="doctor-info">
            <h3>${doctor.name}</h3>
            <div class="doctor-specialty">${doctor.specialty}</div>
            <div class="doctor-rating">⭐ ${doctor.rating} (${doctor.reviews} reviews)</div>
            <div class="doctor-details">
                <p><strong>Location:</strong> ${doctor.location}</p>
                <p><strong>Available:</strong> ${doctor.availability}</p>
                <p><strong>Consultation Fee:</strong> ${doctor.fee}</p>
            </div>
            <button class="btn btn-primary" onclick="openBooking(${doctor.id})">Book Appointment</button>
        </div>
    </div>
  `;
}

// --- UPGRADE: Created a function to render the grid from a list of doctors ---
function renderDoctorGrid(doctorList) {
  if (!domSelectors.doctorsGrid) return;

  if (doctorList.length === 0) {
    domSelectors.doctorsGrid.innerHTML =
      '<p class="empty-message">No doctors found matching your criteria.</p>';
    return;
  }
  domSelectors.doctorsGrid.innerHTML = doctorList.map(renderDoctorCard).join("");
}

// Load Doctors (now just calls the renderer)
function loadDoctors() {
  renderDoctorGrid(appState.doctors);
}

// Filter Doctors
function filterDoctors() {
  const searchTerm = domSelectors.searchDoctorInput.value.toLowerCase();
  const specialty = domSelectors.specialtyFilterInput.value;

  const filtered = appState.doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm) ||
      doctor.specialty.toLowerCase().includes(searchTerm);
    const matchesSpecialty = !specialty || doctor.specialty === specialty;
    return matchesSearch && matchesSpecialty;
  });

  renderDoctorGrid(filtered); // --- UPGRADE: Re-using the render function
}

// Authentication
function openAuthModal() {
  domSelectors.authModal.classList.add("active");
}

function closeAuthModal() {
  domSelectors.authModal.classList.remove("active");
}

// --- UPGRADE: Added 'event' parameter. Assumes HTML is onclick="switchAuthTab(event, 'login')" ---
function switchAuthTab(event, tab) {
  document
    .querySelectorAll(".auth-tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document
    .querySelectorAll(".auth-form")
    .forEach((form) => form.classList.remove("active"));

  event.target.classList.add("active");
  document.getElementById(tab + "Form").classList.add("active");
}

// --- UPGRADE: Added a single handler for the main auth button (login/logout) ---
// Note: Your auth button in HTML should call this: onclick="handleAuthClick()"
function handleAuthClick() {
  if (appState.isLoggedIn) {
    // Log out
    appState.isLoggedIn = false;
    appState.currentUser = null;
    updateAuthUI();
    alert("Logged out successfully!");
  } else {
    // Log in
    openAuthModal();
  }
}

// --- UPGRADE: Centralized UI update for auth state ---
function updateAuthUI() {
  if (domSelectors.authBtn) {
    domSelectors.authBtn.textContent = appState.isLoggedIn ? "Logout" : "Login";
  }
}

// --- UPGRADE: More realistic login logic ---
function handleLogin(e) {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;

  const user = appState.users.find(
    (u) => u.email === email && u.password === password
  );

  if (user) {
    appState.isLoggedIn = true;
    appState.currentUser = user;
    alert("Login successful!");
    closeAuthModal();
    updateAuthUI();
  } else {
    alert("Invalid email or password.");
  }
}

// --- UPGRADE: More realistic signup logic (checks for existing user) ---
function handleSignup(e) {
  e.preventDefault();
  const name = e.target.signupName.value;
  const email = e.target.signupEmail.value;
  const password = e.target.signupPassword.value;
  const phone = e.target.signupPhone.value; // Get phone from form

  if (appState.users.find((u) => u.email === email)) {
    alert("An account with this email already exists.");
    return;
  }

  const newUser = {
    id: appState.users.length + 1,
    name: name,
    email: email,
    phone: phone, // Save phone
    joinDate: new Date().toISOString().split("T")[0],
    password: password,
  };

  appState.users.push(newUser);
  appState.isLoggedIn = true;
  appState.currentUser = newUser;
  
  alert("Signup successful!");
  closeAuthModal();
  updateAuthUI();
  updateAdminUsers(); // Update admin panel
}

// Booking
function openBooking(doctorId) {
  appState.currentDoctor = appState.doctors.find((d) => d.id === doctorId);
  domSelectors.bookingModal.classList.add("active");
}

function closeBookingModal() {
  domSelectors.bookingModal.classList.remove("active");
}

function setMinDate() {
  const today = new Date().toISOString().split("T")[0];
  if (domSelectors.appointmentDate) {
    domSelectors.appointmentDate.setAttribute("min", today);
  }
}

function submitBooking(e) {
  e.preventDefault();
  
  // --- UPGRADE: Check for login before booking ---
  if (!appState.isLoggedIn) {
      alert("Please log in to book an appointment.");
      closeBookingModal();
      openAuthModal();
      return;
  }

  const appointment = {
    id: appState.appointments.length + 1,
    doctor: appState.currentDoctor.name,
    specialty: appState.currentDoctor.specialty,
    date: document.getElementById("appointmentDate").value, // Not cached, inside modal
    time: document.getElementById("appointmentTime").value,
    symptoms: document.getElementById("symptoms").value,
    phone: document.getElementById("patientPhone").value,
    patientName: appState.currentUser.name,
    status: "Confirmed",
  };

  appState.appointments.push(appointment);
  alert("Appointment booked successfully!");
  closeBookingModal();
  displayAppointments();
  e.target.reset();
}

function displayAppointments() {
  const list = domSelectors.appointmentsList;
  if (appState.appointments.length === 0) {
    list.innerHTML =
      '<p class="empty-message">No appointments yet. <a href="#doctors" onclick="navigateTo(\'doctors\')">Book one now!</a></p>';
    return;
  }

  list.innerHTML = appState.appointments
    .map(
      (apt) => `
        <div class="appointment-item">
            <h4>Dr. ${apt.doctor} - ${apt.specialty}</h4>
            <div class="appointment-details">
                <div><strong>Date:</strong> ${apt.date}</div>
                <div><strong>Time:</strong> ${apt.time}</div>
                <div><strong>Status:</strong> <span style="color: var(--success-color)">${apt.status}</span></div>
            </div>
            <p><strong>Reason:</strong> ${apt.symptoms}</p>
        </div>
    `
    )
    .join("");

  // Update admin table
  updateAdminAppointments();
}

function updateAdminAppointments() {
  const tbody = domSelectors.appointmentsTableBody;
  if (!tbody) return;
  
  tbody.innerHTML = appState.appointments
    .map(
      (apt) => `
        <tr>
            <td>${apt.patientName}</td>
            <td>${apt.doctor}</td>
            <td>${apt.date}</td>
            <td>${apt.time}</td>
            <td><span style="color: var(--success-color)">${apt.status}</span></td>
            <td><button class="btn btn-secondary" onclick="alert('Action pending')">Edit</button></td>
        </tr>
    `
    )
    .join("");

  domSelectors.totalAppointments.textContent = appState.appointments.length;
}

function updateAdminUsers() {
  const tbody = domSelectors.usersTableBody;
  if (!tbody) return;
  
  tbody.innerHTML = appState.users
    .map(
      (user) => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.joinDate}</td>
            <td><button class="btn btn-secondary" onclick="alert('User management pending')">View</button></td>
        </tr>
    `
    )
    .join("");

  domSelectors.totalUsers.textContent = appState.users.length;
}

function updateFeedbackDisplay() {
  const feedbackList = domSelectors.feedbackList;
  if (!feedbackList) return;
  
  feedbackList.innerHTML = appState.feedback
    .map(
      (f) => `
        <div class="feedback-item">
            <div class="feedback-header">
                <strong>${f.patient}</strong>
                <span class="feedback-rating">⭐ ${f.rating}/5</span>
            </div>
            <p>${f.comment}</p>
        </div>
    `
    )
    .join("");
}

// Admin Tabs
// --- UPGRADE: Added 'event' parameter. Assumes HTML is onclick="switchAdminTab(event, 'dashboard')" ---
function switchAdminTab(event, tab) {
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document
    .querySelectorAll(".admin-tab")
    .forEach((t) => t.classList.remove("active"));

  event.target.classList.add("active");
  document.getElementById(tab + "-tab").classList.add("active");

  // Load data when switching tabs
  if (tab === "appointments") {
    updateAdminAppointments();
  } else if (tab === "users") {
    updateAdminUsers();
  } else if (tab === "feedback") {
    updateFeedbackDisplay();
  }
}

// --- ALL CHATBOT FUNCTIONS REMOVED ---

// Contact Form
function submitContactForm(e) {
  e.preventDefault();
  alert("Thank you for your message! We will get back to you soon.");
  e.target.reset();
}
function submitContactForm(e) {
  e.preventDefault();
  alert("Thank you for your message! We will get back to you soon.");
  e.target.reset();
}
function checkNearbyHealthcare() {
  window.open('https://www.google.com/maps/search/healthcare+near+me', '_blank');
}