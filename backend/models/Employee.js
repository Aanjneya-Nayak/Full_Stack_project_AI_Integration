const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Employee name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  department: {
    type: String,
    required: [true, "Department is required"],
    trim: true,
  },
  skills: {
    type: [String],
    required: [true, "At least one skill is required"],
    validate: {
      validator: (arr) => arr.length > 0,
      message: "Skills array cannot be empty",
    },
  },
  performanceScore: {
    type: Number,
    required: [true, "Performance score is required"],
    min: [0, "Score cannot be less than 0"],
    max: [100, "Score cannot exceed 100"],
  },
  experience: {
    type: Number,
    required: [true, "Experience is required"],
    min: [0, "Experience cannot be negative"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Employee", EmployeeSchema);
