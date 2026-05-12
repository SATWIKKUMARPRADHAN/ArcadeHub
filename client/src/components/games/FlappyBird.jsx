import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameOverModal from './GameOverModal';

const GRAVITY = 0.5;
const JUMP = -8;
const PIPE_SPEED = 3;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 500;
const BIRD_SIZE = 20;

const FlappyBird = () => {
  const [birdPos, setBirdPos] = useState(CANVAS_HEIGHT / 2);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const canvasRef = useRef(null);
  const requestRef = useRef(null);

  const resetGame = () => {
    setBirdPos(CANVAS_HEIGHT / 2);
    setBirdVelocity(0);
    setPipes([]);
    setGameOver(false);
    setScore(0);
    setGameStarted(false);
  };

  const jump = useCallback(() => {
    if (gameOver) return;
    if (!gameStarted) setGameStarted(true);
    setBirdVelocity(JUMP);
  }, [gameOver, gameStarted]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault(); // Prevent scrolling
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  const updateGame = useCallback(() => {
    if (!gameStarted || gameOver) return;

    // Bird Physics
    setBirdPos(prev => {
      const newPos = prev + birdVelocity;
      if (newPos > CANVAS_HEIGHT - BIRD_SIZE || newPos < 0) {
        setGameOver(true);
      }
      return newPos;
    });
    setBirdVelocity(prev => prev + GRAVITY);

    // Pipes logic
    setPipes(prevPipes => {
      let newPipes = prevPipes.map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED }));

      // Add new pipe
      if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < CANVAS_WIDTH - 200) {
        const minHeight = 50;
        const maxHeight = CANVAS_HEIGHT - PIPE_GAP - minHeight;
        const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
        newPipes.push({
          x: CANVAS_WIDTH,
          topHeight: topHeight,
          passed: false
        });
      }

      // Remove off-screen pipes
      if (newPipes.length > 0 && newPipes[0].x < -PIPE_WIDTH) {
        newPipes.shift();
      }

      return newPipes;
    });

  }, [birdVelocity, gameStarted, gameOver]);

  // Collision and Score detection
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    pipes.forEach((pipe, index) => {
      // Collision
      const birdRect = { x: 50, y: birdPos, width: BIRD_SIZE, height: BIRD_SIZE };
      const topPipeRect = { x: pipe.x, y: 0, width: PIPE_WIDTH, height: pipe.topHeight };
      const bottomPipeRect = { x: pipe.x, y: pipe.topHeight + PIPE_GAP, width: PIPE_WIDTH, height: CANVAS_HEIGHT - (pipe.topHeight + PIPE_GAP) };

      if (
        (birdRect.x < topPipeRect.x + topPipeRect.width &&
         birdRect.x + birdRect.width > topPipeRect.x &&
         birdRect.y < topPipeRect.y + topPipeRect.height &&
         birdRect.height + birdRect.y > topPipeRect.y) ||
        (birdRect.x < bottomPipeRect.x + bottomPipeRect.width &&
         birdRect.x + birdRect.width > bottomPipeRect.x &&
         birdRect.y < bottomPipeRect.y + bottomPipeRect.height &&
         birdRect.height + birdRect.y > bottomPipeRect.y)
      ) {
        setGameOver(true);
      }

      // Scoring
      if (!pipe.passed && pipe.x + PIPE_WIDTH < 50) {
        setPipes(prev => {
          const updated = [...prev];
          if(updated[index]) updated[index].passed = true;
          return updated;
        });
        setScore(s => s + 1);
      }
    });

  }, [birdPos, pipes, gameStarted, gameOver]);

  // Game Loop
  useEffect(() => {
    const loop = () => {
      updateGame();
      requestRef.current = requestAnimationFrame(loop);
    };
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [updateGame]);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw bird
    ctx.fillStyle = '#fbff00';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#fbff00';
    ctx.fillRect(50, birdPos, BIRD_SIZE, BIRD_SIZE);
    
    // Draw pipes
    ctx.shadowBlur = 5;
    ctx.shadowColor = '#ff2a85';
    ctx.fillStyle = '#ff2a85'; // Arcade Pink
    pipes.forEach(pipe => {
      // Top pipe
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
      // Bottom pipe
      ctx.fillRect(pipe.x, pipe.topHeight + PIPE_GAP, PIPE_WIDTH, CANVAS_HEIGHT - (pipe.topHeight + PIPE_GAP));
    });
    ctx.shadowBlur = 0;

  }, [birdPos, pipes]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="mb-8 flex justify-between w-[400px] items-end">
        <h1 className="text-4xl font-retro text-arcade-yellow text-shadow-neon">Flappy Clone</h1>
        <div className="font-retro text-2xl text-white">Score: {score}</div>
      </div>
      
      <div 
        className="glassmorphism p-4 relative cursor-pointer"
        onClick={jump}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border border-white/20 rounded shadow-[0_0_20px_rgba(251,255,0,0.2)] bg-black"
        />
        
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
             <div className="font-retro text-white text-xl animate-pulse">CLICK OR SPACE TO START</div>
          </div>
        )}

        <GameOverModal 
          isOpen={gameOver} 
          score={score} 
          gameId="flappybird" 
          onRestart={resetGame} 
        />
      </div>
      
      <p className="mt-6 text-white/50 text-sm">Click the game area or press Space to fly.</p>
    </div>
  );
};

export default FlappyBird;
