const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Score = require('../models/Score');

// Create or login user
router.post('/users', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username is required' });

    let user = await User.findOne({ username });
    if (!user) {
      user = new User({ username });
      await user.save();
    }
    res.json(user);
  } catch (error) {
    console.error('Error in /users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit a score
router.post('/scores', async (req, res) => {
  try {
    const { username, game, score } = req.body;
    if (!username || !game || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newScore = new Score({
      username,
      game,
      score: Number(score)
    });
    
    await newScore.save();
    res.json(newScore);
  } catch (error) {
    console.error('Error in /scores:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get leaderboard for a game
router.get('/leaderboard/:game', async (req, res) => {
  try {
    const { game } = req.params;
    
    // Use MongoDB aggregation to get the top 10 unique users by max score
    const topScores = await Score.aggregate([
      { $match: { game: game } },
      { $group: { _id: "$username", score: { $max: "$score" } } },
      { $project: { _id: 0, username: "$_id", score: 1 } },
      { $sort: { score: -1 } },
      { $limit: 10 }
    ]);
    
    res.json(topScores);
  } catch (error) {
    console.error('Error in /leaderboard:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
