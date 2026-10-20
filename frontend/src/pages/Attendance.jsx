import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Save,
  CheckCheck,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';

export const Attendance = () => {
  const { role, isStudent } = useAuth();

  const [activeTab, setActiveTab] = useState(isStudent ? 'history' : 'mark'); // 'mark' or 'history'
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  // State for taking attendance
  const [studentsInClass, setStudentsInClass] = useState([]);
  const [attendanceSheet, setAttendanceSheet] = useState({}); // { studentId: { status: 'Present', remarks: '' } }
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);

  // State for history / student view
  const [historyRecords, setHistoryRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Fetch classes list for selection
  useEffect(() => {
    if (!isStudent) {
      const loadClasses = async () => {
        try {
          const res = await apiRequest('/classes');
          if (res.success && res.classes.length > 0) {
            setClasses(res.classes);
            setSelectedClass(res.classes[0]._id);
          }
        } catch (err) {
          console.warn('Failed to load classes:', err.message);
        }
      };
      loadClasses();
    }
  }, [isStudent]);

  // Load students and existing records when class or date changes in 'mark' mode
  useEffect(() => {
    if (activeTab === 'mark' && selectedClass && !isStudent) {
      const loadSheet = async () => {
        try {
          setLoadingSheet(true);
          setFeedback({ type: '', message: '' });

          // 1. Fetch students enrolled in this class
          const studentsRes = await apiRequest(`/classes/${selectedClass}/students`);
          const studentList = studentsRes.students || [];
          setStudentsInClass(studentList);

          // 2. Fetch existing attendance for this class on this date (if any)
          const attRes = await apiRequest(
            `/attendance?classId=${selectedClass}&date=${selectedDate}`
          );
          const existingRecords = attRes.records || [];

          // Initialize sheet
          const newSheet = {};
          studentList.forEach((s) => {
            const match = existingRecords.find(
              (r) => (r.student?._id || r.student) === s._id
            );
            if (match) {
              newSheet[s._id] = { status: match.status, remarks: match.remarks || '' };
            } else {
              newSheet[s._id] = { status: 'Present', remarks: '' };
            }
          });
          setAttendanceSheet(newSheet);
        } catch (err) {
          setFeedback({ type: 'danger', message: err.message || 'Error loading class sheet.' });
        } finally {
          setLoadingSheet(false);
        }
      };

      loadSheet();
    }
  }, [selectedClass, selectedDate, activeTab, isStudent]);

  // Load history records and summary
  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const params = new URLSearchParams();
      if (!isStudent && selectedClass && selectedClass !== 'all') {
        params.append('classId', selectedClass);
      }
      if (!isStudent && selectedDate) {
        params.append('date', selectedDate);
      }

      const [recordsRes, summaryRes] = await Promise.all([
        apiRequest(`/attendance?${params.toString()}`),
        apiRequest(`/attendance/summary?${params.toString()}`),
      ]);

      if (recordsRes.success) setHistoryRecords(recordsRes.records || []);
      if (summaryRes.success) setSummary(summaryRes.summary || null);
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message || 'Failed to load attendance history.' });
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history' || isStudent) {
      loadHistory();
    }
  }, [activeTab, selectedClass, selectedDate, isStudent]);

  // Bulk set status for all
  const handleMarkAll = (status) => {
    const updated = { ...attendanceSheet };
    Object.keys(updated).forEach((id) => {
      updated[id] = { ...updated[id], status };
    });
    setAttendanceSheet(updated);
  };

  // Change single student status
  const handleStatusChange = (studentId, status) => {
    setAttendanceSheet((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  // Change single student remarks
  const handleRemarksChange = (studentId, remarks) => {
    setAttendanceSheet((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], remarks },
    }));
  };

  // Save attendance sheet
  const handleSaveAttendance = async () => {
    if (!selectedClass || studentsInClass.length === 0) return;

    try {
      setSavingAttendance(true);
      setFeedback({ type: '', message: '' });

      const records = Object.keys(attendanceSheet).map((studentId) => ({
        studentId,
        status: attendanceSheet[studentId]?.status || 'Present',
        remarks: attendanceSheet[studentId]?.remarks || '',
      }));

      const res = await apiRequest('/attendance/bulk', {
        method: 'POST',
        body: JSON.stringify({
          classId: selectedClass,
          date: selectedDate,
          records,
        }),
      });

      if (res.success) {
        setFeedback({
          type: 'success',
          message: `Attendance for ${records.length} students recorded successfully on ${selectedDate}.`,
        });
      }
    } catch (err) {
      setFeedback({ type: 'danger', message: err.message || 'Failed to save attendance.' });
    } finally {
      setSavingAttendance(false);
    }
  };

  return (
    <div>
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

      {/* Tabs Header (Admin / Teacher only) */}
      {!isStudent && (
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
              className={`btn ${activeTab === 'mark' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('mark')}
            >
              <CalendarCheck size={16} />
              <span>Mark Daily Attendance</span>
            </button>
            <button
              type="button"
              className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('history')}
            >
              <Filter size={16} />
              <span>Attendance Records & History</span>
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards Row */}
      {summary && (
        <div className="grid-4" style={{ marginBottom: '20px' }}>
          <StatCard
            icon={CalendarCheck}
            title="Attendance Rate"
            value={`${summary.percentage}%`}
            subtitle="Overall compliance"
            color="#16a34a"
          />
          <StatCard
            icon={CheckCircle}
            title="Present Count"
            value={summary.present}
            subtitle="On time"
            color="#2563eb"
          />
          <StatCard
            icon={Clock}
            title="Late Count"
            value={summary.late}
            subtitle="Delayed arrival"
            color="#d97706"
          />
          <StatCard
            icon={XCircle}
            title="Absent Count"
            value={summary.absent}
            subtitle="Unexcused / missed"
            color="#dc2626"
          />
        </div>
      )}

      {/* ================= MODE 1: MARK ATTENDANCE ================= */}
      {!isStudent && activeTab === 'mark' && (
        <div>
          {/* Controls Card */}
          <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                <div>
                  <label className="form-label" style={{ marginBottom: '4px' }}>
                    Select Class
                  </label>
                  <select
                    className="form-select"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.className} ({cls.section}) — {cls.course?.courseCode}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ marginBottom: '4px' }}>
                    Attendance Date
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => handleMarkAll('Present')}
                >
                  <CheckCheck size={16} color="var(--success)" />
                  <span>Mark All Present</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveAttendance}
                  disabled={savingAttendance || studentsInClass.length === 0}
                >
                  <Save size={16} />
                  <span>{savingAttendance ? 'Saving...' : 'Save Attendance'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Student Sheet Table */}
          <div className="table-container">
            {loadingSheet ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                Loading enrolled students...
              </div>
            ) : studentsInClass.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Enrollment #</th>
                    <th>Student Name</th>
                    <th>Status Selector</th>
                    <th>Remarks / Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsInClass.map((student) => {
                    const currentStatus = attendanceSheet[student._id]?.status || 'Present';
                    const currentRemarks = attendanceSheet[student._id]?.remarks || '';

                    return (
                      <tr key={student._id}>
                        <td style={{ fontWeight: '600' }}>{student.enrollmentNumber}</td>
                        <td>
                          <div style={{ fontWeight: '600' }}>
                            {student.firstName} {student.lastName}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {student.email}
                          </div>
                        </td>
                        <td>
                          {/* Status radio buttons */}
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              type="button"
                              className={`btn btn-sm ${
                                currentStatus === 'Present' ? 'btn-primary' : 'btn-outline'
                              }`}
                              style={
                                currentStatus === 'Present'
                                  ? { backgroundColor: 'var(--success)', borderColor: 'var(--success)' }
                                  : {}
                              }
                              onClick={() => handleStatusChange(student._id, 'Present')}
                            >
                              Present
                            </button>

                            <button
                              type="button"
                              className={`btn btn-sm ${
                                currentStatus === 'Late' ? 'btn-primary' : 'btn-outline'
                              }`}
                              style={
                                currentStatus === 'Late'
                                  ? { backgroundColor: 'var(--warning)', borderColor: 'var(--warning)' }
                                  : {}
                              }
                              onClick={() => handleStatusChange(student._id, 'Late')}
                            >
                              Late
                            </button>

                            <button
                              type="button"
                              className={`btn btn-sm ${
                                currentStatus === 'Absent' ? 'btn-primary' : 'btn-outline'
                              }`}
                              style={
                                currentStatus === 'Absent'
                                  ? { backgroundColor: 'var(--danger)', borderColor: 'var(--danger)' }
                                  : {}
                              }
                              onClick={() => handleStatusChange(student._id, 'Absent')}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-input"
                            style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                            placeholder="Optional note (e.g. excused, late 10m)..."
                            value={currentRemarks}
                            onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <CalendarCheck size={36} className="empty-state-icon" />
                <div className="empty-state-title">No students enrolled</div>
                <p style={{ fontSize: '0.85rem' }}>
                  Assign students to this class in the Student Directory.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODE 2: HISTORY LOG / STUDENT VIEW ================= */}
      {(isStudent || activeTab === 'history') && (
        <div>
          {/* Filter Bar for Admin / Teacher */}
          {!isStudent && (
            <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                <div>
                  <label className="form-label" style={{ marginBottom: '4px' }}>
                    Filter by Class
                  </label>
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

                <div>
                  <label className="form-label" style={{ marginBottom: '4px' }}>
                    Filter by Date
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* History Records Table */}
          <div className="table-container">
            {loadingHistory ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                Loading attendance history...
              </div>
            ) : historyRecords.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    {!isStudent && <th>Enrollment #</th>}
                    {!isStudent && <th>Student Name</th>}
                    <th>Class</th>
                    <th>Attendance Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {historyRecords.map((r) => (
                    <tr key={r._id}>
                      <td style={{ fontWeight: '500' }}>
                        {r.date ? new Date(r.date).toLocaleDateString() : 'N/A'}
                      </td>
                      {!isStudent && (
                        <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                          {r.student?.enrollmentNumber || 'N/A'}
                        </td>
                      )}
                      {!isStudent && (
                        <td>
                          {r.student
                            ? `${r.student.firstName} ${r.student.lastName}`
                            : 'Unknown Student'}
                        </td>
                      )}
                      <td>
                        {r.class ? `${r.class.className} (${r.class.section})` : 'N/A'}
                      </td>
                      <td>
                        <Badge status={r.status}>{r.status}</Badge>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {r.remarks || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <CalendarCheck size={36} className="empty-state-icon" />
                <div className="empty-state-title">No attendance records found</div>
                <p style={{ fontSize: '0.85rem' }}>
                  Select another date or class to view attendance history.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
