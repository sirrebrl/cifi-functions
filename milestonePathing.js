class ShardState
{
    shards = new Decimal(0);
    myBaseRate = new Decimal(0);
    rate = new Decimal(0);
    myOps = 0;
    myStudies = 0;
    opBonuses = [1, 1, 1];
    studyBonus = 1;

    constructor(shards, rate, ops, studies)
    {
        this.shards = new Decimal(shards);
        this.myOps = ops;
        this.myStudies = studies;
        this.opBonuses =
            [
                0.005 * this.myOps + 1,
                0.001 * playerData.demeter.effOp[0] * this.myOps + 1,
                0.002 * playerData.demeter.effOp[1] * this.myOps + 1
            ];
        this.studyBonus = 0.00003 * playerData.koios.crew * playerData.koios.drill * this.myStudies + 1;
        this.rate = new Decimal(rate);
        this.myBaseRate = this.rate.dividedBy(new Decimal(this.opBonuses[0] * this.opBonuses[1] * this.opBonuses[2] * this.studyBonus));
    }
    
    get baseRate() { return this.myBaseRate; }
    SetBaseRate(value)
    {
        this.myBaseRate = new Decimal(value);
        this.rate = (this.myBaseRate.times(new Decimal(this.opBonuses[0] * this.opBonuses[1] * this.opBonuses[2] * this.studyBonus)));
    }
    get ops() { return this.myOps; }
    SetOps(value)
    {
        this.myOps = value;
        this.opBonuses =
        [
            0.005 * this.myOps + 1,
            0.001 * playerData.demeter.effOp[0] * this.myOps + 1,
            0.002 * playerData.demeter.effOp[1] * this.myOps + 1
        ];
        this.rate = (this.myBaseRate.times(new Decimal(this.opBonuses[0] * this.opBonuses[1] * this.opBonuses[2] * this.studyBonus)));
    }
    get studies() { return this.myStudies; }
    SetStudies(value)
    {
        this.myStudies = value;
        this.studyBonus = 0.00003 * playerData.koios.crew * playerData.koios.drill * this.myStudies + 1;
        this.rate = (this.myBaseRate.times(new Decimal(this.opBonuses[0] * this.opBonuses[1] * this.opBonuses[2] * this.studyBonus)));
    }

    static get emptyState()
    {
        return new ShardState(0, 0, 0, 0);
    }
    static Duplicate(state)
    {
        return new ShardState(state.shards, state.rate, state.ops, state.studies);
    }

    OpForward()
    {
        this.shards = this.shards.plus(this.rate);
        this.SetOps(this.ops + 1);
    }
    OpBack()
    {
        this.SetOps(this.ops - 1);
        this.shards = this.shards.minus(this.rate);
    }
    StudyForward(studyBars)
    {
        this.SetStudies(this.studies + (studyBars * playerData.koios.multiStudy));
    }
    StudyBack()
    {
        this.SetStudies(this.studies - playerData.koios.multiStudy);
    }

    AdvanceState(ticks, baseMultiplier = 1, zeroShards = false)
    {
        let subTicks = 0;
        let studyBars = 0;
        for (let i = 0; i < ticks; i += playerData.timing.op)
        {
            subTicks += playerData.timing.op;
            studyBars = Math.floor(subTicks / playerData.timing.study);
            subTicks = subTicks % playerData.timing.study;
            this.StudyForward(studyBars);
            this.OpForward();
        }
        this.SetBaseRate(this.baseRate.times(baseMultiplier));
        if (zeroShards) { this.shards = new Decimal(0); }
    }

    ZeroState()
    {
        let ticks = 0;
        while ((this.shards - this.rate) >= 0)
        {
            ticks++;
            if (ticks % playerData.timing.op === 0) { this.OpBack(); }
            if (ticks % playerData.timing.study === 0) { this.StudyBack(); }
        }
        return ticks;
    }
}

class MilestoneStep
{
    state;
    composition;
    boosts;
    ticks;
    tickRate;
    tickCost;

    constructor(state, composition, boosts, ticks, tickRate, tickCost)
    {
        this.state = state;
        this.composition = composition;
        this.boosts = boosts;
        this.ticks = ticks;
        this.tickRate = tickRate;
        this.tickCost = tickCost;
    }
}

let shardOriginState = ShardState.emptyState;
let shardActiveState = ShardState.emptyState;

let pathing = false;

