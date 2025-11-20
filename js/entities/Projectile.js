export default class Projectile {
        constructor(startX, startY, target, config) {
            this.x = startX;
            this.y = startY;
            this.target = target; // сохраняем сам объект Enemy
            this.damage = config.damage;
            this.isAoe = config.isAoe;
            this.aoeRadius = config.aoeRadius || 0;
            this.applySlow = config.applySlow || false;
            this.slowDuration = config.slowDuration || 0;
            this.speed = 10;
            this.radius = this.isAoe ? 8 : 4;
            this.color = config.color === '#f97316' ? 'orange' : 'white';
        }

        update() {
            if (!this.target || this.target.currentHealth <= 0) {
                return true; // цель умерла — снаряд исчезает
            }

            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Внутри Projectile.update()
            if (dist < this.speed) {
                // Попадание
                if (this.isAoe) {
                    return { type: 'aoe', x: this.target.x, y: this.target.y };
                } else {
                    // Обычное попадание
                    this.target.currentHealth -= this.damage;
                    
                    // --- ДОБАВЛЕНО ---
                    if (this.applySlow) {
                        this.target.slowDuration = this.slowDuration;
                    }
                    // --- КОНЕЦ ---
                }
                return true; // снаряд уничтожается
            }

            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
            return false;
        }

        draw(ctx) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }