

// --- Application State ---
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
      image: "https://github.com/Rajkankane/Healthcare-AI-watson-services/blob/main/images/Psychiatrist.jpg?raw=true",
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
      image: "https://github.com/Rajkankane/Healthcare-AI-watson-services/blob/main/images/dermatology.jpg?raw=true",
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
      image: "https://github.com/Rajkankane/Healthcare-AI-watson-services/blob/main/images/pediatrics.jpg?raw=true",
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
      image: "https://github.com/Rajkankane/Healthcare-AI-watson-services/blob/main/images/orthopedics.jpg?raw=true",
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
      image: "https://github.com/Rajkankane/Healthcare-AI-watson-services/blob/main/images/neurology%20(2).jpg?raw=true",
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
      image: "https://github.com/Rajkankane/Healthcare-AI-watson-services/blob/main/images/general-medicine.jpg?raw=true",
    },
    {
      id: 7,
      name: "Dr. Aliza Sen",
      specialty: "Psychiatrist",
      rating: 4.5,
      reviews: 923,
      location: "Happy Care Clinic",
      availability: "Mon-Sun 9AM-9PM",
      fee: "$70",
      image: "https://github.com/Rajkankane/Healthcare-AI-watson-services/blob/main/images/cardiology.jpg?raw=true",
    },
    {
      id: 8,
      name: "Dr. Jhon Calvin ",
      specialty: "Cardiology",
      rating: 4.8,
      reviews: 245,
      location: "MK Hospital Civil Line Ahmedabad",
      availability: "Mon-Fri 9AM-5PM",
      fee: "$80",
      image: "https://github.com/Rajkankane/Healthcare-AI-watson-services/blob/main/images/neurology.jpg?raw=true",
    },
    {
      id: 9,
      name: "Dr. Aliza Jain",
      specialty: "Neurology",
      rating: 4.9,
      reviews: 156,
      location: "Neurological Institute at Sola Civil  Ahmedabad ",
      availability: "Wed-Fri 1PM-7PM",
      fee: "$110",
      image: "https://github.com/Rajkankane/Healthcare-AI-watson-services/blob/main/images/orthopedics%20(2).jpg?raw=true",
    },
  ],
  appointments: [],
  users: [
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
    }
  ],
  feedback: [
    { id: 1, patient: "John Doe", rating: 5, comment: "Excellent service and quick consultation setup!" },
    { id: 2, patient: "Jane Smith", rating: 5, comment: "The symptom checker accurately directed me to Dr. Chen. Highly recommend!" },
  ],
  currentDoctor: null,
  isLoggedIn: false,
  currentUser: null,
  currentTestimonialIndex: 0,
  testimonialTimer: null,
};

// --- Fetch & Sync Data from dataStore.json ---
async function fetchDataStore() {
  try {
    const res = await fetch("dataStore.json");
    if (res.ok) {
      const data = await res.json();
      if (data.doctors && data.doctors.length > 0) {
        appState.doctors = data.doctors;
      }
      if (data.users && data.users.length > 0 && appState.users.length <= 3) {
        appState.users = data.users;
      }
      renderDoctorGrid(appState.doctors);
    }
  } catch (err) {
    console.info("Using embedded appState data fallback", err);
  }
}

// --- Local Data Persistence Sync ---
function loadPersistedData() {
  try {
    const savedAppts = localStorage.getItem("medicare_appointments");
    if (savedAppts) appState.appointments = JSON.parse(savedAppts);

    const savedUsers = localStorage.getItem("medicare_users");
    if (savedUsers) appState.users = JSON.parse(savedUsers);

    const activeUser = localStorage.getItem("medicare_active_user");
    if (activeUser) {
      appState.currentUser = JSON.parse(activeUser);
      appState.isLoggedIn = true;
    }
  } catch (err) {
    console.warn("Could not load persisted data from localStorage", err);
  }
}

