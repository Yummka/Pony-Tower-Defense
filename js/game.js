// Файл: js/game.js

import UIManager from './uiManager.js';
import Enemy from './entities/Enemy.js';
import Tower from './entities/Tower.js';
import Projectile from './entities/Projectile.js';
import LunaEffect from './entities/LunaEffect.js';
import FloatingText from './entities/FloatingText.js';
import { 
    path, buildSlots, LEVELS_CONFIG, backgroundImage, nightBackground, eveningBackground, morningBackground, crystalBackground, villageBackground,
    TOWER_CONFIG, BUILD_SLOT_SIZE, SELL_REFUND_PERCENTAGE, 
    PAUSE_BETWEEN_GROUPS_MS, ENEMY_TYPES,
    originalWidth, originalHeight, 
    backgroundMusic, nightMusic, eveningMusic, crystalMusic, LEVEL_START_MONEY, morningMusic,
    villageMusic,
    towerImages, playSound,
    pathLevel6, buildSlotsLevel6, 
    pathLevel7, buildSlotsLevel7,
    path as defaultPath, buildSlots as defaultBuildSlots,
} from './config.js';

export default class Game {
    constructor() {
        this.ui = new UIManager(this);
        this.canvas = this.ui.canvas;
        this.ctx = this.ui.ctx;

        this.originalWidth = originalWidth;
        this.originalHeight = originalHeight;
        
        // --- Инициализация состояния игры ---
        this.money = 0;
        this.lives = 0;
        this.wave = 0;
        this.currentLevel = 1;
        this.unlockedLevels = 1;
        this.loadProgress();

        this.enemies = [];
        this.towers = [];
        this.projectiles = [];
        this.spawnTimeouts = [];
        this.effects = [];
        this.floatingTexts = [];
        
        this.isRunning = false;
        this.isBuilding = false;
        this.isSelling = false;
        this.isPlacingPatrolPoint = false;
        this.patrolTowerRef = null;
        this.selectedTowerType = null;
        this.waveInProgress = false;
        this.allEnemiesScheduled = false;

        this.lunaCooldown = 0; // Время перезарядки в секундах

        // По умолчанию загружаем стандартную карту (Ур. 1)
        this.currentRawPath = defaultPath;
        this.currentRawSlots = JSON.parse(JSON.stringify(defaultBuildSlots));

        this.mouse = { x: 0, y: 0 };

        // --- Настройка масштабирования ---
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.setupScaling();

        // --- СЛУШАТЕЛЬ ИЗМЕНЕНИЯ РАЗМЕРА ОКНА ---
        window.addEventListener('resize', () => {
            this.setupScaling();
            this.recalculatePositions();
            this.draw();
        });
                
        // Первая инициализация путей
        this.recalculatePositions();

        // --- ГОРЯЧИЕ КЛАВИШИ (SPACE & ESCAPE) ---
        window.addEventListener('keydown', (e) => {
            // ESCAPE — отмена строительства, продажи или выбора
            if (e.code === 'Escape') {
                this.cancelModes();
            }

            if (e.code === 'Space') {
                // 1. Окно победы -> кликаем кнопку "Следующий уровень"
                const winPopup = document.getElementById('win-popup');
                if (winPopup && !winPopup.classList.contains('hidden')) {
                    e.preventDefault();
                    document.getElementById('next-level-button')?.click();
                    return;
                }

                // 2. Окно сюжета
                const storyPopup = document.getElementById('storyPopup');
                if (storyPopup && !storyPopup.classList.contains('hidden')) {
                    e.preventDefault();
                    document.getElementById('closeStoryPopupButton')?.click();
                    return;
                }

                // 3. Интро пони
                const visibleIntroBtn = document.querySelector(
                    '#fluttershyIntroPopup:not(.hidden) button, ' +
                    '#rainbowDashIntroPopup:not(.hidden) button, ' +
                    '#rarityIntroPopup:not(.hidden) button, ' +
                    '#lunaIntroPopup:not(.hidden) button, ' +
                    '#derpyIntroPopup:not(.hidden) button'
                );
                if (visibleIntroBtn) {
                    e.preventDefault();
                    visibleIntroBtn.click();
                    return;
                }

                // 4. Окно поражения -> ЧЕТКО кликаем "Начать заново" текущего уровня!
                const losePopup = document.getElementById('lose-popup');
                if (losePopup && !losePopup.classList.contains('hidden')) {
                    e.preventDefault();
                    document.getElementById('restart-button')?.click();
                    return;
                }

                // 5. В игре -> Новая волна
                if (this.isRunning && !this.waveInProgress) {
                    e.preventDefault();
                    this.startWave();
                }
            }
        });

        // --- Запуск игры ---
        this.isBackgroundLoaded = false;
        backgroundImage.onload = () => {
            this.isBackgroundLoaded = true;
        };
        
        // Запускаем игровой цикл
        this.gameLoop();
    }
    
