const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {   // ✅ Required for client login
    type: String,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("Client", clientSchema);

console.log("✅ Client model loaded");
