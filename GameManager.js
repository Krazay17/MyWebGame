export default{

    level: 1,
    source: 0,
    playerHealth: 5,
    collectedItems: [],
    flags: {
        seenIntro: false,
    },

    save()
    {
        const data = {
            level: this.level,
            source: this.source,
            playerHealth: this.playerHealth,
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
            this.level = parsed.level ?? 1;
            this.source = parsed.source ?? 0;
            this.playerHealth = parsed.playerHealth ?? 5;
            this.collectedItems = parsed.collectedItems ?? [];
            this.flags = parsed.flags ?? {};
        }
    },

    reset()
    {
        this.level = 1;
        this.source = 0;
        this.playerHealth = 5;
        this.collectedItems = [];
        this.flags = {
            seenIntro: false,
        };
    }
}