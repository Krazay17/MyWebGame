const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin:
      ["https://krazay17.github.io",
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
  console.log('New client connected:', socket.id);
  players[socket.id] = {
    x: 0,
    y: 0,
    data: {
      name: { text: 'Hunter', color: '#ffffff' },
      power: { source: 0, auraLevel: 1 }
    }
  };
  socket.emit('existingPlayers',
    Object.entries(players).map(([id, player]) => ({ id, ...player }))
  );
  

  socket.on('playerSyncRequest', ({ x, y, data }) => {
    if (players[socket.id]) {
      players[socket.id].x = x;
      players[socket.id].y = y;
      players[socket.id].data = data;

      socket.broadcast.emit('playerJoined', { id: socket.id, x, y, data });

      socket.broadcast.emit('playerSynceUpdate', { id: socket.id, x, y, data });
    }
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    delete players[socket.id];
    socket.broadcast.emit('playerLeft', { id: socket.id });
  });

  socket.on('playerMove', ({ x, y }) => {
    if (players[socket.id]) {
      players[socket.id].x = x;
      players[socket.id].y = y;

      socket.broadcast.emit('playerMoved', { id: socket.id, x, y });
    }
  });

  socket.on('playerName', ({ text, color }) => {
    if (players[socket.id]) {

      socket.broadcast.emit('playerNamed', { id: socket.id, text, color });
    }
  });

  socket.on('playerLevel', ({ source, auraLevel }) => {
    if (players[socket.id]) {
      players[socket.id].data.power.source = source;
      players[socket.id].data.power.auraLevel = auraLevel;

      socket.broadcast.emit('playerLeveled', { id: socket.id, source, auraLevel });
    }
  });

  socket.on('shurikanthrow', ({ x, y, d }) => {
    if (players[socket.id]) {

      socket.broadcast.emit('shurikanthrown', { id: socket.id, x, y, d });
    }
  });


});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
