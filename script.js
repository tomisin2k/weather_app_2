
document.addEventListener("DOMContentLoaded", () => {
    const locationInput = document.getElementById("locationInput");
    const locationName = document.getElementById("locationName");
    const searchIcon = document.getElementById("searchIcon");
    const degreeElement = document.querySelector(".div-2-degree");
    const degreeDescriptionElement = document.querySelector(".div-2-degree-description");
    const weatherImage = document.querySelector(".div-2-img");
    const forecastCardsContainer = document.getElementById("forecastCards");
    const toggleCheckbox = document.getElementById("darkModeToggle");
    const toggleLabel = document.getElementById("toggleLabel");


    const apiKey = '57753fc02362e55f7f474eb64ff457b8'; // Replace with your OpenWeatherMap API key

    const updateLocation = () => {
        let newLocation = locationInput.value.trim();
        if (newLocation) {
            // Capitalize the first letter of each word
            newLocation = newLocation.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            locationName.textContent = newLocation;
            getWeather(newLocation);
            updateAdditionalWeatherData(newLocation); // Update additional weather data
        }
    };

    const getWeather = (city) => {
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
        
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.cod === 200) {
                    const temp = Math.round(data.main.temp);
                    const feelsLike = Math.round(data.main.feels_like);
                    const weatherDescription = data.weather[0].description;

                    degreeElement.textContent = `${temp}º`;
                    degreeDescriptionElement.textContent = `Feels like ${feelsLike}º/${weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1)}`;
                    
                    updateWeatherImage(weatherDescription);
                    getForecast(city);
                } else {
                    alert('City not found');
                }
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                alert('Error fetching weather data');
            });
    };

    const getForecast = (city) => {
        const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

        fetch(forecastApiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.cod === "200") {
                    forecastCardsContainer.innerHTML = ''; // Clear existing cards

                    data.list.slice(0, 4).forEach((forecast, index) => {
                        const time = new Date(forecast.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const temp = Math.round(forecast.main.temp);
                        const feelsLike = Math.round(forecast.main.feels_like);
                        const description = forecast.weather[0].description;
                        const imgSrc = getWeatherImageSrc(description);

                        const cardHtml = `
                            <div class="div-4-card div-4-card-${index + 1}">
                                <p>${time}</p>
                                <img class="div-4-card-img div-4-card-img-${index + 1}" src="${imgSrc}" alt="">
                                <p>${temp}º/${feelsLike}º</p>
                            </div>
                        `;
                        forecastCardsContainer.innerHTML += cardHtml;
                    });
                } else {
                    alert('Error fetching forecast data');
                }
            })
            .catch(error => {
                console.error('Error fetching forecast data:', error);
                alert('Error fetching forecast data');
            });
    };

    const updateAdditionalWeatherData = (city) => {
        const additionalDataElements = document.querySelectorAll('.div-5 > div p:first-of-type');
        const additionalDataApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

        fetch(additionalDataApiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.cod === 200) {
                    additionalDataElements[0].textContent = getUvIndexText(data.main.uvi); // Mock UV Index as OpenWeatherMap free tier doesn't provide UVI in current weather
                    additionalDataElements[1].textContent = `${data.wind.speed.toFixed(1)} km/h`;
                    additionalDataElements[2].textContent = `${data.main.humidity}%`;
                    additionalDataElements[3].textContent = `${(data.visibility / 1000).toFixed(2)} km`;
                    additionalDataElements[4].textContent = `${calculateDewPoint(data.main.temp, data.main.humidity).toFixed(1)}º`;
                    additionalDataElements[5].textContent = `${data.main.pressure} mb`;
                } else {
                    alert('Error fetching additional weather data');
                }
            })
            .catch(error => {
                console.error('Error fetching additional weather data:', error);
                alert('Error fetching additional weather data');
            });
    };

    const updateWeatherImage = (description) => {
        weatherImage.src = getWeatherImageSrc(description);
    };

    const getWeatherImageSrc = (description) => {
        if (description.includes('cloud')) {
            return 'images/cloudy.png';
        } else if (description.includes('rain')) {
            return 'images/storm.png';
        } else if (description.includes('snow')) {
            return 'images/snow.png';
        } else if (description.includes('clear')) {
            return 'images/sun.png';
        }
        return 'images/sun.png'; // Default image
    };

    const getUvIndexText = (uvi) => {
        if (uvi >= 8) return 'Very High';
        if (uvi >= 6) return 'High';
        if (uvi >= 3) return 'Moderate';
        return 'Low';
    };

    const calculateDewPoint = (temp, humidity) => {
        const a = 17.27;
        const b = 237.7;
        const alpha = ((a * temp) / (b + temp)) + Math.log(humidity / 100);
        return (b * alpha) / (a - alpha);
    };

    const toggleDarkMode = () => {
        document.body.classList.toggle('dark-mode');
        document.querySelectorAll('.div-1, .div-2, .div-3, .div-4, .div-5 > div').forEach((element) => {
            element.classList.toggle('dark-mode');
        });
        toggleLabel.textContent = document.body.classList.contains('dark-mode') ? 'Switch to light mode' : 'Switch to dark mode';
    };

    searchIcon.addEventListener("click", updateLocation);

    locationInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            updateLocation();
        }
    });

    toggleCheckbox.addEventListener("change", toggleDarkMode);

    // Initial update on page load
    getWeather('Lagos'); // Default location is Lagos
});
