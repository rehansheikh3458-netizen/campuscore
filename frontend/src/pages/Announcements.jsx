import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle,
  Calendar,
  User,
  Users,
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Badge from '../components/Badge';

export const Announcements = () => {
  const { user, role, isStudent } = useAuth();
  const canPost = role === 'admin' || role === 'teacher';

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const initialForm = {
    title: '',
    content: '',
    targetAudience: 'All',
    priority: 'Normal',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiRequest('/announcements');
      if (res.success) {
        setAnnouncements(res.announcements || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenAdd = () => {
    setSelectedAnnouncement(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (a) => {
    setSelectedAnnouncement(a);
    setFormData({
      title: a.title,
      content: a.content,
      targetAudience: a.targetAudience || 'All',
      priority: a.priority || 'Normal',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      setError('Title and content are required.');
      return;
    }

    try {
      setActionLoading(true);
      if (selectedAnnouncement) {
        const res = await apiRequest(`/announcements/${selectedAnnouncement._id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        if (res.success) {
          setSuccessMsg('Announcement updated.');
          setIsModalOpen(false);
          fetchAnnouncements();
        }
      } else {
        const res = await apiRequest('/announcements', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        if (res.success) {
          setSuccessMsg('Announcement published.');
          setIsModalOpen(false);
          fetchAnnouncements();
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save announcement.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAnnouncement) return;
    try {
      setActionLoading(true);
      const res = await apiRequest(`/announcements/${selectedAnnouncement._id}`, {
        method: 'DELETE',
      });
      if (res.success) {
        setSuccessMsg('Announcement deleted.');
        setIsDeleteOpen(false);
        fetchAnnouncements();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete announcement.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      {/* Alerts */}
      {successMsg && (
        <div className="alert alert-success" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle size={18} />
            <span>{successMsg}</span>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={() => setSuccessMsg('')}
            style={{ color: 'var(--success)' }}
          >
            &times;
          </button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={() => setError('')}
            style={{ color: 'var(--danger)' }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Campus Announcements</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Official notices, academic schedules, and campus updates.
          </p>
        </div>

        {canPost && (
          <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={18} />
            <span>Post Notice</span>
          </button>
        )}
      </div>

      {/* Announcements Feed */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
          Loading announcements...
        </div>
      ) : announcements.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {announcements.map((a) => {
            const isAuthor =
              role === 'admin' || (a.author && a.author._id === user?._id);

            return (
              <div key={a._id} className="card" style={{ padding: '20px', marginBottom: '0' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '10px',
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: '700',
                        color: 'var(--text-main)',
                      }}
                    >
                      {a.title}
                    </h3>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '0.78rem',
                        color: 'var(--text-muted)',
                        marginTop: '4px',
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <User size={13} />
                        {a.authorName || 'Campus Administration'}
                      </span>
                      <span>•</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} />
                        {a.createdAt
                          ? new Date(a.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : ''}
                      </span>
                      <span>•</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={13} />
                        Audience: {a.targetAudience}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Badge status={a.priority}>{a.priority} Priority</Badge>
                    {isAuthor && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          title="Edit"
                          onClick={() => handleOpenEdit(a)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          style={{ color: 'var(--danger)' }}
                          title="Delete"
                          onClick={() => {
                            setSelectedAnnouncement(a);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '0.88rem',
                    color: 'var(--text-main)',
                    whiteSpace: 'pre-wrap',
                    lineHeight: '1.6',
                  }}
                >
                  {a.content}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <Bell size={36} className="empty-state-icon" />
          <div className="empty-state-title">No announcements</div>
          <p style={{ fontSize: '0.85rem' }}>All current notices have been cleared.</p>
        </div>
      )}

      {/* Add / Edit Announcement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedAnnouncement ? 'Edit Announcement' : 'Post Campus Notice'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Notice Title *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Midterm Examination Schedule Released"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Target Audience *</label>
                <select
                  className="form-select"
                  value={formData.targetAudience}
                  onChange={(e) =>
                    setFormData({ ...formData, targetAudience: e.target.value })
                  }
                >
                  <option value="All">All Campus</option>
                  <option value="Students">Students Only</option>
                  <option value="Teachers">Faculty / Teachers Only</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority Level *</label>
                <select
                  className="form-select"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Content *</label>
              <textarea
                className="form-textarea"
                required
                rows={5}
                placeholder="Write the full announcement text here..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading
                ? 'Posting...'
                : selectedAnnouncement
                ? 'Update Notice'
                : 'Publish Notice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Announcement"
        message="Are you sure you want to remove this announcement?"
        confirmText="Delete Notice"
        loading={actionLoading}
      />
    </div>
  );
};

export default Announcements;
