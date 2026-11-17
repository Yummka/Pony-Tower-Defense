// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
const createImage = (src) => { const img = new Image(); img.src = `images/${src}`; return img; };
const g = (type, count, interval = 500) => ({ type, count, interval });
const w = (name, ...groups) => ({ name, enemies: groups });

const addSlots = (arr, x, y, countX, countY = 1) => {
    for (let i = 0; i < countX; i++)
        for (let j = 0; j < countY; j++)
            arr.push({ x: x + i * 50, y: y + j * 50, occupied: false });
};

// Функция для массового добавления слотов: bulkAdd(slots, [[x, y, cx, cy], ...])
const bulkAdd = (arr, data) => data.forEach(d => addSlots(arr, ...d));

// --- БАШНИ ---
export const TOWER_CONFIG = {
    'Пинки Пай':      { price: 45, range: 110, damage: 2, isMelee: true, damageTickRate: 6, frameCount: 12, frameWidth: 112, frameSpeed: 0.8, description: { damage: "3.5 (x6/сек)", range: 110, speed: "10.0/сек", special: "Урон по площади." }},
    'Эппл Джек':      { price: 70, range: 80,  damage: 7, isMelee: true, damageTickRate: 10, frameCount: 21, frameWidth: 100, frameSpeed: 0.3, description: { damage: "7 (x6/сек)", range: 80, speed: "8.0/сек", special: "Сильный урон." }},
    'Твайлайт Спаркл': { price: 60, range: 90,  damage: 5, isMelee: true, damageTickRate: 10, frameCount: 20, frameWidth: 102, frameSpeed: 0.2, description: { damage: "5 (x6/сек)", range: 90, speed: "6.0/сек", special: "Магия." }},
    'Флаттершай':     { price: 55, range: 80,  damage: 0, isMelee: true, damageTickRate: 60, applySlow: true, slowDuration: 180, frameCount: 12, frameWidth: 114, frameSpeed: 0.2, description: { damage: "0", range: 80, speed: "1.0/сек", special: "Замедление." }},
    'Радуга Дэш':      { price: 80, range: 0,   damage: 0, isPatrolTower: true, patrolSpeed: 4, auraDamage: 1, auraRadius: 40, frameCount: 16, frameWidth: 108, frameSpeed: 0.5, description: { damage: "30/сек", range: "Маршрут", speed: "Пост.", special: "Патруль." }},
    'Рэрити':          { price: 75, range: 180, damage: 25, isSniper: true, fireRate: 150, dramaMeterMax: 250, dramaFillRadius: 90, dramaFillRate: 0.5, ultStunDuration: 200, ultRadius: 150, attackFrameCount: 20, attackFrameWidth: 108, attackFrameSpeed: 0.5, ultFrameCount: 25, ultFrameWidth: 70, ultFrameSpeed: 0.2, projectileType: 'needle', description: { damage: 25, range: 180, speed: "0.4/сек", special: "Снайпер." }},
    'Принцесса Луна':  { price: 500, damage: 3000, isAbility: true, aoeRadius: 250, description: { damage: "3000", range: "Выбор", speed: "Разово", special: "Удар с неба." }},
    'Дёрпи':           { price: 100, range: 250, damage: 0, isSupport: true, fireRate: 200, missChance: 0.15, frameCount: 12, frameWidth: 106, frameSpeed: 0.3, projectileType: 'muffin', description: { damage: "Бафф", range: 250, speed: "Редко", special: "Маффины." }}
};

