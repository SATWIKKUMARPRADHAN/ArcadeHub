import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Loader2 } from 'lucide-react';

const games = [
  { id: 'snake', name: 'Neon Snake', color: 'text-arcade-green' },
  { id: 'tictactoe', name: 'Tic Tac Toe X', color: 'text-arcade-cyan' },
  { id: 'flappybird', name: 'Flappy Clone', color: 'text-arcade-yellow' }
];

const Leaderboard = () => {
  const [activeGame, setActiveGame] = useState('snake');
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/leaderboard/${activeGame}`);
        if (res.ok) {
          const data = await res.json();
          setScores(data);
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [activeGame]);

  const getRankIcon = (index) => {
    switch(index) {
      case 0: return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 1: return <Medal className="w-6 h-6 text-gray-300" />;
      case 2: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 text-center font-bold text-white/50">#{index + 1}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-retro mb-4 text-shadow-neon">Hall of <span className="text-arcade-yellow">Fame</span></h1>
        <p className="text-white/60">The greatest players in the neon dimension.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {games.map(game => (
          <button
            key={game.id}
            onClick={() => setActiveGame(game.id)}
            className={`px-6 py-3 rounded-full font-bold transition-all ${
              activeGame === game.id 
                ? 'bg-white/20 border-white/50 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
            } border`}
          >
            {game.name}
          </button>
        ))}
      </div>

      <div className="glassmorphism rounded-2xl overflow-hidden relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
             <Loader2 className="w-12 h-12 text-arcade-cyan animate-spin" />
          </div>
        ) : (
          <div className="p-2 sm:p-6">
            <div className="grid grid-cols-3 gap-4 mb-4 px-6 py-3 border-b border-white/10 text-sm font-bold text-white/50 uppercase tracking-wider">
              <div>Rank</div>
              <div>Player</div>
              <div className="text-right">Score</div>
            </div>
            
            {scores.length === 0 ? (
              <div className="text-center py-20 text-white/40 font-retro text-sm">
                NO SCORES RECORDED YET.<br/><br/>BE THE FIRST.
              </div>
            ) : (
              <div className="space-y-2">
                {scores.map((score, index) => (
                  <div 
                    key={score._id || index} 
                    className={`grid grid-cols-3 gap-4 px-6 py-4 rounded-xl items-center transition-all hover:bg-white/5 ${
                      index === 0 ? 'bg-white/10 border border-yellow-400/30 shadow-[0_0_20px_rgba(250,204,21,0.1)]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getRankIcon(index)}
                    </div>
                    <div className={`font-bold ${index === 0 ? 'text-yellow-400 text-lg' : 'text-white'}`}>
                      {score.username}
                    </div>
                    <div className={`text-right font-retro ${index === 0 ? 'text-arcade-yellow text-shadow-neon' : 'text-arcade-cyan'}`}>
                      {score.score}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
