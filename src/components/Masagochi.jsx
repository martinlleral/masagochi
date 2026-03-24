import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { flourParams, ratioToInitial } from '../utils/model';
import { runSimulation } from '../utils/simulation';
import { RefreshCw, Trash2, BookOpen, ChevronRight, TrendingUp, AlertCircle } from './Icons';
import MasagochiAvatar from './MasagochiAvatar';

export default function Masagochi() {
    const [temperature, setTemperature] = useState(26);
    const [hydration, setHydration] = useState(70);
    const [flourType, setFlourType] = useState('integral');
    const [origin, setOrigin] = useState('organica');
    const [time, setTime] = useState(12);
    const [inoculationRatio, setInoculationRatio] = useState('1:3');
    const [altitude, setAltitude] = useState(0);

    const [yeastPop, setYeastPop] = useState(null);
    const [labPop, setLabPop] = useState(null);
    const [cycleNumber, setCycleNumber] = useState(1);
    const [simulationData, setSimulationData] = useState([]);
    const [finalState, setFinalState] = useState(null);
    const [peakTime, setPeakTime] = useState(null);
    const [history, setHistory] = useState([]);
    const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(null);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        const result = runSimulation({ temperature, hydration, flourType, origin, time, inoculationRatio, altitude, yeastPop, labPop });
        setSimulationData(result.data);
        setFinalState(result.finalState);
        setPeakTime(result.peakTime);
    }, [temperature, hydration, flourType, origin, time, inoculationRatio, altitude, yeastPop, labPop]);

    const generateExperiment = () => {
        const experiment = {
            id: Date.now(), cycle: cycleNumber, temperature, hydration, flourType, origin, time, inoculationRatio, altitude,
            finalState: { ...finalState }, data: [...simulationData], peakTime, timestamp: new Date().toLocaleString()
        };
        setHistory([experiment, ...history]);
        setCycleNumber(cycleNumber + 1);
    };

    const feedCycle = () => {
        if (finalState) {
            generateExperiment();
            const dilution = ratioToInitial[inoculationRatio];
            setYeastPop(finalState.yeast * dilution);
            setLabPop(finalState.lab * dilution);
        }
    };

    const resetMasagochi = () => {
        setYeastPop(null); setLabPop(null); setCycleNumber(1); setHistory([]);
        setSelectedHistoryIndex(null); setTemperature(26); setHydration(70);
        setFlourType('integral'); setOrigin('organica'); setTime(12);
        setInoculationRatio('1:3'); setAltitude(0);
    };

    const loadHistoryExperiment = (index) => {
        const exp = history[index];
        setSelectedHistoryIndex(index); setSimulationData(exp.data);
        setFinalState(exp.finalState); setPeakTime(exp.peakTime);
        setTemperature(exp.temperature); setHydration(exp.hydration);
        setFlourType(exp.flourType); setOrigin(exp.origin);
        setTime(exp.time); setInoculationRatio(exp.inoculationRatio);
        setAltitude(exp.altitude);
    };

    const getMasagochiState = () => {
        if (!finalState || !simulationData.length) return 'neutral';
        const currentData = simulationData[simulationData.length - 1];
        const { pH, levaduras, lab } = currentData;
        const activity = levaduras + lab;
        const timeSincePeak = peakTime ? time - peakTime : 0;

        if (temperature > 35 || pH < 3.4) return 'dead';
        if (peakTime && time <= peakTime + 0.5) {
            if (time < 2) return 'sleepy';
            return 'young';
        }
        if (peakTime && timeSincePeak > 0 && timeSincePeak <= 2) {
            if (pH >= 4.1 && pH <= 4.5 && activity > 80) return 'happy';
            return 'neutral';
        }
        if (peakTime && timeSincePeak > 2) {
            if (pH < 3.8 || activity < levaduras * 0.6) return 'sour';
            return 'old';
        }
        if (activity < 20 || temperature < 15) return 'sleepy';
        if (pH >= 4.1 && pH <= 4.5 && activity > 80) return 'happy';
        if (pH < 3.8) return 'sour';
        return 'neutral';
    };

    const getPeakFeedback = () => {
        if (!peakTime) return null;
        const hours = Math.floor(peakTime);
        const minutes = Math.round((peakTime - hours) * 60);
        const timeSincePeak = time - peakTime;

        if (time < peakTime - 0.5) {
            return { icon: <TrendingUp className="w-5 h-5" />, color: 'text-blue-600 bg-blue-50', message: `Fase de crecimiento - Pico estimado en ${hours}h ${minutes}m` };
        }
        if (time >= peakTime - 0.5 && time <= peakTime + 0.5) {
            if (peakTime < 4) return { icon: <TrendingUp className="w-5 h-5" />, color: 'text-orange-600 bg-orange-50', message: `¡PICO ALCANZADO! Masa Madre muy activa (Young Levain) - ${hours}h ${minutes}m` };
            if (peakTime > 10) return { icon: <AlertCircle className="w-5 h-5" />, color: 'text-blue-600 bg-blue-50', message: `Pico alcanzado - Fermentación lenta (Old levain) - ${hours}h ${minutes}m` };
            return { icon: <TrendingUp className="w-5 h-5" />, color: 'text-green-600 bg-green-50', message: `¡PICO ÓPTIMO! - ${hours}h ${minutes}m` };
        }
        if (timeSincePeak > 0.5 && timeSincePeak <= 2) {
            return { icon: <TrendingUp className="w-5 h-5" />, color: 'text-green-600 bg-green-50', message: `Meseta post-pico (momento ideal para hornear) - Pico fue a las ${hours}h ${minutes}m` };
        }
        if (timeSincePeak > 2) {
            return { icon: <AlertCircle className="w-5 h-5" />, color: 'text-red-600 bg-red-50', message: `Fase de colapso - Sobrefermentada (${Math.floor(timeSincePeak)}h desde pico)` };
        }
        return null;
    };

    const masagochiState = getMasagochiState();
    const peakFeedback = getPeakFeedback();

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-6">
                    <h1 className="text-4xl font-bold text-amber-900 mb-2">{'\ud83c\udf5e'} Masagochi v3.0 {'\ud83c\udf5e'}</h1>
                    <p className="text-amber-700">Simulador Científico Avanzado de Masa Madre</p>
                    <p className="text-sm text-amber-600">Ciclo #{cycleNumber}</p>
                </div>

                <div className="flex gap-4">
                    {/* Sidebar - Bitácora */}
                    <div className={`${showHistory ? 'w-72' : 'w-12'} transition-all duration-300 bg-white rounded-lg shadow-lg p-3`}>
                        <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 w-full text-amber-800 hover:text-amber-600 font-semibold mb-3">
                            <BookOpen className="w-5 h-5" />
                            {showHistory && <span>Bitácora de Masas</span>}
                        </button>
                        {showHistory && (
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {history.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">Sin experimentos guardados</p>
                                ) : (
                                    history.map((exp, idx) => (
                                        <button key={exp.id} onClick={() => loadHistoryExperiment(idx)}
                                            className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${selectedHistoryIndex === idx ? 'bg-amber-100 border-2 border-amber-400' : 'bg-gray-50 hover:bg-amber-50 border border-gray-200'}`}>
                                            <div className="font-semibold text-amber-800">Ciclo #{exp.cycle}</div>
                                            <div className="text-xs text-gray-600">{flourParams[exp.flourType].name} - {exp.inoculationRatio}</div>
                                            <div className="text-xs text-gray-500">{exp.timestamp}</div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Panel de Control */}
                        <div className="bg-white rounded-lg shadow-lg p-5 space-y-4 h-fit">
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-xl font-bold text-amber-800">Control</h2>
                                <button onClick={resetMasagochi} className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm" title="Reiniciar Masagochi">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Ratio de Refresco: {inoculationRatio}</label>
                                <select value={inoculationRatio} onChange={(e) => setInoculationRatio(e.target.value)} className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500">
                                    <option value="1:1">1:1 (Muy activo, pico rápido)</option>
                                    <option value="1:2">1:2</option>
                                    <option value="1:3">1:3 (Equilibrado)</option>
                                    <option value="1:4">1:4</option>
                                    <option value="1:5">1:5</option>
                                    <option value="1:10">1:10 (Lento, pico tardío)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Temperatura: {temperature}°C</label>
                                <input type="range" min="15" max="35" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Hidratación: {hydration}%</label>
                                <input type="range" min="50" max="120" value={hydration} onChange={(e) => setHydration(Number(e.target.value))} className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Altitud: {altitude}m s.n.m.</label>
                                <input type="range" min="0" max="4000" step="100" value={altitude} onChange={(e) => setAltitude(Number(e.target.value))} className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Harina</label>
                                <select value={flourType} onChange={(e) => setFlourType(e.target.value)} className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500">
                                    <option value="blanca">Blanca</option>
                                    <option value="integral">Integral</option>
                                    <option value="centeno">Centeno</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Origen</label>
                                <select value={origin} onChange={(e) => setOrigin(e.target.value)} className="w-full p-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500">
                                    <option value="convencional">Convencional</option>
                                    <option value="organica">Orgánica (+15% actividad)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Tiempo de Observación: {time}h</label>
                                <input type="range" min="3" max="48" value={time} onChange={(e) => setTime(Number(e.target.value))} className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer" />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>3h (pico)</span>
                                    <span>48h (ciclo completo)</span>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <button onClick={feedCycle} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2">
                                    <RefreshCw className="w-4 h-4" /> Alimentar / Refrescar
                                </button>
                                <button onClick={generateExperiment} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2">
                                    <ChevronRight className="w-4 h-4" /> Guardar Experimento
                                </button>
                            </div>
                        </div>

                        {/* Visualización Principal */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-white rounded-lg shadow-lg p-5">
                                <div className="flex items-center justify-between gap-4">
                                    <MasagochiAvatar state={masagochiState} />
                                    {finalState && (
                                        <div className="flex-1 grid grid-cols-2 gap-3">
                                            <div className="bg-amber-50 p-3 rounded-lg">
                                                <div className="text-xs text-gray-600">pH Actual</div>
                                                <div className="text-2xl font-bold text-amber-800">{finalState.pH}</div>
                                            </div>
                                            <div className="bg-amber-50 p-3 rounded-lg">
                                                <div className="text-xs text-gray-600">Ratio L/LAB</div>
                                                <div className="text-2xl font-bold text-amber-800">{finalState.ratio}</div>
                                            </div>
                                            <div className="bg-orange-50 p-3 rounded-lg">
                                                <div className="text-xs text-gray-600">Levaduras</div>
                                                <div className="text-xl font-bold text-orange-700">{finalState.yeast.toFixed(1)}</div>
                                            </div>
                                            <div className="bg-green-50 p-3 rounded-lg">
                                                <div className="text-xs text-gray-600">LAB</div>
                                                <div className="text-xl font-bold text-green-700">{finalState.lab.toFixed(1)}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {peakFeedback && (
                                <div className={`${peakFeedback.color} rounded-lg p-4 flex items-center gap-3`}>
                                    {peakFeedback.icon}
                                    <span className="font-semibold">{peakFeedback.message}</span>
                                </div>
                            )}

                            <div className="bg-white rounded-lg shadow-lg p-5">
                                <h3 className="text-lg font-bold text-amber-800 mb-3">Evolución de la Fermentación</h3>
                                <ResponsiveContainer width="100%" height={350}>
                                    <LineChart data={simulationData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="time" label={{ value: 'Tiempo (horas)', position: 'insideBottom', offset: -5 }} />
                                        <YAxis yAxisId="left" label={{ value: 'Población / Volumen', angle: -90, position: 'insideLeft' }} />
                                        <YAxis yAxisId="right" orientation="right" domain={[3, 6.5]} label={{ value: 'pH', angle: 90, position: 'insideRight' }} />
                                        <Tooltip />
                                        <Legend />
                                        {peakTime && (
                                            <ReferenceLine x={peakTime.toFixed(2)} stroke="#ef4444" strokeDasharray="5 5" yAxisId="left">
                                                <Label value={`Pico: ${Math.floor(peakTime)}h ${Math.round((peakTime - Math.floor(peakTime)) * 60)}m`} position="top" fill="#ef4444" fontWeight="bold" />
                                            </ReferenceLine>
                                        )}
                                        <Line yAxisId="left" type="monotone" dataKey="actividad" stroke="#dc2626" strokeWidth={3} name="Actividad Total" dot={false} />
                                        <Line yAxisId="left" type="monotone" dataKey="levaduras" stroke="#f97316" strokeWidth={2} name="Levaduras" dot={false} />
                                        <Line yAxisId="left" type="monotone" dataKey="lab" stroke="#22c55e" strokeWidth={2} name="LAB" dot={false} />
                                        <Line yAxisId="right" type="monotone" dataKey="pH" stroke="#3b82f6" strokeWidth={2} name="pH" dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="bg-amber-50 rounded-lg p-4 text-sm text-amber-900">
                                <h4 className="font-bold mb-2">{'\ud83d\udca1'} Modelo v3.0:</h4>
                                <ul className="space-y-1 list-disc list-inside">
                                    <li><strong>Fase Lag:</strong> 0-2h (aparentemente quieta)</li>
                                    <li><strong>Ratio 1:1</strong> a 26°C, 70% hidratación → Pico en ~3h</li>
                                    <li><strong>Ratio 1:5</strong> → Pico en ~5h</li>
                                    <li><strong>Meseta:</strong> 2h después del pico (ideal para hornear)</li>
                                    <li><strong>Colapso:</strong> Visible después de 24h completas</li>
                                    <li>Menor hidratación = crecimiento más lento pero más denso</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
