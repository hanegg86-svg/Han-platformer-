import { store } from './store.js';

export class UIManager {
    constructor() {
        this.hudLevel = document.getElementById('hud-level');
        this.hudScore = document.getElementById('hud-score');
        this.hudHighScore = document.getElementById('hud-highscore');
        this.statsHighScore = document.getElementById('stats-highscore');
        this.statsGamesPlayed = document.getElementById('stats-games-played');
        this.finalScore = document.getElementById('final-score');
        this.gameOverOverlay = document.getElementById('game-over-overlay');
        this.soundToggle = document.getElementById('sound-toggle');

        this.tabViews = document.querySelectorAll('.tab-view');
        this.navBtns = document.querySelectorAll('.nav-btn');
    }

    init(onTabChange, onRestart, onResetData) {
        store.subscribe((state) => this.render(state));
        
        // Navigation Bar Listeners
        this.navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                store.setTab(tab);
                if (onTabChange) onTabChange(tab);
            });
        });

        // Action Button Listeners
        document.getElementById('btn-restart').addEventListener('click', () => {
            if (onRestart) onRestart();
        });

        document.getElementById('btn-reset-data').addEventListener('click', () => {
            if (confirm('คุณต้องการรีเซ็ตข้อมูลสถิติทั้งหมดใช่หรือไม่?')) {
                store.resetAllData();
                if (onResetData) onResetData();
            }
        });

        this.soundToggle.addEventListener('change', (e) => {
            store.toggleSound(e.target.checked);
        });

        this.render(store.getState());
    }

    render(state) {
        // Synchronize HUD & Stats Text
        if (this.hudLevel) this.hudLevel.textContent = state.level;
        this.hudScore.textContent = state.score;
        this.hudHighScore.textContent = state.highScore;
        this.statsHighScore.textContent = state.highScore;
        this.statsGamesPlayed.textContent = state.gamesPlayed;
        this.finalScore.textContent = state.score;
        this.soundToggle.checked = state.soundEnabled;

        // Overlay Toggle
        if (state.isGameOver) {
            this.gameOverOverlay.classList.remove('hidden');
        } else {
            this.gameOverOverlay.classList.add('hidden');
        }

        // Active Tab View Switching
        this.tabViews.forEach(view => {
            if (view.id === `view-${state.activeTab}`) {
                view.classList.add('active');
            } else {
                view.classList.remove('active');
            }
        });

        // Navigation Styling Updates
        this.navBtns.forEach(btn => {
            if (btn.getAttribute('data-tab') === state.activeTab) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}
