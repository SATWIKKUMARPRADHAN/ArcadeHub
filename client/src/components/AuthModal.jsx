import React, { useState } from 'react';
import useStore from '../store';

const AuthModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { login } = useStore();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');

    try {
      // Create or login user in backend
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name.trim() })
      });
      
      if (res.ok) {
        login(name.trim());
        onClose();
      } else {
        setError('Failed to connect to server. Ensure backend is running.');
      }
    } catch (err) {
      console.error("Failed to login", err);
      setError('Connection refused. Is the server running on port 5000?');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glassmorphism w-full max-w-md p-8 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-arcade-pink rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        
        <h2 className="font-retro text-2xl text-center mb-8 text-shadow-neon text-white">Enter Arcade</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-semibold mb-2 text-arcade-cyan">PLAYER NAME</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-arcade-purple focus:ring-1 focus:ring-arcade-purple transition-all"
              placeholder="e.g. Neo..."
              maxLength={15}
              autoFocus
            />
            {error && <p className="text-arcade-pink text-xs mt-2 font-bold">{error}</p>}
          </div>
          
          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-arcade-purple to-arcade-pink hover:from-arcade-pink hover:to-arcade-purple text-white font-bold py-3 rounded-lg shadow-[0_0_15px_rgba(176,38,255,0.5)] hover:shadow-[0_0_25px_rgba(255,42,133,0.7)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            INSERT COIN (START)
          </button>
        </form>
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default AuthModal;
