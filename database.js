const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  progress: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Progress' }],
  createdAt: { type: Date, default: Date.now }
});

// Progress Schema
const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  courseId: String,
  lessonsCompleted: [String],
  quizzesPassed: [String],
  projectsSubmitted: [String],
  lastAccessed: Date
});

const User = mongoose.model('User', userSchema);
const Progress = mongoose.model('Progress', progressSchema);

module.exports = { User, Progress };