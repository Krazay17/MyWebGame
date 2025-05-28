
const CURRENT_VERSION = 1.1;

export default {
    version: CURRENT_VERSION,
    level: 1,
    area: 'Home',
    source: 0,
    weapons: { left: 'shurikan', right: 'sword', aura: 'zap' },
    auraLevel: 1,
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

    save() {
        const data = {
            version: this.version,
            level: this.level,
            area: this.area,
            source: this.source,
            weapons: this.weapons,
            auraLevel: this.auraLevel,
            playerHealth: this.playerHealth,
            volume: this.volume,
            collectedItems: this.collectedItems,
            flags: this.flags,
        };
        localStorage.setItem('webConduitSave', JSON.stringify(data));
    },

    load() {
        const data = localStorage.getItem('webConduitSave');
        if (data) {
            const parsed = JSON.parse(data);

        if (parsed.version !== CURRENT_VERSION) {
            console.warn('Save version mismatch. Resetting progress.');
            this.reset(true);
            return;
        }
            this.version = parsed.version ?? CURRENT_VERSION;
            this.level = Math.floor(parsed.level) ?? 1;
            this.area = parsed.area ?? 'Home';
            this.source = Math.floor(parsed.source) ?? 0;
            this.weapons = parsed.weapons ?? { left: 'shurikan', right: 'sword', aura: 'zap' },
            this.auraLevel = parsed.auraLevel ?? 1;
            this.playerHealth = parsed.playerHealth ?? 5;
            this.volume = parsed.volume ?? 1;
            this.collectedItems = parsed.collectedItems ?? [];
            this.flags = parsed.flags ?? {};
        }
    },

    reset(resetSource) {
        this.version = CURRENT_VERSION;
        this.level = 1;
        this.area = 'Home';
        if (resetSource) this.source = 0;
        this.weapons = { left: 'shurikan', right: 'sword', aura: 'zap' };
        this.auraLevel = 1;
        this.playerHealth = 5;
        this.volume = 1;
        this.collectedItems = [];
        this.flags = {
            seenIntro: false,
        };

        this.save();
    },

    clear() {
    localStorage.removeItem('webConduitSave');
    this.reset();
}

}