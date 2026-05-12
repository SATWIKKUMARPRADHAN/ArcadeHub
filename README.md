# ArcadeHub

ArcadeHub is a modern, sleek, browser-based gaming platform built with React, Node.js, and MongoDB. It features a Gen-Z retro-neon aesthetic.

## Features
- **3 Playable Games**: Tic Tac Toe X, Neon Snake, and Flappy Clone.
- **Global Leaderboards**: Compete for the highest score.
- **Sleek UI**: Built with Tailwind CSS, featuring glassmorphism and neon glows.
- **Instant Play**: Enter a username and play instantly.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Zustand, React Router
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB

## How to Run Locally

### Prerequisites
- Node.js (v18+)
- A MongoDB cluster (e.g. MongoDB Atlas) or a local MongoDB instance.

### Setup Environment
In the `server` directory, create a `.env` file based on the provided example:
```bash
cp server/.env.example server/.env
```
Update the `MONGO_URI` in `server/.env` with your actual MongoDB connection string.

### 1. Start the Backend
Open a terminal and navigate to the `server` directory:
```bash
cd server
npm install
node server.js
```
The server will run on `http://localhost:5000`.

### 2. Start the Frontend
Open a new terminal and navigate to the `client` directory:
```bash
cd client
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`.

## Architecture
- `/client` - Contains all the React frontend code.
- `/server` - Contains the Express backend and Mongoose models.
