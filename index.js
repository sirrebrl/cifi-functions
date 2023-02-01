function SimulateGenTicks(tickLimit, stats)
{
    while (stats.length < 14)
    {
        stats.push(1);
        stats.push(0);
    }

    let altAlpha = stats.map(stat => new Decimal(stat));

    let altBeta = [...altAlpha];

    let ticks = 0;
    let dtLimit = tickLimit * 0.5;
    for (let dualTicks = 0; dualTicks < dtLimit; dualTicks++)
    {
        for (let i = 0; i < 7; i++)
        {
            altBeta[i * 2] = altAlpha[i * 2].plus(altAlpha[i * 2 + 1]);
        }
        for (let i = 0; i < 6; i++)
        {
            altBeta[i * 2 + 1] = altAlpha[i * 2 + 1].dividedBy(altAlpha[(i + 1) * 2]).times(altBeta[(i + 1) * 2]);
        }

        if (altBeta[0].greaterThanOrEqualTo(playerData.cellGoal))
        {
            ticks = dualTicks * 2 + 1;
            break;
        }

        for (let i = 0; i < 6; i++)
        {
            altAlpha[i * 2] = altBeta[i * 2].plus(altBeta[i * 2 + 1]);
        }
        for (let i = 0; i < 5; i++)
        {
            altAlpha[i * 2 + 1] = altBeta[i * 2 + 1].dividedBy(altBeta[(i + 1) * 2]).times(altAlpha[(i + 1) * 2]);
        }

        if (altAlpha[0].greaterThanOrEqualTo(playerData.cellGoal))
        {
            ticks = (dualTicks + 1) * 2;
            break;
        }
    }

    if (ticks === 0)
    {
        let limitSeconds = Math.ceil(tickLimit * playerData.timing.tick);
        let limitDays = Math.floor(limitSeconds / (3600 * 24));
        limitSeconds = limitSeconds % (3600 * 24);
        let limitHours = Math.floor(limitSeconds / 3600);
        limitSeconds = limitSeconds % 3600;
        let limitMinutes = Math.floor(limitSeconds / 60);
        limitSeconds = limitSeconds % 60;

        let limitTime = `${(limitDays > 0) ? limitDays + ' Days, ' : ''}${((limitHours < 10) ? '0' : '') + limitHours + ':'}${((limitMinutes < 10) ? '0' : '') + limitMinutes + ':'}${((limitSeconds < 10) ? '0' : '') + limitSeconds}`;

        console.log("Goal is not reached within the given tick limit.");
        console.log(`Goal: ${decString(playerData.cellGoal)}`);
        console.log(`The given tick limit (${tickLimit}) is ${limitTime} and you will reach ${decString(altAlpha[1])} cells/tick by that time.`);
        return;
    }

    let goalSeconds = Math.ceil(ticks * playerData.timing.tick);
    let goalDays = Math.floor(goalSeconds / (3600 * 24));
    goalSeconds = goalSeconds % (3600 * 24);
    let goalHours = Math.floor(goalSeconds / 3600);
    goalSeconds = goalSeconds % 3600;
    let goalMinutes = Math.floor(goalSeconds / 60);
    goalSeconds = goalSeconds % 60;

    let goalTime = `You will reach the goal within ${(goalDays > 0) ? goalDays + ' Days, ' : ''}${((goalHours < 10) ? '0' : '') + goalHours + ':'}${((goalMinutes < 10) ? '0' : '') + goalMinutes + ':'}${((goalSeconds < 10) ? '0' : '') + goalSeconds}`;
    console.log(goalTime);

    let goalGain = ((ticks % 2) === 0) ? altAlpha[1] : altBeta[1];
    console.log(`At that time you will be gaining ${decString(goalGain)} cells per tick.`);

}



