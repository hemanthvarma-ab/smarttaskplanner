// frontend/src/pages/MyPlans.js
import React, { useState, useEffect } from 'react';
import { planAPI } from '../services/api';
import './MyPlans.css';

const MyPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await planAPI.getAllPlans();
      setPlans(response.data.plans || []);
    } catch (err) {
      setError('Failed to fetch plans');
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const deletePlan = async (planId) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await planAPI.deletePlan(planId);
        setPlans(plans.filter(plan => plan._id !== planId));
      } catch (err) {
        setError('Failed to delete plan');
      }
    }
  };

  if (loading) {
    return (
      <div className="my-plans">
        <div className="container">
          <h1>My Plans</h1>
          <div className="loading">Loading your plans...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-plans">
      <div className="container">
        <div className="plans-header">
          <h1>My Plans ({plans.length})</h1>
          <button onClick={fetchPlans} className="refresh-btn">
            Refresh
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {plans.length === 0 ? (
          <div className="no-plans">
            <h2>No plans yet</h2>
            <p>Create your first plan to get started!</p>
            <a href="/" className="create-plan-btn">Create Plan</a>
          </div>
        ) : (
          <div className="plans-grid">
            {plans.map((plan) => (
              <div key={plan._id} className="plan-card">
                <div className="plan-header">
                  <h3>{plan.goal}</h3>
                  <button 
                    onClick={() => deletePlan(plan._id)}
                    className="delete-btn"
                    title="Delete plan"
                  >
                    ×
                  </button>
                </div>
                
                <div className="plan-meta">
                  <span>Timeframe: {plan.timeframe || 'Not specified'}</span>
                  <span>Tasks: {plan.tasks ? plan.tasks.length : 0}</span>
                </div>

                <div className="plan-timeline">
                  <div className="timeline-item">
                    <strong>Start:</strong> {new Date(plan.timeline.startDate).toLocaleDateString()}
                  </div>
                  <div className="timeline-item">
                    <strong>End:</strong> {new Date(plan.timeline.endDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="plan-actions">
                  <a href={`/plan/${plan._id}`} className="view-details-btn">
                    View Details
                  </a>
                  <span className="created-date">
                    Created: {new Date(plan.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPlans;