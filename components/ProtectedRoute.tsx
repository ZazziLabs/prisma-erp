import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Sparkles } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-[#820ad1] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(130,10,209,0.3)] animate-pulse">
            <Sparkles size={24} className="text-white" />
          </div>
          <span className="text-white/60 text-sm">Verificando autenticação...</span>
        </div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/" replace />;
};
