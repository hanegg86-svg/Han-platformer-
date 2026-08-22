import { store } from './store.js';
import { UIManager } from './ui.js';

class PlatformerGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ui = new UIManager();
        
        this.keys = { left: false, right: false, jump: false };
        this.animationFrameId = null;

        // Background Music Setup
        this.bgm = new Audio('bgm.mp3');
        this.bgm.loop = true;

        // Physics Constants
        this.GRAVITY = 0.45;
        
        // Game Entities
        this.player = null;
        this.platforms = [];
        this.coins = [];
        this.spikes = [];
        this.goal = null;

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

        // React to sound settings / tab / game over state changes
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
            // ด่าน 1: เริ่มต้น เรียนรู้ระบบกระโดดไปยังเป้าหมาย
            {
                platforms: [
                    { x: 0, y: h - 20, width: w, height: 20 },
                    { x: 40, y: h - 90, width: 100, height: 14 },
                    { x: 180, y: h - 160, width: 100, height: 14 },
                    { x: 60, y: h - 230, width: 100, height: 14 },
                    { x: 210, y: h - 300, width: 110, height: 14 }
                ],
                coins: [
                    { x: 80, y: h - 120, radius: 8, collected: false },
                    { x: 220, y: h - 190, radius: 8, collected: false },
                    { x: 100, y: h - 260, radius: 8, collected: false }
                ],
                spikes: [],
                goal: { x: 250, y: h - 340, width: 30, height: 40 }
            },
            // ด่าน 2: เพิ่มอุปสรรคหนามบนพื้นและบนแท่น
            {
                platforms: [
                    { x: 0, y: h - 20, width: w, height: 20 },
                    { x: 30, y: h - 80, width: 80, height: 14 },
                    { x: 160, y: h - 140, width: 80, height: 14 },
                    { x: 260, y: h - 210, width: 80, height: 14 },
                    { x: 120, y: h - 280, width: 100, height: 14 },
                    { x: 10, y: h - 330, width: 80, height: 14 }
                ],
                coins: [
                    { x: 200, y: h - 170, radius: 8, collected: false },
                    { x: 170, y: h - 310, radius: 8, collected: false }
                ],
                spikes: [
                    { x: 170, y: h - 154, width: 30, height: 14 },
                    { x: 120, y: h - 34, width: 100, height: 14 }
                ],
                goal: { x: 35, y: h - 370, width: 30, height: 40 }
            },
            // ด่าน 3: เพิ่มความยากของการกระโดดและกับดักหนามขนาดใหญ่
            {
                platforms: [
                    { x: 0, y: h - 20, width: w, height: 20 },
                    { x: 50, y: h - 100, width: 70, height: 14 },
                    { x: 180, y: h - 180, width: 70, height: 14 },
                    { x: 50, y: h - 260, width: 70, height: 14 },
                    { x: 180, y: h - 340, width: 100, height: 14 }
                ],
                coins: [
                    { x: 80, y: h - 130, radius: 8, collected: false },
                    { x: 210, y: h - 210, radius: 8, collected: false },
                    { x: 80, y: h - 290, radius: 8, collected: false }
                ],
                spikes: [
                    { x: 50, y: h - 34, width: Math.max(50, w - 100), height: 14 },
                    { x: 200, y: h - 194, width: 30, height: 14 }
                ],
                goal: { x: 220, y: h - 380, width: 30, height: 40 }
            }
        ];

        const index = (level - 1) % levels.length;
        const selected = levels[index];

        return {
            platforms: selected.platforms.map(p => ({ ...p })),
            coins: selected.coins.map(c => ({ ...c })),
            spikes: selected.spikes.map(s => ({ ...s })),
            goal: { ...selected.goal }
        };
    }

    resetEntities() {
        const w = this.canvas.width || 360;
        const h = this.canvas.height || 400;

        this.player = {
            x: 30,
            y: h - 100,
            width: 24,
            height: 32,
            vx: 0,
            vy: 0,
            speed: 4.2,
            jumpPower: -10.5,
            isGrounded: false,
            color: '#ef4444'
        };

        const currentLevel = store.getState().level;
        const levelData = this.getLevelData(currentLevel, w, h);

        this.platforms = levelData.platforms;
        this.coins = levelData.coins;
        this.spikes = levelData.spikes;
        this.goal = levelData.goal;
    }

    setupTouchControls() {
        const bindBtn = (id, key) => {
            const btn = document.getElementById(id);
            const start = (e) => {
                e.preventDefault();
                this.keys[key] = true;
                btn.classList.add('pressed');
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
        bindBtn('btn-jump', 'jump');
    }

    setupKeyboardControls() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = true;
            if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = true;
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') this.keys.jump = true;
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = false;
            if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = false;
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === ' ') this.keys.jump = false;
        });
    }

    handleTabChange(tab) {
        if (tab !== 'game') {
            this.keys.left = false;
            this.keys.right = false;
            this.keys.jump = false;
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

        // Horizontal Movement
        if (this.keys.left) p.vx = -p.speed;
        else if (this.keys.right) p.vx = p.speed;
        else p.vx = 0;

        // Jump Mechanics
        if (this.keys.jump && p.isGrounded) {
            p.vy = p.jumpPower;
            p.isGrounded = false;
        }

        // Apply Gravity
        p.vy += this.GRAVITY;

        // Position Updates
        p.x += p.vx;
        p.y += p.vy;

        // Screen Boundary Constraints
        if (p.x < 0) p.x = 0;
        if (p.x + p.width > this.canvas.width) p.x = this.canvas.width - p.width;

        // Platform Collision Detection
        p.isGrounded = false;
        this.platforms.forEach(plat => {
            if (
                p.x < plat.x + plat.width &&
                p.x + p.width > plat.x &&
                p.y + p.height >= plat.y &&
                p.y + p.height <= plat.y + plat.height + p.vy &&
                p.vy >= 0
            ) {
                p.isGrounded = true;
                p.vy = 0;
                p.y = plat.y - p.height;
            }
        });

        // Coin Collection Detection
        this.coins.forEach(coin => {
            if (!coin.collected) {
                const dx = (p.x + p.width / 2) - coin.x;
                const dy = (p.y + p.height / 2) - coin.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < coin.radius + p.width / 2) {
                    coin.collected = true;
                    store.addScore(10);
                }
            }
        });

        // Spike Obstacle Collision Detection (Game Over)
        this.spikes.forEach(spike => {
            if (
                p.x < spike.x + spike.width &&
                p.x + p.width > spike.x &&
                p.y < spike.y + spike.height &&
                p.y + p.height > spike.y
            ) {
                store.setGameOver(true);
            }
        });

        // Goal Collision Detection (Reach Target to Pass Level)
        if (
            this.goal &&
            p.x < this.goal.x + this.goal.width &&
            p.x + p.width > this.goal.x &&
            p.y < this.goal.y + this.goal.height &&
            p.y + p.height > this.goal.y
        ) {
            store.addScore(100);
            store.nextLevel();
            this.resetEntities();
        }

        // Check Fall Off Condition (Game Over)
        if (p.y > this.canvas.height + 40) {
            store.setGameOver(true);
        }

        // Auto Respawn Coins & Bonus Score
        if (this.coins.length > 0 && this.coins.every(c => c.collected)) {
            this.coins.forEach(c => c.collected = false);
            store.addScore(50);
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Background Sky
        this.ctx.fillStyle = '#0284c7';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render Goal (ประตูสีเขียว)
        if (this.goal) {
            this.ctx.fillStyle = '#10b981';
            this.ctx.fillRect(this.goal.x, this.goal.y, this.goal.width, this.goal.height);
            this.ctx.fillStyle = '#fef08a';
            this.ctx.fillRect(this.goal.x + this.goal.width - 8, this.goal.y + this.goal.height / 2 - 3, 5, 6);
        }

        // Render Platforms
        this.platforms.forEach(plat => {
            this.ctx.fillStyle = '#334155';
            this.ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            // Grass Accent Top Line
            this.ctx.fillStyle = '#22c55e';
            this.ctx.fillRect(plat.x, plat.y, plat.width, 3);
        });

        // Render Spikes (อุปสรรคหนามสีแดง)
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

        // Render Player
        const p = this.player;
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(p.x, p.y, p.width, p.height);

        // Player Eyes Facing Direction
        this.ctx.fillStyle = '#ffffff';
        const eyeOffset = this.keys.left ? 3 : (this.keys.right ? 13 : 8);
        this.ctx.fillRect(p.x + eyeOffset, p.y + 6, 4, 4);
    }

    gameLoop() {
        this.update();
        this.render();
        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }
}

// Boot App Engine
window.addEventListener('DOMContentLoaded', () => {
    new PlatformerGame();
});
