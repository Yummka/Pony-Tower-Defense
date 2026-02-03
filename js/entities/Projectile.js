import { towerImages } from '../config.js';

export default class Projectile {
    constructor(startX, startY, target, config) {
        this.x = startX;
        this.y = startY;
        this.target = target; 
        this.damage = config.damage;
        this.isAoe = config.isAoe;
        this.aoeRadius = config.aoeRadius || 0;
        this.applySlow = config.applySlow || false;
        this.slowDuration = config.slowDuration || 0;
        
        this.speed = 5; 
        this.radius = this.isAoe ? 8 : 4;
        this.color = config.color === '#f97316' ? 'orange' : 'white';

        // Проверяем, какой это снаряд
        this.isNeedle = config.projectileType === 'needle'; 
    }

    update(scale = 1) {
        if (!this.target || this.target.currentHealth <= 0) {
            return true; 
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Сохраняем угол поворота для рисования (только для иголки)
        if (this.isNeedle) {
            this.angle = Math.atan2(dy, dx);
        }

        const realSpeed = this.speed * scale;

        if (dist < realSpeed) {
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
            // --- ОТРИСОВКА ИГОЛКИ ---
            const img = towerImages['Иголка'];
            if (img && img.complete) {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle); // Поворачиваем в сторону цели
                
                // Размер иголки (можно настроить)
                const w = 30 * scale; 
                const h = 10 * scale;
                
                // Рисуем (сдвигаем, чтобы центр был в точке x,y)
                ctx.drawImage(img, -w/2, -h/2, w, h);
                ctx.restore();
                return;
            }
        }

        // Обычный шарик (для остальных)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * scale, 0, Math.PI * 2);
        ctx.fill();
    }
}