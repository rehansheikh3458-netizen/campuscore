import express from 'express';
import Grade from '../models/Grade.js';
import Student from '../models/Student.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

const calculateGradeLetter = (pct) => {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B';
  if (pct >= 60) return 'C';
  if (pct >= 50) return 'D';
  return 'F';
};

// @route   GET /api/grades
// @desc    Get all grades with filters
// @access  Private (Admin, Teacher full access; Student sees own)
router.get('/', async (req, res, next) => {
  try {
    const { classId, studentId, courseId, examName, subject } = req.query;
    const query = {};

    // Role-based restrictions: students can only see their own marks
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

    if (courseId && courseId !== 'all') {
      query.course = courseId;
    }

    if (examName && examName !== 'all') {
      query.examName = examName;
    }

    if (subject && subject.trim() !== '') {
      query.subject = new RegExp(subject.trim(), 'i');
    }

    const grades = await Grade.find(query)
      .populate('student', 'firstName lastName enrollmentNumber email')
      .populate('class', 'className section')
      .populate('course', 'courseName courseCode')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: grades.length,
      grades,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/grades/student/:studentId
// @desc    Get academic report card for a single student
// @access  Private
router.get('/student/:studentId', async (req, res, next) => {
  try {
    // Role check: Student can only view their own
    if (req.user.role === 'student') {
      const allowed =
        req.user.linkedStudent?.toString() === req.params.studentId;
      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only view your own report card',
        });
      }
    }

    const student = await Student.findById(req.params.studentId)
      .populate('course', 'courseName courseCode')
      .populate('class', 'className section');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const grades = await Grade.find({ student: req.params.studentId })
      .populate('course', 'courseName courseCode')
      .populate('class', 'className section')
      .sort({ createdAt: -1 });

    // Aggregate statistics
    const totalExams = grades.length;
    let totalPct = 0;
    let passedCount = 0;

    grades.forEach((g) => {
      totalPct += g.percentage || 0;
      if ((g.percentage || 0) >= 50) passedCount += 1;
    });

    const averagePercentage =
      totalExams > 0 ? Number((totalPct / totalExams).toFixed(2)) : 0;
    const overallGrade = calculateGradeLetter(averagePercentage);

    res.status(200).json({
      success: true,
      student,
      summary: {
        totalExams,
        passedCount,
        failedCount: totalExams - passedCount,
        averagePercentage,
        overallGrade,
      },
      grades,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/grades
// @desc    Add a new mark/grade entry
// @access  Private (Admin, Teacher)
router.post('/', authorize('admin', 'teacher'), async (req, res, next) => {
  try {
    const {
      student,
      class: classId,
      course,
      subject,
      examName,
      marksObtained,
      totalMarks,
      remarks,
    } = req.body;

    const marksNum = Number(marksObtained);
    const totalNum = Number(totalMarks) || 100;

    if (marksNum < 0 || marksNum > totalNum) {
      return res.status(400).json({
        success: false,
        message: `Marks obtained (${marksNum}) cannot be negative or exceed total marks (${totalNum})`,
      });
    }

    const percentage = Number(((marksNum / totalNum) * 100).toFixed(2));
    const gradeLetter = calculateGradeLetter(percentage);

    const grade = await Grade.create({
      student,
      class: classId,
      course,
      subject: subject.trim(),
      examName: examName.trim(),
      marksObtained: marksNum,
      totalMarks: totalNum,
      percentage,
      gradeLetter,
      remarks: remarks ? remarks.trim() : '',
      recordedBy: req.user._id,
    });

    const populatedGrade = await Grade.findById(grade._id)
      .populate('student', 'firstName lastName enrollmentNumber')
      .populate('class', 'className section')
      .populate('course', 'courseName courseCode');

    res.status(201).json({
      success: true,
      message: 'Grade recorded successfully',
      grade: populatedGrade,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/grades/:id
// @desc    Update a mark/grade entry
// @access  Private (Admin, Teacher)
router.put('/:id', authorize('admin', 'teacher'), async (req, res, next) => {
  try {
    const grade = await Grade.findById(req.params.id);
    if (!grade) {
      return res.status(404).json({ success: false, message: 'Grade record not found' });
    }

    const {
      student,
      class: classId,
      course,
      subject,
      examName,
      marksObtained,
      totalMarks,
      remarks,
    } = req.body;

    if (student) grade.student = student;
    if (classId) grade.class = classId;
    if (course) grade.course = course;
    if (subject) grade.subject = subject.trim();
    if (examName) grade.examName = examName.trim();
    if (remarks !== undefined) grade.remarks = remarks.trim();

    if (marksObtained !== undefined || totalMarks !== undefined) {
      const marksNum = marksObtained !== undefined ? Number(marksObtained) : grade.marksObtained;
      const totalNum = totalMarks !== undefined ? Number(totalMarks) : grade.totalMarks;

      if (marksNum < 0 || marksNum > totalNum) {
        return res.status(400).json({
          success: false,
          message: `Marks obtained (${marksNum}) cannot exceed total marks (${totalNum})`,
        });
      }

      grade.marksObtained = marksNum;
      grade.totalMarks = totalNum;
      grade.percentage = Number(((marksNum / totalNum) * 100).toFixed(2));
      grade.gradeLetter = calculateGradeLetter(grade.percentage);
    }

    await grade.save();

    const populatedGrade = await Grade.findById(grade._id)
      .populate('student', 'firstName lastName enrollmentNumber')
      .populate('class', 'className section')
      .populate('course', 'courseName courseCode');

    res.status(200).json({
      success: true,
      message: 'Grade updated successfully',
      grade: populatedGrade,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/grades/:id
// @desc    Delete a grade record
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const grade = await Grade.findByIdAndDelete(req.params.id);
    if (!grade) {
      return res.status(404).json({ success: false, message: 'Grade record not found' });
    }
    res.status(200).json({ success: true, message: 'Grade record deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
