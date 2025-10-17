// frontend/src/pages/Home.js
import React, { useState } from 'react';
import { planAPI } from '../services/api';
import './Home.css';

const Home = () => {
  const [goal, setGoal] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!goal.trim()) {
      setError('Please enter a goal');
      return;
    }

    setLoading(true);
    setError('');
    setPlan(null);

    try {
      const response = await planAPI.generatePlan({ goal, timeframe });
      setPlan(response.data.plan);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className="container">
        <div className="hero-section">
          <h1>Smart Task Planner</h1>
          <p>Break down your goals into actionable tasks with AI-powered planning</p>
        </div>

        <form onSubmit={handleSubmit} className="goal-form">
          <div className="form-group">
            <label htmlFor="goal">What do you want to achieve?</label>
            <textarea
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Learn React in 2 months, Build a portfolio website, Launch a startup in 6 months"
              rows="3"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="timeframe">Timeframe (optional)</label>
            <input
              type="text"
              id="timeframe"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              placeholder="e.g., 2 weeks, 1 month, 3 months"
            />
          </div>
          
          <button type="submit" disabled={loading} className="generate-btn">
            {loading ? 'Generating Plan...' : 'Generate Plan'}
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {plan && (
          <div className="plan-result">
            <h2>Your Action Plan: {plan.goal}</h2>
            <div className="timeline-info">
              <p><strong>Start Date:</strong> {new Date(plan.timeline.startDate).toLocaleDateString()}</p>
              <p><strong>End Date:</strong> {new Date(plan.timeline.endDate).toLocaleDateString()}</p>
            </div>
            
            <div className="tasks-section">
              <h3>Tasks ({plan.tasks.length})</h3>
              <div className="tasks-list">
                {plan.tasks.map((task, index) => (
                  <div key={task.taskId} className={`task-card priority-${task.priority}`}>
                    <div className="task-header">
                      <h4>{task.name}</h4>
                      <span className={`priority-badge ${task.priority}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="task-description">{task.description}</p>
                    <div className="task-details">
                      <span>⏱️ {task.estimatedHours} hours</span>
                      <span>📅 {new Date(task.deadline).toLocaleDateString()}</span>
                    </div>
                    {task.dependencies && task.dependencies.length > 0 && (
                      <div className="dependencies">
                        <strong>Depends on:</strong> {task.dependencies.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;