// Файл: js/uiManager.js

// Импортируем TOWER_CONFIG и towerImages, так как они нужны для отображения информации о башнях
import { TOWER_CONFIG, towerImages } from './config.js';

export default class UIManager {
    constructor(game) {
        this.game = game; // Сохраняем ссылку на главный объект игры, чтобы отправлять ему команды

        // --- 1. Находим все DOM-элементы ОДИН РАЗ при создании ---
        // Это эффективно, так как мы не ищем их каждый кадр
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Панель статистики и управления
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

        // Панель информации о башне
        this.towerInfoPanel = document.getElementById('tower-info-panel');
        this.infoTowerImg = document.getElementById('info-tower-img');
        this.infoTowerName = document.getElementById('info-tower-name');
        this.infoTowerDamage = document.getElementById('info-tower-damage');
        this.infoTowerRange = document.getElementById('info-tower-range');
        this.infoTowerSpeed = document.getElementById('info-tower-speed');
        this.infoTowerSpecial = document.getElementById('info-tower-special');

        // Главное меню и экраны конца игры
        this.mainMenu = document.getElementById('mainMenu');
        this.levelSelection = document.getElementById('levelSelection');
        this.winPopup = document.getElementById('win-popup');
        this.losePopup = document.getElementById('lose-popup');
        this.winMoneyDisplay = document.getElementById('win-money-stat');
        this.winLivesDisplay = document.getElementById('win-lives-stat');
        
        // Интро-попапы
        this.fluttershyIntroPopup = document.getElementById('fluttershyIntroPopup');
        this.rainbowDashIntroPopup = document.getElementById('rainbowDashIntroPopup');
        this.rarityIntroPopup = document.getElementById('rarityIntroPopup');


        // Внутри constructor(game)
        this.storyPopup = document.getElementById('storyPopup');
        this.storyTitle = document.getElementById('storyTitle');
        this.storyText = document.getElementById('storyText');
        
        // --- 2. Привязываем все обработчики событий ---
        this.bindEvents();
    }

    bindEvents() {
        // Когда кнопка нажата, UIManager не решает, что делать, а просто
        // говорит объекту game: "Эй, пользователь нажал кнопку 'Новая волна'".
        this.startWaveButton.addEventListener('click', () => this.game.startWave());
        this.ingameMenuButton.addEventListener('click', () => this.game.returnToMainMenu());
        this.sellTowerButton.addEventListener('click', () => this.game.toggleSellMode());

        // Передаем события с канваса напрямую в game, он сам разберется с координатами
        this.canvas.addEventListener('mousemove', (e) => this.game.handleMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.game.handleCanvasClick(e));

         document.getElementById('closeStoryPopupButton').addEventListener('click', () => {
            this.storyPopup.classList.add('hidden');
            if (this.onStoryClose) {
                this.onStoryClose(); // Выполняем то, что запланировали (открыть Радугу или начать игру)
            } else {
                this.game.startGame(); // По умолчанию просто старт
            }
        });

        // Отмена режимов по клавише Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.game.cancelModes();
            }
        });

        // Кнопки покупки башен
        this.towerSelectButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const type = event.currentTarget.getAttribute('data-tower-type');
                this.game.selectTower(type);
            });
        });

        // Кнопки на экранах победы/поражения/интро
        document.getElementById('next-level-button').addEventListener('click', () => this.game.startNextLevel());
        document.getElementById('restart-button').addEventListener('click', () => this.game.restartCurrentLevel());
        document.getElementById('main-menu-button').addEventListener('click', () => this.game.returnToMainMenu());
        // Обработчик для старой кнопки, которая может быть на обеих панелях
        document.querySelectorAll('#returnToMenuButton').forEach(btn => {
            btn.addEventListener('click', () => this.game.returnToMainMenu());
        });
        
        // Кнопки после интро
        document.getElementById('startLevelAfterIntroButton').addEventListener('click', () => this.game.startGame());
        document.getElementById('startLevelAfterRDIntroButton').addEventListener('click', () => this.showRarityIntro());
        document.getElementById('startLevelAfterRarityIntroButton').addEventListener('click', () => this.game.startGame());
        document.getElementById('startLevelAfterLunaIntroButton').addEventListener('click', () => this.game.startGame());

        
    }

    // --- 3. Методы для обновления интерфейса (их будет вызывать Game) ---

    // Главный метод обновления, который вызывает все остальные
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

        // Обновляем состояние кнопок покупки (активна/неактивна/выбрана)
        this.towerSelectButtons.forEach(button => {
            const type = button.getAttribute('data-tower-type');
            const price = TOWER_CONFIG[type].price;
            button.disabled = this.game.money < price;
            button.classList.toggle('selected', this.game.isBuilding && this.game.selectedTowerType === type);
        });

        // Обновляем кнопку продажи и курсор
        if (this.game.isSelling) {
            this.sellTowerButton.classList.add('active');
            this.sellTowerButton.textContent = 'Отмена (Esc)';
            this.canvas.style.cursor = 'pointer';
        } else {
            this.sellTowerButton.classList.remove('active');
            this.sellTowerButton.textContent = '💲 Продать Пони';
            this.canvas.style.cursor = this.game.isBuilding ? 'crosshair' : 'default';
        }
        
        // Показываем/скрываем кнопки пони в зависимости от уровня
        const fluttershyButton = document.getElementById('fluttershy-buy-button');
        if (fluttershyButton) fluttershyButton.style.display = (this.game.currentLevel >= 2) ? 'flex' : 'none'; // ИЗМЕНЕНО

        const rainbowDashButton = document.getElementById('rainbowdash-buy-button');
        if (rainbowDashButton) rainbowDashButton.style.display = (this.game.currentLevel >= 3) ? 'flex' : 'none'; // Тут уже правильно!

        const rarityButton = document.getElementById('rarity-buy-button');
        if (rarityButton) rarityButton.style.display = (this.game.currentLevel >= 3) ? 'flex' : 'none'; // И тут тоже!

        // Добавьте логику отображения кнопки (например, с 5 уровня)
        const lunaButton = document.getElementById('luna-buy-button');
        if (lunaButton) lunaButton.style.display = (this.game.currentLevel >= 5) ? 'flex' : 'none';

        // Добавьте стиль для кнопки Луны (синий/ночной) в CSS, если хотите, или через класс
        if (lunaButton) lunaButton.style.borderColor = '#60a5fa'; // Голубая рамка
        if (lunaButton) lunaButton.style.backgroundColor = '#1e3a8a'; // Темно-синий фон
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


    // --- 4. Методы для управления экранами и попапами ---

    showMainMenu() {
    this.mainMenu.classList.remove('hidden');
    this.canvas.classList.add('hidden');
    this.hideAllPopups();
    
    this.levelSelection.innerHTML = '';
    
    // ИЗМЕНЕНИЕ: Теперь 10 уровней
    const totalLevels = 10; 
    
    // Создаем сетку для кнопок, если их много
    this.levelSelection.className = "grid grid-cols-2 gap-4 w-full max-w-lg"; // Используем Grid вместо flex col

    for (let i = 1; i <= totalLevels; i++) {
        const isUnlocked = i <= this.game.unlockedLevels;
        const button = document.createElement('button');
        button.textContent = `Ур. ${i}`; // Сократил текст для компактности
        // Стили
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
        
        // Запоминаем, что делать при нажатии кнопки "Продолжить"
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
    showLunaIntro() {
    this.mainMenu.classList.add('hidden');
    this.lunaIntroPopup.classList.remove('hidden');
    }
}