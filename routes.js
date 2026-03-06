const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Progress } = require('./database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed });
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.json({ token, user: { id: user._id, name, email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.json({ token, user: { id: user._id, name: user.name, email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auth middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get user progress
router.get('/progress', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('progress');
    // For simplicity, we'll generate stats from progress array
    let stats = {
      coursesEnrolled: user.progress.length,
      lessonsCompleted: user.progress.reduce((acc, p) => acc + (p.lessonsCompleted?.length || 0), 0),
      quizzesPassed: user.progress.reduce((acc, p) => acc + (p.quizzesPassed?.length || 0), 0),
      projectsDone: user.progress.reduce((acc, p) => acc + (p.projectsSubmitted?.length || 0), 0)
    };
    res.json({ progress: user.progress, stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update lesson progress
router.post('/progress/lesson', auth, async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;
    let progress = await Progress.findOne({ user: req.userId, courseId });
    if (!progress) {
      progress = new Progress({ user: req.userId, courseId, lessonsCompleted: [] });
    }
    if (!progress.lessonsCompleted.includes(lessonId)) {
      progress.lessonsCompleted.push(lessonId);
    }
    await progress.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update quiz progress
router.post('/progress/quiz', auth, async (req, res) => {
  try {
    const { courseId, quizId } = req.body;
    let progress = await Progress.findOne({ user: req.userId, courseId });
    if (!progress) {
      progress = new Progress({ user: req.userId, courseId, quizzesPassed: [] });
    }
    if (!progress.quizzesPassed.includes(quizId)) {
      progress.quizzesPassed.push(quizId);
    }
    await progress.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;