function GetMilestoneNextStage(milestone, level)
{
    milestone = RetrieveMilestone(milestone);

    if (level >= 75 || (milestone.rarity === 0 && level >= 50)) return 100;
    // What remains are rarity >= 1 && level < 75, and rarity === 0 && level < 50
    if (level >= 50) return 75;
    // What remains are level < 50
    if (level >= 25) return 50;
    // What remains are level < 25
    if (level >= 10 || (milestone.rarity < 2 && level >= 1)) return 25;
    // What remains are rarity >= 2 && level < 10, and rarity < 2 && level < 1
    if (level >= 5 || (milestone.rarity === 2 && level >= 1)) return 10;
    // What remains are rarity === 3 && level < 5, rarity < 3 && level < 1
    if (level >= 1) return 5;
    return 1;
}

function CalculateMilestoneTickCost(state, milestone, originLevel, targetLevel = originLevel + 1, fromZero = false)
{
    if (isNaN(milestone)) milestone = RetrieveMilestoneNumber(milestone);
    state = ShardState.Duplicate(state);
    if (fromZero) { state.ZeroState(); }

    let shardCost = GetMilestoneCost(milestone, originLevel, targetLevel);

    let ticks = 0;
    let subTicks = 0;
    let studyBars = 0;
    while (state.shards.lessThan(shardCost))
    {
        ticks += playerData.timing.op;
        subTicks += playerData.timing.op;
        studyBars = Math.floor(subTicks / playerData.timing.study);
        subTicks = subTicks % playerData.timing.study;
        state.StudyForward(studyBars);
        state.OpForward();

        if (ticks > 1e6) { break; }
    }

    return ticks;
}

function CalculateMilestoneBoosts(milestone, originLevel, targetLevel = originLevel + 1)
{
    if (isNaN(milestone)) milestone = RetrieveMilestoneNumber(milestone);
    milestone = RetrieveMilestone(milestone);

    let originPowers = [originLevel, 0, 0, 0, 0, 0];
    let targetPowers = [targetLevel, 0, 0, 0, 0, 0];
    let rarity = milestone.rarity;

    // First unlock power
    if (rarity === 3 && originLevel >= 5) { originPowers[1] = originLevel - 3; }
    else if (rarity === 2 && originLevel >= 10) { originPowers[1] = originLevel - 8; }
    else if (originLevel >= 25) { originPowers[1] = originLevel - 20; }

    if (rarity === 3 && targetLevel >= 5) { targetPowers[1] = targetLevel - 3; }
    else if (rarity === 2 && targetLevel >= 10) { targetPowers[1] = targetLevel - 8; }
    else if (targetLevel >= 25) { targetPowers[1] = targetLevel - 20; }

    // Second unlock power
    if (rarity === 3 && originLevel >= 10) { originPowers[2] = originLevel - 8; }
    else if (rarity === 2 && originLevel >= 25) { originPowers[2] = originLevel - 20; }
    else if (originLevel >= 50) { originPowers[2] = originLevel - 45; }

    if (rarity === 3 && targetLevel >= 10) { targetPowers[2] = targetLevel - 8; }
    else if (rarity === 2 && targetLevel >= 25) { targetPowers[2] = targetLevel - 20; }
    else if (targetLevel >= 50) { targetPowers[2] = targetLevel - 45; }

    // Third unlock power
    if (rarity === 3 && originLevel >= 25) { originPowers[3] = originLevel - 20; }
    else if (rarity === 2 && originLevel >= 50) { originPowers[3] = originLevel - 45; }
    else if (rarity === 1 && originLevel >= 75) { originPowers[3] = originLevel - 70; }

    if (rarity === 3 && targetLevel >= 25) { targetPowers[3] = targetLevel - 20; }
    else if (rarity === 2 && targetLevel >= 50) { targetPowers[3] = targetLevel - 45; }
    else if (rarity === 1 && targetLevel >= 75) { targetPowers[3] = targetLevel - 70; }

    // Fourth unlock power
    if (rarity === 3 && originLevel >= 50) { originPowers[4] = originLevel - 45; }
    else if (rarity === 2 && originLevel >= 75) { originPowers[4] = originLevel - 70; }

    if (rarity === 3 && targetLevel >= 50) { targetPowers[4] = targetLevel - 45; }
    else if (rarity === 2 && targetLevel >= 75) { targetPowers[4] = targetLevel - 70; }

    // Fifth unlock power
    if (rarity === 3 && originLevel >= 75) { originPowers[5] = originLevel - 70; }

    if (rarity === 3 && targetLevel >= 75) { targetPowers[5] = targetLevel - 70; }

    let boosts = 
    {
        cells: 1, mp: 1, shards: 1, rp: 1, tick: 0
    };
    for (let i = 0; i < (rarity + 3); i++)
    {
        let effect = milestone.bonuses[i].type;
        let power = Math.pow(milestone.bonuses[i].power, (targetPowers[i] - originPowers[i]));
        if (effect === 'tickspeed')
        {
            power = milestone.bonuses[i].power * (targetPowers[i] - originPowers[i]);
        }
        if (effect.includes('cells')) { boosts.cells *= power; }
        if (effect.includes('mk1')) { boosts.cells *= power; }
        if (effect.includes('mk2')) { boosts.cells *= power; }
        if (effect.includes('mk3')) { boosts.cells *= power; }
        if (effect.includes('mk4')) { boosts.cells *= power; }
        if (effect.includes('mk5')) { boosts.cells *= power; }
        if (effect.includes('mk6')) { boosts.cells *= power; }
        if (effect.includes('mk7')) { boosts.cells *= power; }
        if (effect.includes('mk8')) { boosts.cells *= power; }
        if (effect.includes('mp')) { boosts.mp *= power; }
        if (effect.includes('shards')) { boosts.shards *= power; }
        if (effect.includes('rp')) { boosts.rp *= power; }
        if (effect.includes('tickspeed')) { boosts.tick -= power; }
    }

    boosts.cells = Math.round((boosts.cells-1) * 100) / 100;
    boosts.mp = Math.round((boosts.mp-1) * 100) / 100;
    boosts.shards = Math.round((boosts.shards-1) * 100) / 100;
    boosts.rp = Math.round((boosts.rp-1) * 100) / 100;

    return boosts;
}

