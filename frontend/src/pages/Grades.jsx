import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  AlertCircle,
  FileText,
  Percent,
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';

export const Grades = () => {
  const { role, isStudent, isAdmin } = useAuth();

  const [grades, setGrades] = useState([]);
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [searchSubject, setSearchSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedExam, setSelectedExam] = useState('all');

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Report card modal state
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);
  const [studentReport, setStudentReport] = useState(null);

  // Form State
  const initialForm = {
    student: '',
    class: '',
    course: '',
    subject: '',
    examName: 'Midterm Examination 2026',
    marksObtained: '',
    totalMarks: 100,
    remarks: '',
  };
  const [formData, setFormData] = useState(initialForm);

  // Fetch grades
  const fetchGrades = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (searchSubject) params.append('subject', searchSubject);
      if (selectedClass !== 'all') params.append('classId', selectedClass);
      if (selectedExam !== 'all') params.append('examName', selectedExam);

      const res = await apiRequest(`/grades?${params.toString()}`);
      if (res.success) {
        setGrades(res.grades || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load grades.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxiliary = async () => {
    try {
      const [clsRes, crsRes, stdRes] = await Promise.all([
        apiRequest('/classes'),
        apiRequest('/courses'),
        apiRequest('/students'),
      ]);
      if (clsRes.success) setClasses(clsRes.classes || []);
      if (crsRes.success) setCourses(crsRes.courses || []);
      if (stdRes.success) setStudents(stdRes.students || []);
    } catch (err) {
      console.warn('Failed to load auxiliary options:', err.message);
    }
  };

  useEffect(() => {
    if (!isStudent) {
      fetchAuxiliary();
    }
  }, [isStudent]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGrades();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchSubject, selectedClass, selectedExam]);

  // Compute preview percentage and grade letter live
  const marksNum = Number(formData.marksObtained) || 0;
  const totalNum = Number(formData.totalMarks) || 100;
  const previewPct = totalNum > 0 ? Number(((marksNum / totalNum) * 100).toFixed(2)) : 0;
  const getPreviewGrade = (pct) => {
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
  };

  // Open add grade modal
  const handleOpenAdd = () => {
    setSelectedGrade(null);
    setFormData({
      ...initialForm,
      student: students[0]?._id || '',
      class: classes[0]?._id || '',
      course: courses[0]?._id || '',
      marksObtained: '',
      totalMarks: 100,
    });
    setIsAddEditOpen(true);
  };

  // Open edit grade modal
  const handleOpenEdit = (g) => {
    setSelectedGrade(g);
    setFormData({
      student: g.student?._id || g.student,
      class: g.class?._id || g.class,
      course: g.course?._id || g.course,
      subject: g.subject || '',
      examName: g.examName || '',
      marksObtained: g.marksObtained,
      totalMarks: g.totalMarks || 100,
      remarks: g.remarks || '',
    });
    setIsAddEditOpen(true);
  };

  // Save grade
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.student || !formData.subject || formData.marksObtained === '') {
      setError('Please select student, subject, and marks.');
      return;
    }

    try {
      setActionLoading(true);
      if (selectedGrade) {
        const res = await apiRequest(`/grades/${selectedGrade._id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        if (res.success) {
          setSuccessMsg('Academic grade record updated.');
          setIsAddEditOpen(false);
          fetchGrades();
        }
      } else {
        const res = await apiRequest('/grades', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        if (res.success) {
          setSuccessMsg('Academic grade recorded successfully.');
          setIsAddEditOpen(false);
          fetchGrades();
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save grade.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete grade
  const handleDeleteConfirm = async () => {
    if (!selectedGrade) return;
    try {
      setActionLoading(true);
      const res = await apiRequest(`/grades/${selectedGrade._id}`, {
        method: 'DELETE',
      });
      if (res.success) {
        setSuccessMsg('Grade record deleted.');
        setIsDeleteOpen(false);
        fetchGrades();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete grade.');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Report Card for student
  const handleOpenReportCard = async (studentId) => {
    try {
      const res = await apiRequest(`/grades/student/${studentId}`);
      if (res.success) {
        setStudentReport(res);
        setIsReportCardOpen(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch student report card.');
    }
  };

  // Compute student view summary
  const totalExams = grades.length;
  const avgPct =
    totalExams > 0
      ? Number((grades.reduce((acc, g) => acc + (g.percentage || 0), 0) / totalExams).toFixed(2))
      : 0;

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
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>
            {isStudent ? 'My Academic Report' : 'Academic Marks & Grades'}
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Record examination scores with automatic percentage and grade calculation.
          </p>
        </div>

        {!isStudent && (
          <button type="button" className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={18} />
            <span>Enter Marks</span>
          </button>
        )}
      </div>

      {/* Student Summary Top Row */}
      {isStudent && (
        <div className="grid-3" style={{ marginBottom: '20px' }}>
          <StatCard
            icon={Percent}
            title="Cumulative Average"
            value={`${avgPct}%`}
            subtitle="Overall GPA average"
            color="#2563eb"
          />
          <StatCard
            icon={Award}
            title="Overall Grade"
            value={getPreviewGrade(avgPct)}
            subtitle="Calculated performance"
            color="#16a34a"
          />
          <StatCard
            icon={FileText}
            title="Assessments Completed"
            value={totalExams}
            subtitle="Recorded marks"
            color="#0284c7"
          />
        </div>
      )}

      {/* Filters (Admin & Teacher) */}
      {!isStudent && (
        <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 220px' }}>
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
                placeholder="Search subject (e.g. Data Structures)..."
                value={searchSubject}
                onChange={(e) => setSearchSubject(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
            </div>

            <div style={{ minWidth: '160px' }}>
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
          </div>
        </div>
      )}

      {/* Grades Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
            Loading grade records...
          </div>
        ) : grades.length > 0 ? (
          <table>
            <thead>
              <tr>
                {!isStudent && <th>Enrollment #</th>}
                {!isStudent && <th>Student</th>}
                <th>Subject</th>
                <th>Exam Name</th>
                <th>Marks / Total</th>
                <th>Percentage</th>
                <th>Grade</th>
                {!isStudent && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {grades.map((g) => (
                <tr key={g._id}>
                  {!isStudent && (
                    <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                      {g.student?.enrollmentNumber || 'N/A'}
                    </td>
                  )}
                  {!isStudent && (
                    <td>
                      <div style={{ fontWeight: '600' }}>
                        {g.student
                          ? `${g.student.firstName} ${g.student.lastName}`
                          : 'Unknown'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {g.class ? `${g.class.className} (${g.class.section})` : ''}
                      </div>
                    </td>
                  )}
                  <td style={{ fontWeight: '500' }}>{g.subject}</td>
                  <td>{g.examName}</td>
                  <td>
                    <strong>{g.marksObtained}</strong> / {g.totalMarks}
                  </td>
                  <td>
                    <span style={{ fontWeight: '600' }}>{g.percentage}%</span>
                  </td>
                  <td>
                    <Badge status={g.gradeLetter}>{g.gradeLetter}</Badge>
                  </td>
                  {!isStudent && (
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '4px' }}>
                        {g.student && (
                          <button
                            type="button"
                            className="btn-icon"
                            title="View Full Report Card"
                            onClick={() => handleOpenReportCard(g.student._id || g.student)}
                          >
                            <FileText size={17} />
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-icon"
                          title="Edit Marks"
                          onClick={() => handleOpenEdit(g)}
                        >
                          <Edit2 size={17} />
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            className="btn-icon"
                            style={{ color: 'var(--danger)' }}
                            title="Delete"
                            onClick={() => {
                              setSelectedGrade(g);
                              setIsDeleteOpen(true);
                            }}
                          >
                            <Trash2 size={17} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <Award size={36} className="empty-state-icon" />
            <div className="empty-state-title">No grade records found</div>
            <p style={{ fontSize: '0.85rem' }}>
              Select a class or click &quot;Enter Marks&quot; to record examination scores.
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Grade Modal */}
      <Modal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        title={selectedGrade ? 'Edit Academic Marks' : 'Enter Academic Marks'}
      >
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Student *</label>
              <select
                className="form-select"
                required
                value={formData.student}
                onChange={(e) => {
                  const s = students.find((item) => item._id === e.target.value);
                  setFormData({
                    ...formData,
                    student: e.target.value,
                    class: s?.class?._id || s?.class || formData.class,
                    course: s?.course?._id || s?.course || formData.course,
                  });
                }}
              >
                <option value="">Select Student</option>
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.enrollmentNumber} — {s.firstName} {s.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Subject Name *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Data Structures & Algorithms"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Examination Name *</label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="e.g. Midterm Examination 2026"
                value={formData.examName}
                onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Marks Obtained *</label>
                <input
                  type="number"
                  min="0"
                  max={formData.totalMarks}
                  className="form-input"
                  required
                  placeholder="e.g. 85"
                  value={formData.marksObtained}
                  onChange={(e) =>
                    setFormData({ ...formData, marksObtained: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Marks *</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  required
                  value={formData.totalMarks}
                  onChange={(e) =>
                    setFormData({ ...formData, totalMarks: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Live calculation preview card */}
            <div
              style={{
                backgroundColor: 'var(--primary-light)',
                border: '1px solid var(--primary-border)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <div>
                <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '600' }}>
                  AUTOMATIC PERCENTAGE
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>
                  {previewPct}%
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: '600' }}>
                  COMPUTED GRADE
                </div>
                <Badge status={getPreviewGrade(previewPct)}>
                  Grade: {getPreviewGrade(previewPct)}
                </Badge>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Remarks / Teacher Feedback</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Good theoretical understanding"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>
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
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Saving...' : 'Save Marks'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Student Report Card Modal */}
      <Modal
        isOpen={isReportCardOpen}
        onClose={() => setIsReportCardOpen(false)}
        title="Student Academic Report Card"
        size="lg"
      >
        {studentReport && (
          <div className="modal-body">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--border-color)',
                marginBottom: '16px',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>
                  {studentReport.student?.firstName} {studentReport.student?.lastName}
                </h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Enrollment: <strong>{studentReport.student?.enrollmentNumber}</strong> • Course:{' '}
                  <strong>{studentReport.student?.course?.courseName}</strong>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  OVERALL PERFORMANCE
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--primary)' }}>
                  {studentReport.summary?.averagePercentage}%
                </div>
                <Badge status={studentReport.summary?.overallGrade}>
                  Grade: {studentReport.summary?.overallGrade}
                </Badge>
              </div>
            </div>

            {/* Subjects Table */}
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Exam</th>
                    <th>Marks</th>
                    <th>Percentage</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {studentReport.grades?.map((g) => (
                    <tr key={g._id}>
                      <td style={{ fontWeight: '600' }}>{g.subject}</td>
                      <td>{g.examName}</td>
                      <td>
                        {g.marksObtained} / {g.totalMarks}
                      </td>
                      <td>{g.percentage}%</td>
                      <td>
                        <Badge status={g.gradeLetter}>{g.gradeLetter}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsReportCardOpen(false)}
          >
            Close Report
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Grade Entry"
        message="Are you sure you want to delete this grade record?"
        confirmText="Delete Entry"
        loading={actionLoading}
      />
    </div>
  );
};

export default Grades;
