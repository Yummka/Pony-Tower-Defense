// Файл: js/game.js

import UIManager from './uiManager.js';
import Enemy from './entities/Enemy.js';
import Tower from './entities/Tower.js';
import Projectile from './entities/Projectile.js'; // Убедись, что Projectile тоже вынесен в отдельный файл
import { 
    path, buildSlots, LEVELS_CONFIG, backgroundImage, nightBackground, eveningBackground,
    TOWER_CONFIG, BUILD_SLOT_SIZE, SELL_REFUND_PERCENTAGE, 
    PAUSE_BETWEEN_GROUPS_MS, ENEMY_TYPES,
    originalWidth, originalHeight,
    backgroundMusic, nightMusic, eveningMusic, LEVEL_START_MONEY,
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
        
        this.isRunning = false;
        this.isBuilding = false;
        this.isSelling = false;
        this.isPlacingPatrolPoint = false;
        this.patrolTowerRef = null;
        this.selectedTowerType = null;
        this.waveInProgress = false;
        this.allEnemiesScheduled = false;

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
                
        // Применяем масштабирование к координатам из конфига
        this.scaledPath = path.map(p => this.scaleCoords(p));
        this.scaledBuildSlots = buildSlots.map(slot => {
            const scaled = this.scaleCoords(slot);
            return { ...slot, x: scaled.x, y: scaled.y, occupied: false }; // Сбрасываем occupied
        });
        this.SCALED_BUILD_SLOT_SIZE = BUILD_SLOT_SIZE * this.scale;

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

    update() {
        if (!this.isRunning) return; // Если игра на паузе (в меню), ничего не обновляем

        // 1. Обновляем все башни
        this.towers.forEach(tower => tower.update(this.enemies, this.projectiles));

        // 2. Обновляем все снаряды и обрабатываем попадания
        this.projectiles = this.projectiles.filter(projectile => {
            const result = projectile.update();
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
        this.enemies.forEach(enemy => enemy.update());

        // 4. Удаляем "мертвых" и "сбежавших" врагов
        this.enemies = this.enemies.filter(enemy => {
            if (enemy.isFinished) {
                const isBoss = enemy.type === 'Trixie' || enemy.type.includes('Siren') || enemy.type === 'Achel' || enemy.type === 'SfinksFky' || enemy.type === 'NightmareMoon';
                this.lives -= isBoss ? 5 : 1;
                if (this.lives <= 0) {
                    this.lives = 0;
                    this.loseGame();
                }
                return false; // Удаляем врага
            }
            if (enemy.currentHealth <= 0) {
                this.money += enemy.bounty;
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
        // 1. Очищаем холст и рисуем фон
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#1a321a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.isBackgroundLoaded) {
            this.ctx.drawImage(backgroundImage, this.offsetX, this.offsetY, this.originalWidth * this.scale, this.originalHeight * this.scale);
        }

        // 1. Очищаем холст
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // --- ЛОГИКА ЦВЕТА ФОНА ---
        // Если уровень 3 (Вечер), 4 или 5 (Ночь) — делаем фон темным
        if (this.currentLevel >= 3 && this.currentLevel <= 5) {
            this.ctx.fillStyle = '#0d0d1a'; // Очень темный синий (почти черный) для холста
            document.body.style.backgroundColor = '#000000'; // Черные поля браузера
        } else {
            this.ctx.fillStyle = '#1a321a'; // Обычный зеленый для холста
            document.body.style.backgroundColor = '#3c3c58'; // Обычный цвет меню
        }
        
        // Заливаем холст выбранным цветом
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Рисуем картинку фона (карту)
        if (this.isBackgroundLoaded) {
            this.ctx.drawImage(backgroundImage, this.offsetX, this.offsetY, this.originalWidth * this.scale, this.originalHeight * this.scale);
        }

        // Если игра не запущена (в меню), ничего больше не рисуем
        if (!this.isRunning) return;

        // Если игра не запущена (в меню), ничего больше не рисуем
        if (!this.isRunning) return;

        if (this.isBuilding || this.isSelling) {
        const size = this.SCALED_BUILD_SLOT_SIZE;
        const halfSize = size / 2;
        
        this.scaledBuildSlots.forEach(slot => {
            if (!slot.occupied) { // Свободные слоты
                this.ctx.fillStyle = 'rgba(182, 238, 129, 0.4)'; // Яркий желтый для настройки
                this.ctx.fillRect(slot.x - halfSize, slot.y - halfSize, size, size);
                this.ctx.strokeStyle = 'rgba(187, 187, 187, 0.44)';
                this.ctx.strokeRect(slot.x - halfSize, slot.y - halfSize, size, size);
            } else if (this.isSelling) { // Занятые слоты (только в режиме продажи)
                this.ctx.fillStyle = 'rgba(214, 79, 79, 0.4)'; // Яркий красный
                this.ctx.fillRect(slot.x - halfSize, slot.y - halfSize, size, size);
                this.ctx.strokeStyle = 'rgba(192, 192, 192, 0.42)';
                this.ctx.strokeRect(slot.x - halfSize, slot.y - halfSize, size, size);
            }
        });
    }

        // 3. Рисуем все игровые объекты
        this.towers.forEach(tower => tower.draw(this.ctx));
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        this.projectiles.forEach(p => p.draw(this.ctx));
        
        // 4. Рисуем "призрачную" башню, если нужно
        this.drawGhostTower();
    }

    // --- УПРАВЛЕНИЕ СОСТОЯНИЕМ ИГРЫ ---

    // В файле js/game.js

    startLevel(levelNumber, options = {}) {
        this.currentLevel = levelNumber;
        this.resetStateForLevelStart(options);

        this.stopMusic();

        // Настройки по умолчанию (День)
        let levelBackgroundSrc = 'images/ФПСН.png'; 
        let levelMusic = backgroundMusic;
        
        // Действие по умолчанию: просто начать игру
        let startAction = () => this.startGame();

        switch (levelNumber) {
            // --- УРОВЕНЬ 2: ФЛАТТЕРШАЙ ---
            case 2:
                startAction = () => this.ui.showFluttershyIntro();
                break;

            // --- УРОВЕНЬ 3: ВЕЧЕР + РАДУГА + РЭРИТИ ---
            case 3:
                // ИСПРАВЛЕНО: Добавлена буква Н в название файла, как в конфиге
                levelBackgroundSrc = 'images/ФПСНвечер.png'; 
                levelMusic = eveningMusic; // Кстати, у вас опечатка в импорте (eveningTmusic), но если работает - ок
                
                startAction = () => this.ui.showStoryScreen(
                    "ВЕЧЕРЕЕТ...", 
                    "Солнце садится. Тени удлиняются.<br>К нам спешит подкрепление, но враги уже близко!",
                    () => this.ui.showRainbowDashIntro()
                );
                break;

            // --- УРОВЕНЬ 4: НОЧЬ ---
            case 4:
                // ИСПРАВЛЕНО: Добавлена буква Н в название файла
                levelBackgroundSrc = 'images/ФПСНночь.png';
                levelMusic = nightMusic;
                
                startAction = () => this.ui.showStoryScreen(
                    "НАСТУПИЛА НОЧЬ", 
                    "Тьма окутала Понивилль.<br>Летучие мыши и ночные кошмары выходят на охоту.<br><br>Держите оборону до рассвета!",
                    () => this.startGame()
                );
                break;

            // --- УРОВЕНЬ 6: РАССВЕТ ---
            case 6:
                // Фон по умолчанию (День), просто текст
                startAction = () => this.ui.showStoryScreen(
                    "РАССВЕТ!", 
                    "Лучи солнца пробиваются сквозь тучи.<br>Мы пережили эту ночь!<br><br>Но враги не сдаются. В бой!",
                    () => this.startGame()
                );
                break;

            // Остальные уровни (1, 5, 7-10)
            default:
                // Используются настройки по умолчанию, в 5 уровне фон ночной
                if (levelNumber === 5) {
                    levelBackgroundSrc = 'images/ФПСночь.png';
                    levelMusic = nightMusic;
                }
                break;
        }

        // Применяем настройки фона
        // Важно: проверяем именно src, чтобы не перезагружать картинку лишний раз
        if (!backgroundImage.src.includes(levelBackgroundSrc)) {
            backgroundImage.src = levelBackgroundSrc;
        }
        
        this.activeMusic = levelMusic;

        // Запускаем логику уровня
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
        [backgroundMusic, nightMusic, eveningMusic].forEach(track => {
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

    resetStateForLevelStart(options = {}) {

        this.clearAllTimeouts(); 

        this.isRunning = false;
        this.enemies = [];
        this.towers = [];
        this.projectiles = [];
        this.scaledBuildSlots.forEach(slot => slot.occupied = false);

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

    // В файле js/game.js

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

        // --- ВОТ ПРАВИЛЬНОЕ МЕСТО ДЛЯ ФУНКЦИИ (ОДИН РАЗ) ---
        const scheduleEnemy = (type, delay) => {
            // Сохраняем ID таймера в переменную timerId
            const timerId = setTimeout(() => {
                this.enemies.push(new Enemy(type, this.scaledPath));
                
                if (type === 'NightmareMoon') {
                    this.triggerNightmareEffect();
                }

                enemiesSpawnedCount++;
                if (enemiesSpawnedCount === totalEnemiesInWave) {
                    this.allEnemiesScheduled = true;
                }
            }, delay);
            
            // Добавляем этот ID в наш список, чтобы потом можно было отменить
            this.spawnTimeouts.push(timerId);
        };
        // ---------------------------------------------------
        
        // Логика спавна с разделением на обычных и сирен
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
                    // Можно добавить звук ошибки или мигание, но пока просто выходим
                    return; 
                }
                const refund = Math.floor(TOWER_CONFIG[tower.type].price * SELL_REFUND_PERCENTAGE);
                this.money += refund;

                // Освобождаем слот(ы)
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

        // --- Логика установки второй точки для патруля ---
        if (this.isPlacingPatrolPoint) {
            const nearestSlot = this.findNearestFreeSlot(mouseX, mouseY);
            if (nearestSlot && this.patrolTowerRef) {
                this.patrolTowerRef.patrolEnd = { x: nearestSlot.x, y: nearestSlot.y };
                nearestSlot.occupied = true;
                this.cancelModes();
            }
            return;
        }
        
        // --- Логика строительства ---
        if (this.isBuilding) {
            const nearestSlot = this.findNearestFreeSlot(mouseX, mouseY);
            if (nearestSlot) {
                const towerType = this.selectedTowerType;
                const price = TOWER_CONFIG[towerType].price;
                if (this.money >= price) {
                    this.money -= price;
                    const newTower = new Tower(nearestSlot.x, nearestSlot.y, towerType, this); // Передаем ссылку на игру
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

    // --- УПРАВЛЕНИЕ РЕЖИМАМИ UI ---
    
    selectTower(type) {
        if (this.money < TOWER_CONFIG[type].price) {
            this.ui.updateTowerInfoPanel(null); // Скрываем, если не хватает денег
            return;
        }
        
        // Если кликнули по уже выбранной (отмена)
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
        this.ui.updateTowerInfoPanel(null); // <<< ДОБАВЬТЕ ЭТУ СТРОКУ
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

        // 2. Пересчитываем путь врагов (берем оригинальный path из конфига и масштабируем)
        this.scaledPath = path.map(p => this.scaleCoords(p));

        // 3. Пересчитываем слоты для строительства
        // Важно: мы не создаем новые слоты, а обновляем координаты старых,
        // чтобы не потерять информацию о том, занят слот или нет (occupied).
        if (this.scaledBuildSlots && this.scaledBuildSlots.length === buildSlots.length) {
            for (let i = 0; i < this.scaledBuildSlots.length; i++) {
                // Берем оригинальные координаты из конфига (buildSlots)
                const originalSlot = buildSlots[i];
                // Применяем новый масштаб
                const newCoords = this.scaleCoords(originalSlot);
                
                // Обновляем координаты существующего слота
                this.scaledBuildSlots[i].x = newCoords.x;
                this.scaledBuildSlots[i].y = newCoords.y;
            }
        }
        
 
        this.towers.forEach(tower => {
            let nearestSlot = null;
            let minDistance = Infinity;
            
            // Ищем, к какому слоту привязана башня
            for (const slot of this.scaledBuildSlots) {
                if (slot.occupied) {
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
        return { 
            x: event.clientX - rect.left, 
            y: event.clientY - rect.top 
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
    
        const nearestSlot = this.findNearestFreeSlot(this.mouse.x, this.mouse.y);
        if (nearestSlot) {
            const config = TOWER_CONFIG[this.selectedTowerType];
            const canAfford = this.money >= config.price;
            
            const x = nearestSlot.x; 
            const y = nearestSlot.y;
            const size = this.SCALED_BUILD_SLOT_SIZE;
            const halfSize = size / 2;
    
            // Радиус
            this.ctx.beginPath();
            this.ctx.arc(x, y, config.range * this.scale, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            this.ctx.strokeStyle = canAfford ? 'white' : 'red';
            this.ctx.lineWidth = 2;
            this.ctx.fill();
            this.ctx.stroke();
    
            // Слот
            this.ctx.fillStyle = canAfford ? 'rgba(170, 255, 170, 0.4)' : 'rgba(255, 170, 170, 0.4)';
            this.ctx.fillRect(x - halfSize, y - halfSize, size, size);
        }
    }
}