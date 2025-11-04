import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import InvoiceGenerator from './components/InvoiceGenerator';
import './App.css';
import ThankYou from './pages/ThankYou';
import InvoiceEditor from './pages/InvoiceEditor';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/create-invoice" element={
              <ProtectedRoute>
                <InvoiceGenerator />
              </ProtectedRoute>
            } />

            <Route path="/invoice/:id" element={
              <ProtectedRoute>
                <InvoiceEditor />
              </ProtectedRoute>
            } />

            <Route path="/thank-you" element={
              <ProtectedRoute>
                <ThankYou />
              </ProtectedRoute>
            } />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
