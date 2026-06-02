const express = require("express");
const Professor = require("../models/professor");
const bcrypt = require("bcrypt");
const { verifyRole, restrictProfessorToOwnData } = require("./auth/util");
const { ROLES } = require("../../consts");
const { professorServiceLogger } = require("../../logging");
const router = express.Router();

// Create a new professor
router.post("/", verifyRole([ROLES.ADMIN]), async (req, res) => {
  try {
    professorServiceLogger.info(`[POST /api/professors] Creating professor: ${req.body.email}`);
    const professor = new Professor(req.body);
    await professor.save();
    professorServiceLogger.info(`[POST /api/professors] Professor created successfully: ${professor._id}`);
    res.status(201).json(professor);
  } catch (error) {
    professorServiceLogger.error(`[POST /api/professors] Error creating professor: ${error.message}`);
    res.status(400).json({ error: error.message });
  }
});

// Get all professors
router.get(
  "/",
  verifyRole([ROLES.ADMIN, ROLES.AUTH_SERVICE, ROLES.PROFESSOR]),
  async (req, res) => {
    try {
      professorServiceLogger.info(`[GET /api/professors] Fetching all professors`);
      const professors = await Professor.find();
      professorServiceLogger.info(`[GET /api/professors] Found ${professors.length} professors`);
      res.status(200).json(professors);
    } catch (error) {
      professorServiceLogger.error(`[GET /api/professors] Error fetching professors: ${error.message}`);
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
      professorServiceLogger.info(`[GET /api/professors/:id] Fetching professor: ${req.params.id}`);
      const professor = await Professor.findById(req.params.id);
      if (!professor) {
        professorServiceLogger.warn(`[GET /api/professors/:id] Professor not found: ${req.params.id}`);
        return res.status(404).json({ message: "Professor not found" });
      }
      professorServiceLogger.info(`[GET /api/professors/:id] Professor found: ${professor.email}`);
      res.status(200).json(professor);
    } catch (error) {
      professorServiceLogger.error(`[GET /api/professors/:id] Error: ${error.message}`);
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
      professorServiceLogger.info(`[PUT /api/professors/:id] Updating professor: ${req.params.id}`);
      const professor = await Professor.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!professor) {
        professorServiceLogger.warn(`[PUT /api/professors/:id] Professor not found: ${req.params.id}`);
        return res.status(404).json({ message: "Professor not found" });
      }
      professorServiceLogger.info(`[PUT /api/professors/:id] Professor updated successfully`);
      res.status(200).json(professor);
    } catch (error) {
      professorServiceLogger.error(`[PUT /api/professors/:id] Error: ${error.message}`);
      res.status(400).json({ error: error.message });
    }
  }
);

// Delete a professor by ID
router.delete("/:id", verifyRole([ROLES.ADMIN]), async (req, res) => {
  try {
    professorServiceLogger.info(`[DELETE /api/professors/:id] Deleting professor: ${req.params.id}`);
    const professor = await Professor.findByIdAndDelete(req.params.id);

    if (!professor) {
      professorServiceLogger.warn(`[DELETE /api/professors/:id] Professor not found: ${req.params.id}`);
      return res.status(404).json({ message: "Professor not found" });
    }

    professorServiceLogger.info(`[DELETE /api/professors/:id] Professor deleted successfully`);
    res
      .status(200)
      .json({ message: "Professor deleted successfully", professor });
  } catch (error) {
    professorServiceLogger.error(`[DELETE /api/professors/:id] Error: ${error.message}`);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid professor ID format" });
    }
    res
      .status(500)
      .json({ message: "Server Error: Unable to delete professor" });
  }
});

module.exports = router;