function ValuateMilestoneTarget(priorities, state, milestone, originLevel, targetLevel = originLevel + 1)
{
    state = ShardState.Duplicate(state);
    state.ZeroState();
    let tickCost = CalculateMilestoneTickCost(state, milestone, originLevel, targetLevel);
    let boosts = GetRelativeMilestoneBonus(milestone, originLevel, targetLevel);
    let tickBoost = playerData.timing.tick / (playerData.timing.tick + boosts.tick);

    state.AdvanceState(tickCost, boosts.shards, true);

    let value = ((boosts.cells-1) * priorities.cells * tickBoost / tickCost);
    value += ((boosts.mp-1) * priorities.mp / tickCost);
    value += ((boosts.shards-1) * priorities.shards * tickBoost / tickCost);
    value += ((boosts.rp-1) * priorities.rp * tickBoost / tickCost);

    let valuation =
    {
        state, tickCost, boosts, value, milestone, targetLevel
    };

    return valuation;
}

function ValuateShardPlusTarget(state, milestone, originLevel, targetLevel, tickLimit, tickCost)
{
    let originState = ShardState.Duplicate(state);
    let originTickTime = playerData.timing.tick;

    let boosts = GetRelativeMilestoneBonus(milestone, originLevel, targetLevel);
    originState.SetBaseRate(state.baseRate.times(boosts.shards));
    originState.shards = new Decimal(0);
    playerData.timing.tick += boosts.tick;

    state = ShardState.Duplicate(originState);

    let ticks = 0;
    let subTicks = 0;
    let studyBars = 0;
    while (ticks < tickLimit)
    {
        ticks += playerData.timing.op;
        subTicks += playerData.timing.op;
        studyBars = Math.floor(subTicks / playerData.timing.study);
        subTicks = subTicks % playerData.timing.study;
        state.StudyForward(studyBars);
        state.OpForward();
    }

    let valuation =
    {
        state: ShardState.Duplicate(originState), tickCost, boosts, value: state.shards, milestone, targetLevel, tickRate: playerData.timing.tick
    };

    playerData.timing.tick = originTickTime;

    return valuation;
}

