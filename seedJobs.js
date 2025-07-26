const mongoose = require('mongoose');
const Job = require('../models/Job');
require('dotenv').config({ path: '../.env' });

const jobs = [
  {
    title: "Software Developer",
    skills: ["Programming", "Critical Thinking", "Complex Problem Solving", "Systems Analysis", "Active Learning"]
  },
  {
    title: "Registered Nurse",
    skills: ["Active Listening", "Social Perceptiveness", "Service Orientation", "Coordination", "Monitoring"]
  },
  {
    title: "Accountant",
    skills: ["Mathematics", "Critical Thinking", "Active Listening", "Reading Comprehension", "Judgment and Decision Making"]
  },
  {
    title: "Marketing Manager",
    skills: ["Active Listening", "Speaking", "Coordination", "Social Perceptiveness", "Critical Thinking"]
  }
];

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    await Job.deleteMany({});
    await Job.insertMany(jobs);
    console.log("Jobs seeded!");
    mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    mongoose.disconnect();
  }); 