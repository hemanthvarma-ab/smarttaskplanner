// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import MyPlans from './pages/MyPlans';
import PlanDetail from './pages/PlanDetail';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/my-plans" element={<MyPlans />} />
          <Route path="/plan/:id" element={<PlanDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;