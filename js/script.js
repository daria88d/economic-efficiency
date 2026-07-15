// 1. Ожидание загрузки DOM
document.addEventListener('DOMContentLoaded', function () {
    initCalculator();
});

// 2. Глобальные переменные для графиков
let cumulativeChartInstance = null;
let breakdownChartInstance = null;

// 3. Инициализация всех элементов
function initCalculator() {
    // Находим все элементы ввода
    const inputs = {
        emergencyShutdowns: document.getElementById('emergency-shutdowns'),
        capacity: document.getElementById('capacity'),
        tariff: document.getElementById('tariff'),
        annualEmergencies: document.getElementById('annual-emergencies'),
        fuelType: document.getElementById('fuel-type'),
        taxRate: document.getElementById('tax-rate'),
        discountRate: document.getElementById('discount-rate'),
        operatingCosts: document.getElementById('operating-costs'),
        calcPeriod: document.getElementById('calc-period'),
        lifeCycle: document.getElementById('life-cycle'),
    };

    // Находим кнопку сброса
    const resetBtn = document.getElementById('reset-btn');

    // Вешаем обработчики на все поля (пересчет при изменении)
    for (const key in inputs) {
        const element = inputs[key];
        if (element) {
            element.addEventListener('input', calculate);
            element.addEventListener('change', calculate);
        }
    }

    // Кнопка сброса
    if (resetBtn) {
        resetBtn.addEventListener('click', resetDefaults);
    }

    // Первый расчет при загрузке
    calculate();
}

// 4. Функция сброса к значениям по умолчанию
function resetDefaults() {
    document.getElementById('emergency-shutdowns').value = 0.4;
    document.getElementById('capacity').value = 200;
    document.getElementById('tariff').value = 1486.04;
    document.getElementById('annual-emergencies').value = 2;
    document.getElementById('fuel-type').value = 'gas';
    document.getElementById('tax-rate').value = 0.25;
    document.getElementById('discount-rate').value = 15;
    document.getElementById('operating-costs').value = 10;
    document.getElementById('calc-period').value = 6;
    document.getElementById('life-cycle').value = 10;
    calculate();
}

