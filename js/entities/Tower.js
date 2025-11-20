import { TOWER_CONFIG, towerImages } from '../config.js';
import Projectile from './Projectile.js';

export default class Tower {
    constructor(x, y, type, game) {
        this.game = game;
        const config = TOWER_CONFIG[type];
        this.x = x; this.y = y; this.type = type; this.name = config.name;
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
        // Эта функция уже работает правильно, оставляем без изменений
        if (this.type === 'Флаттершай') {
            let priorityTarget = null, fallbackTarget = null;
            let minPriorityDist = Infinity, minFallbackDist = Infinity;
            for (const enemy of enemies) {
                if (enemy.currentHealth > 0 && !enemy.isFinished) {
                    const distance = Math.sqrt(Math.pow(enemy.x - this.x, 2) + Math.pow(enemy.y - this.y, 2));
                    if (distance <= this.range) {
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
                    if (distance <= this.range && distance < minDistance) {
                        minDistance = distance; nearestEnemy = enemy;
                    }
                }
            }
            this.target = nearestEnemy;
        }
    }

    update(enemies, projectiles) {
        // --- ЛОГИКА ДЛЯ РАДУГИ ДЭШ ---
        if (this.isPatrolTower) {
            if (!this.patrolEnd) return;
            let targetPoint = this.patrolDirection === 1 ? this.patrolEnd : this.patrolStart;
            const dx = targetPoint.x - this.patrolCurrentPos.x;
            const dy = targetPoint.y - this.patrolCurrentPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < this.patrolSpeed) { this.patrolDirection *= -1; } 
            else {
                this.patrolCurrentPos.x += (dx / distance) * this.patrolSpeed;
                this.patrolCurrentPos.y += (dy / distance) * this.patrolSpeed;
            }
            const config = TOWER_CONFIG[this.type];
            this.attackFrame = (this.attackFrame + config.frameSpeed) % config.frameCount;
            this.facingDirection = dx > 0 ? 1 : -1;
            enemies.forEach(enemy => {
                const enemyDist = Math.sqrt(Math.pow(enemy.x - this.patrolCurrentPos.x, 2) + Math.pow(enemy.y - this.patrolCurrentPos.y, 2));
                if (enemyDist < this.auraRadius) { enemy.currentHealth -= this.auraDamage; }
            });
            return;
        }

        // --- ЛОГИКА ДЛЯ РЭРИТИ ---
        if (this.isSniper) {
            const config = TOWER_CONFIG[this.type];
            if (this.isUlting) {
                this.ultFrame += config.ultFrameSpeed;
                if (this.ultFrame >= config.ultFrameCount) { this.isUlting = false; this.ultFrame = 0; }
                return; // Во время ульты ничего другого не делаем
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
                console.log("РЭРИТИ: ЭТО ПРОСТО УЖАСНО! *Истерика*");
                const ultRadius = config.ultRadius * this.game.scale;
                enemies.forEach(enemy => {
                    if (Math.sqrt(Math.pow(enemy.x - this.x, 2) + Math.pow(enemy.y - this.y, 2)) < ultRadius) {
                        enemy.stunDuration = Math.max(enemy.stunDuration, config.ultStunDuration);
                    }
                });
                return;
            }
        }
        
        // --- ОБЩАЯ ЛОГИКА ДЛЯ ВСЕХ СТАТИЧНЫХ БАШЕН ---
        if (this.target) {
            const distance = Math.sqrt(Math.pow(this.target.x - this.x, 2) + Math.pow(this.target.y - this.y, 2));
            if (this.target.currentHealth <= 0 || this.target.isFinished || distance > this.range) {
                this.target = null;
            }
        }
        if (this.type === 'Флаттершай') this.findTarget(enemies);
        else if (!this.target) this.findTarget(enemies);
        this.facingDirection = this.target ? ((this.target.x > this.x) ? 1 : -1) : -1;
        this.isAttacking = !!this.target;

        if (this.isMelee && this.target) {
            if (this.damageCooldown > 0) this.damageCooldown--;
            if (this.damageCooldown <= 0) {
                this.target.currentHealth -= this.damage;
                const config = TOWER_CONFIG[this.type];
                if (config.applySlow) { this.target.slowDuration = config.slowDuration; }
                this.damageCooldown = this.damageTickRate;
            }
        } else if (this.target) { // Для стреляющих башен (Рэрити)
            if (this.cooldown > 0) this.cooldown--;
            if (this.cooldown <= 0) {
                this.shoot(projectiles);
                this.cooldown = this.fireRate;
            }
        }
        
        if (this.isAttacking) {
            const config = TOWER_CONFIG[this.type];
            const frameSpeed = config.attackFrameSpeed || config.frameSpeed;
            const frameCount = config.attackFrameCount || config.frameCount;
            if (frameSpeed && frameCount) { this.attackFrame = (this.attackFrame + frameSpeed) % frameCount; }
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
    const scale = this.game.scale;

    // --- 1. СПЕЦИАЛЬНАЯ ОТРИСОВКА ДЛЯ РАДУГИ ДЭШ ---
    if (this.isPatrolTower) {
        // Рисуем пилоны и линию
        ctx.fillStyle = 'rgba(34, 211, 238, 0.5)';
        ctx.beginPath(); ctx.arc(this.patrolStart.x, this.patrolStart.y, 10, 0, Math.PI * 2); ctx.fill();
        if (this.patrolEnd) {
            ctx.beginPath(); ctx.arc(this.patrolEnd.x, this.patrolEnd.y, 10, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)'; ctx.lineWidth = 3; ctx.beginPath();
            ctx.moveTo(this.patrolStart.x, this.patrolStart.y); ctx.lineTo(this.patrolEnd.x, this.patrolEnd.y); ctx.stroke();
        }
        
        // Рисуем саму Радугу
        let currentImage = !this.patrolEnd ? towerImages[this.type] : towerImages[this.type + ' Атака'];
        if (currentImage && currentImage.complete) {
            ctx.save();
            ctx.translate(this.patrolCurrentPos.x, this.patrolCurrentPos.y - 10);
            if (this.facingDirection === -1) ctx.scale(-1, 1);
            
            if (!this.patrolEnd) { // Стоящая Радуга
                ctx.drawImage(currentImage, -this.width / 2, -this.height / 2, this.width, this.height);
            } else { // Летящая Радуга
                const frameX = Math.floor(this.attackFrame) * cfg.frameWidth;
                ctx.drawImage(currentImage, frameX, 0, cfg.frameWidth, currentImage.height, -this.width / 2, -this.height / 2, this.width, this.height);
            }
            ctx.restore();
        }
        return; // Завершаем, так как для Радуги всё нарисовано.
    }

    // --- 2. ОБЩАЯ ОТРИСОВКА ДЛЯ ВСЕХ ОСТАЛЬНЫХ (СТАТИЧНЫХ) БАШЕН ---
    const barWidth = 50 * this.game.scale, barHeight = 5 * this.game.scale;

    // Сначала рисуем саму пони...
    if (!(this.isSniper && this.isUlting)) { // ...но только если это НЕ Рэрити в ульте
        let currentImage = this.isAttacking ? (towerImages[this.type + ' Атака'] || towerImages[this.type]) : towerImages[this.type];
        
        if (currentImage && currentImage.complete) {
            ctx.save();
            ctx.translate(this.x, this.y + offsetY);
            if (this.facingDirection === -1) ctx.scale(-1, 1);

            if (this.isAttacking) {
                const frameWidth = cfg.attackFrameWidth || cfg.frameWidth;
                const frameX = Math.floor(this.attackFrame) * frameWidth;
                ctx.drawImage(currentImage, frameX, 0, frameWidth, currentImage.height, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
            } else {
                ctx.drawImage(currentImage, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
            }
            ctx.restore();
        }
    }
    
    // ...а затем рисуем UI-элементы поверх
    if (this.isSniper) {
        // Шкала драмы
        const barWidth = 50 * this.game.scale, barHeight = 5 * this.game.scale; 
        const barX = this.x - barWidth / 2, barY = this.y - 45 * this.game.scale;
        ctx.fillStyle = '#333'; ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = '#f0f'; ctx.fillRect(barX, barY, barWidth * (this.dramaMeter / this.dramaMeterMax), barHeight);
        
        // Анимация ульты (если активна)
        if (this.isUlting) {
            const ultImg = towerImages[this.type + ' Ульта'];
            if (ultImg && ultImg.complete) {
                const frameX = Math.floor(this.ultFrame) * cfg.ultFrameWidth;
                ctx.drawImage(ultImg, frameX, 0, cfg.ultFrameWidth, ultImg.height, this.x - cfg.ultFrameWidth / 2, this.y - ultImg.height / 2 + offsetY, cfg.ultFrameWidth, ultImg.height);
            }
        }
    }

    // Рисуем радиус при строительстве
    if (this.game.isBuilding && this.game.selectedTowerType === this.type) { 
        ctx.beginPath(); ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,0,0.05)'; ctx.fill();
     }
}
}