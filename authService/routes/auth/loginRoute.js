const express = require("express");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const {
  generateJWTWithPrivateKey,
  fetchStudents,
  fetchProfessors,
} = require("./util");
const { ROLES } = require("../../../consts");
const { authServiceLogger } = require("../../../logging");

const router = express.Router();

dotenv.config();

// Admin Login
router.post("/admin", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // generate a token
    const token = generateJWTWithPrivateKey({
      id: ROLES.ADMIN,
      roles: [ROLES.ADMIN],
    });
    authServiceLogger.info(`Admin login successful: ${email}`);
    return res.status(201).json({ access_token: token });
  } catch (error) {
    authServiceLogger.error(`Admin login error: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
});

// Student Login
router.post("/student", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    // Get the list of students
    const students = await fetchStudents();
    const student = students.find((s) => s.email === email);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    const isMatch = await bcrypt.compare(password, student.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    // generate a token
    const token = generateJWTWithPrivateKey({
      id: student._id,
      roles: [ROLES.STUDENT],
    });
    authServiceLogger.info(`Student login successful: ${email}`);
    return res.status(201).json({ access_token: token });
  } catch (error) {
    authServiceLogger.error(`Student login error: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
});

// Professor Login
router.post("/professor", async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    // Get the list of professors
    const professors = await fetchProfessors();
    const professor = professors.find((p) => p.email === email);

    if (!professor) {
      return res.status(404).json({ message: "Professor not found" });
    }
    const isMatch = await bcrypt.compare(password, professor.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    // generate a token
    const token = generateJWTWithPrivateKey({
      id: professor._id,
      roles: [ROLES.PROFESSOR],
    });
    authServiceLogger.info(`Professor login successful: ${email}`);
    return res.status(201).json({ access_token: token });
  } catch (error) {
    authServiceLogger.error(`Professor login error: ${error.message}`);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
