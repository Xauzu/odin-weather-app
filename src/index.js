import Weather from './weather';

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

function parseForecastData(response) {

    console.log(response);

    const data = {};

    // Primary Data
    data.name = response.city.name;
    data.timeOffset = response.city.timezone;
    data.sunrise = response.city.sunrise;
    data.sunset = response.city.sunset;
    data.temp = response.list[0].main.temp;
    data.humidity = response.list[0].main.humidity;
    data.wind = response.list[0].wind.speed;
    data.gust = response.list[0].wind.gust;

    const weather = response.list[0].weather[0].description;
    data.weather = weather[0].toUpperCase() + weather.slice(1);

    // Forecast
    const forecastData = response.list;
    let list = [];

    let index = 1;

    let tempMin = response.list[0].main.temp_min;
    let tempMax = response.list[0].main.temp_max;
    let condition = response.list[0].weather[0].description;
    let icon = response.list[0].weather[0].icon;
    let humidity = response.list[0].main.humidity;
    let precipitation = response.list[0].pop;

    let month = response.list[0].dt_txt.slice(5, 7);
    let day = response.list[0].dt_txt.slice(8, 10);

    while (index < forecastData.length) {
        const item = response.list[index];

        const itemMonth = item.dt_txt.slice(5, 7);
        const itemDay = item.dt_txt.slice(8, 10);

        if (month !== itemMonth || day !== itemDay) {
            // Create weather object and clean up
            const itemData = {};
            itemData.tempMin = tempMin;
            itemData.tempMax = tempMax;
            itemData.humidity = humidity;
            itemData.precipitation = precipitation;

            const status = new Weather(month, day, condition, icon, itemData);
            list.append(status);

            tempMin = 100;
            tempMax = -100;
            condition = '';
            icon = '';
            humidity = 0;
            precipitation = 0;

            // Set next
            month = itemMonth;
            day = itemDay;
        }
        

        index+= 1;
    }

    console.log(data);

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

        data = parseForecastData(response);

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

    const data = parseForecastData(response);

    // console.table(data);
}

//setup();
test();