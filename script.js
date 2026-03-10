// Fixing CSV column destructuring: swapping min_temp and max_temp
const parseCsv = (data) => {
    return data.map(row => {
        const { max_temp, min_temp } = row; // Destructuring in the correct order
        return {
            maxTemp: max_temp,
            minTemp: min_temp,
            // other columns...
        };
    });
};
