import express from 'express';
import Class from '../models/Class.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// @route   GET /api/classes
// @desc    Get all classes with filters
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const { course, academicYear, search } = req.query;
    const query = {};

    if (course && course !== 'all') {
      query.course = course;
    }

    if (academicYear && academicYear !== 'all') {
      query.academicYear = academicYear;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ className: searchRegex }, { section: searchRegex }];
    }

    // If teacher, optionally restrict or tag
    if (req.user.role === 'teacher' && req.query.assignedOnly === 'true' && req.user.linkedTeacher) {
      query.$or = [
        { classTeacher: req.user.linkedTeacher },
      ];
    }

    const classes = await Class.find(query)
      .populate('course', 'courseName courseCode department')
      .populate('classTeacher', 'firstName lastName employeeId email')
      .sort({ className: 1 });

    // Attach student count to each class
    const classesWithCount = await Promise.all(
      classes.map(async (cls) => {
        const studentCount = await Student.countDocuments({ class: cls._id });
        const obj = cls.toObject();
        obj.studentCount = studentCount;
        return obj;
      })
    );

    res.status(200).json({
      success: true,
      count: classesWithCount.length,
      classes: classesWithCount,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/classes/:id
// @desc    Get single class with enrolled students
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const cls = await Class.findById(req.params.id)
      .populate('course')
      .populate('classTeacher');

    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const students = await Student.find({ class: cls._id }).sort({ enrollmentNumber: 1 });

    res.status(200).json({
      success: true,
      class: cls,
      studentCount: students.length,
      students,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/classes/:id/students
// @desc    Get all students in a specific class
// @access  Private
router.get('/:id/students', async (req, res, next) => {
  try {
    const students = await Student.find({ class: req.params.id })
      .populate('course', 'courseName courseCode')
      .sort({ lastName: 1, firstName: 1 });

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/classes
// @desc    Create a new class
// @access  Private (Admin only)
router.post('/', authorize('admin'), async (req, res, next) => {
  try {
    const { className, section, academicYear, course, classTeacher, roomNumber, capacity, status } =
      req.body;

    const newClass = await Class.create({
      className: className.trim(),
      section: section ? section.trim() : 'A',
      academicYear: academicYear || '2026-2027',
      course,
      classTeacher: classTeacher || null,
      roomNumber: roomNumber ? roomNumber.trim() : '',
      capacity: Number(capacity) || 40,
      status: status || 'active',
    });

    // If a classTeacher was assigned, update the Teacher model's assignedClasses
    if (classTeacher) {
      await Teacher.findByIdAndUpdate(classTeacher, {
        $addToSet: { assignedClasses: newClass._id },
      });
    }

    const populatedClass = await Class.findById(newClass._id)
      .populate('course', 'courseName courseCode')
      .populate('classTeacher', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      class: populatedClass,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/classes/:id
// @desc    Update class
// @access  Private (Admin only)
router.put('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const { className, section, academicYear, course, classTeacher, roomNumber, capacity, status } =
      req.body;

    const oldTeacher = cls.classTeacher ? cls.classTeacher.toString() : null;

    if (className) cls.className = className.trim();
    if (section !== undefined) cls.section = section.trim();
    if (academicYear) cls.academicYear = academicYear.trim();
    if (course) cls.course = course;
    if (classTeacher !== undefined) cls.classTeacher = classTeacher || null;
    if (roomNumber !== undefined) cls.roomNumber = roomNumber.trim();
    if (capacity !== undefined) cls.capacity = Number(capacity);
    if (status) cls.status = status;

    await cls.save();

    // Sync teacher assignedClasses if changed
    const newTeacher = classTeacher || null;
    if (oldTeacher && oldTeacher !== newTeacher) {
      await Teacher.findByIdAndUpdate(oldTeacher, { $pull: { assignedClasses: cls._id } });
    }
    if (newTeacher && oldTeacher !== newTeacher) {
      await Teacher.findByIdAndUpdate(newTeacher, { $addToSet: { assignedClasses: cls._id } });
    }

    const updatedClass = await Class.findById(cls._id)
      .populate('course', 'courseName courseCode')
      .populate('classTeacher', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Class updated successfully',
      class: updatedClass,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/classes/:id
// @desc    Delete class
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const enrolledStudents = await Student.countDocuments({ class: req.params.id });
    if (enrolledStudents > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete class: ${enrolledStudents} students are assigned to this class.`,
      });
    }

    if (cls.classTeacher) {
      await Teacher.findByIdAndUpdate(cls.classTeacher, {
        $pull: { assignedClasses: cls._id },
      });
    }

    await Class.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Class deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
