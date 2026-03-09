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
                    borderColor: 'blue',
                    tension: 0.2
                },
                {
                    label: 'Min Temp',
                    data: minData,
                    borderColor: 'green',
                    tension: 0.2
                },
                {
                    label: 'Max Temp',
                    data: maxData,
                    borderColor: 'red',
                    tension: 0.2
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Temperature History for Selected Day'
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
        const avg = monthData.reduce((sum, d) => sum + d.avg, 0) / monthData.length;
        monthlyAvg.push(avg);
    }
    return monthlyAvg;
}

function createMonthlyChart(data) {
    const ctx = document.getElementById('monthlyChart').getContext('2d');

    if (monthlyChart) monthlyChart.destroy();

    monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Average Temperature (°C)',
                data: data,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
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

document.getElementById('daySelect').addEventListener('change', function () {
    const selectedDate = new Date(this.value);

    const month = selectedDate.getMonth() + 1;
    const day = selectedDate.getDate();

    filterBySelectedDay(month, day);
});

loadCSV();

