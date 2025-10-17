// backend/controllers/planController.js
const Plan = require('../models/Plan');
const LLMService = require('../services/llmService'); // This will now use OpenAI

const generatePlan = async (req, res) => {
  try {
    const { goal, timeframe } = req.body;

    // Validation
    if (!goal || goal.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Goal is required and cannot be empty' 
      });
    }

    if (goal.length > 1000) {
      return res.status(400).json({ 
        success: false, 
        error: 'Goal is too long. Maximum 1000 characters allowed.' 
      });
    }

    console.log('🚀 Starting AI plan generation for:', goal);

    // Generate task breakdown using AI API
    const planData = await LLMService.generateTaskBreakdown(goal, timeframe);

    // Create new plan in database
    const plan = new Plan({
      goal: goal.trim(),
      timeframe: timeframe || '',
      tasks: planData.tasks,
      timeline: planData.timeline
    });

    const savedPlan = await plan.save();

    console.log('💾 Plan saved to database with ID:', savedPlan._id);

    res.status(201).json({
      success: true,
      message: 'AI-generated plan created successfully',
      plan: {
        id: savedPlan._id,
        goal: savedPlan.goal,
        timeframe: savedPlan.timeframe,
        tasks: savedPlan.tasks,
        timeline: savedPlan.timeline,
        created_at: savedPlan.created_at
      }
    });

  } catch (error) {
    console.error('❌ Plan generation failed:', error.message);
    
    if (error.message.includes('API key') || error.message.includes('quota')) {
      return res.status(503).json({ 
        success: false, 
        error: 'AI service temporarily unavailable. Please check your API key and quota.' 
      });
    }

    if (error.message.includes('JSON') || error.message.includes('parse')) {
      return res.status(500).json({ 
        success: false, 
        error: 'AI service returned invalid response. Please try again.' 
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate plan: ' + error.message 
    });
  }
};

const getPlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ 
        success: false, 
        error: 'Plan not found' 
      });
    }

    res.json({
      success: true,
      plan
    });

  } catch (error) {
    console.error('Error in getPlan:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid plan ID' 
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch plan' 
    });
  }
};

const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find()
      .select('goal timeframe timeline created_at')
      .sort({ created_at: -1 })
      .limit(50);

    res.json({
      success: true,
      plans,
      count: plans.length
    });

  } catch (error) {
    console.error('Error in getAllPlans:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch plans' 
    });
  }
};

const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndDelete(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ 
        success: false, 
        error: 'Plan not found' 
      });
    }

    res.json({
      success: true,
      message: 'Plan deleted successfully'
    });

  } catch (error) {
    console.error('Error in deletePlan:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete plan' 
    });
  }
};

module.exports = { 
  generatePlan, 
  getPlan, 
  getAllPlans, 
  deletePlan 
};