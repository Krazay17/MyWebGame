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

const players = {};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Add default player entry
  players[socket.id] = {
    x: 0,
    y: 0,
    data: {
      name: { text: 'Hunter', color: '#ffffff' },
      power: { source: 0, auraLevel: 1 }
    }
  };

  // Send list of already connected players to the new player
  socket.emit('existingPlayers',
    Object.entries(players)
      .filter(([id]) => id !== socket.id)
      .map(([id, player]) => ({ id, ...player }))
  );

  // Tell other players about this new one
  socket.broadcast.emit('playerJoined', {
    id: socket.id,
    ...players[socket.id]
  });

  // When the player disconnects
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    delete players[socket.id];

    socket.broadcast.emit('playerLeft', { id: socket.id });
  });

  // Handle full sync heartbeat from client
  socket.on('playerSyncRequest', ({ x, y, data }) => {
    if (players[socket.id]) {
      players[socket.id].x = x;
      players[socket.id].y = y;
      players[socket.id].data = data;

      socket.broadcast.emit('playerSyncUpdate', { id: socket.id, x, y, data });
    }
  });

  socket.on('pingCheck', () => {
  players[socket.id].lastPing = Date.now();
});

  // Optional partial updates (position only, etc.)
  socket.on('playerMove', ({ x, y }) => {
    if (players[socket.id]) {
      players[socket.id].x = x;
      players[socket.id].y = y;

      socket.broadcast.emit('playerMoved', { id: socket.id, x, y });
    }
  });

  socket.on('playerName', ({ text, color }) => {
    if (players[socket.id]) {
      // Store name only if needed later
      players[socket.id].data.name = { text, color };

      socket.broadcast.emit('playerNamed', { id: socket.id, text, color });
    }
  });

  socket.on('playerLevel', ({ source, auraLevel }) => {
    if (players[socket.id]) {
      players[socket.id].data.power = { source, auraLevel };

      socket.broadcast.emit('playerLeveled', { id: socket.id, source, auraLevel });
    }
  });

  socket.on('playerchatRequest', (message) => {
    if (players[socket.id]) {

      socket.broadcast.emit('playerchatUpdate', {id: socket.id, message: message});
    }
  })

  socket.on('shurikanthrow', ({ x, y, d }) => {
    if (players[socket.id]) {

      socket.broadcast.emit('shurikanthrown', { id: socket.id, x, y, d });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

setInterval(() => {
  const now = Date.now();
  for (const [id, player] of Object.entries(players)) {
    if (now - (player.lastPing || 0) > 10000) {
      // Remove player data
      delete players[id];

      // Get the actual socket and disconnect
      const targetSocket = io.sockets.sockets.get(id);
      if (targetSocket) {
        targetSocket.disconnect(true);
      }

      // Notify all clients
      io.emit('playerLeft', { id });
    }
  }
}, 5000);

