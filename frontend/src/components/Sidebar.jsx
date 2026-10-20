import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Award,
  Bell,
  FileSpreadsheet,
  Settings,
  User,
  LogOut,
  Building2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ activeTab, onSelectTab }) => {
  const { user, role, logout } = useAuth();

  const getNavItems = () => {
    if (role === 'student') {
      return [
        { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
        { id: 'attendance', label: 'My Attendance', icon: CalendarCheck },
        { id: 'grades', label: 'My Academic Marks', icon: Award },
        { id: 'announcements', label: 'Announcements', icon: Bell },
        { id: 'profile', label: 'My Profile', icon: User },
      ];
    }

    if (role === 'teacher') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'students', label: 'Students', icon: Users },
        { id: 'courses-classes', label: 'Courses & Classes', icon: BookOpen },
        { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
        { id: 'grades', label: 'Marks & Grades', icon: Award },
        { id: 'announcements', label: 'Announcements', icon: Bell },
        { id: 'reports', label: 'CSV Reports', icon: FileSpreadsheet },
        { id: 'profile', label: 'My Profile', icon: User },
      ];
    }

    // Admin (default full access)
    return [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'students', label: 'Students', icon: Users },
      { id: 'teachers', label: 'Teachers', icon: GraduationCap },
      { id: 'courses-classes', label: 'Courses & Classes', icon: BookOpen },
      { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
      { id: 'grades', label: 'Marks & Grades', icon: Award },
      { id: 'announcements', label: 'Announcements', icon: Bell },
      { id: 'reports', label: 'CSV Reports', icon: FileSpreadsheet },
      { id: 'settings', label: 'Institution Settings', icon: Settings },
      { id: 'profile', label: 'My Profile', icon: User },
    ];
  };

  const navItems = getNavItems();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Building2 size={20} />
        </div>
        <div>
          <div className="sidebar-brand-name">CampusCore</div>
          <div className="sidebar-brand-tagline">Student Management</div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Main Menu</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User profile footer */}
      <div className="sidebar-footer">
        <div className="user-profile-badge">
          <div className="avatar-circle">{getInitials(user?.name)}</div>
          <div className="user-info-text">
            <div className="user-name" title={user?.name}>
              {user?.name || 'User'}
            </div>
            <div className="user-role">{user?.role || 'Guest'}</div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={logout}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
