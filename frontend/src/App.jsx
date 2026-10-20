import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import CoursesClasses from './pages/CoursesClasses';
import Attendance from './pages/Attendance';
import Grades from './pages/Grades';
import Announcements from './pages/Announcements';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

export function AppContent() {
  const { isAuthenticated, loading, role, isStudent } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-page)',
          color: 'var(--text-muted)',
          fontSize: '0.95rem',
        }}
      >
        Authenticating CampusCore Session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  // Safety fallback if student attempts to access admin tabs
  if (isStudent && ['teachers', 'courses-classes', 'reports', 'settings'].includes(activeTab)) {
    setActiveTab('dashboard');
  }

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return isStudent ? 'Student Academic Portal' : 'Administrative Dashboard';
      case 'students':
        return 'Student Directory & Admissions';
      case 'teachers':
        return 'Faculty & Teacher Directory';
      case 'courses-classes':
        return 'Courses & Class Sections';
      case 'attendance':
        return isStudent ? 'My Attendance Record' : 'Attendance Tracking';
      case 'grades':
        return isStudent ? 'My Academic Marks' : 'Academic Marks & Evaluation';
      case 'announcements':
        return 'Campus Announcements';
      case 'reports':
        return 'Data Reports & CSV Export';
      case 'settings':
        return 'Institution Settings';
      case 'profile':
        return 'Personal Profile';
      default:
        return 'Dashboard';
    }
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'students':
        return <Students />;
      case 'teachers':
        return <Teachers />;
      case 'courses-classes':
        return <CoursesClasses />;
      case 'attendance':
        return <Attendance />;
      case 'grades':
        return <Grades />;
      case 'announcements':
        return <Announcements />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />
      <div className="main-wrapper">
        <Navbar title={getPageTitle()} />
        <main className="content-viewport">{renderActivePage()}</main>
      </div>
    </div>
  );
}

import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
