import { TOWER_CONFIG, towerImages, playSound } from '../config.js';
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

        // Базовые значения (для возврата после баффов Дёрпи)
        this.baseDamage = config.damage;
        this.baseDamageTickRate = config.damageTickRate || 0;
        this.baseFireRate = config.fireRate || 0;
        this.baseRange = config.range * this.game.scale;
        this.buffTimer = 0;
        
        this.isTower = true;

        // Трансформация (Кризалис)
        this.isTransforming = false;
        this.transformFrame = 0;
        this.transformMaxFrames = 15;
        this.transformSpeed = 0.17;
        
        this.isMelee = config.isMelee || false;
        this.damageTickRate = config.damageTickRate || 0;
        this.damageCooldown = 0;

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
        if (this.type === 'Флаттершай') {
            let priorityTarget = null, fallbackTarget = null;
            let minPriorityDist = Infinity, minFallbackDist = Infinity;
            for (const enemy of enemies) {
                if (enemy.currentHealth > 0 && !enemy.isFinished) {
                    const distance = Math.hypot(enemy.x - this.x, enemy.y - this.y);
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
                    const distance = Math.hypot(enemy.x - this.x, enemy.y - this.y);
                    if ((distance - enemy.hitboxRadius * this.game.scale) < this.range) {
                        minDistance = distance; 
                        nearestEnemy = enemy;
                    }
                }
            }
            this.target = nearestEnemy;
        }
    }

    update(enemies, projectiles) {
        if (this.isAsleep) return;

        // 1. БАФФЫ (СВЕЧЕНИЕ И СБРОС)
        if (this.buffTimer > 0) {
            this.buffTimer--;
            if (this.buffTimer % 10 < 5) this.color = 'gold'; else this.color = TOWER_CONFIG[this.type].color || 'white';
            if (this.buffTimer <= 0) {
                this.damage = this.baseDamage;
                this.damageTickRate = this.baseDamageTickRate;
                this.fireRate = this.baseFireRate;
                if (this.isPatrolTower) this.auraDamage = TOWER_CONFIG[this.type].auraDamage;
            }
        }

        // 2. ТРАНСФОРМАЦИЯ
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
            const distance = Math.hypot(dx, dy);
            
            if (distance < this.patrolSpeed) {
                this.patrolDirection *= -1;
            } else {
                this.patrolCurrentPos.x += (dx / distance) * this.patrolSpeed;
                this.patrolCurrentPos.y += (dy / distance) * this.patrolSpeed;
            }
            this.attackFrame = (this.attackFrame + config.frameSpeed) % config.frameCount;
            this.facingDirection = dx > 0 ? 1 : -1;

            this.soundTimer++;
            if (this.soundTimer > 30) {
                 playSound(this.type);
                 this.soundTimer = 0;
            }

            enemies.forEach(enemy => {
                const enemyDist = Math.hypot(enemy.x - this.patrolCurrentPos.x, enemy.y - this.patrolCurrentPos.y);
                // Проверка на щит маффина:
                if (enemyDist < this.auraRadius && !enemy.isInvulnerable) { 
                    enemy.currentHealth -= this.auraDamage; 
                }
            });
            return;
        }

        // 4. ДЁРПИ (ПОДДЕРЖКА)
        if (this.isSupport) {
            if (this.isAttacking) {
                this.attackFrame += 0.3; 
                if (this.attackFrame >= 12) {
                    this.isAttacking = false; 
                    this.attackFrame = 0; 
                }
                return; 
            }

            if (this.cooldown > 0) {
                this.cooldown--;
                this.attackFrame = 0; 
            } else {
                const isMiss = Math.random() < config.missChance;
                let target = null;

                if (isMiss) {
                    const possibleEnemies = enemies.filter(e => !e.isFinished && e.currentHealth > 0 && Math.hypot(e.x - this.x, e.y - this.y) < this.range);
                    if (possibleEnemies.length > 0) {
                        target = possibleEnemies[Math.floor(Math.random() * possibleEnemies.length)];
                    }
                } else {
                    const allies = this.game.towers.filter(t => t !== this && t.buffTimer <= 0 && !t.isSupport && Math.hypot(t.x - this.x, t.y - this.y) < this.range);
                    if (allies.length > 0) {
                        target = allies[Math.floor(Math.random() * allies.length)];
                    }
                }

                if (target) {
                    this.isAttacking = true; 
                    this.attackFrame = 0;    
                    
                    const muffinConfig = { ...config, projectileType: 'muffin' };
                    projectiles.push(new Projectile(this.x, this.y, target, muffinConfig, this.game));
                    
                    playSound(this.type);
                    this.cooldown = config.fireRate; 
                }
            }
            return; 
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
                if (Math.hypot(enemy.x - this.x, enemy.y - this.y) < this.dramaFillRadius) {
                    enemyInPersonalSpace = true; 
                    break;
                }
            }
            if (enemyInPersonalSpace && this.dramaMeter < this.dramaMeterMax) { 
                this.dramaMeter += this.dramaFillRate; 
            }
            if (this.dramaMeter >= this.dramaMeterMax) {
                this.isUlting = true; 
                this.dramaMeter = 0;
                const ultRadius = config.ultRadius * this.game.scale;
                enemies.forEach(enemy => {
                    if (Math.hypot(enemy.x - this.x, enemy.y - this.y) < ultRadius) {
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
                if (Math.hypot(enemy.x - this.x, enemy.y - this.y) < this.range) {
                    enemiesInRange = true;
                    break;
                }
            }
            
            if (enemiesInRange) {
                this.isAttacking = true;
                if (this.damageCooldown > 0) this.damageCooldown--;
                if (this.damageCooldown <= 0) {
                    enemies.forEach(enemy => {
                        if (Math.hypot(enemy.x - this.x, enemy.y - this.y) < this.range) {
                            // Проверка на щит маффина:
                            if (!enemy.isInvulnerable) {
                                enemy.currentHealth -= this.damage;
                            }
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
            if (this.target) {
                const distance = Math.hypot(this.target.x - this.x, this.target.y - this.y);
                if (this.target.currentHealth <= 0 || this.target.isFinished || distance > this.range) {
                    this.target = null;
                }
            }
            if (!this.target) {
                this.findTarget(enemies);
            }
            
            this.facingDirection = this.target ? ((this.target.x > this.x) ? 1 : -1) : -1;
            
            if (this.isMelee) {
                 this.isAttacking = !!this.target; 
            } else {
                 this.isAttacking = this.isShootingVisual; 
            }

            // Атака Ближний бой
            if (this.isMelee && this.target) {
                if (this.damageCooldown > 0) this.damageCooldown--;
                if (this.damageCooldown <= 0) {
                    if (config.applySlow) {
                        this.target.slowDuration = config.slowDuration;
                    } else if (!this.target.isInvulnerable) { // Проверка на щит маффина
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
        
        // АНИМАЦИЯ
        if (!this.isMelee && !this.isPatrolTower && this.isShootingVisual) {
            const frameSpeed = config.attackFrameSpeed || config.frameSpeed;
            const frameCount = config.attackFrameCount || config.frameCount;
            this.attackFrame += frameSpeed;
            
            if (this.attackFrame >= frameCount) {
                this.attackFrame = 0;
                this.isShootingVisual = false;
            }
        }
        else if (this.isMelee && this.isAttacking) {
            const frameSpeed = config.attackFrameSpeed || config.frameSpeed;
            const frameCount = config.attackFrameCount || config.frameCount;
            this.attackFrame = (this.attackFrame + frameSpeed) % frameCount; 
        } 
        else if (!this.isSupport && !this.isPatrolTower && !this.isShootingVisual && !this.isAttacking) {
            this.attackFrame = 0;
        }
    }

    shoot(projectiles) {
        const config = TOWER_CONFIG[this.type];
        if (this.target) { 
            // Передаем динамический урон с учетом баффов Дёрпи!
            const dynamicConfig = { ...config, currentDamage: this.damage };
            projectiles.push(new Projectile(this.x, this.y, this.target, dynamicConfig, this.game));
            playSound(this.type); 
            
            this.isShootingVisual = true;
            this.attackFrame = 0;
        }
    }

    draw(ctx) {
        const cfg = TOWER_CONFIG[this.type];
        const scale = this.game.scale; 
        const drawWidth = 88 * scale;
        const drawHeight = 78 * scale;
        const offsetY = -8 * scale;
        
        let currentImage;

        if (this.isTransforming) {
            currentImage = towerImages[this.type + ' Превращение'];
            if (currentImage && currentImage.complete && currentImage.naturalWidth > 0) {
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

        const isImgReady = (img) => img && img.complete && img.naturalWidth > 0;

        let imgKey = this.type;
        if (this.isAsleep) {
            imgKey = `${this.type} Сон`;
        } else if (this.isSniper && this.isUlting) {
            imgKey = `${this.type} Ульта`;
        } else if (this.isPatrolTower && this.patrolEnd) {
            imgKey = `${this.type} Атака`;
        } else if (this.isAttacking || (this.isSniper && this.isShootingVisual)) {
            imgKey = `${this.type} Атака`;
        }

        let useGrayscaleFilter = false;
        if (this.isEqualized) {
            const grayAction = towerImages[`${imgKey} БезЦвет`];
            const grayBase = towerImages[`${this.type} БезЦвет`];

            if (isImgReady(grayAction)) {
                currentImage = grayAction;
            } else if (isImgReady(grayBase)) {
                currentImage = grayBase;
            } else {
                currentImage = isImgReady(towerImages[imgKey]) ? towerImages[imgKey] : towerImages[this.type];
                useGrayscaleFilter = true; 
            }
        } else {
            currentImage = isImgReady(towerImages[imgKey]) ? towerImages[imgKey] : towerImages[this.type];
        }

        if (!currentImage || !currentImage.complete || currentImage.naturalWidth === 0) {
             ctx.save(); 
             ctx.translate(this.x, this.y); 
             ctx.fillStyle = 'purple'; 
             ctx.beginPath(); 
             ctx.arc(0, 0, 10 * scale, 0, Math.PI * 2); 
             ctx.fill(); 
             ctx.restore();
        } else {
            if (this.isPatrolTower) {
                ctx.fillStyle = 'rgba(34, 211, 238, 0.5)';
                ctx.beginPath(); 
                ctx.arc(this.patrolStart.x, this.patrolStart.y, 10 * scale, 0, Math.PI * 2); 
                ctx.fill();
                if (this.patrolEnd) {
                    ctx.beginPath(); 
                    ctx.arc(this.patrolEnd.x, this.patrolEnd.y, 10 * scale, 0, Math.PI * 2); 
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)'; 
                    ctx.lineWidth = 3 * scale; 
                    ctx.beginPath();
                    ctx.moveTo(this.patrolStart.x, this.patrolStart.y); 
                    ctx.lineTo(this.patrolEnd.x, this.patrolEnd.y); 
                    ctx.stroke();
                }

                ctx.save();
                if (useGrayscaleFilter) ctx.filter = 'grayscale(100%)';
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
                if (useGrayscaleFilter) ctx.filter = 'grayscale(100%)';
                ctx.translate(this.x, this.y + offsetY);
                if (this.facingDirection === -1) ctx.scale(-1, 1);

                if (this.isSniper && this.isUlting && !this.isAsleep) {
                    const frameX = Math.floor(this.ultFrame) * cfg.ultFrameWidth;
                    const renderW = cfg.ultFrameWidth * scale; 
                    const renderH = currentImage.height * scale;
                    ctx.drawImage(currentImage, frameX, 0, cfg.ultFrameWidth, currentImage.height, -renderW / 2, -renderH / 2, renderW, renderH);
                }
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
                const barW = 55 * scale, barH = 6 * scale; 
                const barX = this.x - barW / 2;
                const barY = this.y - 58 * scale; 
                ctx.fillStyle = '#333'; 
                ctx.fillRect(barX, barY, barW, barH);
                ctx.fillStyle = '#f0f'; 
                ctx.fillRect(barX, barY, barW * (this.dramaMeter / this.dramaMeterMax), barH);
            }
        }

        if (this.game.isBuilding && this.game.selectedTowerType === this.type) { 
            ctx.beginPath(); 
            ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2); 
            ctx.fillStyle = 'rgba(255,255,0,0.05)'; 
            ctx.fill();
        }
        if (this.isAsleep) {
            const zX = this.isPatrolTower ? this.patrolCurrentPos.x : this.x;
            const zY = this.isPatrolTower ? this.patrolCurrentPos.y : this.y;
            ctx.fillStyle = 'white'; 
            ctx.font = `bold ${20 * scale}px sans-serif`; 
            ctx.strokeStyle = 'black'; 
            ctx.lineWidth = 3 * scale;
            ctx.strokeText("Zzz...", zX - 15 * scale, zY - 55 * scale); 
            ctx.fillText("Zzz...", zX - 15 * scale, zY - 55 * scale);
        }

        // --- ВИЗУАЛ БАФФА ДЁРПИ (ЗОЛОТАЯ АУРА И ЗВЕЗДОЧКИ) ---
        if (this.buffTimer > 0) {
            ctx.save();
            ctx.translate(this.x, this.y);

            // Пульсирующий круг у основания
            const pulse = Math.sin(Date.now() / 150) * 3 * scale;
            ctx.beginPath();
            ctx.arc(0, 5 * scale, 30 * scale + pulse, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 215, 0, 0.18)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
            ctx.lineWidth = 2 * scale;
            ctx.stroke();

            // Значок маффина со звездочками над головой
            ctx.font = `${14 * scale}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('🧁✨', 0, -52 * scale - pulse);

            ctx.restore();
        }
    }
}