const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const weatherDescription = document.getElementById("weatherDescription");
const weatherIcon = document.getElementById("weatherIcon");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const feelsLike = document.getElementById("feelsLike");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");
const forecast = document.getElementById("forecast");
const status = document.getElementById("status");

/* ================================
WEATHER DESCRIPTION
================================ */

function getWeatherDescription(code) {

const weather = {
    0: ["Clear sky", "☀️"],
    1: ["Mainly clear", "🌤️"],
    2: ["Partly cloudy", "⛅"],
    3: ["Overcast", "☁️"],
    45: ["Fog", "🌫️"],
    48: ["Fog", "🌫️"],
    51: ["Light drizzle", "🌦️"],
    53: ["Drizzle", "🌦️"],
    55: ["Heavy drizzle", "🌧️"],
    61: ["Light rain", "🌦️"],
    63: ["Rain", "🌧️"],
    65: ["Heavy rain", "🌧️"],
    71: ["Light snow", "🌨️"],
    73: ["Snow", "❄️"],
    75: ["Heavy snow", "❄️"],
    80: ["Rain showers", "🌦️"],
    81: ["Rain showers", "🌧️"],
    82: ["Heavy rain showers", "⛈️"],
    95: ["Thunderstorm", "⛈️"],
    96: ["Thunderstorm with hail", "⛈️"],
    99: ["Thunderstorm with hail", "⛈️"]
};

return weather[code] || ["Unknown weather", "🌡️"];

}

/* ================================
WEATHER BACKGROUND
================================ */

function updateWeatherBackground(code, isDay) {

document.body.classList.remove(
    "clear-weather",
    "cloudy-weather",
    "rain-weather",
    "storm-weather",
    "fog-weather",
    "night-weather"
);

if (!isDay) {
    document.body.classList.add("night-weather");
    return;
}

if (code === 0 || code === 1) {

    document.body.classList.add("clear-weather");

} else if (code === 2 || code === 3) {

    document.body.classList.add("cloudy-weather");

} else if (code === 45 || code === 48) {

    document.body.classList.add("fog-weather");

} else if (code >= 51 && code <= 82) {

    document.body.classList.add("rain-weather");

} else if (code >= 95) {

    document.body.classList.add("storm-weather");

} else {

    document.body.classList.add("cloudy-weather");
}

}

/* ================================
GET WEATHER
================================ */

async function getWeather(latitude, longitude, locationText) {

status.textContent = "Getting live weather...";

try {

    const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`
    );

    if (!response.ok) {
        throw new Error("Weather request failed");
    }

    const data = await response.json();

    displayWeather(data, locationText);

    status.textContent = "";

} catch (error) {

    console.error(error);

    status.textContent =
        "Unable to get weather. Check your internet connection.";
}

}

/* ================================
SEARCH CITY
================================ */

async function searchCity(city) {

if (!city.trim()) {

    status.textContent =
        "Please enter a city name.";

    return;
}

status.textContent =
    "Searching for city...";

try {

    const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );

    if (!response.ok) {
        throw new Error("City search failed");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {

        status.textContent =
            "City not found. Try another city.";

        return;
    }

    const location = data.results[0];

    const locationText =
        `${location.name}, ${location.country_code || ""}`;

    await getWeather(
        location.latitude,
        location.longitude,
        locationText
    );

} catch (error) {

    console.error(error);

    status.textContent =
        "Something went wrong. Check your internet connection.";
}

}

/* ================================
DISPLAY WEATHER
================================ */

function displayWeather(data, locationText) {

const current = data.current;

const [description, icon] =
    getWeatherDescription(
        current.weather_code
    );

cityName.textContent =
    locationText;

temperature.textContent =
    Math.round(current.temperature_2m);

weatherDescription.textContent =
    description;

weatherIcon.textContent =
    icon;

humidity.textContent =
    `${current.relative_humidity_2m}%`;

wind.textContent =
    `${Math.round(current.wind_speed_10m)} km/h`;

feelsLike.textContent =
    `${Math.round(current.apparent_temperature)}°C`;


/* Sunrise */

sunrise.textContent =
    new Date(
        data.daily.sunrise[0]
    ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });


/* Sunset */

sunset.textContent =
    new Date(
        data.daily.sunset[0]
    ).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });


/* Automatic background */

updateWeatherBackground(
    current.weather_code,
    current.is_day === 1
);


/* Forecast */

forecast.innerHTML = "";


for (
    let i = 0;
    i < data.daily.time.length;
    i++
) {

    const date =
        new Date(
            data.daily.time[i] +
            "T12:00:00"
        );

    const day =
        date.toLocaleDateString(
            "en-US",
            {
                weekday: "short"
            }
        );

    const [
        description,
        icon
    ] =
        getWeatherDescription(
            data.daily.weather_code[i]
        );

    const card =
        document.createElement("div");

    card.className =
        "forecast-day";

    card.innerHTML = `
        <p>${day}</p>

        <span>${icon}</span>

        <strong>
            ${Math.round(
                data.daily.temperature_2m_max[i]
            )}°C
        </strong>

        <small>
            ${Math.round(
                data.daily.temperature_2m_min[i]
            )}°C
        </small>
    `;

    card.title =
        description;

    forecast.appendChild(card);
}

}

/* ================================
SEARCH BUTTON
================================ */

searchBtn.addEventListener(
"click",
function () {

    searchCity(
        cityInput.value
    );

}

);

/* ================================
ENTER KEY
================================ */

cityInput.addEventListener(
"keydown",
function (event) {

    if (event.key === "Enter") {

        searchCity(
            cityInput.value
        );

    }

}

);

/* ================================
MY LOCATION
================================ */

locationBtn.addEventListener(
"click",
function () {

    if (!navigator.geolocation) {

        status.textContent =
            "Location is not supported by this browser.";

        return;
    }

    status.textContent =
        "Getting your location...";

    navigator.geolocation.getCurrentPosition(

        function (position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;

            getWeather(
                latitude,
                longitude,
                "Your Location"
            );

        },

        function () {

            status.textContent =
                "Location permission was denied. Please allow location access.";

        }

    );

}

);

/* ================================
DEFAULT CITY
================================ */

searchCity("Lagos");