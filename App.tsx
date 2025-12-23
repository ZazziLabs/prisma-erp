import React, { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from './components/ui/Toaster';
import { Sparkles } from 'lucide-react';

const NewSale = lazy(() => import('./pages/NewSale').then(m => ({ default: m.NewSale })));
const Tours = lazy(() => import('./pages/Tours').then(m => ({ default: m.Tours })));
const DailySummary = lazy(() => import('./pages/DailySummary').then(m => ({ default: m.DailySummary })));
const Closing = lazy(() => import('./pages/Closing').then(m => ({ default: m.Closing })));
const History = lazy(() => import('./pages/History').then(m => ({ default: m.History })));
const Reports = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const Login = lazy(() => import('./pages/Login'));

const LoadingFallback: React.FC = React.memo(() => (
  <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
        <Sparkles size={24} className="text-white" />
      </div>
      <span className="text-gray-500 dark:text-gray-400 text-sm">Carregando...</span>
    </div>
  </div>
));

LoadingFallback.displayName = 'LoadingFallback';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Suspense fallback={<LoadingFallback />}>
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
      </Suspense>
      <Toaster />
    </HashRouter>
  );
};

export default App;
