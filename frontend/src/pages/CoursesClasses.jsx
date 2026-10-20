import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Users,
  CheckCircle,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Badge from '../components/Badge';

export const CoursesClasses = () => {
  const { isAdmin } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('courses'); // 'courses' or 'classes'

  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state for Course
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    courseCode: '',
    courseName: '',
    department: 'Computer Science',
    credits: 3,
    description: '',
    status: 'active',
  });

  // Modals state for Class
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classForm, setClassForm] = useState({
    className: '',
    section: 'A',
    academicYear: '2026-2027',
    course: '',
    classTeacher: '',
    roomNumber: '',
    capacity: 40,
    status: 'active',
  });

  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null); // { type: 'course'|'class', data: ... }

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [coursesRes, classesRes, teachersRes] = await Promise.all([
        apiRequest('/courses'),
        apiRequest('/classes'),
        apiRequest('/teachers'),
      ]);
      if (coursesRes.success) setCourses(coursesRes.courses || []);
      if (classesRes.success) setClasses(classesRes.classes || []);
      if (teachersRes.success) setTeachers(teachersRes.teachers || []);
    } catch (err) {
      setError(err.message || 'Failed to load courses and classes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Course actions
  const handleOpenAddCourse = () => {
    setSelectedCourse(null);
    setCourseForm({
      courseCode: '',
      courseName: '',
      department: 'Computer Science',
      credits: 3,
      description: '',
      status: 'active',
    });
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (c) => {
    setSelectedCourse(c);
    setCourseForm({
      courseCode: c.courseCode,
      courseName: c.courseName,
      department: c.department,
      credits: c.credits,
      description: c.description || '',
      status: c.status || 'active',
    });
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      if (selectedCourse) {
        const res = await apiRequest(`/courses/${selectedCourse._id}`, {
          method: 'PUT',
          body: JSON.stringify(courseForm),
        });
        if (res.success) {
          setSuccessMsg('Course updated successfully.');
          setIsCourseModalOpen(false);
          fetchData();
        }
      } else {
        const res = await apiRequest('/courses', {
          method: 'POST',
          body: JSON.stringify(courseForm),
        });
        if (res.success) {
          setSuccessMsg('Course created successfully.');
          setIsCourseModalOpen(false);
          fetchData();
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save course.');
    } finally {
      setActionLoading(false);
    }
  };

  // Class actions
  const handleOpenAddClass = () => {
    setSelectedClass(null);
    setClassForm({
      className: '',
      section: 'A',
      academicYear: '2026-2027',
      course: courses[0]?._id || '',
      classTeacher: teachers[0]?._id || '',
      roomNumber: '',
      capacity: 40,
      status: 'active',
    });
    setIsClassModalOpen(true);
  };

  const handleOpenEditClass = (cls) => {
    setSelectedClass(cls);
    setClassForm({
      className: cls.className,
      section: cls.section || 'A',
      academicYear: cls.academicYear || '2026-2027',
      course: cls.course?._id || cls.course,
      classTeacher: cls.classTeacher?._id || cls.classTeacher || '',
      roomNumber: cls.roomNumber || '',
      capacity: cls.capacity || 40,
      status: cls.status || 'active',
    });
    setIsClassModalOpen(true);
  };

  const handleSaveClass = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      if (selectedClass) {
        const res = await apiRequest(`/classes/${selectedClass._id}`, {
          method: 'PUT',
          body: JSON.stringify(classForm),
        });
        if (res.success) {
          setSuccessMsg('Class updated successfully.');
          setIsClassModalOpen(false);
          fetchData();
        }
      } else {
        const res = await apiRequest('/classes', {
          method: 'POST',
          body: JSON.stringify(classForm),
        });
        if (res.success) {
          setSuccessMsg('Class created successfully.');
          setIsClassModalOpen(false);
          fetchData();
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save class.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete handler
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      setActionLoading(true);
      if (itemToDelete.type === 'course') {
        const res = await apiRequest(`/courses/${itemToDelete.data._id}`, {
          method: 'DELETE',
        });
        if (res.success) {
          setSuccessMsg('Course deleted successfully.');
          setIsDeleteOpen(false);
          fetchData();
        }
      } else {
        const res = await apiRequest(`/classes/${itemToDelete.data._id}`, {
          method: 'DELETE',
        });
        if (res.success) {
          setSuccessMsg('Class deleted successfully.');
          setIsDeleteOpen(false);
          fetchData();
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to delete item.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      {/* Alert Banners */}
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

      {/* Tabs Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className={`btn ${
              activeSubTab === 'courses' ? 'btn-primary' : 'btn-secondary'
            }`}
            onClick={() => setActiveSubTab('courses')}
          >
            <BookOpen size={16} />
            <span>Academic Courses ({courses.length})</span>
          </button>

          <button
            type="button"
            className={`btn ${
              activeSubTab === 'classes' ? 'btn-primary' : 'btn-secondary'
            }`}
            onClick={() => setActiveSubTab('classes')}
          >
            <Layers size={16} />
            <span>Class Sections ({classes.length})</span>
          </button>
        </div>

        {isAdmin && (
          <div>
            {activeSubTab === 'courses' ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleOpenAddCourse}
              >
                <Plus size={18} />
                <span>Add Course</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleOpenAddClass}
              >
                <Plus size={18} />
                <span>Add Class Section</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* TAB 1: COURSES TABLE */}
      {activeSubTab === 'courses' && (
        <div className="table-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
              Loading courses...
            </div>
          ) : courses.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course Name</th>
                  <th>Department</th>
                  <th>Credits</th>
                  <th>Description</th>
                  <th>Status</th>
                  {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: '700', color: 'var(--primary)' }}>
                      {c.courseCode}
                    </td>
                    <td style={{ fontWeight: '600' }}>{c.courseName}</td>
                    <td>{c.department}</td>
                    <td>{c.credits} Credits</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {c.description || '—'}
                    </td>
                    <td>
                      <Badge status={c.status}>{c.status}</Badge>
                    </td>
                    {isAdmin && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '4px' }}>
                          <button
                            type="button"
                            className="btn-icon"
                            title="Edit"
                            onClick={() => handleOpenEditCourse(c)}
                          >
                            <Edit2 size={17} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon"
                            style={{ color: 'var(--danger)' }}
                            title="Delete"
                            onClick={() => {
                              setItemToDelete({ type: 'course', data: c });
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
            <div className="empty-state">No courses added yet.</div>
          )}
        </div>
      )}

      {/* TAB 2: CLASSES TABLE */}
      {activeSubTab === 'classes' && (
        <div className="table-container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
              Loading classes...
            </div>
          ) : classes.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Class Name</th>
                  <th>Section</th>
                  <th>Academic Year</th>
                  <th>Linked Course</th>
                  <th>Assigned Faculty</th>
                  <th>Room</th>
                  <th>Enrolled</th>
                  {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => (
                  <tr key={cls._id}>
                    <td style={{ fontWeight: '600' }}>{cls.className}</td>
                    <td>
                      <Badge variant="secondary">Sec {cls.section}</Badge>
                    </td>
                    <td>{cls.academicYear}</td>
                    <td>
                      <span style={{ fontWeight: '500' }}>
                        {cls.course?.courseCode} - {cls.course?.courseName}
                      </span>
                    </td>
                    <td>
                      {cls.classTeacher ? (
                        <span>
                          {cls.classTeacher.firstName} {cls.classTeacher.lastName}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-sub)' }}>Not assigned</span>
                      )}
                    </td>
                    <td>{cls.roomNumber || '—'}</td>
                    <td>
                      <Badge variant="info">
                        {cls.studentCount || 0} / {cls.capacity || 40}
                      </Badge>
                    </td>
                    {isAdmin && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '4px' }}>
                          <button
                            type="button"
                            className="btn-icon"
                            title="Edit"
                            onClick={() => handleOpenEditClass(cls)}
                          >
                            <Edit2 size={17} />
                          </button>
                          <button
                            type="button"
                            className="btn-icon"
                            style={{ color: 'var(--danger)' }}
                            title="Delete"
                            onClick={() => {
                              setItemToDelete({ type: 'class', data: cls });
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
            <div className="empty-state">No class sections created yet.</div>
          )}
        </div>
      )}

      {/* Add / Edit Course Modal */}
      <Modal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        title={selectedCourse ? 'Edit Course' : 'Add Course'}
      >
        <form onSubmit={handleSaveCourse}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Course Code *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. CS101"
                value={courseForm.courseCode}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, courseCode: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Course Name *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Computer Science & Engineering"
                value={courseForm.courseName}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, courseName: e.target.value })
                }
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Department *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Computer Science"
                  value={courseForm.department}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, department: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Credits *</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="form-input"
                  required
                  value={courseForm.credits}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, credits: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                placeholder="Brief course overview..."
                value={courseForm.description}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, description: e.target.value })
                }
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsCourseModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Saving...' : 'Save Course'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Class Modal */}
      <Modal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        title={selectedClass ? 'Edit Class Section' : 'Add Class Section'}
      >
        <form onSubmit={handleSaveClass}>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Class Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. CS Year 1"
                  value={classForm.className}
                  onChange={(e) =>
                    setClassForm({ ...classForm, className: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Section *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. A"
                  value={classForm.section}
                  onChange={(e) =>
                    setClassForm({ ...classForm, section: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Associated Course *</label>
              <select
                className="form-select"
                required
                value={classForm.course}
                onChange={(e) => setClassForm({ ...classForm, course: e.target.value })}
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
              <label className="form-label">Class Teacher / Advisor</label>
              <select
                className="form-select"
                value={classForm.classTeacher}
                onChange={(e) =>
                  setClassForm({ ...classForm, classTeacher: e.target.value })
                }
              >
                <option value="">Unassigned</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.firstName} {t.lastName} ({t.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Room Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Lab 101"
                  value={classForm.roomNumber}
                  onChange={(e) =>
                    setClassForm({ ...classForm, roomNumber: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Student Capacity</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={classForm.capacity}
                  onChange={(e) =>
                    setClassForm({ ...classForm, capacity: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Academic Year</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="2026-2027"
                  value={classForm.academicYear}
                  onChange={(e) =>
                    setClassForm({ ...classForm, academicYear: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsClassModalOpen(false)}
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Saving...' : 'Save Class'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${itemToDelete?.type === 'course' ? 'Course' : 'Class Section'}`}
        message={`Are you sure you want to delete this ${
          itemToDelete?.type === 'course' ? 'course' : 'class'
        }? It cannot be deleted if active students are assigned.`}
        confirmText="Confirm Delete"
        loading={actionLoading}
      />
    </div>
  );
};

export default CoursesClasses;
