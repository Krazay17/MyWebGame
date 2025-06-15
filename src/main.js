import Phaser from 'phaser'
import Boot from './scenes/Boot.js'
import Preloader from './scenes/Preloader.js'
import EscMenu from './scenes/EscMenu.js'
import Inventory from './scenes/Inventory.js'
import PlayerUI from './scenes/playerUI.js'
import Home from './scenes/Home.js'
import Level1 from './scenes/Level1.js'
import level2 from './scenes/level2.js'
import Level3 from './scenes/Level3.js'
import level4 from './scenes/level4.js'

/// <reference path="../types/phaser.d.ts" />


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
        // fps: 60,
        // fixedStep: true,
        //tileBias: 40,
        debug: false,
      }
    },
    parent: 'body',
    dom: {
      createContainer: true,
    },
    scene: [Boot, Preloader, Home, Level1, level2, Level3, level4,
      PlayerUI, Inventory, EscMenu],
};

let game = new Phaser.Game(config);