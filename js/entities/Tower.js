import { TOWER_CONFIG, towerImages, playSound } from '../config.js'; // Добавили playSound
import Projectile from './Projectile.js';

export default class Tower {
    constructor(x, y, type, game, slotIndex) {
        this.game = game;
        const config = TOWER_CONFIG[type];
        
        this.slotIndex = slotIndex;
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

        this.lastSoundTime = 0;
        
        this.isAsleep = false; 

        this.isSupport = config.isSupport || false;
        
        // Для баффов (если эту башню баффнули)
        this.buffTimer = 0;
        this.baseDamage = config.damage;
        this.baseRange = config.range * this.game.scale;
        this.baseFireRate = config.fireRate || 0;
        
        // Флаг, что это башня (для снаряда)
        this.isTower = true;

        // Для трансформации
        this.isTransforming = false;
        this.transformFrame = 0;
        this.transformMaxFrames = 15;
        this.transformSpeed = 0.17;
        
        this.isMelee = config.isMelee || false;
        this.damageTickRate = config.damageTickRate || 0;
        this.damageCooldown = 0;

        // Для Рэрити: флаг визуальной атаки (чтобы анимация не крутилась вечно)
        this.isShootingVisual = false;

        this.isPatrolTower = config.isPatrolTower || false;
        if (this.isPatrolTower) {
            this.patrolStart = { x: x, y: y };
            this.patrolEnd = null;
            this.patrolCurrentPos = { x: x, y: y };
            this.patrolSpeed = config.patrolSpeed;
            this.auraDamage = config.auraDamage;
            this.auraRadius = config.auraRadius * this.game.scale;
            this.patrolDirection = 1;
            // Таймер звука для Радуги (чтобы крылья не шумели каждый кадр)
            this.soundTimer = 0;
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
    }

    findTarget(enemies) {
        // ... (твой код findTarget без изменений) ...
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

        // 1. БАФФЫ (СВЕЧЕНИЕ)
        if (this.buffTimer > 0) {
            this.buffTimer--;
            if (this.buffTimer % 10 < 5) this.color = 'gold'; else this.color = TOWER_CONFIG[this.type].color || 'white';
            if (this.buffTimer <= 0) {
                this.damage = this.baseDamage;
            }
        }

        // 2. ТРАНСФОРМАЦИЯ (Кризалис эффект)
        if (this.isTransforming) {
            this.transformFrame += this.transformSpeed;
            if (this.transformFrame >= this.transformMaxFrames) {
                this.game.finalizeTransformation(this);
            }
            return; 
        }

        const config = TOWER_CONFIG[this.type];

        // 3. РАДУГА ДЭШ (ПАТРУЛЬ)
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
            // Радуга машет крыльями всегда, пока летит
            this.attackFrame = (this.attackFrame + config.frameSpeed) % config.frameCount;
            this.facingDirection = dx > 0 ? 1 : -1;

            this.soundTimer++;
            if(this.soundTimer > 30) {
                 playSound(this.type);
                 this.soundTimer = 0;
            }

            enemies.forEach(enemy => {
                const enemyDist = Math.sqrt(Math.pow(enemy.x - this.patrolCurrentPos.x, 2) + Math.pow(enemy.y - this.patrolCurrentPos.y, 2));
                if (enemyDist < this.auraRadius) { 
                    enemy.currentHealth -= this.auraDamage; 
                }
            });
            // Для Радуги isAttacking не используется для логики анимации в draw, так как у нее отдельный блок
            return;
        }

        // 4. ДЁРПИ (ПОДДЕРЖКА) - ✅ ИСПРАВЛЕННАЯ ЛОГИКА
        if (this.isSupport) {
            // Если идет анимация броска - проигрываем её
            if (this.isAttacking) {
                this.attackFrame += 0.3; // Скорость анимации
                // Если анимация закончилась (12 кадров)
                if (this.attackFrame >= 12) {
                    this.isAttacking = false; // Перестаем атаковать
                    this.attackFrame = 0; // Сброс на стойку
                }
                return; // Пока идет анимация, новую атаку не начинаем
            }

            // Если не атакуем, тикает кулдаун
            if (this.cooldown > 0) {
                this.cooldown--;
                this.attackFrame = 0; // Стоим смирно
            } else {
                // Кулдаун прошел, ищем цель
                const isMiss = Math.random() < config.missChance;
                let target = null;

                if (isMiss) {
                    // Ищем врага
                    const possibleEnemies = enemies.filter(e => !e.isFinished && e.currentHealth > 0 && Math.sqrt(Math.pow(e.x - this.x, 2) + Math.pow(e.y - this.y, 2)) < this.range);
                    if (possibleEnemies.length > 0) {
                        target = possibleEnemies[Math.floor(Math.random() * possibleEnemies.length)];
                    }
                } else {
                    // Ищем башню
                    const allies = this.game.towers.filter(t => t !== this && t.buffTimer <= 0 && !t.isSupport && Math.sqrt(Math.pow(t.x - this.x, 2) + Math.pow(t.y - this.y, 2)) < this.range);
                    if (allies.length > 0) {
                        target = allies[Math.floor(Math.random() * allies.length)];
                    }
                }

                // БРОСОК!
                if (target) {
                    this.isAttacking = true; // Включаем флаг анимации
                    this.attackFrame = 0;    // Начинаем с 0 кадра
                    
                    const muffinConfig = { ...config, projectileType: 'muffin' };
                    projectiles.push(new Projectile(this.x, this.y, target, muffinConfig, this.game));
                    
                    playSound(this.type);
                    this.cooldown = config.fireRate; 
                }
            }
            return; // Выход для Дёрпи
        }

        // 5. РЭРИТИ (СНАЙПЕР)
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
                playSound(this.type);
                return;
            }
        }
        
        // 6. ПИНКИ ПАЙ (АОЕ)
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
                this.isAttacking = true; // Пинки атакует, пока есть враги
                if (this.damageCooldown > 0) this.damageCooldown--;
                if (this.damageCooldown <= 0) {
                    enemies.forEach(enemy => {
                        if (Math.sqrt(Math.pow(enemy.x - this.x, 2) + Math.pow(enemy.y - this.y, 2)) < this.range) {
                            enemy.currentHealth -= this.damage;
                        }
                    });
                    playSound(this.type);
                    this.damageCooldown = this.damageTickRate;
                }
            } else {
                this.isAttacking = false;
                this.attackFrame = 0;
            }
        }

        // 7. ОСТАЛЬНЫЕ БАШНИ (ЭППЛ, ТВАЙЛАЙТ, ФЛАТТЕРШАЙ)
        if (this.type !== 'Пинки Пай' && !this.isSupport) {
            // Проверка цели
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
            
            // Флаги анимации
            if (this.isMelee) {
                 this.isAttacking = !!this.target; // Ближний бой атакует, если есть цель
            } else {
                 this.isAttacking = this.isShootingVisual; // Дальний бой (Рэрити) - если идет выстрел
            }

            // Атака Ближний бой
            if (this.isMelee && this.target) {
                if (this.damageCooldown > 0) this.damageCooldown--;
                if (this.damageCooldown <= 0) {
                    if (config.applySlow) {
                        this.target.slowDuration = config.slowDuration;
                    } else {
                        this.target.currentHealth -= this.damage;
                    }
                    playSound(this.type);
                    this.damageCooldown = this.damageTickRate;
                }
            } 
            // Атака Дальний бой (Рэрити)
            else if (this.target) {
                if (this.cooldown > 0) this.cooldown--;
                if (this.cooldown <= 0) {
                    this.shoot(projectiles);
                    this.cooldown = this.fireRate;
                }
            }
        }
        
        // --- ОБЩАЯ ЛОГИКА АНИМАЦИИ ---
        // 1. Снайпер (Рэрити) / Дёрпи (уже обработана выше, но для страховки)
        if ((!this.isMelee && !this.isPatrolTower && this.isShootingVisual)) {
            const frameSpeed = config.attackFrameSpeed || config.frameSpeed;
            const frameCount = config.attackFrameCount || config.frameCount;
            this.attackFrame += frameSpeed;
            
            if (this.attackFrame >= frameCount) {
                this.attackFrame = 0;
                this.isShootingVisual = false;
            }
        }
        // 2. Ближний бой (Пинки, Эппл)
        else if ((this.isMelee) && this.isAttacking) {
            const frameSpeed = config.attackFrameSpeed || config.frameSpeed;
            const frameCount = config.attackFrameCount || config.frameCount;
            this.attackFrame = (this.attackFrame + frameSpeed) % frameCount; 
        } 
        // 3. Сброс, если не Дёрпи и не патруль
        else if (!this.isSupport && !this.isPatrolTower && !this.isShootingVisual && !this.isAttacking) {
            this.attackFrame = 0;
        }
    }

    shoot(projectiles) {
        const config = TOWER_CONFIG[this.type];
        if (this.target) { 
            // ✅ ИЗМЕНЕНИЕ: Передаем this.game
            projectiles.push(new Projectile(this.x, this.y, this.target, config, this.game));
            playSound(this.type); 
            
            this.isShootingVisual = true;
            this.attackFrame = 0;
        }
    }

    draw(ctx) {
        // ... (Твой код метода draw остается БЕЗ ИЗМЕНЕНИЙ, он хороший) ...
        // Скопируй сюда полностью метод draw из прошлого рабочего файла!
        // Я приведу его здесь сокращенно, чтобы не загромождать, но тебе нужен ПОЛНЫЙ код draw.
        
        const cfg = TOWER_CONFIG[this.type];
        const scale = this.game.scale; 
        const drawWidth = 75 * scale;
        const drawHeight = 65 * scale;
        const offsetY = -5 * scale; 
        
        let currentImage;

        if (this.isTransforming) {
            currentImage = towerImages[this.type + ' Превращение'];
            if (currentImage && currentImage.complete) {
                ctx.save();
                const tX = (this.isPatrolTower && this.patrolEnd) ? this.patrolCurrentPos.x : this.x;
                const tY = (this.isPatrolTower && this.patrolEnd) ? this.patrolCurrentPos.y : this.y;
                const shiftY = 85 * scale; 
                ctx.translate(tX, tY + offsetY - shiftY);
                if (this.facingDirection === -1) ctx.scale(-1, 1);
                const spriteOriginalW = 162; const spriteOriginalH = 258;
                const renderW = 110 * scale; const renderH = (renderW / spriteOriginalW) * spriteOriginalH;
                const frameW = currentImage.width / this.transformMaxFrames; 
                const frameX = Math.floor(this.transformFrame) * frameW;
                ctx.drawImage(currentImage, frameX, 0, frameW, currentImage.height, -renderW / 2, -renderH / 2 + (renderH * 0.2), renderW, renderH);
                ctx.restore();
            }
            return; 
        }

        // Выбор картинки
        if (this.isAsleep) {
            currentImage = towerImages[this.type + ' Сон'] || towerImages[this.type];
        } else if (this.isSniper && this.isUlting) {
            currentImage = towerImages[this.type + ' Ульта'];
        } else if (this.isPatrolTower && this.patrolEnd) {
            currentImage = towerImages[this.type + ' Атака'];
        } 
        // ВОТ ТУТ ВАЖНО: Используем isShootingVisual для стрелков, isAttacking для милишников
        else if (this.isAttacking || (this.isSniper && this.isShootingVisual)) {
            currentImage = towerImages[this.type + ' Атака'] || towerImages[this.type];
        } else {
            currentImage = towerImages[this.type];
        }

        // Отрисовка (стандартная)
        if (!currentImage || !currentImage.complete || currentImage.naturalWidth === 0) {
             ctx.save(); ctx.translate(this.x, this.y); ctx.fillStyle = 'purple'; ctx.beginPath(); ctx.arc(0, 0, 10 * scale, 0, Math.PI*2); ctx.fill(); ctx.restore();
        } else {
            if (this.isPatrolTower) {
                // ... (код Радуги) ...
                // Рисуем пилоны и линию (всегда)
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

            } else {
                ctx.save();
                ctx.translate(this.x, this.y + offsetY);
                if (this.facingDirection === -1) ctx.scale(-1, 1);

                if (this.isSniper && this.isUlting && !this.isAsleep) {
                    const frameX = Math.floor(this.ultFrame) * cfg.ultFrameWidth;
                    const renderW = cfg.ultFrameWidth * scale; const renderH = currentImage.height * scale;
                    ctx.drawImage(currentImage, frameX, 0, cfg.ultFrameWidth, currentImage.height, -renderW/2, -renderH/2, renderW, renderH);
                }
                // АНИМАЦИЯ: Рисуем кадры, если isAttacking (мили) или isShootingVisual (снайпер)
                else if ((this.isAttacking || this.isShootingVisual) && !this.isAsleep) {
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
                const barW = 50 * scale, barH = 5 * scale; const barX = this.x - barW / 2, barY = this.y - 45 * scale;
                ctx.fillStyle = '#333'; ctx.fillRect(barX, barY, barW, barH);
                ctx.fillStyle = '#f0f'; ctx.fillRect(barX, barY, barW * (this.dramaMeter / this.dramaMeterMax), barH);
            }
        }

        if (this.game.isBuilding && this.game.selectedTowerType === this.type) { 
            ctx.beginPath(); ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,0,0.05)'; ctx.fill();
        }
        if (this.isAsleep) {
            const zX = this.isPatrolTower ? this.patrolCurrentPos.x : this.x;
            const zY = this.isPatrolTower ? this.patrolCurrentPos.y : this.y;
            ctx.fillStyle = 'white'; ctx.font = `bold ${20 * scale}px sans-serif`; ctx.strokeStyle = 'black'; ctx.lineWidth = 3 * scale;
            ctx.strokeText("Zzz...", zX - 15 * scale, zY - 40 * scale); ctx.fillText("Zzz...", zX - 15 * scale, zY - 40 * scale);
        }
    }
}