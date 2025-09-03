const Employee = require("../models/Employee");
const { validationResult } = require("express-validator");
const { body } = require("express-validator");
const csv = require('csv-parser');
const fs = require('fs');
const { Parser } = require('json2csv');


// Validators
exports.validators = [
  body("name").notEmpty().withMessage("Name required"),
  body("email").isEmail().withMessage("Valid email required"),
  body("age").optional().isInt({ min: 16, max: 100 }),
];

async function parseAndValidateCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    const errors = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        const name = row.name?.trim();
        const email = row.email?.trim();

        if (name && email) {
          results.push({
            name,
            email,
            age: row.age ? parseInt(row.age) : undefined,
          });
        } else {
          errors.push({ msg: `Invalid row (missing name/email): ${JSON.stringify(row)}` });
        }
      })
      .on("end", async () => {
        try {
          if (errors.length > 0) {
            return resolve({ errors });
          }

          // Check for existing emails in DB
          const emails = results.map((r) => r.email);
          const existingEmails = await Employee.find({ email: { $in: emails } }).select("email");
          const existingEmailSet = new Set(existingEmails.map((e) => e.email));

          // Filter out duplicates
          const uniqueResults = results.filter((r) => !existingEmailSet.has(r.email));

          if (uniqueResults.length === 0) {
            errors.push({ msg: "All emails already exist in database." });
            return resolve({ errors });
          }

          resolve({ results: uniqueResults, errors });
        } catch (err) {
          reject(err);
        }
      })
      .on("error", (err) => reject(err));
  });
};

// Utility function to generate CSV string from employees
async function generateCSVFromEmployees() {
  const employees = await Employee.find().lean();

  if (!employees.length) {
    throw new Error("No employees found");
  }

  const fields = ["_id", "name", "email", "age"];
  const json2csvParser = new Parser({ fields });
  return json2csvParser.parse(employees);
}



// Web Handlers
exports.list = async (req, res) => {
  const q = req.query.q || ""; // search query
  const page = parseInt(req.query.page) || 1; // current page
  const limit = parseInt(req.query.page) || 10;
  const perPage = 10; // how many employees per page

  const filter = q
    ? { $or: [{ name: new RegExp(q, "i") }, { email: new RegExp(q, "i") }] }
    : {};

  try {
    // total employees (for pagination)
    const count = await Employee.countDocuments(filter);

    // fetch employees with skip & limit
    const employees = await Employee.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.render("employees/index", {
      title: "employees",
      employees,
      q,
      current: page,
      pages: Math.ceil(count / perPage)
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};


exports.show = async (req, res) => {
  const emp = await Employee.findById(req.params.id);
  if (!emp) return res.status(404).render("employees", { title: "Not found", body: "<h2>Employee not Found</h2>" });
  res.render("employees/show", { title: emp.name, emp });
};

exports.newForm = (req, res) => {
  res.render("employees/new", { title: "Add Employee", errors: [], values: {} });
};

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render("employees/new", { title: "Add Employee", errors: errors.array(), values: req.body });
  }

  try {
    await Employee.create(req.body);
    res.redirect("/employees");
  } catch (err) {
    res.render("employees/new", {
      title: "Add Employee",
      errors: [{ msg: err.code === 11000 ? "Email Already exists" : err.message }],
      values: req.body
    });
  }
};

exports.editForm = async (req, res) => {
  const emp = await Employee.findById(req.params.id);
  if (!emp) return res.status(404).render("/employees/index", { title: "Not Found", body: "<h2>Employee not found</h2>" });
  res.render("employees/edit", { title: "Edit Employee", emp, errors: [] });
};

exports.updateOne = async (req, res) => {
  const errors = validationResult(req);
  const emp = { _id: req.params.id, ...req.body };
  if (!errors.isEmpty()) {
    return res.render("employees/edit", { title: "Edit Employee", emp, errors: errors.array() });
  }
  try {
    await Employee.findByIdAndUpdate(req.params.id, req.body);
    res.redirect(`/employees/${req.params.id}`);
  } catch (err) {
    res.render("employees/edit", {
      title: "Edit Employee",
      emp,
      errors: [{ msg: err.code === 11000 ? "Email Already exists" : err.message }]
    });
  }
};

exports.destroy = async (req, res) => {
  await Employee.findByIdAndDelete(req.params.id);
  res.redirect("/employees");
};
exports.bulkUpload = async (req, res) => {
  if (!req.file) {
    return res.render("employees/bulk", {
      title: "Add Employee",
      errors: [{ msg: "No file uploaded" }],
      values: {}
    });
  }

  try {
    const { results, errors } = await parseAndValidateCSV(req.file.path);

    fs.unlinkSync(req.file.path); // Delete uploaded file

    if (errors && errors.length > 0) {
      return res.render("employees/bulk", {
        title: "Bulk Upload Failed",
        errors,
        values: {}
      });
    }

    await Employee.insertMany(results, { ordered: false });

    res.render("employees/bulk", {
      title: "Bulk Upload Completed",
      errors: [],
      values: {}
    });

  } catch (err) {
    console.error(err);
    res.render("employees/bulk", {
      title: "Rmaining Data Upload Successfully ",
      errors: [{ msg: err.message }],
      values: {}
    });
  }
};

exports.downloadCsv = async (req, res) => {
  try {
    const csvData = await generateCSVFromEmployees();

    res.header("Content-Type", "text/csv");
    res.attachment("employees.csv");
    res.send(csvData);
  } catch (err) {
    console.error("Error generating CSV:", err.message);
    res.status(500).send("Error generating CSV file: " + err.message);
  }
};


// API Handlers
exports.apiList = async (req, res) => {
  const employees = await Employee.find().sort({ createdAt: -1 });
  res.json(employees);
};

exports.apiGet = async (req, res) => {
  const emp = await Employee.findById(req.params.id);
  if (!emp) return res.status(404).json({ message: "Not Found" });
  res.json(emp);
};

exports.apiCreate = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  try {
    const emp = await Employee.create(req.body);
    res.status(201).json(emp);
  } catch (err) {
    res.status(400).json({ message: err.code === 11000 ? "Email Already exists" : err.message });
  }
};

exports.apiUpdate = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });
  const emp = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!emp) return res.status(404).json({ message: "Not Found" });
  res.json(emp);
};

exports.apiDelete = async (req, res) => {
  const emp = await Employee.findByIdAndDelete(req.params.id);
  if (!emp) return res.status(404).json({ message: "Not Found" });
  res.json({ message: "Employee Deleted Successfully" });
};


exports.apiBulkUpload = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const { results, errors } = await parseAndValidateCSV(req.file.path);

    fs.unlinkSync(req.file.path); // Clean up file ASAP

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const insertedEmployees = await Employee.insertMany(results, { ordered: false });

    res.status(201).json({
      message: "File uploaded successfully",
      insertedCount: insertedEmployees.length,
      insertedEmployees,
    });
  } catch (err) {
    console.error("Error in api Upload", err);
    res.status(500).json({
      message: "Duplicates Exists",
      err
    });
  }
};

exports.apidownloadCSV = async (req, res) => {
  try {
    const csvData = await generateCSVFromEmployees();
    res.header("Content-Type", "text/csv");
    res.attachment("employees.csv");
    return res.json(csvData);
  } catch (err) {
    res.status(500).json("Error in Getting Employees Details")

  }
}