import Boot from './Boot.js';
import Preloader from './Preloader.js';
import MainGame from './Game.js';
import EscMenu from './EscMenu.js';


const config = {
    type: Phaser.AUTO,
    width: 1600,
    height: 900,
    backgroundColor: '#000000',
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
    scene: [Boot, Preloader, MainGame, EscMenu],
};

let game = new Phaser.Game(config);