import io from 'https://cdn.socket.io/4.7.2/socket.io.esm.min.js';
import GhostPlayer from './GhostPlayer.js';

export default class NetworkManager {
  static instance;

  constructor(scene) {
    if (NetworkManager.instance){
      return NetworkManager.instance;
    }
    NetworkManager.instance = this;

    this.scene = scene;

    const serverURL = location.hostname === 'localhost'
    ? 'ws://localhost:3000'
    : 'wss://webconduit.onrender.com'
    this.socket = io(serverURL);

    this.otherPlayers = {};

    // Handle connection
    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket.id);
    });

    // Add existing players
    this.socket.on('existingPlayers', (players) => {
      players.forEach(player => {
        if (player.id !== this.socket.id) {
          this.addOtherPlayer(player.id, player.x, player.y);
        }
      });
    });

    // Handle new player
    this.socket.on('playerJoined', ({ id, x, y }) => {
      if (id !== this.socket.id) {
        this.addOtherPlayer(id, x, y);
      }
    });



    // Handle player leaving
    this.socket.on('playerLeft', ({ id }) => {
      if (this.otherPlayers[id]) {
        this.otherPlayers[id].destroy();
        delete this.otherPlayers[id];
      }
    });

    this.socket.on('playerMoved', ({ id, x, y}) => {
      const player = this.otherPlayers[id];
      if (player){
        player.setPosition(x, y);
      }
    });

  }

  addOtherPlayer(id, x = -1100, y= 400) {
    const ghostPlayer = new GhostPlayer(this.scene, id);
    this.otherPlayers[id] = ghostPlayer;
  }
}
