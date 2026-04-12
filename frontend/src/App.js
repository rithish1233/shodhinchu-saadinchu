import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import HostLogin from './pages/HostLogin';
import TeamLogin from './pages/TeamLogin';
import HostDashboard from './pages/HostDashboard';
import PathManager from './pages/PathManager';
import TeamManager from './pages/TeamManager';
import QRPrintPage from './pages/QRPrintPage';
import TeamGame from './pages/TeamGame';

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex-center" style={{height:'100vh'}}><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/host-login" element={<HostLogin />} />
        <Route path="/team-login" element={<TeamLogin />} />
        
        {/* Host Routes */}
        <Route path="/host" element={
          <PrivateRoute role="host"><HostDashboard /></PrivateRoute>
        } />
        <Route path="/host/paths" element={
          <PrivateRoute role="host"><PathManager /></PrivateRoute>
        } />
        <Route path="/host/teams" element={
          <PrivateRoute role="host"><TeamManager /></PrivateRoute>
        } />
        <Route path="/host/qr/:pathId" element={
          <PrivateRoute role="host"><QRPrintPage /></PrivateRoute>
        } />
        
        {/* Team Route */}
        <Route path="/game" element={
          <PrivateRoute role="team"><TeamGame /></PrivateRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
