import { towerImages } from '../config.js';

export default class LunaEffect {
    constructor(targetX, targetY, game, config) {
        this.game = game;
        this.targetX = targetX;
        this.targetY = targetY;
        this.damage = config.damage;
        this.aoeRadius = config.aoeRadius * game.scale; 
        
        // Старт за экраном
        this.x = game.canvas.width + 200;
        this.y = -200;
        
        this.speed = 20 * game.scale; 
        this.state = 'fly_in'; // fly_in, attack, fly_out, finished
        
        this.timer = 0;
        
        // --- АНИМАЦИЯ ---
        this.frame = 0;
        this.totalFrames = 29; 
        this.frameWidth = 146; 
        this.frameHeight = 142; 
        this.animSpeed = 0.5; 
        
        this.renderWidth = 150 * game.scale; 
        this.renderHeight = 150 * game.scale;
    }

    update(enemies) {
        // Крутим анимацию всегда
        this.frame += this.animSpeed;
        if (this.frame >= this.totalFrames) this.frame = 0;

        if (this.state === 'fly_in') {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < this.speed) {
                this.x = this.targetX;
                this.y = this.targetY;
                this.state = 'attack';
            } else {
                this.x += (dx/dist) * this.speed;
                this.y += (dy/dist) * this.speed;
            }
        }
        else if (this.state === 'attack') {
            this.timer++;
            // Удар на 20-м кадре
            if (this.timer === 20) {
                enemies.forEach(e => {
                    const dist = Math.sqrt(Math.pow(e.x - this.x, 2) + Math.pow(e.y - this.y, 2));
                    if (dist < this.aoeRadius) {
                        e.currentHealth -= this.damage;
                        e.stunDuration += 120; // 2 секунды стана
                    }
                });
            }
            
            // Ждем 60 кадров (1 сек) и улетаем
            if (this.timer > 120) {
                this.state = 'fly_out';
            }
        }
        else if (this.state === 'fly_out') {
            this.x -= this.speed;
            this.y -= this.speed;
            
            if (this.x < -300) {
                this.state = 'finished';
            }
        }
    }

    draw(ctx) {
        let img = towerImages['Принцесса Луна Атака']; 
        
        if (img && img.complete) {
            ctx.save();
            ctx.translate(this.x, this.y);
            
            // --- ОТРАЖЕНИЕ ПО ГОРИЗОНТАЛИ ---
            ctx.scale(-1, 1); 
            // -------------------------------

            // --- ОТРИСОВКА КАДРА ---
            const sx = Math.floor(this.frame) * this.frameWidth; 
            
            ctx.drawImage(
                img, 
                sx, 0, this.frameWidth, this.frameHeight, 
                -this.renderWidth/2, -this.renderHeight/2, this.renderWidth, this.renderHeight 
            );
            
            // Эффекты взрыва
            if (this.state === 'attack') {
                if (this.timer >= 15 && this.timer <= 25) {
                    ctx.globalAlpha = 0.6;
                    ctx.fillStyle = 'cyan';
                    ctx.beginPath();
                    ctx.arc(0, 0, this.aoeRadius, 0, Math.PI * 2);
                    ctx.fill();
                }
                if (this.timer > 20) {
                    ctx.globalAlpha = 1 - (this.timer - 20) / 40;
                    ctx.lineWidth = 5;
                    ctx.strokeStyle = 'white';
                    ctx.beginPath();
                    ctx.arc(0, 0, this.aoeRadius * ((this.timer - 20) / 20), 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
            
            ctx.restore();
        }
    }
}