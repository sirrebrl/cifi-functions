function MissionProduction(missionPowers, hours, currentCycle = [0, 0, 0], resources = {AP:0}, reportingType = 'on mission complete')
{
    let scoutTime = gameDB.missions[0].time / missionPowers[0];
    let salvageTime = gameDB.missions[1].time / missionPowers[1];
    let materialTime = gameDB.missions[2].time / missionPowers[2];

    let scoutCycle = currentCycle[0] || scoutTime;
    let salvageCycle = currentCycle[1] || salvageTime;
    let materialCycle = currentCycle[2] || materialTime;

    let totalTime = hours * 60;
    let progressTime = 0;

    while (totalTime > progressTime)
    {
        progressTime++;

        scoutCycle--;
        salvageCycle--;
        materialCycle--;

        let missionComplete = false;

        if (scoutCycle <= 0)
        {
            for (let i = 0; i < gameDB.missions[0].resources.length; i++)
            {
                if (!resources[gameDB.missions[0].resources[i].name])
                {
                    resources[gameDB.missions[0].resources[i].name] = 0;
                }
                resources[gameDB.missions[0].resources[i].name] += gameDB.missions[0].resources[i].amount;
            }

            scoutCycle += scoutTime;
            missionComplete = true;
        }

        if (salvageCycle <= 0)
        {
            for (let i = 0; i < gameDB.missions[1].resources.length; i++)
            {
                if (!resources[gameDB.missions[1].resources[i].name])
                {
                    resources[gameDB.missions[1].resources[i].name] = 0;
                }
                resources[gameDB.missions[1].resources[i].name] += gameDB.missions[1].resources[i].amount;
            }
            
            salvageCycle += salvageTime;
            missionComplete = true;
        }

        if (materialCycle <= 0)
        {
            for (let i = 0; i < gameDB.missions[2].resources.length; i++)
            {
                if (!resources[gameDB.missions[2].resources[i].name])
                {
                    resources[gameDB.missions[2].resources[i].name] = 0;
                }
                resources[gameDB.missions[2].resources[i].name] += gameDB.missions[2].resources[i].amount;
            }
            
            materialCycle += materialTime;
            missionComplete = true;
        }

        if (missionComplete && reportingType === 'on mission complete')
        {
            console.log(`At ${progressTime} minutes, resources accumulated are:`);
            let resourceTypes = Object.keys(resources);
            for (let i = 0; i < resourceTypes.length; i++)
            {
                console.log(`-- ${resourceTypes[i]}: ${resources[resourceTypes[i]]}`);
            }
        }
    }

    if (reportingType === 'on final time')
    {
        console.log(`At ${totalTime} minutes, resources accumulated are:`);
        let resourceTypes = Object.keys(resources);
        for (let i = 0; i < resourceTypes.length; i++)
        {
            console.log(`-- ${resourceTypes[i]}: ${resources[resourceTypes[i]]}`);
        }
    }
}

function MaximizeAP(personnel)
{
    let scoutMission =
    {
        personnel: 0,
        power: 0,
        APPower(nextP) { return gameDB.missions[0].resources[0].amount / gameDB.missions[0].time * (this.personnel + nextP); }
    }
    let salvageMission =
    {
        personnel: 0,
        power: 0,
        APPower(nextP) { return gameDB.missions[1].resources[0].amount / gameDB.missions[1].time * (this.personnel + nextP); }
    }
    let materialMission =
    {
        personnel: 0,
        power: 0,
        APPower(nextP) { return gameDB.missions[2].resources[0].amount / gameDB.missions[2].time * (this.personnel + nextP); }
    }

    console.log(gameDB.missions[0].time);

    while (personnel.length > 0)
    {
        console.log(`Personnel remaining: ${personnel[0][0]}`);

        let nextP = personnel[0][1];
        personnel[0][0]--;
        if (personnel[0][0] === 0) { personnel.shift(); }
        
        let scout = scoutMission.APPower(nextP) + salvageMission.APPower(0) + materialMission.APPower(0);
        scout *= (scoutMission.personnel < 15);
        let salvage = scoutMission.APPower(0) + salvageMission.APPower(nextP) + materialMission.APPower(0);
        salvage *= (salvageMission.personnel < 30);
        let materialize = scoutMission.APPower(0) + salvageMission.APPower(0) + materialMission.APPower(nextP);
        materialize *= (materialMission.personnel < 50);

        console.log(`scout: ${scout}; salvage: ${salvage}; materialize: ${materialize};`);

        if (scout > salvage && scout > materialize)
        {
            scoutMission.personnel++;
            scoutMission.power += nextP;
        }
        else if (salvage > scout && salvage > materialize)
        {
            salvageMission.personnel++;
            salvageMission.power += nextP;
        }
        else if (materialize > scout && materialize > salvage)
        {
            materialMission.personnel++;
            materialMission.power += nextP;
        }
        else { break; }
    }

    console.log(`Scouting: ${scoutMission.personnel} personnel for ${scoutMission.power} total power`);
    console.log(`Salvage: ${salvageMission.personnel} personnel for ${salvageMission.power} total power`);
    console.log(`Material: ${materialMission.personnel} personnel for ${materialMission.power} total power`);
}