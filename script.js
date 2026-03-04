let weatherData = [];
let chart;

async function loadCSV() {
    const response = await fetch('data/turku_weather_2010_2025.csv');
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