    // --- ОСНОВНОЙ ИГРОВОЙ ЦИКЛ ---
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    showFloatingText(x, y, text, color) {
        this.floatingTexts.push(new FloatingText(x, y, text, color));
    }

    update() {
        if (!this.isRunning) return;

        // 1. Обновляем все башни
        this.towers.forEach(tower => tower.update(this.enemies, this.projectiles));
        this.effects.forEach(eff => eff.update(this.enemies));
        this.effects = this.effects.filter(eff => eff.state !== 'finished');
        this.floatingTexts.forEach(text => text.update());
        this.floatingTexts = this.floatingTexts.filter(text => text.life > 0);

        // 2. Обновляем снаряды
        this.projectiles = this.projectiles.filter(projectile => {
            const result = projectile.update(this.scale);
            if (result === true) { 
                return false; 
            } else if (result && result.type === 'aoe') {
                this.enemies.forEach(enemy => {
                    const dx = enemy.x - result.x;
                    const dy = enemy.y - result.y;
                    if (Math.sqrt(dx*dx + dy*dy) < projectile.aoeRadius) {
                        enemy.currentHealth -= projectile.damage;
                        if (projectile.applySlow) {
                            enemy.slowDuration = projectile.slowDuration;
                        }
                    }
                });
                return false;
            }
            return true;
        });

        // 3. Обновляем всех врагов
        this.enemies.forEach(enemy => enemy.update(this.scale));

        // 4. Удаляем мертвых и дошедших врагов
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.isFinished) {
                const isBoss = enemy.type === 'Trixie' || 
                               enemy.type.includes('Siren') || 
                               enemy.type === 'Achel' || 
                               enemy.type === 'SfinksFky' || 
                               enemy.type === 'NightmareMoon' || 
                               enemy.type === 'SfinksWalk' || 
                               enemy.type === 'Crizalis' || 
                               enemy.type === 'KingSombra' || 
                               enemy.type === 'TrueChrysalis' || 
                               enemy.type === 'Starlight';

                this.lives -= isBoss ? 5 : 1;
                if (this.lives <= 0) {
                    this.lives = 0;
                    this.loseGame();
                }
                return false;
            }

            if (enemy.currentHealth <= 0) {
                this.money += enemy.bounty;
                
                // ПОБЕДА НАД СТАРЛАЙТ — ВОЗВРАЩАЕМ ВСЕ ПАРАМЕТРЫ К РОДНЫМ!
                if (enemy.type === 'Starlight') {
                    this.isEqualizedActive = false;
                    this.restoreButtonsUI();
                    this.towers.forEach(tower => {
                        tower.isEqualized = false;
                        tower.damage = tower.baseDamage;
                        tower.damageTickRate = tower.baseDamageTickRate;
                        tower.fireRate = tower.baseFireRate;
                        tower.range = tower.baseRange;
                        if (tower.isPatrolTower) {
                            tower.auraDamage = TOWER_CONFIG[tower.type].auraDamage;
                            tower.auraRadius = TOWER_CONFIG[tower.type].auraRadius * this.scale;
                        }
                    });
                    this.showFloatingText(enemy.x, enemy.y, "ЧАРЫ СНЯТЫ!", "#10b981");
                }

                if (enemy.type === 'SombraCrystal') {
                    const sombra = this.enemies.find(e => e.type === 'KingSombra');
                    if (sombra) {
                        sombra.currentHealth -= 2000; 
                        console.log(`Кристалл разрушен! Здоровье Сомбры: ${sombra.currentHealth}`);
                        const slot = this.scaledBuildSlots.find(s => s.x === enemy.x && s.y === enemy.y);
                        if (slot) slot.occupied = false;
                    }
                }
                return false;
            }