function savePersistedData() {
  try {
    localStorage.setItem("medicare_appointments", JSON.stringify(appState.appointments));
    localStorage.setItem("medicare_users", JSON.stringify(appState.users));
    if (appState.currentUser) {
      localStorage.setItem("medicare_active_user", JSON.stringify(appState.currentUser));
    } else {
      localStorage.removeItem("medicare_active_user");
    }
  } catch (err) {
    console.warn("Could not save persisted data to localStorage", err);
  }
}

// --- Cached DOM Selectors ---
const domSelectors = {};

// --- Initialization on DOMContentLoaded ---
document.addEventListener("DOMContentLoaded", async () => {
  loadPersistedData();
  await fetchDataStore();

  // Cache key elements
  domSelectors.doctorsGrid = document.getElementById("doctorsGrid");
  domSelectors.searchDoctorInput = document.getElementById("searchDoctor");
  domSelectors.specialtyFilterInput = document.getElementById("specialtyFilter");
  domSelectors.sortFilterInput = document.getElementById("sortFilter");
  domSelectors.authModal = document.getElementById("authModal");
  domSelectors.bookingModal = document.getElementById("bookingModal");
  domSelectors.authBtn = document.querySelector(".auth-btn");
  domSelectors.themeIcon = document.querySelector(".theme-icon");
  domSelectors.appointmentDate = document.getElementById("appointmentDate");
  domSelectors.appointmentsList = document.getElementById("appointmentsList");
  domSelectors.userProfileBadge = document.getElementById("userProfileBadge");
  domSelectors.navUserName = document.getElementById("navUserName");
  domSelectors.navUserAvatar = document.getElementById("navUserAvatar");

  // Auxiliary UI feature inits
  initScrollProgress();
  initNavbarScroll();
  initScrollReveal();
  initCounters();
  initRippleEffect();
  initTestimonialSlider();
  initModalEvents();

  loadTheme();
  renderDoctorGrid(appState.doctors);
  setMinDate();
  updateAuthUI();
  displayAppointments();
});

// --------------------------------------------------------------------------
// THEME & NAVIGATION LOGIC
// --------------------------------------------------------------------------
function toggleTheme() {
  const isDark = document.body.classList.toggle("dark-mode");
  const mode = isDark ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", mode);
  localStorage.setItem("theme", mode);
  updateThemeIcon();
  showToast(`Switched to ${mode.toUpperCase()} theme mode`, "info");
}

function loadTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.body.classList.remove("dark-mode");
    document.documentElement.setAttribute("data-theme", "light");
  }
  updateThemeIcon();
}

function updateThemeIcon() {
  const iconElement = domSelectors.themeIcon || document.querySelector(".theme-icon");
  if (iconElement) {
    iconElement.textContent = document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
  }
}

function navigateTo(pageId) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  document.querySelectorAll(".nav-link").forEach((link) => link.classList.remove("active"));

  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const activeLink = document.querySelector(`.nav-link[href="#${pageId}"]`);
  if (activeLink) {
    activeLink.classList.add("active");
  }

  // Close mobile nav drawer if open
  const navLinksWrapper = document.getElementById("primary-navigation");
  if (navLinksWrapper && navLinksWrapper.classList.contains("open")) {
    navLinksWrapper.classList.remove("open");
  }
}

function toggleMobileMenu() {
  const navLinksWrapper = document.getElementById("primary-navigation");
  if (navLinksWrapper) {
    navLinksWrapper.classList.toggle("open");
  }
}

// --------------------------------------------------------------------------
// DOCTOR DIRECTORY RENDER & FILTERING
// --------------------------------------------------------------------------
function renderDoctorCard(doctor) {
  const fallbackImg = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400";
  return `
    <div class="doctor-card glass-card">
        <div class="doctor-img-wrapper">
          <img src="${doctor.image}" alt="${doctor.name}" class="doctor-image" onerror="this.onerror=null; this.src='${fallbackImg}';">
          <span class="doctor-fee-badge">${doctor.fee}</span>
        </div>
        <div class="doctor-info">
            <h3>${doctor.name}</h3>
            <div class="doctor-specialty">${doctor.specialty}</div>
            <div class="doctor-rating">⭐ ${doctor.rating} (${doctor.reviews} patient reviews)</div>
            <div class="doctor-details">
                <p>📍 <strong>Clinic:</strong> ${doctor.location}</p>
                <p>⏰ <strong>Hours:</strong> ${doctor.availability}</p>
            </div>
            <button class="btn btn-cyan-gradient ripple-btn full-width" onclick="openBooking(${doctor.id})">Book Consultation</button>
        </div>
    </div>
  `;
}

