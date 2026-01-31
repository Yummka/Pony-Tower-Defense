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
    'Пинки Пай Сон':      createImage('ПС.png'),
    'Эппл Джек Сон':      createImage('ЭС.png'),
    'Твайлайт Спаркл Сон': createImage('ТС.png'),
    'Флаттершай Сон':     createImage('ФС.png'),
    'Радуга Дэш Сон':     createImage('РадС.png'),
    'Рэрити Сон':         createImage('РарС.png'),
};






        export const ENEMY_TYPES = {
        Grunt: {
            name: "Обычный",
            color: "red",
            speed: 1.5,
            maxHealth: 20,
            bounty: 5,
            width: 56,
            height: 68,
            frameWidth: 76,
            hitboxRadius: 25,
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
        hitboxRadius: 25,
        },

        Spoon: {
        name: "Silver Spoon",
        color: "white",
        speed: 1.5,
        maxHealth: 20,
        bounty: 5,
        width: 56, // Ширина отображения (больше, чем 564/8=70.5)
        height: 56, // Высота отображения
        frameWidth: 76,
        hitboxRadius: 25,
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
        hitboxRadius: 25,
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
        hitboxRadius: 25,
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
        hitboxRadius: 25,
        },

        Trixie: {
        name: "Trixie",
        color: "turquoise",
        speed: 2,
        maxHealth: 700,
        bounty: 250,
        width: 80, // Ширина отображения (больше, чем 564/8=70.5)
        height: 94, // Высота отображения
        frameWidth: 104,
        hitboxRadius: 25,
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
            hitboxRadius: 25,
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
            hitboxRadius: 25,
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
            yOffset: -10,
            hitboxRadius: 25,
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
            yOffset: -10,
            hitboxRadius: 25,
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
            yOffset: -10,
            hitboxRadius: 25,
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
            yOffset: -10,
            hitboxRadius: 25,
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
            yOffset: -10,
            hitboxRadius: 25,
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
            yOffset: -10,
            hitboxRadius: 25,
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
            yOffset: -10,
            hitboxRadius: 25,
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
            yOffset: -10,
            hitboxRadius: 35,
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
            yOffset: -10,
            hitboxRadius: 35,
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
            yOffset: -10,
            hitboxRadius: 35,
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
            yOffset: -10,
            hitboxRadius: 25,
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
            yOffset: -10,
            hitboxRadius: 25,
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
            yOffset: -10,
            hitboxRadius: 25,
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
            yOffset: -10,
            hitboxRadius: 25,
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
            yOffset: -10,
            hitboxRadius: 25,
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
            yOffset: -10,
            hitboxRadius: 25,
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
            yOffset: -10,
            hitboxRadius: 25,
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
            yOffset: -10,
            hitboxRadius: 25,
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
            yOffset: -10,
            hitboxRadius: 25,
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
            yOffset: -10,
            hitboxRadius: 25,
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
            yOffset: -10,
            hitboxRadius: 25,
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
            yOffset: -10,
            hitboxRadius: 25,
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
            yOffset: -10,
            hitboxRadius: 35,
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
            yOffset: -10,
            hitboxRadius: 35,
        },

        Knight: {
            name: "Knight",
            color: "dark blue",
            speed: 2, // Очень медленный
            maxHealth: 130, // Но очень крепкий
            bounty: 15,
            width: 88, 
            height: 78, 
            frameWidth: 108, // (Подбери под свой спрайт)
            yOffset: -10,
            hitboxRadius: 25,
        },

        KnightFly: {
            name: "KnightFly",
            color: "dark blue",
            speed: 2.5, // Очень медленный
            maxHealth: 130, // Но очень крепкий
            bounty: 15,
            width: 88, 
            height: 78, 
            frameWidth: 108, // (Подбери под свой спрайт)
            yOffset: -10,
            hitboxRadius: 25,
        },

        FlatWalk: {
            name: "FlatWalk",
            color: "dark pink",
            speed: 2, // Очень медленный
            maxHealth: 100, // Но очень крепкий
            bounty: 10,
            width: 92, 
            height: 82, 
            frameWidth: 112, // (Подбери под свой спрайт)
            yOffset: -10,
            hitboxRadius: 25,
        },

        FlatFly: {
            name: "FlatFly",
            color: "dark pink",
            speed: 2.5, // Очень медленный
            maxHealth: 100, // Но очень крепкий
            bounty: 10,
            width: 94, 
            height: 76, 
            frameWidth: 114, // (Подбери под свой спрайт)
            yOffset: -10,
            hitboxRadius: 25,
        },

        ZBats: {
            name: "ZBats",
            color: "dark pink",
            speed: 3, // Очень медленный
            maxHealth: 30, // Но очень крепкий
            bounty: 3,
            width: 110, 
            height: 98, 
            frameWidth: 130, // (Подбери под свой спрайт)
            yOffset: -10,
            hitboxRadius: 25,
        },

        KBats: {
            name: "KBats",
            color: "dark pink",
            speed: 3, // Очень медленный
            maxHealth: 30, // Но очень крепкий
            bounty: 3,
            width: 110, 
            height: 98, 
            frameWidth: 130, // (Подбери под свой спрайт)
            yOffset: -10,
            hitboxRadius: 25,
        },

        Wolf: {
            name: "Wolf",
            color: "brow",
            speed: 5, // Очень медленный
            maxHealth: 250, // Но очень крепкий
            bounty: 3,
            width: 311, 
            height: 149, 
            frameWidth: 411, // (Подбери под свой спрайт)
            yOffset: -10,
            hitboxRadius: 35,
        },

        NightmareMoon: {
            name: "NightmareMoon",
            color: "blue",
            speed: 1,
            maxHealth: 4000,
            bounty: 300,
            width: 168, 
            height: 126, 
            frameWidth: 178,
            yOffset: -10,
            hitboxRadius: 35,
        },
        
        
        
    };


    // --- Изображения Врагов ---
 export const enemyImages = {
    Grunt:           createImage("ТиараН.png"),
    Tank:            createImage("пони.png"),
    Fast:            createImage("ТВ2.png"),
    Mom:             createImage("мать т2.png"),
    Spoon:           createImage("ЛожкаН.png"),
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
    Knight:          createImage("СтражИдёт.png"),
    KnightFly:       createImage("СтражЛетит.png"),
    FlatWalk:        createImage("ФлатБэтИдёт.png"),
    FlatFly:         createImage("ФлатБэтЛетит.png"),
    ZBats:           createImage("ЗМыши.png"),
    KBats:           createImage("КМыши.png"),
    Wolf:            createImage("ВОЛК2.png"),
    NightmareMoon:   createImage("НайтмерМун.png"),
};


         export const path = [
            { x: 0, y: 830 },   // Точка 0: Начало
            { x: 1000, y: 830},  // Точка 1
            { x: 1000, y: 220 }, // Точка 2
            { x: 260, y: 220 }, // Точка 3
            { x: 260, y: 680 }, // Точка 4
            { x: 800, y: 680 }, // Точка 5
            { x: 800, y: 370 }, // Точка 6
            { x: 400, y: 370 }, // Точка 7
            { x: 400, y: 520 }, // Точка 8
            { x: 1250, y: 520 },  // Точка 9: Финиш
            { x: 1250, y: 620 }, // Точка 9: Финиш
            { x: 1536, y: 620 }  // Точка 9: Финиш

            
        ];
        // Сдвигаем путь вверх на 5 пикселей
        path.forEach(p => p.y -= 10);
 

        // Обновленные точки, расположенные по контуру тропинки
        export const buildSlots = [
            // Ваши исходные слоты...
            { x: 29, y: 900, occupied: false }, { x: 79, y: 900, occupied: false },
            { x: 129, y: 900, occupied: false }, { x: 179, y: 900, occupied: false },
            { x: 229, y: 900, occupied: false }, { x: 279, y: 900, occupied: false },
            { x: 329, y: 900, occupied: false }, { x: 379, y: 900, occupied: false },
            { x: 429, y: 900, occupied: false }, { x: 479, y: 900, occupied: false },       //нижний ряд
            { x: 529, y: 900, occupied: false },
            { x: 579, y: 900, occupied: false },
            { x: 629, y: 900, occupied: false },
            { x: 679, y: 900, occupied: false },
            { x: 729, y: 900, occupied: false },
            { x: 779, y: 900, occupied: false },
            { x: 829, y: 900, occupied: false },
            { x: 879, y: 900, occupied: false },
            { x: 929, y: 900, occupied: false },
            { x: 979, y: 900, occupied: false },
            { x: 1029, y: 900, occupied: false },
            { x: 1079, y: 900, occupied: false },

            { x: 179, y: 750, occupied: false },
            { x: 229, y: 750, occupied: false }, { x: 279, y: 750, occupied: false },
            { x: 329, y: 750, occupied: false }, { x: 379, y: 750, occupied: false },
            { x: 429, y: 750, occupied: false }, { x: 479, y: 750, occupied: false },
            { x: 529, y: 750, occupied: false },
            { x: 579, y: 750, occupied: false },
            { x: 629, y: 750, occupied: false },
            { x: 679, y: 750, occupied: false },
            { x: 729, y: 750, occupied: false },                        //ряд выше нижней дроги
            { x: 779, y: 750, occupied: false },
            { x: 829, y: 750, occupied: false },
            { x: 879, y: 750, occupied: false },
            { x: 929, y: 750, occupied: false },


            { x: 879, y: 700, occupied: false },
            { x: 929, y: 650, occupied: false },                //столб Справа между дорогами
            { x: 879, y: 650, occupied: false },
            { x: 929, y: 700, occupied: false },
            { x: 929, y: 600, occupied: false },
            { x: 879, y: 600, occupied: false },


            { x: 879, y: 350, occupied: false },
            { x: 929, y: 450, occupied: false },                //столб чуть выше Справа между дорогами
            { x: 879, y: 450, occupied: false },
            { x: 929, y: 350, occupied: false },
            { x: 929, y: 400, occupied: false },
            { x: 879, y: 400, occupied: false },
            { x: 929, y: 300, occupied: false },
            { x: 879, y: 300, occupied: false },



        
            { x: 329, y: 300, occupied: false }, { x: 379, y: 300, occupied: false },
            { x: 429, y: 300, occupied: false }, { x: 479, y: 300, occupied: false },
            { x: 529, y: 300, occupied: false },
            { x: 579, y: 300, occupied: false },
            { x: 629, y: 300, occupied: false },
            { x: 679, y: 300, occupied: false },
            { x: 729, y: 300, occupied: false },                        //ряд ниже верхней дроги
            { x: 779, y: 300, occupied: false },
            { x: 829, y: 300, occupied: false },
            

            { x: 179, y: 150, occupied: false },
            { x: 229, y: 150, occupied: false }, { x: 279, y: 150, occupied: false },
            { x: 329, y: 150, occupied: false }, { x: 379, y: 150, occupied: false },
            { x: 429, y: 150, occupied: false }, { x: 479, y: 150, occupied: false },
            { x: 529, y: 150, occupied: false },
            { x: 579, y: 150, occupied: false },
            { x: 629, y: 150, occupied: false },
            { x: 679, y: 150, occupied: false },
            { x: 729, y: 150, occupied: false },                        //ряд выше Верхней дроги
            { x: 779, y: 150, occupied: false },
            { x: 829, y: 150, occupied: false },
            { x: 879, y: 150, occupied: false },
            { x: 929, y: 150, occupied: false },
            { x: 979, y: 150, occupied: false },
            { x: 1029, y: 150, occupied: false },
            { x: 1079, y: 150, occupied: false },

             { x: 179, y: 100, occupied: false },
            { x: 229, y: 100, occupied: false }, { x: 279, y: 100, occupied: false },
            { x: 329, y: 100, occupied: false }, { x: 379, y: 100, occupied: false },
            { x: 429, y: 100, occupied: false }, { x: 479, y: 100, occupied: false },
            { x: 529, y: 100, occupied: false },
            { x: 579, y: 100, occupied: false },
            { x: 629, y: 100, occupied: false },
            { x: 679, y: 100, occupied: false },
            { x: 729, y: 100, occupied: false },                        //ещё выше Верхней дроги
            { x: 779, y: 100, occupied: false },
            { x: 829, y: 100, occupied: false },
            { x: 879, y: 100, occupied: false },
            { x: 929, y: 100, occupied: false },
            { x: 979, y: 100, occupied: false },
            { x: 1029, y: 100, occupied: false },
            { x: 1079, y: 100, occupied: false },



            { x: 179, y: 200, occupied: false },                    //левый ряд
            { x: 179, y: 250, occupied: false }, 
            { x: 179, y: 300, occupied: false }, 
            { x: 179, y: 350, occupied: false }, 
            { x: 179, y: 400, occupied: false }, 
            { x: 179, y: 450, occupied: false }, 
            { x: 179, y: 500, occupied: false },
            { x: 179, y: 550, occupied: false }, 
            { x: 179, y: 600, occupied: false }, 
            { x: 179, y: 650, occupied: false }, 
            { x: 179, y: 700, occupied: false }, 
            


            { x: 329, y: 350, occupied: false },             //колона слева между дорогами
            { x: 329, y: 400, occupied: false },
            { x: 329, y: 450, occupied: false },
            { x: 329, y: 500, occupied: false },
            { x: 329, y: 550, occupied: false },
            { x: 329, y: 600, occupied: false },


            { x: 379, y: 600, occupied: false },                //Дорога снизу от центра
            { x: 429, y: 600, occupied: false },
            { x: 479, y: 600, occupied: false },
            { x: 529, y: 600, occupied: false },
            { x: 579, y: 600, occupied: false },
            { x: 629, y: 600, occupied: false },
            { x: 679, y: 600, occupied: false },
            { x: 729, y: 600, occupied: false },


            { x: 479, y: 450, occupied: false },                //Центральна дорога
            { x: 529, y: 450, occupied: false },
            { x: 579, y: 450, occupied: false },
            { x: 629, y: 450, occupied: false },
            { x: 679, y: 450, occupied: false },
            { x: 729, y: 450, occupied: false },


            { x: 1079, y: 200, occupied: false },
            { x: 1079, y: 250, occupied: false },           //Дорога справа СВЕРХУ от дороги
            { x: 1079, y: 300, occupied: false },
            { x: 1079, y: 350, occupied: false },
            { x: 1079, y: 400, occupied: false },
            { x: 1079, y: 450, occupied: false },
            
            { x: 1129, y: 100, occupied: false },
            { x: 1129, y: 150, occupied: false },
            { x: 1129, y: 200, occupied: false },
            { x: 1129, y: 250, occupied: false },           //Дорога справа справа сверху от дороги
            { x: 1129, y: 300, occupied: false },
            { x: 1129, y: 350, occupied: false },
            { x: 1129, y: 400, occupied: false },
            { x: 1129, y: 450, occupied: false },

                                                       //Дорога справа справа справа сверху от дороги

            { x: 1179, y: 350, occupied: false },
            { x: 1179, y: 400, occupied: false },
            { x: 1179, y: 450, occupied: false },

                                                       //Дорога справа справа справа справа сверху от дороги
            
            { x: 1229, y: 350, occupied: false },
            { x: 1229, y: 400, occupied: false },
            { x: 1229, y: 450, occupied: false },

                                                    //Дорога справа справа справа справа справа сверху от дороги
            { x: 1279, y: 350, occupied: false },
            { x: 1279, y: 400, occupied: false },
            { x: 1279, y: 450, occupied: false },

                                                    //Дорога справа справа справа справа справа сверху от дороги
            { x: 1329, y: 350, occupied: false },
            { x: 1329, y: 400, occupied: false },
            { x: 1329, y: 450, occupied: false },
            { x: 1329, y: 500, occupied: false },
            { x: 1329, y: 550, occupied: false },

                                                    //Дорога справа справа справа справа справа сверху от дороги
            { x: 1379, y: 350, occupied: false },
            { x: 1379, y: 400, occupied: false },
            { x: 1379, y: 450, occupied: false },
            { x: 1379, y: 500, occupied: false },
            { x: 1379, y: 550, occupied: false },

            { x: 1429, y: 500, occupied: false },               //самые правые у знака
            { x: 1429, y: 550, occupied: false },





            { x: 1079, y: 600, occupied: false },
            { x: 1079, y: 650, occupied: false },           //Дорога справа СНИЗУ от дороги
            { x: 1079, y: 700, occupied: false },
            { x: 1079, y: 750, occupied: false },
            { x: 1079, y: 800, occupied: false },
            { x: 1079, y: 850, occupied: false },

            { x: 1129, y: 600, occupied: false },
            { x: 1129, y: 650, occupied: false },           //Дорога справа справа СНИЗУ от дороги
            { x: 1129, y: 700, occupied: false },
            { x: 1129, y: 750, occupied: false },
            { x: 1129, y: 800, occupied: false },
            { x: 1129, y: 850, occupied: false },
            { x: 1129, y: 900, occupied: false },

            { x: 1179, y: 600, occupied: false },
            { x: 1179, y: 650, occupied: false },           //Дорога справа справа справа СНИЗУ от дороги
            { x: 1179, y: 700, occupied: false },
            { x: 1179, y: 750, occupied: false },
            { x: 1179, y: 800, occupied: false },
            { x: 1179, y: 850, occupied: false },
            { x: 1179, y: 900, occupied: false },

                                                   //Дорога справа справа справа СНИЗУ от дороги
            { x: 1229, y: 700, occupied: false },
            { x: 1229, y: 750, occupied: false },
            { x: 1229, y: 800, occupied: false },
            { x: 1229, y: 850, occupied: false },
            { x: 1229, y: 900, occupied: false },

                                                   //Дорога справа справа справа СНИЗУ от дороги
            { x: 1279, y: 700, occupied: false },
            { x: 1279, y: 750, occupied: false },
            { x: 1279, y: 800, occupied: false },
            { x: 1279, y: 850, occupied: false },
            { x: 1279, y: 900, occupied: false },

            { x: 1329, y: 700, occupied: false },
            { x: 1329, y: 750, occupied: false },
            { x: 1329, y: 800, occupied: false },
            { x: 1329, y: 850, occupied: false },
            { x: 1329, y: 900, occupied: false },

            { x: 1379, y: 700, occupied: false },           { x: 1429, y: 700, occupied: false },
            { x: 1379, y: 750, occupied: false },
            { x: 1379, y: 800, occupied: false },
            { x: 1379, y: 850, occupied: false },
            { x: 1379, y: 900, occupied: false },


        ];


        export const SELL_REFUND_PERCENTAGE = 0.75;
        export const ENEMY_INTERVAL_MS = 500;
        export const PAUSE_BETWEEN_GROUPS_MS = 1000;
        export const BUILD_SLOT_SIZE = 50;
        export const originalWidth = 1536;
        export const originalHeight = 1024;



        // --- КОНФИГУРАЦИЯ И НАСТРОЙКА ---
        
        export const backgroundImage = createImage('ФПСН.png');
        export const nightBackground = createImage('ФПСНночь.png');
        export const eveningBackground = createImage('ФПСНвечер.png');


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
                    ],

                    4: [
                        {
                            name: "Мыши!",
                            enemies: [
                                { type: "ZBats", count: 5, interval: 500 },
                                { type: "KBats", count: 5, interval: 900 },
                            ]
                        },
                        {
                            name: "Тени",
                            enemies: [
                                { type: "ShadowBolts", count: 5, interval: 500 },
                            ]
                        },
                        {
                            name: "Тени2",
                            enemies: [
                                { type: "ShadowBolts", count: 5, interval: 600 },
                                { type: "ShadowBolts2", count: 5, interval: 400 },
                            ]
                        },
                        {
                            name: "Страж",
                            enemies: [
                                { type: "Knight", count: 7, interval: 700 },
                            ]
                        },
                        {
                            name: "Страж и Флат",
                            enemies: [
                                { type: "KnightFly", count: 10, interval: 600 },
                                { type: "FlatWalk", count: 10, interval: 500 },
                            ]
                        },
                        {
                            name: "Летучие",
                            enemies: [
                                { type: "KnightFly", count: 5, interval: 1500 },
                                { type: "FlatFly", count: 5, interval: 1000 },
                                { type: "ShadowBolts", count: 5, interval: 400 },
                                { type: "ShadowBolts2", count: 5, interval: 800 },
                            ]
                        },
                        {
                            name: "Все вместе",
                            enemies: [
                                { type: "ZBats", count: 10, interval: 500 },
                                { type: "FlatFly", count: 10, interval: 300 },
                                { type: "KBats", count: 2, interval: 900 },
                            ]
                        },
                        {
                            name: "Большие проблемы",
                            enemies: [
                                { type: "Wolf", count: 3, interval: 300 },
                            ]
                        },
                        {
                            name: "Волки и леталки",
                            enemies: [
                                { type: "Wolf", count: 3, interval: 300 },
                                { type: "KnightFly", count: 8, interval: 300 },
                                { type: "FlatFly", count: 8, interval: 100 },
                            ]
                        },
                        {
                            name: "Финал (Босс)",
                            enemies: [
                                { type: "NightmareMoon", count: 1, interval: 1000 },
                            ]
                        }
                    ],
                };

                // --- МУЗЫКА И ЗВУКИ ---
export const backgroundMusic = new Audio('audio/Pony Up.mp3');
backgroundMusic.loop = true;      // Зацикливаем музыку

backgroundMusic.volume = 0.4;     // Устанавливаем громкость (от 0.0 до 1.0)

export const nightMusic = new Audio('audio/Night.mp3');
nightMusic.loop = true;
nightMusic.volume = 0.4;

export const eveningMusic = new Audio('audio/Evening.mp3'); // Ночь и Вечер
nightMusic.loop = true;
nightMusic.volume = 0.4;

export const LEVEL_START_MONEY = {
    1: 100, // Легкий старт
    2: 120, // Нужно купить Флаттершай
    3: 150, // Сложный уровень
    4: 200, // Для Найтмер Мун нужно много защиты
    5: 250,
    6: 300,
}