// --- ВРАГИ ---
// [0:скорость, 1:HP, 2:награда, 3:кадры, 4:скорость_анимации, 5:ширина, 6:высота, 7:хитбокс, 8:yOffset, 9:стелс, 10:статик]
const eData = {
    // Начальные
    Grunt: [1.5, 20, 5, 15, 0.3, 56, 68, 25],
    Tank:  [0.8, 100, 10, 12, 0.3, 60, 70, 30],
    Fast:  [3, 15, 5, 12, 0.4, 50, 50, 20],
    Mom:   [1.2, 50, 10, 8, 0.2, 60, 70, 25],
    Spoon: [1.5, 20, 5, 15, 0.2, 56, 56, 25],
    Snail: [1, 15, 5, 9, 0.1, 55, 74, 25],
    Snip:  [1, 15, 5, 16, 0.3, 56, 56, 25],
    BabsSeed: [2, 40, 7, 16, 0.3, 52, 64, 25],
    
    // Уровень 2
    Trixie: [2, 500, 250, 15, 0.3, 80, 94, 25],
    PrinceBlueblood: [1.5, 55, 7, 16, 0.3, 74, 92, 25],
    Hoops: [2.5, 50, 6, 14, 0.3, 85, 83, 25],
    Stronghoof: [0.8, 300, 20, 8, 0.1, 84, 122, 25, -10],
    Score: [2, 50, 7, 16, 0.3, 72, 80, 25],
    Bell:  [1.5, 50, 6, 16, 0.3, 74, 86, 25],
    Flam:  [1.5, 60, 10, 15, 0.3, 80, 100, 25],
    Flim:  [1.5, 60, 10, 14, 0.3, 74, 100, 25],
    ShadowBolts:  [5, 60, 10, 14, 0.3, 92, 76, 25],
    ShadowBolts2: [5, 60, 10, 16, 0.3, 94, 76, 25],
    
    // Боссы-Сирены
    Siren1: [2, 1000, 100, 8, 0.3, 160, 242, 35],
    Siren2: [2, 1000, 100, 8, 0.3, 160, 242, 35],
    Siren3: [2, 1000, 100, 8, 0.3, 160, 242, 35],
    SirenP1: [2, 700, 80, 15, 0.3, 70, 74, 25],
    SirenP2: [2, 700, 80, 15, 0.3, 70, 74, 25],
    SirenP3: [2, 700, 80, 15, 0.3, 70, 74, 25],

    // Уровень 3
    Suri: [2, 50, 5, 16, 0.3, 92, 80, 25],
    LightningDust: [6.5, 50, 10, 8, 0.5, 102, 80, 25],
    Gilda: [2.5, 65, 5, 15, 0.3, 112, 80, 25],
    Stariy: [1.5, 85, 7, 15, 0.3, 110, 82, 25],
    Doctor: [2, 100, 15, 16, 0.3, 96, 86, 25],
    Perviy: [2, 90, 10, 16, 0.3, 96, 86, 25],
    Vtoroy: [2, 90, 10, 16, 0.3, 96, 86, 25],
    Tretiy: [2, 90, 10, 16, 0.3, 96, 86, 25],

    // Мифические и Боссы 4-5
    SfinksWalk: [2, 1500, 120, 15, 0.3, 224, 244, 25],
    SfinksFly:  [3, 1500, 200, 16, 0.3, 224, 244, 35],
    Achel: [2.5, 1200, 180, 16, 0.3, 170, 132, 35],
    Knight: [2, 120, 15, 15, 0.3, 88, 78, 25],
    KnightFly: [2.5, 120, 15, 16, 0.3, 88, 78, 25],
    FlatWalk: [2, 100, 10, 15, 0.3, 92, 82, 25],
    FlatFly:  [2.5, 100, 10, 16, 0.3, 94, 76, 25],
    ZBats: [3, 30, 3, 7, 0.3, 110, 98, 25],
    KBats: [3, 30, 3, 7, 0.3, 110, 98, 25],
    Wolf:  [5, 250, 25, 21, 0.6, 311, 149, 35],
    NightmareMoon: [1, 2200, 300, 29, 0.3, 168, 126, 35],
    DogS: [4.5, 110, 10, 16, 0.3, 102, 102, 25],
    DogM: [2.5, 140, 10, 15, 0.3, 106, 90, 25],
    DogL: [1, 160, 10, 16, 0.3, 122, 122, 25],
    Parasprits: [3, 30, 5, 8, 0.2, 92, 92, 25],
    Manticora:  [2.5, 200, 20, 11, 0.3, 132, 104, 25],
    PereWalk: [2.5, 140, 15, 15, 0.3, 92, 82, 25],
    PereFly:  [3.5, 140, 15, 18, 0.3, 64, 80, 25],
    GildaFly: [3.5, 100, 7, 11, 0.2, 112, 128, 25],
    Crizalis: [3, 2500, 300, 21, 0.3, 78, 110, 25],

    // Уровень 6 (Империя)
    SlaveSpell1: [2.5, 200, 20, 32, 0.3, 84, 89, 25],
    SlaveSpell2: [2.5, 200, 20, 32, 0.3, 96, 85, 30],
    SlaveSpell3: [2.5, 200, 20, 32, 0.3, 78, 92, 25],
    SlaveSpell4: [2.5, 200, 20, 32, 0.3, 106, 88, 25],
    SlaveChains: [1, 700, 25, 11, 0.2, 318, 96, 50],
    ShadowPony:  [4, 300, 35, 16, 0.3, 75, 96, 25, -20],
    Shadow: [4, 1000, 40, 16, 0.2, 463, 237, 30, -20],
    KingSombra: [1, 15000, 500, 32, 0.3, 114, 130, 50, -30],
    FakeCadence: [1.5, 5500, 400, 16, 0.2, 120, 106, 35, -20, true], 
    TrueChrysalis: [1, 6000, 400, 16, 0.3, 98, 122, 50, -40],
    SombraCrystal: [0, 2000, 100, 1, 0, 50, 65, 30, 0, false, true]
};