function renderDoctorGrid(doctorList) {
  if (!domSelectors.doctorsGrid) return;

  if (!doctorList || doctorList.length === 0) {
    domSelectors.doctorsGrid.innerHTML = `
      <div class="glass-card text-center" style="padding: 40px; grid-column: 1 / -1;">
        <p style="font-size: 1.1rem; color: var(--text-muted);">No doctors matching your criteria were found. Try resetting filters.</p>
      </div>
    `;
    return;
  }
  domSelectors.doctorsGrid.innerHTML = doctorList.map(renderDoctorCard).join("");
}

function filterDoctors() {
  const searchInput = domSelectors.searchDoctorInput || document.getElementById("searchDoctor");
  const specialtySelect = domSelectors.specialtyFilterInput || document.getElementById("specialtyFilter");
  const sortSelect = domSelectors.sortFilterInput || document.getElementById("sortFilter");

  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const specialty = specialtySelect ? specialtySelect.value.trim() : "";
  const sortBy = sortSelect ? sortSelect.value : "rating-desc";

  let filtered = appState.doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm) ||
      doc.specialty.toLowerCase().includes(searchTerm) ||
      doc.location.toLowerCase().includes(searchTerm);
    const matchesSpecialty = !specialty || doc.specialty.toLowerCase() === specialty.toLowerCase();
    return matchesSearch && matchesSpecialty;
  });

  // Sorting
  if (sortBy === "rating-desc") {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === "fee-asc") {
    filtered.sort((a, b) => parseInt(a.fee.replace(/\D/g, "")) - parseInt(b.fee.replace(/\D/g, "")));
  } else if (sortBy === "name-asc") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  renderDoctorGrid(filtered);
}

// --------------------------------------------------------------------------
// AUTHENTICATION MODAL & LOGIC
// --------------------------------------------------------------------------
function openAuthModal() {
  if (domSelectors.authModal) {
    domSelectors.authModal.classList.add("active");
  }
}

function closeAuthModal() {
  if (domSelectors.authModal) {
    domSelectors.authModal.classList.remove("active");
  }
}

function switchAuthTab(event, tab) {
  document.querySelectorAll(".auth-tab-btn").forEach((btn) => btn.classList.remove("active"));
  document.querySelectorAll(".auth-form").forEach((form) => form.classList.remove("active"));

  if (event && event.target) {
    event.target.classList.add("active");
  }
  const targetForm = document.getElementById(tab + "Form");
  if (targetForm) {
    targetForm.classList.add("active");
  }
}

function handleAuthClick() {
  if (appState.isLoggedIn) {
    appState.isLoggedIn = false;
    appState.currentUser = null;
    savePersistedData();
    updateAuthUI();
    showToast("Successfully logged out.", "info");
  } else {
    openAuthModal();
  }
}

function updateAuthUI() {
  const authBtn = domSelectors.authBtn || document.querySelector(".auth-btn");
  if (authBtn) {
    const btnSpan = authBtn.querySelector("span");
    if (btnSpan) {
      btnSpan.textContent = appState.isLoggedIn ? "Logout" : "Login / Sign Up";
    } else {
      authBtn.textContent = appState.isLoggedIn ? "Logout" : "Login / Sign Up";
    }
  }

  const badge = domSelectors.userProfileBadge || document.getElementById("userProfileBadge");
  if (badge) {
    if (appState.isLoggedIn && appState.currentUser) {
      badge.classList.remove("hidden");
      if (domSelectors.navUserName) domSelectors.navUserName.textContent = appState.currentUser.name;
      if (domSelectors.navUserAvatar) domSelectors.navUserAvatar.textContent = appState.currentUser.name.charAt(0).toUpperCase();
    } else {
      badge.classList.add("hidden");
    }
  }
}

