const express = require("express");
const multer = require('multer');
const { 
  apiList, 
  apiGet, 
  validators, 
  apiUpdate, 
  apiDelete, 
  apiCreate, 
  apiBulkUpload,
  apidownloadCSV
} = require('../controllers/employeeController');

const upload = multer({ dest: "uploads/" });
const router = express.Router();

// API Routes
router.get("/", apiList);  
router.get("/download-csv",apidownloadCSV)                
router.get("/:id", apiGet);
router.post("/", validators, apiCreate);     // Create a new employee
router.post("/bulk", upload.single("csvfile"), apiBulkUpload); // Bulk upload of employees
router.put("/:id", validators, apiUpdate);  // Update a specific employee by ID
router.patch("/:id",apiUpdate)
router.delete("/:id", apiDelete);           // Delete a specific employee by ID

module.exports = router;
