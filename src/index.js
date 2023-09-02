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

        loc = [response[0].lon, response[0].lat];
    }
    catch (err) {
        document.querySelector('#content').textContent = 'Error reading location data';
        console.error(err);
    }

    return loc;
}

async function setup() {
    try {
        const cfgFile = await fetch('../config.json');

        if (cfgFile.status === 200) {
            cfg = await cfgFile.json();

            const [lon, lat] = await geocoding(cfg.location);
        }
    }
    catch (err) {
        document.querySelector('#content').textContent = 'Error loading configuration file';
        console.error(err);
    }
}

setup();