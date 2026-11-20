import { towerImages, playSound } from '../config.js';

export default class LunaEffect {
    constructor(targetX, targetY, game, config) {
        this.game = game;
        this.targetX = targetX;
        this.targetY = targetY;
        this.damage = config.damage;
        this.aoeRadius = (config.aoeRadius || 250) * game.scale; 
        
        this.x = game.canvas.width + 200;
        this.y = -200;
        
        this.speed = 20 * game.scale; 
        this.state = 'fly_in'; 
        
        this.timer = 0;
        
        this.frame = 0;
        this.totalFrames = 29; 
        this.animSpeed = 0.5; 
        
        this.renderWidth = 150 * game.scale; 
        this.renderHeight = 150 * game.scale;
    }

    update(enemies) {
        this.frame += this.animSpeed;
        if (this.frame >= this.totalFrames) this.frame = 0;

        if (this.state === 'fly_in') {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist < this.speed) {
                this.x = this.targetX;
                this.y = this.targetY;
                this.state = 'attack';
            } else {
                this.x += (dx / dist) * this.speed;
                this.y += (dy / dist) * this.speed;
            }
        }
        else if (this.state === 'attack') {
            this.timer++;
            
            // Удар на 20-м кадре
            if (this.timer === 20) {
                playSound('Принцесса Луна'); 
                console.log("BOOM! Luna strikes.");

                enemies.forEach(e => {
                    const dist = Math.hypot(e.x - this.x, e.y - this.y);
                    if (dist < this.aoeRadius) {
                        e.currentHealth -= this.damage;
                        // Защита от undefined
                        e.stunDuration = (e.stunDuration || 0) + 120; 
                    }
                });
            }
            
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
        
        // 1. Проверяем, что картинка реально загружена и не битая
        if (img && img.complete && img.naturalWidth > 0) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.scale(-1, 1); 

            // 2. ДИНАМИЧЕСКИЙ РАСЧЁТ ШИРИНЫ КАДРА:
            // Игра сама разделит ширину картинки на 29 частей, даже если размер изменился
            const frameW = img.naturalWidth / this.totalFrames;
            const frameH = img.naturalHeight;
            
            // 3. Защита от выхода за границу спрайта
            const currentFrameIndex = Math.min(Math.floor(this.frame), this.totalFrames - 1);
            const sx = Math.max(0, Math.min(currentFrameIndex * frameW, img.naturalWidth - frameW)); 
            
            try {
                ctx.drawImage(
                    img, 
                    sx, 0, frameW, frameH, 
                    -this.renderWidth / 2, -this.renderHeight / 2, this.renderWidth, this.renderHeight 
                );
            } catch (err) {
                console.warn("Ошибка отрисовки спрайта Луны:", err);
            }
            
            // Спецэффекты удара
            if (this.state === 'attack') {
                if (this.timer >= 15 && this.timer <= 25) {
                    ctx.globalAlpha = 0.6;
                    ctx.fillStyle = 'cyan';
                    ctx.beginPath();
                    ctx.arc(0, 0, this.aoeRadius, 0, Math.PI * 2);
                    ctx.fill();
                }
                if (this.timer > 20) {
                    // 4. Защита от отрицательного globalAlpha (только от 0 до 1)
                    const fadeProgress = (this.timer - 20) / 40;
                    ctx.globalAlpha = Math.max(0, Math.min(1, 1 - fadeProgress));
                    
                    ctx.lineWidth = 5;
                    ctx.strokeStyle = 'white';
                    ctx.beginPath();
                    ctx.arc(0, 0, this.aoeRadius * Math.min(1, (this.timer - 20) / 20), 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
            
            ctx.restore();
        }
    }
}