import { TOWER_CONFIG, towerImages } from '../config.js';
import Projectile from './Projectile.js';

export default class Tower {
    // 1. ИСПРАВЛЕНО: Добавлен slotIndex в аргументы
    constructor(x, y, type, game, slotIndex) {
        this.game = game;
        const config = TOWER_CONFIG[type];
        
        this.slotIndex = slotIndex; // Теперь это работает корректно
        
        this.x = x; 
        this.y = y; 
        this.type = type; 
        this.name = config.name;
        this.range = config.range * this.game.scale;
        this.damage = config.damage;
        this.color = config.color;
        this.cooldown = 0;
        this.target = null;
        this.facingDirection = -1;
        this.width = 75;
        this.height = 65;
        this.isAttacking = false;
        this.attackFrame = 0;
        this.image = towerImages[type];
        
        // Свойство сна
        this.isAsleep = false; 

        // Свойства трансформации
        this.isTransforming = false;
        this.transformFrame = 0;
        this.transformMaxFrames = 15; // Проверьте, сколько кадров в ваших файлах (ПМ.png и т.д.)
        this.transformSpeed = 0.17;
        
        this.isMelee = config.isMelee || false;
        this.damageTickRate = config.damageTickRate || 0;
        this.damageCooldown = 0;

        this.isPatrolTower = config.isPatrolTower || false;
        if (this.isPatrolTower) {
            this.patrolStart = { x: x, y: y };
            this.patrolEnd = null;
            this.patrolCurrentPos = { x: x, y: y };
            this.patrolSpeed = config.patrolSpeed;
            this.auraDamage = config.auraDamage;
            this.auraRadius = config.auraRadius * this.game.scale;
            this.patrolDirection = 1;
        }
        
        this.isSniper = config.isSniper || false;
        if (this.isSniper) {
            this.dramaMeter = 0;
            this.dramaMeterMax = config.dramaMeterMax;
            this.dramaFillRadius = config.dramaFillRadius * this.game.scale;
            this.dramaFillRate = config.dramaFillRate;
            this.isUlting = false;
            this.ultFrame = 0;
            this.fireRate = config.fireRate;
        }

        this.isSummon = config.isSummon || false;
        if (this.isSummon) {
        this.lifeTimer = 0;
        this.lifespan = config.lifespan;
        this.attackDelay = config.attackDelay;
        this.hasAttacked = false;
    }
    }

    findTarget(enemies) {
        if (this.type === 'Флаттершай') {
            let priorityTarget = null, fallbackTarget = null;
            let minPriorityDist = Infinity, minFallbackDist = Infinity;
            for (const enemy of enemies) {
                if (enemy.currentHealth > 0 && !enemy.isFinished) {
                    const distance = Math.sqrt(Math.pow(enemy.x - this.x, 2) + Math.pow(enemy.y - this.y, 2));
                    if (distance - (enemy.hitboxRadius * this.game.scale) < this.range) {
                        if (enemy.slowDuration <= 0) {
                            if (distance < minPriorityDist) { minPriorityDist = distance; priorityTarget = enemy; }
                        }
                        if (distance < minFallbackDist) { minFallbackDist = distance; fallbackTarget = enemy; }
                    }
                }
            }
            this.target = priorityTarget || fallbackTarget;
        } else {
            let nearestEnemy = null;
            let minDistance = Infinity;
            for (const enemy of enemies) {
                if (enemy.currentHealth > 0 && !enemy.isFinished) {
                    const distance = Math.sqrt(Math.pow(enemy.x - this.x, 2) + Math.pow(enemy.y - this.y, 2));
                    if ((distance - enemy.hitboxRadius * this.game.scale) < this.range) {
                        minDistance = distance; nearestEnemy = enemy;
                    }
                }
            }
            this.target = nearestEnemy;
        }
    }

