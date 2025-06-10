const CURRENT_VERSION = 0.106;

export default {
    version: CURRENT_VERSION,
    name: { text: 'Hunter', color: '#FFFFFF' },
    location: { x: 0, y: 0 },
    area: 'Home',
    power: { money: 0, spent: 0, auraLevel: 1, },
    upgrades: {},
    stats: { healthMax: 25, health: 25 },
    weapons: { left: 'shurikan', right: 'sword', aura: 'zap' },
    volume: { master: 1, music: 1 },
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
            upgrades: this.upgrades,
            stats: this.stats,
            weapons: this.weapons,
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
                        volume: parsed.volume,
                        //collectedItems: parsed.collectedItems,
                        flags: parsed.flags,
                        //weapons: parsed.weapons,
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
            this.power = parsed.power ?? { money: 0, spent: 0, auraLevel: 1, };
            this.upgrades = parsed.upgrades ?? {};
            this.stats = parsed.stats ?? {healthMax: 25, health: 25};
            this.weapons = parsed.weapons ?? { left: 'shurikan', right: 'sword', aura: 'zap' };
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
        this.power = keep.power ?? { money: 0, spent: 0, auraLevel: 1, };
        this.upgrades = keep.upgrades ?? {};
        this.money = keep.money ?? 0;
        this.stats = keep.stats ?? {healthMax: 25, health: 25};
        this.weapons = keep.weapons ?? { left: 'shurikan', right: 'sword', aura: 'zap' };
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
      console.log(this.power.money)
  return {
    name: {
      text: this.name?.text ?? 'Hunter',
      color: this.name?.color ?? '#ffffff'
    },
    power: {
      money: this.power?.money ?? 0,
      auraLevel: this.power?.auraLevel ?? 1
    }
  };
},

getLastLocation() {
    return this.location ?? {x:0, y:0};
}

}