import express from 'express';
import Course from '../models/Course.js';
import Class from '../models/Class.js';
import Student from '../models/Student.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// @route   GET /api/courses
// @desc    Get all courses with search & department filter
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const { search, department, status } = req.query;
    const query = {};

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { courseCode: searchRegex },
        { courseName: searchRegex },
        { department: searchRegex },
      ];
    }

    if (department && department !== 'all') {
      query.department = department;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const courses = await Course.find(query).sort({ courseCode: 1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/courses/:id
// @desc    Get single course
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.status(200).json({ success: true, course });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/courses
// @desc    Create a new course
// @access  Private (Admin only)
router.post('/', authorize('admin'), async (req, res, next) => {
  try {
    const { courseCode, courseName, department, credits, description, status } = req.body;

    const existingCourse = await Course.findOne({
      courseCode: courseCode.toUpperCase().trim(),
    });

    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'A course with this course code already exists',
      });
    }

    const course = await Course.create({
      courseCode: courseCode.toUpperCase().trim(),
      courseName: courseName.trim(),
      department: department.trim(),
      credits: Number(credits) || 3,
      description: description ? description.trim() : '',
      status: status || 'active',
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private (Admin only)
router.put('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const { courseCode, courseName, department, credits, description, status } = req.body;

    if (courseCode) {
      const conflict = await Course.findOne({
        _id: { $ne: req.params.id },
        courseCode: courseCode.toUpperCase().trim(),
      });
      if (conflict) {
        return res.status(400).json({
          success: false,
          message: 'Another course is already using this course code',
        });
      }
      course.courseCode = courseCode.toUpperCase().trim();
    }

    if (courseName) course.courseName = courseName.trim();
    if (department) course.department = department.trim();
    if (credits !== undefined) course.credits = Number(credits);
    if (description !== undefined) course.description = description.trim();
    if (status) course.status = status;

    await course.save();

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      course,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if classes or students are enrolled
    const linkedClasses = await Class.countDocuments({ course: req.params.id });
    const linkedStudents = await Student.countDocuments({ course: req.params.id });

    if (linkedClasses > 0 || linkedStudents > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete course: ${linkedClasses} classes and ${linkedStudents} students are enrolled in this course.`,
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
