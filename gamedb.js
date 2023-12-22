let gameDB =
{
    demeterRanks:
        [
            4, 8, 12, 28, 36, 44, 76, 88, 100, 148, /* 1-10 */
            164, 180, 244, 264, 284, 364, 388, 412, 508, 536, /* 11-20 */
            564, 676, 708, 740, 868, 904, 940, 1084, 1124, 1164, /* 21-30 */
            1324, 1368, 1412, 1588, 1636, 1684, 1876, 1928, 1980, 2188, /* 31-40 */
            2244
        ],
    koiosRanks:
        [
            32, 56, 128, 176, 320, 392, 608, 704, 992, 1112, /* 1-10 */
            1472, 1616, 2048, 2216, 2720, 2912, 3488, 3704, 4352, 4592, /* 11-20 */
            5312, 5576, 6368, 6656, 7520, 7832, 8768, 9104, 10112, 10472, /* 21-30 */
            11552, 11936, 13088, 13496, 14720, 15152, 16448, 16904, 18272, 18752, /* 31-40 */
            20192, 20696, 22208, 22736, 24320, 24872, 26528, 27104, 28832, 29432, /* 41-50 */
            31232, 31856, 33728, 34376, 36320, 36992, 39008, 39704, 41792, 42512, /* 51-60 */
            44672, 45416, 47648, 48416, 50720, 51512, 53888, 54704, 57152, 57992, /* 61-70 */
            60512, 61376, 63968, 64856, 67520, 68432, 71168, 72104, 74912, 75872 /* 71-80 */
        ],
    milestones:
        [
            {
                name: 'alpha',
                startCost: 2,
                costExp: 1.15,
                expGrowth: 0.0013,
                unlock: 0,
                rarity: 0,
                bonuses:
                [
                    { type: 'cells', power: 1.06 },
                    { type: 'mk5', power: 1.06 },
                    { type: 'shards', power: 1.06 }
                ]
            },
            {
                name: 'aquarius',
                startCost: 6,
                costExp: 1.22,
                expGrowth: 0.0022,
                unlock: 5,
                rarity: 0,
                bonuses:
                [
                    { type: 'mp', power: 1.06 },
                    { type: 'mk4', power: 1.06 },
                    { type: 'cells', power: 1.06 }
                ]
            },
            {
                name: 'libra',
                startCost: 9,
                costExp: 1.24,
                expGrowth: 0.0026,
                unlock: 10,
                rarity: 0,
                bonuses:
                [
                    { type: 'mk1', power: 1.06 },
                    { type: 'mk2', power: 1.07 },
                    { type: 'mk3', power: 1.08 }
                ]
            },
            {
                name: 'modifying',
                startCost: 24,
                costExp: 1.4,
                expGrowth: 0.012,
                unlock: 20,
                rarity: 1,
                bonuses:
                [
                    { type: 'mp', power: 1.06 },
                    { type: 'mp', power: 1.05 },
                    { type: 'mp', power: 1.04 },
                    { type: 'tickspeed', power: 0.01 }
                ]
            },
            {
                name: 'flowering',
                startCost: 40,
                costExp: 1.26,
                expGrowth: 0.0032,
                unlock: 30,
                rarity: 0,
                bonuses:
                [
                    { type: 'shards', power: 1.06 },
                    { type: 'cells', power: 1.07 },
                    { type: 'mk5', power: 1.08 }
                ]
            },
            {
                name: 'connecting',
                startCost: 80,
                costExp: 1.26,
                expGrowth: 0.0034,
                unlock: 40,
                rarity: 0,
                bonuses:
                [
                    { type: 'mk2', power: 1.06 },
                    { type: 'mk3', power: 1.07 },
                    { type: 'mk4', power: 1.08 }
                ]
            },
            {
                name: 'duality',
                startCost: 140,
                costExp: 1.5,
                expGrowth: 0.025,
                unlock: 50,
                rarity: 1,
                bonuses:
                [
                    { type: 'cells', power: 1.09 },
                    { type: 'mp', power: 1.11 },
                    { type: 'cells', power: 1.13 },
                    { type: 'mp', power: 1.1 }
                ]
            },
            {
                name: 'morphing',
                startCost: 4000,
                costExp: 2,
                expGrowth: 0.038,
                unlock: 120,
                rarity: 2,
                bonuses:
                [
                    { type: 'cells', power: 1.4 },
                    { type: 'mk1,mk2', power: 1.2 },
                    { type: 'cells', power: 1.8 },
                    { type: 'mk3,mk4', power: 1.2 },
                    { type: 'cells', power: 1.8 }
                ]
            },
            {
                name: 'producing',
                startCost: 31000,
                costExp: 1.5,
                expGrowth: 0.016,
                unlock: 150,
                rarity: 0,
                bonuses:
                [
                    { type: 'mk5', power: 1.06 },
                    { type: 'mk4', power: 1.07 },
                    { type: 'mk3', power: 1.08 }
                ]
            },
            {
                name: 'expanding',
                startCost: 36000,
                costExp: 1.48,
                expGrowth: 0.018,
                unlock: 180,
                rarity: 0,
                bonuses:
                [
                    { type: 'mk2', power: 1.06 },
                    { type: 'mk1', power: 1.07 },
                    { type: 'mk6', power: 1.08 }
                ]
            },
            {
                name: 'triangular',
                startCost: 5.6e7,
                costExp: 1.6,
                expGrowth: 0.028,
                unlock: 340,
                rarity: 1,
                bonuses:
                [
                    { type: 'mk3', power: 1.4 },
                    { type: 'mk3', power: 1.5 },
                    { type: 'mk3', power: 1.6 },
                    { type: 'mk3', power: 1.45 }
                ]
            },
            {
                name: 'extracting',
                startCost: 9.99e12,
                costExp: 3,
                expGrowth: 0.2,
                unlock: 520,
                rarity: 2,
                bonuses:
                [
                    { type: 'shards', power: 1.2 },
                    { type: 'mp', power: 1.15 },
                    { type: 'shards,mp', power: 1.1 },
                    { type: 'mk6', power: 2 },
                    { type: 'shards,mp', power: 1.25 }
                ]
            },
            {
                name: 'seeding',
                startCost: 2e13,
                costExp: 2,
                expGrowth: 0.1,
                unlock: 560,
                rarity: 0,
                bonuses:
                [
                    { type: 'cells', power: 1.06 },
                    { type: 'cells', power: 1.07 },
                    { type: 'cells', power: 1.08 }
                ]
            },
            {
                name: 'pathing',
                startCost: 2e17,
                costExp: 50,
                expGrowth: 20,
                unlock: 700,
                rarity: 1,
                bonuses:
                [
                    { type: 'mk3', power: 1.15 },
                    { type: 'mk4', power: 1.18 },
                    { type: 'mk5', power: 1.21 },
                    { type: 'tickspeed', power: 0.01 }
                ]
            },
            {
                name: 'ritualistic',
                startCost: 2e21,
                costExp: 70,
                expGrowth: 15,
                unlock: 800,
                rarity: 0,
                bonuses:
                [
                    { type: 'mk6', power: 1.06 },
                    { type: 'mk6', power: 1.06 },
                    { type: 'mk6', power: 1.06 }
                ]
            },
            {
                name: 'modulistic',
                startCost: 6e23,
                costExp: 300,
                expGrowth: 300,
                unlock: 900,
                rarity: 1,
                bonuses:
                [
                    { type: 'mp', power: 1.05 },
                    { type: 'mk5', power: 1.25 },
                    { type: 'mp', power: 1.05 },
                    { type: 'mk5', power: 1.5 }
                ]
            },
            {
                name: 'machining',
                startCost: 8e25,
                costExp: 700,
                expGrowth: 700,
                unlock: 1000,
                rarity: 2,
                bonuses:
                [
                    { type: 'cells', power: 2 },
                    { type: 'rp', power: 1.04 },
                    { type: 'shards,rp', power: 1.03 },
                    { type: 'rp', power: 1.05 },
                    { type: 'mp,rp', power: 1.03 }
                ]
            },
            {
                name: 'studying',
                startCost: 1.5e29,
                costExp: 2500,
                expGrowth: 2500,
                unlock: 1100,
                rarity: 3,
                bonuses:
                [
                    { type: 'rp', power: 1.1 },
                    { type: 'rp', power: 1.1 },
                    { type: 'cells', power: 3.5 },
                    { type: 'mp', power: 2 },
                    { type: 'shards', power: 1.5 },
                    { type: 'rp', power: 1.25 }
                ]
            }
        ],
    milestoneCosts: [],
    milestoneBonuses: [],
    missions:
    [
        {
            name: 'scouting',
            time: 30,
            resources:
            [
                {
                    name: 'AP',
                    amount: 24.23
                },
                {
                    name: 'Difar',
                    amount: 119
                }
            ]
        },
        {
            name: 'salvaging',
            time: 6 * 60,
            resources:
            [
                {
                    name: 'AP',
                    amount: 726.79
                },
                {
                    name: 'Kento',
                    amount: 1.12e3
                }
            ]
        },
        {
            name: 'material hunting',
            time: 40 * 60,
            resources:
            [
                {
                    name: 'AP',
                    amount: 5.81e3
                },
                {
                    name: 'Tokenium',
                    amount: 10
                },
                {
                    name: 'Chromium',
                    amount: 1.12e3
                }
            ]
        }
    ]
}

