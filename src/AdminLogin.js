import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simple Admin check
    if (email === 'admin@gmail.com' && password === 'admin123') {
    localStorage.setItem('isAdminAuthenticated', 'true');
    navigate('/admin');
} else {
      alert("Invalid Admin Credentials!");
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f5f5f5' }}>
      <form onSubmit={handleLogin} style={{ background: '#fff', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '350px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Admin Portal</h2>
        <input 
          type="email" 
          placeholder="Admin Email" 
          style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ddd' }}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" 
          placeholder="Password" 
          style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ddd' }}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" style={{ width: '100%', padding: '12px', background: '#C5A059', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          LOGIN AS ADMIN
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;