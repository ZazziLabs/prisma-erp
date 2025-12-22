import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NewSale } from './pages/NewSale';
import { Tours } from './pages/Tours';
import { DailySummary } from './pages/DailySummary';
import { Closing } from './pages/Closing';
import { History } from './pages/History';
import { Reports } from './pages/Reports';
import Login from './pages/Login';
import { useAuth } from './hooks/useAuth';
import { Toaster } from './components/ui/Toaster';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/" />;
};


const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/new-sale" element={<PrivateRoute><NewSale /></PrivateRoute>} />
        <Route path="/tours" element={<PrivateRoute><Tours /></PrivateRoute>} />
        <Route path="/summary" element={<PrivateRoute><DailySummary /></PrivateRoute>} />
        <Route path="/closing" element={<PrivateRoute><Closing /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
      </Routes>
      <Toaster />
    </HashRouter>
  );
};

export default App;
