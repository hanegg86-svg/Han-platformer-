import { store } from './store.js';
import { UIManager } from './ui.js';

// Web Audio API Sound Synthesizer
class SoundFX {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playJump() {
        if (!this.ctx || !store.getState().soundEnabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
    }

    playCoin() {
        if (!this.ctx || !store.getState().soundEnabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(987.77, this.ctx.currentTime); // B5
        osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.08); // E6
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.22);
    }

    playDash() {
        if (!this.ctx || !store.getState().soundEnabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(90, this.ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    playHit() {
        if (!this.ctx || !store.getState().soundEnabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(30, this.ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
    }

    playCheckpoint() {
        if (!this.ctx || !store.getState().soundEnabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, this.ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.08);
        osc.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.16);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }
}

class PlatformerGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ui = new UIManager();
        this.sfx = new SoundFX();
        
        this.keys = { left: false, right: false, jump: false, dash: false };
        this.animationFrameId = null;

        // BGM Setup
        this.bgm = new Audio('bgm.mp3');
        this.bgm.loop = true;

        // Player Single Image Setup
        this.playerImg = new Image();
        this.playerImg.src = 'player.png';

        // Physics Constants
        this.GRAVITY = 0.38;
        
        // Game Entities
        this.player = null;
        this.platforms = [];
        this.coins = [];
        this.spikes = [];
        this.springs = [];
        this.powerups = [];
        this.enemies = [];
        this.projectiles = [];
        this.checkpoint = null;
        this.spawnPoint = { x: 25, y: 0 };
        this.lava = null;
        this.keyItem = null;
        this.goal = null;

        // Visual Polish & Juice System
        this.particles = [];
        this.floatingTexts = [];
        this.shakeTimer = 0;
        this.shakeIntensity = 0;

        // Visual Theme State ('sky', 'volcano', 'night')
        this.currentTheme = 'sky';

        // 3-Star Mission Timers & Banner
        this.levelTime = 0;
        this.targetTime = 15;
        this.bannerTimer = 0;
        this.bannerText = '';

        this.init();
    }

    init() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.ui.init(
            (tab) => this.handleTabChange(tab),
            () => this.restartGame(),
            () => this.restartGame()
        );

        this.setupTouchControls();
        this.setupKeyboardControls();

        // Unlock Audio Autoplay on First Interaction
        const unlockAudio = () => {
            this.sfx.init();
            this.updateBGMState();
            window.removeEventListener('touchstart', unlockAudio);
            window.removeEventListener('mousedown', unlockAudio);
            window.removeEventListener('keydown', unlockAudio);
        };
        window.addEventListener('touchstart', unlockAudio);
        window.addEventListener('mousedown', unlockAudio);
        window.addEventListener('keydown', unlockAudio);

        store.subscribe(() => this.updateBGMState());

        this.resetEntities();
        this.gameLoop();
    }

    triggerShake(intensity = 8, duration = 12) {
        this.shakeIntensity = intensity;
        this.shakeTimer = duration;
    }

    addParticles(x, y, color = '#facc15', count = 12) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x,
                y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6 - 2,
                size: Math.random() * 4 + 2,
                color,
                alpha: 1.0,
                life: Math.random() * 20 + 20
            });
        }
    }

    addFloatingText(x, y, text, color = '#facc15') {
        this.floatingTexts.push({
            x,
            y,
            text,
            color,
            alpha: 1.0,
            vy: -1.2
        });
    }

    updateBGMState() {
        const state = store.getState();
        if (state.soundEnabled && state.activeTab === 'game' && !state.isGameOver) {
            if (this.bgm.paused) {
                this.bgm.play().catch(() => {});
            }
        } else {
            this.bgm.pause();
        }
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    getLevelData(level, w, h) {
        const levels = [
            // ด่าน 1: ทุ่งหญ้า + Checkpoint
            {
                theme: 'sky',
                targetTime: 18,
                lavaSpeed: 0.10,
                checkpoint: { x: w * 0.45, y: h - 170, width: 18, height: 30, active: false },
                platforms: [
                    { x: 0, y: h - 20, width: w, height: 20, type: 'normal' },
                    { x: w * 0.05, y: h - 80, width: w * 0.32, height: 14, type: 'normal' },
                    { x: w * 0.42, y: h - 140, width: w * 0.25, height: 14, type: 'bounce' },
                    { x: w * 0.10, y: h - 250, width: w * 0.32, height: 14, type: 'normal' },
                    { x: w * 0.52, y: h - 310, width: w * 0.38, height: 14, type: 'normal' }
                ],
                coins: [
                    { x: w * 0.20, y: h - 110, radius: 8, collected: false },
                    { x: w * 0.54, y: h - 200, radius: 8, collected: false },
                    { x: w * 0.25, y: h - 280, radius: 8, collected: false }
                ],
                spikes: [],
                springs: [],
                enemies: [
                    { x: w * 0.55, y: h - 330, width: 24, height: 20, vx: 1.0, minX: w * 0.52, maxX: w * 0.85, isDefeated: false, isRanged: false }
                ],
                powerups: [
                    { x: w * 0.15, y: h - 280, type: 'magnet', collected: false, radius: 10 }
                ],
                keyItem: { x: w * 0.15, y: h - 110, width: 20, height: 20, collected: false },
                goal: { x: w * 0.75, y: h - 350, width: 30, height: 40, isLocked: true }
            },
            // ด่าน 2: ถ้ำหิมะลาวา + ศัตรูยิงกระสุน
            {
                theme: 'volcano',
                targetTime: 16,
                lavaSpeed: 0.20,
                checkpoint: { x: w * 0.12, y: h - 250, width: 18, height: 30, active: false },
                platforms: [
                    { x: 0, y: h - 20, width: w, height: 20, type: 'normal' },
                    { x: w * 0.05, y: h - 80, width: w * 0.30, height: 14, type: 'ice' },
                    { x: w * 0.40, y: h - 140, width: w * 0.28, height: 14, type: 'crumble', timer: 0, isCrumbling: false, isDestroyed: false },
                    { x: w * 0.08, y: h - 220, width: w * 0.34, height: 14, type: 'ice' },
                    { x: w * 0.50, y: h - 300, width: w * 0.35, height: 14, type: 'normal' }
                ],
                coins: [
                    { x: w * 0.20, y: h - 110, radius: 8, collected: false },
                    { x: w * 0.52, y: h - 170, radius: 8, collected: false }
                ],
                spikes: [
                    { x: w * 0.38, y: h - 34, width: w * 0.25, height: 14 }
                ],
                springs: [],
                enemies: [
                    { x: w * 0.55, y: h - 325, width: 24, height: 22, vx: 0, minX: w * 0.5, maxX: w * 0.8, isDefeated: false, isRanged: true, shootTimer: 0 }
                ],
                powerups: [
                    { x: w * 0.12, y: h - 110, type: 'shield', collected: false, radius: 10 }
                ],
                keyItem: { x: w * 0.65, y: h - 330, width: 20, height: 20, collected: false },
                goal: { x: w * 0.10, y: h - 260, width: 30, height: 40, isLocked: true }
            },
            // ด่าน 3: ไซเบอร์นีออน
            {
                theme: 'night',
                targetTime: 15,
                lavaSpeed: 0.28,
                checkpoint: null,
                platforms: [
                    { x: 0, y: h - 20, width: w, height: 20, type: 'normal' },
                    { x: w * 0.05, y: h - 80, width: w * 0.35, height: 14, type: 'conveyor_right' },
                    { x: w * 0.48, y: h - 150, width: w * 0.35, height: 14, type: 'conveyor_left' },
                    { x: w * 0.08, y: h - 230, width: w * 0.32, height: 14, type: 'bounce' },
                    { x: w * 0.50, y: h - 320, width: w * 0.35, height: 14, type: 'normal' }
                ],
                coins: [
                    { x: w * 0.22, y: h - 110, radius: 8, collected: false },
                    { x: w * 0.62, y: h - 180, radius: 8, collected: false }
                ],
                spikes: [
                    { x: w * 0.35, y: h - 34, width: w * 0.30, height: 14 }
                ],
                springs: [],
                enemies: [
                    { x: w * 0.55, y: h - 170, width: 24, height: 20, vx: -1.2, minX: w * 0.48, maxX: w * 0.80, isDefeated: false, isRanged: false }
                ],
                powerups: [
                    { x: w * 0.15, y: h - 110, type: 'boost', collected: false, radius: 10 }
                ],
                keyItem: { x: w * 0.65, y: h - 180, width: 20, height: 20, collected: false },
                goal: { x: w * 0.70, y: h - 360, width: 30, height: 40, isLocked: true }
            },
            // ด่าน 4: ถ้ำภูเขาไฟ
            {
                theme: 'volcano',
                targetTime: 14,
                lavaSpeed: 0.32,
                checkpoint: { x: w * 0.52, y: h - 340, width: 18, height: 30, active: false },
                platforms: [
                    { x: 0, y: h - 20, width: w, height: 20, type: 'normal' },
                    { x: w * 0.05, y: h - 80, width: w * 0.28, height: 14, type: 'normal' },
                    { x: w * 0.40, y: h - 150, width: w * 0.28, height: 14, type: 'phase', timer: 0, active: true },
                    { x: w * 0.08, y: h - 230, width: w * 0.28, height: 14, type: 'phase', timer: 45, active: false },
                    { x: w * 0.48, y: h - 310, width: w * 0.38, height: 14, type: 'normal' }
                ],
                coins: [
                    { x: w * 0.52, y: h - 180, radius: 8, collected: false },
                    { x: w * 0.18, y: h - 260, radius: 8, collected: false }
                ],
                spikes: [
                    { x: w * 0.32, y: h - 34, width: w * 0.32, height: 14 }
                ],
                springs: [
                    { x: w * 0.08, y: h - 90, width: 28, height: 10 }
                ],
                enemies: [
                    { x: w * 0.52, y: h - 330, width: 24, height: 20, vx: 1.5, minX: w * 0.48, maxX: w * 0.82, isDefeated: false, isRanged: false }
                ],
                powerups: [
                    { x: w * 0.60, y: h - 340, type: 'shield', collected: false, radius: 10 }
                ],
                keyItem: { x: w * 0.18, y: h - 260, width: 20, height: 20, collected: false },
                goal: { x: w * 0.72, y: h - 350, width: 30, height: 40, isLocked: true }
            },
            // ด่าน 5: ไซเบอร์กอนต์เล็ต
            {
                theme: 'night',
                targetTime: 15,
                lavaSpeed: 0.38,
                checkpoint: null,
                platforms: [
                    { x: 0, y: h - 20, width: w, height: 20, type: 'normal' },
                    { x: w * 0.03, y: h - 80, width: w * 0.26, height: 14, type: 'conveyor_right' },
                    { x: w * 0.36, y: h - 140, width: w * 0.24, height: 14, type: 'ice' },
                    { x: w * 0.68, y: h - 200, width: w * 0.25, height: 14, type: 'bounce' },
                    { x: w * 0.32, y: h - 270, width: w * 0.26, height: 14, type: 'phase', timer: 0, active: true },
                    { x: w * 0.03, y: h - 340, width: w * 0.30, height: 14, type: 'normal' }
                ],
                coins: [
                    { x: w * 0.48, y: h - 170, radius: 8, collected: false },
                    { x: w * 0.44, y: h - 300, radius: 8, collected: false }
                ],
                spikes: [
                    { x: w * 0.28, y: h - 34, width: w * 0.38, height: 14 }
                ],
                springs: [],
                enemies: [
                    { x: w * 0.06, y: h - 360, width: 24, height: 20, vx: 1.5, minX: w * 0.03, maxX: w * 0.30, isDefeated: false, isRanged: false }
                ],
                powerups: [
                    { x: w * 0.78, y: h - 230, type: 'boost', collected: false, radius: 10 }
                ],
                keyItem: { x: w * 0.48, y: h - 170, width: 20, height: 20, collected: false },
                goal: { x: w * 0.08, y: h - 380, width: 30, height: 40, isLocked: true }
            }
        ];

        const index = (level - 1) % levels.length;
        const selected = levels[index];

        return {
            theme: selected.theme,
            targetTime: selected.targetTime,
            lavaSpeed: selected.lavaSpeed,
            checkpoint: selected.checkpoint ? { ...selected.checkpoint } : null,
            platforms: selected.platforms.map(p => ({ ...p })),
            coins: selected.coins.map(c => ({ ...c })),
            spikes: selected.spikes.map(s => ({ ...s })),
            springs: selected.springs.map(sp => ({ ...sp })),
            enemies: selected.enemies.map(e => ({ ...e })),
            powerups: selected.powerups.map(pw => ({ ...pw })),
            keyItem: selected.keyItem ? { ...selected.keyItem } : null,
            goal: { ...selected.goal }
        };
    }

    resetEntities() {
        this.resizeCanvas();
        const w = this.canvas.width || 360;
        const h = this.canvas.height || 400;

        this.levelTime = 0;
        this.particles = [];
        this.floatingTexts = [];
        this.projectiles = [];

        const currentLevel = store.getState().level;
        const levelData = this.getLevelData(currentLevel, w, h);

        this.spawnPoint = { x: 25, y: h - 140 };

        this.player = {
            x: this.spawnPoint.x,
            y: this.spawnPoint.y,
            width: 60,
            height: 60,
            vx: 0,
            vy: 0,
            speed: 4.8,
            jumpPower: -11.0,
            isGrounded: false,
            color: '#ef4444',
            
            // Player Mechanics
            jumpsLeft: 2,
            isDashing: false,
            dashTimer: 0,
            dashCooldown: 0,
            isWallSliding: false,

            // Active Power-ups State
            hasShield: true,
            invincibleTimer: 0,
            magnetTimer: 0,
            boostTimer: 0,

            // Trail FX Data
            trail: [],

            // Procedural Animation States
            facing: 'right',
            walkTimer: 0,
            idleTimer: 0,
            rotation: 0,
            scaleX: 1,
            scaleY: 1
        };

        this.currentTheme = levelData.theme;
        this.targetTime = levelData.targetTime;
        this.checkpoint = levelData.checkpoint;
        this.platforms = levelData.platforms;
        this.coins = levelData.coins;
        this.spikes = levelData.spikes;
        this.springs = levelData.springs;
        this.enemies = levelData.enemies;
        this.powerups = levelData.powerups;
        this.keyItem = levelData.keyItem;
        this.goal = levelData.goal;

        this.lava = {
            y: h + 120,
            speed: levelData.lavaSpeed
        };
    }

    respawnAtCheckpoint() {
        const p = this.player;
        p.x = this.spawnPoint.x;
        p.y = this.spawnPoint.y;
        p.vx = 0;
        p.vy = -6;
        p.invincibleTimer = 60;
        p.hasShield = true;
        this.triggerShake(10, 15);
        this.sfx.playHit();
        this.addParticles(p.x + p.width / 2, p.y + p.height / 2, '#38bdf8', 20);
    }

    setupTouchControls() {
        const bindBtn = (id, key, onPress) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            const start = (e) => {
                e.preventDefault();
                this.keys[key] = true;
                btn.classList.add('pressed');
                if (onPress) onPress();
            };
            const end = (e) => {
                e.preventDefault();
                this.keys[key] = false;
                btn.classList.remove('pressed');
            };

            btn.addEventListener('touchstart', start);
            btn.addEventListener('touchend', end);
            btn.addEventListener('mousedown', start);
            btn.addEventListener('mouseup', end);
            btn.addEventListener('mouseleave', end);
        };

        bindBtn('btn-left', 'left');
        bindBtn('btn-right', 'right');
        bindBtn('btn-jump', 'jump', () => this.handleJumpTrigger());
        bindBtn('btn-dash', 'dash', () => this.handleDashTrigger());
    }

    setupKeyboardControls() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = true;
            if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = true;
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') {
                if (!this.keys.jump) this.handleJumpTrigger();
                this.keys.jump = true;
            }
            if (e.key === 'Shift' || e.key === 'k') this.handleDashTrigger();
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = false;
            if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = false;
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') this.keys.jump = false;
        });
    }

    handleJumpTrigger() {
        const p = this.player;
        if (p.isGrounded) {
            p.vy = p.jumpPower;
            p.isGrounded = false;
            p.jumpsLeft = 1;
            this.sfx.playJump();
            this.addParticles(p.x + p.width / 2, p.y + p.height, '#ffffff', 6);
        } else if (p.isWallSliding) {
            p.vy = p.jumpPower;
            p.vx = p.facing === 'left' ? p.speed : -p.speed;
            p.isWallSliding = false;
            this.sfx.playJump();
        } else if (p.jumpsLeft > 0) {
            p.vy = p.jumpPower * 0.9;
            p.jumpsLeft--;
            this.sfx.playJump();
            this.addParticles(p.x + p.width / 2, p.y + p.height / 2, '#38bdf8', 8);
        }
    }

    handleDashTrigger() {
        const p = this.player;
        if (p.dashCooldown <= 0 && !p.isDashing) {
            p.isDashing = true;
            p.dashTimer = 10;
            p.dashCooldown = 30;
            this.sfx.playDash();
            this.triggerShake(5, 8);
            this.addParticles(p.x + p.width / 2, p.y + p.height / 2, '#facc15', 14);
        }
    }

    handleTabChange(tab) {
        if (tab !== 'game') {
            this.keys.left = false;
            this.keys.right = false;
            this.keys.jump = false;
            this.keys.dash = false;
        }
        this.updateBGMState();
    }

    restartGame() {
        store.resetScore();
        this.resetEntities();
        this.bgm.currentTime = 0;
        this.updateBGMState();
    }

    handlePlayerDamage() {
        const p = this.player;
        if (p.invincibleTimer > 0) return;

        if (p.hasShield) {
            p.hasShield = false;
            p.vy = -8;
            p.invincibleTimer = 50;
            this.sfx.playHit();
            this.triggerShake(8, 12);
            this.addParticles(p.x + p.width / 2, p.y + p.height / 2, '#38bdf8', 16);
        } else if (this.checkpoint && this.checkpoint.active) {
            this.respawnAtCheckpoint();
        } else if (!store.getState().isGameOver) {
            this.sfx.playHit();
            this.triggerShake(14, 20);
            store.setGameOver(true);
        }
    }

    update() {
        const state = store.getState();
        if (state.isGameOver || state.activeTab !== 'game') return;

        const p = this.player;

        this.levelTime++;

        if (p.invincibleTimer > 0) p.invincibleTimer--;
        if (this.shakeTimer > 0) this.shakeTimer--;

        // Update Particles
        this.particles.forEach(pt => {
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.alpha -= 0.03;
            pt.life--;
        });
        this.particles = this.particles.filter(pt => pt.life > 0 && pt.alpha > 0);

        // Update Floating Text
        this.floatingTexts.forEach(ft => {
            ft.y += ft.vy;
            ft.alpha -= 0.02;
        });
        this.floatingTexts = this.floatingTexts.filter(ft => ft.alpha > 0);

        // Checkpoint Collision
        if (this.checkpoint && !this.checkpoint.active) {
            if (
                p.x < this.checkpoint.x + this.checkpoint.width &&
                p.x + p.width > this.checkpoint.x &&
                p.y < this.checkpoint.y + this.checkpoint.height &&
                p.y + p.height > this.checkpoint.y
            ) {
                this.checkpoint.active = true;
                this.spawnPoint = { x: this.checkpoint.x, y: this.checkpoint.y - p.height + 10 };
                this.sfx.playCheckpoint();
                this.addParticles(this.checkpoint.x, this.checkpoint.y, '#22c55e', 20);
                this.addFloatingText(this.checkpoint.x - 20, this.checkpoint.y - 15, 'จุดเซฟทำงาน!', '#22c55e');
            }
        }

        // Lava Rise Logic
        if (this.lava) {
            this.lava.y -= this.lava.speed;
            if (p.y + p.height > this.lava.y) {
                this.handlePlayerDamage();
            }
        }

        if (p.boostTimer > 0) p.boostTimer--;
        if (p.magnetTimer > 0) p.magnetTimer--;

        const currentSpeed = p.boostTimer > 0 ? p.speed * 1.5 : p.speed;

        if (p.isDashing) {
            p.vx = p.facing === 'right' ? currentSpeed * 2.8 : -currentSpeed * 2.8;
            p.vy = 0;
            p.dashTimer--;
            if (p.dashTimer <= 0) p.isDashing = false;
        } else {
            if (this.keys.left) {
                p.vx = -currentSpeed;
                p.facing = 'left';
            } else if (this.keys.right) {
                p.vx = currentSpeed;
                p.facing = 'right';
            } else {
                p.vx = 0;
            }
            p.vy += this.GRAVITY;
        }

        if (p.dashCooldown > 0) p.dashCooldown--;

        p.x += p.vx;
        p.y += p.vy;

        // Trail FX
        if (p.vx !== 0 || p.vy !== 0 || p.isDashing) {
            p.trail.push({
                x: p.x + p.width / 2,
                y: p.y + p.height / 2,
                alpha: 0.5,
                color: state.selectedSkin === 'electric' ? '#38bdf8' : (state.selectedSkin === 'gold' ? '#facc15' : '#ef4444')
            });
        }
        p.trail.forEach(t => t.alpha -= 0.04);
        p.trail = p.trail.filter(t => t.alpha > 0);

        p.isWallSliding = false;
        if (!p.isGrounded && p.vy > 0) {
            if (p.x <= 0 && this.keys.left) {
                p.isWallSliding = true;
                p.vy = 1.5;
            } else if (p.x + p.width >= this.canvas.width && this.keys.right) {
                p.isWallSliding = true;
                p.vy = 1.5;
            }
        }

        if (p.x < 0) p.x = 0;
        if (p.x + p.width > this.canvas.width) p.x = this.canvas.width - p.width;

        // Platforms Mechanics
        p.isGrounded = false;
        this.platforms.forEach(plat => {
            if (plat.isDestroyed) return;

            if (plat.type === 'phase') {
                plat.timer = (plat.timer || 0) + 1;
                plat.active = Math.floor(plat.timer / 80) % 2 === 0;
                if (!plat.active) return;
            }

            if (plat.type === 'moving') {
                plat.x += plat.vx;
                if (plat.x <= plat.minX || plat.x + plat.width >= plat.maxX) {
                    plat.vx *= -1;
                }
            }

            if (
                p.x < plat.x + plat.width &&
                p.x + p.width > plat.x &&
                p.y + p.height >= plat.y &&
                p.y + p.height <= plat.y + plat.height + p.vy &&
                p.vy >= 0
            ) {
                if (plat.type === 'bounce') {
                    p.vy = -13.0;
                    p.isGrounded = false;
                    p.jumpsLeft = 1;
                    this.sfx.playJump();
                    this.addParticles(p.x + p.width / 2, plat.y, '#f472b6', 10);
                    return;
                }

                p.isGrounded = true;
                p.jumpsLeft = 2;
                p.vy = 0;
                p.y = plat.y - p.height;

                if (plat.type === 'moving') p.x += plat.vx;
                if (plat.type === 'crumble') {
                    plat.isCrumbling = true;
                    this.addParticles(plat.x + plat.width / 2, plat.y, '#d97706', 2);
                }

                if (plat.type === 'ice') {
                    if (!this.keys.left && !this.keys.right) {
                        p.vx *= 0.96;
                    }
                }

                if (plat.type === 'conveyor_left') p.x -= 2.2;
                if (plat.type === 'conveyor_right') p.x += 2.2;
            }

            if (plat.isCrumbling) {
                plat.timer++;
                if (plat.timer > 50) {
                    plat.isDestroyed = true;
                    this.addParticles(plat.x + plat.width / 2, plat.y, '#451a03', 15);
                }
            }
        });

        // Enemies & Projectiles
        this.enemies.forEach(enemy => {
            if (enemy.isDefeated) return;

            if (!enemy.isRanged) {
                enemy.x += enemy.vx;
                if (enemy.x <= enemy.minX || enemy.x + enemy.width >= enemy.maxX) {
                    enemy.vx *= -1;
                }
            } else {
                enemy.shootTimer = (enemy.shootTimer || 0) + 1;
                if (enemy.shootTimer >= 100) {
                    enemy.shootTimer = 0;
                    this.projectiles.push({
                        x: enemy.x + enemy.width / 2,
                        y: enemy.y + enemy.height / 2,
                        vx: -3.2,
                        vy: 0,
                        radius: 5,
                        color: '#ef4444'
                    });
                }
            }

            if (
                p.x < enemy.x + enemy.width &&
                p.x + p.width > enemy.x &&
                p.y < enemy.y + enemy.height &&
                p.y + p.height > enemy.y
            ) {
                if (p.vy > 0 && (p.y + p.height - p.vy) <= enemy.y + 12) {
                    enemy.isDefeated = true;
                    p.vy = -10.0;
                    store.addScore(50);
                    this.sfx.playHit();
                    this.triggerShake(6, 10);
                    this.addParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#a855f7', 18);
                    this.addFloatingText(enemy.x, enemy.y, '+50', '#a855f7');
                } else {
                    this.handlePlayerDamage();
                }
            }
        });

        // Projectiles Update
        this.projectiles.forEach(pj => {
            pj.x += pj.vx;
            pj.y += pj.vy;

            const dx = (p.x + p.width / 2) - pj.x;
            const dy = (p.y + p.height / 2) - pj.y;
            if (Math.sqrt(dx * dx + dy * dy) < pj.radius + p.width / 2.5) {
                pj.hit = true;
                this.handlePlayerDamage();
            }
        });
        this.projectiles = this.projectiles.filter(pj => !pj.hit && pj.x > -20 && pj.x < this.canvas.width + 20);

        // Spring Mechanics
        this.springs.forEach(sp => {
            if (
                p.x < sp.x + sp.width &&
                p.x + p.width > sp.x &&
                p.y + p.height >= sp.y &&
                p.y + p.height <= sp.y + sp.height + p.vy
            ) {
                p.vy = -14.5;
                p.jumpsLeft = 1;
                this.sfx.playJump();
                this.addParticles(sp.x + sp.width / 2, sp.y, '#ec4899', 10);
            }
        });

        // Key Collection
        if (this.keyItem && !this.keyItem.collected) {
            if (
                p.x < this.keyItem.x + this.keyItem.width &&
                p.x + p.width > this.keyItem.x &&
                p.y < this.keyItem.y + this.keyItem.height &&
                p.y + p.height > this.keyItem.y
            ) {
                this.keyItem.collected = true;
                if (this.goal) this.goal.isLocked = false;
                store.addScore(30);
                this.sfx.playCheckpoint();
                this.addParticles(this.keyItem.x, this.keyItem.y, '#facc15', 15);
                this.addFloatingText(this.keyItem.x, this.keyItem.y, 'ปลดล็อกประตู!', '#facc15');
            }
        }

        // Power-ups Collection
        this.powerups.forEach(pw => {
            if (!pw.collected) {
                const dx = (p.x + p.width / 2) - pw.x;
                const dy = (p.y + p.height / 2) - pw.y;
                if (Math.sqrt(dx * dx + dy * dy) < pw.radius + p.width / 2) {
                    pw.collected = true;
                    if (pw.type === 'shield') p.hasShield = true;
                    if (pw.type === 'magnet') p.magnetTimer = 300;
                    if (pw.type === 'boost') p.boostTimer = 300;
                    store.addScore(25);
                    this.sfx.playCheckpoint();
                    this.addParticles(pw.x, pw.y, '#38bdf8', 12);
                    this.addFloatingText(pw.x, pw.y, `+25 ${pw.type.toUpperCase()}`, '#38bdf8');
                }
            }
        });

        // Coins & Magnet
        this.coins.forEach(coin => {
            if (!coin.collected) {
                const dx = (p.x + p.width / 2) - coin.x;
                const dy = (p.y + p.height / 2) - coin.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (p.magnetTimer > 0 && dist < 140) {
                    coin.x += (dx / dist) * -4.0;
                    coin.y += (dy / dist) * -4.0;
                }

                if (dist < coin.radius + p.width / 2) {
                    coin.collected = true;
                    store.addScore(10);
                    this.sfx.playCoin();
                    this.addParticles(coin.x, coin.y, '#facc15', 8);
                    this.addFloatingText(coin.x, coin.y, '+10', '#facc15');
                }
            }
        });

        // Spikes Collision
        this.spikes.forEach(spike => {
            if (
                p.x < spike.x + spike.width &&
                p.x + p.width > spike.x &&
                p.y < spike.y + spike.height &&
                p.y + p.height > spike.y
            ) {
                this.handlePlayerDamage();
            }
        });

        // Goal Collision
        if (
            this.goal &&
            !this.goal.isLocked &&
            p.x < this.goal.x + this.goal.width &&
            p.x + p.width > this.goal.x &&
            p.y < this.goal.y + this.goal.height &&
            p.y + p.height > this.goal.y
        ) {
            const coinsCollected = this.coins.filter(c => c.collected).length;
            const totalCoins = this.coins.length;
            const elapsedSec = Math.floor(this.levelTime / 60);

            let starCount = 1;
            if (coinsCollected === totalCoins) starCount++;
            if (elapsedSec <= this.targetTime) starCount++;

            let starsStr = '⭐';
            if (starCount === 3) starsStr = '⭐⭐⭐ (สมบูรณ์แบบ!)';
            else if (starCount === 2) starsStr = '⭐⭐';

            store.addScore(100);
            store.nextLevel();
            this.sfx.playCheckpoint();
            this.bannerText = `ผ่านด่าน ${store.getState().level - 1}! ${starsStr}`;
            this.bannerTimer = 110;
            this.resetEntities();
        }

        // Fall Off Condition
        if (p.y > this.canvas.height + 40) {
            this.handlePlayerDamage();
        }

        // Procedural Animation
        if (!p.isGrounded) {
            p.scaleX = 0.85;
            p.scaleY = 1.15;
            p.rotation = p.vx * 0.03;
        } else if (p.vx !== 0) {
            p.walkTimer += 0.25;
            p.rotation = Math.sin(p.walkTimer) * 0.15;
            p.scaleX = 1 + Math.sin(p.walkTimer) * 0.08;
            p.scaleY = 1 - Math.sin(p.walkTimer) * 0.08;
        } else {
            p.idleTimer += 0.08;
            p.rotation = 0;
            p.scaleX = 1 + Math.sin(p.idleTimer) * 0.04;
            p.scaleY = 1 - Math.sin(p.idleTimer) * 0.04;
        }

        if (this.bannerTimer > 0) this.bannerTimer--;
    }

    drawDynamicBackground() {
        const w = this.canvas.width;
        const h = this.canvas.height;

        if (this.currentTheme === 'volcano') {
            const caveGrad = this.ctx.createLinearGradient(0, 0, 0, h);
            caveGrad.addColorStop(0, '#1c1917');
            caveGrad.addColorStop(0.5, '#292524');
            caveGrad.addColorStop(1, '#451a03');
            this.ctx.fillStyle = caveGrad;
            this.ctx.fillRect(0, 0, w, h);

            const glowGrad = this.ctx.createRadialGradient(w / 2, h, 20, w / 2, h, h * 0.8);
            glowGrad.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
            glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            this.ctx.fillStyle = glowGrad;
            this.ctx.fillRect(0, 0, w, h);

        } else if (this.currentTheme === 'night') {
            const nightGrad = this.ctx.createLinearGradient(0, 0, 0, h);
            nightGrad.addColorStop(0, '#090d16');
            nightGrad.addColorStop(0.6, '#1e1b4b');
            nightGrad.addColorStop(1, '#312e81');
            this.ctx.fillStyle = nightGrad;
            this.ctx.fillRect(0, 0, w, h);

            this.ctx.fillStyle = '#e0e7ff';
            this.ctx.beginPath();
            this.ctx.arc(w * 0.82, 55, 20, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.fillStyle = '#ffffff';
            const stars = [
                { x: w * 0.1, y: 40 }, { x: w * 0.35, y: 80 }, 
                { x: w * 0.55, y: 35 }, { x: w * 0.72, y: 110 }
            ];
            stars.forEach(s => {
                this.ctx.fillRect(s.x, s.y, 2, 2);
            });

        } else {
            const skyGrad = this.ctx.createLinearGradient(0, 0, 0, h);
            skyGrad.addColorStop(0, '#0284c7');
            skyGrad.addColorStop(0.5, '#38bdf8');
            skyGrad.addColorStop(1, '#e0f2fe');
            this.ctx.fillStyle = skyGrad;
            this.ctx.fillRect(0, 0, w, h);

            const clouds = [
                { x: w * 0.12, y: 70, scale: 0.85 },
                { x: w * 0.48, y: 115, scale: 1.1 },
                { x: w * 0.78, y: 140, scale: 0.75 }
            ];

            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
            clouds.forEach(c => {
                this.ctx.beginPath();
                this.ctx.arc(c.x, c.y, 18 * c.scale, 0, Math.PI * 2);
                this.ctx.arc(c.x + 14 * c.scale, c.y - 10 * c.scale, 14 * c.scale, 0, Math.PI * 2);
                this.ctx.arc(c.x + 28 * c.scale, c.y, 16 * c.scale, 0, Math.PI * 2);
                this.ctx.arc(c.x + 14 * c.scale, c.y + 6 * c.scale, 14 * c.scale, 0, Math.PI * 2);
                this.ctx.fill();
            });
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Screen Shake Translate
        this.ctx.save();
        if (this.shakeTimer > 0) {
            const rx = (Math.random() - 0.5) * this.shakeIntensity;
            const ry = (Math.random() - 0.5) * this.shakeIntensity;
            this.ctx.translate(rx, ry);
        }

        this.drawDynamicBackground();

        // Render Particles
        this.particles.forEach(pt => {
            this.ctx.beginPath();
            this.ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
            this.ctx.fillStyle = pt.color;
            this.ctx.globalAlpha = Math.max(0, pt.alpha);
            this.ctx.fill();
            this.ctx.globalAlpha = 1.0;
        });

        // Trail FX
        const p = this.player;
        p.trail.forEach(t => {
            this.ctx.beginPath();
            this.ctx.arc(t.x, t.y, 12 * t.alpha, 0, Math.PI * 2);
            this.ctx.fillStyle = t.color;
            this.ctx.globalAlpha = Math.max(0, t.alpha);
            this.ctx.fill();
            this.ctx.globalAlpha = 1.0;
        });

        // Checkpoint Flag
        if (this.checkpoint) {
            this.ctx.fillStyle = this.checkpoint.active ? '#22c55e' : '#38bdf8';
            this.ctx.fillRect(this.checkpoint.x, this.checkpoint.y, 4, this.checkpoint.height);
            this.ctx.beginPath();
            this.ctx.moveTo(this.checkpoint.x + 4, this.checkpoint.y);
            this.ctx.lineTo(this.checkpoint.x + 20, this.checkpoint.y + 8);
            this.ctx.lineTo(this.checkpoint.x + 4, this.checkpoint.y + 16);
            this.ctx.closePath();
            this.ctx.fill();
        }

        // Render Rising Lava
        if (this.lava) {
            const lavaGrad = this.ctx.createLinearGradient(0, this.lava.y, 0, this.canvas.height);
            lavaGrad.addColorStop(0, '#f97316');
            lavaGrad.addColorStop(1, '#dc2626');
            this.ctx.fillStyle = lavaGrad;
            this.ctx.fillRect(0, this.lava.y, this.canvas.width, this.canvas.height - this.lava.y + 100);
            
            this.ctx.fillStyle = '#fef08a';
            this.ctx.fillRect(0, this.lava.y - 2, this.canvas.width, 3);
        }

        // Render Goal
        if (this.goal) {
            this.ctx.fillStyle = this.goal.isLocked ? '#64748b' : '#10b981';
            this.ctx.fillRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height);
            this.ctx.fillStyle = '#fef08a';
            this.ctx.fillRect(this.goal.x + this.goal.width - 8, this.goal.y + this.goal.height / 2 - 3, 5, 6);
            if (this.goal.isLocked) {
                this.ctx.fillStyle = '#ef4444';
                this.ctx.font = '12px sans-serif';
                this.ctx.fillText('🔒', this.goal.x + 8, this.goal.y + 24);
            }
        }

        // Render Platforms
        this.platforms.forEach(plat => {
            if (plat.isDestroyed) return;
            if (plat.type === 'phase' && !plat.active) return;

            let bodyColor = '#334155';
            let topColor = '#22c55e';

            if (plat.type === 'bounce') {
                bodyColor = '#a855f7';
                topColor = '#f472b6';
            } else if (plat.type === 'ice') {
                bodyColor = '#0284c7';
                topColor = '#bae6fd';
            } else if (plat.type === 'conveyor_left' || plat.type === 'conveyor_right') {
                bodyColor = '#475569';
                topColor = '#facc15';
            } else if (plat.type === 'phase') {
                bodyColor = '#06b6d4';
                topColor = '#67e8f9';
            } else if (this.currentTheme === 'volcano') {
                bodyColor = plat.type === 'crumble' ? '#451a03' : '#1c1917';
                topColor = plat.type === 'crumble' ? '#d97706' : '#ea580c';
            } else if (this.currentTheme === 'night') {
                bodyColor = plat.type === 'crumble' ? '#581c87' : '#0f172a';
                topColor = plat.type === 'crumble' ? '#c084fc' : '#06b6d4';
            }

            this.ctx.fillStyle = bodyColor;
            this.ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            this.ctx.fillStyle = topColor;
            this.ctx.fillRect(plat.x, plat.y, plat.width, 3);
        });

        // Render Enemies
        this.enemies.forEach(e => {
            if (e.isDefeated) return;
            this.ctx.fillStyle = e.isRanged ? '#eab308' : (this.currentTheme === 'volcano' ? '#ef4444' : '#a855f7');
            this.ctx.beginPath();
            this.ctx.arc(e.x + e.width / 2, e.y + e.height / 2, e.width / 2, Math.PI, 0, false);
            this.ctx.fillRect(e.x, e.y + e.height / 2, e.width, e.height / 2);
            this.ctx.fill();
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(e.x + 4, e.y + 6, 4, 4);
            this.ctx.fillRect(e.x + e.width - 8, e.y + 6, 4, 4);
        });

        // Render Projectiles
        this.projectiles.forEach(pj => {
            this.ctx.beginPath();
            this.ctx.arc(pj.x, pj.y, pj.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = pj.color;
            this.ctx.fill();
        });

        // Render Springs
        this.springs.forEach(sp => {
            this.ctx.fillStyle = '#ec4899';
            this.ctx.fillRect(sp.x, sp.y, sp.width, sp.height);
        });

        // Render Key Item
        if (this.keyItem && !this.keyItem.collected) {
            this.ctx.fillStyle = '#facc15';
            this.ctx.font = '18px sans-serif';
            this.ctx.fillText('🔑', this.keyItem.x, this.keyItem.y + 16);
        }

        // Render Power-up Items
        this.powerups.forEach(pw => {
            if (!pw.collected) {
                this.ctx.beginPath();
                this.ctx.arc(pw.x, pw.y, pw.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = pw.type === 'shield' ? '#38bdf8' : (pw.type === 'magnet' ? '#ec4899' : '#f97316');
                this.ctx.fill();
                this.ctx.closePath();
            }
        });

        // Render Spikes
        this.spikes.forEach(spike => {
            this.ctx.fillStyle = '#dc2626';
            const count = Math.max(1, Math.floor(spike.width / 10));
            const spikeW = spike.width / count;
            for (let i = 0; i < count; i++) {
                this.ctx.beginPath();
                this.ctx.moveTo(spike.x + i * spikeW, spike.y + spike.height);
                this.ctx.lineTo(spike.x + (i + 0.5) * spikeW, spike.y);
                this.ctx.lineTo(spike.x + (i + 1) * spikeW, spike.y + spike.height);
                this.ctx.closePath();
                this.ctx.fill();
            }
        });

        // Render Coins
        this.coins.forEach(coin => {
            if (!coin.collected) {
                this.ctx.beginPath();
                this.ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = '#facc15';
                this.ctx.fill();
                this.ctx.lineWidth = 2;
                this.ctx.strokeStyle = '#ca8a04';
                this.ctx.stroke();
                this.ctx.closePath();
            }
        });

        // Render Animated Player
        if (this.playerImg.complete && this.playerImg.naturalWidth !== 0) {
            if (p.invincibleTimer > 0 && Math.floor(p.invincibleTimer / 4) % 2 === 0) {
                // Flash when invincible
            } else {
                this.ctx.save();
                const centerX = p.x + p.width / 2;
                const centerY = p.y + p.height / 2;
                this.ctx.translate(centerX, centerY);

                if (p.facing === 'left') {
                    this.ctx.scale(-1, 1);
                }

                this.ctx.rotate(p.rotation);
                this.ctx.scale(p.scaleX, p.scaleY);

                if (p.hasShield) {
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, p.width / 1.8, 0, Math.PI * 2);
                    this.ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
                    this.ctx.fill();
                    this.ctx.strokeStyle = '#38bdf8';
                    this.ctx.lineWidth = 2;
                    this.ctx.stroke();
                }

                this.ctx.drawImage(
                    this.playerImg,
                    -p.width / 2,
                    -p.height / 2,
                    p.width,
                    p.height
                );

                this.ctx.restore();
            }
        }

        // Floating Text Render
        this.floatingTexts.forEach(ft => {
            this.ctx.font = 'bold 14px sans-serif';
            this.ctx.fillStyle = ft.color;
            this.ctx.globalAlpha = Math.max(0, ft.alpha);
            this.ctx.fillText(ft.text, ft.x, ft.y);
            this.ctx.globalAlpha = 1.0;
        });

        // Render HUD Info
        const elapsed = Math.floor(this.levelTime / 60);
        this.ctx.font = 'bold 12px sans-serif';
        this.ctx.fillStyle = elapsed > this.targetTime ? '#ef4444' : '#ffffff';
        this.ctx.fillText(`⏱️ เวลา: ${elapsed}s / ${this.targetTime}s (ดาว 3)`, 12, 20);

        if (p.hasShield) {
            this.ctx.fillStyle = '#38bdf8';
            this.ctx.fillText('🛡️ โล่ทำงาน', 12, 38);
        }

        if (this.bannerTimer > 0) {
            this.ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
            this.ctx.fillRect(0, this.canvas.height / 2 - 30, this.canvas.width, 60);
            this.ctx.fillStyle = '#facc15';
            this.ctx.font = 'bold 18px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(this.bannerText, this.canvas.width / 2, this.canvas.height / 2);
        }

        this.ctx.restore();
    }

    gameLoop() {
        this.update();
        this.render();
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new PlatformerGame();
});