            return true;
        });
        
        // 5. Проверяем завершение волны
        if (this.waveInProgress && this.allEnemiesScheduled && this.enemies.length === 0) {
            this.waveInProgress = false;
            console.log(`🌟 Волна ${this.wave} завершена!`);

            const currentLevelWaves = LEVELS_CONFIG[this.currentLevel];
            if (currentLevelWaves && this.wave >= currentLevelWaves.length) {
                this.winLevel();
            }
        }


        // Тикаем таймер перезарядки Луны (180 сек = 3 минуты)
        if (this.lunaCooldown > 0) {
            this.lunaCooldown -= 1 / 60;
            if (this.lunaCooldown < 0) this.lunaCooldown = 0;
        }

        // Обновляем кнопку Луны с таймером
        const lunaBtn = document.getElementById('luna-buy-button');
        if (lunaBtn) {
            if (this.lunaCooldown > 0) {
                lunaBtn.textContent = `🌙 ЛУНА (${Math.ceil(this.lunaCooldown)}с)`;
                lunaBtn.disabled = true;
                lunaBtn.style.opacity = '0.6';
            } else {
                lunaBtn.textContent = '🌙 ГНЕВ ЛУНЫ (500💰)';
                lunaBtn.disabled = this.money < 500;
                lunaBtn.style.opacity = this.money < 500 ? '0.6' : '1';
            }
        }


        // 6. Обновляем UI
        this.ui.update();
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // --- ЦВЕТА ФОНА ХОЛСТА ---
        let bgColor;
        if (this.currentLevel === 3 || this.currentLevel === 4) {
             bgColor = '#08141e'; // Ночь / Вечер
        } else if (this.currentLevel === 6) {
             bgColor = '#494885'; // Кристальная Империя
        } else if (this.currentLevel === 7) {
             bgColor = '#8a7158'; // Серо-коричневая земля деревни
        } else {
             bgColor = '#346927'; // Зеленая трава
        }

        // Красим подложку канваса (БЕЗ document.body, чтобы не было лагов!)
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Рисуем картинку фона
        if (this.isBackgroundLoaded) {
            this.ctx.drawImage(backgroundImage, this.offsetX, this.offsetY, this.originalWidth * this.scale, this.originalHeight * this.scale);
        }

        if (!this.isRunning) return;

        // 3. Рисуем сетку строительства (ОПТИМИЗИРОВАНО: 1 draw-call вместо 750)
        if (this.isBuilding || this.isSelling) {
            const size = this.SCALED_BUILD_SLOT_SIZE;
            const halfSize = size / 2;
            
            this.ctx.fillStyle = this.isSelling ? 'rgba(214, 79, 79, 0.4)' : 'rgba(182, 238, 129, 0.35)';
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            this.ctx.lineWidth = 1;
            
            this.ctx.beginPath();
            for (let i = 0; i < this.scaledBuildSlots.length; i++) {
                const slot = this.scaledBuildSlots[i];
                if (!slot.occupied || this.isSelling) {
                    this.ctx.rect(slot.x - halfSize, slot.y - halfSize, size, size);
                }
            }
            this.ctx.fill();
            this.ctx.stroke();
        }

        // Объекты
        this.towers.forEach(tower => tower.draw(this.ctx));
        this.enemies.forEach(enemy => enemy.draw(this.ctx, this.scale)); 
        this.projectiles.forEach(p => p.draw(this.ctx));
        this.effects.forEach(eff => eff.draw(this.ctx));
        this.floatingTexts.forEach(text => text.draw(this.ctx));
        
        // Призрачная башня под мышью
        this.drawGhostTower();
    }

    // --- УПРАВЛЕНИЕ СОСТОЯНИЕМ ИГРЫ ---
    startLevel(levelNumber, options = {}) {
        document.getElementById('win-popup')?.classList.add('hidden');
        document.getElementById('lose-popup')?.classList.add('hidden');

        // Красим фон страницы 1 РАЗ при старте уровня, а не 60 раз в секунду:
        const bgColors = { 3: '#08141e', 4: '#08141e', 6: '#494885', 7: '#8a7158' };
        document.body.style.backgroundColor = bgColors[levelNumber] || '#346927';

        if (!LEVELS_CONFIG[levelNumber]) {
            alert(`Уровень ${levelNumber} ещё находится в разработке!`);
            this.returnToMainMenu();
            return;
        }

        this.currentLevel = levelNumber;
        
        // --- ПЕРЕКЛЮЧЕНИЕ КАРТЫ ---
        if (levelNumber === 6) {
            this.currentRawPath = pathLevel6;
            this.currentRawSlots = JSON.parse(JSON.stringify(buildSlotsLevel6));
            backgroundImage.src = 'images/ФПСНкристалл.webp';
        } else if (levelNumber === 7) {
            // Для 7 уровня грузим карту деревни
            this.currentRawPath = pathLevel7;
            this.currentRawSlots = JSON.parse(JSON.stringify(buildSlotsLevel7));
            backgroundImage.src = 'images/Фондеревня.webp';
        } else {
            this.currentRawPath = defaultPath;
            this.currentRawSlots = JSON.parse(JSON.stringify(defaultBuildSlots));
            backgroundImage.src = 'images/ФПСН.webp';
        }

        this.recalculatePositions();
        this.resetStateForLevelStart(options);
        this.stopMusic();

        // Настройки по умолчанию
        let levelBackgroundSrc = 'images/ФПСН.webp'; 
        let levelMusic = backgroundMusic;
        let startAction = () => this.startGame();

        switch (levelNumber) {
            case 2: 
                startAction = () => this.ui.showFluttershyIntro(); 
                break;
            case 3:
                levelBackgroundSrc = 'images/ФПСНвечер.webp'; 
                levelMusic = eveningMusic; 
                startAction = () => this.ui.showStoryScreen(
                    "ВЕЧЕРЕЕТ...", 
                    "Солнце садится. Тени удлиняются.<br>К нам спешит подкрепление, но враги уже близко!",
                    () => this.ui.showRainbowDashIntro()
                );
                break;
            case 4:
                levelBackgroundSrc = 'images/ФПСНночь.webp';
                levelMusic = nightMusic;
                startAction = () => this.ui.showStoryScreen(
                    "НАСТУПИЛА НОЧЬ", 
                    "Тьма окутала Понивилль.<br>Летучие мыши и ночные кошмары выходят на охоту.<br><br>Держите оборону до рассвета!",
                    () => this.startGame()
                );
                break;
            case 5:
                levelBackgroundSrc = 'images/ФПСНутро.webp'; 
                levelMusic = morningMusic; 
                startAction = () => this.ui.showStoryScreen(
                    "РАССВЕТ!", 
                    "Лучи солнца пробиваются сквозь тучи.<br>Мы пережили эту ночь!<br><br>Но враги не сдаются. В бой!",
                    () => this.ui.showLunaIntro()
                );
                break;
            case 6:
                levelBackgroundSrc = 'images/ФПСНкристалл.webp'; 
                levelMusic = crystalMusic; 
                startAction = () => this.ui.showDerpyIntro(); 
                break;
            case 7:
                levelBackgroundSrc = 'images/Фондеревня.webp'; 
                levelMusic = villageMusic;
                startAction = () => this.ui.showStoryScreen(
                    "ПОДОЗРИТЕЛЬНАЯ ДЕРЕВНЯ", 
                    "Мы забрели в странное поселение...<br>У всех жителей одинаковые знаки отличия и натянутые улыбки.<br><br><b>Старлайт Глиммер</b> считает равенство истинной гармонией и не позволит нам пройти!",
                    () => this.startGame()
                );
                break;
            default:
                levelBackgroundSrc = 'images/ФПСН.webp';
                levelMusic = backgroundMusic;
                break;
        }

        if (!backgroundImage.src.includes(levelBackgroundSrc)) {
            backgroundImage.src = levelBackgroundSrc;
        }
        
        this.activeMusic = levelMusic;

        if (options.skipIntro) {
            this.startGame();
        } else {
            startAction();
        }
    }

    startGame() {
        this.isRunning = true;
        this.ui.showGameScreen();
        this.playMusic();
    }

    playMusic() {
        if (this.activeMusic) {
            this.activeMusic.play().catch(() => console.log("Ждем клика для музыки"));
        }
    }

    stopMusic() {
        [backgroundMusic, nightMusic, eveningMusic, morningMusic, crystalMusic, villageMusic].forEach(track => {
            track.pause();
            track.currentTime = 0;
        });
    }

    clearAllTimeouts() {
        this.spawnTimeouts.forEach(id => clearTimeout(id));
        this.spawnTimeouts = [];
    }

    startGameAfterIntro() {
        this.isRunning = true;
        this.ui.showGameScreen();
        this.ui.update();
        this.playMusic();
    }

    removeTower(tower) {
        if (tower.slotIndex !== undefined && this.scaledBuildSlots[tower.slotIndex]) {
            this.scaledBuildSlots[tower.slotIndex].occupied = false;
        }
        const index = this.towers.indexOf(tower);
        if (index > -1) {
            this.towers.splice(index, 1);
        }
    }

    getSpawnPointOnPath(towerX, towerY) {
        let minDistance = Infinity;
        let bestPoint = { x: 0, y: 0 };
        let bestIndex = 0;

        if (!this.scaledPath || this.scaledPath.length < 2) return { point: {x: towerX, y: towerY}, pathIndex: 0 };

        for (let i = 0; i < this.scaledPath.length - 1; i++) {
            const p1 = this.scaledPath[i];
            const p2 = this.scaledPath[i + 1];

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const lengthSq = dx * dx + dy * dy;

            if (lengthSq === 0) continue;

            let t = ((towerX - p1.x) * dx + (towerY - p1.y) * dy) / lengthSq;
            t = Math.max(0, Math.min(1, t));

            const projX = p1.x + t * dx;
            const projY = p1.y + t * dy;

            const dist = Math.sqrt(Math.pow(towerX - projX, 2) + Math.pow(towerY - projY, 2));

            if (dist < minDistance) {
                minDistance = dist;
                bestPoint = { x: projX, y: projY };
                bestIndex = i;
            }
        }

        return { point: bestPoint, pathIndex: bestIndex };
    }

    resetStateForLevelStart(options = {}) {
        this.clearAllTimeouts(); 
        this.isRunning = false;
        this.enemies = [];
        this.towers = [];
        this.projectiles = [];
        this.effects = [];

        if (this.scaledBuildSlots) {
            this.scaledBuildSlots.forEach(slot => slot.occupied = false);
        }

        this.lunaCooldown = 0;
        this.wave = 0;
        this.lives = 10;
        this.money = LEVEL_START_MONEY[this.currentLevel] || 100;
        
        this.cancelModes();
        this.waveInProgress = false;
        this.allEnemiesScheduled = false;
        this.isEqualizedActive = false;
        this.restoreButtonsUI();
    }
    
    winLevel() {
        this.isRunning = false;
        if (this.currentLevel === this.unlockedLevels) {
            this.unlockedLevels++;
            this.saveProgress();
        }
        this.ui.showWinScreen();
        this.stopMusic();
    }

    loseGame() {
        this.isRunning = false;
        this.ui.showLoseScreen();
    }
    
    startNextLevel() {
        this.startLevel(this.currentLevel + 1, { keepMoney: true });
    }
    
    restartCurrentLevel() {
        this.startLevel(this.currentLevel);
    }

    returnToMainMenu() {
        this.clearAllTimeouts();
        this.isRunning = false;
        document.body.style.backgroundColor = '#3c3c58'; // Возвращаем родной фон темы
        this.ui.showMainMenu();
        this.stopMusic();
    }

    unlockLevels(num) {
        if (num > 0) {
            this.unlockedLevels = num;
            console.log(`%cCHEAT ACTIVATED: Уровни до ${num} разблокированы!`, 'color: lime; font-weight: bold;');
            this.saveProgress();
            this.ui.showMainMenu();
        }
    }

    saveProgress() {
        localStorage.setItem('ponyTD_unlockedLevels', this.unlockedLevels);
        console.log(`Прогресс сохранен: ${this.unlockedLevels} уровней открыто.`);
    }

    loadProgress() {
        const savedLevels = localStorage.getItem('ponyTD_unlockedLevels');
        if (savedLevels) {
            this.unlockedLevels = parseInt(savedLevels, 10);
        } else {
            this.unlockedLevels = 1;
        }
    }
    
    // --- СПЕЦЭФФЕКТЫ БОССОВ ---
    triggerNightmareEffect() {
        this.isRunning = false; 
        this.ui.showStoryScreen(
            "ВЕЧНАЯ НОЧЬ!", 
            "Найтмер Мун здесь!<br>Её темная магия усыпила ваших пони!<br><br>Они не могут атаковать и их нельзя продать!",
            () => this.startGame()
        );

        const activeTowers = this.towers.filter(t => !t.isAsleep);
        for (let i = activeTowers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [activeTowers[i], activeTowers[j]] = [activeTowers[j], activeTowers[i]];
        }

        const countToSleep = Math.min(activeTowers.length, 10);
        for (let i = 0; i < countToSleep; i++) {
            activeTowers[i].isAsleep = true;
        }
    }

    triggerChrysalisEffect() {
        const activeTowers = [...this.towers];
        for (let i = activeTowers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [activeTowers[i], activeTowers[j]] = [activeTowers[j], activeTowers[i]];
        }

        let count = Math.floor(Math.random() * (15 - 5 + 1)) + 5;
        count = Math.min(count, activeTowers.length);

        for (let i = 0; i < count; i++) {
            const tower = activeTowers[i];
            tower.isTransforming = true;
            tower.transformFrame = 0;
        }
    }

    spawnSombraCrystals() {
        const crystalCount = 5;
        if (!this.scaledBuildSlots || this.scaledBuildSlots.length === 0) return;

        const availableSlots = this.scaledBuildSlots.filter(slot => !slot.occupied);
        availableSlots.sort(() => Math.random() - 0.5);

        for (let i = 0; i < Math.min(crystalCount, availableSlots.length); i++) {
            const slot = availableSlots[i];
            const crystal = new Enemy('SombraCrystal', []); 
            crystal.x = slot.x;
            crystal.y = slot.y;
            slot.occupied = true;
            this.enemies.push(crystal);
        }
    }

    triggerStarlightEffect() {
        this.isRunning = false;
        this.isEqualizedActive = true; // Включаем флаг равенства для цен и новых башен
        this.applyEqualizedButtonsUI();

        this.ui.showStoryScreen(
            "ИСТИННОЕ РАВЕНСТВО!", 
            "<b>Старлайт Глиммер</b> вступила в бой!<br><br>" +
            "Её магия уравняла всех пони!:<br>" +
            "• Урон всех пони: <b>3.0</b><br>" +
            "• Скорость атаки: <b>Уравнена</b><br>" +
            "• Радиус обзора: <b>85 px</b><br>" +
            "• Призыв любой пони: <b>50 💰</b><br><br>" +
            "<i>Победите Старлайт, чтобы вернуть таланты!</i>",
            () => this.startGame()
        );

        playSound('Твайлайт Спаркл');

        // УРАВНИВАЕМ ВСЕ БАШНИ:
        this.towers.forEach(tower => {
            tower.isEqualized = true;
            tower.damage = 3.0; // Единый урон
            tower.range = 85 * this.scale; // Единый радиус (Рэрити и Пинки урезаны!)

            if (tower.isMelee) {
                tower.damageTickRate = 18; // Пинки больше не строчит как пулемет!
            }
            if (tower.isSniper) {
                tower.fireRate = 50;
            }
            if (tower.isPatrolTower) {
                tower.auraDamage = 1;
                tower.auraRadius = 35 * this.scale;
            }
        });
    }

    startWave() {
        if (this.waveInProgress) return;
        
        const waveData = LEVELS_CONFIG[this.currentLevel]?.[this.wave];
        if (!waveData) {
            console.log("Больше волн нет.");
            return;
        }

        this.waveInProgress = true;
        this.wave++;
        this.money += 10;
        this.allEnemiesScheduled = false;
        console.log(`🌊 Волна ${this.wave} (${waveData.name}) началась!`);

        const enemyGroups = waveData.enemies;
        const totalEnemiesInWave = enemyGroups.reduce((total, group) => total + group.count, 0);
        let enemiesSpawnedCount = 0;

        const scheduleEnemy = (type, delay) => {
            const timerId = setTimeout(() => {
                this.enemies.push(new Enemy(type, this.scaledPath));
                
                if (type === 'NightmareMoon') this.triggerNightmareEffect();
                if (type === 'Crizalis') this.triggerChrysalisEffect();
                if (type === 'KingSombra') this.spawnSombraCrystals();
                if (type === 'Starlight') this.triggerStarlightEffect();

                enemiesSpawnedCount++;
                if (enemiesSpawnedCount === totalEnemiesInWave) {
                    this.allEnemiesScheduled = true;
                }
            }, delay);
            
            this.spawnTimeouts.push(timerId);
        };
        
        const sirenGroups = enemyGroups.filter(g => g.type.includes("Siren"));
        const normalGroups = enemyGroups.filter(g => !g.type.includes("Siren"));

        let maxNormalSpawnTime = 0;
        normalGroups.forEach(group => {
            const groupSpawnDuration = group.count > 0 ? (group.count - 1) * group.interval : 0;
            maxNormalSpawnTime = Math.max(maxNormalSpawnTime, (group.delay || 0) + groupSpawnDuration);
            for (let i = 0; i < group.count; i++) {
                scheduleEnemy(group.type, (group.delay || 0) + i * group.interval);
            }
        });

        let sirenStartTime = maxNormalSpawnTime;
        if (normalGroups.length > 0 && sirenGroups.length > 0) {
            sirenStartTime += PAUSE_BETWEEN_GROUPS_MS;
        }

        sirenGroups.forEach((group, index) => {
            if (index > 0) sirenStartTime += PAUSE_BETWEEN_GROUPS_MS;
            for (let i = 0; i < group.count; i++) {
                scheduleEnemy(group.type, sirenStartTime + i * group.interval);
            }
            sirenStartTime += group.count * group.interval;
        });
    }

    // --- ОБРАБОТЧИКИ ВВОДА ---
    handleMouseMove(event) {
        const pos = this.getMousePos(event);
        this.mouse.x = pos.x;
        this.mouse.y = pos.y;
    }

    handleCanvasClick(event) {
        const pos = this.getMousePos(event);
        const mouseX = pos.x;
        const mouseY = pos.y;
        
        // Режим продажи
        if (this.isSelling) {
            const towerIndex = this.towers.findIndex(tower => {
                const distance = Math.sqrt(Math.pow(tower.x - mouseX, 2) + Math.pow(tower.y - mouseY, 2));
                return distance < 30;
            });

            if (towerIndex !== -1) {
                const tower = this.towers[towerIndex];
                if (tower.isAsleep) {
                    console.log("Нельзя продать спящую башню!");
                    return; 
                }
                const refund = Math.floor(TOWER_CONFIG[tower.type].price * SELL_REFUND_PERCENTAGE);
                this.money += refund;

                const startSlot = this.scaledBuildSlots.find(s => s.x === tower.x && s.y === tower.y);
                if (startSlot) startSlot.occupied = false;
                if (tower.isPatrolTower && tower.patrolEnd) {
                    const endSlot = this.scaledBuildSlots.find(s => s.x === tower.patrolEnd.x && s.y === tower.patrolEnd.y);
                    if (endSlot) endSlot.occupied = false;
                }
                this.towers.splice(towerIndex, 1);
            }
            this.cancelModes();
            return;
        }

        // Патруль для Радуги
        if (this.isPlacingPatrolPoint) {
            const nearestSlot = this.findNearestFreeSlot(mouseX, mouseY);
            if (nearestSlot && this.patrolTowerRef) {
                this.patrolTowerRef.patrolEnd = { x: nearestSlot.x, y: nearestSlot.y };
                const slotIndex = this.scaledBuildSlots.indexOf(nearestSlot);
                this.patrolTowerRef.patrolEndSlotIndex = slotIndex;
                nearestSlot.occupied = true;
                this.cancelModes();
            }
            return;
        }
        
        // Режим строительства
        if (this.isBuilding) {
            const towerType = this.selectedTowerType;
            const config = TOWER_CONFIG[towerType];

            if (config.isAbility) {
                if (this.money >= config.price && this.lunaCooldown <= 0) {
                    this.money -= config.price;
                    this.effects.push(new LunaEffect(mouseX, mouseY, this, config));
                    this.lunaCooldown = 180; // 👈 3 МИНУТЫ КУЛДАУНА!
                    this.cancelModes(); 
                }
                return;
            }

            const nearestSlot = this.findNearestFreeSlot(mouseX, mouseY);
            if (nearestSlot) {
                const slotIndex = this.scaledBuildSlots.indexOf(nearestSlot);
                
                // ВО ВРЕМЯ РАВЕНСТВА ЛЮБАЯ ПОНИ СТОИТ 50 💰:
                const price = (this.isEqualizedActive && !config.isAbility) ? 50 : config.price;
                
                if (this.money >= price) {
                    this.money -= price;
                    const newTower = new Tower(nearestSlot.x, nearestSlot.y, towerType, this, slotIndex);
                    
                    // Если чары ещё действуют — новая пони сразу становится серой и равной:
                    if (this.isEqualizedActive) {
                        newTower.isEqualized = true;
                        newTower.damage = 3.0;
                        newTower.range = 85 * this.scale;
                        if (newTower.isMelee) newTower.damageTickRate = 18;
                        if (newTower.isSniper) newTower.fireRate = 50;
                    }

                    this.towers.push(newTower);
                    nearestSlot.occupied = true;

                    if (newTower.isPatrolTower) {
                        this.isBuilding = false;
                        this.isPlacingPatrolPoint = true;
                        this.patrolTowerRef = newTower;
                    } else {
                        this.cancelModes();
                    }
                } else {
                    this.cancelModes();
                }
            } else {
                this.cancelModes();
            }
        }
    }

    finalizeTransformation(tower) {
        if (!this.scaledPath) return; 

        const spawnInfo = this.getSpawnPointOnPath(tower.x, tower.y);
        const changeling = new Enemy('PereWalk', this.scaledPath);
        
        changeling.x = spawnInfo.point.x;
        changeling.y = spawnInfo.point.y;
        changeling.pathIndex = spawnInfo.pathIndex;

        this.enemies.push(changeling);

        let slotFreed = false;
        if (tower.slotIndex !== undefined && this.scaledBuildSlots[tower.slotIndex]) {
            this.scaledBuildSlots[tower.slotIndex].occupied = false;
            slotFreed = true;
        }

        if (!slotFreed) {
            for (const slot of this.scaledBuildSlots) {
                if (Math.abs(slot.x - tower.x) < 5 && Math.abs(slot.y - tower.y) < 5) {
                    slot.occupied = false;
                    break;
                }
            }
        }
        const index = this.towers.indexOf(tower);
        if (index > -1) {
            this.towers.splice(index, 1);
        }
    }

    // Делает кнопки пони серыми со знаком 50💰
    applyEqualizedButtonsUI() {
        const buttons = document.querySelectorAll('#towers-panel .tower-select-button');
        buttons.forEach(btn => {
            const type = btn.dataset.towerType;
            // Сохраняем родной текст, чтобы потом вернуть
            if (!btn.dataset.originalText) {
                btn.dataset.originalText = btn.textContent;
            }
            btn.textContent = `${type} (50💰)`;
            btn.classList.add('equalized-btn');
        });
    }

    // Возвращает кнопкам цвета и родные цены
    restoreButtonsUI() {
        const buttons = document.querySelectorAll('#towers-panel .tower-select-button');
        buttons.forEach(btn => {
            if (btn.dataset.originalText) {
                btn.textContent = btn.dataset.originalText;
            }
            btn.classList.remove('equalized-btn');
        });
    }
    
    // --- УПРАВЛЕНИЕ РЕЖИМАМИ UI ---
    selectTower(type) {
        const cost = (this.isEqualizedActive && type !== 'Принцесса Луна') ? 50 : TOWER_CONFIG[type].price;

        if (this.money < cost) {
            this.ui.updateTowerInfoPanel(null);
            return;
        }
        
        if (type === 'Принцесса Луна' && this.lunaCooldown > 0) {
            return; // Ещё на перезарядке!
        }

        if (this.money < TOWER_CONFIG[type].price) {
            this.ui.updateTowerInfoPanel(null);
            return;
        }
        if (this.isBuilding && this.selectedTowerType === type) {
            this.cancelModes();
        } else {
            this.isBuilding = true;
            this.isSelling = false;
            this.selectedTowerType = type;
            this.ui.updateTowerInfoPanel(type);
        }
    }

    toggleSellMode() {
        this.isSelling = !this.isSelling;
        if (this.isSelling) {
            this.isBuilding = false;
            this.selectedTowerType = null;
        }
    }

    cancelModes() {
        this.isBuilding = false;
        this.isSelling = false;
        this.selectedTowerType = null;
        this.isPlacingPatrolPoint = false;
        this.patrolTowerRef = null;
        this.ui.updateTowerInfoPanel(null); 
    }
    
    // --- ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ МАСШТАБИРОВАНИЯ ---
    setupScaling() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.scale = Math.min(this.canvas.width / this.originalWidth, this.canvas.height / this.originalHeight);
        this.offsetX = (this.canvas.width - this.originalWidth * this.scale) / 2;
        this.offsetY = (this.canvas.height - this.originalHeight * this.scale) / 2;
    }

    recalculatePositions() {
        this.SCALED_BUILD_SLOT_SIZE = BUILD_SLOT_SIZE * this.scale;
        this.scaledPath = this.currentRawPath.map(p => this.scaleCoords(p));

        if (this.currentRawSlots) {
             this.scaledBuildSlots = this.currentRawSlots.map((originalSlot, index) => {
                const newCoords = this.scaleCoords(originalSlot);
                let wasOccupied = false;
                if (this.scaledBuildSlots && this.scaledBuildSlots[index]) {
                    wasOccupied = this.scaledBuildSlots[index].occupied;
                }

                return {
                    x: newCoords.x,
                    y: newCoords.y,
                    occupied: wasOccupied
                };
             });
        }
        
        this.towers.forEach(tower => {
            if (tower.slotIndex !== undefined && this.scaledBuildSlots[tower.slotIndex]) {
                const newPos = this.scaledBuildSlots[tower.slotIndex];
                tower.x = newPos.x;
                tower.y = newPos.y;

                if (tower.isPatrolTower) {
                    tower.patrolStart = { x: newPos.x, y: newPos.y };
                    if (!tower.patrolEnd) {
                        tower.patrolCurrentPos = { x: newPos.x, y: newPos.y };
                    }
                }
            }

            if (tower.isPatrolTower && tower.patrolEndSlotIndex !== undefined) {
                const endSlot = this.scaledBuildSlots[tower.patrolEndSlotIndex];
                if (endSlot) {
                    tower.patrolEnd = { x: endSlot.x, y: endSlot.y };
                }
            }
        });
    }

    scaleCoords(point) {
        return { 
            x: point.x * this.scale + this.offsetX, 
            y: point.y * this.scale + this.offsetY 
        };
    }
    
    getMousePos(event) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        return { 
            x: (event.clientX - rect.left) * scaleX, 
            y: (event.clientY - rect.top) * scaleY 
        };
    }

    findNearestFreeSlot(mouseX, mouseY) {
        let nearestSlot = null;
        let minDistanceSq = Infinity;
        const maxDist = this.SCALED_BUILD_SLOT_SIZE / 2;
        const maxDistSq = maxDist * maxDist;

        for (let i = 0; i < this.scaledBuildSlots.length; i++) {
            const slot = this.scaledBuildSlots[i];
            if (!slot.occupied) {
                const dx = slot.x - mouseX;
                const dy = slot.y - mouseY;
                const distSq = dx * dx + dy * dy;
                
                if (distSq < maxDistSq && distSq < minDistanceSq) {
                    minDistanceSq = distSq;
                    nearestSlot = slot;
                }
            }
        }
        return nearestSlot;
    }

    drawGhostTower() {
        if (!this.isBuilding || !this.selectedTowerType) return;
        const config = TOWER_CONFIG[this.selectedTowerType];
    
        if (config.isAbility) {
            const x = this.mouse.x;
            const y = this.mouse.y;
            const img = towerImages['Прицел'];
            
            if (img && img.complete && img.naturalWidth > 0) {
                const size = 448 * this.scale; 
                this.ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
            }
            
            const radius = (config.aoeRadius || 250) * this.scale;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(129, 140, 248, 0.15)';
            this.ctx.fill();
            this.ctx.strokeStyle = 'rgba(199, 210, 254, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke(); 
            return;
        }

        const nearestSlot = this.findNearestFreeSlot(this.mouse.x, this.mouse.y);
        if (nearestSlot) {
            const canAfford = this.money >= config.price;
            const x = nearestSlot.x; 
            const y = nearestSlot.y;
            const size = this.SCALED_BUILD_SLOT_SIZE;
            const halfSize = size / 2;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, config.range * this.scale, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            this.ctx.strokeStyle = canAfford ? 'white' : 'red';
            this.ctx.lineWidth = 2;
            this.ctx.fill();
            this.ctx.stroke();
            this.ctx.fillStyle = canAfford ? 'rgba(170, 255, 170, 0.4)' : 'rgba(255, 170, 170, 0.4)';
            this.ctx.fillRect(x - halfSize, y - halfSize, size, size);
        }
    }
}