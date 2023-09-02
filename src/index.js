import './style.css'

let cfg;

async function geocoding(location) {
    const userLoc = location.replace(/\ /g, ",");
    let loc = []
    try {
        const api = cfg.geocodingApi
            .replace('{location}', userLoc)
            .replace('{key}', cfg.key);

        const response = await (await fetch(api)).json();

        loc = [response[0].lat, response[0].lon];
    }
    catch (err) {
        document.querySelector('#content').textContent = 'Error reading location data';
        console.error(err);
    }

    return loc;
}

function parseForecastData(list) {
    const data = []

    return data;
}

async function getForecast(lat, lon) {
    let data = []
    try {
        const api = cfg.forecastApi
            .replace('{lat}', lat)
            .replace('{lon}', lon)
            .replace('{key}', cfg.key);

        const response = await (await fetch(api)).json();

        data = parseForecastData(response.list);

        console.log(response);
    }
    catch (err) {
        document.querySelector('#content').textContent = 'Error reading forecast data';
        console.error(err);
    }

    return data;
}

async function setup() {
    try {
        const cfgFile = await fetch('../config.json');

        if (cfgFile.status === 200) {
            cfg = await cfgFile.json();

            const [lat, lon] = await geocoding(cfg.location);

            const data = getForecast(lat, lon);
        }
    }
    catch (err) {
        document.querySelector('#content').textContent = 'Error loading configuration file';
        console.error(err);
    }
}

async function test() {
    const response = await (await fetch('../ignore/test.json')).json();

    console.log(response);

    const data = parseForecastData(response.list);

    console.table(data);
}

//setup();
test();