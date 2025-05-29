import io from 'https://cdn.socket.io/4.7.2/socket.io.esm.min.js';
import GhostPlayer from './GhostPlayer.js';

export default class NetworkManager {
  static instance;

  constructor(scene) {
    this.scene = scene;
    
    if (NetworkManager.instance){
      return NetworkManager.instance;
    }
    NetworkManager.instance = this;

    const serverURL = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'wss://webconduit.onrender.com'
    this.socket = io(serverURL);

    this.otherPlayers = {};

    // Handle connection
    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket.id);
    });

    // Add existing players
    this.socket.on('existingPlayers', (players) => {
      console.log('existing players recieved', players);
      players.forEach(player => {
        if (player.id !== this.socket.id) {
          this.addOtherPlayer(player.id, player.x, player.y, player.source);
        }
      });
    });

    // Handle new player
    this.socket.on('playerJoined', ({ id, x, y, source }) => {
      if (id !== this.socket.id) {
        this.addOtherPlayer(id, x, y, source);
      }
    });

    // Handle player leaving
    this.socket.on('playerLeft', ({ id }) => {
      if (this.otherPlayers[id]) {
        this.otherPlayers[id].destroy();
        delete this.otherPlayers[id];
      }
    });

    this.socket.on('playerSynced', ({id, x, y, source, auraLevel}) => {
      const player = this.otherPlayers[id];
      if (player) {
        player.syncAll({x, y, source, auraLevel});
      }
    })

    this.socket.on('playerMoved', ({ id, x, y }) => {
      const player = this.otherPlayers[id];
      if (player){
        player.updatePosition(x, y);
      }
    });

    this.socket.on('playerLeveled', ({id, source}) => {
      const player = this.otherPlayers[id];
      if (player) {
        player.updateName(source);
      }
    });

    this.socket.on('shurikanthrown', ({id, x, y, d}) => {
      const player = this.otherPlayers[id];
      if (player) {
        player.ghostShurikan(x, y, d);
      }
    })

  }

  addOtherPlayer(id, x = -1100, y= 400, source) {
    if (this.otherPlayers[id]) {
      this.otherPlayers[id].destroy()
    }
    const ghostPlayer = new GhostPlayer(this.scene, id, x, y, source);
    this.otherPlayers[id] = ghostPlayer;
  }
}
