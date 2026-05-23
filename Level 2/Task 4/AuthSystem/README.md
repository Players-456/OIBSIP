# Premium Full-Stack Authentication System

A comprehensive, production-ready authentication boilerplate built with Node.js, Express, MongoDB, and Vanilla JavaScript on the frontend. It features a modern, premium dark UI with glassmorphism effects and responsive design.

## Features

- **Frontend:**
  - Premium Dark/Light UI (Vanilla HTML/CSS/JS)
  - Responsive layout with glassmorphism aesthetics
  - Form validation with interactive error handling
  - Toast notifications for success/error messages
  - Show/Hide password toggle
  - Password strength indicator
  - Remember me functionality
  - Protected route handling on client-side

- **Backend:**
  - Node.js & Express API
  - MongoDB integration via Mongoose
  - JWT (JSON Web Tokens) based authentication
  - Password hashing via Bcrypt
  - Structured route and controller architecture
  - Duplicate email handling

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   - Rename `.env.example` to `.env`
   - Set up your `MONGO_URI`
   - Configure your `JWT_SECRET`

3. **Run the Server:**
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

4. **Access the Application:**
   Open your browser and navigate to `http://localhost:5000` (or the port defined in your `.env`).

## Architecture

- **`server/`**: Contains the backend API (Controllers, Models, Routes, Middleware, Config).
- **`client/`**: Contains the frontend static files (HTML, CSS, JS) served by Express.

## Acknowledgements

- Built by Dharmit Monani
- Oasis Infobyte Task 4
