import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Users,
  CalendarCheck,
  Award,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { downloadCsvFile, apiRequest } from '../services/api';

export const Reports = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');

  const [downloading, setDownloading] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const res = await apiRequest('/classes');
        if (res.success) setClasses(res.classes || []);
      } catch (err) {
        console.warn('Failed to load classes for reports:', err.message);
      }
    };
    loadClasses();
  }, []);

  const handleDownload = async (type) => {
    try {
      setDownloading(type);
      setFeedback({ type: '', message: '' });

      if (type === 'students') {
        await downloadCsvFile(
          '/export/students',
          `CampusCore_Students_${new Date().toISOString().slice(0, 10)}.csv`
        );
      } else if (type === 'attendance') {
        const params = new URLSearchParams();
        if (selectedClass !== 'all') params.append('classId', selectedClass);
        if (selectedDate) params.append('date', selectedDate);

        await downloadCsvFile(
          `/export/attendance?${params.toString()}`,
          `CampusCore_Attendance_${new Date().toISOString().slice(0, 10)}.csv`
        );
      } else if (type === 'grades') {
        await downloadCsvFile(
          '/export/grades',
          `CampusCore_Grades_${new Date().toISOString().slice(0, 10)}.csv`
        );
      }

      setFeedback({
        type: 'success',
        message: `${type.toUpperCase()} report exported successfully to your downloads folder.`,
      });
    } catch (err) {
      setFeedback({
        type: 'danger',
        message: err.message || 'Failed to download report.',
      });
    } finally {
      setDownloading('');
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

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>CSV Export & Reports</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Export institution records in CSV format for spreadsheet analysis and reporting.
        </p>
      </div>

      {/* Report Cards Grid */}
      <div className="grid-3">
        {/* Report 1: Students */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Student Master Directory</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Format: .CSV spreadsheet
              </div>
            </div>
          </div>

          <p
            style={{
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              marginBottom: '20px',
              flex: 1,
            }}
          >
            Contains all student enrollment numbers, personal contact details, enrolled course
            program, class section, guardian info, and admission dates.
          </p>

          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={() => handleDownload('students')}
            disabled={downloading === 'students'}
          >
            <Download size={16} />
            <span>
              {downloading === 'students' ? 'Exporting...' : 'Export Students CSV'}
            </span>
          </button>
        </div>

        {/* Report 2: Attendance */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#f0fdf4',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CalendarCheck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Daily Attendance Logs</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Format: .CSV spreadsheet
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div className="form-group" style={{ marginBottom: '8px' }}>
              <select
                className="form-select"
                style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="all">All Class Sections</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.className} ({cls.section})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '0' }}>
              <input
                type="date"
                className="form-input"
                style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 'auto' }}
            onClick={() => handleDownload('attendance')}
            disabled={downloading === 'attendance'}
          >
            <Download size={16} />
            <span>
              {downloading === 'attendance' ? 'Exporting...' : 'Export Attendance CSV'}
            </span>
          </button>
        </div>

        {/* Report 3: Academic Grades */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#fffbeb',
                color: 'var(--warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Award size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Academic Grade Sheet</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Format: .CSV spreadsheet
              </div>
            </div>
          </div>

          <p
            style={{
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              marginBottom: '20px',
              flex: 1,
            }}
          >
            Complete examination transcript sheet with subject names, marks obtained, total
            marks, automatic percentage calculations, and computed letter grades.
          </p>

          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={() => handleDownload('grades')}
            disabled={downloading === 'grades'}
          >
            <Download size={16} />
            <span>{downloading === 'grades' ? 'Exporting...' : 'Export Grades CSV'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
