import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Leaderboard from './pages/Leaderboard';
import SnakeGame from './components/games/SnakeGame';
import TicTacToe from './components/games/TicTacToe';
import FlappyBird from './components/games/FlappyBird';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 relative">
        {/* Background glow effects */}
        <div className="fixed top-20 left-10 w-64 h-64 bg-arcade-purple rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>
        <div className="fixed bottom-20 right-10 w-80 h-80 bg-arcade-cyan rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/game/snake" element={<SnakeGame />} />
          <Route path="/game/tictactoe" element={<TicTacToe />} />
          <Route path="/game/flappybird" element={<FlappyBird />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
