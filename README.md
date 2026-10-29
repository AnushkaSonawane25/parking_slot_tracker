# College Parking Slot Tracker 🚗

A full-stack parking management application for a college campus. Students, faculty, and visitors can check vehicles into available slots and review the parking session when checking out. Slot availability and vehicle details are stored in MongoDB.

---

## 📌 Features

1. **Dashboard Overview**:
   - Live summary metrics: **Total Parking Slots**, **Available Slots**, and **Occupied Slots**.
   - Metric counters update automatically on every slot status change without extra network roundtrips.
2. **Interactive 12-Slot Parking Grid**:
   - Displays 12 designated campus slots numbered `P1` through `P12`.
   - Clear visual indicators: **Green** for Available, **Red** for Occupied.
   - Distinct car icons and status badges on every slot card.
   - Check into an available slot with a vehicle plate, vehicle type, and campus role.
   - Check out an occupied slot after reviewing its session summary.
3. **Filter System**:
   - Filter slots by **All Slots**, **Available**, or **Occupied**.
   - Filtering dynamically adjusts the view without mutating underlying data.
4. **Safe Reset Functionality**:
   - One-click **Reset Parking** button restores all slots to "Available" and clears vehicle details.
   - Includes a confirmation dialog to prevent accidental resets.
5. **Database Persistence**:
   - Backed by MongoDB using Mongoose.
   - Page refresh or server restart retains the last recorded parking statuses.
   - Automatically seeds 12 slots (P1-P12) when the database is empty.

---

## 🛠️ Technologies Used

### Frontend
- **HTML5 & CSS3**: Semantic layout and responsive design system (custom variables, no heavy external CSS frameworks).
- **JavaScript (ES6+)**: Functional, modern, beginner-friendly code.
- **React.js**: Modular component architecture (`useState`, `useEffect`, props, conditional rendering).
- **Vite**: Ultra-fast build tool and local development server with API proxying.

### Backend
- **Node.js**: Asynchronous JavaScript runtime environment.
- **Express.js**: RESTful API server for handling HTTP requests (`GET`, `PATCH`, `POST`).
- **CORS & Dotenv**: Cross-Origin Resource Sharing and environment variable management.

### Database
- **MongoDB Community Server**: Local NoSQL document database.
- **Mongoose**: ODM (Object Data Modeling) library for schema definition and database queries.

---

## 📁 Project Structure

```text
parking-slot-tracker/
├── client/                     # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/         # Modular React components
│   │   │   ├── CheckInModal.jsx
│   │   │   ├── CheckOutModal.jsx
│   │   │   ├── ConfirmationModal.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ParkingSlot.jsx
│   │   │   └── SummaryCard.jsx
│   │   ├── App.css             # Main styling & responsive grid rules
│   │   ├── App.jsx             # Top-level state and API handler
│   │   ├── index.css           # Global CSS variables & typography
│   │   └── main.jsx            # React root mount point
│   ├── index.html              # HTML entry page
│   ├── package-lock.json       # Locked frontend dependencies
│   ├── package.json            # Frontend dependencies & scripts
│   └── vite.config.js          # Vite config with API proxy
├── server/                     # Backend (Node.js + Express)
│   ├── models/
│   │   └── Slot.js             # Mongoose schema for parking slots
│   ├── routes/
│   │   └── slotRoutes.js       # Express REST API routes
│   ├── .env.example            # Sample configuration (copy to .env)
│   ├── package-lock.json       # Locked backend dependencies
│   ├── package.json            # Backend dependencies & scripts
│   └── server.js               # Main Express entry point & DB seeding
├── .gitignore                  # Git ignore rules
└── README.md                   # Project documentation
```

---

## ⚙️ Prerequisites & Database Setup

1. **Node.js**: Verify that Node.js is installed (`v18` or later recommended):
   ```bash
   node -v
   npm -v
   ```
2. **MongoDB Community Server**:
   - Ensure MongoDB is installed and the `MongoDB` service is running locally on port `27017`.
   - On Windows, you can verify via PowerShell:
     ```powershell
     Get-Service -Name *mongo*
     ```
   - If not running, start the service in PowerShell (Run as Administrator):
     ```powershell
     net start MongoDB
     ```

---

## 🚀 Installation & Running the Application

Open **two separate terminal windows** (one for the server and one for the client).

### Terminal 1: Backend Server (Port 5000)

```bash
# 1. Navigate to the server folder
cd server

# 2. Install dependencies
npm install

# 3. Create your local environment file from the example
cp .env.example .env

# 4. Start the backend server
npm start
```

You should see:
```text
Connected to MongoDB successfully.
Successfully seeded 12 parking slots into MongoDB.
Server is running on http://localhost:5000
```

### Terminal 2: Frontend Client (Port 5173)

```bash
# 1. Navigate to the client folder
cd client

# 2. Install dependencies
npm install

# 3. Start the Vite development server
npm run dev
```

You should see:
```text
  VITE v8.3.5  ready in 199 ms

  ➜  Local:   http://localhost:5173/
```

Open your browser and navigate to:
👉 **`http://localhost:5173/`**

---

## 🌐 API Endpoint Documentation

Base URL: `http://localhost:5000/api/slots`

| Method | Endpoint | Description | Request Body | Response Format |
|---|---|---|---|---|
| **GET** | `/api/slots` | Retrieve all 12 slots sorted numerically | None | `{ success: true, count: 12, data: [...] }` |
| **PATCH** | `/api/slots/:id` | Check in or check out a vehicle | Check-in: `{ "status": "Occupied", "vehicleNumber": "MH 12 AB 1234", "vehicleType": "Car", "userRole": "Student" }`; check-out: `{ "status": "Available" }` | `{ success: true, message: "...", data: {...} }` |
| **POST** | `/api/slots/reset` | Restore all slots to "Available" and clear vehicle details | None | `{ success: true, message: "...", data: [...] }` |

---

## 🔍 How to View Data in MongoDB Compass

1. Launch **MongoDB Compass**.
2. Connect using the standard local connection string:
   ```text
   mongodb://localhost:27017
   ```
3. Locate the database: **`parking_tracker`**.
4. Click on the collection: **`slots`**.
5. You will see 12 documents corresponding to `P1` through `P12` with their current status (`Available` or `Occupied`).
6. Click any slot in the browser app, then click the **Refresh** button in MongoDB Compass to observe the immediate update.

---

## ❓ Common Troubleshooting Steps

1. **Error: "Unable to connect to the backend server"**
   - Ensure the server terminal is running (`node server.js` inside `server/`).
   - Check if port `5000` is already in use by another application.
2. **Error: "MongoDB connection failed"**
   - Make sure the local MongoDB Community Server service is active.
   - Run `net start MongoDB` in an administrative terminal or check Windows Services (`services.msc`).
3. **CORS issues when running independently**
   - The backend includes `cors()` middleware and Vite is configured with proxy rules in `vite.config.js`. Ensure you access the app via `http://localhost:5173/`.
