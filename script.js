let weatherData = [];
let chart;
let monthlyChart;

async function loadCSV() {
    try {
        const response = await fetch('data/turku_weather_2010_2025.csv');
        if (!response.ok) throw new Error('Failed to load CSV');
        const text = await response.text();

        const rows = text.split('\n').slice(1); // remove header

        weatherData = rows
            .filter(row => row.trim() !== "")
            .map(row => {
                const [
                    date,
                    year,
                    month,
                    day,
                    avg_temp,
                    min_temp,
                    max_temp
                ] = row.split('\t'); // <-- TAB separated

                return {
                    date: date,
                    year: parseInt(year),
                    month: parseInt(month),
                    day: parseInt(day),
                    avg: parseFloat(avg_temp),
                    min: parseFloat(min_temp),
                    max: parseFloat(max_temp)
                };
            });

        const monthlyData = computeMonthlyAverages();
        createMonthlyChart(monthlyData);
    } catch (error) {
        console.error('Error loading CSV:', error);
        alert('Failed to load weather data.');
    }
}

function createChart(labels, avgData, minData, maxData) {
    const ctx = document.getElementById('weatherChart').getContext('2d');

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
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
                    text: 'Temperature History for Selected Day'
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

function computeMonthlyAverages() {
    const monthlyAvg = [];
    for (let m = 1; m <= 12; m++) {
        const monthData = weatherData.filter(d => d.month === m);
        let avg = monthData.reduce((sum, d) => sum + d.avg, 0) / monthData.length;
        // round down to two decimal places
        avg = Math.floor(avg * 100) / 100;
        monthlyAvg.push(avg);
    }
    return monthlyAvg;
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
                tooltip: {
                    titleFont: {size: 14},
                    bodyFont: {size: 13}
                },
                title: {
                    display: true,
                    text: 'Monthly Average Temperature (2010-2025)'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
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

    const labels = filtered.map(d => d.year);
    const avgData = filtered.map(d => d.avg);
    const minData = filtered.map(d => d.min);
    const maxData = filtered.map(d => d.max);

    createChart(labels, avgData, minData, maxData);
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
