import express from 'express';
import Setting from '../models/Setting.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// @route   GET /api/settings
// @desc    Get institution settings
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({
        institutionName: 'CampusCore Academy',
        tagline: 'Empowering Next-Generation Education',
        email: 'admin@campuscore.edu',
        phone: '+1 (555) 019-2834',
        address: '100 University Ave, Academic City',
        currentAcademicYear: '2026-2027',
        currentSemester: 'Fall 2026',
        currency: '$',
      });
    }

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/settings
// @desc    Update institution settings
// @access  Private (Admin only)
router.put('/', authorize('admin'), async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
    }

    const {
      institutionName,
      tagline,
      email,
      phone,
      address,
      currentAcademicYear,
      currentSemester,
      currency,
    } = req.body;

    if (institutionName) settings.institutionName = institutionName.trim();
    if (tagline !== undefined) settings.tagline = tagline.trim();
    if (email) settings.email = email.trim();
    if (phone !== undefined) settings.phone = phone.trim();
    if (address !== undefined) settings.address = address.trim();
    if (currentAcademicYear) settings.currentAcademicYear = currentAcademicYear.trim();
    if (currentSemester) settings.currentSemester = currentSemester.trim();
    if (currency) settings.currency = currency.trim();

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Institution settings updated successfully',
      settings,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