function LerpPriorities(t)
{
    if (playerData.demeter.priorities.length === 1) { return playerData.demeter.priorities[0]; }

    let lowerPriority = playerData.demeter.priorities[0];
    let upperPriority = playerData.demeter.priorities[1];

    if (playerData.demeter.priorities.length > 2)
    {
        for (let i = 1; i < playerData.demeter.priorities.length; i++)
        {
            if (playerData.demeter.priorities[i].t > t)
            {
                upperPriority = playerData.demeter.priorities[i];
                lowerPriority = playerData.demeter.priorities[i - 1];
                break;
            }
        }
    }

    let partialT = (t - lowerPriority.t) / (upperPriority.t - lowerPriority.t);
    let cells = (upperPriority.cells - lowerPriority.cells) * partialT + lowerPriority.cells;
    let mp = (upperPriority.mp - lowerPriority.mp) * partialT + lowerPriority.mp;
    let shards = (upperPriority.shards - lowerPriority.shards) * partialT + lowerPriority.shards;
    let rp = (upperPriority.rp - lowerPriority.rp) * partialT + lowerPriority.rp;

    let lerpedPriorities = { t, cells, mp, shards, rp };
    return lerpedPriorities;
}

function GetPriorityMilestone(composition = playerData.demeter.milestones, runState = playerData.runState, multiPathing = false)
{
    let t = runState.currentTicks / runState.endTicks;
    let tickLimit = runState.endTicks - runState.currentTicks;
    let priorities = LerpPriorities(t);
    let state = ShardState.Duplicate(shardActiveState);

    let potentialTargets = [];
    let targetList = [];

    let totalMilestones = 0;
    for (let i = 0; i < gameDB.milestones.length; i++) { totalMilestones += composition[i]; }

    for (let i = 0; i < gameDB.milestones.length; i++)
    {
        if (composition[i] === 100) continue;
        if (totalMilestones < gameDB.milestones[i].unlock) continue;

        potentialTargets.push(
            {
                milestone: i,
                targetLevel: composition[i] + 1,
                shardCost: GetMilestoneCost(i, composition[i])
            }
        );

        let nextStage = GetMilestoneNextStage(i, composition[i]);
        if (nextStage === 100 || nextStage === composition[i] + 1) continue;

        potentialTargets.push(
            {
                milestone: i,
                targetLevel: nextStage,
                shardCost: GetMilestoneCost(i, composition[i], nextStage)
            }
        );
    }

    potentialTargets.sort((a,b) => { if (a.shardCost.greaterThan(b.shardCost)) { return -1; } else { return 1; }});

    let ticks = 0;
    let subTicks = 0;
    let studyBars = 0;

    let nextTarget = potentialTargets[potentialTargets.length - 1];
    while (potentialTargets.length > 0 && ticks < tickLimit)
    {
        ticks += playerData.timing.op;
        subTicks += playerData.timing.op;
        studyBars = Math.floor(subTicks / playerData.timing.study);
        subTicks = subTicks % playerData.timing.study;
        state.StudyForward(studyBars);
        state.OpForward();

        if (nextTarget.shardCost.lessThanOrEqualTo(state.shards))
        {
            let valuation = ValuateMilestoneTarget(priorities, shardActiveState, nextTarget.milestone, composition[nextTarget.milestone], nextTarget.targetLevel);
            valuation.tickCost = ticks;
            targetList.push(valuation);
            potentialTargets.pop();
            nextTarget = potentialTargets[potentialTargets.length - 1];
        }
    }

    if (targetList.length === 0)
    {
        if (pathing) return undefined;

        return 'no milestones found before end of run';
    }

    targetList.sort((a,b) => { if (a.value > b.value) { return -1; } else { return 1; }});
    let optimalTarget = targetList[0];

    if (pathing)
    {
        if (!multiPathing)
        {
            console.log(`${gameDB.milestones[optimalTarget.milestone].name} to ${optimalTarget.targetLevel} ( ${optimalTarget.tickCost} ticks / ${TimeFromTicks(optimalTarget.tickCost)} )`);
        }
        return optimalTarget;
    }

    return `The next priority milestone is ${gameDB.milestones[optimalTarget.milestone].name} to level ${optimalTarget.targetLevel}. It will be reached within ${optimalTarget.tickCost} ticks, or ${TimeFromTicks(optimalTarget.tickCost)}.`;
}

