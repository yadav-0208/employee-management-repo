const express = require('express');
const router = express.Router();
const adminContoller = require('../controllers/adminController');

router.get("/login",adminContoller.getLogin);
router.post("/login",adminContoller.postLogin);

module.exports= router;