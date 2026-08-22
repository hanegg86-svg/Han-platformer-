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
        this.state.selectedSkin = skinId;
        localStorage.setItem('platformer_skin', skinId);
        this.notify();
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
        this.state = {
            activeTab: 'game',
            score: 0,
            highScore: 0,
            gamesPlayed: 0,
            soundEnabled: true,
            isGameOver: false,
            level: 1,
            selectedSkin: 'fire',
            coinsCount: 0
        };
        this.notify();
    }
}

export const store = new Store();
