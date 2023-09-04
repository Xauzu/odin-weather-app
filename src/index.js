/* eslint-disable prefer-destructuring */
import humidityIcon from './humidity.png'; // https://thenounproject.com/icon/humidity-4212778/
import windsIcon from './winds.png'; // https://thenounproject.com/icon/winds-503905/
import Weather from './weather';

import './style.css'

const displayUnits = [
    ['C', 'm/s'],
    ['F', 'mph']
]
let style = 0; // 0 = metric, 1 = imperial
let cfg;

async function geocoding(location) {
    const userLoc = location.replace(/ /g, ",");
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

function setPrimaryData(object, response) {
    const data = object;

    data.name = response.city.name;
    data.timeOffset = response.city.timezone;
    data.temp = response.list[0].main.temp;
    data.humidity = response.list[0].main.humidity;
    data.wind = response.list[0].wind.speed;
    data.gust = response.list[0].wind.gust;

    data.image = response.list[0].weather[0].icon;
    const weather = response.list[0].weather[0].description;
    data.weather = weather[0].toUpperCase() + weather.slice(1);

    return data;
}

// https://openweathermap.org/weather-conditions
// Thunderstorm (2XX) > Snow (6XX) > Rain (5XX) > Atmospheric (7XX) > Drizzle (3XX) > Cloud (80X) > Clear (800)
// p = 6 (Thunderstorm) -> 0 (Clear)
// Condition = [code, description, icon]
function calculateCondition(currentCondition, newCondition) {
    let results;

    // Check current conditions incase of reset
    if (currentCondition !== undefined) {
        const conditions = [currentCondition, newCondition];

        const p = [0, 0];

        for (let i = 0; i < conditions.length; i++) {
            // First digit of code
            const code = parseInt(conditions[i][0] / 100, 10);

            switch (code) {
                case 2:
                    p[i] = 6;
                    break;
                case 6:
                    p[i] = 5;
                    break;
                case 5:
                    p[i] = 4;
                    break;
                case 7:
                    p[i] = 3;
                    break;
                case 3:
                    p[i] = 2;
                    break;
                case 8:
                    if (conditions[i][0] !== 800) {
                        p[i] = 1;
                        break;
                    }
                // eslint-disable-next-line no-fallthrough
                default:
                    p[i] = 0;
            }

        }

        if (p[1] > p[0])
            results = [...newCondition];
        else
            results = [...currentCondition];
    }
    else
        results = [...newCondition];

    return results;
}

function parseForecastData(response) {

    const data = {};

    setPrimaryData(data, response);

    // Forecast
    const forecastData = response.list;
    const list = [];

    let index = 1;

    let tempMin = response.list[0].main.temp_min;
    let tempMax = response.list[0].main.temp_max;
    let condition = [response.list[0].weather[0].id, response.list[0].weather[0].description, response.list[0].weather[0].icon];
    let humidity = response.list[0].main.humidity;
    let precipitation = response.list[0].pop;
    let count = 1;

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
            itemData.humidity = humidity / count;
            itemData.precipitation = precipitation;

            const status = new Weather(month, day, condition[1], condition[2], itemData);
            list.push(status);

            tempMin = 100;
            tempMax = -100;
            condition = [];
            humidity = 0;
            precipitation = 0;

            count = 0;

            // Set next
            month = itemMonth;
            day = itemDay;
        }
        
        // Data update
        if (item.main.temp_min < tempMin) tempMin = item.main.temp_min;
        if (item.main.temp_max < tempMax) tempMax = item.main.temp_max;
        humidity += item.main.humidity;
        precipitation += item.pop;

        const newCondition = [item.weather[0].id, item.weather[0].description, item.weather[0].icon];
        condition = calculateCondition(condition, newCondition);

        count += 1;
        index += 1;
    }
    
    data.list = list;

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
    }
    catch (err) {
        document.querySelector('#content').textContent = 'Error reading forecast data';
        console.error(err);
    }

    return data;
}

