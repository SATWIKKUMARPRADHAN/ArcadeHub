import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store';

const GameOverModal = ({ isOpen, score, gameId, onRestart }) => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { username } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmitScore = async () => {
    if (!username) return;
    setSubmitting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await fetch(`${apiUrl}/api/scores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, game: gameId, score })
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Failed to submit score", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-40">
      <div className="glassmorphism p-8 max-w-sm w-full text-center relative overflow-hidden">
        <h2 className="text-4xl font-retro text-arcade-pink text-shadow-neon mb-2">GAME OVER</h2>
        <div className="text-6xl font-bold text-white mb-8 text-shadow-neon">{score}</div>

        {!submitted ? (
          <div className="space-y-4">
            <button 
              onClick={handleSubmitScore}
              disabled={submitting || !username}
              className="w-full bg-arcade-cyan hover:bg-cyan-400 text-black font-bold py-3 rounded border border-cyan-300 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(0,240,255,0.5)]"
            >
              {submitting ? 'SUBMITTING...' : 'SUBMIT SCORE'}
            </button>
            <button 
              onClick={onRestart}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded border border-white/20 transition-all"
            >
              PLAY AGAIN
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-arcade-green font-bold mb-4">SCORE SAVED!</div>
            <button 
              onClick={onRestart}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded border border-white/20 transition-all"
            >
              PLAY AGAIN
            </button>
            <button 
              onClick={() => navigate('/leaderboard')}
              className="w-full bg-arcade-purple hover:bg-purple-500 text-white font-bold py-3 rounded border border-purple-400 transition-all shadow-[0_0_15px_rgba(176,38,255,0.5)]"
            >
              VIEW LEADERBOARD
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameOverModal;
