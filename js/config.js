// ✅ ПРАВИЛЬНАЯ версия для config.js
function createImage(filename) {
    const img = new Image();
    img.src = `images/${filename}`;
    return img;
}

export const TOWER_CONFIG = {
    'Пинки Пай': {
        name: 'Пинки Пай', price: 45, range: 100, damage: 3, isMelee: true, damageTickRate: 10,
        frameCount: 12, frameWidth: 112, frameSpeed: 0.8,
        description: {
            damage: "3 (x6/сек)", // Урон * (60 кадров / 10 тикрейт)
            range: 100,
            speed: "6.0/сек", // 60 / 10
            special: "Наносит урон всем врагам в радиусе атаки непрерывно."
        }
    },
    'Эппл Джек': {
        name: 'Эппл Джек', price: 65, range: 80, damage: 7, isMelee: true, damageTickRate: 10,
        frameCount: 21, frameWidth: 100, frameSpeed: 0.3,
        description: {
            damage: "7 (x6/сек)",
            range: 80,
            speed: "6.0/сек",
            special: "Надежная и сильная, наносит постоянный урон ближайшему врагу."
        }
    },
    'Твайлайт Спаркл': {
        name: 'Твайлайт Спаркл', price: 60, range: 90, damage: 5, isMelee: true, damageTickRate: 10,
        frameCount: 20, frameWidth: 102, frameSpeed: 0.2,
        description: {
            damage: "5 (x6/сек)",
            range: 90,
            speed: "6.0/сек",
            special: "Использует магию для постоянной атаки по цели."
        }
    },
    'Флаттершай': {
        name: 'Флаттершай', price: 55, range: 80, damage: 0, isMelee: true, damageTickRate: 60,
        applySlow: true, slowDuration: 180,
        frameCount: 12, frameWidth: 114, frameSpeed: 0.2,
        description: {
            damage: "0",
            range: 80,
            speed: "1.0/сек",
            special: "Её добрый взгляд сильно замедляет врагов, давая другим пони время на атаку."
        }
    },
    'Радуга Дэш': {
        name: 'Радуга Дэш', price: 80, range: 0, damage: 0, color: '#22d3ee',
        isPatrolTower: true, patrolSpeed: 4, auraDamage: 1, auraRadius: 40,
        frameCount: 16, frameWidth: 108, frameSpeed: 0.5,
        description: {
            damage: "30/сек (по области)", // 0.5 урона * 60 кадров
            range: "Весь маршрут",
            speed: "Постоянно",
            special: "Летает по заданному маршруту, нанося урон всем врагам на пути."
        }
    },
    'Рэрити': {
        name: 'Рэрити', price: 75, range: 180, damage: 25, fireRate: 150, color: '#a855f7',
        isSniper: true,
        dramaMeterMax: 250, dramaFillRadius: 90, dramaFillRate: 0.5,
        ultStunDuration: 200, ultRadius: 150,
        attackFrameCount: 20, attackFrameWidth: 108, attackFrameSpeed: 0.5,
        ultFrameCount: 25, ultFrameWidth: 70, ultFrameSpeed: 0.2,
        description: {
            damage: 25,
            range: 180,
            speed: "0.4/сек", // 60 кадров / 150 перезарядка
            special: "Снайпер. Когда враги подходят слишком близко, впадает в истерику и оглушает всех вокруг."
        }
    },
};

        export const towerImages = {
    'Пинки Пай':          createImage('пинки стоит.png'),
    'Пинки Пай Атака':    createImage('пинки.png'),
    'Эппл Джек':          createImage('эпл стоит.png'),
    'Эппл Джек Атака':    createImage('ЭплДрака.png'),
    'Твайлайт Спаркл':    createImage('Тстоит.png'),
    'Твайлайт Спаркл Атака': createImage('ТвайЛайтАтака.png'),
    'Флаттершай':         createImage('Флат_стоит.png'),
    'Флаттершай Атака':   createImage('Флат_атака.png'),
    'Радуга Дэш':         createImage('РадугаСтоит.png'),
    'Радуга Дэш Атака':   createImage('РадугаАтака.png'),
    'Рэрити':             createImage('РаритиСтоит.png'),
    'Рэрити Атака':       createImage('РаритиАтака.png'),
    'Рэрити Ульта':       createImage('РаритиУльта.png'),
};






        export const ENEMY_TYPES = {
        Grunt: {
            name: "Обычный",
            color: "red",
            speed: 1.5,
            maxHealth: 20,
            bounty: 5,
            width: 44,
            height: 57,
        },
        

        Mom: {
        name: "Spoiled Rich",
        color: "purple",
        speed: 1.2,
        maxHealth: 50,
        bounty: 10,
        width: 60, // Ширина отображения (больше, чем 564/8=70.5)
        height: 70, // Высота отображения
        frameWidth: 74,
        },

        Spoon: {
        name: "Silver Spoon",
        color: "white",
        speed: 1.5,
        maxHealth: 20,
        bounty: 5,
        width: 51.8, // Ширина отображения (больше, чем 564/8=70.5)
        height: 57, // Высота отображения
        frameWidth: 68.9,
        },
        
        Snail: {
        name: "Snail",
        color: "orange",
        speed: 1,
        maxHealth: 15,
        bounty: 5,
        width: 55.7, // Ширина отображения (больше, чем 564/8=70.5)
        height: 74, // Высота отображения
        frameWidth: 70.7,
        },

        Snip: {
        name: "Snip",
        color: "turquoise",
        speed: 1,
        maxHealth: 15,
        bounty: 5,
        width: 56, // Ширина отображения (больше, чем 564/8=70.5)
        height: 56, // Высота отображения
        frameWidth: 66,
        },

        BabsSeed: {
        name: "BabsSeed",
        color: "turquoise",
        speed: 2,
        maxHealth: 40,
        bounty: 7,
        width: 52, // Ширина отображения (больше, чем 564/8=70.5)
        height: 64, // Высота отображения
        frameWidth: 62,
        },

        Trixie: {
        name: "Trixie",
        color: "turquoise",
        speed: 2,
        maxHealth: 700,
        bounty: 250,
        width: 79.1255, // Ширина отображения (больше, чем 564/8=70.5)
        height: 89, // Высота отображения
        frameWidth: 104.125,
        },

        PrinceBlueblood: {
            name: "PrinceBlueblood",
            color: "blue",
            speed: 1.5,
            maxHealth: 55, // Чуть сильнее "Grunt"
            bounty: 7,
            width: 74, 
            height: 92, 
            frameWidth: 94, // (Подбери под свой спрайт)
        },
        
        Hoops: {
            name: "Hoops",
            color: "green",
            speed: 2.5, // Быстрый
            maxHealth: 50, // Но хрупкий
            bounty: 6,
            width: 85, 
            height: 83, 
            frameWidth: 110, // (Подбери под свой спрайт)
        },

        Stronghoof: {
            name: "Stronghoof",
            color: "grey",
            speed: 0.8, // Очень медленный
            maxHealth: 300, // Но очень крепкий
            bounty: 20,
            width: 84, 
            height: 122, 
            frameWidth: 104, // (Подбери под свой спрайт)
            yOffset: -10
        },

        Score: {
            name: "Score",
            color: "grey",
            speed: 2, // Очень медленный
            maxHealth: 50, // Но очень крепкий
            bounty: 7,
            width: 72, 
            height: 80, 
            frameWidth: 82, // (Подбери под свой спрайт)
            yOffset: -10
        },

        Bell: {
            name: "Bell",
            color: "brown",
            speed: 1.5, // Очень медленный
            maxHealth: 50, // Но очень крепкий
            bounty: 6,
            width: 74, 
            height: 86, 
            frameWidth: 84, // (Подбери под свой спрайт)
            yOffset: -10
        },

        Flam: {
            name: "Flam",
            color: "yellow",
            speed: 1.5, // Очень медленный
            maxHealth: 60, // Но очень крепкий
            bounty: 10,
            width: 80, 
            height: 100, 
            frameWidth: 90, // (Подбери под свой спрайт)
            yOffset: -10
        },
        
        ShadowBolts: {
            name: "ShadowBolts",
            color: "blue",
            speed: 5,
            maxHealth: 60,
            bounty: 10,
            width: 92, 
            height: 76, 
            frameWidth: 112, // (Подбери под свой спрайт)
            yOffset: -10
        },
        
        ShadowBolts2: {
            name: "ShadowBolts2",
            color: "dark blue",
            speed: 5, // Очень медленный
            maxHealth: 60, // Но очень крепкий
            bounty: 10,
            width: 94, 
            height: 76, 
            frameWidth: 114, // (Подбери под свой спрайт)
            yOffset: -10
        },
        
        Flim: {
            name: "Flim",
            color: "yellow",
            speed: 1.5, // Очень медленный
            maxHealth: 60, // Но очень крепкий
            bounty: 10,
            width: 74, 
            height: 100, 
            frameWidth: 84, // (Подбери под свой спрайт)
            yOffset: -10
        },

        Siren1: {
            name: "Siren1",
            color: "yellow",
            speed: 2, // Очень медленный
            maxHealth: 1500, // Но очень крепкий
            bounty: 100,
            width: 160, 
            height: 242, 
            frameWidth: 160, // (Подбери под свой спрайт)
            yOffset: -10
        },

        Siren2: {
            name: "Siren2",
            color: "yellow",
            speed: 2, // Очень медленный
            maxHealth: 1500, // Но очень крепкий
            bounty: 100,
            width: 160, 
            height: 242, 
            frameWidth: 160, // (Подбери под свой спрайт)
            yOffset: -10
        },

        Siren3: {
            name: "Siren3",
            color: "yellow",
            speed: 2, // Очень медленный
            maxHealth: 1500, // Но очень крепкий
            bounty: 100,
            width: 160, 
            height: 242, 
            frameWidth: 160, // (Подбери под свой спрайт)
            yOffset: -10
        },

        SirenP1: {
            name: "SirenP1",
            color: "yellow",
            speed: 2, // Очень медленный
            maxHealth: 1000, // Но очень крепкий
            bounty: 80,
            width: 70, 
            height: 74, 
            frameWidth: 90, // (Подбери под свой спрайт)
            yOffset: -10
        },

        SirenP2: {
            name: "SirenP2",
            color: "yellow",
            speed: 2, // Очень медленный
            maxHealth: 1000, // Но очень крепкий
            bounty: 80,
            width: 70, 
            height: 74, 
            frameWidth: 90, // (Подбери под свой спрайт)
            yOffset: -10
        },

        SirenP3: {
            name: "SirenP3",
            color: "yellow",
            speed: 2, // Очень медленный
            maxHealth: 1000, // Но очень крепкий
            bounty: 80,
            width: 70, 
            height: 74, 
            frameWidth: 90, // (Подбери под свой спрайт)
            yOffset: -10
        },

        Suri: {
            name: "Suri",
            color: "pink",
            speed: 2, // Очень медленный
            maxHealth: 50, // Но очень крепкий
            bounty: 5,
            width: 92, 
            height: 80, 
            frameWidth: 112, // (Подбери под свой спрайт)
            yOffset: -10
        },

        LightningDust: {
            name: "LightningDust",
            color: "pink",
            speed: 6.5, // Очень медленный
            maxHealth: 50, // Но очень крепкий
            bounty: 10,
            width: 102, 
            height: 80, 
            frameWidth: 122, // (Подбери под свой спрайт)
            yOffset: -10
        },

        Gilda: {
            name: "Gilda",
            color: "pink",
            speed: 2.5, // Очень медленный
            maxHealth: 65, // Но очень крепкий
            bounty: 5,
            width: 112, 
            height: 80, 
            frameWidth: 132, // (Подбери под свой спрайт)
            yOffset: -10
        },

        Stariy: {
            name: "Stariy",
            color: "pink",
            speed: 1.5, // Очень медленный
            maxHealth: 85, // Но очень крепкий
            bounty: 7,
            width: 110, 
            height: 82, 
            frameWidth: 130, // (Подбери под свой спрайт)
            yOffset: -10
        },

        Doctor: {
            name: "Doctor",
            color: "brown",
            speed: 2, // Очень медленный
            maxHealth: 100, // Но очень крепкий
            bounty: 15,
            width: 96, 
            height: 86, 
            frameWidth: 106, // (Подбери под свой спрайт)
            yOffset: -10
        },

        Perviy: {
            name: "Perviy",
            color: "brown",
            speed: 2, // Очень медленный
            maxHealth: 90, // Но очень крепкий
            bounty: 10,
            width: 96, 
            height: 86, 
            frameWidth: 106, // (Подбери под свой спрайт)
            yOffset: -10
        },

        Vtoroy: {
            name: "Vtoroy",
            color: "brown",
            speed: 2, // Очень медленный
            maxHealth: 90, // Но очень крепкий
            bounty: 10,
            width: 96, 
            height: 86, 
            frameWidth: 106, // (Подбери под свой спрайт) 
            yOffset: -10
        },

        Tretiy: {
            name: "Tretiy",
            color: "brown",
            speed: 2, // Очень медленный
            maxHealth: 90, // Но очень крепкий
            bounty: 10,
            width: 96, 
            height: 86, 
            frameWidth: 106, // (Подбери под свой спрайт)
            yOffset: -10
        },

        SfinksWalk: {
            name: "SfinksWalk",
            color: "brown",
            speed: 2, // Очень медленный
            maxHealth: 1500, // Но очень крепкий
            bounty: 120,
            width: 224, 
            height: 244, 
            frameWidth: 244, // (Подбери под свой спрайт)
            yOffset: -10
        },

        SfinksFky: {
            name: "SfinksFky",
            color: "brown",
            speed: 3, // Очень медленный
            maxHealth: 2000, // Но очень крепкий
            bounty: 200,
            width: 224, 
            height: 244, 
            frameWidth: 244, // (Подбери под свой спрайт)
            yOffset: -10
        },

        Achel: {
            name: "Achel",
            color: "brown",
            speed: 2.5, // Очень медленный
            maxHealth: 1900, // Но очень крепкий
            bounty: 180,
            width: 170, 
            height: 132, 
            frameWidth: 190, // (Подбери под свой спрайт)
            yOffset: -10
        },
        
    };


    // --- Изображения Врагов ---
 export const enemyImages = {
    Grunt:           createImage("тиара.png"),
    Tank:            createImage("пони.png"),
    Fast:            createImage("ТВ2.png"),
    Mom:             createImage("мать т2.png"),
    Spoon:           createImage("ложка.png"),
    Snail:           createImage("снил.png"),
    Snip:            createImage("Снип.png"),
    BabsSeed:        createImage("Бэтс.png"),
    Trixie:          createImage("Трикси.png"),
    PrinceBlueblood: createImage("принц.png"),
    Hoops:           createImage("Хул2.png"),
    Stronghoof:      createImage("Бык.png"),
    Score:           createImage("Хул3.png"),
    Bell:            createImage("Хул1.png"),
    ShadowBolts:     createImage("Злая_Молния.png"),
    Flim:            createImage("Флим.png"),
    Flam:            createImage("Флэм.png"),
    ShadowBolts2:    createImage("Злой_Мол.png"),
    Siren1:          createImage("Сир1.png"),
    Siren2:          createImage("Сир2.png"),
    Siren3:          createImage("Сир3.png"),
    SirenP1:         createImage("ПерваяС.png"),
    SirenP2:         createImage("ВтораяС.png"),
    SirenP3:         createImage("ТретьяС.png"),
    Suri:            createImage("Сури.png"),
    Gilda:           createImage("ГилдаИдёт.png"),
    LightningDust:   createImage("ЛайтнингДаст.png"),
    Doctor:          createImage("ДокторК.png"),
    Stariy:          createImage("Старый.png"),
    Perviy:          createImage("1Пон.png"),
    Vtoroy:          createImage("2Пон.png"),
    Tretiy:          createImage("3Пон.png"),
    SfinksWalk:      createImage("СфинксИдёт.png"),
    SfinksFky:       createImage("СфинксЛетит.png"),
    Achel:           createImage("Ачел.png"),
};


         export const path = [
            { x: 0, y: 660 },   // Точка 0: Начало
            { x: 850, y: 660},  // Точка 1
            { x: 850, y: 190 }, // Точка 2
            { x: 230, y: 190 }, // Точка 3
            { x: 230, y: 540 }, // Точка 4
            { x: 750, y: 540 }, // Точка 5
            { x: 750, y: 300 }, // Точка 6
            { x: 340, y: 300 }, // Точка 7
            { x: 340, y: 420 }, // Точка 8
            { x: 1040, y: 420 },  // Точка 9: Финиш
            { x: 1040, y: 545 }, // Точка 9: Финиш
            { x: 1300, y: 545 }  // Точка 9: Финиш

            
        ];
        // Сдвигаем путь вверх на 5 пикселей
        path.forEach(p => p.y -= 10);
 

        // Обновленные точки, расположенные по контуру тропинки
        export const buildSlots = [
            // Ваши исходные слоты...
            { x: 20, y: 720, occupied: false }, { x: 80, y: 720, occupied: false },
            { x: 140, y: 720, occupied: false }, { x: 200, y: 720, occupied: false },
            { x: 260, y: 720, occupied: false }, { x: 320, y: 720, occupied: false },
            { x: 380, y: 720, occupied: false }, { x: 440, y: 720, occupied: false },
            { x: 500, y: 720, occupied: false }, { x: 560, y: 720, occupied: false },
            { x: 740, y: 720, occupied: false },
            { x: 800, y: 720, occupied: false },
            { x: 860, y: 720, occupied: false },
            { x: 920, y: 720, occupied: false },


            { x: 920, y: 660, occupied: false },
            { x: 920, y: 600, occupied: false },
            { x: 920, y: 540, occupied: false },
            { x: 920, y: 480, occupied: false },

            { x: 980, y: 660, occupied: false },
            { x: 980, y: 600, occupied: false },
            { x: 980, y: 540, occupied: false },
            { x: 980, y: 480, occupied: false },
            { x: 980, y: 720, occupied: false },

            { x: 1040, y: 600, occupied: false },
            { x: 1100, y: 600, occupied: false },
            { x: 1160, y: 600, occupied: false },
            { x: 1220, y: 600, occupied: false },

            { x: 1040, y: 660, occupied: false },
            { x: 1100, y: 660, occupied: false },
            { x: 1160, y: 660, occupied: false },

            { x: 1040, y: 710, occupied: false },
            { x: 1100, y: 710, occupied: false },
            { x: 1160, y: 710, occupied: false },

            { x: 1100, y: 480, occupied: false },   { x: 1100, y: 420, occupied: false },
            { x: 1160, y: 480, occupied: false },
            { x: 1220, y: 480, occupied: false },


            { x: 800, y: 600, occupied: false },    { x: 800, y: 540, occupied: false },                                            { x: 670, y: 480, occupied: false },
            { x: 740, y: 600, occupied: false },    { x: 800, y: 480, occupied: false },                                            { x: 610, y: 480, occupied: false },
            { x: 680, y: 600, occupied: false },    { x: 800, y: 370, occupied: false },    { x: 665, y: 370, occupied: false },    { x: 550, y: 480, occupied: false },
            { x: 620, y: 600, occupied: false },    { x: 800, y: 310, occupied: false },    { x: 605, y: 370, occupied: false },    { x: 490, y: 480, occupied: false },
            { x: 560, y: 600, occupied: false },    { x: 800, y: 250, occupied: false },    { x: 545, y: 370, occupied: false },    { x: 430, y: 480, occupied: false },
            { x: 500, y: 600, occupied: false },                                            { x: 485, y: 370, occupied: false },    { x: 370, y: 480, occupied: false },
            { x: 440, y: 600, occupied: false },                                            { x: 425, y: 370, occupied: false },    { x: 310, y: 480, occupied: false },
            { x: 380, y: 600, occupied: false },
            { x: 320, y: 600, occupied: false },
            { x: 260, y: 600, occupied: false },
            { x: 200, y: 600, occupied: false },
            { x: 140, y: 600, occupied: false },
            { x: 80, y: 600, occupied: false },


            { x: 730, y: 250, occupied: false },
            { x: 670, y: 250, occupied: false },
            { x: 610, y: 250, occupied: false },
            { x: 550, y: 250, occupied: false },
            { x: 490, y: 250, occupied: false },
            { x: 430, y: 250, occupied: false },
            { x: 370, y: 250, occupied: false },
            { x: 310, y: 250, occupied: false },



            { x: 290, y: 305, occupied: false },
            { x: 290, y: 365, occupied: false },
            { x: 290, y: 425, occupied: false },


            { x: 170, y: 125, occupied: false },        { x: 230, y: 125, occupied: false },
            { x: 170, y: 185, occupied: false },        { x: 290, y: 125, occupied: false },
            { x: 170, y: 245, occupied: false },        { x: 350, y: 125, occupied: false },
            { x: 170, y: 305, occupied: false },        { x: 410, y: 125, occupied: false },
            { x: 170, y: 365, occupied: false },        { x: 470, y: 125, occupied: false },
            { x: 170, y: 425, occupied: false },        { x: 530, y: 125, occupied: false },
            { x: 170, y: 485, occupied: false },        { x: 590, y: 125, occupied: false },
            { x: 170, y: 545, occupied: false },        { x: 650, y: 125, occupied: false },
                                                        { x: 710, y: 125, occupied: false },
                                                        { x: 770, y: 125, occupied: false },                                                        
                                                        { x: 830, y: 125, occupied: false },
                                                        { x: 890, y: 125, occupied: false },                                                       
            { x: 110, y: 125, occupied: false },        { x: 950, y: 125, occupied: false },
            { x: 110, y: 185, occupied: false },        { x: 1010, y: 125, occupied: false },
            { x: 110, y: 245, occupied: false },        { x: 1060, y: 125, occupied: false },
            { x: 110, y: 305, occupied: false },
            { x: 110, y: 365, occupied: false },
            { x: 110, y: 425, occupied: false },
            { x: 110, y: 485, occupied: false },
            { x: 110, y: 545, occupied: false },


            { x: 620, y: 720, occupied: false },
            { x: 680, y: 720, occupied: false },


            { x: 910, y: 185, occupied: false },    
            { x: 910, y: 245, occupied: false },
            { x: 910, y: 305, occupied: false },
            { x: 910, y: 365, occupied: false },

            { x: 970, y: 185, occupied: false },    
            { x: 970, y: 245, occupied: false },
            { x: 970, y: 305, occupied: false },
            { x: 970, y: 365, occupied: false },

            { x: 1030, y: 185, occupied: false },    
            { x: 1030, y: 245, occupied: false },
            { x: 1030, y: 305, occupied: false },
            { x: 1030, y: 365, occupied: false },

            { x: 1090, y: 185, occupied: false },    
            { x: 1090, y: 245, occupied: false },
            { x: 1090, y: 305, occupied: false },
            { x: 1090, y: 365, occupied: false },

        ];


        export const SELL_REFUND_PERCENTAGE = 0.75;
        export const ENEMY_INTERVAL_MS = 500;
        export const PAUSE_BETWEEN_GROUPS_MS = 1000;
        export const BUILD_SLOT_SIZE = 55;
        export const originalWidth = 1280;
        export const originalHeight = 845;



        // --- КОНФИГУРАЦИЯ И НАСТРОЙКА ---
        
        export const backgroundImage = createImage('background.jpg');


        export const LEVELS_CONFIG = {
                    
                    // --- УРОВЕНЬ 1 (Твои старые волны) ---
                    1: [
                        {
                            name: "Первая волна",
                            enemies: [
                                //ShadowBolts Bell  Score
                                { type: "Grunt", count: 5, interval: 500 },
                        
                            ]
                        },
                        {
                            name: "Вторая волна",
                            enemies: [
                                { type: "Grunt", count: 4, interval: 600 },
                                { type: "Spoon", count: 4, interval: 900 },
                            ]
                        },
                        {
                            name: "Третья волна",
                            enemies: [
                                { type: "Snail", count: 5, interval: 1000 },
                                { type: "Snip", count: 5, interval: 500 },
                            ]
                        },
                        {
                            name: "Четвёртая волна",
                            enemies: [
                                { type: "Grunt", count: 5, interval: 700 },
                                { type: "Spoon", count: 2, interval: 900 },
                                { type: "Snail", count: 2, interval: 1100 },
                                { type: "Snip", count: 2, interval: 1300 },
                            ]
                        },
                        {
                            name: "Пятая волна",
                            enemies: [
                                { type: "Mom", count: 2, interval: 900 },
                                { type: "Grunt", count: 5, interval: 700 },
                            ]
                        },
                        {
                            name: "Шестая волна",
                            enemies: [
                                { type: "Mom", count: 2, interval: 900 },
                                { type: "Grunt", count: 5, interval: 700 },
                                { type: "Spoon", count: 2, interval: 500 },
                            ]
                        },
                        {
                            name: "Седьмая волна",
                            enemies: [
                                { type: "BabsSeed", count: 5, interval: 900 },
                                { type: "Grunt", count: 5, interval: 700 },
                                { type: "Spoon", count: 5, interval: 500 },
                            ]
                        },
                        {
                            name: "Восьмая волна",
                            enemies: [
                                { type: "Mom", count: 5, interval: 1000 },
                                { type: "Grunt", count: 5, interval: 700 },
                                { type: "Spoon", count: 5, interval: 1300 },
                                { type: "Snail", count: 5, interval: 1500 },
                                { type: "Snip", count: 5, interval: 500 },
                            ]
                        },
                        {
                            name: "Девятая волна",
                            enemies: [
                                { type: "Mom", count: 2, interval: 1000 },
                                { type: "Grunt", count: 5, interval: 700 },
                                { type: "Spoon", count: 5, interval: 1200 },
                                { type: "Snail", count: 5, interval: 500 },
                                { type: "Snip", count: 5, interval: 900 },
                                { type: "BabsSeed", count: 5, interval: 1500 },
                            ]
                        },
                        {
                            name: "Десятая волна (Босс)",
                            enemies: [
                                { type: "Trixie", count: 1, interval: 1000 },
                            ]
                        }
                    ],
        
                    // --- УРОВЕНЬ 2 (Твои новые враги) ---
                    2: [
                        {
                            name: "Хулиганы1",
                            enemies: [
                                { type: "Score", count: 7, interval: 700 },
                            ]
                        },
                        {
                            name: "Хулиганы2",
                            enemies: [
                                { type: "Flim", count: 5, interval: 400 },
                                { type: "Flam", count: 5, interval: 800 },
                            ]
                        },
                        {
                            name: "Тяжелая сила",
                            enemies: [
                                { type: "Stronghoof", count: 3, interval: 2000 },
                            ]
                        },
                        {
                            name: "Смешанная группа",
                            enemies: [
                                { type: "PrinceBlueblood", count: 10, interval: 600 },
                                { type: "Bell", count: 10, interval: 500 },
                            ]
                        },
                        {
                            name: "Стена",
                            enemies: [
                                { type: "Stronghoof", count: 5, interval: 1500 },
                                { type: "PrinceBlueblood", count: 5, interval: 1000 },
                                { type: "Flim", count: 5, interval: 400 },
                                { type: "Flam", count: 5, interval: 800 },
                            ]
                        },
                        {
                            name: "Скорость!",
                            enemies: [
                                { type: "ShadowBolts", count: 5, interval: 300 },
                                { type: "ShadowBolts2", count: 5, interval: 100 },
                            ]
                        },
                        {
                            name: "Все вместе",
                            enemies: [
                                { type: "Score", count: 10, interval: 100 },
                                { type: "Hoops", count: 10, interval: 300 },
                                { type: "Bell", count: 2, interval: 500 },
                            ]
                        },
                        {
                            name: "Большие проблемы",
                            enemies: [
                                { type: "ShadowBolts", count: 10, interval: 300 },
                                { type: "ShadowBolts2", count: 10, interval: 100 },
                                { type: "Stronghoof", count: 5, interval: 1500 },
                                { type: "PrinceBlueblood", count: 15, interval: 500 },
                            ]
                        },
                        {
                            name: "Сирены пони",
                            enemies: [
                                { type: "SirenP1", count: 1, interval: 500 },
                                { type: "SirenP2", count: 1, interval: 300 },
                                { type: "SirenP3", count: 1, interval: 100 },
                            ]
                        },
                        {
                            name: "Финал (Босс)",
                            enemies: [
                                { type: "Siren1", count: 1, interval: 1000 },
                                { type: "Siren2", count: 1, interval: 500 },
                                { type: "Siren3", count: 1, interval: 100 },
                            ]
                        }
                    ],
        
                    3: [
                        {
                            //Vtoroy Tretiy SfinksWalk SfinksFky Achel
                            name: "Хулиганы1",
                            enemies: [
                                { type: "Suri", count: 15, interval: 700 },
                            ]
                        },
                        {
                            name: "Хулиганы2",
                            enemies: [
                                { type: "Gilda", count: 10, interval: 400 },
                                { type: "Suri", count: 10, interval: 800 },
                            ]
                        },
                        {
                            name: "Тяжелая сила",
                            enemies: [
                                { type: "LightningDust", count: 8, interval: 300 },
                            ]
                        },
                        {
                            name: "Смешанная группа",
                            enemies: [
                                { type: "Doctor", count: 10, interval: 600 },
                                { type: "Stariy", count: 10, interval: 500 },
                        
                            ]
                        },
                        {
                            name: "Стена",
                            enemies: [
                                { type: "Doctor", count: 5, interval: 1500 },
                                { type: "Perviy", count: 5, interval: 1000 },
                                { type: "Vtoroy", count: 5, interval: 400 },
                                { type: "Tretiy", count: 5, interval: 800 },
                            ]
                        },
                        {
                            name: "Скорость!",
                            enemies: [
                                { type: "Gilda", count: 10, interval: 300 },
                                { type: "Stariy", count: 10, interval: 500 },
                            ]
                        },
                        {
                            name: "Все вместе",
                            enemies: [
                                { type: "LightningDust", count: 10, interval: 100 },
                                { type: "Gilda", count: 15, interval: 400 },
                                { type: "Suri", count: 15, interval: 800 },
                                { type: "Stariy", count: 10, interval: 500 },
                            ]
                        },
                        {
                            name: "Большие проблемы",
                            enemies: [
                                { type: "Doctor", count: 5, interval: 1500 },
                                { type: "Perviy", count: 5, interval: 1000 },
                                { type: "Vtoroy", count: 5, interval: 400 },
                                { type: "Tretiy", count: 5, interval: 800 },
                                { type: "LightningDust", count: 10, interval: 100 },
                                { type: "Gilda", count: 10, interval: 400 },
                                { type: "Suri", count: 10, interval: 800 },
                            ]
                        },
                        {
                            name: "Сирены пони",
                            enemies: [
                            
                                { type: "SfinksWalk", count: 1, interval: 100 },
                            ]
                        },
                        {
                            name: "Финал (Босс)",
                            enemies: [
                                { type: "Achel", count: 1, interval: 1000 },
                                { type: "SfinksFky", count: 1, interval: 500 },
                            ]
                        }
                    ]
                };

                // --- МУЗЫКА И ЗВУКИ ---
export const backgroundMusic = new Audio('audio/Pony Up.mp3');
backgroundMusic.loop = true;      // Зацикливаем музыку

backgroundMusic.volume = 0.4;     // Устанавливаем громкость (от 0.0 до 1.0)

