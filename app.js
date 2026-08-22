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
        
        this.keys = { left: false, right: false, jump: false, dash: false };
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

    // ระบบเจนเนอเรตด่านแบบไดนามิก 40 ด่านที่มีเอกลักษณ์ไม่ซ้ำกัน
    getLevelData(level, w, h) {
        if (level > 40) {
            return null; // จบเกมแล้ว
        }

        // กำหนดธีมตามช่วงด่าน
        let theme = 'sky';
        if (level >= 11 && level <= 25) theme = 'volcano';
        if (level >= 26) theme = 'night';

        // ปรับความเร็วลาวาและเวลาเป้าหมายตามความยากของด่าน
        const lavaSpeed = Math.min(0.52, 0.08 + (level - 1) * 0.0115);
        const targetTime = Math.max(10, 20 - Math.floor((level - 1) / 3));

        // ปูลูกเล่นแท่นตามระดับด่านที่สูงขึ้น
        const allowedTypes = ['normal'];
        if (level >= 2) allowedTypes.push('bounce');
        if (level >= 5) allowedTypes.push('ice');
        if (level >= 10) allowedTypes.push('crumble');
        if (level >= 15) allowedTypes.push('conveyor_right', 'conveyor_left');
        if (level >= 22) allowedTypes.push('phase');
        if (level >= 28) allowedTypes.push('moving');

        const platformCount = Math.min(9, 5 + Math.floor(level / 7));
        const verticalGap = Math.min(68, 48 + Math.floor(level * 0.45));
        const baseWidthRatio = Math.max(0.15, 0.38 - (level * 0.0055));

        const platforms = [{ x: 0, y: h - 20, width: w, height: 20, type: 'normal' }];

        for (let i = 1; i <= platformCount; i++) {
            const platY = h - 20 - (i * verticalGap);
            const platWidth = w * baseWidthRatio;

            // สูตรคณิตศาสตร์ล็อกคำนวณตำแหน่ง X เพื่อให้แต่ละด่านมีตำแหน่งแท่นไม่ซ้ำกันแน่นอน
            const seed = Math.abs(Math.sin(level * 12.9898 + i * 78.233));
            const platX = seed * (w - platWidth - 30) + 15;

            let pType = 'normal';
            if (i > 0) {
                const typeIdx = Math.floor(seed * allowedTypes.length);
                pType = allowedTypes[typeIdx] || 'normal';
            }

            const platObj = {
                x: platX,
                y: platY,
                width: platWidth,
                height: 14,
                type: pType
            };

            if (pType === 'phase') {
                platObj.timer = (i * 25) % 80;
                platObj.active = (i % 2 === 0);
            } else if (pType === 'crumble') {
                platObj.timer = 0;
                platObj.isCrumbling = false;
                platObj.isDestroyed = false;
            } else if (pType === 'moving') {
                platObj.vx = (i % 2 === 0 ? 1 : -1) * (1.1 + (level * 0.03));
                platObj.minX = Math.max(10, platX - w * 0.15);
                platObj.maxX = Math.min(w - platWidth - 10, platX + w * 0.15);
            }

            platforms.push(platObj);
        }

        // เหรียญรางวัล
        const coins = [];
        for (let i = 1; i < platforms.length; i++) {
            if (i % 2 === 1 || level < 12) {
                coins.push({
                    x: platforms[i].x + platforms[i].width / 2,
                    y: platforms[i].y - 25,
                    radius: 8,
                    collected: false
                });
            }
        }

        // หนามอันตราย
        const spikes = [];
        if (level >= 3) {
            const spikeW = Math.min(w * 0.4, w * 0.12 + (level * 0.006 * w));
            spikes.push({
                x: w * 0.32,
                y: h - 34,
                width: spikeW,
                height: 14
            });
        }

        // ศัตรู
        const enemies = [];
        if (level >= 2) {
            const topPlat = platforms[platforms.length - 2] || platforms[1];
            const isRanged = (level >= 12 && level % 3 === 0);
            enemies.push({
                x: topPlat.x + 5,
                y: topPlat.y - 28,
                width: 32,
                height: 28,
                vx: isRanged ? 0 : (1.0 + level * 0.025),
                minX: topPlat.x,
                maxX: topPlat.x + topPlat.width - 32,
                isDefeated: false,
                isRanged: isRanged,
                shootTimer: 0
            });
        }

        if (level >= 18) {
            const midPlat = platforms[Math.floor(platforms.length / 2)];
            enemies.push({
                x: midPlat.x + 5,
                y: midPlat.y - 28,
                width: 32,
                height: 28,
                vx: 1.2 + (level * 0.02),
                minX: midPlat.x,
                maxX: midPlat.x + midPlat.width - 32,
                isDefeated: false,
                isRanged: false
            });
        }

        // ไอเทมเสริมพลัง
        const powerups = [];
        if (level % 2 === 0 || level > 25) {
            const pPlat = platforms[1];
            const pType = level % 3 === 0 ? 'shield' : (level % 3 === 1 ? 'magnet' : 'boost');
            powerups.push({
                x: pPlat.x + pPlat.width / 2,
                y: pPlat.y - 30,
                type: pType,
                collected: false,
                radius: 10
            });
        }

        // จุดเซฟ Checkpoint
        let checkpoint = null;
        if (level >= 4 && level % 3 === 0) {
            const midP = platforms[Math.floor(platforms.length / 2)];
            checkpoint = {
                x: midP.x + midP.width / 2 - 9,
                y: midP.y - 30,
                width: 18,
                height: 30,
                active: false
            };
        }

        // กุญแจและประตูทางออก
        const highestPlat = platforms[platforms.length - 1];
        const keyPlat = platforms[Math.floor(platforms.length / 2)];

        const keyItem = {
            x: keyPlat.x + keyPlat.width / 2 - 10,
            y: keyPlat.y - 25,
            width: 20,
            height: 20,
            collected: false
        };

        const goal = {
            x: highestPlat.x + highestPlat.width / 2 - 15,
            y: highestPlat.y - 40,
            width: 30,
            height: 40,
            isLocked: true
        };

        return {
            theme,
            targetTime,
            lavaSpeed,
            checkpoint,
            platforms,
            coins,
            spikes,
            springs: [],
            enemies,
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
        this.particles = [];
        this.floatingTexts = [];
        this.projectiles = [];

        const currentLevel = store.getState().level;

        // ตรวจสอบเงื่อนไขเมื่อผ่านครบ 40 ด่าน
        if (currentLevel > 40) {
            this.isGameCleared = true;
            this.bannerText = '🎉 ยินดีด้วย! คุณพิชิตครบทั้ง 40 ด่านสำเร็จ!';
            this.bannerTimer = 999999;
            return;
        }

        this.isGameCleared = false;
        const levelData = this.getLevelData(currentLevel, w, h);

        this.spawnPoint = { x: 25, y: h - 140 };

        this.player = {
            x: this.spawnPoint.x,
            y: this.spawnPoint.y,
            width: 36,  // Hitbox กว้าง 36 (Physical Size คงเดิมเพื่อป้องกันการชนแท่นบน)
            height: 36, // Hitbox สูง 36 (Physical Size คงเดิมเพื่อป้องกันการชนแท่นบน)
            vx: 0,
            vy: 0,
            speed: 4.8,
            jumpPower: -7.5,
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
        if (this.isGameCleared) return;
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
        if (this.isGameCleared) return;
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
        if (this.isGameCleared) return;
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
        if (state.isGameOver || state.activeTab !== 'game' || this.isGameCleared) return;

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
        const time = this.levelTime * 0.02;

        if (this.currentTheme === 'volcano') {
            const caveGrad = this.ctx.createLinearGradient(0, 0, 0, h);
            caveGrad.addColorStop(0, '#0f0d13');
            caveGrad.addColorStop(0.5, '#1c1921');
            caveGrad.addColorStop(1, '#3b1206');
            this.ctx.fillStyle = caveGrad;
            this.ctx.fillRect(0, 0, w, h);

            // Parallax Lava Mountains Background
            this.ctx.fillStyle = 'rgba(69, 26, 3, 0.45)';
            this.ctx.beginPath();
            this.ctx.moveTo(0, h);
            for (let x = 0; x <= w; x += 20) {
                const y = h - 120 - Math.sin(x * 0.01) * 40 - Math.cos(x * 0.02) * 20;
                this.ctx.lineTo(x, y);
            }
            this.ctx.lineTo(w, h);
            this.ctx.fill();

            // Lava Ambient Heat Glow
            const glowGrad = this.ctx.createRadialGradient(w / 2, h, 20, w / 2, h, h * 0.85);
            glowGrad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
            glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            this.ctx.fillStyle = glowGrad;
            this.ctx.fillRect(0, 0, w, h);

        } else if (this.currentTheme === 'night') {
            const nightGrad = this.ctx.createLinearGradient(0, 0, 0, h);
            nightGrad.addColorStop(0, '#030712');
            nightGrad.addColorStop(0.6, '#0f172a');
            nightGrad.addColorStop(1, '#1e1b4b');
            this.ctx.fillStyle = nightGrad;
            this.ctx.fillRect(0, 0, w, h);

            // Glowing Moon with Aura
            const moonX = w * 0.82;
            const moonY = 65;
            const moonGlow = this.ctx.createRadialGradient(moonX, moonY, 15, moonX, moonY, 60);
            moonGlow.addColorStop(0, 'rgba(224, 231, 255, 0.7)');
            moonGlow.addColorStop(1, 'rgba(224, 231, 255, 0)');
            this.ctx.fillStyle = moonGlow;
            this.ctx.fillRect(moonX - 60, moonY - 60, 120, 120);

            this.ctx.fillStyle = '#f8fafc';
            this.ctx.beginPath();
            this.ctx.arc(moonX, moonY, 22, 0, Math.PI * 2);
            this.ctx.fill();

            // Twinkling Stars
            const stars = [
                { x: w * 0.1, y: 40, s: 2 }, { x: w * 0.35, y: 80, s: 1.5 }, 
                { x: w * 0.55, y: 35, s: 2.5 }, { x: w * 0.72, y: 110, s: 1.8 },
                { x: w * 0.22, y: 130, s: 2 }, { x: w * 0.9, y: 45, s: 1.2 }
            ];
            stars.forEach((st, idx) => {
                const twinkle = Math.sin(time * 3 + idx) * 0.4 + 0.6;
                this.ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
                this.ctx.fillRect(st.x, st.y, st.s, st.s);
            });

            // Parallax Distant Night City/Mountains
            this.ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
            this.ctx.beginPath();
            this.ctx.moveTo(0, h);
            for (let x = 0; x <= w; x += 15) {
                const y = h - 100 - Math.sin(x * 0.015 + 1) * 35;
                this.ctx.lineTo(x, y);
            }
            this.ctx.lineTo(w, h);
            this.ctx.fill();

        } else {
            // Sky Theme
            const skyGrad = this.ctx.createLinearGradient(0, 0, 0, h);
            skyGrad.addColorStop(0, '#0284c7');
            skyGrad.addColorStop(0.5, '#38bdf8');
            skyGrad.addColorStop(1, '#bae6fd');
            this.ctx.fillStyle = skyGrad;
            this.ctx.fillRect(0, 0, w, h);

            // Parallax Animated Clouds
            const clouds = [
                { x: (w * 0.12 + time * 15) % (w + 100) - 50, y: 70, scale: 0.85 },
                { x: (w * 0.48 + time * 10) % (w + 120) - 60, y: 115, scale: 1.1 },
                { x: (w * 0.78 + time * 20) % (w + 80) - 40, y: 140, scale: 0.75 }
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
            this.ctx.restore();
            return;
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

        // Render Rising Animated Lava with Sine Wave
        if (this.lava) {
            this.ctx.save();
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#f97316';

            const lavaGrad = this.ctx.createLinearGradient(0, this.lava.y, 0, this.canvas.height);
            lavaGrad.addColorStop(0, '#f97316');
            lavaGrad.addColorStop(0.3, '#ea580c');
            lavaGrad.addColorStop(1, '#991b1b');
            this.ctx.fillStyle = lavaGrad;

            this.ctx.beginPath();
            this.ctx.moveTo(0, this.lava.y);

            for (let x = 0; x <= this.canvas.width; x += 8) {
                const waveY = this.lava.y + Math.sin((x + this.levelTime * 4) * 0.04) * 4;
                this.ctx.lineTo(x, waveY);
            }
            this.ctx.lineTo(this.canvas.width, this.canvas.height + 100);
            this.ctx.lineTo(0, this.canvas.height + 100);
            this.ctx.closePath();
            this.ctx.fill();

            this.ctx.strokeStyle = '#fef08a';
            this.ctx.lineWidth = 2.5;
            this.ctx.stroke();
            this.ctx.restore();
        }

        // Render Goal with Portal Neon Effect
        if (this.goal) {
            this.ctx.save();
            const isLocked = this.goal.isLocked;

            this.ctx.shadowBlur = 15;
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

        // Render Platforms with Rounded Caps & Gradients
        this.platforms.forEach(plat => {
            if (plat.isDestroyed) return;
            if (plat.type === 'phase' && !plat.active) return;

            this.ctx.save();
            let bodyGrad, topColor;

            if (plat.type === 'bounce') {
                bodyGrad = '#7e22ce';
                topColor = '#f472b6';
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

            if (plat.type === 'conveyor_left' || plat.type === 'conveyor_right') {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
                const dir = plat.type === 'conveyor_left' ? -1 : 1;
                const offset = (this.levelTime * 2 * dir) % 12;
                for (let cx = plat.x + offset; cx < plat.x + plat.width; cx += 12) {
                    if (cx >= plat.x && cx <= plat.x + plat.width - 4) {
                        this.ctx.fillRect(cx, plat.y + 6, 4, 4);
                    }
                }
            }

            this.ctx.restore();
        });

        // Render Enemies (Metal Leafy with Knife)
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
                // Vector Metal Leafy Draw
                const w = renderW;
                const h = renderH;

                this.ctx.translate(0, -h / 2);

                // Leaf Body (Metal Gray Gradient)
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

                // Leaf Center Seam Line
                this.ctx.strokeStyle = '#374151';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(0, -h / 2 + 2);
                this.ctx.lineTo(0, h / 2 - 2);
                this.ctx.stroke();

                // Eyes (Sinister Slits)
                this.ctx.fillStyle = '#000000';
                this.ctx.beginPath();
                this.ctx.ellipse(-w / 5, -h / 8, 2, 4, -0.2, 0, Math.PI * 2);
                this.ctx.ellipse(w / 5, -h / 8, 2, 4, 0.2, 0, Math.PI * 2);
                this.ctx.fill();

                // Sinister Smile
                this.ctx.fillStyle = '#ffffff';
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 1.5;
                this.ctx.beginPath();
                this.ctx.arc(0, h / 10, w / 3.5, 0.1 * Math.PI, 0.9 * Math.PI, false);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();

                // Black Arm & Knife
                this.ctx.strokeStyle = '#000000';
                this.ctx.lineWidth = 2.5;
                this.ctx.beginPath();
                this.ctx.moveTo(w / 3, 0);
                this.ctx.lineTo(w / 1.4, -h / 6);
                this.ctx.stroke();

                // Knife Handle
                this.ctx.fillStyle = '#78350f';
                this.ctx.fillRect(w / 1.4 - 2, -h / 6 - 8, 4, 8);

                // Knife Blade
                this.ctx.fillStyle = '#e5e7eb';
                this.ctx.strokeStyle = '#9ca3af';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(w / 1.4, -h / 6 - 8);
                this.ctx.lineTo(w / 1.4 - 4, -h / 6 - 22);
                this.ctx.quadraticCurveTo(w / 1.4 + 6, -h / 6 - 16, w / 1.4 + 2, -h / 6 - 8);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
            }

            this.ctx.restore();
        });

        // Render Projectiles
        this.projectiles.forEach(pj => {
            this.ctx.save();
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = pj.color;
            this.ctx.beginPath();
            this.ctx.arc(pj.x, pj.y, pj.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = pj.color;
            this.ctx.fill();
            this.ctx.restore();
        });

        // Render Springs
        this.springs.forEach(sp => {
            this.ctx.fillStyle = '#ec4899';
            this.ctx.fillRect(sp.x, sp.y, sp.width, sp.height);
        });

        // Render Floating Vector Key Item
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

                this.ctx.beginPath();
                this.ctx.arc(pw.x - 3, pw.y - 3, pulseRadius * 0.4, 0, Math.PI * 2);
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fill();

                this.ctx.restore();
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

        // Render Coins with 3D Spin Effect
        this.coins.forEach(coin => {
            if (!coin.collected) {
                const spinScale = Math.abs(Math.sin(this.levelTime * 0.08));
                this.ctx.save();
                this.ctx.translate(coin.x, coin.y);
                this.ctx.scale(spinScale, 1);

                this.ctx.shadowBlur = 8;
                this.ctx.shadowColor = '#facc15';
                this.ctx.beginPath();
                this.ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = '#facc15';
                this.ctx.fill();
                this.ctx.lineWidth = 2;
                this.ctx.strokeStyle = '#eab308';
                this.ctx.stroke();

                this.ctx.beginPath();
                this.ctx.arc(0, 0, coin.radius * 0.5, 0, Math.PI * 2);
                this.ctx.fillStyle = '#fef08a';
                this.ctx.fill();
                this.ctx.restore();
            }
        });

        // Render Animated Player
        if (this.playerImg.complete && this.playerImg.naturalWidth !== 0) {
            if (p.invincibleTimer > 0 && Math.floor(p.invincibleTimer / 4) % 2 === 0) {
                // Flash when invincible
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

                // 👈 เพิ่มขนาดตัวละครเป็น 2.0x ให้สูงใหญ่ชัดเจนสะใจบนหน้าจอ
                const renderW = p.width * 2.0;
                const renderH = p.height * 2.0;

                if (p.hasShield) {
                    this.ctx.beginPath();
                    // 👈 กระชับวงกลมโล่ให้อยู่พอดีตัว ไม่ใหญ่เว่อร์เกินไป
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
