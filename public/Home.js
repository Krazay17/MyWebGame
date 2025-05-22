import BaseGame from './BaseGame.js'

export default class Home extends BaseGame
{
    constructor()
    {
        super('Home');
    }

    preload()
    {
        super.preload();
        this.load.image('sky2', 'Assets/Sky2.png')
        this.load.image('sky2layer1', 'Assets/Sky2Layer1.png')
        this.load.image('sky2layer2', 'Assets/Sky2Layer2.png')
        this.load.image('platformwide', 'Assets/platformwide.png')
        this.load.image('portal1', 'Assets/portal1.png')
    }

    create()
    {
        this.setupWorld();
        this.setupKeybinds();
        this.MakeSky();
        this.setupFPS();
        this.setupPlayer();

        this.setupGroups();
        this.platformGroups.push(this.widePlatforms = this.physics.add.staticGroup());
        this.portals = this.physics.add.staticGroup();

        this.setupCollisions();
        this.physics.add.overlap(this.player, this.portals, () => this.scene.start('MainGame'), null, this);
        
        const widePlatformPos = [
            [-1000, 500], [-800, 600], [-400, 700], [0, 800], [400, 700], [800, 600], [1000, 500]
        ];
        widePlatformPos.forEach(pos => this.platforms.create(pos[0], pos[1], 'platformwide'));
        this.portals.create(800, 300, 'portal1');
    }

    update(time, delta)
    {
        super.update(time, delta);
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