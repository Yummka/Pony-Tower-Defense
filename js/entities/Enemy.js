import { ENEMY_TYPES, enemyImages, enemyImagesSlow, enemyImagesStun } from '../config.js';

export default class Enemy {
    constructor(type, path) {
        const cfg = ENEMY_TYPES[type] || ENEMY_TYPES.Grunt;
        this.type = type;
        this.path = path;

        this.frameCount = cfg.frameCount || 15;
        this.frameSpeed = cfg.frameSpeed || 0.3;
        this.baseSpeed = cfg.speed;
        this.currentSpeed = cfg.speed;
        this.maxHealth = cfg.maxHealth;
        this.currentHealth = cfg.maxHealth;
        this.width = cfg.width || 60;
        this.height = cfg.height || 60;
        this.yOffset = cfg.yOffset || 0;
        this.hitboxRadius = cfg.hitboxRadius || 20;
        this.isStatic = cfg.isStatic || false;
        this.isStealth = cfg.isStealth || false;
        this.bounty = cfg.bounty || 5;
        this.color = cfg.color || 'red';

        // Состояние
        this.pathIndex = 0;
        this.frame = 0;
        this.isFinished = false;
        this.slowDuration = 0;
        this.stunDuration = 0;
        this.derpyBuffTimer = 0;
        this.isInvulnerable = false;
        this.lastDirection = 1;
        this.isTransforming = false;
        this.transformTimer = 0;

        if (path && path.length > 0) {
            this.x = path[0].x;
            this.y = path[0].y;
        } else {
            this.x = 0;
            this.y = 0;
        }
    }

    update(scale = 1) {
        if (this.isFinished) return;

        // 1. СТАТИЧНЫЕ ВРАГИ
        if (this.isStatic || !this.path || this.path.length === 0) return;

        // 2. ЭФФЕКТЫ (СТАН)
        if (this.stunDuration > 0) {
            this.stunDuration--; 
            return; 
        }

        // 3. СКОРОСТЬ (БАФФ ДЁРПИ / ЗАМЕДЛЕНИЕ)
        if (this.derpyBuffTimer > 0) {
            this.derpyBuffTimer--;
            this.currentSpeed = this.baseSpeed * 1.4; // Враг реально бежит на 40% быстрее!
            if (this.derpyBuffTimer <= 0) {
                this.isInvulnerable = false;
            }
        } else if (this.slowDuration > 0) {
            this.currentSpeed = this.baseSpeed * 0.5;
            this.slowDuration--;
        } else {
            this.currentSpeed = this.baseSpeed;
        }

        // 4. ТРАНСФОРМАЦИЯ (Каденс -> Кризалис)
        if (this.type === 'FakeCadence' && !this.isTransforming) {
            const targetX = 900 * scale; 
            const targetY = 575 * scale;
            const dist = Math.hypot(this.x - targetX, this.y - targetY);

            if (dist < 30 * scale) {
                this.startChrysalisTransformation();
                return; 
            }
        }

        if (this.isTransforming) {
            this.transformTimer++;
            this.frame += 0.2; 
            if (this.transformTimer > 100) this.finishChrysalisTransformation();
            return; 
        }

        // 5. ДВИЖЕНИЕ
        const target = this.path[this.pathIndex + 1];
        if (target) {
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const distance = Math.hypot(dx, dy);
            const realSpeed = this.currentSpeed * scale; 

            if (distance < realSpeed) {
                this.x = target.x;
                this.y = target.y;
                this.pathIndex++;
            } else {
                this.lastDirection = dx > 0 ? 1 : -1; 
                this.x += (dx / distance) * realSpeed;
                this.y += (dy / distance) * realSpeed;
                this.frame = (this.frame + this.frameSpeed) % this.frameCount;
            }
        } else {
            this.isFinished = true;
        }
    }

    startChrysalisTransformation() {
        this.isTransforming = true;
        this.transformTimer = 0;
        this.frame = 0; 
    }

    finishChrysalisTransformation() {
        this.isTransforming = false;
        this.type = 'TrueChrysalis';
        const cfg = ENEMY_TYPES['TrueChrysalis'];
        
        this.isStealth = false;
        this.maxHealth = cfg.maxHealth;
        this.currentHealth = cfg.maxHealth;
        this.baseSpeed = cfg.speed;
        this.currentSpeed = cfg.speed; 
        this.width = cfg.width;
        this.height = cfg.height;
        this.yOffset = cfg.yOffset;
        this.frameCount = cfg.frameCount;
        this.frameSpeed = cfg.frameSpeed;
        this.frame = 0;
    }

    draw(ctx, scale = 1) { 
        if (this.isTransforming) {
            const img = enemyImages['CadenceTransform']; 
            if (img && img.complete && img.naturalWidth > 0) {
                const totalFrames = 16; 
                const frameW = img.width / totalFrames; 
                let fIdx = Math.min(Math.floor(this.frame), totalFrames - 1);
                
                ctx.save();
                ctx.translate(this.x, this.y + (this.yOffset * scale) + (15 * scale));
                const rw = 140 * scale; 
                const rh = 240 * scale; 
                ctx.drawImage(img, fIdx * frameW, 0, frameW, img.height, -rw/2, -rh + 40*scale, rw, rh);
                ctx.restore();
            }
            return; 
        }

        // Безопасный выбор спрайта стана/замедления:
        let img = enemyImages[this.type];
        if (this.stunDuration > 0 && enemyImagesStun[this.type]?.naturalWidth > 0) {
            img = enemyImagesStun[this.type];
        } else if (this.slowDuration > 0 && enemyImagesSlow[this.type]?.naturalWidth > 0) {
            img = enemyImagesSlow[this.type];
        }

        if (img && img.complete && img.naturalWidth > 0) {
            const fW = img.width / this.frameCount;
            let fX = Math.floor(this.frame) * fW;

            ctx.save();
            ctx.translate(this.x, this.y + (this.yOffset * scale)); 
            if (this.lastDirection === -1 && !this.isStatic) ctx.scale(-1, 1);
            
            ctx.drawImage(img, fX, 0, fW, img.height, -(this.width * scale) / 2, -(this.height * scale) / 2, this.width * scale, this.height * scale);
            ctx.restore();
        } else {
            ctx.fillStyle = this.color;
            ctx.beginPath(); 
            ctx.arc(this.x, this.y, 15 * scale, 0, Math.PI * 2); 
            ctx.fill();
        }

        // Полоска здоровья
        if (this.type !== 'FakeCadence') {
            const bw = 40 * scale; 
            const bh = 5 * scale;
            const bx = this.x - bw / 2;
            let extraH = (['TrueChrysalis', 'KingSombra', 'SombraCrystal'].includes(this.type)) ? 25 * scale : 0;
            const by = this.y - 30 * scale - extraH + (this.yOffset * scale);
            
            ctx.fillStyle = 'black'; 
            ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
            ctx.fillStyle = 'red'; 
            ctx.fillRect(bx, by, bw, bh);
            ctx.fillStyle = 'lime'; 
            ctx.fillRect(bx, by, bw * Math.max(0, this.currentHealth / this.maxHealth), bh);
        }

        // --- ВИЗУАЛ БАФФА ДЁРПИ НА ВРАГЕ (ЩИТ И МАФФИН) ---
        if (this.derpyBuffTimer > 0) {
            ctx.save();
            ctx.translate(this.x, this.y + (this.yOffset * scale));

            const pulse = Math.sin(Date.now() / 120) * 4 * scale;
            
            // Сияющая защитная сфера
            ctx.beginPath();
            ctx.arc(0, 0, (this.hitboxRadius + 8) * scale + pulse, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(248, 113, 113, 0.9)';
            ctx.lineWidth = 2.5 * scale;
            ctx.stroke();

            // Значок маффина с ускорением над врагом
            ctx.font = `${14 * scale}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('🧁💨', 0, -32 * scale - pulse);

            ctx.restore();
        }
    }
}