function GenerateMilestonePath(composition = playerData.demeter.milestones, runState = playerData.runState, multiPathing = false)
{
    console.time('pathing');
    pathing = true;

    let progressiveState = { endTicks: runState.endTicks, currentTicks: runState.currentTicks };

    let steps = [];
    steps.push(new MilestoneStep(ShardState.Duplicate(shardActiveState), [...composition], {cells: 0, mp: 0, shards: 0, rp: 0, tick: 0}, runState.currentTicks, playerData.timing.tick, 0));

    while (progressiveState.currentTicks < progressiveState.endTicks)
    {
        shardActiveState = steps[steps.length - 1].state;
        let nextMilestone = GetPriorityMilestone(composition, progressiveState, multiPathing);

        if (nextMilestone)
        {
            let newShardState = ShardState.Duplicate(steps[steps.length - 1].state);
            newShardState.AdvanceState(nextMilestone.tickCost, nextMilestone.boosts.shards, true);
            composition[nextMilestone.milestone] = nextMilestone.targetLevel;
            progressiveState.currentTicks += nextMilestone.tickCost;
            playerData.timing.tick += nextMilestone.boosts.tick;
            steps.push(new MilestoneStep(ShardState.Duplicate(newShardState), [...composition], nextMilestone.boosts, progressiveState.currentTicks, playerData.timing.tick, nextMilestone.tickCost));
        }
        else { break; }
    }

    LoadPlayerData();

    let finalBoosts = {cells: 1, mp: 1, shards: 1, rp: 1, tick: 0};
    for (let i = 1; i < steps.length; i++)
    {
        finalBoosts.cells *= (steps[i].boosts.cells);
        finalBoosts.mp *= (steps[i].boosts.mp);
        finalBoosts.shards *= (steps[i].boosts.shards);
        finalBoosts.rp *= (steps[i].boosts.rp);
        finalBoosts.tick += steps[i].boosts.tick;
    }
    let tickBoost = playerData.timing.tick / (playerData.timing.tick + finalBoosts.tick);

    finalBoosts.cells *= tickBoost;
    finalBoosts.shards *= tickBoost;
    finalBoosts.rp *= tickBoost;

    if (!multiPathing)
    {
        pathing = false;
    
        console.log(`x ${Math.round(finalBoosts.cells * 100) / 100} to cells`);
        console.log(`x ${Math.round(finalBoosts.mp * 100) / 100} to mp`);
        console.log(`x ${Math.round(finalBoosts.shards * 100) / 100} to shards`);
        console.log(`x ${Math.round(finalBoosts.rp * 100) / 100} to rp`);
    }

    console.timeEnd('pathing');

    if (multiPathing)
    {
        let pathData = { steps, finalBoosts };
        return pathData;
    }

    return steps;
}

function GetOptimalShardMilestone(composition = playerData.demeter.milestones, runState = playerData.runState, multiPathing = false)
{
    let tickLimit = runState.endTicks - runState.currentTicks;
    let state = ShardState.Duplicate(shardActiveState);

    let potentialTargets = [];
    let targetList = [];

    let totalMilestones = 0;
    for (let i = 0; i < gameDB.milestones.length; i++) { totalMilestones += composition[i]; }

    for (let i = 0; i < gameDB.milestones.length; i++)
    {
        if (composition[i] === 100) continue;
        if (totalMilestones < gameDB.milestones[i].unlock) continue;

        let relativeBonus = GetRelativeMilestoneBonus(i, composition[i]);
        if (relativeBonus.shards > 1 || relativeBonus.tick < 0)
        {
            potentialTargets.push(
                {
                    milestone: i,
                    targetLevel: composition[i] + 1,
                    shardCost: GetMilestoneCost(i, composition[i])
                }
            );
        }

        let nextStage = GetMilestoneNextStage(i, composition[i]);
        if (nextStage === 100 || nextStage === composition[i] + 1) continue;

        relativeBonus = GetRelativeMilestoneBonus(i, composition[i], nextStage);
        if (relativeBonus.shards > 1 || relativeBonus.tick < 0)
        {
            potentialTargets.push(
                {
                    milestone: i,
                    targetLevel: nextStage,
                    shardCost: GetMilestoneCost(i, composition[i], nextStage)
                }
            );
        }
    }

    potentialTargets.sort((a,b) => { if (a.shardCost.greaterThan(b.shardCost)) { return -1; } else { return 1; }});

    let ticks = 0;
    let subTicks = 0;
    let studyBars = 0;

    let nextTarget = potentialTargets[potentialTargets.length - 1];
    while (potentialTargets.length > 0 && ticks < tickLimit)
    {
        ticks += playerData.timing.op;
        subTicks += playerData.timing.op;
        studyBars = Math.floor(subTicks / playerData.timing.study);
        subTicks = subTicks % playerData.timing.study;
        state.StudyForward(studyBars);
        state.OpForward();

        if (nextTarget.shardCost.lessThanOrEqualTo(state.shards))
        {
            let valuation = ValuateShardPlusTarget(state, nextTarget.milestone, composition[nextTarget.milestone], nextTarget.targetLevel, tickLimit - ticks, ticks);
            targetList.push(valuation);
            potentialTargets.pop();
            nextTarget = potentialTargets[potentialTargets.length - 1];
        }
    }

    if (targetList.length === 0)
    {
        if (pathing) return undefined;

        return 'no shard+ milestones found before end of run';
    }

    targetList.sort((a,b) => { if (a.value.greaterThan(b.value)) { return -1; } else { return 1; }});

    let optimalTarget = targetList[0];

    if (pathing)
    {
        if (!multiPathing)
        {
            console.log(`${gameDB.milestones[optimalTarget.milestone].name} to ${optimalTarget.targetLevel} ( ${optimalTarget.tickCost} ticks / ${TimeFromTicks(optimalTarget.tickCost)} )`);
        }
        return optimalTarget;
    }

    return `The next priority milestone is ${gameDB.milestones[optimalTarget.milestone].name} to level ${optimalTarget.targetLevel}. It will be reached within ${optimalTarget.tickCost} ticks, or ${TimeFromTicks(optimalTarget.tickCost)}.`;
}

