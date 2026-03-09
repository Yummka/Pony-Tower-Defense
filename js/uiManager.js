// Файл: js/uiManager.js

import { TOWER_CONFIG, towerImages } from './config.js';

export default class UIManager {
    constructor(game) {
        this.game = game; 

        // --- 1. Находим все DOM-элементы ---
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Панель статистики
        this.moneyDisplay = document.getElementById('moneyDisplay');
        this.livesDisplay = document.getElementById('livesDisplay');
        this.waveDisplay = document.getElementById('waveDisplay');
        this.startWaveButton = document.getElementById('startWaveButton');
        this.ingameMenuButton = document.getElementById('ingameMenuButton');
        this.sellTowerButton = document.getElementById('sellTowerButton');
        
        // Панель строительства
        this.buildModeStatus = document.getElementById('buildModeStatus');
        this.selectedTowerNameDisplay = document.getElementById('selectedTowerName');
        this.towerSelectButtons = document.querySelectorAll('.tower-select-button');

        // Панель информации
        this.towerInfoPanel = document.getElementById('tower-info-panel');
        this.infoTowerImg = document.getElementById('info-tower-img');
        this.infoTowerName = document.getElementById('info-tower-name');
        this.infoTowerDamage = document.getElementById('info-tower-damage');
        this.infoTowerRange = document.getElementById('info-tower-range');
        this.infoTowerSpeed = document.getElementById('info-tower-speed');
        this.infoTowerSpecial = document.getElementById('info-tower-special');
        

        // Меню и экраны
        this.mainMenu = document.getElementById('mainMenu');
        this.levelSelection = document.getElementById('levelSelection');
        this.winPopup = document.getElementById('win-popup');
        this.losePopup = document.getElementById('lose-popup');
        this.winMoneyDisplay = document.getElementById('win-money-stat');
        this.winLivesDisplay = document.getElementById('win-lives-stat');
        
        // Интро-попапы (ВОТ ТУТ БЫЛА ОШИБКА)
        this.fluttershyIntroPopup = document.getElementById('fluttershyIntroPopup');
        this.rainbowDashIntroPopup = document.getElementById('rainbowDashIntroPopup');
        this.rarityIntroPopup = document.getElementById('rarityIntroPopup');
        this.derpyIntroPopup = document.getElementById('derpyIntroPopup');
        
        // --- ДОБАВЛЕНО: Теперь JS знает про Луну ---
        this.lunaIntroPopup = document.getElementById('lunaIntroPopup');

        // Сюжетное окно
        this.storyPopup = document.getElementById('storyPopup');
        this.storyTitle = document.getElementById('storyTitle');
        this.storyText = document.getElementById('storyText');
        
        // --- 2. Привязываем обработчики ---
        this.bindEvents();
    }

