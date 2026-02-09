import { ENEMY_TYPES, enemyImages, enemyImagesSlow, enemyImagesStun } from '../config.js';

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
        
        // Если путь есть, встаем в начало. Если нет (Кристалл) - 0,0
        if (path && path.length > 0) {
            this.x = path[0].x;
            this.y = path[0].y;
        } else {
            this.x = 0;
            this.y = 0;
        }
        
        // Размеры и статы
        this.width = cfg.width || 60; 
        this.height = cfg.height || 60;
        this.maxHealth = cfg.maxHealth;
        this.currentHealth = cfg.maxHealth;
        this.color = cfg.color;
        this.bounty = cfg.bounty;
        this.isFinished = false;
        this.hitboxRadius = cfg.hitboxRadius || 20;
        this.yOffset = cfg.yOffset || 0; 
        
        // Анимация (дефолт)
        this.frame = 0;
        this.frameSpeed = 0.3; 
        this.frameCount = 15;
        this.lastDirection = 1; 

        // Переменные для трансформации
        this.isTransforming = false;
        this.transformTimer = 0;
        this.isStatic = cfg.isStatic || false;
        this.isStealth = cfg.isStealth || false;

        // =========================================================
        //  ВОЗВРАЩАЕМ ТВОИ НАСТРОЙКИ АНИМАЦИИ (IF / ELSE)
        // =========================================================
        if (type === "Tank") {
            this.frameCount = 12; this.frameSpeed = 0.3;
        } else if(type === "Fast"){
            this.frameCount = 12; this.frameSpeed = 0.4;
        } else if (type === "Mom") { 
            this.frameCount = 8; this.frameSpeed = 0.2;
        } else if (type === "Spoon") { 
            this.frameCount = 15; this.frameSpeed = 0.2;
        } else if (type === "Snail") { 
            this.frameCount = 9; this.frameSpeed = 0.1;
        } else if (type === "Snip"){ 
            this.frameCount = 16; this.frameSpeed = 0.3;
        } else if (type === "BabsSeed") { 
            this.frameCount = 16; this.frameSpeed = 0.3;
        } else if (type === "Trixie") { 
            this.frameCount = 15; this.frameSpeed = 0.3;
        } else if (type === "PrinceBlueblood") { 
            this.frameCount = 16; this.frameSpeed = 0.3;
        } else if (type === "Hoops") { 
            this.frameCount = 14; this.frameSpeed = 0.3;
        } else if (type === "Stronghoof") { 
            this.frameCount = 8; this.frameSpeed = 0.1;
        } else if (type === "Score") { 
            this.frameCount = 16; this.frameSpeed = 0.3;
        } else if (type === "Bell") { 
            this.frameCount = 16; this.frameSpeed = 0.3;
        } else if (type === "ShadowBolts") { 
            this.frameCount = 14; this.frameSpeed = 0.3;
        } else if (type === "Flim") { 
            this.frameCount = 14; this.frameSpeed = 0.3;
        } else if (type === "Flam") { 
            this.frameCount = 15; this.frameSpeed = 0.3;
        } else if (type === "ShadowBolts2") { 
            this.frameCount = 16; this.frameSpeed = 0.3;
        } else if (type === "Siren1") { 
            this.frameCount = 8; this.frameSpeed = 0.3;
        } else if (type === "Siren2") { 
            this.frameCount = 8; this.frameSpeed = 0.3;
        } else if (type === "Siren3") { 
            this.frameCount = 8; this.frameSpeed = 0.3;
        } else if (type === "SirenP1") { 
            this.frameCount = 15; this.frameSpeed = 0.3;
        } else if (type === "SirenP2") { 
            this.frameCount = 15; this.frameSpeed = 0.3;
        } else if (type === "SirenP3") { 
            this.frameCount = 15; this.frameSpeed = 0.3;
        } else if (type === "Suri") { 
            this.frameCount = 16; this.frameSpeed = 0.3;
        } else if (type === "LightningDust") { 
            this.frameCount = 8; this.frameSpeed = 0.5;
        } else if (type === "Gilda") { 
            this.frameCount = 15; this.frameSpeed = 0.3;
        } else if (type === "Doctor") { 
            this.frameCount = 16; this.frameSpeed = 0.3;
        } else if (type === "Stariy") { 
            this.frameCount = 15; this.frameSpeed = 0.3;
        } else if (type === "Perviy") { 
            this.frameCount = 16; this.frameSpeed = 0.3;
        } else if (type === "Vtoroy") { 
            this.frameCount = 16; this.frameSpeed = 0.3;
        } else if (type === "Tretiy") { 
            this.frameCount = 16; this.frameSpeed = 0.3;
        } else if (type === "SfinksWalk") { 
            this.frameCount = 15; this.frameSpeed = 0.3;
        } else if (type === "SfinksFly") { 
            this.frameCount = 16; this.frameSpeed = 0.3;
        } else if (type === "Achel") { 
            this.frameCount = 16; this.frameSpeed = 0.3;
        } else if (type === "Knight") { 
            this.frameCount = 15; this.frameSpeed = 0.3;
        } else if (type === "KnightFly") { 
            this.frameCount = 16; this.frameSpeed = 0.3;
        } else if (type === "FlatWalk") {
            this.frameCount = 15; this.frameSpeed = 0.3;
        } else if (type === "ZBats") {
            this.frameCount = 7; this.frameSpeed = 0.3;
        } else if (type === "KBats") {
            this.frameCount = 7; this.frameSpeed = 0.3;
        } else if (type === "Wolf") {
            this.frameCount = 21; this.frameSpeed = 0.6;
        } else if (type === "NightmareMoon") {
            this.frameCount = 29; this.frameSpeed = 0.3;
        } else if (type === "DogS") {
            this.frameCount = 16; this.frameSpeed = 0.3;
        } else if (type === "DogM") {
            this.frameCount = 15; this.frameSpeed = 0.3;
        } else if (type === "DogL") {
            this.frameCount = 16; this.frameSpeed = 0.3;
        } else if (type === "Parasprits") {
            this.frameCount = 8; this.frameSpeed = 0.2;
        } else if (type === "Manticora") {
            this.frameCount = 11; this.frameSpeed = 0.3;
        } else if (type === "PereWalk") {
            this.frameCount = 15; this.frameSpeed = 0.3;
        } else if (type === "PereFly") {
            this.frameCount = 18; this.frameSpeed = 0.3;
        } else if (type === "GildaFly") {
            this.frameCount = 11; this.frameSpeed = 0.2;
        } else if (type === "Crizalis") {
            this.frameCount = 21; this.frameSpeed = 0.3;
        } 
        
        // --- НОВЫЕ ВРАГИ 6 УРОВНЯ ---
        else if (type === "SlaveSpell") { // Для всех вариантов
             this.frameCount = 32; this.frameSpeed = 0.3;
        } else if (type.includes("SlaveSpell")) { // Для 1, 2, 3...
             this.frameCount = 32; this.frameSpeed = 0.3;
        } else if (type === "SlaveChains") {
            this.frameCount = 11; this.frameSpeed = 0.2;
        } else if (type === "ShadowPony") {
            this.frameCount = 16; this.frameSpeed = 0.3;
        } else if (type === "Shadow") {
            this.frameCount = 16; this.frameSpeed = 0.2;
        } else if (type === "KingSombra") {
            this.frameCount = 32; this.frameSpeed = 0.3; // <--- ВОТ ТВОИ 32 КАДРА!
        } else if (type === "FakeCadence") {
            this.frameCount = 16; this.frameSpeed = 0.2;
        } else if (type === "TrueChrysalis") {
            this.frameCount = 16; this.frameSpeed = 0.3;
        } else if (type === "SombraCrystal") {
            this.frameCount = 1; this.frameSpeed = 0; // Кристалл 1 кадр
        }
    }

    update(scale = 1) {
        if (this.isFinished) return;

        // 1. СТАТИЧНЫЕ ВРАГИ (КРИСТАЛЛЫ)
        if (this.isStatic || !this.path || this.path.length === 0) {
            return; 
        }
        if (this.derpyBuffTimer > 0) {
            this.derpyBuffTimer--;
            // Если таймер кончился - снимаем эффекты
            if (this.derpyBuffTimer <= 0) {
                this.isInvulnerable = false; // Снимаем неуязвимость
                this.currentSpeed = this.baseSpeed; // Возвращаем скорость
                this.effectColor = null;
            }
        }

        // 2. ТРАНСФОРМАЦИЯ КАДЕНС
        if (this.type === 'FakeCadence' && !this.isTransforming) {
            const cfg = ENEMY_TYPES[this.type];
            // Берем координаты триггера из конфига (или дефолт 900, 575)
            const targetX = (cfg.transformTriggerX || 900) * scale;
            const targetY = (cfg.transformTriggerY || 575) * scale;
            
            const dist = Math.sqrt(Math.pow(this.x - targetX, 2) + Math.pow(this.y - targetY, 2));

            // Радиус срабатывания 30 пикселей
            if (dist < 30 * scale) {
                this.startChrysalisTransformation();
                return; 
            }
        }

        // Логика проигрывания трансформации
        if (this.isTransforming) {
            this.transformTimer++;
            // Скорость прокрутки кадров во время превращения
            this.frame += 0.2; 
            
            // Ждем 100 тиков (около 1.5 сек)
            if (this.transformTimer > 100) {
                this.finishChrysalisTransformation();
            }
            return; // Не двигаемся
        }

        if (this.stunDuration > 0) {
            this.stunDuration--; 
            return; 
        }

        // 3. ДВИЖЕНИЕ
        const target = this.path[this.pathIndex + 1];
        if (target) {
            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (this.slowDuration > 0) {
                this.currentSpeed = this.baseSpeed * 0.5;
                this.slowDuration--;
            } else {
                this.currentSpeed = this.baseSpeed;
            }

            const realSpeed = this.currentSpeed * scale; 

            if (distance < realSpeed) {
                this.x = target.x;
                this.y = target.y;
                this.pathIndex++;
            } else {
                const velocityX = (dx / distance) * realSpeed;
                const velocityY = (dy / distance) * realSpeed;
                
                if (velocityX > 0) this.lastDirection = 1; 
                else if (velocityX < 0) this.lastDirection = -1; 
                
                this.x += velocityX;
                this.y += velocityY;
                
                // ОБЫЧНАЯ АНИМАЦИЯ ХОДЬБЫ
                this.frame = (this.frame + this.frameSpeed) % this.frameCount;
            }
        } else {
            this.isFinished = true;
        }
    }

    startChrysalisTransformation() {
        console.log("Каденс начинает превращение!");
        this.isTransforming = true;
        this.transformTimer = 0;
        this.frame = 0; 
    }

    finishChrysalisTransformation() {
        console.log("Кризалис появилась!");
        this.isTransforming = false;
        
        this.type = 'TrueChrysalis';
        const cfg = ENEMY_TYPES['TrueChrysalis'];
        
        this.isStealth = false; // Башни снова её видят!
        this.maxHealth = cfg.maxHealth;
        this.currentHealth = cfg.maxHealth;
        this.baseSpeed = cfg.speed;
        this.currentSpeed = cfg.speed; 
        this.width = cfg.width;
        this.height = cfg.height;
        this.yOffset = cfg.yOffset;
        
        // ВАЖНО: Восстанавливаем frameCount для Кризалис
        this.frameCount = 16; // Или 21, как ты хочешь
        this.frameSpeed = 0.3;
        
        this.frame = 0;
    }
    
    draw(ctx, scale = 1) { 
        // --- 1. ОТРИСОВКА ПРЕВРАЩЕНИЯ ---
        if (this.isTransforming) {
            const img = enemyImages['CadenceTransform']; 
            
            if (img && img.complete) {
                // Настройки под твой спрайт (16 кадров, x128, y220)
                const totalFrames = 16; 
                // Ширина одного кадра в спрайте
                const frameW = img.width / totalFrames; 
                
                let frameIndex = Math.floor(this.frame);
                if (frameIndex >= totalFrames) frameIndex = totalFrames - 1; 

                ctx.save();
                // Смещаем точку рисования
                ctx.translate(this.x, this.y + (this.yOffset * scale) + (15 * scale));
                
                // Пропорции картинки (220 / 128 ≈ 1.7)
                // Если ширина на экране 120, то высота должна быть ~200
                const renderWidth = 140 * scale; 
                const renderHeight = 240 * scale; 

                // Рисуем с учетом новых пропорций
                // Сдвигаем на половину ширины влево и почти на полную высоту вверх (так как y - это ноги)
                ctx.drawImage(
                    img, 
                    frameIndex * frameW, 0, frameW, img.height,
                    -renderWidth / 2, -renderHeight + 40 * scale, renderWidth, renderHeight
                );
                ctx.restore();
            }
            return; 
        }

        // --- 2. ОБЫЧНАЯ ОТРИСОВКА ---
        let img;
        if (this.stunDuration > 0) img = enemyImagesStun[this.type];
        else if (this.slowDuration > 0) img = enemyImagesSlow[this.type];
        else img = enemyImages[this.type];

        if (!img || !img.complete || img.naturalWidth === 0) img = enemyImages[this.type];

        const cfg = ENEMY_TYPES[this.type];
        
        // Размеры для отрисовки
        const drawWidth = this.width * scale;
        const drawHeight = this.height * scale;
        const drawYOffset = this.yOffset * scale;

        if (img && img.complete) {
            const frameWidth = img.width / this.frameCount; 
            
            let frameX = Math.floor(this.frame) * frameWidth;
            if (frameX >= img.width) frameX = 0;

            ctx.save();
            ctx.translate(this.x, this.y + drawYOffset); 

            // Отражение по горизонтали, если идет влево (кроме статичных объектов)
            if (this.lastDirection === -1 && !this.isStatic) {
                ctx.scale(-1, 1);
            }
            
            ctx.drawImage(
                img, 
                frameX, 0, frameWidth, img.height, 
                -drawWidth / 2, -drawHeight / 2, 
                drawWidth, drawHeight
            );
            
            ctx.restore();
        } else {
            ctx.fillStyle = this.color || 'red';
            ctx.beginPath();
            ctx.arc(this.x, this.y, 15 * scale, 0, Math.PI * 2); 
            ctx.fill();
        }
        
        // --- 3. ШКАЛА ЗДОРОВЬЯ ---
        // Рисуем всем, КРОМЕ Фейк Каденс (пока она добрая)
        // Кристаллам теперь тоже рисуем!
        if (this.type !== 'FakeCadence') {
            const barWidth = 40 * scale;     
            const barHeight = 5 * scale;     
            const barOffset = 30 * scale;    

            const barX = this.x - barWidth / 2;
            let extraHeight = 0;
            // Поднимаем полоску для высоких боссов и кристаллов
            if (this.type === 'TrueChrysalis' || this.type === 'KingSombra' || this.type === 'SombraCrystal') {
                extraHeight = 25 * scale;
            }

            const barY = (this.y - barOffset - extraHeight) + drawYOffset; 

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
}