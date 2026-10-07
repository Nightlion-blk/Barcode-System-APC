import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importing the Login component
import Login from './Login';

//Imported the dashboard components for different user roles
import AdminDashboard from './AdminDashboard';
import CoordinatorDashboard from './CoordinatorDashboard';
import EncoderTerminal from './EncoderTerminal';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* If a user goes to the base URL, automatically redirect them to /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* The Login Page Route */}
        <Route path="/login" element={<Login />} />

        {/* Placeholder Routes for your Dashboards */}
        <Route 
          path="/admin" element={<AdminDashboard />} />
        <Route 
          path="/coordinator" element={<CoordinatorDashboard />} />
        <Route 
          path="/encoder" element={<EncoderTerminal />} />
      </Routes>
    </Router>
  );
}