export const ENEMY_TYPES = {};
Object.entries(eData).forEach(([k, d]) => {
    ENEMY_TYPES[k] = { 
        speed: d[0], 
        maxHealth: d[1], 
        bounty: d[2], 
        frameCount: d[3], 
        frameSpeed: d[4], // Теперь берется конкретное число для каждого!
        width: d[5], 
        height: d[6], 
        hitboxRadius: d[7], 
        yOffset: d[8] || 0, 
        isStealth: d[9] || false, 
        isStatic: d[10] || false 
    };
});

// --- ГРАФИКА И ЗВУК (АВТОМАТИЗАЦИЯ) ---
const towerImgMap = { 'Пинки Пай': 'пинки стоит', 'Пинки Пай Атака': 'пинки', 'Эппл Джек': 'эпл стоит', 'Эппл Джек Атака': 'ЭплДрака', 'Твайлайт Спаркл': 'Тстоит', 'Твайлайт Спаркл Атака': 'ТвайЛайтАтака', 'Флаттершай': 'Флат_стоит', 'Флаттершай Атака': 'Флат_атака', 'Радуга Дэш': 'РадугаСтоит', 'Радуга Дэш Атака': 'РадугаАтака', 'Рэрити': 'РаритиСтоит', 'Рэрити Атака': 'РаритиАтака', 'Рэрити Ульта': 'РаритиУльта', 'Принцесса Луна Атака': 'ЛунаАтака2', 'Иголка': 'Иголка', 'Прицел': 'Прицел', 'Дёрпи': 'ДёрпиСтоит', 'Дёрпи Атака': 'ДёрпиАтака', 'Маффин': 'Маффин' };
const towerStates = ['Сон', 'Превращение'];
const towerPonies = ['Пинки Пай', 'Эппл Джек', 'Твайлайт Спаркл', 'Флаттершай', 'Радуга Дэш', 'Рэрити'];
const stateShort = { 'Сон': 'С', 'Превращение': 'М' };

export const towerImages = {};
Object.entries(towerImgMap).forEach(([k, v]) => towerImages[k] = createImage(v + '.png'));
towerPonies.forEach(p => towerStates.forEach(s => towerImages[`${p} ${s}`] = createImage(`${p[0]}${stateShort[s]}.png`)));

