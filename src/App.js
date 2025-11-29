import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Auth from './pages/Auth';
import Home from './pages/Home';
import Translate from './pages/Translate';
import Guide from './pages/Guide';
import History from './pages/History';
import Navbar from './components/Navbar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Route publique - Authentification */}
          <Route path="/auth" element={<Auth />} />
          
          {/* Routes protégées */}
          <Route path="/" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Home />
              </>
            </ProtectedRoute>
          } />
          
          <Route path="/translate" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Translate />
              </>
            </ProtectedRoute>
          } />
          
          <Route path="/guide" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <Guide />
              </>
            </ProtectedRoute>
          } />
          
          <Route path="/history" element={
            <ProtectedRoute>
              <>
                <Navbar />
                <History />
              </>
            </ProtectedRoute>
          } />

          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;