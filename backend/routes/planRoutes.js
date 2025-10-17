// backend/routes/planRoutes.js
const express = require('express');
const router = express.Router();

// Import controller functions
const planController = require('../controllers/planController');

// POST /api/plans/generate - Generate a new plan
router.post('/generate', planController.generatePlan);

// GET /api/plans - Get all plans
router.get('/', planController.getAllPlans);

// GET /api/plans/:id - Get a specific plan
router.get('/:id', planController.getPlan);

// DELETE /api/plans/:id - Delete a plan
router.delete('/:id', planController.deletePlan);

module.exports = router;