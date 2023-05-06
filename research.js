class ResearchTarget
{
    name;
    cost;
    rpBonus;
    tickBonus;

    constructor(name, cost, rpBonus, tickBonus)
    {
        this.name = name;
        this.cost = cost;
        this.rpBonus = rpBonus;
        this.tickBonus = tickBonus;
    }
}

function AddResearchTarget(name, cost, rpBonus, tickBonus)
{
    playerData.koios.researchTargets.push(new ResearchTarget(name, cost, rpBonus, tickBonus));
    SavePlayerData();
}

function ClearResearchTargets()
{
    playerData.koios.researchTargets = [];
    SavePlayerData();
}

function CompleteResearchTarget(name)
{
    if (playerData.koios.researchTargets.length === 0) return;

    name = name || playerData.koios.researchTargets[0].name;

    for (let i = 0; i < playerData.koios.researchTargets.length; i++)
    {
        if (playerData.koios.researchTargets.name === name)
        {
            playerData.koios.researchTargets.splice(i, 1);
            break;
        }
    }

    SavePlayerData();
}

function ReorderResearchTargets(newOrder)
{
    let newTargetArray = [];

    for (let i = 0; i < newOrder.length; i++)
    {
        newTargetArray.push(playerData.koios.researchTargets[newOrder[i]]);
    }

    playerData.koios.researchTargets = newTargetArray;

    SavePlayerData();
}

function ResearchTime(goal, rate, studies, ticks, testing = false, evoTicks = 0)
{
    let hephBonus = playerData.hephaestus.crew * playerData.hephaestus.blueprints * ticks * 0.000002 + 1;
    let koiBonus = playerData.koios.crew * playerData.koios.brainium * studies * 0.00001 + 1;
    let ropBonus = playerData.mods.rop * studies * 0.01 + 1;
    let baseRate = rate / (hephBonus * koiBonus * ropBonus);

    let progTicks = 0;

    while (goal > 0)
    {
        ticks += playerData.timing.study;
        progTicks += playerData.timing.study;
        evoTicks += playerData.timing.study;
        goal -= rate;
        studies += playerData.koios.multiStudy;

        hephBonus = playerData.hephaestus.crew * playerData.hephaestus.blueprints * ticks * 0.000002 + 1;
        koiBonus = playerData.koios.crew * playerData.koios.brainium * studies * 0.00001 + 1;
        ropBonus = playerData.mods.rop * studies * 0.01 + 1;

        if (evoTicks >= playerData.koios.evo.ticks) { baseRate *= playerData.koios.evo.power; playerData.koios.evo.ticks = 1e10; console.log('Evo!'); }
        rate = baseRate * (hephBonus * koiBonus * ropBonus);
    }

    if (testing)
    {
        let result =
        {
            ticks, progTicks, studies, rate
        };
        return result;
    }

    let goalSeconds = Math.ceil(progTicks * playerData.timing.tick);
    let goalDays = Math.floor(goalSeconds / (3600 * 24));
    goalSeconds = goalSeconds % (3600 * 24);
    let goalHours = Math.floor(goalSeconds / 3600);
    goalSeconds = goalSeconds % 3600;
    let goalMinutes = Math.floor(goalSeconds / 60);
    goalSeconds = goalSeconds % 60;

    let goalTime = `You will reach the goal within ${(goalDays > 0) ? goalDays + ' Days, ' : ''}${((goalHours < 10) ? '0' : '') + goalHours + ':'}${((goalMinutes < 10) ? '0' : '') + goalMinutes + ':'}${((goalSeconds < 10) ? '0' : '') + goalSeconds}`;
    console.log(goalTime);
    goalDays = Math.ceil(progTicks * playerData.timing.tick) / (3600 * 24);
    goalDays = Math.round(goalDays * 100) / 100;
    console.log(`(${goalDays} Days)`);
}

function ResearchPath(initCost, rate, studies, ticks, ticksToEvo = 1e10)
{
    let targets = playerData.koios.researchTargets;
    let researches = [];
    let totalTicks = 0;
    let time = [];

    playerData.koios.evo.ticks = ticksToEvo;
    let evoTicks = 0;

    researches.push(ResearchTime(initCost, rate, studies, ticks, true, evoTicks));
    ticks = researches[researches.length-1].ticks;
    totalTicks += researches[researches.length-1].progTicks;
    evoTicks += researches[researches.length-1].progTicks;
    rate = researches[researches.length-1].rate * targets[0].rpBonus;
    studies = researches[researches.length-1].studies;

    if (targets[0].tickBonus < 0)
    {
        time.push(TimeFromTicks(totalTicks));
        totalTicks = 0;
    }

    playerData.timing.tick += targets[0].tickBonus;
    console.log(`${targets[0].name} reached in ${researches[researches.length-1].progTicks} ticks.`);
    console.log(TimeFromTicks(researches[researches.length-1].progTicks));

    for (let i = 1; i < targets.length; i++)
    {
        researches.push(ResearchTime(targets[i].cost, rate, studies, ticks, true, evoTicks));
        ticks = researches[researches.length-1].ticks;
        totalTicks += researches[researches.length-1].progTicks;
        evoTicks += researches[researches.length-1].progTicks;
        rate = researches[researches.length-1].rate * targets[i].rpBonus;
        studies = researches[researches.length-1].studies;

        if (targets[i].tickBonus < 0)
        {
            time.push(TimeFromTicks(totalTicks));
            totalTicks = 0;
        }

        playerData.timing.tick += targets[i].tickBonus;
        console.log(`${targets[i].name} reached in ${researches[researches.length-1].progTicks} ticks.`);
        console.log(TimeFromTicks(researches[researches.length-1].progTicks));
    }

    if (totalTicks > 0) time.push(TimeFromTicks(totalTicks));

    LoadPlayerData();

    for (let i = 0; i < time.length; i++)
    {
        console.log(`Segment ${i}: ${time[i]}`);
    }
}
