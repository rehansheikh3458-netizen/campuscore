import React, { useState, useEffect } from 'react';
import {
  Plus,
  Eye,
  Edit2,
  Trash2,
  Users,
  Search,
  CheckCircle,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Badge from '../components/Badge';

export const Students = () => {
  const { isAdmin } = useAuth();

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filters
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const initialFormState = {
    enrollmentNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'Male',
    address: '',
    course: '',
    class: '',
    guardianName: '',
    guardianPhone: '',
    bloodGroup: 'O+',
    status: 'Active',
    createLogin: true,
    loginPassword: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  // Fetch student list & auxiliary course/class options
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCourse !== 'all') params.append('course', selectedCourse);
      if (selectedClass !== 'all') params.append('classId', selectedClass);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);

      const res = await apiRequest(`/students?${params.toString()}`);
      if (res.success) {
        setStudents(res.students || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch students.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [coursesRes, classesRes] = await Promise.all([
        apiRequest('/courses'),
        apiRequest('/classes'),
      ]);
      if (coursesRes.success) setCourses(coursesRes.courses || []);
      if (classesRes.success) setClasses(classesRes.classes || []);
    } catch (err) {
      console.warn('Failed to fetch courses/classes options:', err.message);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedCourse, selectedClass, selectedStatus]);

  // Open modal for adding
  const handleOpenAdd = () => {
    setSelectedStudent(null);
    setFormData({
      ...initialFormState,
      course: courses[0]?._id || '',
      class: classes[0]?._id || '',
      enrollmentNumber: `CC-2026-${String(students.length + 1).padStart(3, '0')}`,
    });
    setIsAddEditOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (student) => {
    setSelectedStudent(student);
    setFormData({
      enrollmentNumber: student.enrollmentNumber || '',
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      email: student.email || '',
      phone: student.phone || '',
      dateOfBirth: student.dateOfBirth ? student.dateOfBirth.slice(0, 10) : '',
      gender: student.gender || 'Male',
      address: student.address || '',
      course: student.course?._id || student.course || '',
      class: student.class?._id || student.class || '',
      guardianName: student.guardianName || '',
      guardianPhone: student.guardianPhone || '',
      bloodGroup: student.bloodGroup || 'O+',
      status: student.status || 'Active',
      createLogin: false,
      loginPassword: '',
    });
    setIsAddEditOpen(true);
  };

  // Open view details
  const handleOpenView = (student) => {
    setSelectedStudent(student);
    setIsViewOpen(true);
  };

  // Open delete confirm
  const handleOpenDelete = (student) => {
    setSelectedStudent(student);
    setIsDeleteOpen(true);
  };

  // Form submit (Add or Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.course) {
      setError('Please fill in all required fields (First name, Last name, Email, Course).');
      return;
    }

    try {
      setActionLoading(true);
      if (selectedStudent) {
        // Edit
        const res = await apiRequest(`/students/${selectedStudent._id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        if (res.success) {
          setSuccessMsg('Student updated successfully.');
          setIsAddEditOpen(false);
          fetchStudents();
        }
      } else {
        // Add
        const res = await apiRequest('/students', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        if (res.success) {
          setSuccessMsg('Student enrolled successfully.');
          setIsAddEditOpen(false);
          fetchStudents();
        }
      }
    } catch (err) {
      setError(err.message || 'Operation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete student
  const handleDeleteConfirm = async () => {
    if (!selectedStudent) return;
    try {
      setActionLoading(true);
      const res = await apiRequest(`/students/${selectedStudent._id}`, {
        method: 'DELETE',
      });
      if (res.success) {
        setSuccessMsg('Student and associated records deleted.');
        setIsDeleteOpen(false);
        fetchStudents();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete student.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      {/* Notifications */}
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

      {/* Action Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Student Directory</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Manage student admissions, profiles, and class enrollments.
          </p>
        </div>

        {isAdmin && (
          <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={18} />
            <span>Add Student</span>
          </button>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Search box */}
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
              placeholder="Search by name, email, or enrollment no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '38px' }}
            />
          </div>

          {/* Filter Course */}
          <div style={{ minWidth: '160px' }}>
            <select
              className="form-select"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="all">All Courses</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.courseCode} - {c.courseName}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Class */}
          <div style={{ minWidth: '150px' }}>
            <select
              className="form-select"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="all">All Classes</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.className} ({cls.section})
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div style={{ minWidth: '130px' }}>
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
              <option value="Graduated">Graduated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
            Loading student records...
          </div>
        ) : students.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Enrollment #</th>
                <th>Student Name</th>
                <th>Email / Phone</th>
                <th>Course</th>
                <th>Class</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id}>
                  <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                    {student.enrollmentNumber}
                  </td>
                  <td>
                    <div style={{ fontWeight: '600' }}>
                      {student.firstName} {student.lastName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Gender: {student.gender} • Blood: {student.bloodGroup || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div>{student.email}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {student.phone || 'No phone'}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: '500' }}>
                      {student.course?.courseCode || 'N/A'}
                    </span>
                  </td>
                  <td>
                    {student.class
                      ? `${student.class.className} (${student.class.section})`
                      : 'Unassigned'}
                  </td>
                  <td>
                    <Badge status={student.status}>{student.status}</Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '4px' }}>
                      <button
                        type="button"
                        className="btn-icon"
                        title="View Full Profile"
                        onClick={() => handleOpenView(student)}
                      >
                        <Eye size={17} />
                      </button>

                      {isAdmin && (
                        <>
                          <button
                            type="button"
                            className="btn-icon"
                            title="Edit Student"
                            onClick={() => handleOpenEdit(student)}
                          >
                            <Edit2 size={17} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon"
                            style={{ color: 'var(--danger)' }}
                            title="Delete Student"
                            onClick={() => handleOpenDelete(student)}
                          >
                            <Trash2 size={17} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <Users size={36} className="empty-state-icon" />
            <div className="empty-state-title">No students found</div>
            <p style={{ fontSize: '0.85rem' }}>
              Try adjusting your search criteria or add a new student.
            </p>
          </div>
        )}
      </div>

      {/* ================= MODAL: ADD / EDIT STUDENT ================= */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={selectedStudent ? 'Edit Student Details' : 'Add New Student'}
        size="lg"
      >
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Enrollment Number *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={formData.enrollmentNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, enrollmentNumber: e.target.value })
                  }
                  placeholder="e.g. CC-2026-001"
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
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Graduated">Graduated</option>
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
                  placeholder="First Name"
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
                  placeholder="Last Name"
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
                  placeholder="student@campuscore.edu"
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
                <label className="form-label">Course Program *</label>
                <select
                  className="form-select"
                  required
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                >
                  <option value="">Select Course</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.courseCode} - {c.courseName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Class</label>
                <select
                  className="form-select"
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                >
                  <option value="">Select Class (Optional)</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.className} ({cls.section})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  className="form-select"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select
                  className="form-select"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Guardian Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.guardianName}
                  onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                  placeholder="Guardian / Parent Name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Guardian Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.guardianPhone}
                  onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                  placeholder="Guardian Emergency Phone"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Residential Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, City, State"
                />
              </div>
            </div>

            {/* Optional portal login for new students */}
            {!selectedStudent && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '14px',
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
                  <span>Create Student Portal User Account</span>
                </label>
                {formData.createLogin && (
                  <p
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      marginTop: '4px',
                      marginLeft: '24px',
                    }}
                  >
                    An active login account will be created with their email. Default initial
                    password will be <code>Student@123</code>.
                  </p>
                )}
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
              {actionLoading
                ? 'Saving...'
                : selectedStudent
                ? 'Save Changes'
                : 'Enroll Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL: VIEW STUDENT DETAILS ================= */}
      <Modal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title="Student Profile Details"
      >
        {selectedStudent && (
          <div className="modal-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                }}
              >
                {selectedStudent.firstName[0]}
                {selectedStudent.lastName[0]}
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </h3>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Enrollment: <strong>{selectedStudent.enrollmentNumber}</strong>
                </div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Badge status={selectedStudent.status}>{selectedStudent.status}</Badge>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '14px',
                fontSize: '0.88rem',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>
                  Email Address
                </span>
                <strong>{selectedStudent.email}</strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>
                  Phone Number
                </span>
                <strong>{selectedStudent.phone || 'N/A'}</strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>
                  Enrolled Course
                </span>
                <strong>
                  {selectedStudent.course?.courseCode} - {selectedStudent.course?.courseName}
                </strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>
                  Assigned Class
                </span>
                <strong>
                  {selectedStudent.class
                    ? `${selectedStudent.class.className} (${selectedStudent.class.section})`
                    : 'Unassigned'}
                </strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>
                  Gender & Blood Group
                </span>
                <strong>
                  {selectedStudent.gender} • {selectedStudent.bloodGroup || 'N/A'}
                </strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>
                  Date of Birth
                </span>
                <strong>
                  {selectedStudent.dateOfBirth
                    ? new Date(selectedStudent.dateOfBirth).toLocaleDateString()
                    : 'N/A'}
                </strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>
                  Guardian Name
                </span>
                <strong>{selectedStudent.guardianName || 'N/A'}</strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>
                  Guardian Phone
                </span>
                <strong>{selectedStudent.guardianPhone || 'N/A'}</strong>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>
                  Residential Address
                </span>
                <strong>{selectedStudent.address || 'N/A'}</strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>
                  Admission Date
                </span>
                <strong>
                  {selectedStudent.admissionDate
                    ? new Date(selectedStudent.admissionDate).toLocaleDateString()
                    : 'N/A'}
                </strong>
              </div>
            </div>
          </div>
        )}
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsViewOpen(false)}
          >
            Close
          </button>
        </div>
      </Modal>

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Student Record"
        message={`Are you sure you want to delete ${selectedStudent?.firstName} ${selectedStudent?.lastName} (${selectedStudent?.enrollmentNumber})? All associated attendance and academic grade records will also be permanently removed.`}
        confirmText="Permanently Delete"
        loading={actionLoading}
      />
    </div>
  );
};

export default Students;