function TimetoKoiosRank(currentRank, progress, goalRank, getTicks = false)
{
    let studiesNeeded = 0;
    for (let i = currentRank; i < goalRank; i++) studiesNeeded += gameDB.koiosRanks[i];
    studiesNeeded -= progress;
    let studyBars = Math.ceil(studiesNeeded / playerData.koios.multiStudy);

    if (getTicks) { return (studyBars * playerData.timing.study); }

    let goalSeconds = Math.ceil(studyBars * playerData.timing.study * playerData.timing.tick);
    let goalDays = Math.floor(goalSeconds / (3600 * 24));
    goalSeconds = goalSeconds % (3600 * 24);
    let goalHours = Math.floor(goalSeconds / 3600);
    goalSeconds = goalSeconds % 3600;
    let goalMinutes = Math.floor(goalSeconds / 60);
    goalSeconds = goalSeconds % 60;

    let goalTime = `You will reach the goal within ${(goalDays > 0) ? goalDays + ' Days, ' : ''}${((goalHours < 10) ? '0' : '') + goalHours + ':'}${((goalMinutes < 10) ? '0' : '') + goalMinutes + ':'}${((goalSeconds < 10) ? '0' : '') + goalSeconds}`;
    console.log(goalTime);
    goalDays = Math.ceil(studyBars * playerData.timing.study * playerData.timing.tick) / (3600 * 24);
    goalDays = Math.round(goalDays * 100) / 100;
    console.log(`(${goalDays} Days)`);
    console.log(`(${studyBars * playerData.timing.study} Ticks)`);
}

function TimetoDemeterRank(currentRank, progress, goalRank)
{
    let opsNeeded = 0;
    for (let i = currentRank; i < goalRank; i++) opsNeeded += gameDB.demeterRanks[i];
    opsNeeded -= progress;

    let goalSeconds = Math.ceil(opsNeeded * playerData.timing.op * playerData.timing.tick);
    let goalDays = Math.floor(goalSeconds / (3600 * 24));
    goalSeconds = goalSeconds % (3600 * 24);
    let goalHours = Math.floor(goalSeconds / 3600);
    goalSeconds = goalSeconds % 3600;
    let goalMinutes = Math.floor(goalSeconds / 60);
    goalSeconds = goalSeconds % 60;

    let goalTime = `You will reach the goal within ${(goalDays > 0) ? goalDays + ' Days, ' : ''}${((goalHours < 10) ? '0' : '') + goalHours + ':'}${((goalMinutes < 10) ? '0' : '') + goalMinutes + ':'}${((goalSeconds < 10) ? '0' : '') + goalSeconds}`;
    console.log(goalTime);
    goalDays = Math.ceil(opsNeeded * playerData.timing.op * playerData.timing.tick) / (3600 * 24);
    goalDays = Math.round(goalDays * 100) / 100;
    console.log(`(${goalDays} Days)`);
    console.log(`(${opsNeeded * playerData.timing.op} Ticks)`);
}

function InterestTest(bankSize, interest)
{
    console.log(`Current Model: ${Math.pow(bankSize,interest)} Tokens from ${bankSize} Chests`);

    let bank = 0;
    let chests = 0;
    while (bank < bankSize)
    {
        bank = Math.pow(bank, interest);
        bank++;
        chests++;
    }
    console.log(`Interest Compounds On Chest, Interest Counted In Bank, Interest Calculated Before Chest Added:
    ${bank} Tokens from ${chests} Chests`);

    bank = 0;
    chests = 0;
    while (bank < bankSize)
    {
        bank++;
        chests++;
        bank = Math.pow(bank, interest);
    }
    console.log(`Interest Compounds On Chest, Interest Counted In Bank, Interest Calculated After Chest Added:
    ${bank} Tokens from ${chests} Chests`);

    bank = 0;
    chests = 0;
    while (chests < bankSize)
    {
        bank = Math.pow(bank, interest);
        bank++;
        chests++;
    }
    console.log(`Interest Compounds On Chest, Interest Extends Bank Limit, Interest Calculated Before Chest Added:
    ${bank} Tokens from ${chests} Chests`);

    bank = 0;
    chests = 0;
    while (chests < bankSize)
    {
        bank++;
        chests++;
        bank = Math.pow(bank, interest);
    }
    console.log(`Interest Compounds On Chest, Interest Extends Bank Limit, Interest Calculated After Chest Added:
    ${bank} Tokens from ${chests} Chests`);
}

