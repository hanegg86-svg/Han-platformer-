import { store } from './store.js';
import { UIManager } from './ui.js';

class PlatformerGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ui = new UIManager();
        
        this.keys = { left: false, right: false, jump: false, dash: false };
        this.animationFrameId = null;

        // Sound Setup
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
        this.lava = null;
        this.keyItem = null;
        this.goal = null;

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
            // ด่าน 1: ทุ่งหญ้า + แท่นเด้งดึ๋ง Bounce
            {
                theme: 'sky',
                targetTime: 18,
                lavaSpeed: 0.10,
                platforms: [
                    { x: 0, y: h - 20, width: w, height: 20, type: 'normal' },
                    { x: 20, y: h - 80, width: 110, height: 14, type: 'normal' },
                    { x: 150, y: h - 140, width: 80, height: 14, type: 'bounce' },
                    { x: 40, y: h - 250, width: 110, height: 14, type: 'normal' },
                    { x: 180, y: h - 310, width: 130, height: 14, type: 'normal' }
                ],
                coins: [
                    { x: 70, y: h - 110, radius: 8, collected: false },
                    { x: 190, y: h - 200, radius: 8, collected: false },
                    { x: 80, y: h - 280, radius: 8, collected: false }
                ],
                spikes: [],
                springs: [],
                enemies: [
                    { x: 180, y: h - 330, width: 24, height: 20, vx: 1.0, minX: 180, maxX: 280, isDefeated: false }
                ],
                powerups: [
                    { x: 50, y: h - 280, type: 'magnet', collected: false, radius: 10 }
                ],
                keyItem: { x: 50, y: h - 110, width: 20, height: 20, collected: false },
                goal: { x: 230, y: h - 350, width: 30, height: 40, isLocked: true }
            },
            // ด่าน 2: ถ้ำหิมะลาวา + แท่นน้ำแข็งลื่น Ice Platforms
            {
                theme: 'volcano',
                targetTime: 16,
                lavaSpeed: 0.20,
                platforms: [
                    { x: 0, y: h - 20, width: w, height: 20, type: 'normal' },
                    { x: 20, y: h - 80, width: 110, height: 14, type: 'ice' },
                    { x: 150, y: h - 140, width: 100, height: 14, type: 'crumble', timer: 0, isCrumbling: false, isDestroyed: false },
                    { x: 20, y: h - 220, width: 120, height: 14, type: 'ice' },
                    { x: 170, y: h - 300, width: 110, height: 14, type: 'normal' }
                ],
                coins: [
                    { x: 70, y: h - 110, radius: 8, collected: false },
                    { x: 200, y: h - 170, radius: 8, collected: false }
                ],
                spikes: [
                    { x: 140, y: h - 34, width: 70, height: 14 }
                ],
                springs: [],
                enemies: [
                    { x: 30, y: h - 240, width: 24, height: 20, vx: 1.2, minX: 20, maxX: 120, isDefeated: false }
                ],
                powerups: [
                    { x: 40, y: h - 110, type: 'shield', collected: false, radius: 10 }
                ],
                keyItem: { x: 200, y: h - 330, width: 20, height: 20, collected: false },
                goal: { x: 30, y: h - 260, width: 30, height: 40, isLocked: true }
            },
            // ด่าน 3: ไซเบอร์นีออน + แท่นสายพาน Conveyor Belts
            {
                theme: 'night',
                targetTime: 15,
                lavaSpeed: 0.28,
                platforms: [
                    { x: 0, y: h - 20, width: w, height: 20, type: 'normal' },
                    { x: 20, y: h - 80, width: 120, height: 14, type: 'conveyor_right' },
                    { x: 170, y: h - 150, width: 120, height: 14, type: 'conveyor_left' },
                    { x: 30, y: h - 230, width: 110, height: 14, type: 'bounce' },
                    { x: 170, y: h - 320, width: 120, height: 14, type: 'normal' }
                ],
                coins: [
                    { x: 80, y: h - 110, radius: 8, collected: false },
                    { x: 220, y: h - 180, radius: 8, collected: false }
                ],
                spikes: [
                    { x: 120, y: h - 34, width: Math.max(40, w - 160), height: 14 }
                ],
                springs: [],
                enemies: [
                    { x: 180, y: h - 170, width: 24, height: 20, vx: -1.2, minX: 170, maxX: 270, isDefeated: false }
                ],
                powerups: [
                    { x: 50, y: h - 110, type: 'boost', collected: false, radius: 10 }
                ],
                keyItem: { x: 220, y: h - 180, width: 20, height: 20, collected: false },
                goal: { x: 210, y: h - 360, width: 30, height: 40, isLocked: true }
            },
            // ด่าน 4: ถ้ำภูเขาไฟ + แท่นสลับจังหวะติด-ดับ Phase Platforms
            {
                theme: 'volcano',
                targetTime: 14,
                lavaSpeed: 0.32,
                platforms: [
                    { x: 0, y: h - 20, width: w, height: 20, type: 'normal' },
                    { x: 20, y: h - 80, width: 90, height: 14, type: 'normal' },
                    { x: 140, y: h - 150, width: 90, height: 14, type: 'phase', timer: 0, active: true },
                    { x: 20, y: h - 230, width: 90, height: 14, type: 'phase', timer: 45, active: false },
                    { x: 160, y: h - 310, width: 120, height: 14, type: 'normal' }
                ],
                coins: [
                    { x: 180, y: h - 180, radius: 8, collected: false },
                    { x: 60, y: h - 260, radius: 8, collected: false }
                ],
                spikes: [
                    { x: 110, y: h - 34, width: 100, height: 14 }
                ],
                springs: [
                    { x: 30, y: h - 90, width: 28, height: 10 }
                ],
                enemies: [
                    { x: 170, y: h - 330, width: 24, height: 20, vx: 1.5, minX: 160, maxX: 260, isDefeated: false }
                ],
                powerups: [
                    { x: 200, y: h - 340, type: 'shield', collected: false, radius: 10 }
                ],
                keyItem: { x: 60, y: h - 260, width: 20, height: 20, collected: false },
                goal: { x: 210, y: h - 350, width: 30, height: 40, isLocked: true }
            },
            // ด่าน 5: ไซเบอร์กอนต์เล็ต (ผสมผสานทุกกลไก!)
            {
                theme: 'night',
                targetTime: 15,
                lavaSpeed: 0.38,
                platforms: [
                    { x: 0, y: h - 20, width: w, height: 20, type: 'normal' },
                    { x: 10, y: h - 80, width: 90, height: 14, type: 'conveyor_right' },
                    { x: 130, y: h - 140, width: 80, height: 14, type: 'ice' },
                    { x: 230, y: h - 200, width: 80, height: 14, type: 'bounce' },
                    { x: 110, y: h - 270, width: 80, height: 14, type: 'phase', timer: 0, active: true },
                    { x: 10, y: h - 340, width: 100, height: 14, type: 'normal' }
                ],
                coins: [
                    { x: 170, y: h - 170, radius: 8, collected: false },
                    { x: 150, y: h - 300, radius: 8, collected: false }
                ],
                spikes: [
                    { x: 100, y: h - 34, width: 120, height: 14 }
                ],
                springs: [],
                enemies: [
                    { x: 20, y: h - 360, width: 24, height: 20, vx: 1.5, minX: 10, maxX: 90, isDefeated: false }
                ],
                powerups: [
                    { x: 260, y: h - 230, type: 'boost', collected: false, radius: 10 }
                ],
                keyItem: { x: 170, y: h - 170, width: 20, height: 20, collected: false },
                goal: { x: 30, y: h - 380, width: 30, height: 40, isLocked: true }
            }
        ];

        const index = (level - 1) % levels.length;
        const selected = levels[index];

        return {
            theme: selected.theme,
            targetTime: selected.targetTime,
            lavaSpeed: selected.lavaSpeed,
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

        this.player = {
            x: 25,
            y: h - 140,
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
            invincibleTimer: 0, // เวลาอมตะชั่วคราวหลังได้รับความเสียหาย
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

        const currentLevel = store.getState().level;
        const levelData = this.getLevelData(currentLevel, w, h);

        this.currentTheme = levelData.theme;
        this.targetTime = levelData.targetTime;
        this.platforms = levelData.platforms;
        this.coins = levelData.coins;
        this.spikes = levelData.spikes;
        this.springs = levelData.springs;
        this.enemies = levelData.enemies;
        this.powerups = levelData.powerups;
        this.keyItem = levelData.keyItem;
        this.goal = levelData.goal;

        // ลาวาไต่ระดับ
        this.lava = {
            y: h + 120,
            speed: levelData.lavaSpeed
        };
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
        } else if (p.isWallSliding) {
            p.vy = p.jumpPower;
            p.vx = p.facing === 'left' ? p.speed : -p.speed;
            p.isWallSliding = false;
        } else if (p.jumpsLeft > 0) {
            p.vy = p.jumpPower * 0.9;
            p.jumpsLeft--;
        }
    }

    handleDashTrigger() {
        const p = this.player;
        if (p.dashCooldown <= 0 && !p.isDashing) {
            p.isDashing = true;
            p.dashTimer = 10;
            p.dashCooldown = 30;
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

    update() {
        const state = store.getState();
        if (state.isGameOver || state.activeTab !== 'game') return;

        const p = this.player;

        this.levelTime++;

        // ตัวนับเวลาอมตะ
        if (p.invincibleTimer > 0) p.invincibleTimer--;

        // อัปเดตลาวาไต่ระดับ
        if (this.lava) {
            this.lava.y -= this.lava.speed;
            if (p.y + p.height > this.lava.y) {
                if (p.invincibleTimer <= 0) {
                    if (p.hasShield) {
                        p.hasShield = false;
                        p.vy = -12;
                        p.invincibleTimer = 45;
                    } else if (!p.isDashing && !state.isGameOver) {
                        store.setGameOver(true);
                    }
                }
            }
        }

        // Active Power-up Timers & Boosts
        if (p.boostTimer > 0) p.boostTimer--;
        if (p.magnetTimer > 0) p.magnetTimer--;

        const currentSpeed = p.boostTimer > 0 ? p.speed * 1.5 : p.speed;

        // Dash Mechanics Logic
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

        // Position Updates
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

        // Wall Sliding Logic
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

        // Screen Boundary Constraints
        if (p.x < 0) p.x = 0;
        if (p.x + p.width > this.canvas.width) p.x = this.canvas.width - p.width;

        // Platforms Mechanics
        p.isGrounded = false;
        this.platforms.forEach(plat => {
            if (plat.isDestroyed) return;

            // แท่นสลับจังหวะติด-ดับ (Phase Platform)
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

            // Collision Detection
            if (
                p.x < plat.x + plat.width &&
                p.x + p.width > plat.x &&
                p.y + p.height >= plat.y &&
                p.y + p.height <= plat.y + plat.height + p.vy &&
                p.vy >= 0
            ) {
                // แท่นเด้งดึ๋ง (Bounce)
                if (plat.type === 'bounce') {
                    p.vy = -13.0;
                    p.isGrounded = false;
                    p.jumpsLeft = 1;
                    return;
                }

                p.isGrounded = true;
                p.jumpsLeft = 2;
                p.vy = 0;
                p.y = plat.y - p.height;

                if (plat.type === 'moving') p.x += plat.vx;
                if (plat.type === 'crumble') plat.isCrumbling = true;

                // แท่นน้ำแข็งลื่น (Ice)
                if (plat.type === 'ice') {
                    if (!this.keys.left && !this.keys.right) {
                        p.vx *= 0.96;
                    }
                }

                // แท่นสายพาน (Conveyor Belts)
                if (plat.type === 'conveyor_left') p.x -= 2.2;
                if (plat.type === 'conveyor_right') p.x += 2.2;
            }

            if (plat.isCrumbling) {
                plat.timer++;
                if (plat.timer > 50) plat.isDestroyed = true;
            }
        });

        // Enemies Patrol & Stomp Logic
        this.enemies.forEach(enemy => {
            if (enemy.isDefeated) return;

            enemy.x += enemy.vx;
            if (enemy.x <= enemy.minX || enemy.x + enemy.width >= enemy.maxX) {
                enemy.vx *= -1;
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
                } else if (p.invincibleTimer <= 0) {
                    if (p.hasShield) {
                        p.hasShield = false;
                        p.vy = -6;
                        p.invincibleTimer = 45;
                    } else if (!p.isDashing && !state.isGameOver) {
                        store.setGameOver(true);
                    }
                }
            }
        });

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
                }
            }
        });

        // Coins & Magnet
        this.coins.forEach(coin => {
            if (!coin.collected) {
                const dx = (p.x + p.width / 2) - coin.x;
                const dy = (p.y + p.height / 2) - coin.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (p.magnetTimer > 0 && dist < 120) {
                    coin.x += (dx / dist) * -3.5;
                    coin.y += (dy / dist) * -3.5;
                }

                if (dist < coin.radius + p.width / 2) {
                    coin.collected = true;
                    store.addScore(10);
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
                if (p.invincibleTimer <= 0) {
                    if (p.hasShield) {
                        p.hasShield = false;
                        p.vy = -8;
                        p.invincibleTimer = 45;
                    } else if (!p.isDashing && !state.isGameOver) {
                        store.setGameOver(true);
                    }
                }
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
            this.bannerText = `ผ่านด่าน ${store.getState().level - 1}! ${starsStr}`;
            this.bannerTimer = 110;
            this.resetEntities();
        }

        // Check Fall Off Condition
        if (p.y > this.canvas.height + 40) {
            if (p.invincibleTimer <= 0) {
                if (p.hasShield) {
                    p.hasShield = false;
                    p.y = this.canvas.height - 120;
                    p.vy = -10;
                    p.invincibleTimer = 45;
                } else if (!state.isGameOver) {
                    store.setGameOver(true);
                }
            }
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

        this.drawDynamicBackground();

        // Trail FX
        const p = this.player;
        p.trail.forEach(t => {
            this.ctx.beginPath();
            this.ctx.arc(t.x, t.y, 12 * t.alpha, 0, Math.PI * 2);
            this.ctx.fillStyle = t.color;
            this.ctx.globalAlpha = t.alpha;
            this.ctx.fill();
            this.ctx.globalAlpha = 1.0;
        });

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
            this.ctx.fillStyle = this.currentTheme === 'volcano' ? '#ef4444' : '#a855f7';
            this.ctx.beginPath();
            this.ctx.arc(e.x + e.width / 2, e.y + e.height / 2, e.width / 2, Math.PI, 0, false);
            this.ctx.fillRect(e.x, e.y + e.height / 2, e.width, e.height / 2);
            this.ctx.fill();
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(e.x + 4, e.y + 6, 4, 4);
            this.ctx.fillRect(e.x + e.width - 8, e.y + 6, 4, 4);
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

        // Render Animated Player Image
        if (this.playerImg.complete && this.playerImg.naturalWidth !== 0) {
            // กระพริบตัวละครเมื่ออยู่ในสถานะอมตะ
            if (p.invincibleTimer > 0 && Math.floor(p.invincibleTimer / 4) % 2 === 0) {
                // เว้นการเรนเดอร์ชั่วขณะเพื่อให้เกิดเอฟเฟกต์กระพริบ
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

                // Shield Aura
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

        // Render HUD Info
        const elapsed = Math.floor(this.levelTime / 60);
        this.ctx.font = 'bold 12px sans-serif';
        this.ctx.fillStyle = elapsed > this.targetTime ? '#ef4444' : '#ffffff';
        this.ctx.fillText(`⏱️ เวลา: ${elapsed}s / ${this.targetTime}s (ดาว 3)`, 12, 20);

        if (p.hasShield) {
            this.ctx.fillStyle = '#38bdf8';
            this.ctx.fillText('🛡️ โล่ทำงาน', 12, 38);
        }

        // Render Level Banner
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
