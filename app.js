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
        osc.frequency.setValueAtTime(160, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(480, this.ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
    }

    playSpring() {
        if (!this.ctx || !store.getState().soundEnabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.22);
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.22);
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
        osc.frequency.setValueAtTime(340, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.15);
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

    playBurn() {
        if (!this.ctx || !store.getState().soundEnabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    playMagicFire() {
        if (!this.ctx || !store.getState().soundEnabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(720, this.ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.18);
    }

    playMagicIce() {
        if (!this.ctx || !store.getState().soundEnabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime);
        osc.frequency.setValueAtTime(1320, this.ctx.currentTime + 0.08);
        osc.frequency.setValueAtTime(1760, this.ctx.currentTime + 0.16);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
    }

    playMagicThunder() {
        if (!this.ctx || !store.getState().soundEnabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(130, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.35);
    }
}

class PlatformerGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ui = new UIManager();
        this.sfx = new SoundFX();
        
        // Asset Preloading
        this.playerImg = new Image();
        this.playerImg.src = 'player.png';
        this.enemyImg = new Image();
        this.enemyImg.src = 'enemy.png';

        // Controls
        this.keys = { jump: false, dash: false, magic: false };
        this.animationFrameId = null;

        // BGM
        this.bgm = new Audio('bgm.mp3');
        this.bgm.loop = true;

        // Physics
        this.GRAVITY = 0.32;
        
        // Game Entities
        this.player = null;
        this.levelWidth = 12000;
        this.platforms = [];
        this.coins = [];
        this.spikes = [];
        this.springs = [];
        this.powerups = [];
        this.enemies = [];
        this.boss = null;
        this.projectiles = [];
        this.spells = [];
        this.checkpoints = [];
        this.spawnPoint = { x: 50, y: 0 };
        this.lava = null;
        this.goal = null;

        // Puzzle Entities
        this.crates = [];
        this.switches = [];
        this.doors = [];
        this.vines = [];

        // Camera System
        this.cameraX = 0;

        // Visual FX
        this.particles = [];
        this.weatherParticles = [];
        this.floatingTexts = [];
        this.shakeTimer = 0;
        this.shakeIntensity = 0;
        this.hitFreezeTimer = 0;

        // Combo System
        this.comboCount = 0;
        this.comboTimer = 0;

        this.isLavaNear = false;
        this.currentTheme = 'grass';

        this.levelTime = 0;
        this.targetTime = 70;
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

        let theme = 'grass';
        if (level >= 11 && level <= 25) theme = 'yoyle';
        if (level >= 26) theme = 'volcano';

        // ปรับสปีดลาวาให้ช้าลงตามความเร็ววิ่งใหม่ของผู้เล่น
        const lavaSpeed = Math.min(1.0, 0.22 + (level - 1) * 0.015);
        // เพิ่มเวลาเป้าหมาย 3 ดาวสำหรับด่านที่ยาวขึ้น 4 เท่า
        const targetTime = Math.max(60, 95 - Math.floor((level - 1) / 2));

        const allowedTypes = ['normal'];
        if (level >= 2) allowedTypes.push('bounce');
        if (level >= 5) allowedTypes.push('ice');
        if (level >= 8) allowedTypes.push('crumble');
        if (level >= 13) allowedTypes.push('conveyor_right', 'conveyor_left');
        if (level >= 18) allowedTypes.push('phase');
        if (level >= 22) allowedTypes.push('moving');

        const isBossLevel = (level % 10 === 0);
        // ขยายความยาวด่านเพิ่มขึ้นประมาณ 4 เท่า (จากเดิม ~3500px เป็น ~13000-16000px)
        const levelWidth = isBossLevel ? 11000 : Math.min(16000, Math.floor(w * (12.0 + level * 0.4)));

        const platforms = [];
        const coins = [];
        const spikes = [];
        const springs = [];
        const enemies = [];
        const powerups = [];
        const crates = [];
        const switches = [];
        const doors = [];
        const vines = [];
        const checkpoints = [];
        let boss = null;

        let currX = 0;
        platforms.push({ x: 0, y: h - 35, width: 340, height: 35, type: 'normal' });
        currX = 340;

        let platformId = 0;
        let switchCounter = 0;

        while (currX < levelWidth - 360) {
            platformId++;
            const seed = Math.abs(Math.sin(level * 14.123 + platformId * 78.233));
            
            // ระยะห่างและลูกเล่นกระโดด
            const gapWidth = Math.min(95, 45 + Math.floor(seed * 35) + Math.min(level, 10));
            currX += gapWidth;

            const platWidth = Math.max(130, 220 - level * 1.5 + Math.floor(seed * 60));
            
            let heightVariation = Math.sin(platformId * 0.85 + level * 0.5) * 55 + (seed - 0.5) * 35;
            const platY = Math.max(h - 220, Math.min(h - 35, Math.floor((h - 35) + heightVariation)));

            let pType = 'normal';
            if (platformId > 1) {
                const typeIdx = Math.floor(seed * allowedTypes.length);
                pType = allowedTypes[typeIdx] || 'normal';
            }

            const platObj = {
                x: currX,
                y: platY,
                width: platWidth,
                height: 35,
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
                platObj.vx = (platformId % 2 === 0 ? 1 : -1) * (0.65 + (level * 0.015));
                platObj.minX = Math.max(0, currX - 45);
                platObj.maxX = Math.min(levelWidth, currX + platWidth + 45);
            }

            platforms.push(platObj);

            // แท่นสปริงดีดตัวข้ามสิ่งกีดขวาง
            if (seed > 0.82 && platWidth >= 160 && pType === 'normal') {
                springs.push({
                    x: currX + platWidth * 0.5 - 12,
                    y: platY - 10,
                    width: 24,
                    height: 10
                });
            }

            // กับดักหนามบนแท่น
            if (seed > 0.60 && platWidth >= 170 && pType === 'normal') {
                const spikeW = Math.min(42, platWidth * 0.25);
                spikes.push({
                    x: currX + platWidth * 0.35,
                    y: platY - 16,
                    width: spikeW,
                    height: 16
                });
            }

            // ศัตรูหลากหลายแบบ (เดินดิน, บิน, เกราะหนา)
            if (platformId % 2 === 0 && platWidth >= 150) {
                const isFlying = seed > 0.68;
                const isArmored = !isFlying && seed < 0.28 && level >= 4;
                const isRanged = !isFlying && !isArmored && seed > 0.45 && level >= 6;

                enemies.push({
                    x: currX + 25,
                    y: isFlying ? platY - 75 : platY - 32,
                    baseY: isFlying ? platY - 75 : platY - 32,
                    width: 32,
                    height: 32,
                    vx: (isFlying || isRanged) ? 0 : (0.65 + level * 0.015),
                    minX: currX,
                    maxX: currX + platWidth - 32,
                    isFlying,
                    isArmored,
                    isRanged,
                    flyTimer: platformId,
                    shootTimer: 0,
                    isFrozen: false,
                    freezeTimer: 0,
                    isDefeated: false
                });
            }

            // เหรียญทอง
            if (platformId % 2 === 0) {
                coins.push({
                    x: currX + platWidth / 2,
                    y: platY - 26,
                    radius: 9,
                    collected: false
                });
            }

            // เถาวัลย์และประตูกล
            if (pType === 'normal' && platWidth >= 180) {
                if (seed > 0.76 && platformId % 4 === 0) {
                    vines.push({
                        x: currX + platWidth * 0.4,
                        y: platY - 60,
                        width: 25,
                        height: 60,
                        isBurned: false
                    });
                } else if (seed < 0.22 && platformId % 5 === 0) {
                    switchCounter++;
                    const sId = switchCounter;
                    switches.push({
                        id: sId,
                        x: currX + 20,
                        y: platY - 8,
                        width: 36,
                        height: 8,
                        isPressed: false
                    });

                    doors.push({
                        switchId: sId,
                        x: currX + platWidth - 25,
                        y: platY - 80,
                        width: 20,
                        height: 80,
                        isOpen: false
                    });

                    crates.push({
                        x: currX + 70,
                        y: platY - 40,
                        width: 34,
                        height: 34,
                        vx: 0,
                        vy: 0,
                        isGrounded: false
                    });
                }
            }

            currX += platWidth;
        }

        const lastPlatY = h - 35;
        platforms.push({ x: levelWidth - 360, y: lastPlatY, width: 360, height: 35, type: 'normal' });

        // จุดเซฟ 3 จุดตลอดระยะทางของด่านที่ยาว 4 เท่า
        [0.25, 0.50, 0.75].forEach((ratio) => {
            const cpX = levelWidth * ratio;
            const nearPlat = platforms.find(p => p.x >= cpX) || { x: cpX, y: h - 35 };
            checkpoints.push({
                x: nearPlat.x + 30,
                y: nearPlat.y - 32,
                width: 20,
                height: 32,
                active: false
            });
        });

        // บอสวิ่งนำหน้า (เฉพาะด่านบอส)
        if (isBossLevel) {
            const bossHp = 6 + Math.floor(level / 10) * 2;
            boss = {
                x: 360, // เริ่มต้นวิ่งนำหน้าผู้เล่น
                y: h - 90,
                width: 58,
                height: 56,
                hp: bossHp,
                maxHp: bossHp,
                vx: 2.7,
                vy: 0,
                isGrounded: false,
                jumpTimer: 0,
                shootTimer: 0,
                isDefeated: false,
                hitTimer: 0,
                isSlowed: false,
                slowTimer: 0
            };
        }

        // ประตูเส้นชัย (เปิดเสมอในด่านธรรมดา ส่วนด่านบอสจะเปิดเมื่อโค่นบอสได้)
        const goal = {
            x: levelWidth - 90,
            y: lastPlatY - 45,
            width: 40,
            height: 45,
            isLocked: isBossLevel // บอสเลเวลล็อกไว้ก่อน ด่านธรรมดาผ่านได้เลย
        };

        return {
            theme,
            targetTime,
            lavaSpeed,
            levelWidth,
            checkpoints,
            platforms,
            coins,
            spikes,
            springs,
            enemies,
            boss,
            powerups,
            goal,
            crates,
            switches,
            doors,
            vines
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
        this.spells = [];
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
            width: 38,
            height: 42,
            vx: 0,
            vy: 0,
            speed: 2.75, // ปรับความเร็ววิ่งอัตโนมัติให้ช้าลงเพื่อความแม่นยำ
            jumpPower: -6.8,
            isGrounded: false,
            
            lives: 3,
            maxLives: 3,

            // Magic System
            mp: 100,
            maxMp: 100,
            mpRegen: 0.35,
            spellList: ['fire', 'ice', 'thunder'],
            currentSpellIndex: 0,
            magicCooldown: 0,

            jumpsLeft: 2,
            isDashing: false,
            dashTimer: 0,
            dashCooldown: 0,
            maxDashCooldown: dashCooldownBase,
            dashDirX: 1,
            dashDirY: 0,

            isGroundPounding: false,
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
        this.checkpoints = levelData.checkpoints || [];
        this.platforms = levelData.platforms;
        this.coins = levelData.coins;
        this.spikes = levelData.spikes;
        this.springs = levelData.springs || [];
        this.enemies = levelData.enemies;
        this.boss = levelData.boss;
        this.powerups = levelData.powerups;
        this.goal = levelData.goal;

        this.crates = levelData.crates || [];
        this.switches = levelData.switches || [];
        this.doors = levelData.doors || [];
        this.vines = levelData.vines || [];

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
        p.invincibleTimer = 75;
        p.hasShield = true;
        this.triggerShake(10, 15);
        this.sfx.playHit();
        this.addParticles(p.x + p.width / 2, p.y + p.height / 2, '#f97316', 20);
    }

    setupTouchControls() {
        const bindBtn = (id, onPress) => {
            const btn = document.getElementById(id);
            if (!btn) return;
            const start = (e) => {
                e.preventDefault();
                btn.classList.add('pressed');
                if (onPress) onPress();
            };
            const end = (e) => {
                e.preventDefault();
                btn.classList.remove('pressed');
            };

            btn.addEventListener('touchstart', start);
            btn.addEventListener('touchend', end);
            btn.addEventListener('mousedown', start);
            btn.addEventListener('mouseup', end);
            btn.addEventListener('mouseleave', end);
        };

        bindBtn('btn-jump', () => this.handleJumpTrigger());
        bindBtn('btn-dash', () => this.handleDashTrigger());
        bindBtn('btn-magic', () => this.handleMagicTrigger());
        bindBtn('btn-slam', () => this.handleGroundPoundTrigger());
        bindBtn('btn-spell-switch', () => this.handleSwitchSpellTrigger());
    }

    setupKeyboardControls() {
        window.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') {
                if (!this.keys.jump) this.handleJumpTrigger();
                this.keys.jump = true;
            }
            if (e.key === 'ArrowDown' || e.key === 's') {
                this.handleGroundPoundTrigger();
            }
            if (e.key === 'Shift' || e.key === 'k') this.handleDashTrigger();
            if (e.key === 'j' || e.key === 'x' || e.key === 'f') this.handleMagicTrigger();
            if (e.key === 'q' || e.key === 'e' || e.key === 'c') this.handleSwitchSpellTrigger();
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') this.keys.jump = false;
        });
    }

    tryExecuteJump() {
        const p = this.player;
        if (!p) return false;

        if (p.isGrounded || p.coyoteTimer > 0) {
            p.vy = p.jumpPower;
            p.isGrounded = false;
            p.coyoteTimer = 0;
            p.jumpBufferTimer = 0;
            p.jumpsLeft = 1;
            this.sfx.playJump();
            this.addParticles(p.x + p.width / 2, p.y + p.height, '#facc15', 8);
            return true;
        } else if (p.jumpsLeft > 0) {
            p.vy = p.jumpPower * 0.9;
            p.jumpsLeft--;
            p.jumpBufferTimer = 0;
            this.sfx.playJump();
            this.addParticles(p.x + p.width / 2, p.y + p.height / 2, '#f97316', 10);
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
        p.vx = 0;
        p.vy = 12.0;
        this.sfx.playDash();
        this.addParticles(p.x + p.width / 2, p.y, '#ef4444', 12);
        this.addFloatingText(p.x - 10, p.y - 15, '💥 GROUND POUND!', '#ef4444');
    }

    handleDashTrigger() {
        if (this.isGameCleared) return;
        const p = this.player;
        if (p.dashCooldown <= 0 && !p.isDashing) {
            p.dashDirX = 1;
            p.dashDirY = 0;

            p.isDashing = true;
            p.isGroundPounding = false;
            p.dashTimer = 10;
            p.dashCooldown = p.maxDashCooldown || 30;

            this.sfx.playDash();
            this.triggerShake(5, 8);
            this.addParticles(p.x + p.width / 2, p.y + p.height / 2, '#facc15', 14);
        }
    }

    handleSwitchSpellTrigger() {
        const p = this.player;
        if (!p) return;
        p.currentSpellIndex = (p.currentSpellIndex + 1) % p.spellList.length;
        const current = p.spellList[p.currentSpellIndex];
        const spellNames = {
            fire: '🔥 ลูกไฟเพลิง (Fireball)',
            ice: '❄️ ลิ่มเยือกแข็ง (Frost Spike)',
            thunder: '⚡ อัสนีบาต (Thunder Strike)'
        };
        const spellColors = {
            fire: '#f97316',
            ice: '#38bdf8',
            thunder: '#facc15'
        };
        this.addFloatingText(p.x, p.y - 25, spellNames[current], spellColors[current]);
        this.sfx.playCoin();
    }

    handleMagicTrigger() {
        if (this.isGameCleared) return;
        const p = this.player;
        if (!p || p.magicCooldown > 0) return;

        const spellType = p.spellList[p.currentSpellIndex];
        const costs = { fire: 20, ice: 25, thunder: 35 };
        const cost = costs[spellType] || 20;

        if (p.mp < cost) {
            this.addFloatingText(p.x, p.y - 20, '⚠️ MP ไม่พอ!', '#ef4444');
            this.sfx.playHit();
            return;
        }

        p.mp -= cost;
        p.magicCooldown = 16;
        const dir = 1;

        if (spellType === 'fire') {
            this.sfx.playMagicFire();
            this.spells.push({
                type: 'fire',
                x: p.x + p.width + 5,
                y: p.y + p.height * 0.4,
                vx: dir * 7.8,
                vy: 0,
                radius: 12,
                life: 90
            });
            this.addParticles(p.x + p.width / 2, p.y + p.height / 2, '#f97316', 10);
        } else if (spellType === 'ice') {
            this.sfx.playMagicIce();
            this.spells.push({
                type: 'ice',
                x: p.x + p.width + 5,
                y: p.y + p.height * 0.4,
                vx: dir * 7.0,
                vy: 0,
                radius: 10,
                life: 90
            });
            this.addParticles(p.x + p.width / 2, p.y + p.height / 2, '#38bdf8', 10);
        } else if (spellType === 'thunder') {
            this.sfx.playMagicThunder();
            // ถ้ามีบอส ให้ฟาดลงที่ตำแหน่งบอสทันที
            const strikeX = (this.boss && !this.boss.isDefeated) ? this.boss.x + this.boss.width / 2 : p.x + 150;
            this.spells.push({
                type: 'thunder',
                x: strikeX,
                y: 0,
                width: 46,
                height: this.canvas.height,
                life: 14,
                hasHit: false
            });
            this.triggerShake(9, 12);
            this.addParticles(strikeX, p.y + p.height / 2, '#facc15', 20);
        }
    }

    handleTabChange(tab) {
        if (tab !== 'game') {
            this.keys.jump = false;
            this.keys.dash = false;
            this.keys.magic = false;
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

        p.mp = Math.min(p.maxMp, p.mp + p.mpRegen);
        if (p.magicCooldown > 0) p.magicCooldown--;

        const targetCamX = Math.max(0, p.x - this.canvas.width * 0.3);
        this.cameraX += (targetCamX - this.cameraX) * 0.1;

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

        this.particles.forEach(pt => {
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.alpha -= 0.03;
            pt.life--;
        });
        this.particles = this.particles.filter(pt => pt.life > 0 && pt.alpha > 0);

        this.floatingTexts.forEach(ft => {
            ft.y += ft.vy;
            ft.alpha -= 0.02;
        });
        this.floatingTexts = this.floatingTexts.filter(ft => ft.alpha > 0);

        // ตรวจจับจุด Checkpoint ทั้งหมดในด่าน
        this.checkpoints.forEach(cp => {
            if (!cp.active) {
                if (
                    p.x < cp.x + cp.width &&
                    p.x + p.width > cp.x &&
                    p.y < cp.y + cp.height &&
                    p.y + p.height > cp.y
                ) {
                    cp.active = true;
                    this.spawnPoint = { x: cp.x, y: cp.y - p.height + 10 };
                    this.sfx.playCheckpoint();
                    this.addParticles(cp.x, cp.y, '#22c55e', 20);
                    this.addFloatingText(cp.x - 20, cp.y - 15, 'จุดเซฟทำงาน!', '#22c55e');
                }
            }
        });

        if (this.lava) {
            this.lava.x += this.lava.speed;
            if (p.x < this.lava.x) {
                this.handlePlayerDamage();
            }
        }

        if (p.boostTimer > 0) p.boostTimer--;
        if (p.magnetTimer > 0) p.magnetTimer--;

        const currentSpeed = p.boostTimer > 0 ? p.speed * 1.5 : p.speed;

        // Auto-Runner Movement
        if (p.isGroundPounding) {
            p.vx = 0;
            p.vy = 14.0;
        } else if (p.isDashing) {
            p.vx = p.dashDirX * currentSpeed * 2.5;
            p.vy = p.dashDirY * currentSpeed * 2.5;
            p.dashTimer--;
            if (p.dashTimer <= 0) p.isDashing = false;
        } else {
            p.vx = currentSpeed;
            p.facing = 'right';
            p.vy += this.GRAVITY;
        }

        if (p.dashCooldown > 0) p.dashCooldown--;

        p.x += p.vx;
        p.y += p.vy;

        if (p.vx !== 0 || p.vy !== 0 || p.isDashing || p.isGroundPounding) {
            p.trail.push({
                x: p.x + p.width / 2,
                y: p.y + p.height / 2,
                alpha: 0.6,
                color: '#f97316'
            });
        }
        p.trail.forEach(t => t.alpha -= 0.05);
        p.trail = p.trail.filter(t => t.alpha > 0);

        if (p.x < 0) p.x = 0;
        p.isGrounded = false;

        // Collision กับ Doors (ถ้าปิดอยู่)
        this.doors.forEach(door => {
            if (!door.isOpen) {
                if (
                    p.x < door.x + door.width &&
                    p.x + p.width > door.x &&
                    p.y < door.y + door.height &&
                    p.y + p.height > door.y
                ) {
                    if (p.vx > 0 && p.x + p.width - p.vx <= door.x) p.x = door.x - p.width;
                    else if (p.vx < 0 && p.x - p.vx >= door.x + door.width) p.x = door.x + door.width;
                }
            }
        });

        // Crates (กล่องผลัก)
        this.crates.forEach(crate => {
            crate.vy += this.GRAVITY;
            crate.x += crate.vx;
            crate.y += crate.vy;
            crate.vx *= 0.85;

            this.platforms.forEach(plat => {
                if (
                    crate.x < plat.x + plat.width &&
                    crate.x + crate.width > plat.x &&
                    crate.y + crate.height >= plat.y &&
                    crate.y + crate.height <= plat.y + plat.height + crate.vy &&
                    crate.vy >= 0
                ) {
                    crate.vy = 0;
                    crate.y = plat.y - crate.height;
                }
            });

            if (
                p.x < crate.x + crate.width &&
                p.x + p.width > crate.x &&
                p.y < crate.y + crate.height &&
                p.y + p.height > crate.y
            ) {
                if (p.vx > 0 && p.x + p.width - p.vx <= crate.x) {
                    crate.vx = 2.2;
                    p.x = crate.x - p.width;
                } else if (p.vy > 0 && p.y + p.height - p.vy <= crate.y) {
                    p.isGrounded = true;
                    p.jumpsLeft = 2;
                    p.vy = 0;
                    p.y = crate.y - p.height;
                }
            }
        });

        // เถาวัลย์
        this.vines.forEach(vine => {
            if (vine.isBurned) return;

            if (
                p.x < vine.x + vine.width &&
                p.x + p.width > vine.x &&
                p.y < vine.y + vine.height &&
                p.y + p.height > vine.y
            ) {
                if (p.isDashing || p.isGroundPounding) {
                    vine.isBurned = true;
                    this.sfx.playBurn();
                    this.triggerShake(8, 10);
                    this.addParticles(vine.x + vine.width / 2, vine.y + vine.height / 2, '#ef4444', 25);
                    this.addFloatingText(vine.x, vine.y - 10, '🔥 เผาเถาวัลย์!', '#f97316');
                } else {
                    if (p.vx > 0) p.x = vine.x - p.width;
                }
            }
        });

        // สวิตช์และประตู
        this.switches.forEach(sw => {
            let pressed = false;

            if (
                p.x < sw.x + sw.width &&
                p.x + p.width > sw.x &&
                p.y + p.height >= sw.y &&
                p.y + p.height <= sw.y + sw.height + 6
            ) {
                pressed = true;
            }

            this.crates.forEach(c => {
                if (
                    c.x < sw.x + sw.width &&
                    c.x + c.width > sw.x &&
                    c.y + c.height >= sw.y &&
                    c.y + c.height <= sw.y + sw.height + 6
                ) {
                    pressed = true;
                }
            });

            if (sw.isPressed !== pressed) {
                sw.isPressed = pressed;
                if (pressed) this.sfx.playCheckpoint();
            }

            this.doors.forEach(door => {
                if (door.switchId === sw.id) {
                    door.isOpen = sw.isPressed;
                }
            });
        });

        // Springs (สปริงดีดตัว)
        this.springs.forEach(spg => {
            if (
                p.x < spg.x + spg.width &&
                p.x + p.width > spg.x &&
                p.y + p.height >= spg.y &&
                p.y + p.height <= spg.y + spg.height + 8 &&
                p.vy >= 0
            ) {
                p.vy = -12.5;
                p.isGrounded = false;
                p.jumpsLeft = 1;
                this.sfx.playSpring();
                this.triggerShake(6, 10);
                this.addParticles(spg.x + spg.width / 2, spg.y, '#38bdf8', 15);
                this.addFloatingText(spg.x, spg.y - 15, '🚀 SPRING BOUNCE!', '#38bdf8');
            }
        });

        // Platforms Collision
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
                            p.mp = Math.min(p.maxMp, p.mp + 20);
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

        // ----------------------------------------------------
        // Boss Mechanics (บอสวิ่งนำหน้า กระโดดหลบ และยิงสวนกลับ)
        // ----------------------------------------------------
        if (this.boss && !this.boss.isDefeated) {
            const b = this.boss;

            // รักษาระยะห่างนำหน้าผู้เล่น 250 - 320 px
            const targetDist = 280;
            const currentDist = b.x - p.x;

            let baseSpeed = p.speed;
            if (currentDist < targetDist - 30) {
                baseSpeed = p.speed * 1.35; // บอสเร่งหนีไม่ให้ผู้เล่นชนง่ายๆ
            } else if (currentDist > targetDist + 40) {
                baseSpeed = p.speed * 0.75; // บอสชะลอรอให้อยู่ในหน้าจอ
            }

            if (b.isSlowed) {
                baseSpeed *= 0.5;
                b.slowTimer--;
                if (b.slowTimer <= 0) b.isSlowed = false;
            }

            b.vx = baseSpeed;
            b.vy += this.GRAVITY;

            // Boss Platform Physics
            b.isGrounded = false;
            this.platforms.forEach(plat => {
                if (plat.isDestroyed) return;
                if (
                    b.x < plat.x + plat.width &&
                    b.x + b.width > plat.x &&
                    b.y + b.height >= plat.y &&
                    b.y + b.height <= plat.y + plat.height + b.vy &&
                    b.vy >= 0
                ) {
                    b.isGrounded = true;
                    b.vy = 0;
                    b.y = plat.y - b.height;
                }
            });

            // บอสกระโดดอัตโนมัติเมื่อเจอร่องหลุมข้างหน้า หรือสุ่มกระโดด
            b.jumpTimer++;
            if (b.isGrounded && b.jumpTimer >= 80) {
                b.jumpTimer = 0;
                b.vy = -7.5;
                this.sfx.playJump();
                this.addParticles(b.x + b.width / 2, b.y + b.height, '#dc2626', 10);
            }

            // บอสกระโดดหลบกระสุนเวทมนตร์ของผู้เล่น (Reactive Jump Evade)
            this.spells.forEach(sp => {
                if (sp.type === 'fire' || sp.type === 'ice') {
                    const dist = b.x - sp.x;
                    if (dist > 0 && dist < 140 && b.isGrounded && Math.random() < 0.65) {
                        b.vy = -8.2;
                        b.isGrounded = false;
                        this.addFloatingText(b.x, b.y - 15, '💨 EVADE JUMP!', '#facc15');
                    }
                }
            });

            b.x += b.vx;
            b.y += b.vy;

            if (b.hitTimer > 0) b.hitTimer--;

            // บอสยิงกระสุนสวนกลับมาหาผู้เล่น
            b.shootTimer++;
            if (b.shootTimer >= 85) {
                b.shootTimer = 0;
                this.projectiles.push({
                    x: b.x,
                    y: b.y + b.height * 0.45,
                    vx: -(p.speed + 3.2), // ยิงพุ่งสวนทิศทางวิ่ง
                    vy: (Math.random() - 0.5) * 1.5,
                    radius: 7,
                    color: '#dc2626',
                    isParried: false
                });
                this.sfx.playMagicFire();
                this.addParticles(b.x, b.y + b.height * 0.45, '#dc2626', 8);
            }

            // ผู้เล่นชนบอสโดยตรง
            if (
                p.x < b.x + b.width &&
                p.x + p.width > b.x &&
                p.y < b.y + b.height &&
                p.y + p.height > b.y
            ) {
                this.handlePlayerDamage();
            }
        }

        // ศัตรูทั่วไป
        this.enemies.forEach(enemy => {
            if (enemy.isDefeated) return;

            // การขยับของศัตรูบิน
            if (enemy.isFlying) {
                enemy.flyTimer += 0.05;
                enemy.y = enemy.baseY + Math.sin(enemy.flyTimer) * 22;
            }

            // สถานะแช่แข็ง
            if (enemy.isFrozen) {
                enemy.freezeTimer--;
                if (enemy.freezeTimer <= 0) {
                    enemy.isFrozen = false;
                    this.addParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#38bdf8', 12);
                }

                if (
                    p.x < enemy.x + enemy.width &&
                    p.x + p.width > enemy.x &&
                    p.y + p.height >= enemy.y &&
                    p.y + p.height <= enemy.y + enemy.height + p.vy &&
                    p.vy >= 0
                ) {
                    p.isGrounded = true;
                    p.jumpsLeft = 2;
                    p.vy = 0;
                    p.y = enemy.y - p.height;
                }
                return;
            }

            if (!enemy.isFlying && !enemy.isRanged) {
                enemy.x += enemy.vx;
                if (enemy.x <= enemy.minX || enemy.x + enemy.width >= enemy.maxX) {
                    enemy.vx *= -1;
                }
            } else if (enemy.isRanged) {
                enemy.shootTimer = (enemy.shootTimer || 0) + 1;
                if (enemy.shootTimer >= 110) {
                    enemy.shootTimer = 0;
                    this.projectiles.push({
                        x: enemy.x,
                        y: enemy.y + enemy.height / 2,
                        vx: -3.0,
                        vy: 0,
                        radius: 5,
                        color: '#ef4444',
                        isParried: false
                    });
                }
            }

            // ชนศัตรู
            if (
                p.x < enemy.x + enemy.width &&
                p.x + p.width > enemy.x &&
                p.y < enemy.y + enemy.height &&
                p.y + p.height > enemy.y
            ) {
                if (p.vy > 0 && (p.y + p.height - p.vy) <= enemy.y + 12) {
                    // ถ้าเป็นศัตรูเกราะหนา และยังไม่ถูกแช่แข็ง จะเหยียบไม่เข้า
                    if (enemy.isArmored) {
                        this.handlePlayerDamage();
                        this.addFloatingText(enemy.x, enemy.y, '🛡️ เกราะหนา! ต้องใช้เวท!', '#94a3b8');
                    } else {
                        enemy.isDefeated = true;
                        p.vy = -8.5;
                        p.mp = Math.min(p.maxMp, p.mp + 15);
                        store.addScore(50);
                        this.sfx.playHit();
                        this.triggerShake(10, 14);
                        this.hitFreezeTimer = 4;
                        this.addParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#a855f7', 18);
                        this.addFloatingText(enemy.x, enemy.y, '+50 (+15 MP)', '#38bdf8');
                    }
                } else {
                    this.handlePlayerDamage();
                }
            }
        });

        // Magic Spells Logic
        this.spells.forEach(sp => {
            sp.life--;

            if (sp.type === 'fire' || sp.type === 'ice') {
                sp.x += sp.vx;

                if (Math.random() > 0.4) {
                    this.particles.push({
                        x: sp.x,
                        y: sp.y,
                        vx: -sp.vx * 0.2 + (Math.random() - 0.5) * 1.5,
                        vy: (Math.random() - 0.5) * 1.5,
                        size: Math.random() * 3 + 2,
                        color: sp.type === 'fire' ? '#f97316' : '#38bdf8',
                        alpha: 0.8,
                        life: 12
                    });
                }

                if (sp.type === 'fire') {
                    this.vines.forEach(vine => {
                        if (
                            !vine.isBurned &&
                            sp.x > vine.x && sp.x < vine.x + vine.width &&
                            sp.y > vine.y && sp.y < vine.y + vine.height
                        ) {
                            vine.isBurned = true;
                            sp.hit = true;
                            this.sfx.playBurn();
                            this.triggerShake(8, 10);
                            this.addParticles(vine.x + vine.width / 2, vine.y + vine.height / 2, '#ef4444', 25);
                            this.addFloatingText(vine.x, vine.y - 10, '🔥 เพลิงเผาเถาวัลย์!', '#f97316');
                        }
                    });
                }

                this.enemies.forEach(enemy => {
                    if (enemy.isDefeated) return;
                    if (
                        sp.x > enemy.x && sp.x < enemy.x + enemy.width &&
                        sp.y > enemy.y && sp.y < enemy.y + enemy.height
                    ) {
                        sp.hit = true;
                        if (sp.type === 'fire') {
                            enemy.isDefeated = true;
                            store.addScore(60);
                            p.mp = Math.min(p.maxMp, p.mp + 15);
                            this.sfx.playHit();
                            this.triggerShake(7, 10);
                            this.addParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#f97316', 20);
                            this.addFloatingText(enemy.x, enemy.y, '🔥 FIRE HIT! +60', '#f97316');
                        } else if (sp.type === 'ice') {
                            enemy.isFrozen = true;
                            enemy.freezeTimer = 240;
                            this.sfx.playMagicIce();
                            this.triggerShake(6, 8);
                            this.addParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#38bdf8', 20);
                            this.addFloatingText(enemy.x, enemy.y - 15, '❄️ แช่แข็ง! (เหยียบได้)', '#38bdf8');
                        }
                    }
                });

                // เวทโดนบอส
                if (this.boss && !this.boss.isDefeated) {
                    const b = this.boss;
                    if (
                        sp.x > b.x && sp.x < b.x + b.width &&
                        sp.y > b.y && sp.y < b.y + b.height
                    ) {
                        sp.hit = true;
                        b.hp--;
                        b.hitTimer = 15;
                        p.mp = Math.min(p.maxMp, p.mp + 20);

                        if (sp.type === 'ice') {
                            b.isSlowed = true;
                            b.slowTimer = 180;
                            this.addFloatingText(b.x, b.y - 20, '❄️ บอสชะลอความเร็ว!', '#38bdf8');
                        }

                        this.sfx.playHit();
                        this.triggerShake(12, 16);
                        this.addParticles(b.x + b.width / 2, b.y + b.height / 2, sp.type === 'fire' ? '#f97316' : '#38bdf8', 20);

                        if (b.hp <= 0) {
                            b.isDefeated = true;
                            store.addScore(400);
                            this.addFloatingText(b.x, b.y - 20, '🏆 บอสพ่ายแพ้! ประตูเปิดแล้ว!', '#facc15');
                            if (this.goal) this.goal.isLocked = false;
                        } else {
                            this.addFloatingText(b.x, b.y - 20, `💥 ยิงโดนบอส! HP: ${b.hp}/${b.maxHp}`, '#ef4444');
                        }
                    }
                }
            } else if (sp.type === 'thunder' && !sp.hasHit) {
                sp.hasHit = true;
                const minX = sp.x - sp.width / 2;
                const maxX = sp.x + sp.width / 2;

                this.enemies.forEach(enemy => {
                    if (!enemy.isDefeated && enemy.x + enemy.width > minX && enemy.x < maxX) {
                        enemy.isDefeated = true;
                        store.addScore(70);
                        p.mp = Math.min(p.maxMp, p.mp + 15);
                        this.sfx.playHit();
                        this.addParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#facc15', 22);
                        this.addFloatingText(enemy.x, enemy.y, '⚡ THUNDER! +70', '#facc15');
                    }
                });

                if (this.boss && !this.boss.isDefeated) {
                    const b = this.boss;
                    if (b.x + b.width > minX && b.x < maxX) {
                        b.hp--;
                        b.hitTimer = 15;
                        p.mp = Math.min(p.maxMp, p.mp + 20);
                        this.sfx.playHit();
                        this.triggerShake(14, 18);
                        this.addParticles(b.x + b.width / 2, b.y + b.height / 2, '#facc15', 25);
                        if (b.hp <= 0) {
                            b.isDefeated = true;
                            store.addScore(400);
                            this.addFloatingText(b.x, b.y - 20, '🏆 บอสพ่ายแพ้! ประตูเปิดแล้ว!', '#facc15');
                            if (this.goal) this.goal.isLocked = false;
                        } else {
                            this.addFloatingText(b.x, b.y - 20, `⚡ อัสนีฟาด! HP: ${b.hp}/${b.maxHp}`, '#facc15');
                        }
                    }
                }

                this.crates.forEach(crate => {
                    if (crate.x + crate.width > minX && crate.x < maxX) {
                        crate.vx = 6;
                        crate.vy = -4;
                        this.addParticles(crate.x + crate.width / 2, crate.y, '#facc15', 12);
                    }
                });

                this.switches.forEach(sw => {
                    if (sw.x + sw.width > minX && sw.x < maxX) {
                        sw.isPressed = true;
                        this.sfx.playCheckpoint();
                        this.addParticles(sw.x + sw.width / 2, sw.y, '#facc15', 14);
                        this.addFloatingText(sw.x, sw.y - 15, '⚡ สวิตช์ถูกกระตุ้น!', '#facc15');
                    }
                });
            }
        });
        this.spells = this.spells.filter(sp => !sp.hit && sp.life > 0);

        // Projectiles Update
        this.projectiles.forEach(pj => {
            pj.x += pj.vx;
            pj.y += pj.vy;

            const dx = (p.x + p.width / 2) - pj.x;
            const dy = (p.y + p.height / 2) - pj.y;
            const dist = Math.hypot(dx, dy);

            // กด Dash สะท้อนกระสุนบอส
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
        this.projectiles = this.projectiles.filter(pj => !pj.hit && pj.x > this.cameraX - 50 && pj.x < this.canvas.width + 50);

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
                    p.mp = Math.min(p.maxMp, p.mp + 5);

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

        // เส้นชัยผ่านด่าน (เข้าประตูได้ทันทีโดยไม่ต้องใช้กุญแจ)
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

        if (p.y > this.canvas.height + 40) {
            this.handlePlayerDamage();
        }

        if (!p.isGrounded) {
            p.scaleX = 0.88;
            p.scaleY = 1.12;
            p.rotation = p.vx * 0.03;
        } else if (p.vx !== 0) {
            p.walkTimer += 0.22;
            p.rotation = Math.sin(p.walkTimer) * 0.12;
            p.scaleX = 1 + Math.sin(p.walkTimer) * 0.06;
            p.scaleY = 1 - Math.sin(p.walkTimer) * 0.06;
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
            caveGrad.addColorStop(0, '#1a0b08');
            caveGrad.addColorStop(0.5, '#2d120a');
            caveGrad.addColorStop(1, '#4a1505');
            this.ctx.fillStyle = caveGrad;
            this.ctx.fillRect(0, 0, w, h);

            this.ctx.fillStyle = '#1c0a06';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(0, h);
            for (let x = 0; x <= w; x += 20) {
                const worldX = x + parallaxX;
                const y = h - 110 - Math.sin(worldX * 0.01) * 35;
                this.ctx.lineTo(x, y);
            }
            this.ctx.lineTo(w, h);
            this.ctx.fill();
            this.ctx.stroke();

        } else if (this.currentTheme === 'yoyle') {
            const yoyleGrad = this.ctx.createLinearGradient(0, 0, 0, h);
            yoyleGrad.addColorStop(0, '#3b0764');
            yoyleGrad.addColorStop(0.6, '#581c87');
            yoyleGrad.addColorStop(1, '#7e22ce');
            this.ctx.fillStyle = yoyleGrad;
            this.ctx.fillRect(0, 0, w, h);

            this.ctx.fillStyle = '#2e1065';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(0, h);
            for (let x = 0; x <= w; x += 30) {
                const worldX = x + parallaxX;
                const y = h - 120 - Math.cos(worldX * 0.012) * 45;
                this.ctx.lineTo(x, y);
            }
            this.ctx.lineTo(w, h);
            this.ctx.fill();
            this.ctx.stroke();

        } else {
            const skyGrad = this.ctx.createLinearGradient(0, 0, 0, h);
            skyGrad.addColorStop(0, '#38bdf8');
            skyGrad.addColorStop(0.7, '#7dd3fc');
            skyGrad.addColorStop(1, '#bae6fd');
            this.ctx.fillStyle = skyGrad;
            this.ctx.fillRect(0, 0, w, h);

            this.ctx.fillStyle = '#4ade80';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.moveTo(-20, h);
            for (let x = -20; x <= w + 20; x += 25) {
                const worldX = x + parallaxX;
                const y = h - 90 - Math.sin(worldX * 0.008) * 30 - Math.cos(worldX * 0.015) * 15;
                this.ctx.lineTo(x, y);
            }
            this.ctx.lineTo(w + 20, h);
            this.ctx.fill();
            this.ctx.stroke();

            const clouds = [
                { x: (w * 0.1 + time * 12 - parallaxX) % (w + 200) - 100, y: 60, scale: 0.9 },
                { x: (w * 0.5 + time * 8 - parallaxX) % (w + 220) - 110, y: 100, scale: 1.15 },
                { x: (w * 0.8 + time * 16 - parallaxX) % (w + 180) - 90, y: 125, scale: 0.8 }
            ];

            clouds.forEach(c => {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(c.x, c.y, 20 * c.scale, 0, Math.PI * 2);
                this.ctx.arc(c.x + 16 * c.scale, c.y - 12 * c.scale, 16 * c.scale, 0, Math.PI * 2);
                this.ctx.arc(c.x + 32 * c.scale, c.y, 18 * c.scale, 0, Math.PI * 2);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
            });
        }
    }

    drawFireStarPlayer(p) {
        const w = p.width;
        const h = p.height;

        this.ctx.save();

        if (p.facing === 'left') {
            this.ctx.scale(-1, 1);
        }

        if (this.playerImg && this.playerImg.complete) {
            this.ctx.drawImage(this.playerImg, -w * 1.05, -h * 1.9, w * 2.1, h * 1.9);
        } else {
            this.ctx.fillStyle = '#f97316';
            this.ctx.fillRect(-w / 2, -h, w, h);
        }

        this.ctx.restore();
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Draw Background
        this.drawDynamicBackground();

        if (this.isGameCleared) {
            this.ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#facc15';
            this.ctx.font = 'bold 22px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('🏆 GAME CLEAR! 🏆', this.canvas.width / 2, this.canvas.height / 2 - 20);
            this.ctx.font = '15px sans-serif';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText('คุณพิชิตครบทั้ง 40 ด่านสำเร็จ!', this.canvas.width / 2, this.canvas.height / 2 + 20);
            return;
        }

        // 2. Camera & World Rendering
        this.ctx.save();

        if (this.shakeTimer > 0) {
            const rx = (Math.random() - 0.5) * this.shakeIntensity;
            const ry = (Math.random() - 0.5) * this.shakeIntensity;
            this.ctx.translate(rx, ry);
        }

        this.ctx.translate(-this.cameraX, 0);

        // Particles
        this.particles.forEach(pt => {
            this.ctx.beginPath();
            this.ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
            this.ctx.fillStyle = pt.color;
            this.ctx.globalAlpha = Math.max(0, pt.alpha);
            this.ctx.fill();
            this.ctx.globalAlpha = 1.0;
        });

        const p = this.player;

        // Trail FX
        p.trail.forEach(t => {
            this.ctx.beginPath();
            this.ctx.arc(t.x, t.y, 12 * t.alpha, 0, Math.PI * 2);
            this.ctx.fillStyle = t.color;
            this.ctx.globalAlpha = Math.max(0, t.alpha);
            this.ctx.fill();
            this.ctx.globalAlpha = 1.0;
        });

        // Checkpoint Flags (เรนเดอร์ทุกจุดเซฟในด่าน)
        this.checkpoints.forEach(cp => {
            this.ctx.fillStyle = cp.active ? '#22c55e' : '#38bdf8';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 2.5;
            this.ctx.fillRect(cp.x, cp.y, 5, cp.height);
            this.ctx.strokeRect(cp.x, cp.y, 5, cp.height);
            
            this.ctx.beginPath();
            this.ctx.moveTo(cp.x + 5, cp.y);
            this.ctx.lineTo(cp.x + 22, cp.y + 8);
            this.ctx.lineTo(cp.x + 5, cp.y + 16);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        });

        // Render Lava Wall
        if (this.lava) {
            this.ctx.save();
            this.ctx.fillStyle = '#ef4444';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 4;

            this.ctx.beginPath();
            this.ctx.moveTo(this.lava.x - 500, 0);

            for (let y = 0; y <= this.canvas.height; y += 10) {
                const waveX = this.lava.x + Math.sin((y + this.levelTime * 4) * 0.04) * 8;
                this.ctx.lineTo(waveX, y);
            }
            this.ctx.lineTo(this.lava.x - 500, this.canvas.height);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            this.ctx.restore();
        }

        // Render Goal Portal (ไม่ต้องใช้กุญแจ)
        if (this.goal) {
            this.ctx.save();
            const isLocked = this.goal.isLocked;

            this.ctx.fillStyle = isLocked ? '#475569' : '#16a34a';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 3.5;

            this.ctx.fillRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height);
            this.ctx.strokeRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height);

            if (!isLocked) {
                this.ctx.fillStyle = '#facc15';
                this.ctx.font = 'bold 12px sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('GOAL', this.goal.x + this.goal.width / 2, this.goal.y + 26);
            } else {
                this.ctx.fillStyle = '#ef4444';
                this.ctx.font = 'bold 14px sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('⚔️ BOSS', this.goal.x + this.goal.width / 2, this.goal.y + 26);
            }

            this.ctx.restore();
        }

        // Render Platforms
        this.platforms.forEach(plat => {
            if (plat.isDestroyed) return;
            if (plat.type === 'phase' && !plat.active) return;

            this.ctx.save();
            let bodyColor = '#1e293b';
            let topColor = '#22c55e';

            if (plat.type === 'bounce') {
                bodyColor = '#7e22ce';
                topColor = '#f472b6';
            } else if (plat.type === 'ice') {
                bodyColor = '#0284c7';
                topColor = '#bae6fd';
            } else if (plat.type === 'conveyor_left' || plat.type === 'conveyor_right') {
                bodyColor = '#334155';
                topColor = '#facc15';
            } else if (plat.type === 'phase') {
                bodyColor = '#0891b2';
                topColor = '#67e8f9';
            } else if (this.currentTheme === 'volcano') {
                bodyColor = plat.type === 'crumble' ? '#451a03' : '#1c1917';
                topColor = plat.type === 'crumble' ? '#f97316' : '#dc2626';
            } else if (this.currentTheme === 'yoyle') {
                bodyColor = plat.type === 'crumble' ? '#581c87' : '#3b0764';
                topColor = plat.type === 'crumble' ? '#c084fc' : '#a855f7';
            }

            this.ctx.fillStyle = bodyColor;
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 3.5;
            this.ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            this.ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);

            this.ctx.fillStyle = topColor;
            this.ctx.fillRect(plat.x + 2, plat.y + 2, plat.width - 4, 8);

            this.ctx.restore();
        });

        // Render Springs
        this.springs.forEach(spg => {
            this.ctx.save();
            this.ctx.fillStyle = '#38bdf8';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 2.5;
            this.ctx.fillRect(spg.x, spg.y, spg.width, spg.height);
            this.ctx.strokeRect(spg.x, spg.y, spg.width, spg.height);

            this.ctx.fillStyle = '#facc15';
            this.ctx.fillRect(spg.x + 2, spg.y + 2, spg.width - 4, 3);
            this.ctx.restore();
        });

        // Render Puzzle: Switches
        this.switches.forEach(sw => {
            this.ctx.save();
            this.ctx.fillStyle = sw.isPressed ? '#22c55e' : '#ef4444';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 2;
            const height = sw.isPressed ? 3 : sw.height;
            const yPos = sw.isPressed ? sw.y + (sw.height - 3) : sw.y;
            this.ctx.fillRect(sw.x, yPos, sw.width, height);
            this.ctx.strokeRect(sw.x, yPos, sw.width, height);
            this.ctx.restore();
        });

        // Render Puzzle: Doors
        this.doors.forEach(door => {
            if (!door.isOpen) {
                this.ctx.save();
                this.ctx.fillStyle = '#64748b';
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 3;
                this.ctx.fillRect(door.x, door.y, door.width, door.height);
                this.ctx.strokeRect(door.x, door.y, door.width, door.height);

                this.ctx.strokeStyle = '#facc15';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(door.x + 4, door.y + 10);
                this.ctx.lineTo(door.x + door.width - 4, door.y + door.height - 10);
                this.ctx.moveTo(door.x + door.width - 4, door.y + 10);
                this.ctx.lineTo(door.x + 4, door.y + door.height - 10);
                this.ctx.stroke();

                this.ctx.restore();
            }
        });

        // Render Puzzle: Crates
        this.crates.forEach(crate => {
            this.ctx.save();
            this.ctx.fillStyle = '#b45309';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 3;
            this.ctx.fillRect(crate.x, crate.y, crate.width, crate.height);
            this.ctx.strokeRect(crate.x, crate.y, crate.width, crate.height);

            this.ctx.strokeStyle = '#f59e0b';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(crate.x + 3, crate.y + 3, crate.width - 6, crate.height - 6);
            this.ctx.restore();
        });

        // Render Puzzle: Vines
        this.vines.forEach(vine => {
            if (!vine.isBurned) {
                this.ctx.save();
                this.ctx.fillStyle = '#15803d';
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 2.5;
                this.ctx.fillRect(vine.x, vine.y, vine.width, vine.height);
                this.ctx.strokeRect(vine.x, vine.y, vine.width, vine.height);

                this.ctx.fillStyle = '#4ade80';
                this.ctx.beginPath();
                this.ctx.arc(vine.x + vine.width / 2, vine.y + 15, 6, 0, Math.PI * 2);
                this.ctx.arc(vine.x + vine.width / 2, vine.y + 35, 6, 0, Math.PI * 2);
                this.ctx.fill();

                this.ctx.restore();
            }
        });

        // Render Spikes
        this.spikes.forEach(spike => {
            this.ctx.save();
            this.ctx.fillStyle = '#ef4444';
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 2.5;

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

        // Render Boss (วิ่งนำหน้า หันหลังมายิงสวน)
        if (this.boss && !this.boss.isDefeated) {
            const b = this.boss;
            this.ctx.save();

            this.ctx.fillStyle = b.hitTimer > 0 ? '#ffffff' : (b.isSlowed ? '#38bdf8' : '#dc2626');
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 3.5;

            this.ctx.fillRect(b.x, b.y, b.width, b.height);
            this.ctx.strokeRect(b.x, b.y, b.width, b.height);

            // เขาบอส
            this.ctx.fillStyle = '#991b1b';
            this.ctx.beginPath();
            this.ctx.moveTo(b.x + 8, b.y);
            this.ctx.lineTo(b.x + 3, b.y - 12);
            this.ctx.lineTo(b.x + 18, b.y);
            this.ctx.fill();
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(b.x + b.width - 8, b.y);
            this.ctx.lineTo(b.x + b.width - 3, b.y - 12);
            this.ctx.lineTo(b.x + b.width - 18, b.y);
            this.ctx.fill();
            this.ctx.stroke();

            // ตาบอส (หันกลับมามองผู้เล่นข้างหลัง)
            this.ctx.fillStyle = '#facc15';
            this.ctx.fillRect(b.x + 8, b.y + 15, 12, 10);
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(b.x + 9, b.y + 17, 5, 6);

            // หลอดเลือดบอส
            const hpWidth = b.width;
            const currentHpW = (b.hp / b.maxHp) * hpWidth;
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(b.x, b.y - 20, hpWidth, 8);
            this.ctx.fillStyle = '#ef4444';
            this.ctx.fillRect(b.x, b.y - 20, currentHpW, 8);
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 1.5;
            this.ctx.strokeRect(b.x, b.y - 20, hpWidth, 8);

            this.ctx.font = 'bold 10px sans-serif';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(`BOSS ${b.hp}/${b.maxHp}`, b.x, b.y - 24);

            this.ctx.restore();
        }

        // Render Enemies
        this.enemies.forEach(e => {
            if (e.isDefeated) return;
            this.ctx.save();

            const renderW = e.width * 1.35;
            const renderH = e.height * 1.35;

            const feetX = e.x + e.width / 2;
            const feetY = e.y + e.height;
            this.ctx.translate(feetX, feetY);

            if (this.enemyImg && this.enemyImg.complete) {
                this.ctx.drawImage(this.enemyImg, -renderW / 2, -renderH, renderW, renderH);
            } else {
                this.ctx.fillStyle = e.isArmored ? '#64748b' : '#9ca3af';
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 3;
                this.ctx.fillRect(-renderW / 2, -renderH, renderW, renderH);
                this.ctx.strokeRect(-renderW / 2, -renderH, renderW, renderH);
            }

            // สัญลักษณ์ศัตรูบิน (ปีก)
            if (e.isFlying) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.ellipse(-renderW / 2 - 4, -renderH / 2, 8, 14, Math.PI / 4, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
            }

            // สัญลักษณ์เกราะหนา
            if (e.isArmored) {
                this.ctx.strokeStyle = '#facc15';
                this.ctx.lineWidth = 2.5;
                this.ctx.strokeRect(-renderW / 2 - 2, -renderH - 2, renderW + 4, renderH + 4);
            }

            // เอฟเฟกต์แช่แข็ง
            if (e.isFrozen) {
                this.ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
                this.ctx.strokeStyle = '#38bdf8';
                this.ctx.lineWidth = 3;
                this.ctx.fillRect(-renderW / 2 - 4, -renderH - 4, renderW + 8, renderH + 8);
                this.ctx.strokeRect(-renderW / 2 - 4, -renderH - 4, renderW + 8, renderH + 8);
            }

            this.ctx.restore();
        });

        // Render Magic Spells
        this.spells.forEach(sp => {
            this.ctx.save();
            if (sp.type === 'fire') {
                this.ctx.beginPath();
                this.ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = '#f97316';
                this.ctx.strokeStyle = '#facc15';
                this.ctx.lineWidth = 3;
                this.ctx.fill();
                this.ctx.stroke();

                this.ctx.beginPath();
                this.ctx.arc(sp.x - sp.vx * 0.4, sp.y, sp.radius * 0.5, 0, Math.PI * 2);
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fill();
            } else if (sp.type === 'ice') {
                this.ctx.translate(sp.x, sp.y);
                this.ctx.rotate(this.levelTime * 0.2);
                this.ctx.fillStyle = '#38bdf8';
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2.5;

                this.ctx.beginPath();
                this.ctx.moveTo(0, -sp.radius * 1.3);
                this.ctx.lineTo(sp.radius * 0.8, 0);
                this.ctx.lineTo(0, sp.radius * 1.3);
                this.ctx.lineTo(-sp.radius * 0.8, 0);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
            } else if (sp.type === 'thunder') {
                const alpha = Math.max(0, sp.life / 14);
                this.ctx.globalAlpha = alpha;

                this.ctx.strokeStyle = '#facc15';
                this.ctx.lineWidth = 6;
                this.ctx.beginPath();
                this.ctx.moveTo(sp.x, 0);
                
                for (let y = 0; y < sp.height; y += 20) {
                    const offset = (Math.random() - 0.5) * 25;
                    this.ctx.lineTo(sp.x + offset, y);
                }
                this.ctx.lineTo(sp.x, sp.height);
                this.ctx.stroke();

                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2.5;
                this.ctx.stroke();

                this.ctx.globalAlpha = 1.0;
            }
            this.ctx.restore();
        });

        // Render Projectiles
        this.projectiles.forEach(pj => {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(pj.x, pj.y, pj.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = pj.color;
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 2;
            this.ctx.fill();
            this.ctx.stroke();
            this.ctx.restore();
        });

        // Render Power-up Items
        this.powerups.forEach(pw => {
            if (!pw.collected) {
                this.ctx.save();
                const pulseRadius = pw.radius + Math.sin(this.levelTime * 0.1) * 2;
                const mainColor = pw.type === 'shield' ? '#38bdf8' : (pw.type === 'magnet' ? '#ec4899' : '#f97316');

                this.ctx.beginPath();
                this.ctx.arc(pw.x, pw.y, pulseRadius, 0, Math.PI * 2);
                this.ctx.fillStyle = mainColor;
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 2.5;
                this.ctx.fill();
                this.ctx.stroke();

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

                this.ctx.beginPath();
                this.ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = '#facc15';
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 2.5;
                this.ctx.fill();
                this.ctx.stroke();

                this.ctx.restore();
            }
        });

        // Render Player Character
        if (p.invincibleTimer > 0 && Math.floor(p.invincibleTimer / 4) % 2 === 0) {
            // Invincible Flashing
        } else {
            this.ctx.save();
            const feetX = p.x + p.width / 2;
            const feetY = p.y + p.height;
            this.ctx.translate(feetX, feetY);

            this.ctx.rotate(p.rotation);
            this.ctx.scale(p.scaleX, p.scaleY);

            if (p.hasShield) {
                this.ctx.beginPath();
                this.ctx.arc(0, -p.height / 2, p.height * 0.68, 0, Math.PI * 2);
                this.ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
                this.ctx.strokeStyle = '#38bdf8';
                this.ctx.lineWidth = 2.5;
                this.ctx.fill();
                this.ctx.stroke();
            }

            this.drawFireStarPlayer(p);

            this.ctx.restore();
        }

        // Floating Text
        this.floatingTexts.forEach(ft => {
            this.ctx.font = 'bold 15px sans-serif';
            this.ctx.fillStyle = ft.color;
            this.ctx.globalAlpha = Math.max(0, ft.alpha);
            this.ctx.fillText(ft.text, ft.x, ft.y);
            this.ctx.globalAlpha = 1.0;
        });

        this.ctx.restore();

        // 3. HUD Info
        const elapsed = Math.floor(this.levelTime / 60);
        this.ctx.font = 'bold 13px sans-serif';
        this.ctx.fillStyle = '#ffffff';
        
        let livesStr = '❤️ '.repeat(Math.max(0, p.lives));
        this.ctx.fillText(`ชีวิต: ${livesStr}`, 12, 22);

        this.ctx.fillStyle = elapsed > this.targetTime ? '#ef4444' : '#ffffff';
        this.ctx.fillText(`⏱️ เวลา: ${elapsed}s / ${this.targetTime}s`, 12, 42);

        // Mana Bar (MP Bar)
        const barW = 100;
        const barH = 10;
        const barX = 12;
        const barY = 56;
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(barX, barY, barW, barH);
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(barX, barY, barW, barH);

        const mpPercent = Math.max(0, Math.min(1, p.mp / p.maxMp));
        this.ctx.fillStyle = '#38bdf8';
        this.ctx.fillRect(barX + 1, barY + 1, (barW - 2) * mpPercent, barH - 2);

        const spellIcons = { fire: '🔥 เพลิง', ice: '❄️ น้ำแข็ง', thunder: '⚡ สายฟ้า' };
        const activeSpell = p.spellList[p.currentSpellIndex];
        this.ctx.font = 'bold 11px sans-serif';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText(`MP: ${Math.floor(p.mp)}/${p.maxMp} [${spellIcons[activeSpell]}]`, barX + barW + 8, barY + 9);

        // หลอดบอกความคืบหน้าของด่าน (Progress Bar)
        const progW = this.canvas.width - 24;
        const progY = this.canvas.height - 14;
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
        this.ctx.fillRect(12, progY, progW, 6);
        const progress = Math.min(1, p.x / (this.levelWidth - 100));
        this.ctx.fillStyle = '#facc15';
        this.ctx.fillRect(12, progY, progW * progress, 6);

        if (this.comboCount > 1) {
            const currentMult = Math.min(5, 1 + Math.floor(this.comboCount / 3));
            this.ctx.fillStyle = '#f59e0b';
            this.ctx.font = 'bold 14px sans-serif';
            this.ctx.fillText(`🔥 COMBO x${currentMult} (${this.comboCount})`, 12, 84);
        }

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
