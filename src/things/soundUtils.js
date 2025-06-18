import GameManager from "./GameManager.js";

const lastPlayTimes = {};
const MIN_INTERVAL = 25; // ms per sound ID

export default class SoundUtil {
    static currentMusic = null;
    static currentKey = '';
    static storedTime = 0;

    static setup(scene, key = 'music1', volume = 1) {
        if (this.currentMusic && this.currentKey === key) {
            // Already playing this track → do nothing
            return;
        }

        // If switching tracks, stop old one
        if (this.currentMusic) {
            this.storedTime = this.currentMusic.seek;
            this.currentMusic.stop();
            this.currentMusic.destroy();
        }

        this.currentKey = key;
        this.currentMusic = scene.sound.add(key, { loop: true });
        this.currentMusic.volume = GameManager.volume.music * volume;

        if (this.storedTime) {
            this.currentMusic.seek = this.storedTime;
        }

        this.currentMusic.play();
    }

    static savePosition() {
        if (this.currentMusic) {
            this.storedTime = this.currentMusic.seek;
        }
    }
}

export function playHitSound(scene, soundKey, options = {}) {
    if (document.visibilityState !== 'visible') return;

    const now = scene.time.now;
    const lastTime = lastPlayTimes[soundKey] || 0;

    if (now - lastTime > (options.cooldown || MIN_INTERVAL)) {
        lastPlayTimes[soundKey] = now;

        if (!scene.sfx[soundKey]) {
            scene.sfx[soundKey] = [];
            for (let i = 0; i < (options.poolSize || 10); i++) {
                scene.sfx[soundKey].push(scene.sound.add(soundKey));
            }
        }

        const pool = scene.sfx[soundKey];
        const sound = pool.find(s => !s.isPlaying) || pool[0]; // grab idle sound or first one

        sound.play({
            volume: options.volume ?? 1,
            detune: options.detune ?? Phaser.Math.Between(-55, 55),
            rate: options.rate ?? 1
        });
    }
}

export function playSound(scene, soundKey, options = {}) {
    if (document.visibilityState !== 'visible') return;

    const now = scene.time.now;
    const lastTime = lastPlayTimes[soundKey] || 0;

    if (now - lastTime > (options.cooldown || MIN_INTERVAL)) {
        lastPlayTimes[soundKey] = now;

        if (!scene.sfx[soundKey]) {
            scene.sfx[soundKey] = [];
            for (let i = 0; i < (options.poolSize || 10); i++) {
                scene.sfx[soundKey].push(scene.sound.add(soundKey));
            }
        }

        const pool = scene.sfx[soundKey];
        const sound = pool.find(s => !s.isPlaying) || pool[0]; // grab idle sound or first one

        sound.play({
            volume: options.volume ?? 1,
            detune: options.detune ?? Phaser.Math.Between(-55, 55),
            rate: options.rate ?? 1
        });
    }
}
