# Healthcare-AI-watson-services
⚕️ MediCare - Healthcare Platform

MediCare is a full-stack web application designed to be a comprehensive healthcare platform. It allows patients to find doctors, book appointments, and manage their health interactions. The application features a complete backend with user authentication, an admin dashboard, and a dynamic frontend.

This project combines a vanilla JavaScript frontend with a robust Node.js, Express, and MongoDB backend.

✨ Features

Patient/User Features:

User Authentication: Secure user registration and login using JWT (Access & Refresh Tokens).

Find Doctors: View a list of all doctors, with the ability to search by name or filter by specialty.

Book Appointments: A seamless modal-based booking system to schedule appointments with a doctor.

View Appointments: A dedicated page for logged-in users to see their upcoming and past appointments.

Theme Toggle: Switch between a light and dark mode for user comfort.

AI Chatbot: Integrated IBM Watson Assistant for 24/7 support.

Admin Features:

Admin Dashboard: A protected admin-only section.

Statistics: View overview stats for total appointments, users, and doctors.

Manage Appointments: See a table of all appointments booked on the platform.

Manage Users: View a list of all registered patient accounts.

View Feedback: See all user-submitted feedback.

💻 Tech Stack

This project is built with the following technologies:

Frontend:

HTML5

CSS3 (with Flexbox & Grid)

Vanilla JavaScript (ES6+)

Backend:

Node.js

Express.js

MongoDB (Database)

Mongoose (ODM)

Authentication & Security:

JSON Web Token (JWT) for access and refresh tokens.

bcrypt.js for password hashing.

Helmet.js for securing HTTP headers.

CORS for cross-origin resource sharing.

express-rate-limit to prevent brute-force attacks.

Other Tools:

Zod for server-side input validation.

dotenv for environment variables.

Morgan for HTTP request logging.

IBM Watson Assistant for the AI chatbot.

🗂️ Project Structure

The project is organized into a single backend server and frontend client files:

/
├── index.html          # Main frontend HTML file
├── script.js           # All frontend JavaScript logic
├── styles.css          # All frontend styling
│
├── server.js           # The entire Node.js/Express backend (API, DB, Auth)
├── package.json        # Backend dependencies and scripts
│
├── .env                # (NOT FOR GIT) Secret environment variables
└── README.md           # This file


🚀 Getting Started

Follow these instructions to get a local copy up and running.

Prerequisites

Node.js (v14 or later)

MongoDB (running locally or a cloud instance like MongoDB Atlas)

npm (comes with Node.js)

1. Clone the Repository

git clone [https://github.com/your-username/medicare-project.git](https://github.com/your-username/medicare-project.git)
cd medicare-project


2. Backend Setup

Install dependencies:

npm install


Set up Environment Variables:
Create a file named .env in the root directory and add the following variables. (See .env.example for a template).

PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/medicare
JWT_SECRET=your_very_long_random_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
CLIENT_URL=[http://127.0.0.1:5500](http://127.0.0.1:5500)


Start the Backend Server:

For development (with automatic restarts):

npm run dev


For production:

npm start


The server will be running on http://localhost:5000. It will also automatically create a default admin user:

Email: admin@medicare.com

Password: admin123

3. Frontend Setup

Open the Frontend:
Simply open the index.html file in your web browser.

Note: For best results (and to avoid CORS issues if your CLIENT_URL is set), run it from a live server. If you use VS Code, you can use the "Live Server" extension.

You can now use the application! Register a new user or log in as the default admin to access the admin panel.

API Endpoints

Here are some of the key API endpoints available in the server.js file:

POST /api/auth/register: Register a new user.

POST /api/auth/login: Log in a user.

POST /api/auth/refresh: Refresh an expired access token.

GET /api/doctors: Get a list of all doctors (public).

POST /api/appointments: Book an appointment (user authenticated).

GET /api/appointments: Get appointments for the logged-in user (user authenticated).

GET /api/admin/stats: Get dashboard stats (admin only).

GET /api/admin/appointments: Get all appointments (admin only).

GET /api/admin/users: Get all users (admin only).

🧑‍💻 Author

Raj Kankane And Team
This is an example file.

Create a .env file in the root directory and add your own values.

DO NOT commit your .env file to Git.

Server Configuration

PORT=5000
NODE_ENV=development

MongoDB Connection

MONGO_URI=mongodb://127.0.0.1:27017/medicare

JWT Secrets (Use strong, random strings)

JWT_SECRET=your_very_long_random_jwt_secret_here_2025
JWT_REFRESH_SECRET=your_refresh_secret_2025

Frontend URL (for CORS)

If using VS Code Live Server, default is https://www.google.com/search?q=http://127.0.0.1:5500

CLIENT_URL=https://www.google.com/search?q=http://127.0.0.1:5500
