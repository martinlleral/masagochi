import { flourParams, ratioToInitial } from './model';

export const getYeastGrowthRate = (temp) => {
    if (temp < 4) return 0;
    if (temp > 40) return 0;
    const optTemp = 27;
    const maxRate = 0.45;
    return maxRate * Math.exp(-0.5 * Math.pow((temp - optTemp) / 6, 2));
};

export const getLABGrowthRate = (temp) => {
    if (temp < 8) return 0;
    if (temp > 45) return 0;
    const optTemp = 33;
    const maxRate = 0.60;
    return maxRate * Math.exp(-0.5 * Math.pow((temp - optTemp) / 7, 2));
};

export const getAltitudeExpansionFactor = (alt) => {
    return 1 + (alt / 4000) * 0.3;
};

export const getInitialPopulation = (ratio, yeastPop, labPop) => {
    const baseInitial = ratioToInitial[ratio];
    const matureYeast = yeastPop !== null ? yeastPop : 100;
    const matureLab = labPop !== null ? labPop : 100;
    return {
        yeast: matureYeast * baseInitial,
        lab: matureLab * baseInitial,
        acid: 0
    };
};

export const runSimulation = ({ temperature, hydration, flourType, origin, time, inoculationRatio, altitude, yeastPop, labPop }) => {
    const flourP = flourParams[flourType];
    const steps = 400;
    const dt = time / steps;
    const originBonus = origin === 'organica' ? 1.15 : 1.0;

    const initial = getInitialPopulation(inoculationRatio, yeastPop, labPop);
    let y = initial.yeast;
    let l = initial.lab;
    let food = 100 * flourP.nutrients;
    let acid = flourP.buffer * 5;
    let gas = 0;

    const data = [];
    const hydrationFactor = hydration / 100;
    const rYeastBase = getYeastGrowthRate(temperature) * originBonus;
    const rLABBase = getLABGrowthRate(temperature) * originBonus * flourP.labBonus;
    const K = 100;
    const altitudeFactor = getAltitudeExpansionFactor(altitude);

    let maxVolume = 0;
    let peakTimeFound = 0;
    let peakReached = false;

    for (let i = 0; i <= steps; i++) {
        const currentTime = (i / steps) * time;
        const currentPH = Math.max(3.3, 6.0 - Math.log10(1 + acid / flourP.buffer));
        const foodFactor = Math.max(0, food / (100 * flourP.nutrients));
        const pHInhibitionYeast = currentPH < 3.8 ? Math.max(0, (currentPH - 3.4) / 0.4) : 1;
        const pHInhibitionLAB = currentPH < 3.5 ? Math.max(0, (currentPH - 3.2) / 0.3) : 1;
        const mobility = Math.pow(hydrationFactor, 1.2);

        const rY = rYeastBase * foodFactor * pHInhibitionYeast * mobility;
        const rL = rLABBase * foodFactor * pHInhibitionLAB * mobility;

        const dy = rY * y * (1 - y / K);
        const dl = rL * l * (1 - l / K);
        const dFood = -(dy * 0.5 + dl * 0.3) - (y * 0.05 + l * 0.05);
        const dAcid = (dl * 0.8 + l * 0.1) + (dy * 0.1 + y * 0.02);
        const gasProd = (dy * 1.5 + y * 0.2) * altitudeFactor * (foodFactor > 0.1 ? 1 : 0.2);
        const glutenDegradation = (currentPH < 4.1 ? (4.1 - currentPH) * 2 : 0) * (2 / flourP.glutenStrength) * (hydrationFactor);
        const gasEscapeRate = Math.max(0, gas * glutenDegradation * 0.08);
        const dGas = gasProd - gasEscapeRate;

        y = Math.max(1, y + dy * dt);
        l = Math.max(1, l + dl * dt);
        food = Math.max(0, food + dFood * dt);
        acid = acid + dAcid * dt;
        gas = Math.max(0, gas + dGas * dt);

        const initialVolume = 100;
        const visualVolume = initialVolume + gas;

        if (visualVolume > maxVolume) {
            maxVolume = visualVolume;
            peakTimeFound = currentTime;
            peakReached = false;
        } else if (!peakReached && maxVolume > initialVolume * 1.2 && visualVolume < maxVolume * 0.98) {
            peakReached = true;
        }

        data.push({
            time: parseFloat(currentTime.toFixed(2)),
            levaduras: parseFloat(y.toFixed(2)),
            lab: parseFloat(l.toFixed(2)),
            pH: parseFloat(currentPH.toFixed(2)),
            actividad: parseFloat((visualVolume * 0.5).toFixed(2))
        });
    }

    const finalData = data[data.length - 1];
    const finalState = {
        yeast: finalData.levaduras,
        lab: finalData.lab,
        pH: finalData.pH,
        activity: finalData.actividad,
        ratio: (finalData.levaduras / (finalData.lab + 0.1)).toFixed(2),
        peakTime: peakTimeFound
    };

    return { data, finalState, peakTime: peakTimeFound };
};
