const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "https://krazay17.github.io",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5500",
      "http://localhost:5173",
      "http://127.0.0.1:5500",
    ],
    methods: ["GET", "POST"]
  }
});

const players = {};       // Store player states
const hasSynced = {};     // Track who sent playerSyncRequest

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Initialize with default placeholder
  players[socket.id] = {
    x: 0,
    y: 0,
    data: {
      name: { text: 'Hunter', color: '#ffffff' },
      power: { source: 0, auraLevel: 1 }
    }
  };

  // Wait for playerSyncRequest before revealing to others
  socket.on('playerSyncRequest', ({ x, y, data }) => {
    if (!players[socket.id]) return;

    players[socket.id] = { x, y, data };
    hasSynced[socket.id] = true;

    // Send this player all existing synced players
    const syncedPlayers = Object.entries(players)
      .filter(([id]) => id !== socket.id && hasSynced[id])
      .map(([id, player]) => ({ id, ...player }));

    socket.emit('existingPlayers', syncedPlayers);

    // Now tell others this player joined
    socket.broadcast.emit('playerJoined', { id: socket.id, x, y, data });
  });

  socket.on('playerMove', ({ x, y }) => {
    if (!players[socket.id]) return;

    players[socket.id].x = x;
    players[socket.id].y = y;

    socket.broadcast.emit('playerMoved', { id: socket.id, x, y });
  });

  socket.on('playerName', ({ text, color }) => {
    if (!players[socket.id]) return;

    players[socket.id].data.name = { text, color };
    socket.broadcast.emit('playerNamed', { id: socket.id, text, color });
  });

  socket.on('playerLevel', ({ source, auraLevel }) => {
    if (!players[socket.id]) return;

    players[socket.id].data.power = { source, auraLevel };
    socket.broadcast.emit('playerLeveled', { id: socket.id, source, auraLevel });
  });

  socket.on('shurikanthrow', ({ x, y, d }) => {
    if (!players[socket.id]) return;

    socket.broadcast.emit('shurikanthrown', { id: socket.id, x, y, d });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    delete players[socket.id];
    delete hasSynced[socket.id];
    socket.broadcast.emit('playerLeft', { id: socket.id });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
