import { ENEMY_TYPES, enemyImages } from '../config.js';

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
        }


        this.lastDirection = 1; // 1 = вправо, -1 = влево
    }
    //PrinceBlueblood Hoops Stronghoof
    
    // ------------------------------------
    // МЕТОД ДВИЖЕНИЯ (update остается без изменений)
    // ------------------------------------
    update() {
        if (this.isFinished) return;

        if (this.stunDuration > 0) {
        this.stunDuration--; // Уменьшаем длительность стана
        return; // Враг в стане, он ничего не делает в этот кадр (не двигается, не анимируется)
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

            if (distance < this.currentSpeed) {
                // Достигли точки, переходим к следующей
                this.x = target.x;
                this.y = target.y;
                this.pathIndex++;
            } else {
                // Двигаемся к следующей точке
                const velocityX = (dx / distance) * this.currentSpeed;
                const velocityY = (dy / distance) * this.currentSpeed;
                
                // Обновляем направление для анимации
                if (velocityX > 0) {
                    this.lastDirection = 1; // Вправо
                } else if (velocityX < 0) {
                    this.lastDirection = -1; // Влево
                }

                this.x += velocityX;
                this.y += velocityY;
                
                // Обновляем кадр анимации
                this.frame = (this.frame + this.frameSpeed) % this.frameCount;
            }
        } else {
            // Достигли конца пути
            this.isFinished = true;
        }
    }
    
    // ------------------------------------
    // МЕТОД ОТРИСОВКИ (С КОРРЕКТНЫМ Y-ОФФСЕТОМ)
    // ------------------------------------
    draw(ctx) {
        const img = enemyImages[this.type];
        const cfg = ENEMY_TYPES[this.type];


        
        


        if (img && img.complete) {
            // Отрисовка врага с анимацией
            const frameWidth = cfg.frameWidth || (img.width / this.frameCount); 
            let frameX;

            if (this.type === 'Snail') {
                // Инвертируем порядок кадров для Снейла: от последнего к первому
                // this.frameCount - 1 дает индекс последнего кадра.
                const invertedFrame = (this.frameCount - 1) - Math.floor(this.frame);
                frameX = invertedFrame * frameWidth;
            } else {
                // Для всех остальных врагов - обычный порядок (слева направо)
                frameX = Math.floor(this.frame) * frameWidth;
            }
            
            ctx.save();
            // ПРИМЕНЕНИЕ ОФФСЕТА: изменяем позицию Y
            ctx.translate(this.x, this.y + this.yOffset); 

            // Если движется влево, отражаем изображение
            if (this.lastDirection === -1) {
                ctx.scale(-1, 1);
            }
            
            // Отрисовка кадра
            ctx.drawImage(
                img,
                frameX, 0, frameWidth, img.height, // Источник (спрайт-лист)
                -this.width / 2, -this.height / 2, // Цель (центрирование)
                this.width, this.height
            );
            
            if (this.stunDuration > 0) {
                ctx.globalAlpha = 0.5; // 50% прозрачность
                ctx.fillStyle = '#ff0'; // Ярко-желтый
                ctx.fillRect(
                    -this.width / 2, -this.height / 2,
                    this.width, this.height
                );
                ctx.globalAlpha = 1.0; // ВАЖНО: Сбрасываем прозрачность!
            }

            if (this.slowDuration > 0) {
                // Рисуем полупрозрачный синий "фильтр" поверх врага
                // Используем те же координаты, что и у drawImage
                ctx.globalAlpha = 0.4; // 40% прозрачность
                ctx.fillStyle = '#00f'; // Чисто синий
                
                // Мы все еще в "отраженном" пространстве, поэтому координаты те же
                ctx.fillRect(
                    -this.width / 2, -this.height / 2, // x, y (центрирование)
                    this.width, this.height              // ширина, высота
                );
                // ВАЖНО: Сбрасываем прозрачность обратно на 1.0!
                ctx.globalAlpha = 1.0; 
            }

            ctx.restore();
        } else {
            // Заливка цветом, если изображение не загружено
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 15, 0, Math.PI * 2); 
            ctx.fill();
        }
        
        // >>> ШКАЛА ЗДОРОВЬЯ <<<
        const barWidth = 40;     
        const barHeight = 5;     
        const barOffset = 25;    

        const barX = this.x - barWidth / 2;
        // ПРИМЕНЕНИЕ ОФФСЕТА: сдвигаем шкалу вместе с врагом
        const barY = (this.y - barOffset) + this.yOffset; 

        const healthRatio = this.currentHealth / this.maxHealth;
        const currentBarWidth = barWidth * healthRatio;
        
        // A. Задний фон (для рамки)
        ctx.fillStyle = 'black';
        ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

        // B. Рисуем оставшуюся часть (КРАСНЫЙ фон)
        ctx.fillStyle = 'red';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // C. Рисуем текущее здоровье (ЗЕЛЕНЫЙ)
        ctx.fillStyle = 'lime';
        ctx.fillRect(barX, barY, currentBarWidth, barHeight);
    }
}