function setupDisplay() {
    const content = document.querySelector('#content');
    
    const currentDisplay = document.createElement('div');
    currentDisplay.id = 'currentDisplay';
    content.appendChild(currentDisplay);

    const dailyDisplay = document.createElement('div');
    dailyDisplay.id = 'dailyDisplay';
    content.appendChild(dailyDisplay);
}

function clearDisplay() {
    const content = document.querySelector('#content');
    content.innerHTML = '';
    setupDisplay();
}

function updateCurrentWeather(data) {
    const currentWeather = document.querySelector('#currentDisplay');

    // -- Left Side --
    const currentLeft = document.createElement('div');
    currentLeft.id = 'currentLeft';
    currentWeather.appendChild(currentLeft);

    // Weather
    const weatherDiv = document.createElement('div');
    weatherDiv.id = 'currentWeatherDiv';

    const weatherImage = document.createElement('img');
    const imageLink = `https://openweathermap.org/img/wn/${data.image}@4x.png`;
    weatherImage.src = imageLink;
    weatherDiv.appendChild(weatherImage);

    const weatherDesc = document.createElement('div');
    weatherDesc.id = 'currentWeatherDescription';
    weatherDesc.textContent = data.weather;
    weatherDiv.appendChild(weatherDesc);

    currentLeft.appendChild(weatherDiv);

    // Location
    const loc = document.createElement('div');
    loc.id = 'weatherLocation';
    loc.textContent = data.name;

    currentLeft.appendChild(loc);

    // Temperature
    const temp = document.createElement('div');
    temp.classList.add('currentTemperature');
    temp.textContent = `${data.temp}°${displayUnits[style][0]}`;

    currentLeft.appendChild(temp);

    // -- Right Side --
    const currentRight = document.createElement('div');
    currentRight.id = 'currentRight';
    currentWeather.appendChild(currentRight);

    // Humidity
    const humidDiv = document.createElement('div');
    humidDiv.id = 'currentHumidDiv';

    const humidIcon = document.createElement('img');
    humidIcon.classList.add('humidIcon', 'icon');
    humidIcon.src = humidityIcon;
    humidIcon.title = 'Humidity';
    humidDiv.appendChild(humidIcon);

    const humid = document.createElement('div');
    humid.textContent = `${data.humidity}%`;
    humid.classList.add('currentStatText');
    humidDiv.appendChild(humid);

    currentRight.appendChild(humidDiv);

    // Wind
    const windDiv = document.createElement('div');
    windDiv.id = 'currentWindDiv';
    
    const windIcon = document.createElement('img');
    windIcon.classList.add('windIcon', 'icon');
    windIcon.src = windsIcon;
    windIcon.title = 'Wind';
    windDiv.appendChild(windIcon);

    const windSubDiv = document.createElement('div');
    windSubDiv.classList.add('windSubDiv');

    const wind = document.createElement('div');
    wind.textContent = `${data.wind} ${displayUnits[style][1]}`;
    wind.title = `Wind speed: ${data.wind} ${displayUnits[style][1]}`;
    wind.classList.add('currentStatText');
    windSubDiv.appendChild(wind);

    const gust = document.createElement('div');
    gust.classList.add('currentStatSubText');
    gust.textContent = ` +${data.gust}`;
    gust.title = `Gust: ${data.gust} ${displayUnits[style][1]}`;
    windSubDiv.appendChild(gust);

    windDiv.appendChild(windSubDiv);

    currentRight.appendChild(windDiv);
}

function displayWeatherData(data) {
    updateCurrentWeather(data);
    console.log(data);
}

async function acquireWeatherData() {
    try {
        const cfgFile = await fetch('../config.json');

        if (cfgFile.status === 200) {
            cfg = await cfgFile.json();

            const [lat, lon] = await geocoding(cfg.location);

            const data = await getForecast(lat, lon);
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

    displayWeatherData(data);
}

const doTest = 1;

setupDisplay();
if (doTest) test();
else acquireWeatherData();