import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import useStore from '../store';
import AuthModal from '../components/AuthModal';

const games = [
  {
    id: 'snake',
    name: 'Neon Snake',
    description: 'Classic snake game with a cyber twist. Eat food, grow longer, avoid walls.',
    color: 'from-arcade-green to-emerald-700',
    shadow: 'hover:shadow-[0_0_30px_rgba(57,255,20,0.4)]'
  },
  {
    id: 'tictactoe',
    name: 'Tic Tac Toe X',
    description: 'The ultimate showdown. Get 3 in a row to win.',
    color: 'from-arcade-cyan to-blue-700',
    shadow: 'hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]'
  },
  {
    id: 'flappybird',
    name: 'Flappy Clone',
    description: 'Tap to fly. Avoid the pipes. It is harder than it looks.',
    color: 'from-arcade-yellow to-orange-600',
    shadow: 'hover:shadow-[0_0_30px_rgba(251,255,0,0.4)]'
  }
];

const Home = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [pendingGame, setPendingGame] = useState(null);
  const { username } = useStore();
  const navigate = useNavigate();

  const handlePlayClick = (gameId) => {
    if (!username) {
      setPendingGame(gameId);
      setIsAuthOpen(true);
    } else {
      navigate(`/game/${gameId}`);
    }
  };

  const handleAuthClose = () => {
    setIsAuthOpen(false);
    if (useStore.getState().username && pendingGame) {
      navigate(`/game/${pendingGame}`);
    }
    setPendingGame(null);
  };

  return (
    <div className="py-12">
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-retro mb-4 text-shadow-neon text-white">Arcade<span className="text-arcade-pink">Hub</span></h1>
        <p className="text-xl text-white/70 max-w-2xl mx-auto">Welcome to the neon dimension. Pick a game, set a high score, and become a legend.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto relative z-10">
        {games.map((game) => (
          <div 
            key={game.id}
            className={`glassmorphism overflow-hidden group transition-all duration-300 transform hover:-translate-y-2 ${game.shadow}`}
          >
            <div className={`h-32 bg-gradient-to-br ${game.color} opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center relative overflow-hidden`}>
              {/* Abstract pattern placeholder */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay"></div>
              <Play className="w-16 h-16 text-white/50 group-hover:text-white transition-colors group-hover:scale-110 duration-300" />
            </div>
            
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2 font-retro text-white tracking-wide">{game.name}</h3>
              <p className="text-white/60 mb-6 min-h-[60px]">{game.description}</p>
              
              <button 
                onClick={() => handlePlayClick(game.id)}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-lg border border-white/20 transition-all flex items-center justify-center gap-2 group-hover:border-white/50"
              >
                <Play className="w-4 h-4 fill-current" /> PLAY NOW
              </button>
            </div>
          </div>
        ))}
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={handleAuthClose} />
    </div>
  );
};

export default Home;