    bindEvents() {
        this.startWaveButton.addEventListener('click', () => this.game.startWave());
        this.ingameMenuButton.addEventListener('click', () => this.game.returnToMainMenu());
        this.sellTowerButton.addEventListener('click', () => this.game.toggleSellMode());

        this.canvas.addEventListener('mousemove', (e) => this.game.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.game.handleCanvasClick(e));

         document.getElementById('closeStoryPopupButton').addEventListener('click', () => {
            this.storyPopup.classList.add('hidden');
            if (this.onStoryClose) {
                this.onStoryClose(); 
            } else {
                this.game.startGame(); 
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.game.cancelModes();
            }
        });

        this.towerSelectButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const type = event.currentTarget.getAttribute('data-tower-type');
                this.game.selectTower(type);
            });
        });

        document.getElementById('next-level-button').addEventListener('click', () => this.game.startNextLevel());
        document.getElementById('restart-button').addEventListener('click', () => this.game.restartCurrentLevel());
        document.getElementById('main-menu-button').addEventListener('click', () => this.game.returnToMainMenu());
        
        document.querySelectorAll('#returnToMenuButton').forEach(btn => {
            btn.addEventListener('click', () => this.game.returnToMainMenu());
        });
        
        document.getElementById('startLevelAfterIntroButton').addEventListener('click', () => this.game.startGame());
        document.getElementById('startLevelAfterRDIntroButton').addEventListener('click', () => this.showRarityIntro());
        document.getElementById('startLevelAfterRarityIntroButton').addEventListener('click', () => this.game.startGame());
        document.getElementById('startLevelAfterDerpyButton').addEventListener('click', () => {
            this.derpyIntroPopup.classList.add('hidden'); // Скрываем Дёрпи
            this.showStoryScreen(
                "КРИСТАЛЬНАЯ ИМПЕРИЯ", 
                "Король Сомбра вернулся!<br>Холодный ветер приносит тени и рабов.<br><br>Защитите империю!",
                () => this.game.startGame()
            );
        });;
        
        // --- ДОБАВЛЕНО: Кнопка старта после Луны ---
        document.getElementById('startLevelAfterLunaIntroButton').addEventListener('click', () => this.game.startGame());
    }

    update() {
        this.updateStats();
        this.updateButtons();
        this.updateBuildModeStatus();
        this.updateTowerInfoPanel();
    }
    
    updateStats() {
        this.moneyDisplay.textContent = this.game.money;
        this.livesDisplay.textContent = this.game.lives;
        this.waveDisplay.textContent = this.game.wave;
    }

    updateButtons() {
        this.startWaveButton.disabled = this.game.waveInProgress;

        this.towerSelectButtons.forEach(button => {
            const type = button.getAttribute('data-tower-type');
            const price = TOWER_CONFIG[type].price;
            button.disabled = this.game.money < price;
            button.classList.toggle('selected', this.game.isBuilding && this.game.selectedTowerType === type);
        });

        if (this.game.isSelling) {
            this.sellTowerButton.classList.add('active');
            this.sellTowerButton.textContent = 'Отмена (Esc)';
            this.canvas.style.cursor = 'pointer';
        } else {
            this.sellTowerButton.classList.remove('active');
            this.sellTowerButton.textContent = '💲 Продать Пони';
            this.canvas.style.cursor = this.game.isBuilding ? 'crosshair' : 'default';
        }
        
        const fluttershyButton = document.getElementById('fluttershy-buy-button');
        if (fluttershyButton) fluttershyButton.style.display = (this.game.currentLevel >= 2) ? 'flex' : 'none';

        const rainbowDashButton = document.getElementById('rainbowdash-buy-button');
        if (rainbowDashButton) rainbowDashButton.style.display = (this.game.currentLevel >= 3) ? 'flex' : 'none';

        const rarityButton = document.getElementById('rarity-buy-button');
        if (rarityButton) rarityButton.style.display = (this.game.currentLevel >= 3) ? 'flex' : 'none';


        const lunaButton = document.getElementById('luna-buy-button');
        if (lunaButton) {
            lunaButton.style.display = (this.game.currentLevel >= 5) ? 'flex' : 'none';
            lunaButton.style.borderColor = '#60a5fa'; 
            lunaButton.style.backgroundColor = '#1e3a8a';
        }
        
        const derpyButton = document.getElementById('derpy-buy-button');
        if (derpyButton) derpyButton.style.display = (this.game.currentLevel >= 6) ? 'flex' : 'none';
    }
    
    updateBuildModeStatus() {
        if (this.game.isBuilding && this.game.selectedTowerType) {
            this.buildModeStatus.classList.remove('hidden');
            this.selectedTowerNameDisplay.textContent = TOWER_CONFIG[this.game.selectedTowerType].name;
        } else if (this.game.isPlacingPatrolPoint) {
            this.buildModeStatus.classList.remove('hidden');
            this.buildModeStatus.innerHTML = `Выберите вторую точку для <b>Радуги Дэш</b> (Esc — отменить)`;
        } else {
            this.buildModeStatus.classList.add('hidden');
        }
    }
    
    updateTowerInfoPanel() {
        const towerType = this.game.selectedTowerType;
        if (!towerType) {
            this.towerInfoPanel.classList.add('hidden');
            return;
        }
        const config = TOWER_CONFIG[towerType];
        const desc = config.description;

        this.infoTowerImg.src = towerImages[towerType].src;
        this.infoTowerName.textContent = config.name;
        this.infoTowerDamage.textContent = desc.damage;
        this.infoTowerRange.textContent = desc.range;
        this.infoTowerSpeed.textContent = desc.speed;
        this.infoTowerSpecial.textContent = desc.special;
        
        this.towerInfoPanel.classList.remove('hidden');
    }

    showMainMenu() {
        this.mainMenu.classList.remove('hidden');
        this.canvas.classList.add('hidden');
        this.hideAllPopups();
        
        this.levelSelection.innerHTML = '';
        
        const totalLevels = 10; 
        
        this.levelSelection.className = "grid grid-cols-2 gap-4 w-full max-w-lg";

        for (let i = 1; i <= totalLevels; i++) {
            const isUnlocked = i <= this.game.unlockedLevels;
            const button = document.createElement('button');
            button.textContent = `Ур. ${i}`; 
            button.className = 'px-4 py-3 font-semibold rounded-lg shadow-lg transition duration-300 text-sm md:text-base';

            if (isUnlocked) {
                button.classList.add('bg-money', 'hover:bg-green-700', 'text-white');
                button.onclick = () => this.game.startLevel(i);
            } else {
                button.classList.add('bg-gray-500', 'text-gray-300', 'cursor-not-allowed', 'opacity-70');
                button.textContent += ' 🔒';
            }
            this.levelSelection.appendChild(button);
        }
    }

    showGameScreen() {
        this.mainMenu.classList.add('hidden');
        this.canvas.classList.remove('hidden');
        this.hideAllPopups();
    }

    showStoryScreen(title, text, nextAction) {
        this.mainMenu.classList.add('hidden');
        this.storyTitle.textContent = title;
        this.storyText.innerHTML = text; 
        this.onStoryClose = nextAction;
        this.storyPopup.classList.remove('hidden');
    }
    
    hideAllPopups() {
        this.storyPopup.classList.add('hidden');
        this.winPopup.classList.add('hidden');
        this.losePopup.classList.add('hidden');
        this.fluttershyIntroPopup.classList.add('hidden');
        this.rainbowDashIntroPopup.classList.add('hidden');
        this.rarityIntroPopup.classList.add('hidden');
        
        // --- ДОБАВЛЕНО: Скрытие Луны ---
        if(this.lunaIntroPopup) this.lunaIntroPopup.classList.add('hidden');
    }

    showWinScreen() {
        this.winMoneyDisplay.textContent = this.game.money;
        this.winLivesDisplay.textContent = this.game.lives;
        this.winPopup.classList.remove('hidden');
    }

    showLoseScreen() {
        this.losePopup.classList.remove('hidden');
    }
    
    showFluttershyIntro() {
        this.mainMenu.classList.add('hidden');
        this.fluttershyIntroPopup.classList.remove('hidden');
    }
    
    showRainbowDashIntro() {
        this.mainMenu.classList.add('hidden');
        this.rainbowDashIntroPopup.classList.remove('hidden');
    }

    showRarityIntro() {
        this.rainbowDashIntroPopup.classList.add('hidden');
        this.rarityIntroPopup.classList.remove('hidden');
    }

    // --- ДОБАВЛЕНО: Метод показа Луны ---
    showLunaIntro() {
        this.mainMenu.classList.add('hidden');
        // Проверяем, существует ли элемент, чтобы не было ошибки
        if(this.lunaIntroPopup) {
            this.lunaIntroPopup.classList.remove('hidden');
        } else {
            console.error("Не найден попап Луны!");
            this.game.startGame(); // Если ошибка, просто начинаем игру
        }
    }
    showDerpyIntro() {
    this.mainMenu.classList.add('hidden');
    this.derpyIntroPopup.classList.remove('hidden');
    }

}