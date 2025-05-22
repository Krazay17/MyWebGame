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
      "http://127.0.0.1:5500",
    ],
    methods: ["GET", "POST"]
  }
});

const players = {};

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    delete players[socket.id];
    socket.broadcast.emit('playerLeft', { id: socket.id});
  });

  players[socket.id] = {x: -1100, y: 200, source: 0};

  socket.emit('existingPlayers',
     Object.entries(players).map(([id, player]) => ({id, ...player}))
    );

  socket.broadcast.emit('playerJoined', {id: socket.id, ...players[socket.id]});

  socket.on('playerMove', ({x, y}) => {
    if (players[socket.id]){
      players[socket.id].x = x;
      players[socket.id].y = y;

      socket.broadcast.emit('playerMoved', { id: socket.id, x, y });
    }
  });

  socket.on('playerLevel', (source) => {
    if (players[socket.id]){
    players[socket.id].source = source;

    socket.broadcast.emit('playerLeveled', { id: socket.id, source });
    }
  });


});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
