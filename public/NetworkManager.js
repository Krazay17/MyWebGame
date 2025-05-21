import io from 'https://cdn.socket.io/4.7.2/socket.io.esm.min.js';

export default class NetworkManager {
  constructor(scene) {
    this.scene = scene;
    this.socket = io();

    this.otherPlayers = {};

    // Handle connection
    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket.id);
    });

    // Add existing players
    this.socket.on('existingPlayers', (players) => {
      players.forEach(player => {
        if (player.id !== this.socket.id) {
          this.addOtherPlayer(player.id);
        }
      });
    });

    // Handle new player
    this.socket.on('playerJoined', ({ id }) => {
      if (id !== this.socket.id) {
        this.addOtherPlayer(id);
      }
    });

    // Handle player leaving
    this.socket.on('playerLeft', ({ id }) => {
      if (this.otherPlayers[id]) {
        this.otherPlayers[id].destroy();
        delete this.otherPlayers[id];
      }
    });
  }

  addOtherPlayer(id) {
    const placeholder = this.scene.add.circle(400, 300, 20, 0xff0000); // temp red circle
    this.otherPlayers[id] = placeholder;
    console.log(`Player ${id} added`);
  }
}
