const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
    age: {
    type: Number,
    min: 16,
    max: 100,
  },
  department: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model("Employee", employeeSchema);

console.log("✅ Employee model loaded");
