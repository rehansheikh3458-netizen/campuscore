import express from 'express';
import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import Class from '../models/Class.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Helper to normalize date to midnight UTC/local
const normalizeDate = (dateStr) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// @route   GET /api/attendance
// @desc    Get attendance records with filters
// @access  Private (Admin, Teacher; Student restricted to own)
router.get('/', async (req, res, next) => {
  try {
    const { classId, date, studentId, status } = req.query;
    const query = {};

    // Role-based restriction: students can only see their own attendance
    if (req.user.role === 'student') {
      if (req.user.linkedStudent) {
        query.student = req.user.linkedStudent;
      } else {
        const student = await Student.findOne({ email: req.user.email });
        if (student) query.student = student._id;
      }
    } else if (studentId) {
      query.student = studentId;
    }

    if (classId && classId !== 'all') {
      query.class = classId;
    }

    if (date) {
      const startOfDay = normalizeDate(date);
      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1);
      query.date = { $gte: startOfDay, $lt: endOfDay };
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const records = await Attendance.find(query)
      .populate('student', 'firstName lastName enrollmentNumber email')
      .populate('class', 'className section')
      .sort({ date: -1, 'student.lastName': 1 });

    res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/attendance/summary
// @desc    Get aggregated attendance percentage & counts
// @access  Private
router.get('/summary', async (req, res, next) => {
  try {
    const { classId, studentId } = req.query;
    const query = {};

    if (req.user.role === 'student') {
      if (req.user.linkedStudent) {
        query.student = req.user.linkedStudent;
      } else {
        const student = await Student.findOne({ email: req.user.email });
        if (student) query.student = student._id;
      }
    } else if (studentId) {
      query.student = studentId;
    }

    if (classId && classId !== 'all') {
      query.class = classId;
    }

    const [total, present, absent, late] = await Promise.all([
      Attendance.countDocuments(query),
      Attendance.countDocuments({ ...query, status: 'Present' }),
      Attendance.countDocuments({ ...query, status: 'Absent' }),
      Attendance.countDocuments({ ...query, status: 'Late' }),
    ]);

    const percentage = total > 0 ? Number((((present + late * 0.5) / total) * 100).toFixed(1)) : 100;

    res.status(200).json({
      success: true,
      summary: {
        total,
        present,
        absent,
        late,
        percentage,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/attendance/bulk
// @desc    Save/update attendance for an entire class on a given date
// @access  Private (Admin, Teacher)
router.post('/bulk', authorize('admin', 'teacher'), async (req, res, next) => {
  try {
    const { classId, date, records } = req.body;

    if (!classId || !date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide classId, date, and an array of student attendance records.',
      });
    }

    const targetDate = normalizeDate(date);
    const cls = await Class.findById(classId);

    const savedRecords = await Promise.all(
      records.map(async (item) => {
        return Attendance.findOneAndUpdate(
          {
            student: item.studentId,
            class: classId,
            date: targetDate,
          },
          {
            student: item.studentId,
            class: classId,
            course: cls ? cls.course : null,
            date: targetDate,
            status: item.status || 'Present',
            remarks: item.remarks ? item.remarks.trim() : '',
            recordedBy: req.user._id,
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      })
    );

    res.status(200).json({
      success: true,
      message: `Successfully recorded attendance for ${savedRecords.length} students.`,
      count: savedRecords.length,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/attendance
// @desc    Record or update single student attendance
// @access  Private (Admin, Teacher)
router.post('/', authorize('admin', 'teacher'), async (req, res, next) => {
  try {
    const { studentId, classId, date, status, remarks } = req.body;

    if (!studentId || !classId || !date || !status) {
      return res.status(400).json({
        success: false,
        message: 'Student, class, date, and status are required',
      });
    }

    const targetDate = normalizeDate(date);
    const cls = await Class.findById(classId);

    const record = await Attendance.findOneAndUpdate(
      { student: studentId, class: classId, date: targetDate },
      {
        student: studentId,
        class: classId,
        course: cls ? cls.course : null,
        date: targetDate,
        status,
        remarks: remarks || '',
        recordedBy: req.user._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('student', 'firstName lastName enrollmentNumber');

    res.status(200).json({
      success: true,
      message: 'Attendance recorded successfully',
      record,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/attendance/:id
// @desc    Delete attendance record
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    res.status(200).json({ success: true, message: 'Attendance record deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;
