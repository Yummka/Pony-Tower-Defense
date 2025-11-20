// Файл: js/game.js

import UIManager from './uiManager.js';
import Enemy from './entities/Enemy.js';
import Tower from './entities/Tower.js';
import Projectile from './entities/Projectile.js'; // Убедись, что Projectile тоже вынесен в отдельный файл
import { 
    path, buildSlots, LEVELS_CONFIG, backgroundImage, 
    TOWER_CONFIG, BUILD_SLOT_SIZE, SELL_REFUND_PERCENTAGE, 
    PAUSE_BETWEEN_GROUPS_MS,
    originalWidth, originalHeight,
    backgroundMusic,
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
                const isBoss = enemy.type === 'Trixie' || enemy.type.includes('Siren') || enemy.type === 'Achel' || enemy.type === 'SfinksFky';
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

        // Если игра не запущена (в меню), ничего больше не рисуем
        if (!this.isRunning) return;

        // 2. Рисуем слоты для строительства
        this.scaledBuildSlots.forEach(slot => {
            if (!slot.occupied) {
                const size = this.SCALED_BUILD_SLOT_SIZE;
                const halfSize = size / 2;
                this.ctx.fillStyle = 'rgba(85, 141, 92, 0.15)';
                this.ctx.fillRect(slot.x - halfSize, slot.y - halfSize, size, size);
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(slot.x - halfSize, slot.y - halfSize, size, size);
            }
        });

        // 3. Рисуем все игровые объекты
        this.towers.forEach(tower => tower.draw(this.ctx));
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        this.projectiles.forEach(p => p.draw(this.ctx));
        
        // 4. Рисуем "призрачную" башню, если нужно
        this.drawGhostTower();
    }

    // --- УПРАВЛЕНИЕ СОСТОЯНИЕМ ИГРЫ ---

    startLevel(levelNumber, options = {}) {
        // Проверяем, нужно ли показывать интро
        if (levelNumber === 2 && !options.skipIntro) {
            this.currentLevel = 2; // Запоминаем уровень
            this.resetStateForLevelStart(options);
            this.ui.showFluttershyIntro();
            return;
        }
        if (levelNumber === 3 && !options.skipIntro) {
            this.currentLevel = 3;
            this.resetStateForLevelStart(options);
            this.ui.showRainbowDashIntro();
            return;
        }

        // Обычный запуск уровня
        this.currentLevel = levelNumber;
        this.resetStateForLevelStart(options);
        this.startGameAfterIntro();
    }

    startGameAfterIntro() {
        this.isRunning = true;
        this.ui.showGameScreen();
        this.ui.update();
        this.playMusic();
    }

    resetStateForLevelStart(options = {}) {
        const moneyToKeep = this.money;

        this.isRunning = false;
        this.enemies = [];
        this.towers = [];
        this.projectiles = [];
        this.scaledBuildSlots.forEach(slot => slot.occupied = false);

        this.wave = 0;
        this.lives = 10;
        this.money = 100;
        
        if (options.keepMoney) {
            this.money = moneyToKeep;
        }

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
        this.isRunning = false;
        this.ui.showMainMenu();
        this.stopMusic();
    }

    // Вставьте эти два метода в класс Game в файле js/game.js

    playMusic() {
        // Проверяем, готова ли музыка к проигрыванию
        const playPromise = backgroundMusic.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // Браузеры могут блокировать авто-проигрывание, но наш код сработает,
                // т.к. музыка включается после клика на кнопку "Уровень".
                console.log("Музыка начнётся после взаимодействия с сайтом.");
            });
        }
    }

    stopMusic() {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0; // Сбрасываем на начало
    }

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

        const scheduleEnemy = (type, delay) => {
            setTimeout(() => {
                this.enemies.push(new Enemy(type, this.scaledPath));
                enemiesSpawnedCount++;
                if (enemiesSpawnedCount === totalEnemiesInWave) {
                    this.allEnemiesScheduled = true;
                }
            }, delay);
        };
        
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
        if (this.money < TOWER_CONFIG[type].price) return;
        
        if (this.isBuilding && this.selectedTowerType === type) {
            this.cancelModes();
        } else {
            this.isBuilding = true;
            this.isSelling = false;
            this.selectedTowerType = type;
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
    }
    
    // --- ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ---
    
    setupScaling() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.scale = Math.min(this.canvas.width / this.originalWidth, this.canvas.height / this.originalHeight);
        this.offsetX = (this.canvas.width - this.originalWidth * this.scale) / 2;
        this.offsetY = (this.canvas.height - this.originalHeight * this.scale) / 2;
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