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

        // Physics Constants (ปรับแรงโน้มถ่วงให้นุ่มนวลขึ้น)
        this.GRAVITY = 0.38;
        
        // Game Entities
        this.player = null;
        this.platforms = [];
        this.coins = [];
        this.spikes = [];
        this.springs = [];
        this.powerups = [];
        this.keyItem = null;
        this.goal = null;

        // Level Completion Banner & Stars State
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
            // ด่าน 1: ขยายแท่นให้กว้างขึ้น
            {
                platforms: [
                    { x: 0, y: h - 20, width: w, height: 20, type: 'normal' },
                    { x: 20, y: h - 80, width: 110, height: 14, type: 'normal' },
                    { x: 140, y: h - 150, width: 110, height: 14, type: 'moving', vx: 1.2, minX: 110, maxX: w - 80 },
                    { x: 30, y: h - 230, width: 110, height: 14, type: 'normal' },
                    { x: 180, y: h - 310, width: 130, height: 14, type: 'normal' }
                ],
                coins: [
                    { x: 70, y: h - 110, radius: 8, collected: false },
                    { x: 200, y: h - 180, radius: 8, collected: false },
                    { x: 80, y: h - 260, radius: 8, collected: false }
                ],
                spikes: [],
                springs: [
                    { x: 95, y: h - 30, width: 28, height: 10 }
                ],
                powerups: [
                    { x: 50, y: h - 260, type: 'magnet', collected: false, radius: 10 }
                ],
                keyItem: { x: 50, y: h - 110, width: 20, height: 20, collected: false },
                goal: { x: 230, y: h - 350, width: 30, height: 40, isLocked: true }
            },
            // ด่าน 2: ขยายแท่นพัง ลดปริมาณหนาม
            {
                platforms: [
                    { x: 0, y: h - 20, width: w, height: 20, type: 'normal' },
                    { x: 20, y: h - 80, width: 100, height: 14, type: 'normal' },
                    { x: 140, y: h - 140, width: 90, height: 14, type: 'crumble', timer: 0, isCrumbling: false, isDestroyed: false },
                    { x: 250, y: h - 210, width: 100, height: 14, type: 'normal' },
                    { x: 120, y: h - 280, width: 110, height: 14, type: 'normal' },
                    { x: 10, y: h - 340, width: 100, height: 14, type: 'normal' }
                ],
                coins: [
                    { x: 170, y: h - 170, radius: 8, collected: false },
                    { x: 150, y: h - 310, radius: 8, collected: false }
                ],
                spikes: [
                    { x: 140, y: h - 34, width: 70, height: 14 }
                ],
                springs: [
                    { x: 280, y: h - 220, width: 28, height: 10 }
                ],
                powerups: [
                    { x: 40, y: h - 110, type: 'shield', collected: false, radius: 10 }
                ],
                keyItem: { x: 280, y: h - 240, width: 20, height: 20, collected: false },
                goal: { x: 30, y: h - 380, width: 30, height: 40, isLocked: true }
            },
            // ด่าน 3: เอาหนามที่ทับกุญแจออก ขยายแท่นให้เหยียบสบายขึ้น
            {
                platforms: [
                    { x: 0, y: h - 20, width: w, height: 20, type: 'normal' },
                    { x: 20, y: h - 80, width: 100, height: 14, type: 'normal' },
                    { x: 160, y: h - 160, width: 100, height: 14, type: 'moving', vx: -1.2, minX: 120, maxX: w - 80 },
                    { x: 40, y: h - 240, width: 90, height: 14, type: 'crumble', timer: 0, isCrumbling: false, isDestroyed: false },
                    { x: 170, y: h - 320, width: 120, height: 14, type: 'normal' }
                ],
                coins: [
                    { x: 210, y: h - 190, radius: 8, collected: false },
                    { x: 70, y: h - 270, radius: 8, collected: false }
                ],
                spikes: [
                    { x: 150, y: h - 34, width: Math.max(40, w - 200), height: 14 }
                ],
                springs: [],
                powerups: [
                    { x: 50, y: h - 110, type: 'boost', collected: false, radius: 10 }
                ],
                keyItem: { x: 210, y: h - 190, width: 20, height: 20, collected: false },
                goal: { x: 210, y: h - 360, width: 30, height: 40, isLocked: true }
            }
        ];

        const index = (level - 1) % levels.length;
        const selected = levels[index];

        return {
            platforms: selected.platforms.map(p => ({ ...p })),
            coins: selected.coins.map(c => ({ ...c })),
            spikes: selected.spikes.map(s => ({ ...s })),
            springs: selected.springs.map(sp => ({ ...sp })),
            powerups: selected.powerups.map(pw => ({ ...pw })),
            keyItem: selected.keyItem ? { ...selected.keyItem } : null,
            goal: { ...selected.goal }
        };
    }

    resetEntities() {
        const w = this.canvas.width || 360;
        const h = this.canvas.height || 400;

        this.player = {
            x: 25,
            y: h - 140,
            width: 60,
            height: 60,
            vx: 0,
            vy: 0,
            speed: 4.8,          // เพิ่มความเร็วเคลื่อนที่
            jumpPower: -11.0,    // เพิ่มความสูงการกระโดด
            isGrounded: false,
            color: '#ef4444',
            
            // Player Mechanics
            jumpsLeft: 2,
            isDashing: false,
            dashTimer: 0,
            dashCooldown: 0,
            isWallSliding: false,

            // Active Power-ups State (ติดโล่ป้องกันให้ตั้งแต่เริ่มเกม!)
            hasShield: true,
            magnetTimer: 0,
            boostTimer: 0,

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

        this.platforms = levelData.platforms;
        this.coins = levelData.coins;
        this.spikes = levelData.spikes;
        this.springs = levelData.springs;
        this.powerups = levelData.powerups;
        this.keyItem = levelData.keyItem;
        this.goal = levelData.goal;
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
            p.dashCooldown = 30; // ลดคูลดาวน์พุ่งเหลือ 0.5 วินาที
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
            // Horizontal Movement & Facing Direction
            if (this.keys.left) {
                p.vx = -currentSpeed;
                p.facing = 'left';
            } else if (this.keys.right) {
                p.vx = currentSpeed;
                p.facing = 'right';
            } else {
                p.vx = 0;
            }

            // Apply Gravity
            p.vy += this.GRAVITY;
        }

        if (p.dashCooldown > 0) p.dashCooldown--;

        // Position Updates
        p.x += p.vx;
        p.y += p.vy;

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

        // Platforms Mechanics (Normal, Moving, Crumbling)
        p.isGrounded = false;
        this.platforms.forEach(plat => {
            if (plat.isDestroyed) return;

            // Moving Platform Updates
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
                p.isGrounded = true;
                p.jumpsLeft = 2; // Reset Double Jump
                p.vy = 0;
                p.y = plat.y - p.height;

                // Move Player with Moving Platform
                if (plat.type === 'moving') {
                    p.x += plat.vx;
                }

                // Crumbling Platform Trigger
                if (plat.type === 'crumble') {
                    plat.isCrumbling = true;
                }
            }

            // Update Crumble Timers (พังช้าลง)
            if (plat.isCrumbling) {
                plat.timer++;
                if (plat.timer > 50) {
                    plat.isDestroyed = true;
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

        // Key Collection Detection
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

        // Power-ups Collection Detection
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

        // Coins Collection & Magnet Effect
        this.coins.forEach(coin => {
            if (!coin.collected) {
                const dx = (p.x + p.width / 2) - coin.x;
                const dy = (p.y + p.height / 2) - coin.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Magnet Attraction Logic
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

        // Spike Obstacle Collision Detection
        this.spikes.forEach(spike => {
            if (
                p.x < spike.x + spike.width &&
                p.x + p.width > spike.x &&
                p.y < spike.y + spike.height &&
                p.y + p.height > spike.y
            ) {
                if (p.hasShield) {
                    p.hasShield = false; // โล่แตกช่วยชีวิต 1 ครั้ง
                    p.vy = -8;
                } else if (!p.isDashing) {
                    store.setGameOver(true);
                }
            }
        });

        // Goal Collision Detection
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
            let stars = '⭐';
            if (coinsCollected === totalCoins) stars = '⭐⭐⭐';
            else if (coinsCollected > 0) stars = '⭐⭐';

            store.addScore(100);
            store.nextLevel();
            this.bannerText = `ปลดล็อกด่าน ${store.getState().level}! ${stars}`;
            this.bannerTimer = 90;
            this.resetEntities();
        }

        // Check Fall Off Condition
        if (p.y > this.canvas.height + 40) {
            if (p.hasShield) {
                p.hasShield = false;
                p.y = this.canvas.height - 120;
                p.vy = -10;
            } else {
                store.setGameOver(true);
            }
        }

        // Procedural Animation Logic
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

    drawSkyBackground() {
        const w = this.canvas.width;
        const h = this.canvas.height;

        const skyGrad = this.ctx.createLinearGradient(0, 0, 0, h);
        skyGrad.addColorStop(0, '#0284c7');
        skyGrad.addColorStop(0.5, '#38bdf8');
        skyGrad.addColorStop(1, '#e0f2fe');
        this.ctx.fillStyle = skyGrad;
        this.ctx.fillRect(0, 0, w, h);

        const sunX = w * 0.82;
        const sunY = 55;
        const sunGlow = this.ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 60);
        sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
        sunGlow.addColorStop(0.4, 'rgba(253, 224, 71, 0.4)');
        sunGlow.addColorStop(1, 'rgba(253, 224, 71, 0)');
        this.ctx.fillStyle = sunGlow;
        this.ctx.beginPath();
        this.ctx.arc(sunX, sunY, 60, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#fef08a';
        this.ctx.beginPath();
        this.ctx.arc(sunX, sunY, 22, 0, Math.PI * 2);
        this.ctx.fill();

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

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Render Sunny Sky
        this.drawSkyBackground();

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
            this.ctx.fillStyle = plat.type === 'crumble' ? '#78350f' : '#334155';
            this.ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            this.ctx.fillStyle = plat.type === 'crumble' ? '#f59e0b' : '#22c55e';
            this.ctx.fillRect(plat.x, plat.y, plat.width, 3);
        });

        // Render Springs
        this.springs.forEach(sp => {
            this.ctx.fillStyle = '#a855f7';
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

        // Render Animated Player Image & Active Shield Aura
        const p = this.player;
        if (this.playerImg.complete && this.playerImg.naturalWidth !== 0) {
            this.ctx.save();
            const centerX = p.x + p.width / 2;
            const centerY = p.y + p.height / 2;
            this.ctx.translate(centerX, centerY);

            if (p.facing === 'left') {
                this.ctx.scale(-1, 1);
            }

            this.ctx.rotate(p.rotation);
            this.ctx.scale(p.scaleX, p.scaleY);

            // Active Shield Aura Effect
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

        // Render Active Status HUD Indicators
        this.ctx.font = '12px sans-serif';
        this.ctx.fillStyle = '#ffffff';
        if (p.hasShield) this.ctx.fillText('🛡️ โล่ทำงาน', 12, 24);
        if (p.magnetTimer > 0) this.ctx.fillText('🧲 แม่เหล็ก', 12, 40);
        if (p.boostTimer > 0) this.ctx.fillText('🔥 สปีดไฟ', 12, 56);

        // Render Level Up Banner Text
        if (this.bannerTimer > 0) {
            this.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            this.ctx.fillRect(0, this.canvas.height / 2 - 30, this.canvas.width, 60);
            this.ctx.fillStyle = '#facc15';
            this.ctx.font = 'bold 20px sans-serif';
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