function InterestComparison(bankSize, interestValue)
{
    console.log('This function calculates optimized interest-token per chest-token under different models of interest and withdrawal.');

    let currentModel = Math.pow(bankSize, interestValue) / bankSize - 1;
    currentModel = Math.round(currentModel * 100) / 100;
    console.log(`Under the current model, with a bank limit of ${bankSize} and interest exponent of ${interestValue}, you will optimally gain ${currentModel} interest tokens per chest.`);

    console.log('This next model is based on a hidden underlying base on which interest is calculated, and interest is included in the bank for purposes of reaching the limit. Partial withdrawals are permitted.');
    let hiddenBank = 1;
    let totalBank = Math.pow(hiddenBank, interestValue);
    while (totalBank < bankSize)
    {
        hiddenBank++;
        totalBank = Math.pow(hiddenBank, interestValue);
    }
    let bankRange = [hiddenBank - 1, hiddenBank];
    let developingPrecision = true;
    let finalResult = 0;
    let newLimit = 0;
    while (developingPrecision)
    {
        let bankTest = (bankRange[0] + bankRange[1]) / 2;
        let measure = Math.pow(bankTest, interestValue) / bankSize - 1;
        if (measure > 0) bankRange[1] = bankTest;
        if (measure < 0) bankRange[0] = bankTest;
        if (Math.abs(measure) < 0.0001)
        {
            developingPrecision = false;
            finalResult = (bankSize - Math.pow(bankTest - 1, interestValue)) - 1;
            newLimit = bankTest;
        }
    }
    finalResult = Math.round(finalResult * 100) / 100;
    newLimit = Math.round(newLimit * 100) / 100;
    console.log(`Under this model, you will optimally gain ${finalResult} interest tokens per chest.`);
    console.log(`The hidden bank limit is effectively reduced to ${newLimit} tokens on which the interest is calculated.`);

    console.log('This next model is based on interest extending the bank limit, with the limit applying to the tokens interest is calculated on. Partial withdrawals are permitted.');
    let effectiveLimit = Math.pow(bankSize, interestValue);
    let oneUnder = Math.pow(bankSize - 1, interestValue);
    finalResult = (effectiveLimit - oneUnder) - 1;
    finalResult = Math.round(finalResult * 100) / 100;
    console.log(`Under this model, you will optimally gain ${finalResult} interest tokens per chest.`);

    console.log('Notably, under these alternative models, partial withdrawals require a calculation to be performed to identify the base value which corresponds to the new total bank when interest is applied.');
    console.log('Models which avoid this by compounding interest were explored and found to provide a significant excess of tokens very quickly, drastically beyond the current balance.')
}

function decString(value)
{
    let valString = value.toString();
    const indE = valString.indexOf('e');
    const indDot = valString.indexOf('.');
    if (indE === -1 || indDot === -1 || (indE - indDot) < 4) { return valString; }

    let mantissa = valString.substring(0, indDot + 4);
    while (mantissa.charAt(mantissa.length - 1) === '0')
    { mantissa = mantissa.substring(0, mantissa.length - 1); }
    if (mantissa.charAt(mantissa.length - 1) === '.')
    { mantissa = mantissa.substring(0, mantissa.length - 1); }

    return mantissa + valString.substring(indE, valString.length);
}

function TicksFromTime(days, hours, minutes, seconds)
{
    hours += (days * 24);
    minutes += (hours * 60);
    seconds += (minutes * 60);
    return Math.floor(seconds / playerData.timing.tick);
}

