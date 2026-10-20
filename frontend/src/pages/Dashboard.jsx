import React, { useState, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Award,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';

export const Dashboard = ({ onNavigate }) => {
  const { user, role, isStudent } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/stats/dashboard');
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
        Loading dashboard statistics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <span>{error}</span>
        <button
          type="button"
          className="btn btn-sm btn-outline"
          style={{ marginLeft: 'auto' }}
          onClick={fetchStats}
        >
          Retry
        </button>
      </div>
    );
  }

  // STUDENT PERSONAL DASHBOARD
  if (isStudent && data?.isStudent) {
    const { student, stats, recentAnnouncements, recentGrades } = data;

    return (
      <div>
        {/* Welcome Banner */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '24px 28px',
          }}
        >
          <h2 style={{ fontSize: '1.35rem', fontWeight: '700' }}>
            Welcome back, {student?.firstName || user?.name}!
          </h2>
          <p style={{ opacity: 0.9, fontSize: '0.88rem', marginTop: '4px' }}>
            Enrolled in {student?.course?.courseName || 'Computer Science'} — Class{' '}
            {student?.class?.className || 'Year 1'} ({student?.class?.section || 'A'})
          </p>
          <div style={{ marginTop: '14px', display: 'flex', gap: '16px', fontSize: '0.82rem' }}>
            <span>
              <strong>Enrollment No:</strong> {student?.enrollmentNumber || 'N/A'}
            </span>
            <span>
              <strong>Status:</strong> {student?.status || 'Active'}
            </span>
          </div>
        </div>

        {/* Student Stats Cards */}
        <div className="grid-3">
          <StatCard
            icon={CalendarCheck}
            title="Attendance Rate"
            value={`${stats?.attendanceRate || 0}%`}
            subtitle={`${stats?.totalAttendanceDays || 0} total days recorded`}
            color="#16a34a"
          />
          <StatCard
            icon={Award}
            title="Average Academic Score"
            value={`${stats?.averagePercentage || 0}%`}
            subtitle={`${stats?.totalExams || 0} exams completed`}
            color="#2563eb"
          />
          <StatCard
            icon={BookOpen}
            title="Assigned Class"
            value={student?.class?.className || 'CS Year 1'}
            subtitle={`Section ${student?.class?.section || 'A'}`}
            color="#8b5cf6"
          />
        </div>

        {/* Recent Grades and Announcements */}
        <div className="grid-2">
          {/* Recent Marks */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Award size={18} color="var(--primary)" />
                <span>Recent Academic Marks</span>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => onNavigate && onNavigate('grades')}
              >
                View All
              </button>
            </div>
            {recentGrades && recentGrades.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Marks</th>
                      <th>Percentage</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentGrades.map((g) => (
                      <tr key={g._id}>
                        <td style={{ fontWeight: '500' }}>{g.subject}</td>
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
            ) : (
              <div className="empty-state">No academic grades recorded yet.</div>
            )}
          </div>

          {/* Announcements */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Bell size={18} color="var(--primary)" />
                <span>Campus Announcements</span>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline"
                onClick={() => onNavigate && onNavigate('announcements')}
              >
                All Notices
              </button>
            </div>
            {recentAnnouncements && recentAnnouncements.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentAnnouncements.map((a) => (
                  <div
                    key={a._id}
                    style={{
                      padding: '12px',
                      backgroundColor: '#f8fafc',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: '4px solid var(--primary)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '4px',
                      }}
                    >
                      <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{a.title}</span>
                      <Badge status={a.priority}>{a.priority}</Badge>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {a.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No active announcements.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ADMIN & TEACHER DASHBOARD
  const {
    counts,
    todayAttendance,
    courseBreakdown,
    genderDistribution,
    recentStudents,
    recentAnnouncements,
  } = data || {};

  return (
    <div>
      {/* Metrics Row */}
      <div className="grid-4">
        <StatCard
          icon={Users}
          title="Total Students"
          value={counts?.totalStudents || 0}
          subtitle={`${counts?.activeStudents || 0} active`}
          color="#2563eb"
        />
        <StatCard
          icon={GraduationCap}
          title="Faculty Members"
          value={counts?.totalTeachers || 0}
          subtitle="Teaching staff"
          color="#0284c7"
        />
        <StatCard
          icon={BookOpen}
          title="Offered Courses"
          value={counts?.totalCourses || 0}
          subtitle={`${counts?.totalClasses || 0} active classes`}
          color="#16a34a"
        />
        <StatCard
          icon={CalendarCheck}
          title="Attendance Rate"
          value={`${todayAttendance?.rate || 0}%`}
          subtitle="Today's average"
          color="#d97706"
        />
      </div>

      {/* Attendance & Demographics Row */}
      <div className="grid-2">
        {/* Attendance Breakdown Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <CalendarCheck size={18} color="var(--primary)" />
              <span>Attendance Tracking Overview</span>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => onNavigate && onNavigate('attendance')}
            >
              Take / View Attendance
            </button>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--success-bg)',
                border: '1px solid var(--success-border)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--success)' }}>
                {todayAttendance?.present || 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--success)', fontWeight: '600' }}>
                Present
              </div>
            </div>

            <div
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--warning-bg)',
                border: '1px solid var(--warning-border)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--warning)' }}>
                {todayAttendance?.late || 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--warning)', fontWeight: '600' }}>
                Late
              </div>
            </div>

            <div
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--danger)' }}>
                {todayAttendance?.absent || 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--danger)', fontWeight: '600' }}>
                Absent
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Total attendance records recorded for today: <strong>{todayAttendance?.total || 0}</strong>.
          </div>
        </div>

        {/* Course Enrollment Breakdown */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <BookOpen size={18} color="var(--primary)" />
              <span>Enrollment by Course</span>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => onNavigate && onNavigate('courses-classes')}
            >
              Manage
            </button>
          </div>

          {courseBreakdown && courseBreakdown.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {courseBreakdown.map((c) => (
                <div
                  key={c.courseId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: '600', marginRight: '8px' }}>
                      {c.courseCode}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {c.courseName}
                    </span>
                  </div>
                  <Badge variant="info">{c.studentCount} Students</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No courses added yet.</div>
          )}
        </div>
      </div>

      {/* Recent Admissions & Announcements */}
      <div className="grid-2">
        {/* Recent Students */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Users size={18} color="var(--primary)" />
              <span>Recent Student Admissions</span>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => onNavigate && onNavigate('students')}
            >
              All Students
            </button>
          </div>

          {recentStudents && recentStudents.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Enrollment</th>
                    <th>Name</th>
                    <th>Course</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStudents.map((s) => (
                    <tr key={s._id}>
                      <td style={{ fontWeight: '600' }}>{s.enrollmentNumber}</td>
                      <td>
                        {s.firstName} {s.lastName}
                      </td>
                      <td>{s.course ? s.course.courseCode : 'N/A'}</td>
                      <td>
                        <Badge status={s.status}>{s.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">No students admitted yet.</div>
          )}
        </div>

        {/* Announcements */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Bell size={18} color="var(--primary)" />
              <span>Campus Announcements</span>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={() => onNavigate && onNavigate('announcements')}
            >
              Manage
            </button>
          </div>

          {recentAnnouncements && recentAnnouncements.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentAnnouncements.map((a) => (
                <div
                  key={a._id}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px',
                    }}
                  >
                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{a.title}</span>
                    <Badge status={a.priority}>{a.priority}</Badge>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {a.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No announcements posted.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
