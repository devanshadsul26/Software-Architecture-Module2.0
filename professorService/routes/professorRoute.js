const express = require("express");
const Professor = require("../models/professor");
const bcrypt = require("bcrypt");
const { verifyRole, restrictProfessorToOwnData } = require("./auth/util");
const { ROLES } = require("../../consts");
const router = express.Router();

// Create a new professor
router.post("/", verifyRole([ROLES.ADMIN]), async (req, res) => {
  try {
    const professor = new Professor(req.body);
    await professor.save();
    res.status(201).json(professor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all professors
router.get(
  "/",
  verifyRole([ROLES.ADMIN, ROLES.AUTH_SERVICE, ROLES.PROFESSOR]),
  async (req, res) => {
    try {
      const professors = await Professor.find();
      res.status(200).json(professors);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Get a single professor by ID
router.get(
  "/:id",
  verifyRole([ROLES.ADMIN, ROLES.PROFESSOR]),
  restrictProfessorToOwnData,
  async (req, res) => {
    try {
      const professor = await Professor.findById(req.params.id);
      if (!professor) {
        return res.status(404).json({ message: "Professor not found" });
      }
      res.status(200).json(professor);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Update a professor by ID
router.put(
  "/:id",
  verifyRole([ROLES.ADMIN, ROLES.PROFESSOR]),
  restrictProfessorToOwnData,
  async (req, res) => {
    try {
      const professor = await Professor.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!professor) {
        return res.status(404).json({ message: "Professor not found" });
      }
      res.status(200).json(professor);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Delete a professor by ID
router.delete("/:id", verifyRole([ROLES.ADMIN]), async (req, res) => {
  try {
    const professor = await Professor.findByIdAndDelete(req.params.id);

    if (!professor) {
      return res.status(404).json({ message: "Professor not found" });
    }

    res
      .status(200)
      .json({ message: "Professor deleted successfully", professor });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid professor ID format" });
    }
    res
      .status(500)
      .json({ message: "Server Error: Unable to delete professor" });
  }
});

module.exports = router;
