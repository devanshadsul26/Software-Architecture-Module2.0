const express = require("express");

const Student = require("../models/student");

const { verifyRole, restrictStudentToOwnData } = require("./auth/util");
const { ROLES } = require("../../consts");

const router = express.Router();

// Create a new student
router.post("/", verifyRole([ROLES.ADMIN]), async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all students
router.get(
  "/",
  verifyRole([ROLES.ADMIN, ROLES.PROFESSOR, ROLES.AUTH_SERVICE]),
  async (req, res) => {
    try {
      const students = await Student.find();
      res.status(200).json(students);
    } catch (error) {
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
      const student = await Student.findById(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.status(200).json(student);
    } catch (error) {
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
      const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.status(200).json(student);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Delete a student by ID
router.delete("/:id", verifyRole([ROLES.ADMIN]), async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Student deleted successfully", student });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid student ID format" });
    }
    res.status(500).json({ message: "Server Error: Unable to delete student" });
  }
});

module.exports = router;