const enemyImgMap = { Grunt: "ТиараН", Tank: "пони", Fast: "ТВ2", Mom: "мать т2", Spoon: "ЛожкаН", Snail: "снил", Snip: "Снип", BabsSeed: "Бэтс", Trixie: "Трикси", PrinceBlueblood: "принц", Hoops: "Хул2", Stronghoof: "Бык", Score: "Хул3", Bell: "Хул1", ShadowBolts: "Злая_Молния", Flim: "Флим", Flam: "Флэм", ShadowBolts2: "Злой_Мол", Siren1: "Сир1", Siren2: "Сир2", Siren3: "Сир3", SirenP1: "ПерваяС", SirenP2: "ВтораяС", SirenP3: "ТретьяС", Suri: "Сури", Gilda: "ГилдаИдёт", LightningDust: "ЛайтнингДаст", Doctor: "ДокторК", Stariy: "Старый", Perviy: "1Пон", Vtoroy: "2Пон", Tretiy: "3Пон", SfinksWalk: "СфинксИдёт", SfinksFly: "СфинксЛетит", Achel: "Ачел", Knight: "СтражИдёт", KnightFly: "СтражЛетит", FlatWalk: "ФлатБэтИдёт", FlatFly: "ФлатБэтЛетит", ZBats: "ЗМыши", KBats: "КМыши", Wolf: "ВОЛК2", NightmareMoon: "НайтмерМун", DogS: "СобакаБыстрая", DogM: "СобакаСредняя", DogL: "СобакаМедленная", Parasprits: "Парасприты", Manticora: "Мантикора", PereWalk: "ПеревёртышИдёт", PereFly: "ПеревёртышЛетит", GildaFly: "ГрилдаЛетит", Crizalis: "Кризалис", SlaveSpell1: "ПР", SlaveSpell2: "ВР", SlaveSpell3: "ТР", SlaveSpell4: "ЧР", SlaveChains: "РабыСЦепями", ShadowPony: "ШедоуПони", Shadow: "Шедоу", FakeCadence: "КаденсДляКризалис", TrueChrysalis: "КризалисИдёт", KingSombra: "Сомбра", SombraCrystal: "КристаллСомбры", CadenceTransform: "КризалиТ" };
export const enemyImages = {}, enemyImagesSlow = {}, enemyImagesStun = {};
Object.entries(enemyImgMap).forEach(([k, v]) => {
    enemyImages[k] = createImage(v + ".png");
    enemyImagesSlow[k] = createImage(v + "Х.png");
    enemyImagesStun[k] = createImage(v + "С.png");
});

export const towerSounds = {};
const sNames = { 'Пинки Пай': 'Писк', 'Эппл Джек': 'Удар', 'Твайлайт Спаркл': 'Магия', 'Флаттершай': 'Милота', 'Радуга Дэш': 'Крылья', 'Рэрити': 'Бросок', 'Принцесса Луна': 'Взрыв', 'Дёрпи': 'Помидор' };
Object.entries(sNames).forEach(([k, v]) => towerSounds[k] = new Audio(`audio/${v}.mp3`));
export function playSound(name) { const s = towerSounds[name]; if (s) { const c = s.cloneNode(); c.volume = 0.3; c.play().catch(() => {}); } }

// --- КАРТЫ И УРОВНИ ---
export const path = [{x:0,y:820},{x:1000,y:820},{x:1000,y:210},{x:260,y:210},{x:260,y:670},{x:800,y:670},{x:800,y:360},{x:400,y:360},{x:400,y:510},{x:1250,y:510},{x:1250,y:610},{x:1536,y:610}];
export const pathLevel6 = [{x:0,y:850},{x:200,y:850},{x:200,y:225},{x:410,y:225},{x:410,y:575},{x:1300,y:575},{x:1300,y:775},{x:900,y:775},{x:900,y:225},{x:1536,y:225}];