function RetrieveMilestoneNumber(id)
{
    for (let i = 0; i < gameDB.milestones.length; i++)
    {
        if (gameDB.milestones[i].name === id)
        {
            return i;
        }
    }

    return "milestone not found";
}

function RetrieveMilestone(id)
{
    if (isNaN(id))
    {
        return gameDB.milestones[RetrieveMilestoneNumber(id)];
    } else if (id > -1 && id < gameDB.milestones.length) { return gameDB.milestones[id]; }

    return "milestone not found";
}

function GenerateMilestoneCost(milestone, level)
{
    milestone = RetrieveMilestone(milestone);

    const logStart = Math.log10(milestone.startCost);
    const currentCost = logStart + level * Math.log10(milestone.costExp + level * milestone.expGrowth);
    const calcCost = (new Decimal(10)).pow(currentCost);

    return calcCost;
}

function GetMilestoneCost(milestone, originLevel, targetLevel = originLevel + 1)
{
    if (isNaN(milestone)) milestone = RetrieveMilestoneNumber(milestone);
    let totalCost = new Decimal(0);
    for (let i = originLevel; i < targetLevel; i++)
    {
        totalCost = totalCost.plus(gameDB.milestoneCosts[milestone][i]);
    }
    return totalCost;
}

function GetRelativeMilestoneBonus(milestone, originLevel, targetLevel = originLevel + 1)
{
    if (isNaN(milestone)) milestone = RetrieveMilestoneNumber(milestone);
    const origin = gameDB.milestoneBonuses[milestone][originLevel];
    const target = gameDB.milestoneBonuses[milestone][targetLevel];
    const bonuses =
    {
        cells: target.cells / origin.cells,
        mp: target.mp / origin.mp,
        shards: target.shards / origin.shards,
        rp: target.rp / origin.rp,
        tick: target.tick - origin.tick
    };
    return bonuses;
}