// 5. Вспомогательные функции форматирования
function formatMoney(num) {
    return new Intl.NumberFormat('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
}

function formatCompact(num) {
    if (num === null || isNaN(num)) return '—';
    return new Intl.NumberFormat('ru-RU', {
        maximumFractionDigits: 2
    }).format(num);
}

// 6. ОСНОВНАЯ ФУНКЦИЯ РАСЧЕТА
function calculate() {
    // 6.1 Чтение всех входных данных
    const emergencyShutdowns = parseFloat(document.getElementById('emergency-shutdowns').value);
    const capacity = parseFloat(document.getElementById('capacity').value);
    const tariff = parseFloat(document.getElementById('tariff').value);
    const annualEmergencies = parseInt(document.getElementById('annual-emergencies').value);
    const fuelType = document.getElementById('fuel-type').value;
    const taxRate = parseFloat(document.getElementById('tax-rate').value);
    const discountRate = parseFloat(document.getElementById('discount-rate').value) / 100;
    const operatingCosts = parseFloat(document.getElementById('operating-costs').value) / 100;
    const calcPeriod = parseInt(document.getElementById('calc-period').value);
    const lifeCycle = parseInt(document.getElementById('life-cycle').value);

    // 6.2 Цена топлива
    let fuelCost = 9700.0;
    if (fuelType === 'coal') fuelCost = 18000.0;
    else if (fuelType === 'oil') fuelCost = 36000.0;

    // 6.3 Расчет затрат на проведение восстановительного ремонта
    const generationYear = 3062.5 * capacity;
    const shareRepairTariff = 0.05;
    const costPlan = generationYear * tariff * shareRepairTariff;
    const costRenewal = 0.05 * costPlan * annualEmergencies;

    // 6.4 Расчет эффектов
    const cutCostRenewal = annualEmergencies * emergencyShutdowns * costRenewal;
    const fuelConsumptionStarting = 599.3;
    const cutFuel = annualEmergencies * emergencyShutdowns * fuelCost * fuelConsumptionStarting;
    const waterConsumptionStarting = 4000.0;
    const costWaterTreatment = 57.0;
    const cutWater = annualEmergencies * emergencyShutdowns * waterConsumptionStarting * costWaterTreatment;
    const energyConsumptionStarting = 131.8;
    const fuelConsumption = 0.31;
    const cutEnergy = annualEmergencies * emergencyShutdowns * energyConsumptionStarting * fuelConsumption * fuelCost;
    const cutFuelConsumption = 0.0031;
    const shareCutFuelConsumption = 0.79 * emergencyShutdowns;
    const cutFuelOptimization = shareCutFuelConsumption * cutFuelConsumption * fuelCost * generationYear;
    const cutCostPlanMain = 0.17;
    const cutCostPlan = costPlan * 0.65 * cutCostPlanMain * (1 - emergencyShutdowns);

    // 6.5 Снижение потери прибыли от снижения отпуска электроэнергии
    const shareFuelTariff = 0.53;
    const profitGrowth = annualEmergencies * emergencyShutdowns * 0.5 * capacity * 24.0 * (tariff - shareFuelTariff * tariff)
        * (1 - taxRate);

    // 6.6 Снижение платы за отклонения
    const maxTariff = 4513.34;
    const coefPayDeviations = 2.0;
    const cutPayDeviations = annualEmergencies * emergencyShutdowns * 0.5 * capacity * 24.0 * maxTariff * coefPayDeviations;

    // 6.7 Суммарный экономический эффект
    const totalEffect = [cutCostRenewal, cutFuel, cutWater, cutEnergy, cutFuelOptimization,
        cutCostPlan, profitGrowth, cutPayDeviations].reduce((sum, val) => sum + val, 0);

    // 6.8 Обновление интерфейса с результатами расчета эффектов
    const values = [cutCostRenewal, cutFuel, cutWater, cutEnergy, cutFuelOptimization,
        cutCostPlan, profitGrowth, cutPayDeviations];
    values.forEach((val, i) => {
        const valElement = document.getElementById(`val-${i + 1}`);
        const barElement = document.getElementById(`bar-${i + 1}`);
        if (valElement) {
            valElement.innerText = formatMoney(val);
        }
        if (barElement) {
            const percentage = (val / totalEffect) * 100;
            barElement.style.width = `${percentage}%`;
        }
    });

    const totalEffectElement = document.getElementById('total-effect');
    if (totalEffectElement) {
        totalEffectElement.innerText = formatMoney(totalEffect) + ' ₽';
    }

    // 6.9 Построение таблицы дисконтированных потоков
    const capex = 20000.0
    const opex = (capex * operatingCosts)
    const annualInflow = totalEffect / 1000;

    const discFactors = []; // коэф-ты дисконтировани
    const discOutflows = []; // диск. оттоки
    const discInflows = []; // диск. притоки
    const discFlows = []; // приведенные диск. потоки
    const cumulativeDiscFlows = []; // накопленные диск. потоки

    for (let t = 1; t <= calcPeriod; t++) {
        const discFactor = 1 / Math.pow(1 + discountRate, t);
        discFactors.push(discFactor);

        let outflow = 0;
        let inflow = 0;

        if (t === 1) {
            outflow = capex;
            inflow = 0;
        } else if (t <= lifeCycle + 1) {
            outflow = opex;
            inflow = annualInflow;
        } else {
            outflow = 0;
            inflow = 0;
        }

        const discOutflow = outflow * discFactor;
        const discInflow = inflow * discFactor;

        discOutflows.push(discOutflow);
        discInflows.push(discInflow);

        const discFlow = discInflow - discOutflow;
        discFlows.push(discFlow);

        const prevCumulative = cumulativeDiscFlows.length > 0 ? cumulativeDiscFlows[cumulativeDiscFlows.length - 1] : 0;
        const cumulative = prevCumulative + discFlow;
        cumulativeDiscFlows.push(cumulative);
    }

    const tableBody = document.getElementById('flow-table-body');
    if (tableBody) {
        tableBody.innerHTML = '';

        for (let i = 0; i < calcPeriod; i++) {
            const year = i + 1;
            const flowColor = discFlows[i] >= 0 ? 'text-emerald-400' : 'text-red-400';
            const cumColor = cumulativeDiscFlows[i] >= 0 ? 'text-emerald-400' : 'text-red-400';

            const row = document.createElement('tr');
            row.className = "hover:bg-brand-dark/80 transition";

            row.innerHTML = `
            <td class="py-3 px-4 font-semibold text-white">${year}-год</td>
            <td class="py-3 px-4 text-right text-slate-400 font-mono">${discFactors[i].toFixed(6)}</td>
            <td class="py-3 px-4 text-right text-red-400 font-mono">${formatMoney(discOutflows[i])}</td>
            <td class="py-3 px-4 text-right text-emerald-400 font-mono">${formatMoney(discInflows[i])}</td>
            <td class="py-3 px-4 text-right ${flowColor} font-mono">${formatMoney(discFlows[i])}</td>
            <td class="py-3 px-4 text-right ${cumColor} font-semibold font-mono">${formatMoney(cumulativeDiscFlows[i])}</td>
        `;

            tableBody.appendChild(row);
        }
    }

    // 6.10 Расчет финансовых показателей
    updateKPIs(cumulativeDiscFlows, discountRate, calcPeriod, capex, opex, annualInflow, capacity, totalEffect, lifeCycle);

    // 6.11 Обновление графиков
    const chartLabels = discFactors.map((_, i) => `${i + 1}-год`);
    updateCharts(chartLabels, cumulativeDiscFlows);
}

// 7. Функция обновления финансовых показателей
function updateKPIs(cumulativeData, npvData, discountRate, calcPeriod, capex, opex, annualInflow, capacity, totalEffect, lifeCycle) {
    
    // Срок окупаемости
    let paybackPeriod = "Не окупается";
    for (let i = 0; i < cumulativeData.length; i++) {
        if (cumulativeData[i] >= 0) {
            if (i === 0) {
                paybackPeriod = "1 год";
            } else {
                const prevVal = cumulativeData[i - 1];
                const currVal = cumulativeData[i];
                const fraction = Math.abs(prevVal) / (currVal - prevVal);
                paybackPeriod = `${(i + fraction).toFixed(1)} лет`;
            }
            break;
        }
    }
    const kpiPayback = document.getElementById('kpi-payback');
    if (kpiPayback) kpiPayback.innerText = paybackPeriod;

    // ЧДД за расчетный период
    const npv = npvData[npvData.length - 1] || 0;
    const kpiNpvPeriod = document.getElementById('kpi-npv-period');
    if (kpiNpvPeriod) {
        kpiNpvPeriod.innerText = formatCompact(npv);
        kpiNpvPeriod.className = `text-lg font-extrabold mt-1 ${npv >= 0 ? 'text-emerald-400' : 'text-red-400'}`;
    }

    // ЧДД за жизненный цикл тренажера
    let npvLifecycle = 0;
    for (let t = 1; t <= lifeCycle; t++) {
        const discFactor = 1 / Math.pow(1 + discountRate, t);
        let outflow = 0;
        let inflow = 0;
        
        if (t === 1) {
            outflow = capex;
            inflow = 0;
        } else if (t <= lifeCycle) {
            outflow = opex;
            inflow = annualInflow;
        } else {
            outflow = 0;
            inflow = 0;
        }
        
        npvLifecycle += (inflow - outflow) * discFactor;
    }
    
    const kpiNpvLifecycle = document.getElementById('kpi-npv-lifecycle');
    if (kpiNpvLifecycle) {
        kpiNpvLifecycle.innerText = formatCompact(npvLifecycle);
        kpiNpvLifecycle.className = `text-lg font-extrabold mt-1 ${npvLifecycle >= 0 ? 'text-emerald-400' : 'text-red-400'}`;
    }

    // Эффективность на 1 МВт
    const efficiency = capacity > 0 ? totalEffect / capacity : 0;
    const kpiEfficiency = document.getElementById('kpi-efficiency');
    if (kpiEfficiency) {
        kpiEfficiency.innerText = formatCompact(efficiency);
        kpiEfficiency.className = `text-lg font-extrabold mt-1 ${efficiency >= 0 ? 'text-emerald-400' : 'text-red-400'}`;
    }
}

// 8. Функция обновления графиков (Chart.js)
function updateCharts(labels, cumulativeData, structureValues) {

    // График 1: Накопленный дисконтированный поток
    const ctx1 = document.getElementById('cumulativeChart');
    if (ctx1) {
        if (cumulativeChartInstance) {
            cumulativeChartInstance.destroy();
        }

        cumulativeChartInstance = new Chart(ctx1.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Накопленный поток',
                    data: cumulativeData,
                    borderColor: '#ff7d1a',
                    borderWidth: 3,
                    backgroundColor: 'rgba(255, 125, 26, 0.15)',
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#ff7d1a',
                    pointHoverRadius: 7,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#131b2e',
                        titleColor: '#fff',
                        bodyColor: '#cbd5e1',
                        borderColor: '#334155',
                        borderWidth: 1,
                        callbacks: {
                            label: function (context) {
                                return ' ' + formatMoney(context.parsed.y) + ' тыс. руб.';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: '#1e293b' },
                        ticks: { color: '#94a3b8', font: { size: 10 } }
                    },
                    y: {
                        grid: { color: '#1e293b' },
                        ticks: { color: '#94a3b8', font: { size: 10 } }
                    }
                }
            }
        });
    }

    // График 2: Удельный экономический эффект
    const ctx2 = document.getElementById('effectChart');
    if (ctx2) {
        if (breakdownChartInstance) {
            breakdownChartInstance.destroy();
        }

        // Названия компонентов экономии
        const effectLabels = [
            'Восстановительный ремонт',
            'Экономия топлива на пуски',
            'Экономия воды',
            'Экономия электроэнергии',
            'Оптимизация топлива',
            'Плановые ремонты',
            'Потеря прибыли',
            'Плата за отклонения'
        ];

        // Данные для графика (в тыс. руб)
        const effectData = structureValues.map(val => val / 1000);

        breakdownChartInstance = new Chart(ctx2.getContext('2d'), {
            type: 'bar',
            data: {
                labels: effectLabels,
                datasets: [{
                    label: 'Экономия, тыс. руб/год',
                    data: effectData,
                    backgroundColor: [
                        'rgba(255, 125, 26, 0.8)',
                        'rgba(46, 81, 170, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(14, 165, 233, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ],
                    borderColor: [
                        '#ff7d1a',
                        '#2E51AA',
                        '#10b981',
                        '#f59e0b',
                        '#8b5cf6',
                        '#ec4899',
                        '#0ea5e9',
                        '#ef4444'
                    ],
                    borderWidth: 2,
                    borderRadius: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#131b2e',
                        titleColor: '#fff',
                        bodyColor: '#cbd5e1',
                        borderColor: '#334155',
                        borderWidth: 1,
                        callbacks: {
                            label: function (context) {
                                return ' ' + formatMoney(context.parsed.y) + ' тыс. руб.';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { 
                            color: '#94a3b8', 
                            font: { size: 9 },
                            maxRotation: 45,
                            minRotation: 30
                        }
                    },
                    y: {
                        grid: { color: '#1e293b' },
                        ticks: { 
                            color: '#94a3b8', 
                            font: { size: 10 },
                            callback: function(value) {
                                return formatMoney(value) + ' тыс.';
                            }
                        }
                    }
                }
            }
        });
    }
}