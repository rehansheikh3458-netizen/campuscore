# CampusCore — Student Management System

A beginner-friendly, production-ready Full-Stack Student Management System built for colleges, schools, and academic institutions.

---

## Tech Stack

* **Frontend**: React 18, Vite, JavaScript, CSS3
* **Icons**: [Lucide React](https://lucide.dev)
* **Backend**: Node.js & Express (ES Modules)
* **Database**: MongoDB Atlas using Mongoose ODM
* **Authentication**: JSON Web Tokens (JWT) with bcrypt password hashing & role-based access control (RBAC)

---

## Key Features

1. **Role-Based Authentication**:
   * **Admin**: Complete CRUD management of students, faculty, courses, classes, attendance, marks, announcements, institution settings, and CSV exports.
   * **Teacher**: Manage assigned classes, record daily student attendance, enter academic marks, post announcements, and export reports.
   * **Student**: View personalized student portal with own attendance rate, exam report cards, and campus notices.
2. **Dashboard with Real-Time Statistics**:
   * Total students, active students, faculty count, courses, classes, today's attendance compliance breakdown (Present, Absent, Late), and course enrollment distributions.
3. **Student Directory (Full CRUD)**:
   * Add new students, view complete profiles, edit records, and safely delete students.
   * Real-time search across names, emails, and enrollment numbers.
   * Instant filter by course, class section, and enrollment status.
   * Option to automatically generate student portal login credentials.
4. **Faculty & Teacher Management**:
   * Full faculty directory with employee IDs, designations, departments, qualifications, and assigned courses.
5. **Courses & Classes**:
   * Academic courses with course codes, credit hours, departments, and course descriptions.
   * Class sections with linked courses, assigned faculty advisors, classroom room numbers, and student capacity limits.
6. **Attendance Tracking**:
   * Daily bulk attendance marking with **Present**, **Absent**, and **Late** statuses.
   * One-click "Mark All Present" shortcut.
   * Historical attendance records log and compliance percentage metrics.
7. **Academic Marks & Automatic Percentage Calculation**:
   * Record subject exam marks.
   * **Automatic real-time calculation** of percentage and letter grades (`A+`, `A`, `B`, `C`, `D`, `F`).
   * Printable student academic report cards.
8. **Campus Announcements**:
   * Publish notices with priority badges (`Urgent`, `High`, `Normal`, `Low`).
   * Target audience filtering (`All`, `Students`, `Teachers`).
9. **CSV Export & Reporting**:
   * One-click CSV downloads for:
     1. Student Master Directory
     2. Daily Attendance Logs (filterable by class & date)
     3. Academic Grade Sheets
10. **Institution Settings & Personal Profile**:
    * Configure campus name, tagline, contact email, phone, physical address, and academic year.
    * User personal profile management and secure password changes.

---

## Project Structure

```text
campuscore/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection & connection status
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & role authorization (Admin/Teacher/Student)
│   │   └── errorHandler.js       # Centralized JSON error handler
│   ├── models/
│   │   ├── Announcement.js       # Notice board model
│   │   ├── Attendance.js         # Attendance records with unique daily constraint
│   │   ├── Class.js              # Class sections and teacher references
│   │   ├── Course.js             # Academic courses and credit hours
│   │   ├── Grade.js              # Examination marks & auto-calculated percentages
│   │   ├── Setting.js            # Institution global settings
│   │   ├── Student.js            # Student profile with course & class references
│   │   ├── Teacher.js            # Faculty directory model
│   │   └── User.js               # Authenticated login accounts with bcrypt hashing
│   ├── routes/
│   │   ├── announcementRoutes.js # Notices API
│   │   ├── attendanceRoutes.js   # Attendance CRUD & bulk marking API
│   │   ├── authRoutes.js         # Login, session verification & password update API
│   │   ├── classRoutes.js        # Class sections API
│   │   ├── courseRoutes.js       # Academic courses API
│   │   ├── exportRoutes.js       # RFC-4180 compliant CSV export API
│   │   ├── gradeRoutes.js        # Exam marks & GPA calculation API
│   │   ├── settingRoutes.js      # Campus configuration API
│   │   ├── statRoutes.js         # Aggregated dashboard metrics API
│   │   ├── studentRoutes.js      # Student CRUD with search & filters API
│   │   └── teacherRoutes.js      # Faculty management API
│   ├── seeds/
│   │   └── seed.js               # Sample data generator (Admin, Teacher, Students, Classes)
│   ├── .env                      # Environment variables (kept private)
│   ├── .env.example              # Template for environment variables
│   ├── package.json              # Backend dependencies & scripts
│   └── server.js                 # Express server initialization
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Badge.jsx         # Status badge indicator
│   │   │   ├── ConfirmDialog.jsx # Deletion confirmation modal
│   │   │   ├── Modal.jsx         # Reusable modal container
│   │   │   ├── Navbar.jsx        # Top application bar
│   │   │   ├── SearchFilter.jsx  # Search & filter component
│   │   │   ├── Sidebar.jsx       # Responsive navigation sidebar
│   │   │   └── StatCard.jsx      # Metric card for dashboard
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Authentication context & user state
│   │   ├── pages/
│   │   │   ├── Announcements.jsx # Campus notice board page
│   │   │   ├── Attendance.jsx    # Daily attendance marking & history page
│   │   │   ├── CoursesClasses.jsx# Courses & Class sections management
│   │   │   ├── Dashboard.jsx     # Overview statistics & recent activity
│   │   │   ├── Grades.jsx        # Examination scores & report card page
│   │   │   ├── Login.jsx         # Sign-in page with 1-click demo accounts
│   │   │   ├── Profile.jsx       # User profile & password reset page
│   │   │   ├── Reports.jsx       # CSV export page
│   │   │   ├── Settings.jsx      # Institution settings page
│   │   │   └── Students.jsx      # Full Student CRUD directory
│   │   ├── services/
│   │   │   └── api.js            # Fetch wrapper with JWT headers & CSV blob downloader
│   │   ├── App.jsx               # Application shell & view router
│   │   ├── index.css             # Light-grey & clean blue design system
│   │   └── main.jsx              # React DOM entry point
│   ├── index.html                # HTML template with Inter font
│   ├── package.json              # Frontend dependencies
│   └── vite.config.js            # Vite build setup with `/api` proxy
├── .gitignore                    # Git ignore file (excludes .env and node_modules)
├── package.json                  # Root scripts
└── README.md
```

---

## Step-by-Step Setup Guide

### 1. Configure MongoDB Atlas

To connect to a free MongoDB Atlas cloud database:

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in or create a free account.
2. Create a free shared cluster (M0 sandbox).
3. Under **Security → Database Access**:
   * Click **Add New Database User**.
   * Select **Password Authentication**.
   * Enter a username and secure password (e.g., user `campusadmin`).
   * Select role **Read and write to any database**.
4. Under **Security → Network Access**:
   * Click **Add IP Address**.
   * Select **Allow Access From Anywhere** (`0.0.0.0/0`) for testing, or enter your current IP address.
5. In your cluster dashboard:
   * Click **Connect** → **Drivers** (Node.js).
   * Copy the connection string. It looks like:
     ```text
     mongodb+srv://campusadmin:<password>@cluster0.abcde.mongodb.net/campuscore?retryWrites=true&w=majority
     ```
   * Replace `<password>` with your actual database user password.
6. Open `backend/.env` in your project and update `MONGODB_URI`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://campusadmin:YOUR_PASSWORD_HERE@cluster0.abcde.mongodb.net/campuscore?retryWrites=true&w=majority
   JWT_SECRET=campuscore_super_secret_jwt_key_2026_production_grade
   JWT_EXPIRES_IN=7d
   CLIENT_URL=http://localhost:5173
   ```

---

### 2. Seed Sample Database Records

Once your MongoDB Atlas URI is added to `backend/.env`, populate the database with realistic sample records:

```powershell
# Using Bun:
cd backend
bun run bun-seed

# Or using Node:
cd backend
npm run seed
```

This script automatically creates:
* 1 Administrator account (`admin@campuscore.edu`)
* 1 Faculty Teacher account (`dr.smith@campuscore.edu`)
* 1 Student account (`alex.johnson@campuscore.edu`)
* 4 Courses (CS101, IT201, EE102, BA301)
* 4 Class Sections with teacher assignments
* 6 Initial enrolled students
* 5 Days of attendance history with Present, Late, and Absent records
* Multiple subject examination marks with calculated grades
* Campus notices and institution settings

---

### 3. Running the Application

You can run the backend and frontend in two separate terminals:

#### Terminal 1 — Backend (Port 5000)

```powershell
cd c:\Users\hp\Documents\campuscore\backend
bun run bun-dev
# (or with Node: npm run dev)
```

The backend server starts on: `http://localhost:5000`  
Health check endpoint: `http://localhost:5000/api/health`

#### Terminal 2 — Frontend (Port 5173)

```powershell
cd c:\Users\hp\Documents\campuscore\frontend
bun run dev
# (or with Node: npm run dev)
```

Open your browser at: **`http://localhost:5173`**

---

## Demo Login Credentials

The login screen includes **1-Click Autofill** buttons for quick testing:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@campuscore.edu` | `Admin@123` | Full administrative control across all modules |
| **Teacher** | `dr.smith@campuscore.edu` | `Teacher@123` | Classes, Attendance marking, Marks entry, Announcements, Reports |
| **Student** | `alex.johnson@campuscore.edu` | `Student@123` | Personal academic records, attendance log, notices |

---

## Security Highlights for College Project Review

* **Password Security**: Passwords are never stored as plain text. The User model employs a pre-save hook that hashes passwords using `bcryptjs` with 10 salt rounds.
* **JWT Authentication**: Users receive a signed JSON Web Token upon valid credentials, stored in browser storage and passed via `Authorization: Bearer <token>` HTTP headers.
* **Server-Side Authorization**: Routes are protected with `protect` and `authorize('admin', 'teacher')` middleware. Students cannot view or tamper with other students' records.
* **Protected Secrets**: Database credentials and JWT secrets reside exclusively in `backend/.env`, excluded from version control via `.gitignore`.
* **Relational Data Integrity**: Deleting a student cascades and cleans up their linked attendance and grade records, preventing orphaned database documents.
