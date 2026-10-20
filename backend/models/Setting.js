import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    institutionName: {
      type: String,
      default: 'CampusCore Academy',
      trim: true,
    },
    tagline: {
      type: String,
      default: 'Empowering Next-Generation Education',
      trim: true,
    },
    email: {
      type: String,
      default: 'admin@campuscore.edu',
      trim: true,
    },
    phone: {
      type: String,
      default: '+1 (555) 019-2834',
      trim: true,
    },
    address: {
      type: String,
      default: '100 University Ave, Academic City',
      trim: true,
    },
    currentAcademicYear: {
      type: String,
      default: '2026-2027',
      trim: true,
    },
    currentSemester: {
      type: String,
      default: 'Fall 2026',
      trim: true,
    },
    currency: {
      type: String,
      default: '$',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Setting', settingSchema);
