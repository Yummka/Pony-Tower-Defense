import { ENEMY_TYPES, enemyImages, enemyImagesSlow, enemyImagesStun, } from '../config.js';

export default class Enemy {
    constructor(type, path) {
        const cfg = ENEMY_TYPES[type];
        this.type = type;
        this.path = path;
        this.baseSpeed = cfg.speed;
        this.currentSpeed = cfg.speed;
        this.slowDuration = 0;
        this.stunDuration = 0;

        this.pathIndex = 0;
        this.x = path[0].x;
        this.y = path[0].y;
        
        // Размеры
        this.width = cfg.width || cfg.size; 
        this.height = cfg.height || cfg.size;
        
        // Здоровье
        this.maxHealth = cfg.maxHealth;
        this.currentHealth = cfg.maxHealth;
        this.color = cfg.color;
        this.bounty = cfg.bounty;
        this.isFinished = false;
        this.hitboxRadius = cfg.hitboxRadius || 20;

        // НОВОЕ: Оффсет по Y (по умолчанию 0)
        this.yOffset = 0; 
        
        // Анимация Grunt (по умолчанию)
        this.frame = 0;
        this.frameSpeed = 0.3; 
        this.frameCount = 15;
        
        if (type === "Tank") {
            this.frameCount = 12;
            this.frameSpeed = 0.3;
        } else if(type === "Fast"){
            this.frameCount = 12;
            this.frameSpeed = 0.4;
            this.width = 88;
            this.height = 50;
        } else if (type === "Mom") { 
            this.frameCount = 8;     
            this.frameSpeed = 0.2;
            this.yOffset = -10; 
        }else if (type === "Spoon") { 
            this.frameCount = 15;     
            this.frameSpeed = 0.2;
        }else if (type === "Snail") { 
            this.frameCount = 9;     
            this.frameSpeed = 0.1;
        }else if (type === "Snip"){ 
            this.frameCount = 16;     
            this.frameSpeed = 0.3;
        }else if (type === "BabsSeed") { 
            this.frameCount = 16;     
            this.frameSpeed = 0.3;
        }else if (type === "Trixie") { 
            this.frameCount = 15;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "PrinceBlueblood") { 
            this.frameCount = 16;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "Hoops") { 
            this.frameCount = 14;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "Stronghoof") { 
            this.frameCount = 8;     
            this.frameSpeed = 0.1;
            this.yOffset = -20;
        }else if (type === "Score") { 
            this.frameCount = 16;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "Bell") { 
            this.frameCount = 16;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "ShadowBolts") { 
            this.frameCount = 14;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "Flim") { 
            this.frameCount = 14;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "Flam") { 
            this.frameCount = 15;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "ShadowBolts2") { 
            this.frameCount = 16;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "Siren1") { 
            this.frameCount = 8;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "Siren2") { 
            this.frameCount = 8;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "Siren3") { 
            this.frameCount = 8;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "SirenP1") { 
            this.frameCount = 15;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "SirenP2") { 
            this.frameCount = 15;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "SirenP3") { 
            this.frameCount = 15;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "Suri") { 
            this.frameCount = 16;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "LightningDust") { 
            this.frameCount = 8;     
            this.frameSpeed = 0.5;
            this.yOffset = -20;
        }else if (type === "Gilda") { 
            this.frameCount = 15;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "Doctor") { 
            this.frameCount = 16;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "Stariy") { 
            this.frameCount = 15;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "Perviy") { 
            this.frameCount = 16;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "Vtoroy") { 
            this.frameCount = 16;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "Tretiy") { 
            this.frameCount = 16;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "SfinksWalk") { 
            this.frameCount = 15;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "SfinksFly") { 
            this.frameCount = 16;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "Achel") { 
            this.frameCount = 16;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "Knight") { 
            this.frameCount = 15;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "KnightFly") { 
            this.frameCount = 16;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "FlatWalk") {
            this.frameCount = 15;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "ZBats") {
            this.frameCount = 7;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "KBats") {
            this.frameCount = 7;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "Wolf") {
            this.frameCount = 21;     
            this.frameSpeed = 0.6;
            this.yOffset = -20;
        }else if (type === "NightmareMoon") {
            this.frameCount = 29;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "DogS") {
            this.frameCount = 16;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "DogM") {
            this.frameCount = 15;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "DogL") {
            this.frameCount = 16;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "Parasprits") {
            this.frameCount = 8;     
            this.frameSpeed = 0.2;
            this.yOffset = -20;
        }else if (type === "Manticora") {
            this.frameCount = 11;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "PereWalk") {
            this.frameCount = 15;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "PereFly") {
            this.frameCount = 18;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }else if (type === "GildaFly") {
            this.frameCount = 11;     
            this.frameSpeed = 0.2;
            this.yOffset = -20;
        }else if (type === "Crizalis") {
            this.frameCount = 21;     
            this.frameSpeed = 0.3;
            this.yOffset = -20;
        }


        this.lastDirection = 1; // 1 = вправо, -1 = влево
    }
    //PrinceBlueblood Hoops Stronghoof
    
