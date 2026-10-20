import express from 'express';
import Student from '../models/Student.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Grade from '../models/Grade.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply auth protection to all student routes
router.use(protect);

// @route   GET /api/students
// @desc    Get all students with search and filter
// @access  Private (Admin, Teacher full list; Student sees own)
router.get('/', async (req, res, next) => {
  try {
    const { search, course, classId, status, page = 1, limit = 50 } = req.query;

    const query = {};

    // Role-based restrictions: Student can only see their own profile
    if (req.user.role === 'student') {
      if (req.user.linkedStudent) {
        query._id = req.user.linkedStudent;
      } else {
        query.email = req.user.email;
      }
    }

    // Search by firstName, lastName, email, or enrollmentNumber
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { enrollmentNumber: searchRegex },
      ];
    }

    // Filter by Course
    if (course && course !== 'all') {
      query.course = course;
    }

    // Filter by Class
    if (classId && classId !== 'all') {
      query.class = classId;
    }

    // Filter by Status
    if (status && status !== 'all') {
      query.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [students, total] = await Promise.all([
      Student.find(query)
        .populate('course', 'courseName courseCode')
        .populate('class', 'className section academicYear')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Student.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      students,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/students/:id
// @desc    Get single student details
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('course')
      .populate('class');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Role restriction: Students can only view their own profile
    if (req.user.role === 'student') {
      const isOwner =
        (req.user.linkedStudent && req.user.linkedStudent.toString() === student._id.toString()) ||
        req.user.email.toLowerCase() === student.email.toLowerCase();

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only view your own student record',
        });
      }
    }

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/students
// @desc    Add a new student
// @access  Private (Admin only)
router.post('/', authorize('admin'), async (req, res, next) => {
  try {
    const {
      enrollmentNumber,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      course,
      class: classId,
      guardianName,
      guardianPhone,
      bloodGroup,
      status,
      createLogin,
      loginPassword,
    } = req.body;

    // Check duplicate email or enrollment
    const existingStudent = await Student.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { enrollmentNumber: enrollmentNumber.toUpperCase().trim() },
      ],
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'A student with this email or enrollment number already exists',
      });
    }

    const student = await Student.create({
      enrollmentNumber: enrollmentNumber.toUpperCase().trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : '',
      dateOfBirth: dateOfBirth || null,
      gender: gender || 'Male',
      address: address ? address.trim() : '',
      course,
      class: classId || null,
      guardianName: guardianName ? guardianName.trim() : '',
      guardianPhone: guardianPhone ? guardianPhone.trim() : '',
      bloodGroup: bloodGroup || 'O+',
      status: status || 'Active',
    });

    // Optionally create user account for student login
    if (createLogin) {
      const defaultPassword = loginPassword || 'Student@123';
      try {
        const user = await User.create({
          name: `${student.firstName} ${student.lastName}`,
          email: student.email,
          password: defaultPassword,
          role: 'student',
          phone: student.phone,
          linkedStudent: student._id,
        });
      } catch (userErr) {
        console.warn('Note: Student user login creation skipped/failed:', userErr.message);
      }
    }

    const populatedStudent = await Student.findById(student._id)
      .populate('course', 'courseName courseCode')
      .populate('class', 'className section');

    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      student: populatedStudent,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/students/:id
// @desc    Update student details
// @access  Private (Admin only)
router.put('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const {
      enrollmentNumber,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      course,
      class: classId,
      guardianName,
      guardianPhone,
      bloodGroup,
      status,
    } = req.body;

    // Check if new email or enrollment is taken by another student
    if (email || enrollmentNumber) {
      const conflict = await Student.findOne({
        _id: { $ne: req.params.id },
        $or: [
          ...(email ? [{ email: email.toLowerCase().trim() }] : []),
          ...(enrollmentNumber ? [{ enrollmentNumber: enrollmentNumber.toUpperCase().trim() }] : []),
        ],
      });

      if (conflict) {
        return res.status(400).json({
          success: false,
          message: 'Another student already has this email or enrollment number',
        });
      }
    }

    if (enrollmentNumber) student.enrollmentNumber = enrollmentNumber.toUpperCase().trim();
    if (firstName) student.firstName = firstName.trim();
    if (lastName) student.lastName = lastName.trim();
    if (email) student.email = email.toLowerCase().trim();
    if (phone !== undefined) student.phone = phone.trim();
    if (dateOfBirth !== undefined) student.dateOfBirth = dateOfBirth;
    if (gender) student.gender = gender;
    if (address !== undefined) student.address = address.trim();
    if (course) student.course = course;
    if (classId !== undefined) student.class = classId || null;
    if (guardianName !== undefined) student.guardianName = guardianName.trim();
    if (guardianPhone !== undefined) student.guardianPhone = guardianPhone.trim();
    if (bloodGroup !== undefined) student.bloodGroup = bloodGroup;
    if (status) student.status = status;

    await student.save();

    // Also update associated User name/email if exists
    await User.findOneAndUpdate(
      { linkedStudent: student._id },
      { name: `${student.firstName} ${student.lastName}`, email: student.email }
    );

    const updatedStudent = await Student.findById(student._id)
      .populate('course', 'courseName courseCode')
      .populate('class', 'className section');

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      student: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete a student & associated records
// @access  Private (Admin only)
router.delete('/:id', authorize('admin'), async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await Promise.all([
      Student.findByIdAndDelete(req.params.id),
      User.findOneAndDelete({ linkedStudent: req.params.id }),
      Attendance.deleteMany({ student: req.params.id }),
      Grade.deleteMany({ student: req.params.id }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Student and related records deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