    update(enemies, projectiles) {
        if (this.isAsleep) return;
    // --- ЛОГИКА ПРИНЦЕССЫ ЛУНЫ ---
        if (this.isSummon) {
        this.lifeTimer++;

        // Момент удара
        if (this.lifeTimer === this.attackDelay && !this.hasAttacked) {
            this.hasAttacked = true;
            // Наносим урон ВСЕМ врагам
            enemies.forEach(e => {
                e.currentHealth -= this.damage;
                // Можно добавить стан
                e.stunDuration += 60; 
            });
            console.log("Луна применила Гнев Луны!");
        }

        // Время вышло - улетает
        if (this.lifeTimer >= this.lifespan) {
            this.game.removeTower(this);
        }
        return; // Больше ничего не делает
    }

        // --- ЛОГИКА ТРАНСФОРМАЦИИ ---
        if (this.isTransforming) {
            this.transformFrame += this.transformSpeed;
            
            // Если анимация закончилась
            if (this.transformFrame >= this.transformMaxFrames) {
                // Сообщаем игре: "Я всё, меняй меня на врага!"
                this.game.finalizeTransformation(this);
            }
            return; // Пока превращаемся, ничего больше не делаем
        }

        const config = TOWER_CONFIG[this.type];

        // --- ЛОГИКА РАДУГИ ДЭШ ---
        if (this.isPatrolTower) {
            if (!this.patrolEnd) return;
            let targetPoint = this.patrolDirection === 1 ? this.patrolEnd : this.patrolStart;
            const dx = targetPoint.x - this.patrolCurrentPos.x;
            const dy = targetPoint.y - this.patrolCurrentPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < this.patrolSpeed) {
                this.patrolDirection *= -1;
            } else {
                this.patrolCurrentPos.x += (dx / distance) * this.patrolSpeed;
                this.patrolCurrentPos.y += (dy / distance) * this.patrolSpeed;
            }
            this.attackFrame = (this.attackFrame + config.frameSpeed) % config.frameCount;
            this.facingDirection = dx > 0 ? 1 : -1;
            enemies.forEach(enemy => {
                const enemyDist = Math.sqrt(Math.pow(enemy.x - this.patrolCurrentPos.x, 2) + Math.pow(enemy.y - this.patrolCurrentPos.y, 2));
                if (enemyDist < this.auraRadius) { enemy.currentHealth -= this.auraDamage; }
            });
            this.isAttacking = true;
            return;
        }

        // --- ЛОГИКА РЭРИТИ ---
        if (this.isSniper) {
            if (this.isUlting) {
                this.ultFrame += config.ultFrameSpeed;
                if (this.ultFrame >= config.ultFrameCount) { this.isUlting = false; this.ultFrame = 0; }
                return;
            }
            let enemyInPersonalSpace = false;
            for (const enemy of enemies) {
                if (Math.sqrt(Math.pow(enemy.x - this.x, 2) + Math.pow(enemy.y - this.y, 2)) < this.dramaFillRadius) {
                    enemyInPersonalSpace = true; break;
                }
            }
            if (enemyInPersonalSpace && this.dramaMeter < this.dramaMeterMax) { this.dramaMeter += this.dramaFillRate; }
            if (this.dramaMeter >= this.dramaMeterMax) {
                this.isUlting = true; this.dramaMeter = 0;
                const ultRadius = config.ultRadius * this.game.scale;
                enemies.forEach(enemy => {
                    if (Math.sqrt(Math.pow(enemy.x - this.x, 2) + Math.pow(enemy.y - this.y, 2)) < ultRadius) {
                        enemy.stunDuration = Math.max(enemy.stunDuration, config.ultStunDuration);
                    }
                });
                return;
            }
        }
        
        // --- ЛОГИКА ПИНКИ ПАЙ ---
        if (this.type === 'Пинки Пай') {
            this.isAttacking = false;
            let enemiesInRange = false;
            for (const enemy of enemies) {
                if (Math.sqrt(Math.pow(enemy.x - this.x, 2) + Math.pow(enemy.y - this.y, 2)) < this.range) {
                    enemiesInRange = true;
                    break;
                }
            }
            
            if (enemiesInRange) {
                this.isAttacking = true;
                if (this.damageCooldown > 0) this.damageCooldown--;
                if (this.damageCooldown <= 0) {
                    enemies.forEach(enemy => {
                        if (Math.sqrt(Math.pow(enemy.x - this.x, 2) + Math.pow(enemy.y - this.y, 2)) < this.range) {
                            enemy.currentHealth -= this.damage;
                        }
                    });
                    this.damageCooldown = this.damageTickRate;
                }
            } else {
                this.isAttacking = false;
            }
        }

