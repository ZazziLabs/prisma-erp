import React, { useState } from 'react';
import { Menu, X, ShoppingBag, Box, BarChart2, Lock, Folder, Moon, Sun, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const menuItems = [
    { icon: ShoppingBag, label: 'Nova Venda', path: '/new-sale' },
    { icon: Box, label: 'Adicionar Pacotes', path: '/tours' },
    { icon: BarChart2, label: 'Resumo do Dia', path: '/summary' },
    { icon: Lock, label: 'Fechamento', path: '/closing' },
    { icon: Folder, label: 'Histórico', path: '/history' },
    { icon: BarChart2, label: 'Relatórios', path: '/reports' },
  ];

  const getTitle = () => {
    const item = menuItems.find(i => i.path === location.pathname);
    return item ? item.label : 'Prisma ERP';
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-hidden font-sans`}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 shadow-sm z-30 flex items-center px-4 justify-between">
        <button onClick={toggleSidebar} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <Menu className="w-6 h-6 text-purple-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-800 dark:text-white tracking-tight">{getTitle()}</h1>
        <div className="w-8" /> {/* Spacer for centering */}
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity" 
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 w-80 bg-purple-700 dark:bg-gray-900 z-50 transform transition-transform duration-300 ease-out shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 flex justify-between items-center text-white">
          <h2 className="text-2xl font-bold tracking-tighter">Prisma ERP</h2>
          <button onClick={toggleSidebar} className="p-1 hover:bg-white/10 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="px-4 py-2 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                onClick={toggleSidebar}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${isActive ? 'bg-white text-purple-700 shadow-lg' : 'text-white hover:bg-white/10'}`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-purple-700' : 'text-white/80'}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-8 left-4 right-4">
          <button 
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-purple-800/50 dark:bg-gray-800 text-white hover:bg-purple-800 dark:hover:bg-gray-700 transition-colors border border-white/10"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="font-medium">{isDarkMode ? 'Modo Claro' : 'Modo Escuro'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pt-20 pb-24 px-4 max-w-lg mx-auto min-h-screen">
        {children}
      </main>
    </div>
  );
};
