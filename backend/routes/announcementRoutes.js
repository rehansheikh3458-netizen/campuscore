import express from 'express';
import Announcement from '../models/Announcement.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// @route   GET /api/announcements
// @desc    Get announcements tailored to user role
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const query = {};

    if (req.user.role === 'student') {
      query.targetAudience = { $in: ['All', 'Students'] };
    } else if (req.user.role === 'teacher') {
      query.targetAudience = { $in: ['All', 'Teachers'] };
    }

    const announcements = await Announcement.find(query)
      .populate('author', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/announcements
// @desc    Create a new announcement
// @access  Private (Admin, Teacher)
router.post('/', authorize('admin', 'teacher'), async (req, res, next) => {
  try {
    const { title, content, targetAudience, priority, expiresAt } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required',
      });
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      content: content.trim(),
      targetAudience: targetAudience || 'All',
      priority: priority || 'Normal',
      author: req.user._id,
      authorName: req.user.name,
      expiresAt: expiresAt || null,
    });

    res.status(201).json({
      success: true,
      message: 'Announcement posted successfully',
      announcement,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/announcements/:id
// @desc    Update announcement
// @access  Private (Admin or Author)
router.put('/:id', authorize('admin', 'teacher'), async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    // Teachers can only edit their own announcements
    if (
      req.user.role === 'teacher' &&
      announcement.author &&
      announcement.author.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit announcements you authored',
      });
    }

    const { title, content, targetAudience, priority, expiresAt } = req.body;

    if (title) announcement.title = title.trim();
    if (content) announcement.content = content.trim();
    if (targetAudience) announcement.targetAudience = targetAudience;
    if (priority) announcement.priority = priority;
    if (expiresAt !== undefined) announcement.expiresAt = expiresAt;

    await announcement.save();

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      announcement,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete announcement
// @access  Private (Admin or Author)
router.delete('/:id', authorize('admin', 'teacher'), async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    if (
      req.user.role === 'teacher' &&
      announcement.author &&
      announcement.author.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete announcements you authored',
      });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
