// Файл: js/game.js

import UIManager from './uiManager.js';
import Enemy from './entities/Enemy.js';
import Tower from './entities/Tower.js';
import Projectile from './entities/Projectile.js';
import LunaEffect from './entities/LunaEffect.js';
import FloatingText from './entities/FloatingText.js';
import { 
    path, buildSlots, LEVELS_CONFIG, backgroundImage, nightBackground, eveningBackground, morningBackground, crystalBackground,
    TOWER_CONFIG, BUILD_SLOT_SIZE, SELL_REFUND_PERCENTAGE, 
    PAUSE_BETWEEN_GROUPS_MS, ENEMY_TYPES,
    originalWidth, originalHeight, 
    backgroundMusic, nightMusic, eveningMusic, crystalMusic, LEVEL_START_MONEY, morningMusic,
    towerImages, 
    pathLevel6, buildSlotsLevel6, path as defaultPath, buildSlots as defaultBuildSlots,
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

        // По умолчанию загружаем стандартную карту (Ур. 1)
        this.currentRawPath = defaultPath;
        this.currentRawSlots = JSON.parse(JSON.stringify(defaultBuildSlots));

        this.mouse = { x: 0, y: 0 };

        // --- Настройка масштабирования ---
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.setupScaling(); // Вычисляем правильные значения

        // --- СЛУШАТЕЛЬ ИЗМЕНЕНИЯ РАЗМЕРА ОКНА ---
        window.addEventListener('resize', () => {
            this.setupScaling(); // 1. Пересчитываем коэффициенты (scale, offsetX)
            this.recalculatePositions(); // 2. Пересчитываем координаты сетки и пути
            this.draw(); // 3. Рисуем сразу, чтобы не мигало
        });
                
        // Первая инициализация путей (вызовет recalculatePositions внутри)
        this.recalculatePositions();

        // --- Запуск игры ---
        this.isBackgroundLoaded = false;
        backgroundImage.onload = () => {
            this.isBackgroundLoaded = true;
        };
        // Запускаем игровой цикл, который будет работать всегда
        this.gameLoop();
    }
    
    // --- ОСНОВНОЙ ИГРОВОЙ ЦИКЛ ---
    
    gameLoop() {
        // Обновляем логику игры
        this.update();
        // Рисуем всё на холсте
        this.draw();
        // Планируем следующий кадр
        requestAnimationFrame(() => this.gameLoop());
    }

    showFloatingText(x, y, text, color) {
        this.floatingTexts.push(new FloatingText(x, y, text, color));
    }

    update() {
        if (!this.isRunning) return; // Если игра на паузе (в меню), ничего не обновляем

        // 1. Обновляем все башни
        this.towers.forEach(tower => tower.update(this.enemies, this.projectiles));
        this.effects.forEach(eff => eff.update(this.enemies));
        this.effects = this.effects.filter(eff => eff.state !== 'finished');
        this.floatingTexts.forEach(text => text.update());
        this.floatingTexts = this.floatingTexts.filter(text => text.life > 0);

        // 2. Обновляем все снаряды и обрабатываем попадания
        this.projectiles = this.projectiles.filter(projectile => {
            const result = projectile.update(this.scale)
            if (result === true) { return false; } // Снаряд уничтожается (обычное попадание)
            else if (result && result.type === 'aoe') {
                // Обработка АОЕ-взрыва
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
                return false; // Снаряд уничтожается после взрыва
            }
            return true; // Снаряд продолжает лететь
        });
        

        // 3. Обновляем всех врагов
        this.enemies.forEach(enemy => enemy.update(this.scale));

        // 4. Удаляем "мертвых" и "сбежавших" врагов
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.isFinished) {
                const isBoss = enemy.type === 'Trixie' || enemy.type.includes('Siren') || enemy.type === 'Achel' || enemy.type === 'SfinksFky' || enemy.type === 'NightmareMoon' || enemy.type === 'SfinksWalk' || enemy.type === 'Crizalis' || enemy.type === 'KingSombra' || enemy.type === 'TrueChrysalis';
                this.lives -= isBoss ? 5 : 1;
                if (this.lives <= 0) {
                    this.lives = 0;
                    this.loseGame();
                }
                return false; // Удаляем врага
            }
            if (enemy.currentHealth <= 0) {
                this.money += enemy.bounty;
                if (enemy.type === 'SombraCrystal') {
                    // Ищем Сомбру на карте
                    const sombra = this.enemies.find(e => e.type === 'KingSombra');
                    if (sombra) {
                        // Наносим 2000 урона (или 1/5 от его здоровья)
                        sombra.currentHealth -= 2000; 
                        console.log(`Кристалл разрушен! Здоровье Сомбры: ${sombra.currentHealth}`);
                        
                        // Визуальный эффект (можно просто звук)
                        // playSound('CrystalBreak'); 
                        
                        // Освобождаем слот!
                        // Находим слот по координатам кристалла
                        const slot = this.scaledBuildSlots.find(s => s.x === enemy.x && s.y === enemy.y);
                        if (slot) slot.occupied = false;
                    }
                }
                return false; // Удаляем врага
            }

            
            return true; // Оставляем врага в игре
        });
        
        // 5. Проверяем, не закончилась ли волна
        if (this.waveInProgress && this.allEnemiesScheduled && this.enemies.length === 0) {
            this.waveInProgress = false;
            console.log(`🌟 Волна ${this.wave} завершена!`);

            const currentLevelWaves = LEVELS_CONFIG[this.currentLevel];
            if (this.wave >= currentLevelWaves.length) {
                this.winLevel();
            }
        }

        // 6. Обновляем весь UI в конце каждого кадра
        this.ui.update();
    }
    
    draw() {
        // 1. Очищаем холст
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // --- ЦВЕТА ФОНА ---
        let bgColor;

        // Ночь (4) и Вечер (3)
        if (this.currentLevel === 3 || this.currentLevel === 4) {
             bgColor = '#08141e'; // Темно-синий, почти черный (подходит под ночную карту)
        } else if (this.currentLevel === 6) {
                bgColor = '#494885'; // Светло-сиреневый (Light Lilac)
        }
        // Утро (5), День (1, 2)
        else {
             bgColor = '#346927'; // Насыщенный зеленый (цвет травы с твоих скриншотов)
        }

        // Красим подложку
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Красим сам браузер (чтобы убрать белые/серые полосы за пределами канваса)
        document.body.style.backgroundColor = bgColor; 

        // 2. Рисуем картинку
        if (this.isBackgroundLoaded) {
            this.ctx.drawImage(backgroundImage, this.offsetX, this.offsetY, this.originalWidth * this.scale, this.originalHeight * this.scale);
        }

        // Если игра не запущена (в меню), ничего больше не рисуем
        if (!this.isRunning) return;

        // 3. Рисуем сетку строительства
        if (this.isBuilding || this.isSelling) {
            const size = this.SCALED_BUILD_SLOT_SIZE;
            const halfSize = size / 2;
            
            this.scaledBuildSlots.forEach(slot => {
                if (!slot.occupied) { // Свободные слоты
                    this.ctx.fillStyle = 'rgba(182, 238, 129, 0.4)'; // Яркий желтый
                    this.ctx.fillRect(slot.x - halfSize, slot.y - halfSize, size, size);
                    this.ctx.strokeStyle = 'rgba(187, 187, 187, 0.44)';
                    this.ctx.strokeRect(slot.x - halfSize, slot.y - halfSize, size, size);
                } else if (this.isSelling) { // Занятые слоты (красные)
                    this.ctx.fillStyle = 'rgba(214, 79, 79, 0.4)'; // Яркий красный
                    this.ctx.fillRect(slot.x - halfSize, slot.y - halfSize, size, size);
                    this.ctx.strokeStyle = 'rgba(192, 192, 192, 0.42)';
                    this.ctx.strokeRect(slot.x - halfSize, slot.y - halfSize, size, size);
                }
            });
        }

        // 4. Рисуем игровые объекты
        this.towers.forEach(tower => tower.draw(this.ctx));
        this.enemies.forEach(enemy => enemy.draw(this.ctx, this.scale)); 
        this.projectiles.forEach(p => p.draw(this.ctx));
        this.effects.forEach(eff => eff.draw(this.ctx));
        this.floatingTexts.forEach(text => text.draw(this.ctx));
        
        // 5. Рисуем "призрачную" башню (которую мы держим мышкой)
        this.drawGhostTower();
    }

    // --- УПРАВЛЕНИЕ СОСТОЯНИЕМ ИГРЫ ---

    // В файле js/game.js

    startLevel(levelNumber, options = {}) {
        this.currentLevel = levelNumber;
        
        // --- ПЕРЕКЛЮЧЕНИЕ КАРТЫ ---
        if (levelNumber === 6) {
            // Для 6 уровня грузим новую карту
            this.currentRawPath = pathLevel6;
            this.currentRawSlots = JSON.parse(JSON.stringify(buildSlotsLevel6));
            backgroundImage.src = 'images/ФПСНкристалл.png';
        } else {
            // Для остальных уровней - стандартная
            this.currentRawPath = defaultPath;
            this.currentRawSlots = JSON.parse(JSON.stringify(defaultBuildSlots));
            backgroundImage.src = 'images/ФПСН.png';
        }

        // ВАЖНО: Пересчитываем координаты под текущий размер экрана с новыми данными
        this.recalculatePositions();

        this.resetStateForLevelStart(options);
        this.stopMusic();

        // Настройки по умолчанию (День)
        let levelBackgroundSrc = 'images/ФПСН.png'; 
        let levelMusic = backgroundMusic;
        
        // Действие по умолчанию: просто начать игру
        let startAction = () => this.startGame();

        switch (levelNumber) {
            case 2: startAction = () => this.ui.showFluttershyIntro(); break;
            case 3:
                levelBackgroundSrc = 'images/ФПСНвечер.png'; 
                levelMusic = eveningMusic; 
                startAction = () => this.ui.showStoryScreen(
                    "ВЕЧЕРЕЕТ...", 
                    "Солнце садится. Тени удлиняются.<br>К нам спешит подкрепление, но враги уже близко!",
                    () => this.ui.showRainbowDashIntro()
                );
                break;
            case 4:
                levelBackgroundSrc = 'images/ФПСНночь.png';
                levelMusic = nightMusic;
                startAction = () => this.ui.showStoryScreen(
                    "НАСТУПИЛА НОЧЬ", 
                    "Тьма окутала Понивилль.<br>Летучие мыши и ночные кошмары выходят на охоту.<br><br>Держите оборону до рассвета!",
                    () => this.startGame()
                );
                break;
            case 5:
                levelBackgroundSrc = 'images/ФПСНутро.png'; 
                levelMusic = morningMusic; 
                startAction = () => this.ui.showStoryScreen(
                    "РАССВЕТ!", 
                    "Лучи солнца пробиваются сквозь тучи.<br>Мы пережили эту ночь!<br><br>Но враги не сдаются. В бой!",
                    () => this.ui.showLunaIntro()
                );
                break;
            case 6:
                levelBackgroundSrc = 'images/ФПСНкристалл.png'; 
                            levelMusic = crystalMusic; 
                            // Запускаем сначала Дёрпи. Когда нажмут кнопку, сработает код выше и покажет Историю.
                            startAction = () => this.ui.showDerpyIntro(); 
                break;
            case 7:
                levelBackgroundSrc = 'images/ФПСНкристалл.png'; 
                            levelMusic = crystalMusic; 
                            // Запускаем сначала Дёрпи. Когда нажмут кнопку, сработает код выше и покажет Историю.
                break;
            default:
                if (levelNumber === 5) { // Запасной вариант
                    levelBackgroundSrc = 'images/ФПСночь.png';
                    levelMusic = nightMusic;
                }
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

    // Упрощенный метод для старта игры
    startGame() {
        this.isRunning = true;
        this.ui.showGameScreen();
        this.playMusic();
    }

    // В классе Game

    // --- ЗВУКОВАЯ СИСТЕМА ---
    playMusic() {
        if (this.activeMusic) {
            // Пытаемся запустить музыку. Catch нужен, чтобы браузер не ругался на автоплей.
            this.activeMusic.play().catch(e => console.log("Ждем клика для запуска музыки"));
        }
    }

    stopMusic() {
        // Останавливаем ВСЕ ТРИ трека, чтобы они не накладывались
        [backgroundMusic, nightMusic, eveningMusic, morningMusic, crystalMusic].forEach(track => {
            track.pause();
            track.currentTime = 0;
        });
    }


    clearAllTimeouts() {
        // Проходимся по всем сохраненным таймерам и отменяем их
        this.spawnTimeouts.forEach(id => clearTimeout(id));
        this.spawnTimeouts = []; // Очищаем массив
    }

    startGameAfterIntro() {
        this.isRunning = true;
        this.ui.showGameScreen();
        this.ui.update();
        this.playMusic();
    }

    removeTower(tower) {
        // Освобождаем слот
        if (tower.slotIndex !== undefined && this.scaledBuildSlots[tower.slotIndex]) {
            this.scaledBuildSlots[tower.slotIndex].occupied = false;
        }
        // Удаляем из массива
        const index = this.towers.indexOf(tower);
        if (index > -1) {
            this.towers.splice(index, 1);
        }
    }

    // В файле js/game.js (внутри class Game)

    getSpawnPointOnPath(towerX, towerY) {
        let minDistance = Infinity;
        let bestPoint = { x: 0, y: 0 };
        let bestIndex = 0;

        // Проходим по всем отрезкам пути (от точки i до точки i+1)
        // scaledPath должен быть уже определен!
        if (!this.scaledPath || this.scaledPath.length < 2) return { point: {x: towerX, y: towerY}, pathIndex: 0 };

        for (let i = 0; i < this.scaledPath.length - 1; i++) {
            const p1 = this.scaledPath[i];
            const p2 = this.scaledPath[i + 1];

            // Вектор отрезка
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const lengthSq = dx * dx + dy * dy; // Квадрат длины отрезка

            // Если длина отрезка 0 (точки совпадают), пропускаем
            if (lengthSq === 0) continue;

            // Проекция точки (башни) на отрезок (параметр t от 0 до 1)
            let t = ((towerX - p1.x) * dx + (towerY - p1.y) * dy) / lengthSq;

            // Ограничиваем t, чтобы точка не вылетала за пределы отрезка
            t = Math.max(0, Math.min(1, t));

            // Координаты проекции
            const projX = p1.x + t * dx;
            const projY = p1.y + t * dy;

            // Расстояние от башни до этой точки на дороге
            const dist = Math.sqrt(Math.pow(towerX - projX, 2) + Math.pow(towerY - projY, 2));

            if (dist < minDistance) {
                minDistance = dist;
                bestPoint = { x: projX, y: projY };
                bestIndex = i; // Враг пойдет к точке i+1
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
        // Сбрасываем занятость только если массив слотов существует
        if (this.scaledBuildSlots) {
            this.scaledBuildSlots.forEach(slot => slot.occupied = false);
        }

        this.wave = 0;
        this.lives = 10;
        
        // --- НОВАЯ ЛОГИКА ДЕНЕГ ---
        // Если для уровня прописаны деньги, берем их. Если нет — 100 по умолчанию.
        this.money = LEVEL_START_MONEY[this.currentLevel] || 100;
        
        this.cancelModes();
        this.waveInProgress = false;
        this.allEnemiesScheduled = false;
    }
    
    winLevel() {
        this.isRunning = false;
        if (this.currentLevel === this.unlockedLevels) {
            this.unlockedLevels++;
            this.saveProgress()
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
        this.ui.showMainMenu();
        this.stopMusic();
    }

    // Вставьте эти два метода в класс Game в файле js/game.js
    unlockLevels(num) {
        if (num > 0) {
            this.unlockedLevels = num;
            console.log(`%cCHEAT ACTIVATED: Уровни до ${num} разблокированы!`, 'color: lime; font-weight: bold;');
            this.saveProgress();
            
            // Важно: теперь мы вызываем метод из нашего UIManager, чтобы перерисовать меню
            this.ui.showMainMenu();
        } else {
            console.error("Неверный номер уровня. Укажите число больше 0.");
        }
    }

    saveProgress() {
    localStorage.setItem('ponyTD_unlockedLevels', this.unlockedLevels);
    console.log(`Прогресс сохранен: ${this.unlockedLevels} уровней открыто.`);
    }

    loadProgress() {
        const savedLevels = localStorage.getItem('ponyTD_unlockedLevels');
        if (savedLevels) {
            this.unlockedLevels = parseInt(savedLevels, 10); // Превращаем строку из хранилища в число
        } else {
            this.unlockedLevels = 1; // Если сохранений нет, начинаем с 1 уровня
        }
        console.log(`Прогресс загружен: ${this.unlockedLevels} уровней открыто.`);
    }
    
    // --- ЛОГИКА ВОЛН ---
    triggerNightmareEffect() {
        // 1. СТАВИМ ИГРУ НА ПАУЗУ
        this.isRunning = false; 

        // 2. Показываем сообщение
        this.ui.showStoryScreen(
            "ВЕЧНАЯ НОЧЬ!", 
            "Найтмер Мун здесь!<br>Её темная магия усыпила ваших пони!<br><br>Они не могут атаковать и их нельзя продать!",
            () => {
                // Эта функция сработает, когда нажмут "Продолжить"
                this.startGame(); // Снимаем с паузы
            }
        );

        // 3. Выбираем башни
        const activeTowers = this.towers.filter(t => !t.isAsleep);
        
        // Перемешиваем
        for (let i = activeTowers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [activeTowers[i], activeTowers[j]] = [activeTowers[j], activeTowers[i]];
        }

        // 4. Усыпляем 10 штук (БЫЛО 7 -> СТАЛО 10)
        const countToSleep = Math.min(activeTowers.length, 10);
        for (let i = 0; i < countToSleep; i++) {
            activeTowers[i].isAsleep = true;
        }
    }

    triggerChrysalisEffect() {
        console.log("Кризалис начинает ритуал!");

        const activeTowers = [...this.towers];
        
        // Перемешиваем
        for (let i = activeTowers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [activeTowers[i], activeTowers[j]] = [activeTowers[j], activeTowers[i]];
        }

        // Выбираем 5-10 штук
        let count = Math.floor(Math.random() * (15 - 5 + 1)) + 5;
        count = Math.min(count, activeTowers.length);

        for (let i = 0; i < count; i++) {
            const tower = activeTowers[i];
            // ВМЕСТО УДАЛЕНИЯ, ЗАПУСКАЕМ АНИМАЦИЮ
            tower.isTransforming = true;
            tower.transformFrame = 0;
            // Можно добавить звук превращения, если есть
        }
    }
    // В game.js, метод spawnSombraCrystals
    spawnSombraCrystals() {
        console.log("Призываю кристаллы Сомбры!");
        const crystalCount = 5;
        
        // 1. Ищем свободные слоты
        // Важно: проверяем существование массива, чтобы не было ошибки
        if (!this.scaledBuildSlots || this.scaledBuildSlots.length === 0) return;

        const availableSlots = this.scaledBuildSlots.filter(slot => !slot.occupied);
        
        // 2. Перемешиваем
        availableSlots.sort(() => Math.random() - 0.5);

        // 3. Ставим кристаллы
        for (let i = 0; i < Math.min(crystalCount, availableSlots.length); i++) {
            const slot = availableSlots[i];
            
            // ВАЖНО: передаем пустой массив [] в качестве пути
            const crystal = new Enemy('SombraCrystal', []); 
            
            // Координаты берем из слота
            crystal.x = slot.x;
            crystal.y = slot.y;
            
            // Занимаем слот
            slot.occupied = true;
            
            // Добавляем в игру
            this.enemies.push(crystal);
        }
        
        // Сообщение игроку (без паузы)
        console.log("Кристаллы появились!");
    }

    startWave() {
        if (this.waveInProgress) return;
        
        const waveData = LEVELS_CONFIG[this.currentLevel]?.[this.wave];
        if (!waveData) {
            console.log("Больше волн нет, возможно, это победа?");
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

        // --- ФУНКЦИЯ СПАВНА (ОБЪЯВЛЕНА ОДИН РАЗ) ---
        const scheduleEnemy = (type, delay) => {
            const timerId = setTimeout(() => {
                this.enemies.push(new Enemy(type, this.scaledPath));
                
                // Проверка на Найтмер Мун
                if (type === 'NightmareMoon') {
                    this.triggerNightmareEffect();
                }
                // Проверка на Кризалис
                if (type === 'Crizalis') {
                    this.triggerChrysalisEffect();
                }
                if (type === 'KingSombra') {
                    this.spawnSombraCrystals(); // Спавним кристаллы
                    //this.ui.showStoryScreen("СОМБРА!", "Уничтожьте его Темные Кристаллы, чтобы нанести урон!", () => this.startGame());
                }

                enemiesSpawnedCount++;
                if (enemiesSpawnedCount === totalEnemiesInWave) {
                    this.allEnemiesScheduled = true;
                }
            }, delay);
            
            this.spawnTimeouts.push(timerId);
        };
        // -------------------------------------------
        
        const sirenGroups = enemyGroups.filter(g => g.type.includes("Siren"));
        const normalGroups = enemyGroups.filter(g => !g.type.includes("Siren"));

        let maxNormalSpawnTime = 0;
        normalGroups.forEach(group => {
            const groupSpawnDuration = group.count > 0 ? (group.count - 1) * group.interval : 0;
            maxNormalSpawnTime = Math.max(maxNormalSpawnTime, groupSpawnDuration);
            for (let i = 0; i < group.count; i++) {
                scheduleEnemy(group.type, i * group.interval);
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
        
        // --- Логика продажи ---
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

        // 2. Установка патруля (для Радуги)
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
        
        // --- Логика строительства ---
        if (this.isBuilding) {
            const towerType = this.selectedTowerType;
            const config = TOWER_CONFIG[towerType];

            // 1. ЕСЛИ ЭТО СПОСОБНОСТЬ (ЛУНА)
            if (config.isAbility) {
                if (this.money >= config.price) {
                    this.money -= config.price;
                    this.effects.push(new LunaEffect(mouseX, mouseY, this, config));
                    this.cancelModes(); 
                } else {
                    console.log("Не хватает денег!");
                }
                return;
            }

            // 2. ЕСЛИ ЭТО ОБЫЧНАЯ БАШНЯ
            const nearestSlot = this.findNearestFreeSlot(mouseX, mouseY);
            
            if (nearestSlot) {
                const slotIndex = this.scaledBuildSlots.indexOf(nearestSlot);
                const price = config.price;
                
                if (this.money >= price) {
                    this.money -= price;
                    const newTower = new Tower(nearestSlot.x, nearestSlot.y, towerType, this, slotIndex);
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
                    console.log("Недостаточно денег!");
                    this.cancelModes();
                }
            } else {
                this.cancelModes();
            }
        }
    }

    finalizeTransformation(tower) {
        if (!this.scaledPath) return; 

        // 1. Создаем врага
        const spawnInfo = this.getSpawnPointOnPath(tower.x, tower.y);
        const changeling = new Enemy('PereWalk', this.scaledPath);
        
        changeling.x = spawnInfo.point.x;
        changeling.y = spawnInfo.point.y;
        changeling.pathIndex = spawnInfo.pathIndex;

        this.enemies.push(changeling);

        // 2. ОСВОБОЖДАЕМ СЛОТ (УСИЛЕННАЯ ЛОГИКА)
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

    // --- УПРАВЛЕНИЕ РЕЖИМАМИ UI ---
    
    selectTower(type) {
        if (this.money < TOWER_CONFIG[type].price) {
            this.ui.updateTowerInfoPanel(null); // Скрываем, если не хватает денег
            return;
        }
        if (this.isBuilding && this.selectedTowerType === type) {
            this.cancelModes();
        } else { // Если выбрали новую
            this.isBuilding = true;
            this.isSelling = false;
            this.selectedTowerType = type;
            this.ui.updateTowerInfoPanel(type); // Показываем панель
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
    
    // --- ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ---
    
    setupScaling() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.scale = Math.min(this.canvas.width / this.originalWidth, this.canvas.height / this.originalHeight);
        this.offsetX = (this.canvas.width - this.originalWidth * this.scale) / 2;
        this.offsetY = (this.canvas.height - this.originalHeight * this.scale) / 2;
    }

    recalculatePositions() {
        // 1. Обновляем размер клеточки
        this.SCALED_BUILD_SLOT_SIZE = BUILD_SLOT_SIZE * this.scale;

        // 2. Пересчитываем путь врагов (на основе ТЕКУЩЕГО ВЫБРАННОГО ПУТИ)
        this.scaledPath = this.currentRawPath.map(p => this.scaleCoords(p));

        // 3. Пересчитываем координаты слотов (на основе ТЕКУЩИХ ВЫБРАННЫХ СЛОТОВ)
        // ВАЖНО: Мы пересоздаем массив scaledBuildSlots на основе currentRawSlots
        if (this.currentRawSlots) {
             this.scaledBuildSlots = this.currentRawSlots.map((originalSlot, index) => {
                const newCoords = this.scaleCoords(originalSlot);
                
                // Сохраняем статус occupied, если он был (хотя при смене уровня все сбрасывается)
                // Но при ресайзе окна это важно
                let wasOccupied = false;
                if (this.scaledBuildSlots && this.scaledBuildSlots[index]) {
                    wasOccupied = this.scaledBuildSlots[index].occupied;
                }

                return {
                    x: newCoords.x,
                    y: newCoords.y,
                    occupied: wasOccupied // Переносим статус
                };
             });
        }
        
        // --- 4. ГЛАВНОЕ: ДВИГАЕМ УЖЕ ПОСТРОЕННЫЕ БАШНИ ---
        this.towers.forEach(tower => {
            // Если у башни сохранен индекс слота (где она стоит)
            if (tower.slotIndex !== undefined && this.scaledBuildSlots[tower.slotIndex]) {
                const newPos = this.scaledBuildSlots[tower.slotIndex];
                
                // Телепортируем башню на новые координаты этого слота
                tower.x = newPos.x;
                tower.y = newPos.y;

                // Если это Радуга Дэш, обновляем её точку старта
                if (tower.isPatrolTower) {
                    tower.patrolStart = { x: newPos.x, y: newPos.y };
                    
                    // Если она сейчас не летит, двигаем и текущую позицию
                    if (!tower.patrolEnd) {
                        tower.patrolCurrentPos = { x: newPos.x, y: newPos.y };
                    }
                }
            }

            // Если это Радуга Дэш и у неё есть точка финиша (второй слот)
            if (tower.isPatrolTower && tower.patrolEndSlotIndex !== undefined) {
                const endSlot = this.scaledBuildSlots[tower.patrolEndSlotIndex];
                if (endSlot) {
                    // Обновляем точку финиша
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
        
        // Эта формула учитывает растяжение канваса и границы
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        return { 
            x: (event.clientX - rect.left) * scaleX, 
            y: (event.clientY - rect.top) * scaleY 
        };
    }

    findNearestFreeSlot(mouseX, mouseY) {
        let nearestSlot = null;
        let minDistance = Infinity;
        for (const slot of this.scaledBuildSlots) {
            if (!slot.occupied) {
                const distance = Math.sqrt(Math.pow(slot.x - mouseX, 2) + Math.pow(slot.y - mouseY, 2));
                if (distance < this.SCALED_BUILD_SLOT_SIZE / 2 && distance < minDistance) {
                    minDistance = distance;
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
            if (img && img.complete) {
                const size = 448 * this.scale; 
                this.ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
            }
            const radius = config.aoeRadius * this.scale;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke(); 
            return;
        }
        const nearestSlot = this.findNearestFreeSlot(this.mouse.x, this.mouse.y);
        if (nearestSlot) {
            const config = TOWER_CONFIG[this.selectedTowerType];
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