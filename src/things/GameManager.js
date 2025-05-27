export default{

    level: 1,
    area: 'Home',
    source: 0,
    weapons: {left: 'shurikan', right: 'sword'},
    playerHealth: 5,
    volume: 1,
    collectedItems: [],
    flags: {
        seenIntro: false,
    },
    devMode: false,
    debug: {
        canTeleport: false,
    },

    save()
    {
        const data = {
            level: this.level,
            area: this.area,
            source: this.source,
            weapons: this.weapons,
            playerHealth: this.playerHealth,
            volume: this.volume,
            collectedItems: this.collectedItems,
            flags: this.flags,
        };
        localStorage.setItem('webConduitSave', JSON.stringify(data));
    },

    load()
    {
        const data = localStorage.getItem('webConduitSave');
        if (data)
        {
            const parsed = JSON.parse(data);
            this.level = Math.floor(parsed.level) ?? 1;
            this.area = parsed.area ?? 'Home';
            this.source = Math.floor(parsed.source) ?? 0;
            this.weapons = parsed.weapons ?? {left: 'shurikan', right: 'sword'},
            this.playerHealth = parsed.playerHealth ?? 5;
            this.volume = parsed.volume ?? 1;
            this.collectedItems = parsed.collectedItems ?? [];
            this.flags = parsed.flags ?? {};
        }
    },

    reset()
    {
        this.level = 1;
        this.area = 'Home';
        this.source = 0;
        this.weapons = {left: 'shurikan', right: 'sword'};
        this.playerHealth = 5;
        this.volume = 1;
        this.collectedItems = [];
        this.flags = {
            seenIntro: false,
        };
    }
}