import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './views/Login';
import Landing from './views/Landing';
import Dashboard from './views/Dashboard';
import CaseDetail from './views/CaseDetail';
import MootCourt from './views/MootCourt';
import './index.css';



function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/case/:id" element={<CaseDetail />} />
          <Route path="/moot-court" element={<MootCourt />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