function PathComparison(stepA, stepB, priorities, prepathA)
{
    shardActiveState = ShardState.Duplicate(stepA.state);
    let pathA = prepathA || GenerateMilestonePath([...stepA.composition], {endTicks: playerData.runState.endTicks, currentTicks: stepA.ticks}, true);

    if (!stepB.state) { console.log(stepB); }
    shardActiveState = ShardState.Duplicate(stepB.state);
    let pathB = GenerateMilestonePath([...stepB.composition], {endTicks: playerData.runState.endTicks, currentTicks: stepB.ticks}, true);

    let valueA = (stepA.boosts.cells * pathA.finalBoosts.cells - 1) * priorities.cells + 1;
    valueA *= (stepA.boosts.mp * pathA.finalBoosts.mp - 1) * priorities.mp + 1;
    valueA *= (stepA.boosts.rp * pathA.finalBoosts.rp - 1) * priorities.rp + 1;

    let valueB = (pathB.finalBoosts.cells - 1) * priorities.cells + 1;
    valueB *= (pathB.finalBoosts.mp - 1) * priorities.mp + 1;
    valueB *= (pathB.finalBoosts.rp - 1) * priorities.rp + 1;

    console.log(`Value A: ${valueA}`);
    console.log(`Value B: ${valueB}`);

    let compositionA = pathA.steps[pathA.steps.length - 1].composition;
    let compositionB = pathB.steps[pathB.steps.length - 1].composition;
    let identical = true;
    for (let i = 0; i < gameDB.milestones.length; i++)
    {
        if (compositionA[i] !== compositionB[i])
        {
            identical = false;
            break;
        }
    }

    let result =
    {
        stepBack: valueB > valueA && !identical,
        prepath: (valueB > valueA) ? pathB : pathA,
        pathA
    };

    return result;
}

function GetNewMilestone(compositionA, compositionB)
{
    for (let i = 0; i < gameDB.milestones.length; i++)
    {
        if (compositionA[i] > compositionB[i])
        {
            let newMilestone = { name: gameDB.milestones[i].name, targetLevel: compositionA[i] };
            return newMilestone;
        }
    }
}

