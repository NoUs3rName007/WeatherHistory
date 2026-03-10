let weatherData = [];
let dailyRecentChart;
let dailyOlderChart;
let monthlyChart;
let yearlyChart;

async function loadCSV() {
    try {
        const response = await fetch('data/turku_weather_1970_2026.csv');
        if (!response.ok) throw new Error('Failed to load CSV');
        const text = await response.text();

        const rows = text.split('\n').slice(1); // remove header

        weatherData = rows
            .filter(row => row.trim() !== "")
            .map(row => {
                const [
                    station,
                    year,
                    month,
                    day,
                    time,
                    avg_temp,
                    max_temp,
                    min_temp
                ] = row.split(','); // <-- comma separated

                const avg = parseFloat(avg_temp);
                const min = parseFloat(min_temp);
                const max = parseFloat(max_temp);

                if (isNaN(avg) || isNaN(min) || isNaN(max)) {
                    return null; // skip invalid rows
                }

                return {
                    year: parseInt(year),
                    month: parseInt(month),
                    day: parseInt(day),
                    avg: avg,
                    min: min,
                    max: max
                };
            })
            .filter(d => d !== null);

        const monthlyData = computeMonthlyAverages();
        createMonthlyChart(monthlyData);

        const yearlyData = computeYearlyAverages();
        createYearlyChart(yearlyData);
    } catch (error) {
        console.error('Error loading CSV:', error);
        alert('Failed to load weather data.');
    }
}

function computeMonthlyAverages() {
    const monthlyAvg = [];
    for (let m = 1; m <= 12; m++) {
        const monthData = weatherData.filter(d => d.month === m);
        let avg = 0;
        if (monthData.length > 0) {
            avg = monthData.reduce((sum, d) => sum + d.avg, 0) / monthData.length;
            // round down to two decimal places
            avg = Math.floor(avg * 100) / 100;
        }
        monthlyAvg.push(avg);
    }
    return monthlyAvg;
}

function computeYearlyAverages() {
    const periods = [];
    const averages = [];
    for (let start = 1959; start <= 2019; start += 5) {
        const end = start + 4;
        const periodData = weatherData.filter(d => d.year >= start && d.year <= end);
        let avg = 0;
        if (periodData.length > 0) {
            avg = periodData.reduce((sum, d) => sum + d.avg, 0) / periodData.length;
            avg = Math.floor(avg * 100) / 100;
        }
        periods.push(`${start}-${end}`);
        averages.push(avg);
    }
    return { periods: periods, averages: averages };
}

function createMonthlyChart(data) {
    const ctx = document.getElementById('monthlyChart').getContext('2d');

    if (monthlyChart) monthlyChart.destroy();

    const monthColors = [
        '#ff7f0e','#1f77b4','#2ca02c','#d62728','#9467bd','#8c564b',
        '#e377c2','#7f7f7f','#bcbd22','#17becf','#aec7e8','#98df8a'
    ];
    monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Average Temperature (°C)',
                data: data,
                backgroundColor: monthColors.map(c => c + '99'),
                borderColor: monthColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Average Temperatures (1959–2026)'
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                }
            }
        }
    });
}

function createYearlyChart(data) {
    const ctx = document.getElementById('yearlyChart').getContext('2d');

    if (yearlyChart) yearlyChart.destroy();

    const monthColors = [
        '#ff7f0e','#1f77b4','#2ca02c','#d62728','#9467bd','#8c564b',
        '#e377c2','#7f7f7f','#bcbd22','#17becf','#aec7e8','#98df8a'
    ];

    yearlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.periods,
            datasets: [{
                label: 'Average Temperature (°C)',
                data: data.averages,
                backgroundColor: data.periods.map((_, index) => monthColors[index % monthColors.length] + '99'),
                borderColor: data.periods.map((_, index) => monthColors[index % monthColors.length]),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Yearly Average Temperatures (1959–2023)'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Period'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                }
            }
        }
    });
}

