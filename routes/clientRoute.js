const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");

// Signup
router.get("/signup", clientController.getSignup);
router.post("/signup", clientController.postSignup);

// Login
router.get("/login", clientController.getLogin);
router.post("/login", clientController.postLogin);

// Dashboard
router.get("/dashboard/:id", clientController.getDashboard);

module.exports = router;
