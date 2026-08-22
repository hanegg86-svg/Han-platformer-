import { store } from './store.js';

export class UIManager {
    constructor() {
        this.hudLevel = document.getElementById('hud-level');
        this.hudScore = document.getElementById('hud-score');
        this.hudHighScore = document.getElementById('hud-highscore');
        this.statsHighScore = document.getElementById('stats-highscore');
        this.statsGamesPlayed = document.getElementById('stats-games-played');
        this.statsCoins = document.getElementById('stats-coins');
        this.shopCoins = document.getElementById('shop-coins');
        this.skinsGrid = document.getElementById('skins-grid');
        this.upgradesGrid = document.getElementById('upgrades-grid');
        this.finalScore = document.getElementById('final-score');
        this.gameOverOverlay = document.getElementById('game-over-overlay');
        this.soundToggle = document.getElementById('sound-toggle');

        this.tabViews = document.querySelectorAll('.tab-view');
        this.navBtns = document.querySelectorAll('.nav-btn');

        this.skinsConfig = [
            { id: 'fire', name: '🔥 สกินเพลิง', desc: 'สกินเริ่มต้นออร่าสีแดง', price: 0, color: '#ef4444' },
            { id: 'electric', name: '⚡ สกินสายฟ้า', desc: 'ออร่าไฟฟ้าสีฟ้าสดใส', price: 100, color: '#38bdf8' },
            { id: 'gold', name: '✨ สกินทองคำ', desc: 'ออร่าสีทองเปล่งประกาย', price: 300, color: '#facc15' }
        ];

        this.upgradesConfig = [
            { id: 'dashLevel', name: '⚡ พุ่งไวขึ้น', desc: 'ลดเวลาคูลดาวน์ของการพุ่ง', basePrice: 50, maxLevel: 5 },
            { id: 'magnetLevel', name: '🧲 แม่เหล็กทรงพลัง', desc: 'เพิ่มระยะการดูดเหรียญ', basePrice: 50, maxLevel: 5 }
        ];
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

    renderShop(state) {
        if (!this.skinsGrid || !this.upgradesGrid) return;

        // Render Skins
        this.skinsGrid.innerHTML = '';
        this.skinsConfig.forEach(skin => {
            const isOwned = state.ownedSkins.includes(skin.id);
            const isEquipped = state.selectedSkin === skin.id;

            const card = document.createElement('div');
            card.className = `shop-item ${isEquipped ? 'equipped' : ''}`;

            let btnHtml = '';
            if (isEquipped) {
                btnHtml = `<button class="btn btn-disabled" disabled>ใช้งานอยู่</button>`;
            } else if (isOwned) {
                btnHtml = `<button class="btn btn-secondary btn-select-skin" data-skin="${skin.id}">เลือกใช้</button>`;
            } else {
                const canAfford = state.coinsCount >= skin.price;
                btnHtml = `<button class="btn ${canAfford ? 'btn-buy' : 'btn-disabled'} btn-buy-skin" data-skin="${skin.id}" data-price="${skin.price}" ${!canAfford ? 'disabled' : ''}>ซื้อ 🪙 ${skin.price}</button>`;
            }

            card.innerHTML = `
                <div class="shop-item-icon" style="background-color: ${skin.color};"></div>
                <div class="shop-item-info">
                    <h4>${skin.name}</h4>
                    <p>${skin.desc}</p>
                </div>
                <div class="shop-item-action">${btnHtml}</div>
            `;

            this.skinsGrid.appendChild(card);
        });

        // Skins Event Listeners
        this.skinsGrid.querySelectorAll('.btn-select-skin').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const skinId = e.target.getAttribute('data-skin');
                store.setSkin(skinId);
            });
        });

        this.skinsGrid.querySelectorAll('.btn-buy-skin').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const skinId = e.target.getAttribute('data-skin');
                const price = parseInt(e.target.getAttribute('data-price'), 10);
                store.buySkin(skinId, price);
            });
        });

        // Render Upgrades
        this.upgradesGrid.innerHTML = '';
        this.upgradesConfig.forEach(upg => {
            const currentLvl = state.upgrades?.[upg.id] || 0;
            const isMax = currentLvl >= upg.maxLevel;
            const price = upg.basePrice * (currentLvl + 1);

            const card = document.createElement('div');
            card.className = 'shop-item';

            let btnHtml = '';
            if (isMax) {
                btnHtml = `<button class="btn btn-disabled" disabled>ระดับสูงสุด</button>`;
            } else {
                const canAfford = state.coinsCount >= price;
                btnHtml = `<button class="btn ${canAfford ? 'btn-buy' : 'btn-disabled'} btn-buy-upg" data-upg="${upg.id}" data-price="${price}" ${!canAfford ? 'disabled' : ''}>อัปเกรด 🪙 ${price}</button>`;
            }

            card.innerHTML = `
                <div class="shop-item-info">
                    <h4>${upg.name} <span class="badge-level">Lv. ${currentLvl}/${upg.maxLevel}</span></h4>
                    <p>${upg.desc}</p>
                </div>
                <div class="shop-item-action">${btnHtml}</div>
            `;

            this.upgradesGrid.appendChild(card);
        });

        // Upgrades Event Listeners
        this.upgradesGrid.querySelectorAll('.btn-buy-upg').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const upgId = e.target.getAttribute('data-upg');
                const price = parseInt(e.target.getAttribute('data-price'), 10);
                store.buyUpgrade(upgId, price);
            });
        });
    }

    render(state) {
        // Synchronize HUD & Stats Text
        if (this.hudLevel) this.hudLevel.textContent = state.level;
        this.hudScore.textContent = state.score;
        this.hudHighScore.textContent = state.highScore;
        this.statsHighScore.textContent = state.highScore;
        this.statsGamesPlayed.textContent = state.gamesPlayed;
        if (this.statsCoins) this.statsCoins.textContent = state.coinsCount;
        if (this.shopCoins) this.shopCoins.textContent = state.coinsCount;
        this.finalScore.textContent = state.score;
        this.soundToggle.checked = state.soundEnabled;

        // Render Shop Items
        this.renderShop(state);

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