function handleLogin(e) {
  e.preventDefault();
  const email = e.target.email.value.trim();
  const password = e.target.password.value;

  const user = appState.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (user) {
    appState.isLoggedIn = true;
    appState.currentUser = user;
    savePersistedData();
    showToast(`Welcome back, ${user.name}!`, "success");
    closeAuthModal();
    updateAuthUI();
  } else {
    showToast("Invalid email or password.", "danger");
  }
}

function handleSignup(e) {
  e.preventDefault();
  const name = e.target.signupName.value.trim();
  const email = e.target.signupEmail.value.trim();
  const password = e.target.signupPassword.value;
  const phone = e.target.signupPhone.value.trim();

  if (appState.users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    showToast("An account with this email already exists.", "warning");
    return;
  }

  const newUser = {
    id: appState.users.length + 1,
    name: name,
    email: email,
    phone: phone,
    joinDate: new Date().toISOString().split("T")[0],
    password: password,
  };

  appState.users.push(newUser);
  appState.isLoggedIn = true;
  appState.currentUser = newUser;
  savePersistedData();

  showToast("Signup successful! Welcome to MediCare.", "success");
  closeAuthModal();
  updateAuthUI();
}

// --------------------------------------------------------------------------
// APPOINTMENT BOOKING SYSTEM
// --------------------------------------------------------------------------
function openBooking(doctorId) {
  appState.currentDoctor = appState.doctors.find((d) => d.id === doctorId);
  if (!appState.currentDoctor) return;

  const modalDoctorHeader = document.getElementById("modalDoctorHeader");
  if (modalDoctorHeader) {
    modalDoctorHeader.innerHTML = `
      <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px; padding: 12px; background: rgba(6,182,212,0.1); border-radius: 12px;">
        <img src="${appState.currentDoctor.image}" alt="${appState.currentDoctor.name}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400';">
        <div>
          <h3 style="margin: 0; font-size: 1.1rem;">${appState.currentDoctor.name}</h3>
          <p style="margin: 2px 0; color: var(--primary-color); font-weight: 600; font-size: 0.9rem;">${appState.currentDoctor.specialty} • ${appState.currentDoctor.fee}</p>
          <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">📍 ${appState.currentDoctor.location}</p>
        </div>
      </div>
    `;
  }

  if (domSelectors.bookingModal) {
    domSelectors.bookingModal.classList.add("active");
  }
}

function closeBookingModal() {
  if (domSelectors.bookingModal) {
    domSelectors.bookingModal.classList.remove("active");
  }
}

function setMinDate() {
  const today = new Date().toISOString().split("T")[0];
  if (domSelectors.appointmentDate) {
    domSelectors.appointmentDate.setAttribute("min", today);
  }
}

function submitBooking(e) {
  e.preventDefault();

  if (!appState.isLoggedIn) {
    showToast("Please log in to book an appointment.", "warning");
    closeBookingModal();
    openAuthModal();
    return;
  }

  const dateInput = document.getElementById("appointmentDate");
  const timeInput = document.getElementById("appointmentTime");
  const symptomsInput = document.getElementById("symptoms");
  const phoneInput = document.getElementById("patientPhone");

  const appointment = {
    id: `APT-${1000 + appState.appointments.length + 1}`,
    doctor: appState.currentDoctor ? appState.currentDoctor.name : "Specialist Doctor",
    specialty: appState.currentDoctor ? appState.currentDoctor.specialty : "General Medicine",
    date: dateInput ? dateInput.value : new Date().toISOString().split("T")[0],
    time: timeInput ? timeInput.value : "10:00 AM",
    symptoms: symptomsInput ? symptomsInput.value : "General Consultation",
    phone: phoneInput ? phoneInput.value : appState.currentUser.phone,
    patientName: appState.currentUser.name,
    status: "Confirmed",
  };

  appState.appointments.push(appointment);
  savePersistedData();
  showToast("Appointment booked successfully!", "success");
  closeBookingModal();
  displayAppointments();
  e.target.reset();
}