export const buildSlots = [];
bulkAdd(buildSlots, [[29,900,21],[179,750,16],[179,200,1,11],[329,350,1,6],[379,600,8],[479,450,6],[329,300,11],[879,300,2,4],[879,600,2,3],[179,150,18],[179,100,18],[1079,100,2,8],[1179,350,5,3],[1329,500,3,2],[1079,600,3,2],[1079,700,8,5]]);

export const buildSlotsLevel6 = [];
bulkAdd(buildSlotsLevel6, [[27,950,7],[27,800,3],[127,150,1,13],[177,150,8],[777,150,15],[477,200,2,7],[777,200,2,7],[577,300,4,5],[277,300,2,13],[377,650,10,2],[377,750,2,2],[377,850,1,1],[727,750,3,2],[777,850,1,1],[827,850,12],[977,300,8,5],[1477,300,1,2],[977,650,6,2],[1377,300,2,11]]);

export const SELL_REFUND_PERCENTAGE = 0.75, PAUSE_BETWEEN_GROUPS_MS = 1000, BUILD_SLOT_SIZE = 50, originalWidth = 1536, originalHeight = 1024;
export const backgroundImage = createImage('ФПСН.png'), nightBackground = createImage('ФПСНночь.png'), eveningBackground = createImage('ФПСНвечер.png'), morningBackground = createImage('ФПСНутро.png'), crystalBackground = createImage('ФПСНкристалл.png');

// --- МУЗЫКА ---
const createMusic = (src) => { const a = new Audio(`audio/${src}.mp3`); a.loop = true; a.volume = 0.4; return a; };
export const backgroundMusic = createMusic('Pony Up'), nightMusic = createMusic('Night'), eveningMusic = createMusic('Evening'), morningMusic = createMusic('Morning'), crystalMusic = createMusic('Crystal');
export const LEVEL_START_MONEY = { 1: 100, 2: 120, 3: 150, 4: 200, 5: 250, 6: 300, 7: 350 };