    // ------------------------------------
    // МЕТОД ДВИЖЕНИЯ (update остается без изменений)
    // ------------------------------------
    update(scale = 1) { 
        if (this.isFinished) return;

        if (this.stunDuration > 0) {
            this.stunDuration--; 
            return; 
        }

        const target = this.path[this.pathIndex + 1];

        if (target) {
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Обработка замедления
            if (this.slowDuration > 0) {
                this.currentSpeed = this.baseSpeed * 0.5;
                this.slowDuration--;
            } else {
                this.currentSpeed = this.baseSpeed;
            }

            // --- ВАЖНОЕ ИЗМЕНЕНИЕ ---
            // Умножаем скорость на масштаб!
            const realSpeed = this.currentSpeed * scale; 
            // ------------------------

            if (distance < realSpeed) {
                this.x = target.x;
                this.y = target.y;
                this.pathIndex++;
            } else {
                const velocityX = (dx / distance) * realSpeed; // Используем realSpeed
                const velocityY = (dy / distance) * realSpeed; // Используем realSpeed
                
                if (velocityX > 0) this.lastDirection = 1; 
                else if (velocityX < 0) this.lastDirection = -1; 

                this.x += velocityX;
                this.y += velocityY;
                
                this.frame = (this.frame + this.frameSpeed) % this.frameCount;
            }
        } else {
            this.isFinished = true;
        }
    }
    
    // ------------------------------------
    // МЕТОД ОТРИСОВКИ (С КОРРЕКТНЫМ Y-ОФФСЕТОМ)
    // ------------------------------------
    // В файле js/entities/Enemy.js

    // В файле Enemy.js

    // Добавили аргумент 'scale'
    draw(ctx, scale = 1) { 
        let img;
        
        if (this.stunDuration > 0) img = enemyImagesStun[this.type];
        else if (this.slowDuration > 0) img = enemyImagesSlow[this.type];
        else img = enemyImages[this.type];

        if (!img || !img.complete || img.naturalWidth === 0) img = enemyImages[this.type];

        const cfg = ENEMY_TYPES[this.type];
        
        // --- МАСШТАБИРОВАНИЕ ---
        // Умножаем размеры на масштаб
        const drawWidth = this.width * scale;
        const drawHeight = this.height * scale;
        const drawYOffset = this.yOffset * scale;

        if (img && img.complete) {
            const frameWidth = cfg.frameWidth || (img.width / this.frameCount); 
            let frameX;

            if (this.type === 'Snail') {
                const invertedFrame = (this.frameCount - 1) - Math.floor(this.frame);
                frameX = invertedFrame * frameWidth;
            } else {
                frameX = Math.floor(this.frame) * frameWidth;
            }
            
            ctx.save();
            // Используем отмасштабированный сдвиг
            ctx.translate(this.x, this.y + drawYOffset); 

            if (this.lastDirection === -1) {
                ctx.scale(-1, 1);
            }
            
            ctx.drawImage(
                img, 
                frameX, 0, frameWidth, img.height, 
                -drawWidth / 2, -drawHeight / 2, // Используем новые размеры
                drawWidth, drawHeight           // Используем новые размеры
            );
            
            ctx.restore();
        } else {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 15 * scale, 0, Math.PI * 2); 
            ctx.fill();
        }
        
        // >>> ШКАЛА ЗДОРОВЬЯ (Тоже масштабируем) <<<
        const barWidth = 40 * scale;     
        const barHeight = 5 * scale;     
        const barOffset = 25 * scale;    

        const barX = this.x - barWidth / 2;
        const barY = (this.y - barOffset) + drawYOffset; 

        const healthRatio = Math.max(0, this.currentHealth / this.maxHealth);
        const currentBarWidth = barWidth * healthRatio;
        
        ctx.fillStyle = 'black';
        ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

        ctx.fillStyle = 'red';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        ctx.fillStyle = 'lime';
        ctx.fillRect(barX, barY, currentBarWidth, barHeight);
    }
}