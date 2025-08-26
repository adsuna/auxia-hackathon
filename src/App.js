import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BrowseTutors from './pages/BrowseTutors';
import TutorProfile from './pages/TutorProfile';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import { useAuth } from './contexts/AuthContext';
import Register from './pages/Register';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<BrowseTutors />} />
              <Route path="/tutor/:id" element={<TutorProfile />} />
              <Route path="/booking/:tutorId" element={<Booking />} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
