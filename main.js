import Boot from './Boot.js';
import Preloader from './Preloader.js';
import MainGame from './Game.js';
import EscMenu from './EscMenu.js';
import Home from './Home.js';
import Inventory from './Inventory.js';


const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#000000',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: {y: 720, x: 0},
        timescale: 1,
        fps: 60,
        fixedStep: true,
        debug: false,
      }
    },
    scene: [Boot, Preloader, MainGame, EscMenu, Home, Inventory],
};

let game = new Phaser.Game(config);