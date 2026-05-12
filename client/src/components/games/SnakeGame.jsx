import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameOverModal from './GameOverModal';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [[10, 10]];
const INITIAL_FOOD = [5, 5];
const INITIAL_DIRECTION = [0, -1]; // UP
const SPEED = 120;

const SnakeGame = () => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(INITIAL_FOOD);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const canvasRef = useRef(null);

  const generateFood = useCallback((currentSnake) => {
    let newFood;
    while (true) {
      newFood = [
        Math.floor(Math.random() * GRID_SIZE),
        Math.floor(Math.random() * GRID_SIZE)
      ];
      // eslint-disable-next-line no-loop-func
      const isOnSnake = currentSnake.some(segment => segment[0] === newFood[0] && segment[1] === newFood[1]);
      if (!isOnSnake) break;
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood(INITIAL_SNAKE));
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
  };

  const handleKeyDown = useCallback((e) => {
    if (gameOver) return;
    
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
        if (direction[1] !== 1) setDirection([0, -1]);
        break;
      case 'ArrowDown':
      case 's':
        if (direction[1] !== -1) setDirection([0, 1]);
        break;
      case 'ArrowLeft':
      case 'a':
        if (direction[0] !== 1) setDirection([-1, 0]);
        break;
      case 'ArrowRight':
      case 'd':
        if (direction[0] !== -1) setDirection([1, 0]);
        break;
      case ' ':
        setIsPaused(prev => !prev);
        break;
      default:
        break;
    }
  }, [direction, gameOver]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (gameOver || isPaused) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const newSnake = [...prevSnake];
        const head = [newSnake[0][0] + direction[0], newSnake[0][1] + direction[1]];

        // Wall collision
        if (head[0] < 0 || head[0] >= GRID_SIZE || head[1] < 0 || head[1] >= GRID_SIZE) {
          setGameOver(true);
          return prevSnake;
        }

        // Self collision
        if (newSnake.some(segment => segment[0] === head[0] && segment[1] === head[1])) {
          setGameOver(true);
          return prevSnake;
        }

        newSnake.unshift(head);

        // Food collision
        if (head[0] === food[0] && head[1] === food[1]) {
          setScore(s => s + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, SPEED);
    return () => clearInterval(interval);
  }, [direction, food, gameOver, isPaused, generateFood]);

  // Draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Clear board
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);

    // Grid lines (optional, for retro feel)
    ctx.strokeStyle = '#ffffff10';
    for(let i=0; i<=GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i*CELL_SIZE, 0);
        ctx.lineTo(i*CELL_SIZE, GRID_SIZE*CELL_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i*CELL_SIZE);
        ctx.lineTo(GRID_SIZE*CELL_SIZE, i*CELL_SIZE);
        ctx.stroke();
    }

    // Draw Food
    ctx.fillStyle = '#39ff14';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#39ff14';
    ctx.fillRect(food[0] * CELL_SIZE + 2, food[1] * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);

    // Draw Snake
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00f0ff';
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#ffffff' : '#00f0ff'; // White head, cyan body
      ctx.fillRect(segment[0] * CELL_SIZE + 1, segment[1] * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    });
    ctx.shadowBlur = 0; // reset
  }, [snake, food]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="mb-8 flex justify-between w-[400px] items-end">
        <h1 className="text-4xl font-retro text-arcade-green text-shadow-neon">Neon Snake</h1>
        <div className="font-retro text-2xl text-white">Score: {score}</div>
      </div>
      
      <div className="glassmorphism p-4 relative">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="border border-white/20 rounded shadow-[0_0_20px_rgba(0,240,255,0.2)] bg-black"
        />
        
        {isPaused && !gameOver && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center font-retro text-2xl text-white">
            PAUSED
          </div>
        )}

        <GameOverModal 
          isOpen={gameOver} 
          score={score} 
          gameId="snake" 
          onRestart={resetGame} 
        />
      </div>
      
      <p className="mt-6 text-white/50 text-sm">Use WASD or Arrow Keys to move. Space to pause.</p>
    </div>
  );
};

export default SnakeGame;
