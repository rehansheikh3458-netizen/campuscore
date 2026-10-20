import React, { useState, useEffect } from 'react';
import { Calendar, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

export const Navbar = ({ title }) => {
  const { user, role } = useAuth();
  const [institutionName, setInstitutionName] = useState('CampusCore Academy');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiRequest('/settings');
        if (res.success && res.settings?.institutionName) {
          setInstitutionName(res.settings.institutionName);
        }
      } catch (err) {
        // Fallback to default
      }
    };
    fetchSettings();
  }, []);

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="top-navbar">
      <div>
        <h1 className="page-title">{title}</h1>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {institutionName}
        </div>
      </div>

      <div className="navbar-right">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.82rem',
            color: 'var(--text-muted)',
            backgroundColor: '#f1f5f9',
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <Calendar size={15} />
          <span>{todayStr}</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.82rem',
            fontWeight: '600',
            color: 'var(--primary)',
            backgroundColor: 'var(--primary-light)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--primary-border)',
            textTransform: 'capitalize',
          }}
        >
          <ShieldCheck size={16} />
          <span>{role} Access</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
