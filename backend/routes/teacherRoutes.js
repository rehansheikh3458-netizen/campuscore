import express from 'express';
import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import Class from '../models/Class.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// @route   GET /api/teachers
// @desc    Get all teachers with search and filter
// @access  Private (Admin, Teacher)
router.get('/', async (req, res, next) => {
  try {
    const { search, department, status } = req.query;
    const query = {};

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { employeeId: searchRegex },
      ];
    }

    if (department && department !== 'all') {
      query.department = department;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const teachers = await Teacher.find(query)
      .populate('assignedCourses', 'courseName courseCode')
      .populate('assignedClasses', 'className section')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: teachers.length,
      teachers,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/teachers/:id
// @desc    Get single teacher details
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('assignedCourses')
      .populate('assignedClasses');

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    res.status(200).json({
      success: true,
      teacher,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/teachers
// @desc    Add a new teacher
// @access  Private (Admin only)
router.post('/', authorize('admin'), async (req, res, next) => {
  try {
    const {
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      department,
      designation,
      qualification,
      assignedCourses,
      assignedClasses,
      status,
      createLogin,
      loginPassword,
    } = req.body;

    const existingTeacher = await Teacher.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { employeeId: employeeId.toUpperCase().trim() },
      ],
    });

    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: 'A teacher with this email or employee ID already exists',
      });
    }

    const teacher = await Teacher.create({
      employeeId: employeeId.toUpperCase().trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : '',
      department: department.trim(),
      designation: designation || 'Assistant Professor',
      qualification: qualification || 'Master of Science',
      assignedCourses: assignedCourses || [],
      assignedClasses: assignedClasses || [],
      status: status || 'Active',
    });

    if (createLogin) {
      const defaultPassword = loginPassword || 'Teacher@123';
      try {
        await User.create({
          name: `${teacher.firstName} ${teacher.lastName}`,
          email: teacher.email,
          password: defaultPassword,
          role: 'teacher',
          phone: teacher.phone,
          linkedTeacher: teacher._id,
        });
      } catch (userErr) {
        console.warn('Note: Teacher user login creation skipped/failed:', userErr.message);
      }
    }

    const populatedTeacher = await Teacher.findById(teacher._id)
      .populate('assignedCourses', 'courseName courseCode')
      .populate('assignedClasses', 'className section');

    res.status(201).json({
      success: true,
      message: 'Teacher added successfully',
      teacher: populatedTeacher,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/teachers/:id
// @desc    Update teacher details
// @access  Private (Admin only)
router.put('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const {
      employeeId,
      firstName,
      lastName,
      email,
      phone,
      department,
      designation,
      qualification,
      assignedCourses,
      assignedClasses,
      status,
    } = req.body;

    if (email || employeeId) {
      const conflict = await Teacher.findOne({
        _id: { $ne: req.params.id },
        $or: [
          ...(email ? [{ email: email.toLowerCase().trim() }] : []),
          ...(employeeId ? [{ employeeId: employeeId.toUpperCase().trim() }] : []),
        ],
      });

      if (conflict) {
        return res.status(400).json({
          success: false,
          message: 'Another teacher already has this email or employee ID',
        });
      }
    }

    if (employeeId) teacher.employeeId = employeeId.toUpperCase().trim();
    if (firstName) teacher.firstName = firstName.trim();
    if (lastName) teacher.lastName = lastName.trim();
    if (email) teacher.email = email.toLowerCase().trim();
    if (phone !== undefined) teacher.phone = phone.trim();
    if (department) teacher.department = department.trim();
    if (designation) teacher.designation = designation.trim();
    if (qualification) teacher.qualification = qualification.trim();
    if (assignedCourses !== undefined) teacher.assignedCourses = assignedCourses;
    if (assignedClasses !== undefined) teacher.assignedClasses = assignedClasses;
    if (status) teacher.status = status;

    await teacher.save();

    await User.findOneAndUpdate(
      { linkedTeacher: teacher._id },
      { name: `${teacher.firstName} ${teacher.lastName}`, email: teacher.email }
    );

    const updatedTeacher = await Teacher.findById(teacher._id)
      .populate('assignedCourses', 'courseName courseCode')
      .populate('assignedClasses', 'className section');

    res.status(200).json({
      success: true,
      message: 'Teacher updated successfully',
      teacher: updatedTeacher,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/teachers/:id
// @desc    Delete teacher
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Unassign teacher from any classes
    await Class.updateMany({ classTeacher: req.params.id }, { $set: { classTeacher: null } });

    await Promise.all([
      Teacher.findByIdAndDelete(req.params.id),
      User.findOneAndDelete({ linkedTeacher: req.params.id }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Teacher deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