export const LEVELS_CONFIG = {
    1: [w("1", g("Grunt", 5)), w("2", g("Grunt", 4, 600), g("Spoon", 4, 900)), w("3", g("Snail", 5, 1000), g("Snip", 5)), w("4", g("Grunt", 5, 700), g("Spoon", 2, 900), g("Snail", 2, 1100), g("Snip", 2, 1300)), w("5", g("Mom", 2, 900), g("Grunt", 5, 700)), w("6", g("Mom", 2, 900), g("Grunt", 5, 700), g("Spoon", 2)), w("7", g("BabsSeed", 5, 900), g("Grunt", 5, 700), g("Spoon", 5)), w("8", g("Mom", 5, 1000), g("Grunt", 5, 700), g("Spoon", 5, 1300), g("Snail", 5, 1500), g("Snip", 5)), w("9", g("Mom", 2, 1000), g("Grunt", 5, 700), g("Spoon", 5, 1200), g("Snail", 5), g("Snip", 5, 900), g("BabsSeed", 5, 1500)), w("10", g("Trixie", 1, 1000))],
    2: [w("1", g("Score", 7, 700)), w("2", g("Flim", 5, 400), g("Flam", 5, 800)), w("3", g("Stronghoof", 3, 2000)), w("4", g("PrinceBlueblood", 10, 600), g("Bell", 10)), w("5", g("Stronghoof", 5, 1500), g("PrinceBlueblood", 5, 1000), g("Flim", 5, 400), g("Flam", 5, 800)), w("6", g("ShadowBolts", 5, 300), g("ShadowBolts2", 5, 100)), w("7", g("Score", 10, 100), g("Hoops", 10, 300), g("Bell", 2)), w("8", g("ShadowBolts", 10, 300), g("ShadowBolts2", 10, 100), g("Stronghoof", 5, 1500), g("PrinceBlueblood", 15, 500)), w("9", g("SirenP1", 1), g("SirenP2", 1, 300), g("SirenP3", 1, 100)), w("10", g("Siren1", 1, 1000), g("Siren2", 1), g("Siren3", 1, 100))],
    3: [w("1", g("Suri", 15, 700)), w("2", g("Gilda", 10, 400), g("Suri", 10, 800)), w("3", g("LightningDust", 8, 300)), w("4", g("Doctor", 10, 600), g("Stariy", 10)), w("5", g("Doctor", 5, 1500), g("Perviy", 5, 1000), g("Vtoroy", 5, 400), g("Tretiy", 5, 800)), w("6", g("Gilda", 10, 300), g("Stariy", 10)), w("7", g("LightningDust", 10, 100), g("Gilda", 15, 400), g("Suri", 15, 800), g("Stariy", 10)), w("8", g("Doctor", 5, 1500), g("Perviy", 5, 1000), g("Vtoroy", 5, 400), g("Tretiy", 5, 800), g("LightningDust", 10, 100), g("Gilda", 10, 400), g("Suri", 10, 800)), w("9", g("SfinksWalk", 1, 100)), w("10", g("Achel", 1, 1000), g("SfinksFly", 1))],
    4: [w("1", g("ZBats", 5), g("KBats", 5, 900)), w("2", g("ShadowBolts", 5)), w("3", g("ShadowBolts", 5, 600), g("ShadowBolts2", 5, 400)), w("4", g("Knight", 7, 700)), w("5", g("KnightFly", 10, 600), g("FlatWalk", 10)), w("6", g("KnightFly", 5, 1500), g("FlatFly", 5, 1000), g("ShadowBolts", 5, 400), g("ShadowBolts2", 5, 800)), w("7", g("ZBats", 10), g("FlatFly", 10, 300), g("KBats", 2, 900)), w("8", g("Wolf", 3, 300)), w("9", g("Wolf", 3, 300), g("KnightFly", 8, 300), g("FlatFly", 8, 100)), w("10", g("NightmareMoon", 1, 1000))],
    5: [w("1", g("Parasprits", 7)), w("2", g("Manticora", 5, 600), g("GildaFly", 5, 700)), w("3", g("DogS", 5), g("DogL", 5, 900), g("DogM", 5, 700)), w("4", g("Wolf", 5, 700), g("GildaFly", 10, 700)), w("5", g("PereWalk", 10, 600), g("DogS", 10), g("Parasprits", 5, 200)), w("6", g("PereWalk", 8, 1500), g("PereFly", 8, 1000), g("Manticora", 5, 400), g("DogM", 5, 800)), w("7", g("DogS", 7), g("DogL", 7, 900), g("DogM", 7, 700), g("PereWalk", 9, 1200), g("PereFly", 9, 1000)), w("8", g("Wolf", 7, 300), g("PereWalk", 10), g("PereFly", 10, 700), g("Parasprits", 10)), w("9", g("DogS", 10), g("DogL", 10, 900), g("DogM", 10, 700), g("Wolf", 3, 300)), w("10", g("Crizalis", 1, 1000), g("PereWalk", 15), g("PereFly", 15, 700))],
    6: [w("1", g("SlaveSpell1", 7, 1500)), w("2", g("SlaveSpell1", 3, 600), g("SlaveSpell2", 3, 400), g("SlaveSpell3", 3, 800)), w("3", g("SlaveChains", 3, 1500), g("SlaveSpell4", 10, 900), g("PereWalk", 10)), w("4", g("ShadowPony", 10, 700), g("SlaveChains", 10, 1500)), w("5", g("ShadowPony", 10, 600), g("SlaveSpell2", 7, 400), g("SlaveSpell3", 5, 800)), w("6", g("Shadow", 4, 800), g("PereFly", 10)), w("7", g("Shadow", 4, 800), g("ShadowPony", 7, 900), g("SlaveSpell1", 7, 700), g("SlaveSpell3", 7, 1200), g("SlaveSpell4", 7, 1000)), w("8", g("Shadow", 5, 800), g("ShadowPony", 5, 900), g("PereFly", 10, 700), g("SlaveChains", 8, 1500)), w("9", g("FakeCadence", 1, 500)), w("10", g("KingSombra", 1, 1000))]
};