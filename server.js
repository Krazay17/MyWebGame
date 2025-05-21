const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Tell others a new player joined
  socket.broadcast.emit('playerJoined', { id: socket.id });

  // Send the new player all existing players
  socket.emit('existingPlayers', Array.from(io.sockets.sockets).map(([id]) => ({ id })));

  // Remove player when disconnected
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    socket.broadcast.emit('playerLeft', { id: socket.id });
  });
});

server.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