function displayAppointments() {
  const list = domSelectors.appointmentsList || document.getElementById("appointmentsList");
  if (!list) return;

  if (appState.appointments.length === 0) {
    list.innerHTML = `
      <div class="empty-message glass-card text-center">
          <div style="font-size: 2.8rem; margin-bottom: 10px;">📅</div>
          <h3>No Appointments Scheduled Yet</h3>
          <p>You haven't scheduled any consultations. Browse our doctors and book your first slot today!</p>
          <button class="btn btn-cyan-gradient ripple-btn" onclick="navigateTo('doctors')" style="margin-top: 15px;">
              <span>Browse Doctors Grid</span>
          </button>
      </div>
    `;
    return;
  }

  list.innerHTML = appState.appointments
    .map(
      (apt) => `
        <div class="appointment-item glass-card" style="padding: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h4 style="margin: 0; font-size: 1.15rem; color: var(--text-color);">${apt.doctor} <span style="color: var(--primary-color); font-weight: 500; font-size: 0.95rem;">(${apt.specialty})</span></h4>
              <span style="background: rgba(16, 185, 129, 0.15); color: var(--success-color); padding: 4px 14px; border-radius: 20px; font-size: 0.82rem; font-weight: 700;">${apt.status}</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; font-size: 0.9rem; margin-bottom: 10px; color: var(--text-light);">
                <div>📅 <strong>Date:</strong> ${apt.date}</div>
                <div>⏰ <strong>Time:</strong> ${apt.time}</div>
                <div>📞 <strong>Phone:</strong> ${apt.phone}</div>
                <div>👤 <strong>Patient:</strong> ${apt.patientName}</div>
            </div>
            <p style="margin: 0; font-size: 0.9rem; color: var(--text-muted);"><strong>Reason:</strong> ${apt.symptoms}</p>
        </div>
    `
    )
    .join("");
}

