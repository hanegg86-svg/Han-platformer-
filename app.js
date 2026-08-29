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
        osc.frequency.setValueAtTime(987.77, this.ctx.currentTime);
        osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.08);
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
        
        // Extended Controls: Added down and grapple
        this.keys = { left: false, right: false, up: false, down: false, jump: false, dash: false, grapple: false };
        this.animationFrameId = null;

        // BGM Setup
        this.bgm = new Audio('bgm.mp3');
        this.bgm.loop = true;

        // Player Single Image Setup
        this.playerImg = new Image();
        this.playerImg.src = 'player.png';

        // Enemy Single Image Setup (Metal Leafy)
        this.enemyImg = new Image();
        this.enemyImg.src = 'enemy.png';

        // Physics Constants
        this.GRAVITY = 0.32;
        
        // Game Entities
        this.player = null;
        this.levelWidth = 1200;
        this.platforms = [];
        this.coins = [];
        this.spikes = [];
        this.springs = [];
        this.powerups = [];
        this.enemies = [];
        this.boss = null;
        this.projectiles = [];
        this.grappleNodes = [];
        this.checkpoint = null;
        this.spawnPoint = { x: 50, y: 0 };
        this.lava = null;
        this.keyItem = null;
        this.goal = null;

        // Camera System (Horizontal)
        this.cameraX = 0;

        // Visual Polish & Juice System
        this.particles = [];
        this.weatherParticles = [];
        this.floatingTexts = [];
        this.shakeTimer = 0;
        this.shakeIntensity = 0;
        this.hitFreezeTimer = 0;

        // Combo Multiplier System
        this.comboCount = 0;
        this.comboTimer = 0;

        // Dynamic BGM & Danger Warning State
        this.isLavaNear = false;

        // Visual Theme State ('sky', 'volcano', 'night')
        this.currentTheme = 'sky';

        // Timers, Banners & Game Clear
        this.levelTime = 0;
        this.targetTime = 15;
        this.bannerTimer = 0;
        this.bannerText = '';
        this.isGameCleared = false;

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
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5 - 2,
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
        if (level > 40) return null;

        let theme = 'sky';
        if (level >= 11 && level <= 25) theme = 'volcano';
        if (level >= 26) theme = 'night';

        const lavaSpeed = Math.min(1.8, 0.4 + (level - 1) * 0.035);
        const targetTime = Math.max(15, 30 - Math.floor((level - 1) / 3));

        const allowedTypes = ['normal'];
        if (level >= 2) allowedTypes.push('bounce');
        if (level >= 5) allowedTypes.push('ice');
        if (level >= 10) allowedTypes.push('crumble');
        if (level >= 15) allowedTypes.push('conveyor_right', 'conveyor_left');
        if (level >= 22) allowedTypes.push('phase');
        if (level >= 28) allowedTypes.push('moving');

        const isBossLevel = (level % 10 === 0);
        const levelWidth = Math.min(4500, Math.floor(w * (3.0 + level * 0.25)));

        const platforms = [];
        const coins = [];
        const spikes = [];
        const enemies = [];
        const powerups = [];
        const grappleNodes = [];
        let boss = null;

        // Ground generation with clean layout & guaranteed jump gaps
        let currX = 0;
        platforms.push({ x: 0, y: h - 30, width: 300, height: 30, type: 'normal' });
        currX = 300;

        let platformId = 0;
        while (currX < levelWidth - 300) {
            platformId++;
            const seed = Math.abs(Math.sin(level * 12.9898 + platformId * 78.233));
            
            // Guaranteed jumpable gap width (Max 110px)
            const gapWidth = isBossLevel ? 0 : Math.min(110, 50 + Math.floor(seed * 45) + Math.min(level, 15));
            currX += gapWidth;

            const platWidth = isBossLevel ? 800 : Math.max(140, 240 - level * 2 + Math.floor(seed * 60));
            const platY = h - 30;

            let pType = 'normal';
            if (platformId > 1 && !isBossLevel) {
                const typeIdx = Math.floor(seed * allowedTypes.length);
                pType = allowedTypes[typeIdx] || 'normal';
            }

            const platObj = {
                x: currX,
                y: platY,
                width: platWidth,
                height: 30,
                type: pType
            };

            if (pType === 'phase') {
                platObj.timer = (platformId * 25) % 80;
                platObj.active = (platformId % 2 === 0);
            } else if (pType === 'crumble') {
                platObj.timer = 0;
                platObj.isCrumbling = false;
                platObj.isDestroyed = false;
                platObj.respawnTimer = 0;
            } else if (pType === 'moving') {
                platObj.vx = (platformId % 2 === 0 ? 1 : -1) * (0.8 + (level * 0.02));
                platObj.minX = Math.max(0, currX - 50);
                platObj.maxX = Math.min(levelWidth, currX + platWidth + 50);
            }

            platforms.push(platObj);

            // Clean upper floating platform with strictly controlled clearance (at least 85px gap)
            let hasUpperPlat = false;
            let floatY = 0;
            let floatWidth = 0;
            if (seed > 0.5 && !isBossLevel && platWidth >= 160) {
                hasUpperPlat = true;
                floatWidth = Math.max(90, platWidth * 0.55);
                floatY = platY - 85 - Math.floor(seed * 25);
                platforms.push({
                    x: currX + (platWidth - floatWidth) / 2,
                    y: floatY,
                    width: floatWidth,
                    height: 16,
                    type: 'normal'
                });

                coins.push({
                    x: currX + platWidth / 2,
                    y: floatY - 22,
                    radius: 8,
                    collected: false
                });
            }

            // Grapple Node over gaps
            if (gapWidth > 85 && level >= 3 && !isBossLevel) {
                grappleNodes.push({
                    x: currX - gapWidth / 2,
                    y: platY - 110,
                    radius: 12
                });
            }

            // Ground coins
            if (platformId % 2 === 0 && !hasUpperPlat) {
                coins.push({
                    x: currX + platWidth / 2,
                    y: platY - 22,
                    radius: 8,
                    collected: false
                });
            }

            // Spikes (Only on standard normal ground platforms, away from edges)
            let hasSpike = false;
            if (level >= 3 && seed > 0.65 && !isBossLevel && pType === 'normal' && platWidth >= 180) {
                hasSpike = true;
                const spikeW = Math.min(48, platWidth * 0.25);
                spikes.push({
                    x: currX + platWidth * 0.38,
                    y: platY - 14,
                    width: spikeW,
                    height: 14
                });
            }

            // Enemies patrol (Only if no spikes in same position and platform is wide)
            if (level >= 2 && seed > 0.52 && !isBossLevel && pType === 'normal' && platWidth >= 150 && !hasSpike) {
                const isRanged = (level >= 12 && platformId % 4 === 0);
                enemies.push({
                    x: currX + 15,
                    y: platY - 28,
                    width: 32,
                    height: 28,
                    vx: isRanged ? 0 : (0.75 + level * 0.018),
                    minX: currX,
                    maxX: currX + platWidth - 32,
                    isDefeated: false,
                    isRanged: isRanged,
                    shootTimer: 0
                });
            }

            currX += platWidth;
        }

        // Safe end goal area
        platforms.push({ x: levelWidth - 300, y: h - 30, width: 300, height: 30, type: 'normal' });

        // Boss Setup
        if (isBossLevel) {
            const bossHp = Math.min(3 + Math.floor(level / 10) * 2, 9);
            const bossX = levelWidth / 2;
            boss = {
                x: bossX,
                y: h - 80,
                width: 50,
                height: 45,
                hp: bossHp,
                maxHp: bossHp,
                vx: 1.3 + (level * 0.015),
                minX: bossX - 180,
                maxX: bossX + 180,
                shootTimer: 0,
                isDefeated: false
            };
        }

        // Powerups Placement
        if (level % 2 === 0 || level > 25) {
            const pType = level % 3 === 0 ? 'shield' : (level % 3 === 1 ? 'magnet' : 'boost');
            powerups.push({
                x: levelWidth * 0.35,
                y: h - 80,
                type: pType,
                collected: false,
                radius: 10
            });
        }

        // Checkpoint Setup (Middle of level)
        let checkpoint = null;
        if (level >= 4 && !isBossLevel) {
            checkpoint = {
                x: levelWidth * 0.45,
                y: h - 60,
                width: 18,
                height: 30,
                active: false
            };
        }

        // Key Item Setup (Mid-Late level)
        const keyItem = {
            x: levelWidth * 0.65,
            y: h - 80,
            width: 20,
            height: 20,
            collected: false
        };

        // Goal Portal Setup (End of level far right)
        const goal = {
            x: levelWidth - 80,
            y: h - 70,
            width: 30,
            height: 40,
            isLocked: true
        };

        return {
            theme,
            targetTime,
            lavaSpeed,
            levelWidth,
            checkpoint,
            platforms,
            grappleNodes,
            coins,
            spikes,
            springs: [],
            enemies,
            boss,
            powerups,
            keyItem,
            goal
        };
    }

    resetEntities() {
        this.resizeCanvas();
        const w = this.canvas.width || 360;
        const h = this.canvas.height || 400;

        this.levelTime = 0;
        this.cameraX = 0;
        this.particles = [];
        this.weatherParticles = [];
        this.floatingTexts = [];
        this.projectiles = [];
        this.comboCount = 0;
        this.comboTimer = 0;

        for (let i = 0; i < 20; i++) {
            this.weatherParticles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.8,
                vy: Math.random() * 0.6 + 0.2,
                size: Math.random() * 2.5 + 1,
                alpha: Math.random() * 0.6 + 0.2
            });
        }

        const currentLevel = store.getState().level;

        if (currentLevel > 40) {
            this.isGameCleared = true;
            this.bannerText = '🎉 ยินดีด้วย! คุณพิชิตครบทั้ง 40 ด่านสำเร็จ!';
            this.bannerTimer = 999999;
            return;
        }

        this.isGameCleared = false;
        const levelData = this.getLevelData(currentLevel, w, h);

        this.levelWidth = levelData.levelWidth;
        this.spawnPoint = { x: 50, y: h - 100 };

        const state = store.getState();
        const dashCooldownBase = Math.max(15, 30 - (state.upgrades?.dashLevel || 0) * 4);

        this.player = {
            x: this.spawnPoint.x,
            y: this.spawnPoint.y,
            width: 36,
            height: 36,
            vx: 0,
            vy: 0,
            speed: 4.0,
            jumpPower: -6.8,
            isGrounded: false,
            color: '#ef4444',
            
            // Lives System
            lives: 3,
            maxLives: 3,

            jumpsLeft: 2,
            isDashing: false,
            dashTimer: 0,
            dashCooldown: 0,
            maxDashCooldown: dashCooldownBase,
            dashDirX: 1,
            dashDirY: 0,

            // Mechanics States
            isGroundPounding: false,
            isGrappling: false,
            grappleNode: null,
            grappleLength: 0,

            isWallSliding: false,
            coyoteTimer: 0,
            jumpBufferTimer: 0,

            hasShield: true,
            invincibleTimer: 0,
            magnetTimer: 0,
            magnetRadius: 140 + (state.upgrades?.magnetLevel || 0) * 30,
            boostTimer: 0,

            trail: [],

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
        this.grappleNodes = levelData.grappleNodes || [];
        this.coins = levelData.coins;
        this.spikes = levelData.spikes;
        this.springs = levelData.springs;
        this.enemies = levelData.enemies;
        this.boss = levelData.boss;
        this.powerups = levelData.powerups;
        this.keyItem = levelData.keyItem;
        this.goal = levelData.goal;

        // Lava Chaser Wall
        this.lava = {
            x: -250,
            speed: levelData.lavaSpeed
        };
    }

    respawnAtCheckpoint() {
        const p = this.player;
        p.x = this.spawnPoint.x;
        p.y = this.spawnPoint.y;
        p.vx = 0;
        p.vy = -5.5;
        p.isGroundPounding = false;
        p.isGrappling = false;
        p.invincibleTimer = 75;
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
        bindBtn('btn-grapple', 'grapple', () => this.handleGrappleToggle());
    }

    setupKeyboardControls() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = true;
            if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = true;
            if (e.key === 'ArrowUp' || e.key === 'w') this.keys.up = true;
            if (e.key === 'ArrowDown' || e.key === 's') {
                this.keys.down = true;
                this.handleGroundPoundTrigger();
            }
            if (e.key === ' ') {
                if (!this.keys.jump) this.handleJumpTrigger();
                this.keys.jump = true;
            }
            if (e.key === 'Shift' || e.key === 'k') this.handleDashTrigger();
            if (e.key === 'e' || e.key === 'E') this.handleGrappleToggle();
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = false;
            if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = false;
            if (e.key === 'ArrowUp' || e.key === 'w') this.keys.up = false;
            if (e.key === 'ArrowDown' || e.key === 's') this.keys.down = false;
            if (e.key === ' ') this.keys.jump = false;
        });
    }

    tryExecuteJump() {
        const p = this.player;
        if (!p) return false;

        if (p.isGrappling) {
            p.isGrappling = false;
            p.vy = p.jumpPower * 1.1;
            this.sfx.playJump();
            return true;
        }

        if (p.isGrounded || p.coyoteTimer > 0) {
            p.vy = p.jumpPower;
            p.isGrounded = false;
            p.coyoteTimer = 0;
            p.jumpBufferTimer = 0;
            p.jumpsLeft = 1;
            this.sfx.playJump();
            this.addParticles(p.x + p.width / 2, p.y + p.height, '#ffffff', 8);
            return true;
        } else if (p.isWallSliding) {
            p.vy = p.jumpPower;
            p.vx = p.facing === 'left' ? p.speed : -p.speed;
            p.isWallSliding = false;
            p.jumpBufferTimer = 0;
            this.sfx.playJump();
            return true;
        } else if (p.jumpsLeft > 0) {
            p.vy = p.jumpPower * 0.9;
            p.jumpsLeft--;
            p.jumpBufferTimer = 0;
            this.sfx.playJump();
            this.addParticles(p.x + p.width / 2, p.y + p.height / 2, '#38bdf8', 10);
            return true;
        }
        return false;
    }

    handleJumpTrigger() {
        if (this.isGameCleared) return;
        this.player.jumpBufferTimer = 8;
        this.tryExecuteJump();
    }

    handleGroundPoundTrigger() {
        const p = this.player;
        if (!p || p.isGrounded || p.isGroundPounding) return;
        p.isGroundPounding = true;
        p.isDashing = false;
        p.isGrappling = false;
        p.vx = 0;
        p.vy = 12.0;
        this.sfx.playDash();
        this.addParticles(p.x + p.width / 2, p.y, '#ef4444', 12);
        this.addFloatingText(p.x - 10, p.y - 15, '💥 GROUND POUND!', '#ef4444');
    }

    handleGrappleToggle() {
        const p = this.player;
        if (!p) return;

        if (p.isGrappling) {
            p.isGrappling = false;
            return;
        }

        // Find nearest Grapple Node in Range
        let closest = null;
        let minDist = 180;
        const px = p.x + p.width / 2;
        const py = p.y + p.height / 2;

        this.grappleNodes.forEach(node => {
            const dist = Math.hypot(node.x - px, node.y - py);
            if (dist < minDist) {
                minDist = dist;
                closest = node;
            }
        });

        if (closest) {
            p.isGrappling = true;
            p.grappleNode = closest;
            p.grappleLength = minDist;
            this.sfx.playCheckpoint();
            this.addParticles(closest.x, closest.y, '#38bdf8', 10);
        }
    }

    handleDashTrigger() {
        if (this.isGameCleared) return;
        const p = this.player;
        if (p.dashCooldown <= 0 && !p.isDashing) {
            let dx = 0;
            let dy = 0;

            if (this.keys.left) dx -= 1;
            if (this.keys.right) dx += 1;
            if (this.keys.up) dy -= 1;
            if (this.keys.down) dy += 1;

            if (dx === 0 && dy === 0) {
                dx = p.facing === 'right' ? 1 : -1;
            }

            const len = Math.hypot(dx, dy);
            p.dashDirX = dx / len;
            p.dashDirY = dy / len;

            p.isDashing = true;
            p.isGroundPounding = false;
            p.dashTimer = 10;
            p.dashCooldown = p.maxDashCooldown || 30;

            this.sfx.playDash();
            this.triggerShake(5, 8);
            this.addParticles(p.x + p.width / 2, p.y + p.height / 2, '#facc15', 14);
        }
    }

    handleTabChange(tab) {
        if (tab !== 'game') {
            this.keys.left = false;
            this.keys.right = false;
            this.keys.up = false;
            this.keys.down = false;
            this.keys.jump = false;
            this.keys.dash = false;
            this.keys.grapple = false;
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
        if (this.isGameCleared) return;
        const p = this.player;
        if (p.invincibleTimer > 0) return;

        this.comboCount = 0;
        this.comboTimer = 0;

        if (p.hasShield) {
            p.hasShield = false;
            p.vy = -7;
            p.invincibleTimer = 50;
            this.sfx.playHit();
            this.triggerShake(8, 12);
            this.addParticles(p.x + p.width / 2, p.y + p.height / 2, '#38bdf8', 16);
            this.addFloatingText(p.x - 10, p.y - 15, '🛡️ เกราะแตก!', '#38bdf8');
        } else {
            p.lives--;
            this.sfx.playHit();
            this.triggerShake(12, 18);

            if (p.lives > 0) {
                this.addFloatingText(p.x - 10, p.y - 15, `💔 เสีย 1 ชีวิต! (เหลือ ${p.lives})`, '#ef4444');
                this.respawnAtCheckpoint();
            } else if (!store.getState().isGameOver) {
                this.addFloatingText(p.x - 10, p.y - 15, '💀 ชีวิตหมดแล้ว!', '#ef4444');
                store.setGameOver(true);
            }
        }
    }

    update() {
        const state = store.getState();
        if (state.isGameOver || state.activeTab !== 'game' || this.isGameCleared) return;

        if (this.hitFreezeTimer > 0) {
            this.hitFreezeTimer--;
            return;
        }

        const p = this.player;
        this.levelTime++;

        // Smooth Horizontal Camera Tracking (Lerp X-Axis)
        const targetCamX = Math.max(0, p.x - this.canvas.width * 0.3);
        this.cameraX += (targetCamX - this.cameraX) * 0.1;

        // Lava Wall Chaser Alert
        if (this.lava) {
            const lavaDist = p.x - this.lava.x;
            if (lavaDist < 180) {
                if (this.bgm) this.bgm.playbackRate = 1.25;
                this.isLavaNear = true;
            } else {
                if (this.bgm) this.bgm.playbackRate = 1.0;
                this.isLavaNear = false;
            }
        }

        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer <= 0) this.comboCount = 0;
        }

        if (p.invincibleTimer > 0) p.invincibleTimer--;
        if (this.shakeTimer > 0) this.shakeTimer--;

        if (p.jumpBufferTimer > 0) {
            if (this.tryExecuteJump()) {
                p.jumpBufferTimer = 0;
            } else {
                p.jumpBufferTimer--;
            }
        }

        if (p.isGrounded) {
            p.coyoteTimer = 8;
        } else if (p.coyoteTimer > 0) {
            p.coyoteTimer--;
        }

        // Weather Particles
        this.weatherParticles.forEach(wp => {
            if (this.currentTheme === 'volcano') {
                wp.y -= wp.vy * 1.5;
                wp.x += wp.vx;
                if (wp.y < 0) wp.y = this.canvas.height;
            } else {
                wp.y += wp.vy;
                wp.x += wp.vx;
                if (wp.y > this.canvas.height) wp.y = 0;
            }
        });

        // Particles
        this.particles.forEach(pt => {
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.alpha -= 0.03;
            pt.life--;
        });
        this.particles = this.particles.filter(pt => pt.life > 0 && pt.alpha > 0);

        // Floating Text
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

        // Lava Wall Horizontal Movement & Catch Up
        if (this.lava) {
            this.lava.x += this.lava.speed;
            if (p.x < this.lava.x) {
                this.handlePlayerDamage();
            }
        }

        if (p.boostTimer > 0) p.boostTimer--;
        if (p.magnetTimer > 0) p.magnetTimer--;

        const currentSpeed = p.boostTimer > 0 ? p.speed * 1.5 : p.speed;

        // Grappling Hook Physics
        if (p.isGrappling && p.grappleNode) {
            const gx = p.grappleNode.x;
            const gy = p.grappleNode.y;
            const px = p.x + p.width / 2;
            const py = p.y + p.height / 2;

            const dx = px - gx;
            const dy = py - gy;
            const currentDist = Math.hypot(dx, dy);

            p.vy += this.GRAVITY;

            if (currentDist > p.grappleLength) {
                const angle = Math.atan2(dy, dx);
                p.x = gx + Math.cos(angle) * p.grappleLength - p.width / 2;
                p.y = gy + Math.sin(angle) * p.grappleLength - p.height / 2;

                const tension = 0.12;
                p.vx -= Math.cos(angle) * tension;
            }

            if (this.keys.left) p.vx -= 0.15;
            if (this.keys.right) p.vx += 0.15;
        }
        else if (p.isGroundPounding) {
            p.vx = 0;
            p.vy = 14.0;
        } else if (p.isDashing) {
            p.vx = p.dashDirX * currentSpeed * 2.5;
            p.vy = p.dashDirY * currentSpeed * 2.5;
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
        if (p.vx !== 0 || p.vy !== 0 || p.isDashing || p.isGroundPounding) {
            p.trail.push({
                x: p.x + p.width / 2,
                y: p.y + p.height / 2,
                alpha: 0.6,
                color: p.isGroundPounding ? '#ef4444' : (state.selectedSkin === 'electric' ? '#38bdf8' : (state.selectedSkin === 'gold' ? '#facc15' : '#ef4444'))
            });
        }
        p.trail.forEach(t => t.alpha -= 0.05);
        p.trail = p.trail.filter(t => t.alpha > 0);

        if (p.x < 0) p.x = 0;

        // Platform Mechanics & Collision
        p.isGrounded = false;
        this.platforms.forEach(plat => {
            if (plat.isDestroyed) {
                if (plat.type === 'crumble') {
                    plat.respawnTimer = (plat.respawnTimer || 180) - 1;
                    if (plat.respawnTimer <= 0) {
                        plat.isDestroyed = false;
                        plat.isCrumbling = false;
                        plat.timer = 0;
                        this.addParticles(plat.x + plat.width / 2, plat.y, '#f59e0b', 12);
                    }
                }
                return;
            }

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
                if (p.isGroundPounding) {
                    p.isGroundPounding = false;
                    this.triggerShake(14, 18);
                    this.sfx.playHit();
                    this.addParticles(p.x + p.width / 2, plat.y, '#ef4444', 25);
                    this.addFloatingText(p.x - 20, plat.y - 20, 'SHOCKWAVE!', '#ef4444');

                    this.enemies.forEach(enemy => {
                        if (!enemy.isDefeated && Math.abs((enemy.x + enemy.width / 2) - (p.x + p.width / 2)) < 110) {
                            enemy.isDefeated = true;
                            store.addScore(75);
                            this.addParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#a855f7', 15);
                        }
                    });
                }

                if (plat.type === 'bounce') {
                    p.vy = -11.5;
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

                if (plat.type === 'conveyor_left') p.x -= 1.8;
                if (plat.type === 'conveyor_right') p.x += 1.8;
            }

            if (plat.isCrumbling) {
                plat.timer++;
                if (plat.timer > 50) {
                    plat.isDestroyed = true;
                    plat.respawnTimer = 180;
                    this.addParticles(plat.x + plat.width / 2, plat.y, '#451a03', 15);
                }
            }
        });

        // BOSS Combat
        if (this.boss && !this.boss.isDefeated) {
            const b = this.boss;
            b.x += b.vx;
            if (b.x <= b.minX || b.x + b.width >= b.maxX) {
                b.vx *= -1;
            }

            b.shootTimer++;
            if (b.shootTimer >= 70) {
                b.shootTimer = 0;
                this.projectiles.push({
                    x: b.x + b.width / 2,
                    y: b.y + b.height / 2,
                    vx: (p.x < b.x) ? -2.6 : 2.6,
                    vy: -1.0,
                    radius: 7,
                    color: '#f97316',
                    isParried: false
                });
            }

            if (
                p.x < b.x + b.width &&
                p.x + p.width > b.x &&
                p.y < b.y + b.height &&
                p.y + p.height > b.y
            ) {
                if (p.vy > 0 && (p.y + p.height - p.vy) <= b.y + 16) {
                    b.hp--;
                    p.vy = -9.0;
                    this.sfx.playHit();
                    this.triggerShake(12, 16);
                    this.hitFreezeTimer = 6;
                    this.addParticles(b.x + b.width / 2, b.y + b.height / 2, '#ef4444', 22);

                    if (b.hp <= 0) {
                        b.isDefeated = true;
                        store.addScore(300);
                        this.addFloatingText(b.x, b.y, '🏆 บอสพ่ายแพ้! +300', '#facc15');
                        if (this.keyItem) {
                            this.keyItem.x = b.x + b.width / 2 - 10;
                            this.keyItem.y = b.y;
                        }
                    } else {
                        this.addFloatingText(b.x, b.y, `BOSS HP: ${b.hp}/${b.maxHp}`, '#ef4444');
                    }
                } else {
                    this.handlePlayerDamage();
                }
            }
        }

        // Enemies & Projectiles Logic
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
                        vx: -2.5,
                        vy: 0,
                        radius: 5,
                        color: '#ef4444',
                        isParried: false
                    });
                }
            }

            const isPlayerBelowPlatform = (p.y + p.height) > (enemy.y + enemy.height + 4);
            if (
                !isPlayerBelowPlatform &&
                p.x < enemy.x + enemy.width &&
                p.x + p.width > enemy.x &&
                p.y < enemy.y + enemy.height &&
                p.y + p.height > enemy.y
            ) {
                if (p.vy > 0 && (p.y + p.height - p.vy) <= enemy.y + 12) {
                    enemy.isDefeated = true;
                    p.vy = -8.5;
                    store.addScore(50);
                    this.sfx.playHit();
                    this.triggerShake(10, 14);
                    this.hitFreezeTimer = 4;
                    this.addParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#a855f7', 18);
                    this.addFloatingText(enemy.x, enemy.y, '+50', '#a855f7');
                } else {
                    this.handlePlayerDamage();
                }
            }
        });

        // Projectiles Collision & PARRY Check
        this.projectiles.forEach(pj => {
            pj.x += pj.vx;
            pj.y += pj.vy;

            const dx = (p.x + p.width / 2) - pj.x;
            const dy = (p.y + p.height / 2) - pj.y;
            const dist = Math.hypot(dx, dy);

            if (p.isDashing && p.dashTimer > 5 && dist < pj.radius + p.width / 1.8 && !pj.isParried) {
                pj.isParried = true;
                pj.vx *= -1.8;
                pj.vy *= -1.8;
                pj.color = '#38bdf8';
                this.sfx.playCheckpoint();
                this.triggerShake(8, 10);
                this.addParticles(pj.x, pj.y, '#38bdf8', 16);
                this.addFloatingText(pj.x, pj.y - 15, '🛡️ PARRY!', '#38bdf8');
                return;
            }

            if (!pj.isParried && dist < pj.radius + p.width / 2.5) {
                pj.hit = true;
                this.handlePlayerDamage();
            }
        });
        this.projectiles = this.projectiles.filter(pj => !pj.hit && pj.x > this.cameraX - 50 && pj.x < this.cameraX + this.canvas.width + 50);

        // Key Collection
        if (this.keyItem && !this.keyItem.collected) {
            if (
                (p.y + p.height) <= (this.keyItem.y + this.keyItem.height + 8) &&
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

        // Power-ups
        this.powerups.forEach(pw => {
            if (!pw.collected) {
                const dx = (p.x + p.width / 2) - pw.x;
                const dy = (p.y + p.height / 2) - pw.y;
                if (Math.hypot(dx, dy) < pw.radius + p.width / 2) {
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

        // Coins Collection
        const magnetDist = (p.magnetTimer > 0) ? (p.magnetRadius || 200) : 0;
        this.coins.forEach(coin => {
            if (!coin.collected) {
                const dx = (p.x + p.width / 2) - coin.x;
                const dy = (p.y + p.height / 2) - coin.y;
                const dist = Math.hypot(dx, dy);

                if (magnetDist > 0 && dist < magnetDist) {
                    coin.x += (dx / dist) * -3.8;
                    coin.y += (dy / dist) * -3.8;
                }

                if (dist < coin.radius + p.width / 2) {
                    coin.collected = true;
                    this.comboCount++;
                    this.comboTimer = 180;

                    const multiplier = Math.min(5, 1 + Math.floor(this.comboCount / 3));
                    const basePoints = 10;
                    const earned = basePoints * multiplier;

                    store.addScore(earned);
                    this.sfx.playCoin();
                    this.addParticles(coin.x, coin.y, '#facc15', 8);

                    const comboText = multiplier > 1 ? `+${earned} (x${multiplier}!)` : `+${earned}`;
                    this.addFloatingText(coin.x, coin.y, comboText, multiplier > 1 ? '#f59e0b' : '#facc15');
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

        // Goal Collision (Level End Portal)
        if (
            this.goal &&
            !this.goal.isLocked &&
            (p.y + p.height) <= (this.goal.y + this.goal.height + 6) &&
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

        // Pitfall Condition (Fell into gap)
        if (p.y > this.canvas.height + 40) {
            this.handlePlayerDamage();
        }

        // Procedural Animation
        if (!p.isGrounded) {
            p.scaleX = 0.85;
            p.scaleY = 1.15;
            p.rotation = p.vx * 0.03;
        } else if (p.vx !== 0) {
            p.walkTimer += 0.22;
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
        const time = this.levelTime * 0.02;
        const parallaxX = this.cameraX * 0.2;

        if (this.currentTheme === 'volcano') {
            const caveGrad = this.ctx.createLinearGradient(0, 0, 0, h);
            caveGrad.addColorStop(0, '#0f0d13');
            caveGrad.addColorStop(0.5, '#1c1921');
            caveGrad.addColorStop(1, '#3b1206');
            this.ctx.fillStyle = caveGrad;
            this.ctx.fillRect(0, 0, w, h);

            this.ctx.fillStyle = 'rgba(69, 26, 3, 0.45)';
            this.ctx.beginPath();
            this.ctx.moveTo(0, h);
            for (let x = 0; x <= w; x += 20) {
                const worldX = x + parallaxX;
                const y = h - 120 - Math.sin(worldX * 0.01) * 40 - Math.cos(worldX * 0.02) * 20;
                this.ctx.lineTo(x, y);
            }
            this.ctx.lineTo(w, h);
            this.ctx.fill();

            this.weatherParticles.forEach(wp => {
                this.ctx.fillStyle = `rgba(249, 115, 22, ${wp.alpha})`;
                this.ctx.beginPath();
                this.ctx.arc(wp.x, wp.y, wp.size, 0, Math.PI * 2);
                this.ctx.fill();
            });

        } else if (this.currentTheme === 'night') {
            const nightGrad = this.ctx.createLinearGradient(0, 0, 0, h);
            nightGrad.addColorStop(0, '#030712');
            nightGrad.addColorStop(0.6, '#0f172a');
            nightGrad.addColorStop(1, '#1e1b4b');
            this.ctx.fillStyle = nightGrad;
            this.ctx.fillRect(0, 0, w, h);

            const moonX = w * 0.82;
            const moonY = 65;
            this.ctx.fillStyle = '#f8fafc';
            this.ctx.beginPath();
            this.ctx.arc(moonX, moonY, 22, 0, Math.PI * 2);
            this.ctx.fill();

            this.weatherParticles.forEach(wp => {
                this.ctx.fillStyle = `rgba(224, 231, 255, ${wp.alpha * (Math.sin(time * 2 + wp.x) * 0.3 + 0.7)})`;
                this.ctx.beginPath();
                this.ctx.arc(wp.x, wp.y, wp.size, 0, Math.PI * 2);
                this.ctx.fill();
            });

            this.ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
            this.ctx.beginPath();
            this.ctx.moveTo(0, h);
            for (let x = 0; x <= w; x += 15) {
                const worldX = x + parallaxX;
                const y = h - 100 - Math.sin(worldX * 0.015 + 1) * 35;
                this.ctx.lineTo(x, y);
            }
            this.ctx.lineTo(w, h);
            this.ctx.fill();

        } else {
            const skyGrad = this.ctx.createLinearGradient(0, 0, 0, h);
            skyGrad.addColorStop(0, '#0284c7');
            skyGrad.addColorStop(0.5, '#38bdf8');
            skyGrad.addColorStop(1, '#bae6fd');
            this.ctx.fillStyle = skyGrad;
            this.ctx.fillRect(0, 0, w, h);

            const clouds = [
                { x: (w * 0.12 + time * 15 - parallaxX) % (w + 200) - 100, y: 70, scale: 0.85 },
                { x: (w * 0.48 + time * 10 - parallaxX) % (w + 220) - 110, y: 115, scale: 1.1 },
                { x: (w * 0.78 + time * 20 - parallaxX) % (w + 180) - 90, y: 140, scale: 0.75 }
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

        // 1. Draw Fixed Background
        this.drawDynamicBackground();

        if (this.isGameCleared) {
            this.ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#facc15';
            this.ctx.font = 'bold 20px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('🏆 GAME CLEAR! 🏆', this.canvas.width / 2, this.canvas.height / 2 - 20);
            this.ctx.font = '14px sans-serif';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText('คุณพิชิตครบทั้ง 40 ด่านสำเร็จ!', this.canvas.width / 2, this.canvas.height / 2 + 20);
            return;
        }

        // 2. Apply Camera & Screen Shake (Horizontal Offset)
        this.ctx.save();

        if (this.shakeTimer > 0) {
            const rx = (Math.random() - 0.5) * this.shakeIntensity;
            const ry = (Math.random() - 0.5) * this.shakeIntensity;
            this.ctx.translate(rx, ry);
        }

        this.ctx.translate(-this.cameraX, 0);

        // Render Grapple Nodes
        this.grappleNodes.forEach(node => {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = '#38bdf8';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#38bdf8';
            this.ctx.fill();
            this.ctx.restore();
        });

        const p = this.player;
        if (p.isGrappling && p.grappleNode) {
            this.ctx.save();
            this.ctx.strokeStyle = '#38bdf8';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(p.x + p.width / 2, p.y + p.height / 2);
            this.ctx.lineTo(p.grappleNode.x, p.grappleNode.y);
            this.ctx.stroke();
            this.ctx.restore();
        }

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

        // Render Lava Chaser Wall (Vertical wall coming from left)
        if (this.lava) {
            this.ctx.save();
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = '#f97316';

            const lavaGrad = this.ctx.createLinearGradient(this.lava.x - 300, 0, this.lava.x, 0);
            lavaGrad.addColorStop(0, '#991b1b');
            lavaGrad.addColorStop(0.7, '#ea580c');
            lavaGrad.addColorStop(1, '#f97316');
            this.ctx.fillStyle = lavaGrad;

            this.ctx.beginPath();
            this.ctx.moveTo(this.lava.x - 500, 0);

            for (let y = 0; y <= this.canvas.height; y += 10) {
                const waveX = this.lava.x + Math.sin((y + this.levelTime * 4) * 0.04) * 6;
                this.ctx.lineTo(waveX, y);
            }
            this.ctx.lineTo(this.lava.x - 500, this.canvas.height);
            this.ctx.closePath();
            this.ctx.fill();

            this.ctx.strokeStyle = '#fef08a';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            this.ctx.restore();
        }

        // Render Goal Portal
        if (this.goal) {
            this.ctx.save();
            const isLocked = this.goal.isLocked;

            this.ctx.shadowBlur = 18;
            this.ctx.shadowColor = isLocked ? '#ef4444' : '#10b981';

            this.ctx.fillStyle = isLocked ? '#334155' : '#065f46';
            this.ctx.strokeStyle = isLocked ? '#ef4444' : '#34d399';
            this.ctx.lineWidth = 3;

            if (this.ctx.roundRect) {
                this.ctx.beginPath();
                this.ctx.roundRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height, [12, 12, 2, 2]);
                this.ctx.fill();
                this.ctx.stroke();
            } else {
                this.ctx.fillRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height);
                this.ctx.strokeRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height);
            }

            if (!isLocked) {
                const centerX = this.goal.x + this.goal.width / 2;
                const centerY = this.goal.y + this.goal.height / 2;
                const portalGrad = this.ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, 15);
                portalGrad.addColorStop(0, '#fef08a');
                portalGrad.addColorStop(0.5, '#10b981');
                portalGrad.addColorStop(1, '#022c22');
                this.ctx.fillStyle = portalGrad;
                this.ctx.fillRect(this.goal.x + 4, this.goal.y + 4, this.goal.width - 8, this.goal.height - 8);
            } else {
                this.ctx.fillStyle = '#ef4444';
                this.ctx.font = 'bold 14px sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('🔒', this.goal.x + this.goal.width / 2, this.goal.y + this.goal.height / 2 + 5);
            }

            this.ctx.restore();
        }

        // Render Platforms
        this.platforms.forEach(plat => {
            if (plat.isDestroyed) return;
            if (plat.type === 'phase' && !plat.active) return;

            this.ctx.save();
            let bodyGrad, topColor;

            if (plat.type === 'bounce') {
                bodyGrad = '#7e22ce';
                topColor = '#f472b6';
                this.ctx.shadowBlur = 8;
                this.ctx.shadowColor = '#f472b6';
            } else if (plat.type === 'ice') {
                bodyGrad = '#0284c7';
                topColor = '#bae6fd';
            } else if (plat.type === 'conveyor_left' || plat.type === 'conveyor_right') {
                bodyGrad = '#334155';
                topColor = '#facc15';
            } else if (plat.type === 'phase') {
                bodyGrad = '#0891b2';
                topColor = '#67e8f9';
            } else if (this.currentTheme === 'volcano') {
                bodyGrad = plat.type === 'crumble' ? '#451a03' : '#1c1917';
                topColor = plat.type === 'crumble' ? '#f97316' : '#dc2626';
            } else if (this.currentTheme === 'night') {
                bodyGrad = plat.type === 'crumble' ? '#581c87' : '#0f172a';
                topColor = plat.type === 'crumble' ? '#c084fc' : '#38bdf8';
            } else {
                bodyGrad = plat.type === 'crumble' ? '#78350f' : '#1e293b';
                topColor = plat.type === 'crumble' ? '#d97706' : '#22c55e';
            }

            if (this.ctx.roundRect) {
                this.ctx.beginPath();
                this.ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 4);
                this.ctx.fillStyle = bodyGrad;
                this.ctx.fill();
            } else {
                this.ctx.fillStyle = bodyGrad;
                this.ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            }

            this.ctx.fillStyle = topColor;
            if (this.ctx.roundRect) {
                this.ctx.beginPath();
                this.ctx.roundRect(plat.x, plat.y, plat.width, 4, [4, 4, 0, 0]);
                this.ctx.fill();
            } else {
                this.ctx.fillRect(plat.x, plat.y, plat.width, 4);
            }

            this.ctx.restore();
        });

        // Render Spikes
        this.spikes.forEach(spike => {
            this.ctx.save();
            this.ctx.fillStyle = '#dc2626';
            this.ctx.strokeStyle = '#7f1d1d';
            this.ctx.lineWidth = 1;

            const count = Math.max(1, Math.floor(spike.width / 12));
            const spikeW = spike.width / count;

            for (let i = 0; i < count; i++) {
                this.ctx.beginPath();
                this.ctx.moveTo(spike.x + i * spikeW, spike.y + spike.height);
                this.ctx.lineTo(spike.x + (i + 0.5) * spikeW, spike.y);
                this.ctx.lineTo(spike.x + (i + 1) * spikeW, spike.y + spike.height);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
            }
            this.ctx.restore();
        });

        // Render BOSS Entity
        if (this.boss && !this.boss.isDefeated) {
            const b = this.boss;
            this.ctx.save();
            this.ctx.shadowBlur = 18;
            this.ctx.shadowColor = '#dc2626';

            this.ctx.fillStyle = '#991b1b';
            this.ctx.fillRect(b.x, b.y, b.width, b.height);
            this.ctx.strokeStyle = '#f87171';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(b.x, b.y, b.width, b.height);

            this.ctx.fillStyle = '#facc15';
            this.ctx.fillRect(b.x + 10, b.y + 12, 8, 8);
            this.ctx.fillRect(b.x + b.width - 18, b.y + 12, 8, 8);

            const hpWidth = b.width;
            const currentHpW = (b.hp / b.maxHp) * hpWidth;
            this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
            this.ctx.fillRect(b.x, b.y - 14, hpWidth, 8);
            this.ctx.fillStyle = '#ef4444';
            this.ctx.fillRect(b.x, b.y - 14, currentHpW, 8);

            this.ctx.restore();
        }

        // Render Enemies
        this.enemies.forEach(e => {
            if (e.isDefeated) return;
            this.ctx.save();

            const renderW = e.width * 1.35;
            const renderH = e.height * 1.45;

            const feetX = e.x + e.width / 2;
            const feetY = e.y + e.height;
            this.ctx.translate(feetX, feetY);

            if (e.vx < 0) {
                this.ctx.scale(-1, 1);
            }

            if (this.enemyImg.complete && this.enemyImg.naturalWidth !== 0) {
                this.ctx.drawImage(this.enemyImg, -renderW / 2, -renderH, renderW, renderH);
            } else {
                const w = renderW;
                const h = renderH;

                this.ctx.translate(0, -h / 2);

                const leafGrad = this.ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
                leafGrad.addColorStop(0, '#9ca3af');
                leafGrad.addColorStop(0.5, '#6b7280');
                leafGrad.addColorStop(1, '#4b5563');

                this.ctx.fillStyle = leafGrad;
                this.ctx.beginPath();
                this.ctx.moveTo(0, -h / 2);
                this.ctx.quadraticCurveTo(w / 1.8, -h / 6, w / 2.2, h / 3);
                this.ctx.quadraticCurveTo(0, h / 1.8, 0, h / 2);
                this.ctx.quadraticCurveTo(0, h / 1.8, -w / 2.2, h / 3);
                this.ctx.quadraticCurveTo(-w / 1.8, -h / 6, 0, -h / 2);
                this.ctx.closePath();
                this.ctx.fill();

                this.ctx.strokeStyle = '#374151';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(0, -h / 2 + 2);
                this.ctx.lineTo(0, h / 2 - 2);
                this.ctx.stroke();

                this.ctx.fillStyle = '#000000';
                this.ctx.beginPath();
                this.ctx.ellipse(-w / 5, -h / 8, 2, 4, -0.2, 0, Math.PI * 2);
                this.ctx.ellipse(w / 5, -h / 8, 2, 4, 0.2, 0, Math.PI * 2);
                this.ctx.fill();
            }

            this.ctx.restore();
        });

        // Render Projectiles
        this.projectiles.forEach(pj => {
            this.ctx.save();
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = pj.color;
            this.ctx.beginPath();
            this.ctx.arc(pj.x, pj.y, pj.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = pj.color;
            this.ctx.fill();
            this.ctx.restore();
        });

        // Render Key Item
        if (this.keyItem && !this.keyItem.collected) {
            this.ctx.save();
            const keyY = this.keyItem.y + Math.sin(this.levelTime * 0.08) * 4;
            this.ctx.translate(this.keyItem.x + 10, keyY + 10);

            this.ctx.shadowBlur = 12;
            this.ctx.shadowColor = '#facc15';

            this.ctx.strokeStyle = '#facc15';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(-4, -4, 6, 0, Math.PI * 2);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(10, 10);
            this.ctx.lineTo(8, 12);
            this.ctx.moveTo(6, 6);
            this.ctx.lineTo(4, 8);
            this.ctx.stroke();

            this.ctx.restore();
        }

        // Render Power-up Items
        this.powerups.forEach(pw => {
            if (!pw.collected) {
                this.ctx.save();
                const pulseRadius = pw.radius + Math.sin(this.levelTime * 0.1) * 2;
                const mainColor = pw.type === 'shield' ? '#38bdf8' : (pw.type === 'magnet' ? '#ec4899' : '#f97316');

                this.ctx.shadowBlur = 12;
                this.ctx.shadowColor = mainColor;

                this.ctx.beginPath();
                this.ctx.arc(pw.x, pw.y, pulseRadius, 0, Math.PI * 2);
                this.ctx.fillStyle = mainColor;
                this.ctx.fill();

                this.ctx.restore();
            }
        });

        // Render Coins
        this.coins.forEach(coin => {
            if (!coin.collected) {
                const spinScale = Math.abs(Math.sin(this.levelTime * 0.08));
                this.ctx.save();
                this.ctx.translate(coin.x, coin.y);
                this.ctx.scale(spinScale, 1);

                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = '#facc15';
                this.ctx.beginPath();
                this.ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = '#facc15';
                this.ctx.fill();
                this.ctx.lineWidth = 2;
                this.ctx.strokeStyle = '#eab308';
                this.ctx.stroke();

                this.ctx.restore();
            }
        });

        // Render Player
        if (this.playerImg.complete && this.playerImg.naturalWidth !== 0) {
            if (p.invincibleTimer > 0 && Math.floor(p.invincibleTimer / 4) % 2 === 0) {
                // Invincibility flashing state
            } else {
                this.ctx.save();
                const feetX = p.x + p.width / 2;
                const feetY = p.y + p.height;
                this.ctx.translate(feetX, feetY);

                if (p.facing === 'left') {
                    this.ctx.scale(-1, 1);
                }

                this.ctx.rotate(p.rotation);
                this.ctx.scale(p.scaleX, p.scaleY);

                const renderW = p.width * 2.0;
                const renderH = p.height * 2.0;

                const skin = store.getState().selectedSkin;
                const auraColor = skin === 'electric' ? '#38bdf8' : (skin === 'gold' ? '#facc15' : '#ef4444');
                this.ctx.shadowBlur = 14;
                this.ctx.shadowColor = auraColor;

                if (p.hasShield) {
                    this.ctx.beginPath();
                    this.ctx.arc(0, -renderH / 2, renderH * 0.52, 0, Math.PI * 2);
                    this.ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
                    this.ctx.fill();
                    this.ctx.strokeStyle = '#38bdf8';
                    this.ctx.lineWidth = 2;
                    this.ctx.stroke();
                }

                this.ctx.drawImage(
                    this.playerImg,
                    -renderW / 2,
                    -renderH,
                    renderW,
                    renderH
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

        this.ctx.restore();

        // 3. Render HUD Info & Overlays
        const elapsed = Math.floor(this.levelTime / 60);
        this.ctx.font = 'bold 13px sans-serif';
        this.ctx.fillStyle = '#ffffff';
        
        // Lives HUD Display
        let livesStr = '❤️ '.repeat(Math.max(0, p.lives));
        this.ctx.fillText(`ชีวิต: ${livesStr}`, 12, 22);

        this.ctx.fillStyle = elapsed > this.targetTime ? '#ef4444' : '#ffffff';
        this.ctx.fillText(`⏱️ เวลา: ${elapsed}s / ${this.targetTime}s`, 12, 42);

        if (this.comboCount > 1) {
            const currentMult = Math.min(5, 1 + Math.floor(this.comboCount / 3));
            this.ctx.fillStyle = '#f59e0b';
            this.ctx.font = 'bold 14px sans-serif';
            this.ctx.fillText(`🔥 COMBO x${currentMult} (${this.comboCount})`, 12, 65);
        }

        // Lava Warning Vignette Overlay
        if (this.isLavaNear) {
            this.ctx.fillStyle = `rgba(239, 68, 68, ${0.15 + Math.sin(this.levelTime * 0.2) * 0.1})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = '#ef4444';
            this.ctx.font = 'bold 14px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('⚠️ ระวังกำแพงลาวาไล่หลัง!', this.canvas.width / 2, 25);
            this.ctx.textAlign = 'left';
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
