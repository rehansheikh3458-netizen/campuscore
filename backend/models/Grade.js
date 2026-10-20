import mongoose from 'mongoose';

const calculateGradeLetter = (pct) => {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B';
  if (pct >= 60) return 'C';
  if (pct >= 50) return 'D';
  return 'F';
};

const gradeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class is required'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    examName: {
      type: String,
      required: [true, 'Exam name is required'],
      trim: true,
    },
    marksObtained: {
      type: Number,
      required: [true, 'Marks obtained is required'],
      min: [0, 'Marks cannot be negative'],
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks is required'],
      min: [1, 'Total marks must be greater than 0'],
      default: 100,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    gradeLetter: {
      type: String,
      default: 'F',
    },
    remarks: {
      type: String,
      default: '',
      trim: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Automatically calculate percentage and grade letter before saving
gradeSchema.pre('save', function (next) {
  if (this.totalMarks > 0) {
    this.percentage = Number(((this.marksObtained / this.totalMarks) * 100).toFixed(2));
    this.gradeLetter = calculateGradeLetter(this.percentage);
  }
  next();
});

export default mongoose.model('Grade', gradeSchema);