        // --- ЛОГИКА ОСТАЛЬНЫХ ---
        if (this.type !== 'Пинки Пай') {
            if (this.target) {
                const distance = Math.sqrt(Math.pow(this.target.x - this.x, 2) + Math.pow(this.target.y - this.y, 2));
                if (this.target.currentHealth <= 0 || this.target.isFinished || distance > this.range) {
                    this.target = null;
                }
            }
            if (!this.target) {
                this.findTarget(enemies);
            }
            
            this.facingDirection = this.target ? ((this.target.x > this.x) ? 1 : -1) : -1;
            this.isAttacking = !!this.target;

            if (this.isMelee && this.target) {
                if (this.damageCooldown > 0) this.damageCooldown--;
                if (this.damageCooldown <= 0) {
                    if (config.applySlow) {
                        this.target.slowDuration = config.slowDuration;
                    } else {
                        this.target.currentHealth -= this.damage;
                    }
                    this.damageCooldown = this.damageTickRate;
                }
            } 
            else if (this.target) {
                if (this.cooldown > 0) this.cooldown--;
                if (this.cooldown <= 0) {
                    this.shoot(projectiles);
                    this.cooldown = this.fireRate;
                }
            }
        }
        
        if (this.isAttacking) {
            const frameSpeed = config.attackFrameSpeed || config.frameSpeed;
            const frameCount = config.attackFrameCount || config.frameCount;
            if (frameSpeed && frameCount) { 
                this.attackFrame = (this.attackFrame + frameSpeed) % frameCount; 
            }
        } else {
            this.attackFrame = 0;
        }
    }

    shoot(projectiles) {
        const config = TOWER_CONFIG[this.type];
        if (this.target) { projectiles.push(new Projectile(this.x, this.y, this.target, config)); }
    }

    draw(ctx) {
        const cfg = TOWER_CONFIG[this.type];
        
        // 2. ИСПРАВЛЕНО: scale определен в самом начале метода
        const scale = this.game.scale; 
        
        const drawWidth = 75 * scale;
        const drawHeight = 65 * scale;
        const offsetY = -5 * scale; 
        
        let currentImage;

        // --- ОТРИСОВКА ТРАНСФОРМАЦИИ ---
        if (this.isTransforming) {
            currentImage = towerImages[this.type + ' Превращение'];
            
            if (currentImage && currentImage.complete) {
                ctx.save();
                const tX = (this.isPatrolTower && this.patrolEnd) ? this.patrolCurrentPos.x : this.x;
                const tY = (this.isPatrolTower && this.patrolEnd) ? this.patrolCurrentPos.y : this.y;
                
                // Сдвигаем точку рисования вверх для высокой анимации
                const shiftY = 85 * scale; // ТЕПЕРЬ scale ЗДЕСЬ СУЩЕСТВУЕТ
                
                ctx.translate(tX, tY + offsetY - shiftY);
                if (this.facingDirection === -1) ctx.scale(-1, 1);

                // РАСЧЕТ РАЗМЕРОВ ПОД ВАШ КАДР
                const spriteOriginalW = 162;
                const spriteOriginalH = 258;
                
                const renderW = 110 * scale; 
                const renderH = (renderW / spriteOriginalW) * spriteOriginalH;

                const frameW = currentImage.width / this.transformMaxFrames; 
                const frameX = Math.floor(this.transformFrame) * frameW;

                ctx.drawImage(currentImage, frameX, 0, frameW, currentImage.height, -renderW / 2, -renderH / 2 + (renderH * 0.2), renderW, renderH);
                ctx.restore();
            }
            return; // Выходим, чтобы не рисовать пони под огнем
        }

        // --- ВЫБОР КАРТИНКИ ДЛЯ ОБЫЧНОГО СОСТОЯНИЯ ---
        if (this.isAsleep) {
            currentImage = towerImages[this.type + ' Сон'] || towerImages[this.type];
        } else if (this.isSniper && this.isUlting) {
            currentImage = towerImages[this.type + ' Ульта'];
        } else if (this.isPatrolTower && this.patrolEnd) {
            currentImage = towerImages[this.type + ' Атака'];
        } else if (this.isAttacking) {
            currentImage = towerImages[this.type + ' Атака'] || towerImages[this.type];
        } else {
            currentImage = towerImages[this.type];
        }

        if (!currentImage || !currentImage.complete || currentImage.naturalWidth === 0) {
             // Заглушка
             ctx.save();
             const posX = this.isPatrolTower ? this.patrolCurrentPos.x : this.x;
             const posY = this.isPatrolTower ? this.patrolCurrentPos.y : this.y;
             ctx.translate(posX, posY);
             ctx.fillStyle = 'purple';
             ctx.beginPath(); ctx.arc(0, 0, 10 * scale, 0, Math.PI*2); ctx.fill();
             ctx.restore();
        } else {
            // А) Радуга Дэш
            if (this.isPatrolTower) {
                ctx.fillStyle = 'rgba(34, 211, 238, 0.5)';
                ctx.beginPath(); ctx.arc(this.patrolStart.x, this.patrolStart.y, 10 * scale, 0, Math.PI * 2); ctx.fill();
                if (this.patrolEnd) {
                    ctx.beginPath(); ctx.arc(this.patrolEnd.x, this.patrolEnd.y, 10 * scale, 0, Math.PI * 2); ctx.fill();
                    ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)'; ctx.lineWidth = 3 * scale; ctx.beginPath();
                    ctx.moveTo(this.patrolStart.x, this.patrolStart.y); ctx.lineTo(this.patrolEnd.x, this.patrolEnd.y); ctx.stroke();
                }

                ctx.save();
                ctx.translate(this.patrolCurrentPos.x, this.patrolCurrentPos.y - 10 * scale);
                if (this.facingDirection === -1) ctx.scale(-1, 1);

                if (this.patrolEnd && !this.isAsleep) {
                    const frameWidth = cfg.frameWidth; 
                    const frameX = Math.floor(this.attackFrame) * frameWidth;
                    ctx.drawImage(currentImage, frameX, 0, frameWidth, currentImage.height, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
                } else {
                    ctx.drawImage(currentImage, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
                }
                ctx.restore();
            } 
            
            // Б) Остальные пони
            else {
                ctx.save();
                ctx.translate(this.x, this.y + offsetY);
                if (this.facingDirection === -1) ctx.scale(-1, 1);

                if (this.isSniper && this.isUlting && !this.isAsleep) {
                    const frameX = Math.floor(this.ultFrame) * cfg.ultFrameWidth;
                    const renderW = cfg.ultFrameWidth * scale;
                    const renderH = currentImage.height * scale;
                    ctx.drawImage(currentImage, frameX, 0, cfg.ultFrameWidth, currentImage.height, -renderW/2, -renderH/2, renderW, renderH);
                }
                else if (this.isAttacking && !this.isAsleep) {
                    const frameWidth = cfg.attackFrameWidth || cfg.frameWidth;
                    const frameX = Math.floor(this.attackFrame) * frameWidth;
                    ctx.drawImage(currentImage, frameX, 0, frameWidth, currentImage.height, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
                } 
                else {
                    ctx.drawImage(currentImage, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
                }
                ctx.restore();
            }

            if (this.isSniper) {
                const barW = 50 * scale, barH = 5 * scale; 
                const barX = this.x - barW / 2, barY = this.y - 45 * scale;
                ctx.fillStyle = '#333'; ctx.fillRect(barX, barY, barW, barH);
                ctx.fillStyle = '#f0f'; ctx.fillRect(barX, barY, barW * (this.dramaMeter / this.dramaMeterMax), barH);
            }
        }

        // Радиус
        if (this.game.isBuilding && this.game.selectedTowerType === this.type) { 
            ctx.beginPath(); ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,0,0.05)'; ctx.fill();
        }

        // Zzz
        if (this.isAsleep) {
            const zX = this.isPatrolTower ? this.patrolCurrentPos.x : this.x;
            const zY = this.isPatrolTower ? this.patrolCurrentPos.y : this.y;

            ctx.fillStyle = 'white';
            ctx.font = `bold ${20 * scale}px sans-serif`; 
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 3 * scale;
            
            ctx.strokeText("Zzz...", zX - 15 * scale, zY - 40 * scale);
            ctx.fillText("Zzz...", zX - 15 * scale, zY - 40 * scale);
        }

    if (this.isSummon) {
        let currentImage = towerImages[this.type + ' Атака']; // Картинка атаки/появления
        
        if (currentImage && currentImage.complete) {
            ctx.save();
            
            // Эффект появления/исчезновения (прозрачность)
            let alpha = 1;
            // Появление
            if (this.lifeTimer < 20) alpha = this.lifeTimer / 20;
            // Исчезновение
            else if (this.lifeTimer > this.lifespan - 20) alpha = (this.lifespan - this.lifeTimer) / 20;
            
            ctx.globalAlpha = alpha;
            
            // Луна висит чуть выше слота
            ctx.drawImage(currentImage, this.x - drawWidth, this.y - drawHeight * 1.5, drawWidth * 2, drawHeight * 2);
            
            // Эффект удара (вспышка на весь экран или круг)
            if (this.lifeTimer >= this.attackDelay - 5 && this.lifeTimer <= this.attackDelay + 5) {
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = 'white'; // Вспышка света
                ctx.fillRect(0, 0, 3000, 3000); // На весь экран (грубо, но эффективно)
            }

            ctx.restore();
        }
        return;
    }

    }
}