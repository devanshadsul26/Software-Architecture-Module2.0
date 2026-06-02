const express = require("express");

const Student = require("../models/student");

const { verifyRole, restrictStudentToOwnData } = require("./auth/util");
const { ROLES } = require("../../consts");
const { studentServiceLogger } = require("../../logging");

const router = express.Router();

// Create a new student
router.post("/", verifyRole([ROLES.ADMIN]), async (req, res) => {
  try {
    studentServiceLogger.info(`[POST /api/students] Creating student: ${req.body.email}`);
    const student = new Student(req.body);
    await student.save();
    studentServiceLogger.info(`[POST /api/students] Student created successfully: ${student._id}`);
    res.status(201).json(student);
  } catch (error) {
    studentServiceLogger.error(`[POST /api/students] Error creating student: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

// Get all students
router.get(
  "/",
  verifyRole([ROLES.ADMIN, ROLES.PROFESSOR, ROLES.AUTH_SERVICE]),
  async (req, res) => {
    try {
      studentServiceLogger.info(`[GET /api/students] Fetching all students`);
      const students = await Student.find();
      studentServiceLogger.info(`[GET /api/students] Found ${students.length} students`);
      res.status(200).json(students);
    } catch (error) {
      studentServiceLogger.error(`[GET /api/students] Error fetching students: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }
);

// Get a single student by ID
router.get(
  "/:id",
  verifyRole([ROLES.ADMIN, ROLES.PROFESSOR, ROLES.STUDENT]),
  restrictStudentToOwnData,
  async (req, res) => {
    try {
      studentServiceLogger.info(`[GET /api/students/:id] Fetching student: ${req.params.id}`);
      const student = await Student.findById(req.params.id);
      if (!student) {
        studentServiceLogger.warn(`[GET /api/students/:id] Student not found: ${req.params.id}`);
        return res.status(404).json({ message: "Student not found" });
      }
      studentServiceLogger.info(`[GET /api/students/:id] Student found: ${student.email}`);
      res.status(200).json(student);
    } catch (error) {
      studentServiceLogger.error(`[GET /api/students/:id] Error: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }
);

// Update a student by ID
router.put(
  "/:id",
  verifyRole([ROLES.ADMIN, ROLES.PROFESSOR, ROLES.STUDENT]),
  restrictStudentToOwnData,
  async (req, res) => {
    try {
      studentServiceLogger.info(`[PUT /api/students/:id] Updating student: ${req.params.id}`);
      const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!student) {
        studentServiceLogger.warn(`[PUT /api/students/:id] Student not found: ${req.params.id}`);
        return res.status(404).json({ message: "Student not found" });
      }
      studentServiceLogger.info(`[PUT /api/students/:id] Student updated successfully`);
      res.status(200).json(student);
    } catch (error) {
      studentServiceLogger.error(`[PUT /api/students/:id] Error: ${error.message}`);
      res.status(400).json({ error: error.message });
    }
  }
);

// Delete a student by ID
router.delete("/:id", verifyRole([ROLES.ADMIN]), async (req, res) => {
  try {
    studentServiceLogger.info(`[DELETE /api/students/:id] Deleting student: ${req.params.id}`);
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      studentServiceLogger.warn(`[DELETE /api/students/:id] Student not found: ${req.params.id}`);
      return res.status(404).json({ message: "Student not found" });
    }

    studentServiceLogger.info(`[DELETE /api/students/:id] Student deleted successfully`);
    res.status(200).json({ message: "Student deleted successfully", student });
  } catch (error) {
    studentServiceLogger.error(`[DELETE /api/students/:id] Error: ${error.message}`);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid student ID format" });
    }
    res.status(500).json({ message: "Server Error: Unable to delete student" });
  }
});

module.exports = router;
