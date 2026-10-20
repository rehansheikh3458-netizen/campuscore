import React, { useState } from 'react';
import { Building2, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-page)',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-md)',
          padding: '36px',
        }}
      >
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              borderRadius: 'var(--radius-md)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
            }}
          >
            <Building2 size={26} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-main)' }}>
            CampusCore
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Student Management System
          </p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="name@campuscore.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '38px' }}
              />
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-sub)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '38px' }}
              />
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-sub)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '11px', fontSize: '0.95rem' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In to CampusCore'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Demo Credentials Helper */}
        <div
          style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: '600',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '10px',
              textAlign: 'center',
            }}
          >
            Quick Demo Accounts (1-Click Fill)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ justifyContent: 'space-between', width: '100%' }}
              onClick={() => handleQuickLogin('admin@campuscore.edu', 'Admin@123')}
            >
              <span style={{ fontWeight: '600' }}>Admin</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                admin@campuscore.edu
              </span>
            </button>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ justifyContent: 'space-between', width: '100%' }}
              onClick={() => handleQuickLogin('dr.smith@campuscore.edu', 'Teacher@123')}
            >
              <span style={{ fontWeight: '600' }}>Teacher</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                dr.smith@campuscore.edu
              </span>
            </button>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ justifyContent: 'space-between', width: '100%' }}
              onClick={() => handleQuickLogin('alex.johnson@campuscore.edu', 'Student@123')}
            >
              <span style={{ fontWeight: '600' }}>Student</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                alex.johnson@campuscore.edu
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
