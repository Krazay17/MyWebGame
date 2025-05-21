import PlayerProjectiles from "./PlayerProjectiles.js";
import Player from "./Player.js";

export default class Home extends Phaser.Scene
{
    constructor()
    {
        super('Home')
    }

    preload()
    {
        this.load.image('sky2', 'Assets/Sky2.png')
        this.load.image('sky2layer1', 'Assets/Sky2Layer1.png')
        this.load.image('sky2layer2', 'Assets/Sky2Layer2.png')
        this.load.image('platformwide', 'Assets/platformwide.png')
    }

    create()
    {
        this.physics.world.setBounds(-800, 0, 1600, 900);
        this.cameras.main.setBounds(-1000, 0, 2000, 1100);

        this.MakeSky();


        this.player = new Player(this, 0, 0);
        this.platforms = this.physics.add.staticGroup();
        this.projectiles = new PlayerProjectiles(this, this.player, 1);
        this.player.SetProjectileGroup(this.projectiles);

        const platformPos = [[0, 900]]

        platformPos.forEach(pos => this.platforms.create(pos[0], pos[1], 'platformwide'));

        this.cameras.main.startFollow(this.player);

        this.physics.add.collider(this.player, this.platforms, (player, platform) => {
            this.player.TouchPlatform(player, platform)
        }, null, this);
    }

    update(time, delta)
    {
        this.player.handleInput(delta);
    }

    MakeSky()
    {
        this.sky1 = this.add.image(0, 0, 'sky2').setOrigin(0)
        .setDisplaySize(this.scale.width, this.scale.height).setScrollFactor(0)
        .on('resize', (gameSize) =>{
        const width = gameSize.width;
        const height = gameSize.height;

        this.sky1.setDisplaySize(width, height);
        });
        this.sky2 = this.add.image(800, 600, 'sky2layer1').setScale(.8).setScrollFactor(.2)
        this.sky3 = this.add.image(600, 600, 'sky2layer2').setScale(.6).setScrollFactor(.6)
    }
}