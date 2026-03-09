import { towerImages, ENEMY_TYPES } from '../config.js';

export default class Projectile {
    // ✅ ИЗМЕНЕНИЕ: добавили аргумент 'game' (перед config или после - главное соблюдать порядок в Tower.js)
    // В Tower.js мы сделали: new Projectile(x, y, target, config, game)
    // Значит тут порядок должен быть таким же:
    constructor(startX, startY, target, config, game) {
        this.x = startX;
        this.y = startY;
        this.target = target; 
        this.damage = config.damage;
        this.isAoe = config.isAoe;
        this.aoeRadius = config.aoeRadius || 0;
        this.applySlow = config.applySlow || false;
        this.slowDuration = config.slowDuration || 0;
        
        this.game = game; // ✅ Сохраняем ссылку на игру
        
        this.speed = 5; 
        this.radius = this.isAoe ? 8 : 4;
        this.color = config.color === '#f97316' ? 'orange' : 'white';

        this.isNeedle = config.projectileType === 'needle'; 
        this.isMuffin = config.projectileType === 'muffin';
    }

    update(scale = 1) {
        if (!this.target) return true;
        if (!this.target.isTower && this.target.currentHealth <= 0) return true;

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (this.isNeedle) {
            this.angle = Math.atan2(dy, dx);
        }
        
        // Вращение маффина
        if (this.isMuffin) {
            this.angle = (this.angle || 0) + 0.15;
        }

        const realSpeed = this.speed * scale;

        if (dist < realSpeed) {
            // --- ЛОГИКА МАФФИНА (С ТЕКСТОМ) ---
            if (this.isMuffin) {
                if (this.target.isTower) {
                    // Бафф башне
                    this.target.buffTimer = 300; 
                    this.target.damage = this.target.baseDamage * 1.5; 
                    
                    // ✅ ТЕКСТ: +50% Урона
                    if (this.game) this.game.showFloatingText(this.target.x, this.target.y - 40, "УРОН UP! 🧁", "#FFD700");
                } else {
                    // Бафф врагу (Ой!)
                    this.target.derpyBuffTimer = 180;
                    this.target.currentHealth += 50;
                    if(this.target.currentHealth > this.target.maxHealth) this.target.currentHealth = this.target.maxHealth;
                    this.target.currentSpeed *= 1.5;
                    this.target.isInvulnerable = true; 
                    
                    // ✅ ТЕКСТ: Ой...
                    if (this.game) this.game.showFloatingText(this.target.x, this.target.y - 40, "Упс... Скорость UP", "#FF4444");
                }
                return true; // Снаряд исчез
            }

            // --- ОБЫЧНЫЙ УРОН ---
            const targetConfig = ENEMY_TYPES[this.target.type];
            if (targetConfig && targetConfig.isInvulnerable) {
                // Если попали в неуязвимого (Сомбра или баффнутый)
                if (this.game && Math.random() < 0.1) { // Чтобы не спамить текстом каждый кадр
                     this.game.showFloatingText(this.target.x, this.target.y - 30, "BLOCK", "gray");
                }
                return true; 
            }

            if (this.isAoe) {
                return { type: 'aoe', x: this.target.x, y: this.target.y };
            } else {
                this.target.currentHealth -= this.damage;
                if (this.applySlow) {
                    this.target.slowDuration = this.slowDuration;
                }
            }
            return true; 
        }

        this.x += (dx / dist) * realSpeed;
        this.y += (dy / dist) * realSpeed;
        return false;
    }

    draw(ctx, scale = 1) {
        if (this.isNeedle) {
            const img = towerImages['Иголка'];
            if (img && img.complete) {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle); 
                const w = 30 * scale; 
                const h = 10 * scale;
                ctx.drawImage(img, -w/2, -h/2, w, h);
                ctx.restore();
                return;
            }
        }
        
        // --- ОТРИСОВКА МАФФИНА ---
        if (this.isMuffin) {
            const img = towerImages['Маффин'];
            
            // Если картинка загружена - рисуем её
            if (img && img.complete && img.naturalWidth > 0) {
                const size = 30 * scale;
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle || 0); // Вращение
                ctx.drawImage(img, -size/2, -size/2, size, size);
                ctx.restore();
                return;
            } 
            // Если картинки НЕТ или она битая - рисуем коричневый кружок (чтобы не было белого)
            else {
                ctx.fillStyle = '#8B4513'; // Коричневый
                ctx.beginPath();
                ctx.arc(this.x, this.y, 8 * scale, 0, Math.PI * 2);
                ctx.fill();
                return;
            }
        }

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * scale, 0, Math.PI * 2);
        ctx.fill();
    }
}