// --------------------------------------------------------------------------
// HEALTH TOOL 1: AI SYMPTOM CHECKER & TRIAGE
// --------------------------------------------------------------------------
function calculateSymptomTriage(e) {
  e.preventDefault();
  const checkedSymptoms = Array.from(document.querySelectorAll('input[name="symptom"]:checked')).map(
    (cb) => cb.value
  );
  const severity = document.getElementById("symptomSeverity").value;

  const resultBox = document.getElementById("triageResultBox");
  const badge = document.getElementById("triageStatusBadge");
  const title = document.getElementById("triageTitle");
  const advice = document.getElementById("triageAdviceText");
  const docRec = document.getElementById("triageDocRecommend");

  if (!resultBox || !advice) return;

  if (checkedSymptoms.length === 0) {
    showToast("Please select at least one symptom.", "warning");
    return;
  }

  // Triage algorithm
  let targetSpecialty = "General Medicine";
  let recommendedDoctor = appState.doctors.find((d) => d.specialty === "General Medicine") || appState.doctors[0];

  if (checkedSymptoms.includes("chest_pain")) {
    targetSpecialty = "Cardiology";
  } else if (checkedSymptoms.includes("skin_rash")) {
    targetSpecialty = "Dermatology";
  } else if (checkedSymptoms.includes("headache_dizziness")) {
    targetSpecialty = "Neurology";
  } else if (checkedSymptoms.includes("joint_pain")) {
    targetSpecialty = "Orthopedics";
  } else if (checkedSymptoms.includes("child_fever")) {
    targetSpecialty = "Pediatrics";
  } else if (checkedSymptoms.includes("anxiety_stress")) {
    targetSpecialty = "Psychiatrist";
  }

  const specMatch = appState.doctors.find((d) => d.specialty.toLowerCase() === targetSpecialty.toLowerCase());
  if (specMatch) recommendedDoctor = specMatch;

  if (severity === "severe" || checkedSymptoms.includes("chest_pain")) {
    badge.className = "status-pill danger";
    badge.textContent = "Urgent Care Recommended";
    title.textContent = `High Priority: Consult a ${targetSpecialty} Specialist Immediately`;
    advice.textContent = `Based on your selected symptoms (${checkedSymptoms.length} reported) and severe rating, we strongly recommend booking an immediate video consultation or visiting an ER if experiencing acute chest distress.`;
  } else if (severity === "moderate") {
    badge.className = "status-pill warning";
    badge.textContent = "Recommended Consultation";
    title.textContent = `Suggested Specialty: ${targetSpecialty}`;
    advice.textContent = `Your symptoms indicate a consultation with a ${targetSpecialty} physician would be beneficial within the next 24-48 hours.`;
  } else {
    badge.className = "status-pill info";
    badge.textContent = "Routine Checkup";
    title.textContent = `Suggested Specialty: ${targetSpecialty}`;
    advice.textContent = `Mild symptoms detected. Schedule a routine virtual session with our verified ${targetSpecialty} doctor at your convenience.`;
  }

  docRec.innerHTML = `
    <div class="triage-doctor-card">
      <div>
        <h4 style="margin: 0; font-size: 1rem;">${recommendedDoctor.name}</h4>
        <p style="margin: 2px 0; font-size: 0.85rem; color: var(--primary-color); font-weight: 600;">${recommendedDoctor.specialty} Specialist • ${recommendedDoctor.fee}</p>
      </div>
      <button type="button" class="btn btn-cyan-gradient ripple-btn" style="padding: 6px 14px; font-size: 0.85rem;" onclick="openBooking(${recommendedDoctor.id})">Book ${recommendedDoctor.name.split(" ")[1]} ➔</button>
    </div>
  `;

  resultBox.classList.remove("hidden");
  resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// --------------------------------------------------------------------------
// HEALTH TOOL 2: BMI & WELLNESS CALCULATOR
// --------------------------------------------------------------------------
function calculateBMI(e) {
  e.preventDefault();
  const heightCm = parseFloat(document.getElementById("bmiHeight").value);
  const weightKg = parseFloat(document.getElementById("bmiWeight").value);

  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
    showToast("Please enter valid height and weight numbers.", "warning");
    return;
  }

  const heightM = heightCm / 100;
  const bmi = (weightKg / (heightM * heightM)).toFixed(1);

  const resultBox = document.getElementById("bmiResultBox");
  const scoreNum = document.getElementById("bmiScoreNumber");
  const badge = document.getElementById("bmiCategoryBadge");
  const title = document.getElementById("bmiCategoryTitle");
  const rangeText = document.getElementById("bmiRangeText");
  const pointer = document.getElementById("bmiPointer");
  const adviceBox = document.getElementById("bmiAdviceBox");

  if (!resultBox || !scoreNum) return;

  scoreNum.textContent = bmi;

  // Ideal weight range calculation (BMI 18.5 - 24.9)
  const minIdeal = (18.5 * heightM * heightM).toFixed(1);
  const maxIdeal = (24.9 * heightM * heightM).toFixed(1);
  rangeText.textContent = `Ideal weight range for ${heightCm} cm: ${minIdeal} kg - ${maxIdeal} kg`;

  let category = "";
  let badgeStyle = "";
  let pointerPos = "50%";
  let tips = "";

  if (bmi < 18.5) {
    category = "Underweight";
    badgeStyle = "background: rgba(96, 165, 250, 0.2); color: #3b82f6;";
    pointerPos = `${Math.max(5, (bmi / 18.5) * 25)}%`;
    tips = "💡 <strong>Wellness Tip:</strong> Focus on nutrient-dense meals, protein intake, and resistance training to build healthy muscle mass.";
  } else if (bmi >= 18.5 && bmi <= 24.9) {
    category = "Normal Weight";
    badgeStyle = "background: rgba(52, 211, 153, 0.2); color: #10b981;";
    pointerPos = `${25 + ((bmi - 18.5) / 6.4) * 25}%`;
    tips = "🎉 <strong>Great Job!</strong> You are in a healthy BMI range. Maintain balanced nutrition and at least 150 minutes of moderate activity weekly.";
  } else if (bmi >= 25 && bmi <= 29.9) {
    category = "Overweight";
    badgeStyle = "background: rgba(251, 191, 36, 0.2); color: #f59e0b;";
    pointerPos = `${50 + ((bmi - 25) / 4.9) * 25}%`;
    tips = "⚠️ <strong>Wellness Tip:</strong> Consider increasing daily physical activity and adopting a fiber-rich, low-glycemic diet.";
  } else {
    category = "Obese Range";
    badgeStyle = "background: rgba(248, 113, 113, 0.2); color: #ef4444;";
    pointerPos = `${Math.min(95, 75 + ((bmi - 30) / 10) * 25)}%`;
    tips = "🏥 <strong>Medical Insight:</strong> We recommend consulting with our General Medicine or Nutrition specialists for a personalized plan.";
  }

  badge.textContent = category;
  badge.style.cssText = badgeStyle;
  title.textContent = category;
  pointer.style.left = pointerPos;
  adviceBox.innerHTML = tips;

  resultBox.classList.remove("hidden");
  resultBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// --------------------------------------------------------------------------
// CONTACT FORM & HEALTHCARE SEARCH
// --------------------------------------------------------------------------
function submitContactForm(e) {
  e.preventDefault();
  showToast("Thank you! Your message has been sent to our medical team.", "success");
  e.target.reset();
}

function checkNearbyHealthcare() {
  window.open("https://www.google.com/maps/search/healthcare+near+me", "_blank");
}

// --------------------------------------------------------------------------
// DYNAMIC TESTIMONIAL SLIDER & REAL-TIME REVIEW SYSTEM
// --------------------------------------------------------------------------
function renderTestimonials() {
  const container = document.getElementById("testimonialContainer");
  const dotsContainer = document.getElementById("sliderDots");
  if (!container || !dotsContainer) return;

  if (appState.feedback.length === 0) {
    container.innerHTML = `<p class="text-center">No patient reviews yet. Be the first to leave a review!</p>`;
    dotsContainer.innerHTML = "";
    return;
  }

  container.innerHTML = appState.feedback
    .map((item, idx) => {
      const initials = (item.patient || item.user || "Patient")
        .split(" ")
        .map((n) => n.charAt(0))
        .join("")
        .toUpperCase();
      const stars = "⭐".repeat(Math.floor(item.rating)) + (item.rating % 1 !== 0 ? ".5" : "");

      return `
        <div class="testimonial-slide ${idx === appState.currentTestimonialIndex ? "active" : ""}">
            <div class="testimonial-rating">${stars}</div>
            <p class="testimonial-text">"${item.comment}"</p>
            <div class="testimonial-author">
                <span class="author-avatar">${initials}</span>
                <div>
                    <h4 class="author-name">${item.patient || item.user || "Verified Patient"}</h4>
                    <span class="author-role">Verified Patient Review</span>
                </div>
            </div>
        </div>
      `;
    })
    .join("");

  dotsContainer.innerHTML = appState.feedback
    .map(
      (_, idx) => `
        <span class="dot ${idx === appState.currentTestimonialIndex ? "active" : ""}" onclick="goToTestimonial(${idx})"></span>
      `
    )
    .join("");
}

function initTestimonialSlider() {
  renderTestimonials();

  function showSlide(index) {
    const slides = document.querySelectorAll(".testimonial-slide");
    const dots = document.querySelectorAll(".slider-dots .dot");
    if (slides.length === 0) return;

    slides.forEach((s) => s.classList.remove("active"));
    dots.forEach((d) => d.classList.remove("active"));

    appState.currentTestimonialIndex = (index + slides.length) % slides.length;
    if (slides[appState.currentTestimonialIndex]) {
      slides[appState.currentTestimonialIndex].classList.add("active");
    }
    if (dots[appState.currentTestimonialIndex]) {
      dots[appState.currentTestimonialIndex].classList.add("active");
    }
  }

  window.nextTestimonial = () => showSlide(appState.currentTestimonialIndex + 1);
  window.prevTestimonial = () => showSlide(appState.currentTestimonialIndex - 1);
  window.goToTestimonial = (idx) => showSlide(idx);

  if (appState.testimonialTimer) clearInterval(appState.testimonialTimer);
  appState.testimonialTimer = setInterval(() => {
    showSlide(appState.currentTestimonialIndex + 1);
  }, 6000);
}

function openReviewModal() {
  const modal = document.getElementById("reviewModal");
  if (modal) modal.classList.add("active");
}

function closeReviewModal() {
  const modal = document.getElementById("reviewModal");
  if (modal) modal.classList.remove("active");
}

function submitReview(e) {
  e.preventDefault();
  const name = document.getElementById("reviewName").value.trim();
  const rating = parseFloat(document.getElementById("reviewRating").value);
  const comment = document.getElementById("reviewComment").value.trim();

  if (!name || !comment) {
    showToast("Please fill out all review fields.", "warning");
    return;
  }

  const newFeedback = {
    id: appState.feedback.length + 1,
    patient: name,
    rating: rating,
    comment: comment,
  };

  appState.feedback.push(newFeedback);
  appState.currentTestimonialIndex = appState.feedback.length - 1;
  savePersistedData();
  renderTestimonials();
  closeReviewModal();
  showToast("Thank you for your review! It has been posted live.", "success");
  e.target.reset();
}

// --------------------------------------------------------------------------
// UTILITY FEATURES & ANIMATIONS
// --------------------------------------------------------------------------
function showToast(message, type = "info") {
  const toastContainer = document.getElementById("toastContainer");
  if (!toastContainer) return;

  const toast = document.createElement("div");
  toast.className = `toast glass-card`;
  toast.style.cssText = `
    padding: 12px 18px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.9rem;
    font-weight: 500;
    box-shadow: var(--shadow-lg);
    border-left: 4px solid var(--primary-color);
  `;

  const icons = { success: "✅", danger: "❌", warning: "⚠️", info: "ℹ️" };
  if (type === "success") toast.style.borderLeftColor = "var(--success-color)";
  if (type === "danger") toast.style.borderLeftColor = "var(--error-color)";
  if (type === "warning") toast.style.borderLeftColor = "var(--warning-color)";

  toast.innerHTML = `<span>${icons[type] || "ℹ️"}</span> <span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function initScrollProgress() {
  const scrollProgress = document.getElementById("scrollProgress");
  const backToTop = document.getElementById("backToTop");

  window.addEventListener("scroll", () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
    if (scrollProgress) scrollProgress.style.width = `${progress}%`;

    if (backToTop) {
      if (window.scrollY > 300) backToTop.classList.add("show");
      else backToTop.classList.remove("show");
    }
  });
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function initNavbarScroll() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
  });
}

function initScrollReveal() {
  const observerOptions = { threshold: 0.1 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("active");
    });
  }, observerOptions);

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

function initCounters() {
  const counters = document.querySelectorAll(".counter");
  if (counters.length === 0) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const counter = entry.target;
        const target = +counter.getAttribute("data-target");
        let count = 0;
        const speed = target / 40;

        const update = () => {
          count += speed;
          if (count < target) {
            counter.innerText = Math.ceil(count);
            setTimeout(update, 30);
          } else {
            counter.innerText = target;
          }
        };

        update();
        obs.unobserve(counter);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach((c) => observer.observe(c));
}

function initRippleEffect() {
  document.addEventListener("click", function (e) {
    const btn = e.target.closest(".ripple-btn");
    if (!btn) return;

    const circle = document.createElement("span");
    const diameter = Math.max(btn.clientWidth, btn.clientHeight);
    const radius = diameter / 2;

    const rect = btn.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - rect.left - radius}px`;
    circle.style.top = `${e.clientY - rect.top - radius}px`;
    circle.classList.add("ripple-span");

    const existing = btn.querySelector(".ripple-span");
    if (existing) existing.remove();

    btn.appendChild(circle);
  });
}

function initModalEvents() {
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAuthModal();
      closeBookingModal();
      closeReviewModal();
    }
  });

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active");
      }
    });
  });
}
