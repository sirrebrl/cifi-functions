const blankPlayer =
{
    level: 0,
    runState:
        {
            endTicks: 1e5,
            currentTicks: 0
        },
    mods:
        {
            fastLoop: [0, 0, 0, 0, 0],
            roSeven: 0,
            gCorp: 0,
            beta: 0,
            rop: 0
        },
    cellGoal: new Decimal(1),
    timing:
        {
            tick: 8,
            op: 65,
            study: 10
        },
    hephaestus:
        {
            crew: 0,
            machina: 0,
            blueprints: 0
        },
    demeter:
        {
            effOp: [0, 0],
            milestones: 
                [
                    0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0, 0
                ],
            priorities:
                [
                    {
                        t: 0,
                        cells: 1, mp: 1, shards: 1, rp: 1
                    }
                ]
        },
    koios:
        {
            crew: 0,
            drill: 0,
            brainium: 0,
            multiStudy: 1,
            researchTargets: [],
            evo: { power: 1, ticks: 0 }
        }
};

let playerData = JSON.parse(localStorage.getItem('CIFIplayerdata')) || blankPlayer;

function SavePlayerData()
{
    localStorage.setItem('CIFIplayerdata', JSON.stringify(playerData));
}

function LoadPlayerData()
{
    playerData = JSON.parse(localStorage.getItem('CIFIplayerdata'))
}

function SetCellGoal(goal) { playerData.cellGoal = new Decimal(goal); SavePlayerData(); }

function SetRunState(endTicks, currentTicks) { playerData.runState = {endTicks,currentTicks}; SavePlayerData(); }

function SetTiming(tick, op, study) { playerData.timing = { tick, op, study }; SavePlayerData(); }

function SetEffOpLevels(mk1, mk2) { playerData.demeter.effOp = [ mk1, mk2 ]; SavePlayerData(); }

function SetMilestoneSingle(milestone, level)
{
    const milestoneNumber = RetrieveMilestoneNumber(milestone);
    playerData.demeter.milestones[milestoneNumber] = level;
    SavePlayerData();
}

function SetMilestoneAll(levels) { playerData.demeter.milestones = [...levels]; SavePlayerData(); }

function SetShardPriorities(prioritySet)
{
    let spliceIndex = -1;
    let foundSplice = false;
    for (let i = 0; i < playerData.demeter.priorities.length; i++)
    {
        if (playerData.demeter.priorities[i].t === prioritySet.t)
        {
            playerData.demeter.priorities[i] = prioritySet;
            SavePlayerData();
            return;
        }
        if (playerData.demeter.priorities[i].t > prioritySet.t)
        {
            spliceIndex = i;
            foundSplice = true;
            break;
        }
    }
    
    if (foundSplice)
    {
        playerData.demeter.priorities.splice(spliceIndex, 0, prioritySet);
        SavePlayerData();
        return;
    }

    playerData.demeter.priorities.push(prioritySet);
    SavePlayerData();
}

function ClearShardPriorities()
{
    playerData.demeter.priorities =
    [
        {
            t: 0,
            cells: 1, mp: 1, shards: 1, rp: 1
        }
    ];
    SavePlayerData();
}

function SetKoiosData(crew, drill, brainium, multiStudy)
{ 
    playerData.koios.crew = crew;
    playerData.koios.drill = drill;
    playerData.koios.brainium = brainium;
    playerData.koios.multiStudy = multiStudy;
    SavePlayerData(); 
}

const shardMS = 
{
    num(id) { return this[gameDB.milestones[id - 1].name]; }
};

function GenerateMilestoneAccess()
{
    for (let i = 0; i < gameDB.milestones.length; i++)
    {
        let milestoneName = gameDB.milestones[i].name;
        shardMS[milestoneName] =
        {
            id: i,
            name: milestoneName,
            get lv() { return playerData.demeter.milestones[this.id]; },
            set lv(val) { playerData.demeter.milestones[this.id] = val; SavePlayerData(); },
            get nextTickCost()
            {
                return CalculateMilestoneTickCost(shardActiveState, this.id, this.lv);
            },
            get stageTickCost()
            {
                return CalculateMilestoneTickCost(shardActiveState, this.id, this.lv, GetMilestoneNextStage(this.id, this.lv));
            }
        };
    }
}

GenerateMilestoneAccess();
