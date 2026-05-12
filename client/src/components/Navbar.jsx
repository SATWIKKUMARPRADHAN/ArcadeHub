import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Trophy, User } from 'lucide-react';
import useStore from '../store';

const Navbar = () => {
  const { username, logout } = useStore();

  return (
    <nav className="glassmorphism m-4 p-4 sticky top-4 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <Gamepad2 className="text-arcade-cyan group-hover:text-arcade-pink transition-colors duration-300 w-8 h-8" />
          <span className="font-retro text-xl tracking-wider text-shadow-neon text-white">Arcade<span className="text-arcade-pink">Hub</span></span>
        </Link>
        
        <div className="flex items-center gap-6">
          <Link to="/leaderboard" className="flex items-center gap-2 hover:text-arcade-cyan transition-colors font-semibold">
            <Trophy className="w-5 h-5 text-arcade-yellow" />
            Leaderboard
          </Link>
          
          <div className="flex items-center gap-2 pl-4 border-l border-white/20">
            {username ? (
              <div className="flex items-center gap-4">
                <span className="text-arcade-cyan font-bold flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {username}
                </span>
                <button 
                  onClick={logout}
                  className="text-xs text-white/50 hover:text-arcade-pink transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <span className="text-white/50 text-sm">Not Logged In</span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