console.log(`Calculating milestone cost array`);
gameDB.milestoneCosts = [];
for (let index = 0; index < gameDB.milestones.length; index++)
{
    let milestoneSet = [new Decimal(0)];
    for (let level = 1; level < 100; level++)
    {
        milestoneSet.push(GenerateMilestoneCost(index, level));
    }
    gameDB.milestoneCosts.push(milestoneSet);
}
console.log(`Cost array complete`);

console.log('Calculating milestone bonuses');
gameDB.milestoneBonuses = [];
for (let index = 0; index < gameDB.milestones.length; index++)
{
    let thisMilestone = gameDB.milestones[index];
    let milestoneSet = [{ cells: 1, mp: 1, shards: 1, rp: 1, tick: 0 }];
    let rarity = thisMilestone.rarity;

    for (let level = 1; level < 101; level++)
    {
        let bonusSet = { cells: 1, mp: 1, shards: 1, rp: 1, tick: 0 };
        let powers = [level, 0, 0, 0, 0, 0];
    
        // First unlock power
        if (rarity === 3 && level >= 5) { powers[1] = level - 3; }
        else if (rarity === 2 && level >= 10) { powers[1] = level - 8; }
        else if (level >= 25) { powers[1] = level - 20; }
    
        // Second unlock power
        if (rarity === 3 && level >= 10) { powers[2] = level - 8; }
        else if (rarity === 2 && level >= 25) { powers[2] = level - 20; }
        else if (level >= 50) { powers[2] = level - 45; }
    
        // Third unlock power
        if (rarity === 3 && level >= 25) { powers[3] = level - 20; }
        else if (rarity === 2 && level >= 50) { powers[3] = level - 45; }
        else if (rarity === 1 && level >= 75) { powers[3] = level - 70; }
    
        // Fourth unlock power
        if (rarity === 3 && level >= 50) { powers[4] = level - 45; }
        else if (rarity === 2 && level >= 75) { powers[4] = level - 70; }
    
        // Fifth unlock power
        if (rarity === 3 && level >= 75) { powers[5] = level - 70; }
    
        for (let i = 0; i < (rarity + 3); i++)
        {
            let effect = thisMilestone.bonuses[i].type;
            let power = Math.pow(thisMilestone.bonuses[i].power, powers[i]);
            if (effect === 'tickspeed')
            {
                power = thisMilestone.bonuses[i].power * powers[i];
            }
            if (effect.includes('cells')) { bonusSet.cells *= power; }
            if (effect.includes('mk1')) { bonusSet.cells *= power; }
            if (effect.includes('mk2')) { bonusSet.cells *= power; }
            if (effect.includes('mk3')) { bonusSet.cells *= power; }
            if (effect.includes('mk4')) { bonusSet.cells *= power; }
            if (effect.includes('mk5')) { bonusSet.cells *= power; }
            if (effect.includes('mk6')) { bonusSet.cells *= power; }
            if (effect.includes('mk7')) { bonusSet.cells *= power; }
            if (effect.includes('mk8')) { bonusSet.cells *= power; }
            if (effect.includes('mp')) { bonusSet.mp *= power; }
            if (effect.includes('shards')) { bonusSet.shards *= power; }
            if (effect.includes('rp')) { bonusSet.rp *= power; }
            if (effect.includes('tickspeed')) { bonusSet.tick -= power; }
        }

        milestoneSet.push(bonusSet);
    }

    gameDB.milestoneBonuses.push(milestoneSet);
}
console.log('Bonus array complete.');
