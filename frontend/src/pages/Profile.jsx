import React, { useState } from 'react';
import {
  User,
  Lock,
  Save,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Mail,
  Phone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

export const Profile = () => {
  const { user, updateUser, role } = useAuth();

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState({ type: '', message: '' });

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState({ type: '', message: '' });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setProfileFeedback({ type: '', message: '' });

      const res = await apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, phone }),
      });

      if (res.success && res.user) {
        updateUser(res.user);
        setProfileFeedback({
          type: 'success',
          message: 'Profile information updated successfully.',
        });
      }
    } catch (err) {
      setProfileFeedback({
        type: 'danger',
        message: err.message || 'Failed to update profile.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordFeedback({ type: '', message: '' });

    if (newPassword.length < 6) {
      setPasswordFeedback({
        type: 'danger',
        message: 'New password must be at least 6 characters long.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        type: 'danger',
        message: 'New password and confirmation do not match.',
      });
      return;
    }

    try {
      setSavingPassword(true);
      const res = await apiRequest('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.success) {
        setPasswordFeedback({
          type: 'success',
          message: 'Password changed successfully.',
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPasswordFeedback({
        type: 'danger',
        message: err.message || 'Failed to update password.',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>My Profile & Security</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Manage your personal account details and access credentials.
        </p>
      </div>

      {/* Profile Details Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <User size={18} color="var(--primary)" />
            <span>Account Details</span>
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              color: 'var(--primary)',
              backgroundColor: 'var(--primary-light)',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            Role: {role}
          </span>
        </div>

        {profileFeedback.message && (
          <div className={`alert alert-${profileFeedback.type}`} style={{ marginBottom: '16px' }}>
            {profileFeedback.type === 'success' ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{profileFeedback.message}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                className="form-input"
                disabled
                value={user?.email || ''}
                style={{ backgroundColor: '#f1f5f9' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Security Level</label>
              <input
                type="text"
                className="form-input"
                disabled
                value={`${role.toUpperCase()} Authentication Level`}
                style={{ backgroundColor: '#f1f5f9' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="submit" className="btn btn-primary" disabled={savingProfile}>
              <Save size={16} />
              <span>{savingProfile ? 'Updating...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Password Change Card */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Lock size={18} color="var(--primary)" />
            <span>Change Security Password</span>
          </div>
        </div>

        {passwordFeedback.message && (
          <div className={`alert alert-${passwordFeedback.type}`} style={{ marginBottom: '16px' }}>
            {passwordFeedback.type === 'success' ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{passwordFeedback.message}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label className="form-label">Current Password *</label>
            <input
              type="password"
              className="form-input"
              required
              placeholder="Enter existing password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">New Password * (Min 6 chars)</label>
              <input
                type="password"
                className="form-input"
                required
                minLength={6}
                placeholder="Enter new strong password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password *</label>
              <input
                type="password"
                className="form-input"
                required
                minLength={6}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="submit" className="btn btn-primary" disabled={savingPassword}>
              <Lock size={16} />
              <span>{savingPassword ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
