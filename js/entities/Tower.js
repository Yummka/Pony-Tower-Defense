import { TOWER_CONFIG, towerImages } from '../config.js';
import Projectile from './Projectile.js';

export default class Tower {
    constructor(x, y, type, game) {
        this.game = game;
        const config = TOWER_CONFIG[type];
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

        // --- ЛОГИКА РЭРИТИ (СНАЙПЕР) ---
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
        
        // --- ЛОГИКА ПИНКИ ПАЙ (AOE) ---
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

        // --- ЛОГИКА ОСТАЛЬНЫХ (ОДИНОЧНАЯ ЦЕЛЬ) ---
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
        const drawWidth = 75;
        const drawHeight = 65;
        const offsetY = -5;
        
        // --- 1. ВЫБОР КАРТИНКИ (ЛОГИКА) ---
        let currentImage;

        // Приоритет 1: Сон (Самый главный)
        if (this.isAsleep) {
            currentImage = towerImages[this.type + ' Сон'] || towerImages[this.type];
        } 
        // Приоритет 2: Ульта Рэрити
        else if (this.isSniper && this.isUlting) {
            currentImage = towerImages[this.type + ' Ульта'];
        } 
        // Приоритет 3: Атака / Полет
        else if (this.isPatrolTower && this.patrolEnd) {
            currentImage = towerImages[this.type + ' Атака'];
        } 
        else if (this.isAttacking) {
            currentImage = towerImages[this.type + ' Атака'] || towerImages[this.type];
        } 
        // Приоритет 4: Обычное состояние
        else {
            currentImage = towerImages[this.type];
        }

        // --- 2. ОТРИСОВКА БАШНИ ---

        // А) Ветка для Радуги Дэш (Патрульная)
        if (this.isPatrolTower) {
            ctx.fillStyle = 'rgba(34, 211, 238, 0.5)';
            ctx.beginPath(); ctx.arc(this.patrolStart.x, this.patrolStart.y, 10, 0, Math.PI * 2); ctx.fill();
            if (this.patrolEnd) {
                ctx.beginPath(); ctx.arc(this.patrolEnd.x, this.patrolEnd.y, 10, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)'; ctx.lineWidth = 3; ctx.beginPath();
                ctx.moveTo(this.patrolStart.x, this.patrolStart.y); ctx.lineTo(this.patrolEnd.x, this.patrolEnd.y); ctx.stroke();
            }

            if (currentImage && currentImage.complete) {
                ctx.save();
                ctx.translate(this.patrolCurrentPos.x, this.patrolCurrentPos.y - 10);
                if (this.facingDirection === -1) ctx.scale(-1, 1);

                if (this.patrolEnd && !this.isAsleep) {
                    const frameWidth = cfg.frameWidth; 
                    const frameX = Math.floor(this.attackFrame) * frameWidth;
                    ctx.drawImage(currentImage, frameX, 0, frameWidth, currentImage.height, -this.width / 2, -this.height / 2, this.width, this.height);
                } else {
                    ctx.drawImage(currentImage, -this.width / 2, -this.height / 2, this.width, this.height);
                }
                ctx.restore();
            }
        } 
        
        // Б) Ветка для всех остальных (Статичные башни)
        else {
            if (currentImage && currentImage.complete) {
                ctx.save();
                ctx.translate(this.x, this.y + offsetY);
                if (this.facingDirection === -1) ctx.scale(-1, 1);

                if (this.isSniper && this.isUlting && !this.isAsleep) {
                    const frameX = Math.floor(this.ultFrame) * cfg.ultFrameWidth;
                    ctx.drawImage(currentImage, frameX, 0, cfg.ultFrameWidth, currentImage.height, -cfg.ultFrameWidth/2, -currentImage.height/2, cfg.ultFrameWidth, currentImage.height);
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
                const barWidth = 50 * this.game.scale, barHeight = 5 * this.game.scale; 
                const barX = this.x - barWidth / 2, barY = this.y - 45 * this.game.scale;
                ctx.fillStyle = '#333'; ctx.fillRect(barX, barY, barWidth, barHeight);
                ctx.fillStyle = '#f0f'; ctx.fillRect(barX, barY, barWidth * (this.dramaMeter / this.dramaMeterMax), barHeight);
            }
        }

        // Рисуем радиус при строительстве
        if (this.game.isBuilding && this.game.selectedTowerType === this.type) { 
            ctx.beginPath(); ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,0,0.05)'; ctx.fill();
        }

        // Рисуем "Zzz...", если спит
        if (this.isAsleep) {
            const zX = this.isPatrolTower ? this.patrolCurrentPos.x : this.x;
            const zY = this.isPatrolTower ? this.patrolCurrentPos.y : this.y;

            ctx.fillStyle = 'white';
            ctx.font = 'bold 20px sans-serif'; 
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 3;
            
            ctx.strokeText("Zzz...", zX - 15, zY - 40);
            ctx.fillText("Zzz...", zX - 15, zY - 40);
        }
    }
}