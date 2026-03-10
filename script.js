// Fixing the order of destructuring for CSV columns
const csvData = csvRows.map(row => {
    const [date, min_temp, max_temp] = row; // swapped here
    return { date, min_temp, max_temp };
});