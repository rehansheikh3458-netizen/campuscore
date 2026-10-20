import express from 'express';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import Grade from '../models/Grade.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Helper to escape CSV cell value
const escapeCsv = (val) => {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

// @route   GET /api/export/students
// @desc    Export student list as CSV
// @access  Private (Admin, Teacher)
router.get('/students', authorize('admin', 'teacher'), async (req, res, next) => {
  try {
    const students = await Student.find()
      .populate('course', 'courseCode courseName')
      .populate('class', 'className section')
      .sort({ enrollmentNumber: 1 });

    const headers = [
      'Enrollment Number',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Gender',
      'Course Code',
      'Course Name',
      'Class',
      'Blood Group',
      'Guardian Name',
      'Guardian Phone',
      'Status',
      'Admission Date',
    ];

    const rows = students.map((s) => [
      escapeCsv(s.enrollmentNumber),
      escapeCsv(s.firstName),
      escapeCsv(s.lastName),
      escapeCsv(s.email),
      escapeCsv(s.phone),
      escapeCsv(s.gender),
      escapeCsv(s.course ? s.course.courseCode : ''),
      escapeCsv(s.course ? s.course.courseName : ''),
      escapeCsv(s.class ? `${s.class.className} (${s.class.section})` : ''),
      escapeCsv(s.bloodGroup),
      escapeCsv(s.guardianName),
      escapeCsv(s.guardianPhone),
      escapeCsv(s.status),
      escapeCsv(s.admissionDate ? new Date(s.admissionDate).toLocaleDateString() : ''),
    ]);

    const csvContent = [headers.map(escapeCsv).join(','), ...rows.map((r) => r.join(','))].join(
      '\r\n'
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=CampusCore_Students_${new Date().toISOString().slice(0, 10)}.csv`
    );

    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/export/attendance
// @desc    Export attendance records as CSV
// @access  Private (Admin, Teacher)
router.get('/attendance', authorize('admin', 'teacher'), async (req, res, next) => {
  try {
    const { classId, date } = req.query;
    const query = {};
    if (classId && classId !== 'all') query.class = classId;
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const nextDay = new Date(d);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: d, $lt: nextDay };
    }

    const records = await Attendance.find(query)
      .populate('student', 'enrollmentNumber firstName lastName email')
      .populate('class', 'className section')
      .sort({ date: -1 });

    const headers = [
      'Date',
      'Enrollment Number',
      'Student Name',
      'Class',
      'Status',
      'Remarks',
    ];

    const rows = records.map((r) => [
      escapeCsv(r.date ? new Date(r.date).toLocaleDateString() : ''),
      escapeCsv(r.student ? r.student.enrollmentNumber : 'N/A'),
      escapeCsv(r.student ? `${r.student.firstName} ${r.student.lastName}` : 'N/A'),
      escapeCsv(r.class ? `${r.class.className} (${r.class.section})` : 'N/A'),
      escapeCsv(r.status),
      escapeCsv(r.remarks || ''),
    ]);

    const csvContent = [headers.map(escapeCsv).join(','), ...rows.map((r) => r.join(','))].join(
      '\r\n'
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=CampusCore_Attendance_${new Date().toISOString().slice(0, 10)}.csv`
    );

    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/export/grades
// @desc    Export grades as CSV
// @access  Private (Admin, Teacher)
router.get('/grades', authorize('admin', 'teacher'), async (req, res, next) => {
  try {
    const grades = await Grade.find()
      .populate('student', 'enrollmentNumber firstName lastName')
      .populate('class', 'className section')
      .populate('course', 'courseCode courseName')
      .sort({ createdAt: -1 });

    const headers = [
      'Enrollment Number',
      'Student Name',
      'Course',
      'Class',
      'Subject',
      'Exam Name',
      'Marks Obtained',
      'Total Marks',
      'Percentage (%)',
      'Grade Letter',
      'Remarks',
    ];

    const rows = grades.map((g) => [
      escapeCsv(g.student ? g.student.enrollmentNumber : 'N/A'),
      escapeCsv(g.student ? `${g.student.firstName} ${g.student.lastName}` : 'N/A'),
      escapeCsv(g.course ? g.course.courseCode : 'N/A'),
      escapeCsv(g.class ? `${g.class.className} (${g.class.section})` : 'N/A'),
      escapeCsv(g.subject),
      escapeCsv(g.examName),
      escapeCsv(g.marksObtained),
      escapeCsv(g.totalMarks),
      escapeCsv(g.percentage),
      escapeCsv(g.gradeLetter),
      escapeCsv(g.remarks || ''),
    ]);

    const csvContent = [headers.map(escapeCsv).join(','), ...rows.map((r) => r.join(','))].join(
      '\r\n'
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=CampusCore_Grades_${new Date().toISOString().slice(0, 10)}.csv`
    );

    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
});

export default router;
