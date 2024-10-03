const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const weatherCardDiv = document.querySelector(".weather-cards");
const currentWeatherDiv = document.querySelector(".current-weather");



const API_KEY = "56ed5568584a635e9e25f1cdb736c8be"; //get a api key from openweathermap

const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) { //for the main card
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4> 
                    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    }
    else { // for the rest of the cards
        return `<li class="card">
                <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4> 
                <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                <h4>Humidity: ${weatherItem.main.humidity}%</h4>
            </li>`; // tofixed is for get answer upto 2 digits
    }
}

//API gives us the forecast after a gap of 3 hours so we have to make it for 5 days
const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        //console.log(data);

        //filter the forecasts to get only one forecast per day
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });

        //CLAERING PREVIOUS WEATHER DATA
        cityInput.value = "";
        weatherCardDiv.innerHTML = "";
        currentWeatherDiv.innerHTML = "";

        // console.log(fiveDaysForecast);
        // creating weather cards and adding items to DOM
        fiveDaysForecast.forEach((weatherItem, index) => {
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            }
            else {
                weatherCardDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            }
        });
    }).catch(() => {
        alert("Some error occured in fetching weather forecast!!");
    });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim(); //get user entered city name and trim remove extra spaces
    if (!cityName) return;
    const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    //fetch function is used to make network requests (e.g., fetching data from a server). It returns a Promise that resolves to the Response to that request, whether it is successful or not.
    //get entered city coordinates from api response
    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        // console.log(data);
        if (!data.length) return alert("Some error occured in fetching coordinates!!");
        const { name, lat, lon } = data[0]; //extract name longitude and lattitude from api call
        getWeatherDetails(name, lat, lon);
    }).catch(() => {
        alert("Some error occured in fetching coordinates!!");
    });
}

const getUserCoordinates = () => {
    //to get direct geo location of user using built in fuctions
    navigator.geolocation.getCurrentPosition(
        position => {
            // console.log(position);
            //get co-ords of location
            const { latitude, longitude } = position.coords;
            //get city name by co-ords
            const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
                // console.log(data);
                // if(!data.length) return alert("Some error occured in fetching coordinates!!");
                const { name } = data[0]; //extract name longitude and lattitude from api call
                getWeatherDetails(name, latitude, longitude);
            }).catch(() => {
                alert("Some error occured in fetching the city!!");
            });
        },
        error => {
            //console.log(error);
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation permission denied. Please reset location permission to grant access again.");
            }
        }
    );
}

locationButton, addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
