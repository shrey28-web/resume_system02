const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// Recommend jobs based on user's skills
router.post('/recommend', async (req, res) => {
  const { skills } = req.body;
  if (!skills || !Array.isArray(skills)) {
    return res.status(400).json({ error: 'Skills array required' });
  }

  try {
    const jobs = await Job.find({});
    const recommendations = jobs.map(job => {
      const matchCount = job.skills.filter(skill => skills.some(userSkill =>
        userSkill.toLowerCase() === skill.toLowerCase()
      )).length;
      return { ...job.toObject(), matchCount };
    }).filter(job => job.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount);

    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch job recommendations' });
  }
});

// List all jobs
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.find({});
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

module.exports = router; 