function createDailyRecentChart(labels, avgData, minData, maxData) {
    const ctx = document.getElementById('dailyRecentChart').getContext('2d');

    if (dailyRecentChart) dailyRecentChart.destroy();

    dailyRecentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Average Temp',
                    data: avgData,
                    borderColor: '#1f77b4',
                    backgroundColor: 'rgba(31,119,180,0.2)',
                    tension: 0.2,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointHitRadius: 10
                },
                {
                    label: 'Min Temp',
                    data: minData,
                    borderColor: '#2ca02c',
                    backgroundColor: 'rgba(44,160,44,0.2)',
                    tension: 0.2,
                    pointRadius: 4,
                    pointHoverRadius: 7
                },
                {
                    label: 'Max Temp',
                    data: maxData,
                    borderColor: '#d62728',
                    backgroundColor: 'rgba(214,39,40,0.2)',
                    tension: 0.2,
                    pointRadius: 4,
                    pointHoverRadius: 7
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    titleFont: {size: 14},
                    bodyFont: {size: 13},
                    padding: 10
                },
                title: {
                    display: true,
                    text: 'Daily Temperature History (2000–2026)'
                }
            },
            elements: {
                point: {
                    radius: 5
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                }
            }
        }
    });
}

function createDailyOlderChart(labels, avgData, minData, maxData) {
    const ctx = document.getElementById('dailyOlderChart').getContext('2d');

    if (dailyOlderChart) dailyOlderChart.destroy();

    dailyOlderChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Average Temp',
                    data: avgData,
                    borderColor: '#1f77b4',
                    backgroundColor: 'rgba(31,119,180,0.2)',
                    tension: 0.2,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointHitRadius: 10
                },
                {
                    label: 'Min Temp',
                    data: minData,
                    borderColor: '#2ca02c',
                    backgroundColor: 'rgba(44,160,44,0.2)',
                    tension: 0.2,
                    pointRadius: 4,
                    pointHoverRadius: 7
                },
                {
                    label: 'Max Temp',
                    data: maxData,
                    borderColor: '#d62728',
                    backgroundColor: 'rgba(214,39,40,0.2)',
                    tension: 0.2,
                    pointRadius: 4,
                    pointHoverRadius: 7
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    titleFont: {size: 14},
                    bodyFont: {size: 13},
                    padding: 10
                },
                title: {
                    display: true,
                    text: 'Daily Temperature History (1959–1999)'
                }
            },
            elements: {
                point: {
                    radius: 5
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                }
            }
        }
    });
}

function filterBySelectedDay(month, day) {
    const filtered = weatherData.filter(
        d => d.month === month && d.day === day
    );

    // sort by year just in case
    filtered.sort((a, b) => a.year - b.year);

    const recentFiltered = filtered.filter(d => d.year >= 2000 && d.year <= 2026);
    const olderFiltered = filtered.filter(d => d.year >= 1959 && d.year <= 1999);

    const recentLabels = recentFiltered.map(d => d.year);
    const recentAvgData = recentFiltered.map(d => d.avg);
    const recentMinData = recentFiltered.map(d => d.min);
    const recentMaxData = recentFiltered.map(d => d.max);

    const olderLabels = olderFiltered.map(d => d.year);
    const olderAvgData = olderFiltered.map(d => d.avg);
    const olderMinData = olderFiltered.map(d => d.min);
    const olderMaxData = olderFiltered.map(d => d.max);

    createDailyRecentChart(recentLabels, recentAvgData, recentMinData, recentMaxData);
    createDailyOlderChart(olderLabels, olderAvgData, olderMinData, olderMaxData);
}

// when month changes, build appropriate days list
const monthSelect = document.getElementById('monthSelect');
const daySelect = document.getElementById('daySelect');

monthSelect.addEventListener('change', function () {
    const month = parseInt(this.value, 10);
    daySelect.innerHTML = '<option value="">--Day--</option>';
    daySelect.disabled = !month;
    if (month) {
        // use a leap year to make february 29 days
        const daysInMonth = new Date(2020, month, 0).getDate();
        for (let d = 1; d <= daysInMonth; d++) {
            const opt = document.createElement('option');
            opt.value = d;
            opt.textContent = d;
            daySelect.appendChild(opt);
        }
    }
});

// when a day is selected, read both controls and filter
daySelect.addEventListener('change', function () {
    const month = parseInt(monthSelect.value, 10);
    const day = parseInt(this.value, 10);
    if (month && day) {
        filterBySelectedDay(month, day);
    }
});

loadCSV();
