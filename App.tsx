import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NewSale } from './pages/NewSale';
import { Tours } from './pages/Tours';
import { DailySummary } from './pages/DailySummary';
import { Closing } from './pages/Closing';
import { History } from './pages/History';
import { Reports } from './pages/Reports';
import Login from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from './components/ui/Toaster';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route 
          path="/new-sale" 
          element={
            <ProtectedRoute>
              <NewSale />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tours" 
          element={
            <ProtectedRoute>
              <Tours />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/summary" 
          element={
            <ProtectedRoute>
              <DailySummary />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/closing" 
          element={
            <ProtectedRoute>
              <Closing />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/history" 
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } 
        />
      </Routes>
      <Toaster />
    </HashRouter>
  );
};

export default App;
