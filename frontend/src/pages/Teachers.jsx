import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  GraduationCap,
  Search,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Badge from '../components/Badge';

export const Teachers = () => {
  const { isAdmin } = useAuth();

  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  // Modal State
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const initialForm = {
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Computer Science',
    designation: 'Assistant Professor',
    qualification: 'Master of Science',
    assignedCourses: [],
    status: 'Active',
    createLogin: true,
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedDept !== 'all') params.append('department', selectedDept);

      const res = await apiRequest(`/teachers?${params.toString()}`);
      if (res.success) {
        setTeachers(res.teachers || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch teachers.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await apiRequest('/courses');
      if (res.success) setCourses(res.courses || []);
    } catch (err) {
      console.warn('Failed to load courses:', err.message);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTeachers();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedDept]);

  const handleOpenAdd = () => {
    setSelectedTeacher(null);
    setFormData({
      ...initialForm,
      employeeId: `TCH-${String(teachers.length + 1).padStart(3, '0')}`,
    });
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (t) => {
    setSelectedTeacher(t);
    setFormData({
      employeeId: t.employeeId || '',
      firstName: t.firstName || '',
      lastName: t.lastName || '',
      email: t.email || '',
      phone: t.phone || '',
      department: t.department || 'Computer Science',
      designation: t.designation || 'Assistant Professor',
      qualification: t.qualification || '',
      assignedCourses: t.assignedCourses ? t.assignedCourses.map((c) => c._id || c) : [],
      status: t.status || 'Active',
      createLogin: false,
    });
    setIsAddEditOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.department) {
      setError('Please fill in required fields (Name, Email, Department).');
      return;
    }

    try {
      setActionLoading(true);
      if (selectedTeacher) {
        const res = await apiRequest(`/teachers/${selectedTeacher._id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        if (res.success) {
          setSuccessMsg('Teacher record updated successfully.');
          setIsAddEditOpen(false);
          fetchTeachers();
        }
      } else {
        const res = await apiRequest('/teachers', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        if (res.success) {
          setSuccessMsg('Teacher faculty added successfully.');
          setIsAddEditOpen(false);
          fetchTeachers();
        }
      }
    } catch (err) {
      setError(err.message || 'Operation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTeacher) return;
    try {
      setActionLoading(true);
      const res = await apiRequest(`/teachers/${selectedTeacher._id}`, {
        method: 'DELETE',
      });
      if (res.success) {
        setSuccessMsg('Teacher record deleted.');
        setIsDeleteOpen(false);
        fetchTeachers();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete teacher.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleCourse = (courseId) => {
    const current = [...formData.assignedCourses];
    const index = current.indexOf(courseId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(courseId);
    }
    setFormData({ ...formData, assignedCourses: current });
  };

  // Departments list for filter
  const departments = Array.from(new Set(teachers.map((t) => t.department))).filter(Boolean);

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
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Faculty & Teachers</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Manage teaching staff, designations, and academic departments.
          </p>
        </div>

        {isAdmin && (
          <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={18} />
            <span>Add Teacher</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-sub)',
              }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Search faculty by name, ID, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </div>

          <div style={{ minWidth: '180px' }}>
            <select
              className="form-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
            Loading faculty records...
          </div>
        ) : teachers.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Teacher Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Email & Phone</th>
                <th>Status</th>
                {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t._id}>
                  <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{t.employeeId}</td>
                  <td>
                    <div style={{ fontWeight: '600' }}>
                      {t.firstName} {t.lastName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {t.qualification || 'M.Sc.'}
                    </div>
                  </td>
                  <td>{t.department}</td>
                  <td>
                    <span style={{ fontWeight: '500' }}>{t.designation}</span>
                  </td>
                  <td>
                    <div>{t.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {t.phone || 'No phone'}
                    </div>
                  </td>
                  <td>
                    <Badge status={t.status}>{t.status}</Badge>
                  </td>
                  {isAdmin && (
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          title="Edit"
                          onClick={() => handleOpenEdit(t)}
                        >
                          <Edit2 size={17} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          style={{ color: 'var(--danger)' }}
                          title="Delete"
                          onClick={() => {
                            setSelectedTeacher(t);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <GraduationCap size={36} className="empty-state-icon" />
            <div className="empty-state-title">No faculty members found</div>
            <p style={{ fontSize: '0.85rem' }}>Add teachers to assign classes and courses.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={selectedTeacher ? 'Edit Teacher' : 'Add Teacher'}
        size="lg"
      >
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Employee ID *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  placeholder="e.g. TCH-001"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status *</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="First name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Last name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="teacher@campuscore.edu"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Computer Science"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Designation</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  placeholder="e.g. Associate Professor"
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Highest Qualification</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="e.g. Ph.D. in Computer Engineering, M.Sc."
                />
              </div>
            </div>

            {/* Courses assignment */}
            <div style={{ marginTop: '10px' }}>
              <label className="form-label">Assign Department Courses</label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                  maxHeight: '130px',
                  overflowY: 'auto',
                  padding: '8px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                {courses.map((c) => (
                  <label
                    key={c._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.assignedCourses.includes(c._id)}
                      onChange={() => handleToggleCourse(c._id)}
                    />
                    <span>
                      <strong>{c.courseCode}</strong> - {c.courseName}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Optional portal login */}
            {!selectedTeacher && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '600',
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.createLogin}
                    onChange={(e) =>
                      setFormData({ ...formData, createLogin: e.target.checked })
                    }
                  />
                  <span>Create Faculty Portal Login (Default password: Teacher@123)</span>
                </label>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddEditOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={actionLoading}
            >
              {actionLoading ? 'Saving...' : selectedTeacher ? 'Save Changes' : 'Add Teacher'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Teacher Record"
        message={`Are you sure you want to delete ${selectedTeacher?.firstName} ${selectedTeacher?.lastName}?`}
        confirmText="Delete Faculty"
        loading={actionLoading}
      />
    </div>
  );
};

export default Teachers;
