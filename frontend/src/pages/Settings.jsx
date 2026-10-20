import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  CheckCircle,
  AlertCircle,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Settings = () => {
  const { isAdmin } = useAuth();
  const [formData, setFormData] = useState({
    institutionName: 'CampusCore Academy',
    tagline: 'Empowering Next-Generation Education',
    email: 'admin@campuscore.edu',
    phone: '+1 (555) 019-2834',
    address: '100 University Ave, Academic City',
    currentAcademicYear: '2026-2027',
    currentSemester: 'Fall 2026',
    currency: '$',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await apiRequest('/settings');
        if (res.success && res.settings) {
          setFormData({
            institutionName: res.settings.institutionName || '',
            tagline: res.settings.tagline || '',
            email: res.settings.email || '',
            phone: res.settings.phone || '',
            address: res.settings.address || '',
            currentAcademicYear: res.settings.currentAcademicYear || '2026-2027',
            currentSemester: res.settings.currentSemester || 'Fall 2026',
            currency: res.settings.currency || '$',
          });
        }
      } catch (err) {
        setFeedback({ type: 'danger', message: err.message || 'Failed to load settings.' });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      setSaving(true);
      setFeedback({ type: '', message: '' });

      const res = await apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify(formData),
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: 'Institution settings updated successfully.',
        });
      }
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message || 'Failed to update settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
        Loading institution settings...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Feedback banner */}
      {feedback.message && (
        <div
          className={`alert alert-${feedback.type}`}
          style={{ justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {feedback.type === 'success' ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={() => setFeedback({ type: '', message: '' })}
          >
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Institution Configuration</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Manage global institution details, academic calendars, and contact info.
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="card-header">
            <div className="card-title">
              <Building size={18} color="var(--primary)" />
              <span>Campus Information</span>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Institution Name *</label>
              <input
                type="text"
                className="form-input"
                required
                disabled={!isAdmin}
                value={formData.institutionName}
                onChange={(e) =>
                  setFormData({ ...formData, institutionName: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tagline / Motto</label>
              <input
                type="text"
                className="form-input"
                disabled={!isAdmin}
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official Email Address *</label>
              <input
                type="email"
                className="form-input"
                required
                disabled={!isAdmin}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official Contact Phone</label>
              <input
                type="text"
                className="form-input"
                disabled={!isAdmin}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Campus Physical Address</label>
              <input
                type="text"
                className="form-input"
                disabled={!isAdmin}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          <div className="card-header" style={{ marginTop: '16px' }}>
            <div className="card-title">
              <Calendar size={18} color="var(--primary)" />
              <span>Academic Period</span>
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Current Academic Year</label>
              <input
                type="text"
                className="form-input"
                disabled={!isAdmin}
                placeholder="2026-2027"
                value={formData.currentAcademicYear}
                onChange={(e) =>
                  setFormData({ ...formData, currentAcademicYear: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Active Semester</label>
              <input
                type="text"
                className="form-input"
                disabled={!isAdmin}
                placeholder="Fall 2026"
                value={formData.currentSemester}
                onChange={(e) =>
                  setFormData({ ...formData, currentSemester: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Currency Symbol</label>
              <input
                type="text"
                className="form-input"
                disabled={!isAdmin}
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              />
            </div>
          </div>

          {isAdmin && (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Save size={16} />
                <span>{saving ? 'Saving Settings...' : 'Save Settings'}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Settings;
