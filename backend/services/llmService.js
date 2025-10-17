// backend/services/llmService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

class LLMService {
  constructor() {
    // Initialize Google Gemini
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2000,
      }
    });
    
    this.isConfigured = !!process.env.GOOGLE_AI_API_KEY;
    console.log('🤖 LLM Service initialized:', this.isConfigured ? 'Google Gemini' : 'No API Key');
  }

  async generateTaskBreakdown(goal, timeframe = '') {
    // Try Google Gemini first
    try {
      if (this.isConfigured) {
        console.log('🎯 Attempting to generate plan with Google Gemini...');
        const geminiResult = await this.generateWithGemini(goal, timeframe);
        console.log('✅ Successfully generated plan with Gemini');
        return geminiResult;
      } else {
        throw new Error('Google AI API key not configured');
      }
    } catch (apiError) {
      console.error('❌ Gemini API failed:', apiError.message);
      
      // Fallback to a smarter local generator
      console.log('🔄 Using enhanced fallback generator...');
      return this.generateEnhancedFallback(goal, timeframe);
    }
  }

  async generateWithGemini(goal, timeframe) {
    const prompt = this.createPrompt(goal, timeframe);
    
    console.log('📤 Sending request to Google Gemini...');
    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    console.log('📥 Received response from Gemini');
    
    // Clean and parse the response
    const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
    
    let planData;
    try {
      planData = JSON.parse(cleanedResponse);
      console.log('✅ Successfully parsed JSON response');
    } catch (parseError) {
      console.error('❌ JSON parsing failed, trying to extract JSON...');
      // Try to extract JSON from the response
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        planData = JSON.parse(jsonMatch[0]);
        console.log('✅ Extracted JSON from response');
      } else {
        console.error('❌ Could not extract JSON from response');
        throw new Error('Invalid JSON response from AI: ' + cleanedResponse.substring(0, 200));
      }
    }

    // Validate the structure
    this.validatePlanData(planData);

    // Process and return the data
    return this.processPlanData(planData);
  }

  generateEnhancedFallback(goal, timeframe) {
    console.log('🔧 Generating smart fallback plan for:', goal);
    
    // Analyze the goal to create context-aware tasks
    const goalAnalysis = this.analyzeGoal(goal);
    const tasks = this.generateContextAwareTasks(goalAnalysis, timeframe);
    
    const planData = {
      tasks: tasks,
      timeline: {
        startDate: new Date(),
        endDate: this.calculateEndDate(timeframe)
      }
    };

    console.log('✅ Fallback plan generated with', tasks.length, 'tasks');
    return planData;
  }

  analyzeGoal(goal) {
    const goalLower = goal.toLowerCase();
    
    return {
      isLearning: goalLower.includes('learn') || goalLower.includes('study') || goalLower.includes('understand'),
      isDevelopment: goalLower.includes('build') || goalLower.includes('create') || goalLower.includes('develop') || goalLower.includes('make'),
      isBusiness: goalLower.includes('launch') || goalLower.includes('start') || goalLower.includes('business') || goalLower.includes('company'),
      isFitness: goalLower.includes('fitness') || goalLower.includes('exercise') || goalLower.includes('workout') || goalLower.includes('gym'),
      isLanguage: goalLower.includes('language') || goalLower.includes('speak') || goalLower.includes('learn english') || goalLower.includes('learn spanish'),
      isCoding: goalLower.includes('programming') || goalLower.includes('coding') || goalLower.includes('python') || goalLower.includes('javascript'),
      originalGoal: goal
    };
  }

  generateContextAwareTasks(analysis, timeframe) {
    const timestamp = Date.now();
    let baseTasks = [];

    if (analysis.isLearning && analysis.isCoding) {
      baseTasks = this.generateCodingLearningTasks(analysis.originalGoal, timeframe);
    } else if (analysis.isLearning && analysis.isLanguage) {
      baseTasks = this.generateLanguageLearningTasks(analysis.originalGoal, timeframe);
    } else if (analysis.isLearning) {
      baseTasks = this.generateLearningTasks(analysis.originalGoal, timeframe);
    } else if (analysis.isDevelopment) {
      baseTasks = this.generateDevelopmentTasks(analysis.originalGoal, timeframe);
    } else if (analysis.isBusiness) {
      baseTasks = this.generateBusinessTasks(analysis.originalGoal, timeframe);
    } else if (analysis.isFitness) {
      baseTasks = this.generateFitnessTasks(analysis.originalGoal, timeframe);
    } else {
      baseTasks = this.generateGenericTasks(analysis.originalGoal, timeframe);
    }

    // Add task IDs and structure
    return baseTasks.map((task, index) => ({
      ...task,
      taskId: `task_${timestamp}_${index}`,
      deadline: new Date(Date.now() + (index + 1) * 3 * 24 * 60 * 60 * 1000), // 3 days apart
      status: 'not-started'
    }));
  }

  generateCodingLearningTasks(goal, timeframe) {
    return [
      {
        name: 'Research learning path and resources',
        description: `Find the best tutorials, documentation, and practice resources for ${goal}`,
        estimatedHours: 6,
        dependencies: [],
        priority: 'high'
      },
      {
        name: 'Set up development environment',
        description: 'Install necessary IDEs, tools, and configure coding environment',
        estimatedHours: 4,
        dependencies: ['Research learning path and resources'],
        priority: 'high'
      },
      {
        name: 'Learn basic syntax and concepts',
        description: 'Study fundamental programming concepts and language syntax',
        estimatedHours: 15,
        dependencies: ['Set up development environment'],
        priority: 'medium'
      },
      {
        name: 'Practice with small coding exercises',
        description: 'Solve coding challenges and build small programs to reinforce learning',
        estimatedHours: 20,
        dependencies: ['Learn basic syntax and concepts'],
        priority: 'medium'
      },
      {
        name: 'Build a complete project',
        description: 'Develop a full project to apply all learned concepts practically',
        estimatedHours: 25,
        dependencies: ['Practice with small coding exercises'],
        priority: 'medium'
      },
      {
        name: 'Learn debugging and best practices',
        description: 'Study debugging techniques and industry best practices',
        estimatedHours: 10,
        dependencies: ['Build a complete project'],
        priority: 'low'
      },
      {
        name: 'Explore advanced topics and next steps',
        description: 'Research advanced concepts and plan continued learning path',
        estimatedHours: 8,
        dependencies: ['Learn debugging and best practices'],
        priority: 'low'
      }
    ];
  }

  generateLanguageLearningTasks(goal, timeframe) {
    return [
      {
        name: 'Assess current level and set goals',
        description: 'Evaluate starting proficiency and define specific learning objectives',
        estimatedHours: 2,
        dependencies: [],
        priority: 'high'
      },
      {
        name: 'Gather learning materials',
        description: 'Collect textbooks, apps, online courses, and practice resources',
        estimatedHours: 3,
        dependencies: ['Assess current level and set goals'],
        priority: 'high'
      },
      {
        name: 'Learn basic vocabulary and phrases',
        description: 'Study essential words and common expressions',
        estimatedHours: 15,
        dependencies: ['Gather learning materials'],
        priority: 'medium'
      },
      {
        name: 'Practice grammar and sentence structure',
        description: 'Study grammatical rules and practice constructing sentences',
        estimatedHours: 20,
        dependencies: ['Learn basic vocabulary and phrases'],
        priority: 'medium'
      },
      {
        name: 'Develop listening and speaking skills',
        description: 'Practice comprehension and conversation through various media',
        estimatedHours: 25,
        dependencies: ['Practice grammar and sentence structure'],
        priority: 'medium'
      },
      {
        name: 'Immerse in the language',
        description: 'Engage with native content, find language partners, and practice regularly',
        estimatedHours: 30,
        dependencies: ['Develop listening and speaking skills'],
        priority: 'low'
      }
    ];
  }

  generateLearningTasks(goal, timeframe) {
    return [
      {
        name: 'Define learning objectives and scope',
        description: `Clearly outline what you want to achieve with ${goal}`,
        estimatedHours: 3,
        dependencies: [],
        priority: 'high'
      },
      {
        name: 'Research learning resources and materials',
        description: 'Find books, courses, tutorials, and other learning materials',
        estimatedHours: 4,
        dependencies: ['Define learning objectives and scope'],
        priority: 'high'
      },
      {
        name: 'Create study schedule and plan',
        description: 'Develop a structured learning plan with milestones',
        estimatedHours: 2,
        dependencies: ['Research learning resources and materials'],
        priority: 'high'
      },
      {
        name: 'Learn fundamental concepts',
        description: 'Study the basic principles and foundational knowledge',
        estimatedHours: 20,
        dependencies: ['Create study schedule and plan'],
        priority: 'medium'
      },
      {
        name: 'Apply knowledge through practice',
        description: 'Reinforce learning through exercises and practical application',
        estimatedHours: 18,
        dependencies: ['Learn fundamental concepts'],
        priority: 'medium'
      },
      {
        name: 'Review and assess progress',
        description: 'Evaluate understanding and identify areas for improvement',
        estimatedHours: 5,
        dependencies: ['Apply knowledge through practice'],
        priority: 'low'
      }
    ];
  }

  generateDevelopmentTasks(goal, timeframe) {
    return [
      {
        name: 'Define project requirements and features',
        description: `Outline specific functionality and requirements for ${goal}`,
        estimatedHours: 6,
        dependencies: [],
        priority: 'high'
      },
      {
        name: 'Plan technical architecture',
        description: 'Design system structure, database schema, and technology stack',
        estimatedHours: 8,
        dependencies: ['Define project requirements and features'],
        priority: 'high'
      },
      {
        name: 'Set up development environment',
        description: 'Install and configure necessary tools, frameworks, and libraries',
        estimatedHours: 4,
        dependencies: ['Plan technical architecture'],
        priority: 'high'
      },
      {
        name: 'Develop core functionality',
        description: 'Implement main features and backend logic',
        estimatedHours: 35,
        dependencies: ['Set up development environment'],
        priority: 'medium'
      },
      {
        name: 'Create user interface',
        description: 'Develop frontend components and user experience',
        estimatedHours: 25,
        dependencies: ['Develop core functionality'],
        priority: 'medium'
      },
      {
        name: 'Testing and quality assurance',
        description: 'Perform unit testing, integration testing, and bug fixing',
        estimatedHours: 15,
        dependencies: ['Create user interface'],
        priority: 'medium'
      },
      {
        name: 'Deployment and launch preparation',
        description: 'Prepare for deployment, configure servers, and final testing',
        estimatedHours: 8,
        dependencies: ['Testing and quality assurance'],
        priority: 'low'
      }
    ];
  }

  calculateEndDate(timeframe) {
    const now = new Date();
    let days = 14; // default 2 weeks
    
    if (timeframe) {
      if (timeframe.includes('month')) {
        const months = parseInt(timeframe) || 1;
        days = months * 30;
      } else if (timeframe.includes('week')) {
        const weeks = parseInt(timeframe) || 2;
        days = weeks * 7;
      } else if (timeframe.includes('day')) {
        days = parseInt(timeframe) || 14;
      }
    }
    
    return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  }

  processPlanData(planData) {
    const timestamp = Date.now();
    planData.tasks = planData.tasks.map((task, index) => ({
      ...task,
      taskId: `task_${timestamp}_${index}`,
      deadline: new Date(task.deadline),
      status: 'not-started'
    }));

    planData.timeline.startDate = new Date(planData.timeline.startDate);
    planData.timeline.endDate = new Date(planData.timeline.endDate);

    return planData;
  }

  createPrompt(goal, timeframe) {
    return `
You are an expert project manager and planner. Break down the following goal into actionable tasks with realistic timelines and dependencies.

GOAL: ${goal}
TIMEFRAME: ${timeframe || 'Not specified - use reasonable estimates'}

CRITICAL REQUIREMENTS:
1. Return ONLY valid JSON, no other text
2. Use current date as reference: ${new Date().toISOString().split('T')[0]}
3. Make tasks specific and actionable
4. Ensure dependencies reference exact task names
5. Estimate hours realistically (1-8 hours per task typically)
6. Set deadlines that make logical sense
7. Include 5-8 tasks total
8. Tasks should be sequential with clear dependencies
9. Consider the nature of the goal when creating tasks

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "tasks": [
    {
      "name": "Specific task name",
      "description": "Clear, actionable description",
      "estimatedHours": 4,
      "deadline": "2024-01-15",
      "dependencies": ["Previous task name"],
      "priority": "high"
    }
  ],
  "timeline": {
    "startDate": "2024-01-10",
    "endDate": "2024-01-20"
  }
}

Now create a task breakdown for: "${goal}"${timeframe ? ` within ${timeframe}` : ''}
`;
  }

  validatePlanData(planData) {
    if (!planData.tasks || !Array.isArray(planData.tasks)) {
      throw new Error('Invalid plan data: tasks array missing');
    }

    if (!planData.timeline || !planData.timeline.startDate || !planData.timeline.endDate) {
      throw new Error('Invalid plan data: timeline missing');
    }

    planData.tasks.forEach((task, index) => {
      if (!task.name || !task.description) {
        throw new Error(`Task ${index} missing required fields`);
      }
    });
  }
}

module.exports = new LLMService();