function TimeFromTicks(ticks)
{
    let goalSeconds = Math.ceil(ticks * playerData.timing.tick);
    let goalDays = Math.floor(goalSeconds / (3600 * 24));
    goalSeconds = goalSeconds % (3600 * 24);
    let goalHours = Math.floor(goalSeconds / 3600);
    goalSeconds = goalSeconds % 3600;
    let goalMinutes = Math.floor(goalSeconds / 60);
    goalSeconds = goalSeconds % 60;

    let goalTime = `${(goalDays > 0) ? goalDays + ' Days, ' : ''}${((goalHours < 10) ? '0' : '') + goalHours + ':'}${((goalMinutes < 10) ? '0' : '') + goalMinutes + ':'}${((goalSeconds < 10) ? '0' : '') + goalSeconds}`;
    return goalTime;
}

function TestDL()
{
    let stats = [0, '2.13e567','9.3e333','2.1e330',1.09e242,1.62e238,7.19e151,6.33e147,9.45e91,5.09e87,1.27e38,3.89e33,32.56e6,301.92];
    let ticks = TicksFromTime(10, 0, 0, 0);

    SetCellGoal('1e650');
    SimulateGenTicks(ticks, stats);

    let studies = 0;
    for (let i = 0; i < 36; i++)
    {
        studies += gameDB.koiosRanks[i];
    }
    let multi = 0.001 * studies * 28;

    for (let i = 0; i < 7; i++)
    {
        let index = i * 2 + 1;
        stats[index] = decString(new Decimal(stats[index]).times(multi));
    }
    ticks = TicksFromTime(1,0,0,0);

    SimulateGenTicks(ticks,stats);
}

// At level 99, with max fast loops [5,4,3,2,1] and 1 each roSeven, gCorp, beta
// 24(414) >-(+184)-> 25(598) >-(+192)-> 26(790)
function TickLoopRequirement(loopNum)
{
    let power = Math.max(1, loopNum);
    let growth = loopNum * 0.025 + 1;
    let scalar = 60;
    let constant = 500;
    let loopBase = (loopNum * power) + (loopNum * scalar) + constant;

    let loopReduction = playerData.mods.fastLoop[0] * 20;
    loopReduction += playerData.mods.fastLoop[1] * 25;
    loopReduction += playerData.mods.fastLoop[2] * 30;
    loopReduction += playerData.mods.fastLoop[3] * 35;
    loopReduction += playerData.mods.fastLoop[4] * 100;
    loopReduction += playerData.mods.gCorp * 10;
    loopReduction += playerData.mods.roSeven * 77;
    loopReduction += playerData.mods.beta * (playerData.level - 42) * 30;

    let loopRequirement = loopBase - loopReduction;
    loopRequirement *= (loopNum < 20) ? 1 : growth;

    return Math.round(Math.max(1, loopRequirement));
}

function tickLoopsInTime(days, hours, minutes, loopsDone = 0, currentRequirement = 0, progress = 0)
{
    let tickLimit = TicksFromTime(days, hours, minutes, 0);

    let currentLoop = 0;
    if (currentRequirement > 0)
    {
        let foundLoop = false;
        while (!foundLoop)
        {
            if (TickLoopRequirement(currentLoop) === currentRequirement) { foundLoop = true; }
            else { currentLoop++; }
        }
    }
    else { currentLoop = loopsDone; }

    let spentTicks = progress * -1;
    let newLoop = currentLoop;
    while (spentTicks < tickLimit)
    {
        spentTicks += TickLoopRequirement(newLoop);
        if (spentTicks <= tickLimit) { newLoop++; }
    }

    return newLoop - currentLoop;
}

/*

((StartTicksNeeded - TotalLoopTickReduction) + (loopNum * 60) + (loopNum * (power))) * (1 + (loopNum * 0.025))

*/