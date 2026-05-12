import React, { useState, useEffect } from 'react';
import GameOverModal from './GameOverModal';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  useEffect(() => {
    let interval;
    if (!gameOver && !winner) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameOver, winner]);

  useEffect(() => {
    if (gameOver) return;

    const win = calculateWinner(board);
    if (win) {
      setWinner(win);
      setGameOver(true);
      if (win === 'X') {
        setScore(Math.max(100, 1000 - timeElapsed * 20));
      } else {
        setScore(0);
      }
    } else if (!board.includes(null)) {
      setGameOver(true); // Draw
      setScore(Math.max(50, 500 - timeElapsed * 10));
    }
  }, [board]);

  const handleClick = (index) => {
    if (board[index] || winner || gameOver || !isXNext) return;
    
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsXNext(false);
  };

  useEffect(() => {
    if (!isXNext && board.includes(null)) {
      if (calculateWinner(board)) return;

      const timer = setTimeout(() => {
        const emptyIndices = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
        if (emptyIndices.length > 0) {
          const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
          const newBoard = [...board];
          newBoard[randomIndex] = 'O';
          setBoard(newBoard);
          setIsXNext(true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isXNext, board]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setGameOver(false);
    setScore(0);
    setTimeElapsed(0);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md flex justify-between items-end mb-8 px-4">
        <h1 className="text-4xl font-retro text-arcade-cyan text-shadow-neon">Tic Tac Toe</h1>
        <div className="font-retro text-xl text-white">Time: {timeElapsed}s</div>
      </div>
      
      <div className="glassmorphism p-8 relative">
        <div className="mb-6 text-center text-xl font-bold">
          {winner ? (
            <span className={winner === 'X' ? 'text-arcade-cyan' : 'text-arcade-pink'}>
              Winner: {winner}
            </span>
          ) : !board.includes(null) ? (
            <span className="text-arcade-yellow">Draw!</span>
          ) : (
            <span className="text-white/70">
              Next Player: <span className={isXNext ? 'text-arcade-cyan' : 'text-arcade-pink'}>{isXNext ? 'X' : 'O'}</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 w-72 h-72">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleClick(index)}
              className="bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-5xl font-retro flex items-center justify-center transition-all focus:outline-none"
            >
              <span className={cell === 'X' ? 'text-arcade-cyan text-shadow-neon' : 'text-arcade-pink drop-shadow-[0_0_10px_rgba(255,42,133,0.8)]'}>
                {cell}
              </span>
            </button>
          ))}
        </div>

        <button 
          onClick={resetGame}
          className="mt-8 w-full py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-bold transition-all border border-white/20"
        >
          RESET BOARD
        </button>

        <GameOverModal 
          isOpen={gameOver} 
          score={score} 
          gameId="tictactoe" 
          onRestart={resetGame} 
        />
      </div>
    </div>
  );
};

export default TicTacToe;
