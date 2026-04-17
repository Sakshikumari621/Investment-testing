# Investment Dashboard Platform

A full-stack, production-ready investment platform featuring a secure authentication system, an aesthetic React dashboard, and an integrated Admin panel (AdminJS) for managing users, deposits, and payouts.

## Setup Instructions

This application comes pre-configured with a dual environment. You do not need MongoDB installed locally to test it; the system will automatically spin up a temporary memory database for you if a local one is not found!

### 1. Prerequisites
- [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
- Git (optional)

### 2. Installation
Open your terminal inside this folder and install the dependencies:
```bash
npm install
```

### 3. Environment Configuration
Duplicate the `.env.example` file and rename the new file to `.env`:
- Review the variables inside. 
- You can change the `ADMIN_EMAIL` and `ADMIN_PASSWORD` to secure your admin panel.

### 4. Running the Application

**For Development Mode:**
To run both the backend and frontend concurrently with hot-reloading:
```bash
npm run dev:all
```

**For Production Mode (Recommended for testing handover):**
1. First, build the frontend React application:
   ```bash
   npm run build
   ```
2. Make sure your `.env` specifies `NODE_ENV=production`.
3. Start the unified monolithic server:
   ```bash
   npm start
   ```

The application will now be running on [http://localhost:5000](http://localhost:5000).

## Admin Features
You can access the backend management portal at **[http://localhost:5000/admin](http://localhost:5000/admin)** using the credentials from your `.env` file. Within the admin panel, you can:
- View all registered users and their balances.
- Track deposits and mark payouts as Approved/Rejected.

## Tech Stack
- Frontend: React 19, Vite, Chart.js, Tailwind/Custom CSS
- Server: Node.js, Express 5
- Database: MongoDB (via Mongoose), AdminJS
- Security: bcryptjs (password hashing), JWT (sessions), Helmet & Rate limiting
