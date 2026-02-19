import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserHome from './UserHome';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Normal User Home Page */}
        <Route path="/" element={<UserHome />} />

        {/* Secret Admin Login Page - */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Admin Dashboard Page */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
