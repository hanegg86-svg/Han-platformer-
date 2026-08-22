import { store } from './store.js';
import { UIManager } from './ui.js';

class PlatformerGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.ui = new UIManager();
        
        this.keys = { left: false, right: false, jump: false };
        this.animationFrameId = null;

        // Physics Constants
        this.GRAVITY = 0.45;
        
        // Game Entities
        this.player = null;
        this.platforms = [];
        this.coins = [];

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

        this.resetEntities();
        this.gameLoop();
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
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

        // Static Level Platforms Layout
        this.platforms = [
            { x: 0, y: h - 20, width: w, height: 20 },
            { x: 40, y: h - 90, width: 90, height: 14 },
            { x: 170, y: h - 150, width: 100, height: 14 },
            { x: 50, y: h - 220, width: 110, height: 14 },
            { x: 210, y: h - 280, width: 90, height: 14 }
        ];

        // Collectible Coins Layout
        this.coins = [
            { x: 75, y: h - 120, radius: 8, collected: false },
            { x: 210, y: h - 180, radius: 8, collected: false },
            { x: 90, y: h - 250, radius: 8, collected: false },
            { x: 240, y: h - 310, radius: 8, collected: false }
        ];
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
    }

    restartGame() {
        store.resetScore();
        this.resetEntities();
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

        // Check Fall Off Condition (Game Over)
        if (p.y > this.canvas.height + 40) {
            store.setGameOver(true);
        }

        // Auto Respawn Coins & Bonus Score
        if (this.coins.every(c => c.collected)) {
            this.coins.forEach(c => c.collected = false);
            store.addScore(50);
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Background Sky
        this.ctx.fillStyle = '#0284c7';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render Platforms
        this.platforms.forEach(plat => {
            this.ctx.fillStyle = '#334155';
            this.ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            // Grass Accent Top Line
            this.ctx.fillStyle = '#22c55e';
            this.ctx.fillRect(plat.x, plat.y, plat.width, 3);
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
