class Store {
    constructor() {
        this.state = {
            activeTab: 'game',
            score: 0,
            highScore: parseInt(localStorage.getItem('platformer_highscore') || '0', 10),
            gamesPlayed: parseInt(localStorage.getItem('platformer_games') || '0', 10),
            soundEnabled: JSON.parse(localStorage.getItem('platformer_sound') ?? 'true'),
            isGameOver: false,
            level: 1,
            selectedSkin: localStorage.getItem('platformer_skin') || 'fire', // 'fire', 'electric', 'gold'
            ownedSkins: JSON.parse(localStorage.getItem('platformer_owned_skins') || '["fire"]'),
            upgrades: JSON.parse(localStorage.getItem('platformer_upgrades') || '{"dashLevel": 0, "magnetLevel": 0}'),
            coinsCount: parseInt(localStorage.getItem('platformer_coins') || '0', 10)
        };
        this.listeners = [];
    }

    getState() {
        return { ...this.state };
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }

    setTab(tabName) {
        this.state.activeTab = tabName;
        this.notify();
    }

    addScore(points) {
        this.state.score += points;
        this.state.coinsCount += Math.floor(points / 5);
        localStorage.setItem('platformer_coins', this.state.coinsCount.toString());

        if (this.state.score > this.state.highScore) {
            this.state.highScore = this.state.score;
            localStorage.setItem('platformer_highscore', this.state.highScore.toString());
        }
        this.notify();
    }

    setSkin(skinId) {
        if (this.state.ownedSkins.includes(skinId)) {
            this.state.selectedSkin = skinId;
            localStorage.setItem('platformer_skin', skinId);
            this.notify();
        }
    }

    buySkin(skinId, price) {
        if (this.state.coinsCount >= price && !this.state.ownedSkins.includes(skinId)) {
            this.state.coinsCount -= price;
            this.state.ownedSkins.push(skinId);
            this.state.selectedSkin = skinId;
            localStorage.setItem('platformer_coins', this.state.coinsCount.toString());
            localStorage.setItem('platformer_owned_skins', JSON.stringify(this.state.ownedSkins));
            localStorage.setItem('platformer_skin', skinId);
            this.notify();
            return true;
        }
        return false;
    }

    buyUpgrade(type, price, maxLevel = 5) {
        const currentLevel = this.state.upgrades[type] || 0;
        if (currentLevel < maxLevel && this.state.coinsCount >= price) {
            this.state.coinsCount -= price;
            this.state.upgrades[type] = currentLevel + 1;
            localStorage.setItem('platformer_coins', this.state.coinsCount.toString());
            localStorage.setItem('platformer_upgrades', JSON.stringify(this.state.upgrades));
            this.notify();
            return true;
        }
        return false;
    }

    nextLevel() {
        this.state.level += 1;
        this.notify();
    }

    setGameOver(isOver) {
        this.state.isGameOver = isOver;
        if (isOver) {
            this.state.gamesPlayed += 1;
            localStorage.setItem('platformer_games', this.state.gamesPlayed.toString());
        }
        this.notify();
    }

    resetScore() {
        this.state.score = 0;
        this.state.level = 1;
        this.state.isGameOver = false;
        this.notify();
    }

    toggleSound(enabled) {
        this.state.soundEnabled = enabled;
        localStorage.setItem('platformer_sound', JSON.stringify(enabled));
        this.notify();
    }

    resetAllData() {
        localStorage.removeItem('platformer_highscore');
        localStorage.removeItem('platformer_games');
        localStorage.removeItem('platformer_sound');
        localStorage.removeItem('platformer_skin');
        localStorage.removeItem('platformer_coins');
        localStorage.removeItem('platformer_owned_skins');
        localStorage.removeItem('platformer_upgrades');
        this.state = {
            activeTab: 'game',
            score: 0,
            highScore: 0,
            gamesPlayed: 0,
            soundEnabled: true,
            isGameOver: false,
            level: 1,
            selectedSkin: 'fire',
            ownedSkins: ['fire'],
            upgrades: { dashLevel: 0, magnetLevel: 0 },
            coinsCount: 0
        };
        this.notify();
    }
}

export const store = new Store();
