import io from 'https://cdn.socket.io/4.7.2/socket.io.esm.min.js';
import GhostPlayer from './GhostPlayer.js';
import GameManager from './GameManager.js';

export default class NetworkManager {
  static instance;

  constructor(scene) {
    if (NetworkManager.instance) return NetworkManager.instance;
    NetworkManager.instance = this;

    this.scene = scene;
    this.otherPlayers = {};

    const serverURL =
      location.hostname === 'localhost' || location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'
        : 'wss://webconduit.onrender.com';

    this.socket = io(serverURL, {
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    // On connection
    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket.id);

      this.socket.emit('pingCheck');
      
      setInterval(() => {
        this.socket.emit('pingCheck');
      }, 5000);

      // Initial sync request after gathering local player data
      const data = GameManager.getNetworkData();

      this.socket.emit('playerSyncRequest', { x: 0, y: 0, data });
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('Disconnected from server:', reason);
      // You could show a "Reconnecting..." message here if needed

      // Destroy all ghost players
      for (const id in this.otherPlayers) {
        this.otherPlayers[id].destroy();
        delete this.otherPlayers[id];
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected to server after', attemptNumber, 'tries');

      // Re-send player data to re-register this client
      const data = GameManager.getNetworkData();
      const location = GameManager.getLastLocation();
      this.socket.emit('playerSyncRequest', { x: location.x, y: location.y, data });
    });


    // Add already-connected players
    this.socket.on('existingPlayers', (players) => {
      console.log('Existing players received:', players);
      players.forEach(({ id, x, y, data }) => {
        if (id !== this.socket.id) {
          //this.savedOtherPlayers = players;
          this.addOtherPlayer(id, x, y, data);
        }
      });
    });

    // New player joined
    this.socket.on('playerJoined', ({ id, x, y, data }) => {
      if (!this.otherPlayers[id] && id !== this.socket.id) {
        this.addOtherPlayer(id, x, y, data);
      }
    });
    // Player left
    this.socket.on('playerLeft', ({ id }) => {
      const player = this.otherPlayers[id];
      if (player) {
        player.destroy();
        delete this.otherPlayers[id];
      }
    });

    this.socket.on('droppedDueToInactivity', () => {
      console.warn('You were dropped due to inactivity. Resyncing...');

      // Resend current state
      // const data = GameManager.getNetworkData();
      // this.socket.emit('playerSyncRequest', { x: 0, y: 0, data });
    });

    // General sync update
    this.socket.on('playerSyncUpdate', ({ id, x, y, data }) => {
      const player = this.otherPlayers[id];
      if (player) {
        player.syncAll(x, y, data);
      }
    });


    // Name update
    this.socket.on('playerNamed', ({ id, text, color }) => {
      const player = this.otherPlayers[id];
      if (player) {
        player.updateName(text, color);
      }
    });

    // Position update
    this.socket.on('playerMoved', ({ id, x, y }) => {
      const player = this.otherPlayers[id];
      if (player) {
        player.updatePosition(x, y);
      }
    });

    // Level update
    this.socket.on('playerLeveled', ({ id, source, auraLevel }) => {
      const player = this.otherPlayers[id];
      if (player) {
        player.updatePower(source, auraLevel);
      }
    });

    // Shurikan throw
    this.socket.on('shurikanthrown', ({ id, x, y, d }) => {
      const player = this.otherPlayers[id];
      if (player) {
        player.ghostShurikan(x, y, d);
      }
    });

    this.socket.on('playerchatUpdate', ({ id, message }) => {
      const player = this.otherPlayers[id];
      if (player) {
        player.makeChatBubble(message);
      }
    })


  }

  addOtherPlayer(id, x = -1100, y = 400, data = {
    name: { text: 'Hunter', color: '#ffffff' },
    power: { source: 0, auraLevel: 1 },
  }) {
    if (this.otherPlayers[id]) {
      this.otherPlayers[id].destroy();
    }

    const ghost = new GhostPlayer(this.scene, id, x, y, data);
    this.otherPlayers[id] = ghost;
  }
}
