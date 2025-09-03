const express = require('express');
const multer = require('multer');
const { 
  newForm,
  validators,
  create,
  show,
  editForm,
  updateOne,
  list,
  destroy,
  bulkUpload,
  downloadCsv
} = require('../controllers/employeeController');

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.get("/bulk",bulkUpload);
 


router.get("/", list);
router.get("/new", newForm);
router.post("/bulk", upload.single("csvfile"), bulkUpload);
router.get("/download-csv", downloadCsv);
router.post("/", validators, create);
router.get("/:id", show);
router.get("/:id/edit", editForm);
router.put("/:id", validators, updateOne);
router.delete("/:id", destroy);

module.exports = router;
