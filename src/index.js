/* eslint-disable prefer-destructuring */
import humidityIcon from './humidity.png'; // https://thenounproject.com/icon/humidity-4212778/
import windsIcon from './winds.png'; // https://thenounproject.com/icon/winds-503905/
import tempIcon from './temp.png'; // https://thenounproject.com/icon/temperature-1979336/
import precipIcon from './precip.png'; // https://thenounproject.com/icon/rainy-1640182/

import {geocoding, getForecast, parseForecastData } from './data';

import './style.css'

const displayUnits = [
    ['C', 'm/s'],
    ['F', 'mph']
]
let style = 0; // 0 = metric, 1 = imperial
let dateFormat = 0; // 0 = MM/DD, 1 = DD/MM
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

function createDailyWeatherItem(data) {
    const dailyWeatherItem = document.createElement('div');
    dailyWeatherItem.classList.add('dailyWeatherItem');

    // Image
    const weatherImage = document.createElement('img');
    const imageLink = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;
    weatherImage.src = imageLink;
    dailyWeatherItem.appendChild(weatherImage);

    // Date
    const targetDate = document.createElement('div');
    targetDate.classList.add('itemDate');
    if (dateFormat) {
        // DD/MM
        targetDate.textContent = `${data.day}/${data.month}`;
    }
    else {
        // MM/DD
        targetDate.textContent = `${data.month}/${data.day}`;
    }
    dailyWeatherItem.appendChild(targetDate);

    // Description
    const desc = document.createElement('div');
    desc.classList.add('itemDescription');
    desc.textContent = data.desc;
    dailyWeatherItem.appendChild(desc);

    // Temp
    const tempDiv = document.createElement('div');
    tempDiv.classList.add('itemTempDiv');

    const tempImg = document.createElement('img');
    tempImg.classList.add('itemTempIcon', 'icon');
    tempImg.src = tempIcon; 
    tempDiv.appendChild(tempImg);

    const tempSubDiv = document.createElement('div');
    tempSubDiv.classList.add('itemTempSubDiv');

    const maxTemp = document.createElement('div');
    maxTemp.classList.add('itemMaxTemp');
    maxTemp.textContent = data.data.tempMax;
    tempSubDiv.appendChild(maxTemp);

    const minTemp = document.createElement('div');
    minTemp.classList.add('itemMinTemp');
    minTemp.textContent = data.data.tempMin;
    tempSubDiv.appendChild(minTemp);

    tempDiv.appendChild(tempSubDiv);
    dailyWeatherItem.appendChild(tempDiv);

    // Humidity
    const humidDiv = document.createElement('div');
    humidDiv.classList.add('itemHumidDiv');

    const humidImg = document.createElement('img');
    humidImg.classList.add('humidIcon', 'icon');
    humidImg.src = humidityIcon;
    humidImg.title = 'Humidity';
    humidDiv.appendChild(humidImg);

    const humid = document.createElement('div');
    const humidVal = `${data.data.humidity}`.slice(0,2);
    humid.textContent = `${humidVal}%`;
    humid.classList.add('itemStatText');
    humidDiv.appendChild(humid);

    dailyWeatherItem.appendChild(humidDiv);

    // Precipitation
    const precipDiv = document.createElement('div');
    precipDiv.classList.add('itemPrecipDiv');

    const precipImg = document.createElement('img');
    precipImg.classList.add('precipIcon', 'icon');
    precipImg.src = precipIcon;
    precipImg.title = 'Precipitation';
    precipDiv.appendChild(precipImg);

    const precip = document.createElement('div');
    const precipVal = +data.data.precipitation * 100;
    precip.textContent = `${precipVal}%`;
    precip.classList.add('itemStatText');
    precipDiv.appendChild(precip);

    dailyWeatherItem.appendChild(precipDiv);

    return dailyWeatherItem;
}

function updateDailyWeather(data) {
    const dailyWeatherDiv = document.querySelector('#dailyDisplay');
    for (let i = 0; i < data.length; i++) {
        dailyWeatherDiv.appendChild(createDailyWeatherItem(data[i]));
    }
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