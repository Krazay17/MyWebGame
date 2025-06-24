const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "https://krazay17.github.io",
      "http://localhost:5173",
      "http://10.0.0.194:5173",
    ],
    methods: ["GET", "POST"]
  }
});

const players = {};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Add default player entry
  // players[socket.id] = {
  //   x: 0,
  //   y: 0,
  //   data: {
  //     name: { text: 'Hunter', color: '#ffffff' },
  //     power: { source: 0, auraLevel: 1 }
  //   },
  //   lastPing: Date.now()
  // };

  // if (players[socket.id]) {
  //   console.log(`Stale player data found for ${socket.id}, deleting`);
  //   delete players[socket.id];
  // }

  // socket.emit('existingPlayers',
  //   Object.entries(players)
  //     .filter(([id]) => id !== socket.id)
  //     .map(([id, player]) => ({ id, ...player }))
  // );

  // // Tell other players about this new one
  // socket.broadcast.emit('playerJoined', {
  //   id: socket.id,
  //   ...players[socket.id]
  // });

  // When the player disconnects
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    delete players[socket.id];

    socket.broadcast.emit('playerLeft', { id: socket.id });
  });

  // socket.on('reconnect', () => {
  //   socket.emit('existingPlayers',
  //     Object.entries(players)
  //       .filter(([id]) => id !== socket.id)
  //       .map(([id, player]) => ({ id, ...player }))
  //   );
  // })

  socket.on('playerSyncRequest', ({ data }) => {
    const isNew = !players[socket.id];

    players[socket.id] = { data, lastPing: Date.now() };

    if (isNew) {
      socket.broadcast.emit('playerJoined', {
        id: socket.id,
        data
      });

      const existing = Object.entries(players).map(([id, data]) => ({ id, ...data }));

      socket.emit('existingPlayers', existing);
      console.log('existing players: ', existing);
    } else {
      socket.broadcast.emit('playerSyncUpdate', {
        id: socket.id,
        data
      });
    }
  });

  socket.on('pingCheck', () => {
    if (players[socket.id]) {
      players[socket.id].lastPing = Date.now();
    }
  });

  socket.on('playerStateRequest', (state) => {
    if (players[socket.id]) {
      players[socket.id].data.location.x = state.x;
      players[socket.id].data.location.y = state.y;

      socket.broadcast.emit('playerStateUpdate', { id: socket.id, state });
    }
  })

  // Optional partial updates (position only, etc.)
  // socket.on('playerMove', ({ x, y }) => {
  //   if (players[socket.id]) {
  //     if (players[socket.id].x != x || players[socket.id].y != y) {
  //       players[socket.id].x = x;
  //       players[socket.id].y = y;

  //       socket.broadcast.emit('playerMoved', { id: socket.id, x, y });
  //     }

  //   }
  // });

  socket.on('playerName', ({ text, color }) => {
    if (players[socket.id]) {
      // Store name only if needed later
      players[socket.id].data.name = { text, color };

      socket.broadcast.emit('playerNamed', { id: socket.id, text, color });
    }
  });

  socket.on('playerLevel', ({ money, auraLevel }) => {
    if (players[socket.id]) {
      players[socket.id].data.power = { money, auraLevel };

      socket.broadcast.emit('playerLeveled', { id: socket.id, money, auraLevel });
    }
  });

  socket.on('updateHealth', (health, max) => {
    if (players[socket.id]) {
      players[socket.id].health = health;

      socket.broadcast.emit('updateHealthUpdate', { id: socket.id, health, max });
    }
  })

  socket.on('playerchatRequest', (message) => {
    if (players[socket.id]) {

      socket.broadcast.emit('playerchatUpdate', { id: socket.id, message });
    }
  })

  socket.on('shurikanthrow', (shotInfo) => {
    if (players[socket.id]) {

      socket.broadcast.emit('shurikanthrown', { id: socket.id, shotInfo });
    }
  });

  // socket.on('enemyStateRequest', (info) => {
  //   socket.broadcast.emit('enemyStateUpdate', info);
  // });

  // socket.on('enemyDamageRequest', (info) => {
  //   socket.broadcast.emit('enemyDamageUpdate', info);
  // });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

setInterval(() => {
  const now = Date.now();
  for (const [id, player] of Object.entries(players)) {
    if (now - (player.lastPing || 0) > 10000) {

      // Get the actual socket and disconnect
      const targetSocket = io.sockets.sockets.get(id);
      if (targetSocket) {
        targetSocket.emit('droppedDueToInactivity');
        console.log('timeout: ', player);
        targetSocket.disconnect(true);
      }

      // Remove player data
      delete players[id];


      io.emit('playerLeft', { id });

    }
  }
}, 5000);

const repl = require('repl');

// Start a REPL session after server has started
const r = repl.start('> ');

r.context.io = io; // now you can type io.emit(...) etc
r.context.forceDrop = (id) => {
  const sock = io.sockets.sockets.get(id);
  if (sock) {
    sock.emit('droppedDueToInactivity');
    sock.disconnect(true);
  }
};


// Make things accessible from the REPL
r.context.connectedSockets = players;
r.context.disconnectSocket = (id) => {
  const socket = io.sockets.sockets.get(id);
  if (socket) {
    console.log(`Force disconnecting ${id}`);
    socket.disconnect(true);
  } else {
    console.log(`Socket ${id} not found`);
  }
};


