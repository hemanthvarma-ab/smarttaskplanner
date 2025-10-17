// frontend/src/pages/PlanDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { planAPI } from '../services/api';
import './PlanDetail.css';

const PlanDetail = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPlan();
  }, [id]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const response = await planAPI.getPlan(id);
      setPlan(response.data.plan);
    } catch (err) {
      setError('Plan not found');
      console.error('Error fetching plan:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="plan-detail">
        <div className="container">
          <div className="loading">Loading plan details...</div>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="plan-detail">
        <div className="container">
          <div className="error-message">{error || 'Plan not found'}</div>
          <a href="/my-plans" className="back-link">← Back to My Plans</a>
        </div>
      </div>
    );
  }

  return (
    <div className="plan-detail">
      <div className="container">
        <div className="plan-header">
          <h1>{plan.goal}</h1>
          <a href="/my-plans" className="back-link">← Back to My Plans</a>
        </div>

        <div className="plan-meta">
          <div className="meta-item">
            <strong>Timeframe:</strong> {plan.timeframe || 'Not specified'}
          </div>
          <div className="meta-item">
            <strong>Created:</strong> {new Date(plan.created_at).toLocaleDateString()}
          </div>
        </div>

        <div className="timeline-section">
          <h2>Timeline</h2>
          <div className="timeline">
            <div className="timeline-item">
              <strong>Start Date:</strong> {new Date(plan.timeline.startDate).toLocaleDateString()}
            </div>
            <div className="timeline-item">
              <strong>End Date:</strong> {new Date(plan.timeline.endDate).toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="tasks-section">
          <h2>Tasks ({plan.tasks.length})</h2>
          <div className="tasks-list">
            {plan.tasks.map((task, index) => (
              <div key={task.taskId} className={`task-card priority-${task.priority}`}>
                <div className="task-header">
                  <h3>Task {index + 1}: {task.name}</h3>
                  <span className={`priority-badge ${task.priority}`}>
                    {task.priority}
                  </span>
                </div>
                <p className="task-description">{task.description}</p>
                <div className="task-details">
                  <span>⏱️ Estimated: {task.estimatedHours} hours</span>
                  <span>📅 Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                  <span>📊 Status: {task.status}</span>
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
    </div>
  );
};

export default PlanDetail;