function CompilePath(steps, postSteps = [])
{
    for (let i = 0; i < postSteps.length; i++) { steps.push(postSteps[i]); }

    let path = ['Path:'];
    let purchase = 1;
    for (let i = 1; i < steps.length; i++)
    {
        let newMilestone = GetNewMilestone(steps[i].composition, steps[i-1].composition);
        if (newMilestone)
        {
            path.push(`(${purchase}) ${newMilestone.name} to ${newMilestone.targetLevel} ( ${TimeFromTicks(steps[i].tickCost)} )`);
            purchase++;
        }
    }
    console.log(path);

    let powers =
    {
        cells: 1,
        mp: 1,
        shards: 1,
        rp: 1,
        tick: 0
    };
    let originComposition = steps[0].composition;
    let finalComposition = steps[steps.length - 1].composition;
    for (let i = 0; i < gameDB.milestones.length; i++)
    {
        let thisPower = GetRelativeMilestoneBonus(i, originComposition[i], finalComposition[i]);
        powers.cells *= thisPower.cells;
        powers.mp *= thisPower.mp;
        powers.shards *= thisPower.shards;
        powers.rp *= thisPower.rp;
        powers.tick += thisPower.tick;
    }

    let netBonuses = ['Net Bonuses'];
    netBonuses.push(`Cells: x ${Math.round(powers.cells * 100) / 100}`);
    netBonuses.push(`MP: x ${Math.round(powers.mp * 100) / 100}`);
    netBonuses.push(`Shards: x ${Math.round(powers.shards * 100) / 100}`);
    netBonuses.push(`RP: x ${Math.round(powers.rp * 100) / 100}`);
    netBonuses.push(`Tick Interval: ${Math.round(powers.tick * 100) / 100}`);

    console.log(netBonuses);
}

function GenerateShardReversePath(cellPriority, mpPriority, rpPriority, composition = playerData.demeter.milestones, runState = playerData.runState)
{
    console.time('shardPathing');
    pathing = true;

    let originShardState = ShardState.Duplicate(shardActiveState);

    let progressiveState = { endTicks: runState.endTicks, currentTicks: runState.currentTicks };
    let terminalPriorities =
    {
        cells: cellPriority,
        mp: mpPriority,
        rp: rpPriority
    };

    let steps = [];
    steps.push(new MilestoneStep(ShardState.Duplicate(shardActiveState), [...composition], {cells: 0, mp: 0, shards: 0, rp: 0, tick: 0}, runState.currentTicks, playerData.timing.tick, 0));

    console.log('generating shard+ path');
    while (progressiveState.currentTicks < progressiveState.endTicks)
    {
        shardActiveState = steps[steps.length - 1].state;
        playerData.timing.tick = steps[steps.length - 1].tickRate;
        let nextMilestone = GetOptimalShardMilestone(composition, progressiveState, true);

        if (nextMilestone)
        {
            composition[nextMilestone.milestone] = nextMilestone.targetLevel;
            progressiveState.currentTicks += nextMilestone.tickCost;
            playerData.timing.tick = nextMilestone.tickRate;
            steps.push(new MilestoneStep(ShardState.Duplicate(nextMilestone.state), [...composition], nextMilestone.boosts, progressiveState.currentTicks, playerData.timing.tick, nextMilestone.tickCost));
            // console.log(steps[steps.length - 1].composition);
        }
        else { break; }
    }
    console.log('shard+ path generated');

    console.log('initiating reverse pathing');
    let optimalPath;
    if (steps.length > 1)
    {
        let stepA = steps[steps.length - 1];
        let stepB = steps[steps.length - 2];

        let compareAB = PathComparison(stepA, stepB, terminalPriorities);
        let prepath = compareAB.prepath;
        CompilePath([...steps], [...compareAB.pathA.steps]);

        while (compareAB.stepBack && steps.length > 2)
        {
            let stepbackTarget = GetNewMilestone(stepA.composition, stepB.composition);
            console.log(`stepping back ${stepbackTarget.name} to ${stepbackTarget.targetLevel}`);
            steps.pop();
            stepA = steps[steps.length - 1];
            stepB = steps[steps.length - 2];
            compareAB = PathComparison(stepA, stepB, terminalPriorities, prepath);
            prepath = compareAB.prepath;
            CompilePath([...steps], [...compareAB.pathA.steps]);
        }

        optimalPath = prepath.steps;
    }
    console.log('reverse pathing complete');

    for (let i = 0; i < optimalPath.length; i++)
    {
        if (optimalPath[i].tickCost === 0) { continue; }
        let identical = true;
        for (let milestone = 0; milestone < gameDB.milestones.length; milestone++)
        {
            if (steps[steps.length - 1].composition[milestone] < optimalPath[i].composition[milestone]) { identical = false; break; }
        }
        if (identical) { continue; }
        steps.push(optimalPath[i]);
        // console.log(steps[steps.length - 1].composition);
    }

    // for (let i = 0; i < steps.length; i++) { console.log(steps[i].composition); console.log(steps[i].tickCost); console.log('---'); }

    // return;

    CompilePath(steps);

    LoadPlayerData();
    shardActiveState = ShardState.Duplicate(originShardState);

    pathing = false;

    console.timeEnd('shardPathing');
}