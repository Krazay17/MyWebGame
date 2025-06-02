const CURRENT_VERSION = 1.5;

export default {
    version: CURRENT_VERSION,
    name: { text: 'Hunter', color: '#FFFFFF' },
    location: {x: 0, y: 0},
    area: 'Home',
    power: { source: 0, auraLevel: 1},
    source: 0,
    weapons: { left: 'shurikan', right: 'sword', aura: 'zap' },
    playerHealth: 5,
    volume: {master: 1, music: 1},
    collectedItems: [],
    flags: {
        seenIntro: false,
        devmode: false,
    },

    save() {
        const data = {
            version: this.version,
            name: this.name,
            location: this.location,
            area: this.area,
            power: this.power,
            source: this.source,
            weapons: this.weapons,
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

                this.reset({
                    keep: {
                        name: parsed.name,
                        //volume: parsed.volume,
                        collectedItems: parsed.collectedItems,
                        flags: parsed.flags,
                        weapons: parsed.weapons,
                        power: parsed.power,
                    }
                });

                return;
            }

            // Normal loading path
            this.version = parsed.version ?? CURRENT_VERSION;
            this.location = parsed.location ?? {x: 0, y: 0};
            this.name = parsed.name ?? { text: 'Hunter', color: '#FFFFFF' };
            this.area = parsed.area ?? 'Home';
            this.power = parsed.power ?? { source: 0, auraLevel: 1};
            this.source = typeof parsed.source === 'number' ? Math.floor(parsed.source) : 0;
            this.weapons = parsed.weapons ?? { left: 'shurikan', right: 'sword', aura: 'zap' };
            this.playerHealth = parsed.playerHealth ?? 5;
            this.volume = parsed.volume ?? {master: 1, music: 1};
            this.collectedItems = parsed.collectedItems ?? [];
            this.flags = parsed.flags ?? {};
        }
    },

    reset({ keep = {} } = {}) {
        // Merge preserved values first
        this.version = CURRENT_VERSION;
        this.name = keep.name ?? { text: 'Hunter', color: '#FFFFFF' };
        this.location = {x: 0, y: 0};
        this.area = keep.area ?? 'Home';
        this.power = keep.power ?? { source: 0, auraLevel: 1};
        this.source = keep.source ?? 0;
        this.weapons = keep.weapons ?? { left: 'shurikan', right: 'sword', aura: 'zap' };
        this.playerHealth = 5;
        this.volume = keep.volume ?? {master: 1, music: 1};
        this.collectedItems = keep.collectedItems ?? [];
        this.flags = keep.flags ?? {
            seenIntro: false,
            devmode: false,
        };

        this.save();
    },

    clear() {
        localStorage.removeItem('webConduitSave');
    },

getNetworkData() {
  return {
    name: {
      text: this.name?.text ?? 'Hunter',
      color: this.name?.color ?? '#ffffff'
    },
    power: {
      source: typeof this.power?.source === 'number' ? this.power.source : 0,
      auraLevel: typeof this.power?.auraLevel === 'number' ? this.power.auraLevel : 1
    }
  };
},

getLastLocation() {
    return this.location ?? {x:0, y:0};
}


}