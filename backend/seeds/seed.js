import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

dotenv.config();

import User from '../models/User.js';
import Course from '../models/Course.js';
import Class from '../models/Class.js';
import Teacher from '../models/Teacher.js';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import Grade from '../models/Grade.js';
import Announcement from '../models/Announcement.js';
import Setting from '../models/Setting.js';

const MONGODB_URI = process.env.MONGODB_URI;

const seedDatabase = async () => {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined. Please check backend/.env');
    process.exit(1);
  }

  try {
    console.log('🔄 Connecting to MongoDB to seed database...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB.');

    // Clear existing data safely
    console.log('🧹 Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Class.deleteMany({}),
      Teacher.deleteMany({}),
      Student.deleteMany({}),
      Attendance.deleteMany({}),
      Grade.deleteMany({}),
      Announcement.deleteMany({}),
      Setting.deleteMany({}),
    ]);

    console.log('🌱 Seeding Settings...');
    await Setting.create({
      institutionName: 'CampusCore Institute of Technology',
      tagline: 'Excellence in Engineering & Applied Sciences',
      email: 'contact@campuscore.edu',
      phone: '+1 (555) 234-5678',
      address: '742 University Blvd, Cambridge, MA 02138',
      currentAcademicYear: '2026-2027',
      currentSemester: 'Fall 2026',
      currency: '$',
    });

    console.log('🌱 Seeding Courses...');
    const courses = await Course.insertMany([
      {
        courseCode: 'CS101',
        courseName: 'Computer Science & Engineering',
        department: 'Computer Science',
        credits: 4,
        description: 'Foundations of algorithms, data structures, and computer architecture.',
        status: 'active',
      },
      {
        courseCode: 'IT201',
        courseName: 'Information Technology',
        department: 'Information Technology',
        credits: 3,
        description: 'Enterprise networking, cloud computing, and system administration.',
        status: 'active',
      },
      {
        courseCode: 'EE102',
        courseName: 'Electrical Engineering',
        department: 'Engineering',
        credits: 4,
        description: 'Circuit analysis, microprocessors, and digital signal processing.',
        status: 'active',
      },
      {
        courseCode: 'BA301',
        courseName: 'Business Administration',
        department: 'Management',
        credits: 3,
        description: 'Principles of organizational management, finance, and marketing.',
        status: 'active',
      },
    ]);

    console.log('🌱 Seeding Teachers...');
    const teachers = await Teacher.insertMany([
      {
        employeeId: 'TCH-001',
        firstName: 'Robert',
        lastName: 'Smith',
        email: 'dr.smith@campuscore.edu',
        phone: '+1 (555) 101-2001',
        department: 'Computer Science',
        designation: 'Professor & Department Head',
        qualification: 'Ph.D. in Computer Science (MIT)',
        assignedCourses: [courses[0]._id],
        status: 'Active',
      },
      {
        employeeId: 'TCH-002',
        firstName: 'Sarah',
        lastName: 'Jenkins',
        email: 'prof.jenkins@campuscore.edu',
        phone: '+1 (555) 101-2002',
        department: 'Information Technology',
        designation: 'Associate Professor',
        qualification: 'M.S. in Software Engineering (Stanford)',
        assignedCourses: [courses[1]._id],
        status: 'Active',
      },
      {
        employeeId: 'TCH-003',
        firstName: 'Michael',
        lastName: 'Chang',
        email: 'dr.chang@campuscore.edu',
        phone: '+1 (555) 101-2003',
        department: 'Engineering',
        designation: 'Assistant Professor',
        qualification: 'Ph.D. in Electrical Engineering (Caltech)',
        assignedCourses: [courses[2]._id],
        status: 'Active',
      },
    ]);

    console.log('🌱 Seeding Classes...');
    const classes = await Class.insertMany([
      {
        className: 'CS Year 1',
        section: 'A',
        academicYear: '2026-2027',
        course: courses[0]._id,
        classTeacher: teachers[0]._id,
        roomNumber: 'Lab Hall 101',
        capacity: 45,
        status: 'active',
      },
      {
        className: 'CS Year 1',
        section: 'B',
        academicYear: '2026-2027',
        course: courses[0]._id,
        classTeacher: teachers[0]._id,
        roomNumber: 'Lab Hall 102',
        capacity: 45,
        status: 'active',
      },
      {
        className: 'IT Year 2',
        section: 'A',
        academicYear: '2026-2027',
        course: courses[1]._id,
        classTeacher: teachers[1]._id,
        roomNumber: 'Tech Annex 204',
        capacity: 40,
        status: 'active',
      },
      {
        className: 'EE Year 1',
        section: 'A',
        academicYear: '2026-2027',
        course: courses[2]._id,
        classTeacher: teachers[2]._id,
        roomNumber: 'Engineering Center 301',
        capacity: 35,
        status: 'active',
      },
    ]);

    // Update teachers with assigned classes
    await Teacher.findByIdAndUpdate(teachers[0]._id, {
      assignedClasses: [classes[0]._id, classes[1]._id],
    });
    await Teacher.findByIdAndUpdate(teachers[1]._id, {
      assignedClasses: [classes[2]._id],
    });
    await Teacher.findByIdAndUpdate(teachers[2]._id, {
      assignedClasses: [classes[3]._id],
    });

    console.log('🌱 Seeding Students...');
    const students = await Student.insertMany([
      {
        enrollmentNumber: 'CC-2026-001',
        firstName: 'Alex',
        lastName: 'Johnson',
        email: 'alex.johnson@campuscore.edu',
        phone: '+1 (555) 301-4001',
        dateOfBirth: new Date('2004-05-14'),
        gender: 'Male',
        address: '12 Elm Street, Cambridge, MA',
        course: courses[0]._id,
        class: classes[0]._id,
        guardianName: 'Thomas Johnson',
        guardianPhone: '+1 (555) 301-9001',
        bloodGroup: 'O+',
        status: 'Active',
      },
      {
        enrollmentNumber: 'CC-2026-002',
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@campuscore.edu',
        phone: '+1 (555) 301-4002',
        dateOfBirth: new Date('2004-09-22'),
        gender: 'Female',
        address: '45 Pine Ridge, Somerville, MA',
        course: courses[0]._id,
        class: classes[0]._id,
        guardianName: 'Laura Davis',
        guardianPhone: '+1 (555) 301-9002',
        bloodGroup: 'A+',
        status: 'Active',
      },
      {
        enrollmentNumber: 'CC-2026-003',
        firstName: 'Daniel',
        lastName: 'Miller',
        email: 'daniel.miller@campuscore.edu',
        phone: '+1 (555) 301-4003',
        dateOfBirth: new Date('2003-11-03'),
        gender: 'Male',
        address: '88 Oak Lane, Boston, MA',
        course: courses[0]._id,
        class: classes[0]._id,
        guardianName: 'Richard Miller',
        guardianPhone: '+1 (555) 301-9003',
        bloodGroup: 'B+',
        status: 'Active',
      },
      {
        enrollmentNumber: 'CC-2026-004',
        firstName: 'Sophia',
        lastName: 'Martinez',
        email: 'sophia.martinez@campuscore.edu',
        phone: '+1 (555) 301-4004',
        dateOfBirth: new Date('2004-02-18'),
        gender: 'Female',
        address: '210 Maple Ave, Brookline, MA',
        course: courses[0]._id,
        class: classes[1]._id,
        guardianName: 'Carlos Martinez',
        guardianPhone: '+1 (555) 301-9004',
        bloodGroup: 'AB+',
        status: 'Active',
      },
      {
        enrollmentNumber: 'CC-2026-005',
        firstName: 'James',
        lastName: 'Wilson',
        email: 'james.wilson@campuscore.edu',
        phone: '+1 (555) 301-4005',
        dateOfBirth: new Date('2003-08-30'),
        gender: 'Male',
        address: '67 Cedar Court, Waltham, MA',
        course: courses[1]._id,
        class: classes[2]._id,
        guardianName: 'Helen Wilson',
        guardianPhone: '+1 (555) 301-9005',
        bloodGroup: 'O-',
        status: 'Active',
      },
      {
        enrollmentNumber: 'CC-2026-006',
        firstName: 'Olivia',
        lastName: 'Taylor',
        email: 'olivia.taylor@campuscore.edu',
        phone: '+1 (555) 301-4006',
        dateOfBirth: new Date('2004-04-12'),
        gender: 'Female',
        address: '34 Beacon St, Boston, MA',
        course: courses[2]._id,
        class: classes[3]._id,
        guardianName: 'Arthur Taylor',
        guardianPhone: '+1 (555) 301-9006',
        bloodGroup: 'A-',
        status: 'Active',
      },
    ]);

    console.log('🌱 Seeding User Accounts (Admin, Teacher, Student)...');
    // Note: User.pre('save') hashes password, so we use User.create one by one or create instances
    const adminUser = await User.create({
      name: 'System Administrator',
      email: 'admin@campuscore.edu',
      password: 'Admin@123',
      role: 'admin',
      phone: '+1 (555) 000-1111',
      status: 'active',
    });

    const teacherUser = await User.create({
      name: 'Dr. Robert Smith',
      email: 'dr.smith@campuscore.edu',
      password: 'Teacher@123',
      role: 'teacher',
      phone: teachers[0].phone,
      linkedTeacher: teachers[0]._id,
      status: 'active',
    });

    const studentUser = await User.create({
      name: 'Alex Johnson',
      email: 'alex.johnson@campuscore.edu',
      password: 'Student@123',
      role: 'student',
      phone: students[0].phone,
      linkedStudent: students[0]._id,
      status: 'active',
    });

    console.log('🌱 Seeding Attendance Records...');
    const attendanceStatuses = ['Present', 'Present', 'Present', 'Late', 'Present', 'Absent'];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendanceEntries = [];
    for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
      const attendanceDate = new Date(today);
      attendanceDate.setDate(attendanceDate.getDate() - dayOffset);

      students.forEach((student, idx) => {
        const status = attendanceStatuses[(idx + dayOffset) % attendanceStatuses.length];
        attendanceEntries.push({
          student: student._id,
          class: student.class,
          course: student.course,
          date: attendanceDate,
          status,
          remarks: status === 'Late' ? 'Arrived 15 minutes late' : '',
          recordedBy: teacherUser._id,
        });
      });
    }
    await Attendance.insertMany(attendanceEntries);

    console.log('🌱 Seeding Academic Marks / Grades...');
    const subjects = [
      { name: 'Data Structures & Algorithms', max: 100 },
      { name: 'Database Management Systems', max: 100 },
      { name: 'Web Application Development', max: 100 },
      { name: 'Computer Networks', max: 100 },
    ];

    const gradeEntries = [];
    students.slice(0, 4).forEach((student, studentIndex) => {
      subjects.forEach((subj, subjIndex) => {
        const marks = 70 + ((studentIndex * 7 + subjIndex * 8) % 28);
        const percentage = Number(((marks / subj.max) * 100).toFixed(2));
        let gradeLetter = 'B';
        if (percentage >= 90) gradeLetter = 'A+';
        else if (percentage >= 80) gradeLetter = 'A';
        else if (percentage >= 70) gradeLetter = 'B';
        else if (percentage >= 60) gradeLetter = 'C';

        gradeEntries.push({
          student: student._id,
          class: student.class,
          course: student.course,
          subject: subj.name,
          examName: 'Midterm Examination 2026',
          marksObtained: marks,
          totalMarks: subj.max,
          percentage,
          gradeLetter,
          remarks: 'Good performance in practical assessment',
          recordedBy: teacherUser._id,
        });
      });
    });
    await Grade.insertMany(gradeEntries);

    console.log('🌱 Seeding Announcements...');
    await Announcement.insertMany([
      {
        title: 'Welcome to CampusCore Academic Year 2026-2027',
        content:
          'Welcome all students and faculty members to the new semester! Please ensure your class schedules are up to date.',
        targetAudience: 'All',
        priority: 'High',
        author: adminUser._id,
        authorName: 'System Administrator',
      },
      {
        title: 'Midterm Examination Schedule Released',
        content:
          'The midterm exam schedules for Computer Science and IT departments have been published on the student portal.',
        targetAudience: 'Students',
        priority: 'Urgent',
        author: teacherUser._id,
        authorName: 'Dr. Robert Smith',
      },
      {
        title: 'Faculty Curriculum Review Meeting',
        content:
          'All department heads and teaching staff are requested to attend the quarterly curriculum review in Conference Room A.',
        targetAudience: 'Teachers',
        priority: 'Normal',
        author: adminUser._id,
        authorName: 'System Administrator',
      },
    ]);

    console.log('\n======================================================');
    console.log('🎉 Database seeding complete!');
    console.log('======================================================');
    console.log('🔑 Login Credentials Created:');
    console.log('------------------------------------------------------');
    console.log('1. Admin:');
    console.log('   Email:    admin@campuscore.edu');
    console.log('   Password: Admin@123');
    console.log('   Role:     admin');
    console.log('------------------------------------------------------');
    console.log('2. Teacher:');
    console.log('   Email:    dr.smith@campuscore.edu');
    console.log('   Password: Teacher@123');
    console.log('   Role:     teacher');
    console.log('------------------------------------------------------');
    console.log('3. Student:');
    console.log('   Email:    alex.johnson@campuscore.edu');
    console.log('   Password: Student@123');
    console.log('   Role:     student');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
