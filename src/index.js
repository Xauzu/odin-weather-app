/* eslint-disable prefer-destructuring */
import humidityIcon from './humidity.png'; // https://thenounproject.com/icon/humidity-4212778/
import windsIcon from './winds.png'; // https://thenounproject.com/icon/winds-503905/

import {geocoding, getForecast, parseForecastData } from './data';

import './style.css'

const displayUnits = [
    ['C', 'm/s'],
    ['F', 'mph']
]
let style = 0; // 0 = metric, 1 = imperial
let cfg;



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
    updateDailyWeather(data.list);
}

async function acquireWeatherData() {
    try {
        const cfgFile = await fetch('../config.json');

        if (cfgFile.status === 200) {
            cfg = await cfgFile.json();

            const [lat, lon] = await geocoding(cfg.location, cfg);

            const data = await getForecast(lat, lon, cfg);

            displayWeatherData(data);
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