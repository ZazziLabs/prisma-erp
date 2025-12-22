import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { NewSale } from './pages/NewSale';
import { Tours } from './pages/Tours';
import { DailySummary } from './pages/DailySummary';
import { Closing } from './pages/Closing';
import { History } from './pages/History';
import { Reports } from './pages/Reports';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<NewSale />} />
        <Route path="/tours" element={<Tours />} />
        <Route path="/summary" element={<DailySummary />} />
        <Route path="/closing" element={<Closing />} />
        <Route path="/history" element={<History />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
