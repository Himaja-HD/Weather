// API key for accessing OpenWeatherMap API
const apiKey = "41c83b89c32f021f16e4b543733d57fc";

// DOM element references
const header = document.getElementById('header');
const toggleButton = document.getElementById('tgleBtn');
const icon = document.getElementById('icon');
const searchButton = document.getElementById('searchButton');
const locationButton = document.getElementById('locationButton');
const cityInput = document.getElementById('cityInput');
const cityName = document.getElementById('cityName');
const temp = document.getElementById('temp');
const humid = document.getElementById('humid');
const wind = document.getElementById('wind');
const wIcon = document.getElementById('wIcon');
const wInfo = document.getElementById('wInfo');
const errorMessage = document.getElementById('errorMessage');
const cityList = document.getElementById('cityList');
const dropdownButton = document.getElementById('dropdownButton');
const dropdownIcon = document.getElementById('dropdownIcon');
const forecastContainer = document.getElementById('fore-Container');
const Forecast = document.getElementById('Forecast');

// Event listener for theme toggle button (sun/moon icon change)
toggleButton.addEventListener('click', () => {
    // Toggle header background color between default and green
    if (header.style.backgroundColor === 'rgb(4, 205, 118)') {
        header.style.backgroundColor = '';
    } else {
        header.style.backgroundColor = '#04cd76';
    }

    // Toggle sun and moon icons
    if (icon.classList.contains('fa-sun')) {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    } else {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
});

// Function to fetch weather data for a given city
const fetchWeatherByCity = async (city) => {
    try {
        // Fetch weather data from OpenWeatherMap API
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();

        // Check if city data is found, otherwise show error
        if (data.cod !== 200) {
            showErrorMessage('City not found or invalid input.');
            return;
        }

        // Display weather data on the page
        cityName.textContent = data.name;
        temp.textContent = `Temperature: ${data.main.temp}°C`;
        humid.textContent = `Humidity: ${data.main.humidity}%`;
        wind.textContent = `Wind Speed: ${data.wind.speed} m/s`;

        // Set weather icon based on weather condition
        wIcon.innerHTML = `<i class="fas fa-${getWeatherIcon(data.weather[0].main)}"></i>`;

        // Hide error message and show weather info
        errorMessage.classList.add('hidden');
        wInfo.classList.remove('hidden');
        Forecast.classList.remove('hidden');
        // Store recently searched city
        storeRecentCity(data.name);

        // Fetch 5-day weather forecast for the city
        fetchFiveDayForecast(data.coord.lat, data.coord.lon);
    } catch (error) {
        // Catch any errors from fetching weather data
        console.error('Error fetching weather data:', error);
    }
};

// Function to fetch 5-day weather forecast based on latitude and longitude
const fetchFiveDayForecast = async (lat, lon) => {
    try {
        // Fetch forecast data from OpenWeatherMap API
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const data = await response.json();

        // Filter the forecast data to get one forecast per day (every 8th item)
        const forecastData = data.list.filter((item, index) => index % 8 === 0);

        // Clear previous forecast data
        forecastContainer.innerHTML = '';

        // Display forecast for the next 5 days
        forecastData.forEach(item => {
            const forecastItem = document.createElement('div');
            forecastItem.classList.add('forecast-item', 'bg-blue-50', 'rounded-lg', 'm-1', 'flex', 'flex-col', 'p-4', 'lg:w-1/5');
            forecastItem.innerHTML = `
                <p class="text-lg font-semibold text-center">${new Date(item.dt * 1000).toLocaleDateString()}</p>
                <div class="text-center flex flex-col items-center p-3">
                    <i class="fas fa-${getWeatherIcon(item.weather[0].main)} text-yellow-500 text-4xl"></i>
                    <div>
                        <p class="mt-2">Temp: ${item.main.temp}°C</p>
                        <p>Wind: ${item.wind.speed} m/s</p>
                        <p>Humidity: ${item.main.humidity}%</p>
                    </div>
                </div>
            `;

            forecastContainer.appendChild(forecastItem);
        });

        // Show the 5-day forecast section
        document.getElementById('Forecast').classList.remove('hidden');
    } catch (error) {
        // Catch any errors from fetching the forecast data
        console.error('Error fetching 5-day forecast data:', error);
    }
};

// Function to store recently searched city in sessionStorage
const storeRecentCity = (city) => {
    let recentCities = JSON.parse(sessionStorage.getItem('recentCities')) || [];

    // If city is not already in the list, add it
    if (!recentCities.includes(city)) {
        if (recentCities.length >= 5) {
            recentCities.shift(); // Remove the oldest city if there are already 5 cities
        }
        recentCities.push(city);
        sessionStorage.setItem('recentCities', JSON.stringify(recentCities));
    }

    // Update the dropdown with recent cities
    updateCityListDropdown();
};

// Function to update the dropdown with recently searched cities
const updateCityListDropdown = () => {
    const recentCities = JSON.parse(sessionStorage.getItem('recentCities')) || [];
    cityList.innerHTML = ''; // Clear the existing list

    // Add each city to the dropdown
    recentCities.forEach(city => {
        const li = document.createElement('li');
        li.textContent = city;
        li.classList.add('px-4', 'py-2','hover:bg-gray-100');
        li.addEventListener('click', () => fetchWeatherByCity(city)); // Fetch weather for the city when clicked
        cityList.appendChild(li);
    });
};

// Event listener for dropdown button to show/hide the recent cities list
dropdownButton.addEventListener('click', () => {
    const isVisible = cityList.classList.contains('hidden');
    cityList.classList.toggle('hidden', !isVisible); // Toggle visibility of the city list
    dropdownIcon.classList.toggle('fa-chevron-up', !isVisible); // Change icon direction
    dropdownIcon.classList.toggle('fa-chevron-down', isVisible);
});

// Function to display an error message
const showErrorMessage = (message) => {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden'); // Show the error message
    wInfo.classList.add('hidden'); // Hide the weather information
    Forecast.classList.add('hidden');
};

// Function to get the appropriate weather icon based on weather condition
const getWeatherIcon = (weatherCondition) => {
    switch (weatherCondition) {
        case 'Clear':
            return 'sun';
        case 'Clouds':
            return 'cloud';
        case 'Rain':
            return 'cloud-showers-heavy';
        case 'Snow':
            return 'snowflake';
        case 'Thunderstorm':
            return 'bolt';
        default:
            return 'cloud'; // Default icon for unknown conditions
    }
};

// Event listener for search button to fetch weather for entered city
searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeatherByCity(city); // Fetch weather for the entered city
        cityInput.value = ''; // Clear the input field
    } else {
        showErrorMessage('Please enter a city name.'); // Show error if city input is empty
    }
});

// Event listener for location button to get weather based on the user's current location
locationButton.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
            const data = await response.json();
            fetchWeatherByCity(data.name); // Fetch weather based on the user's current location
        } catch (error) {
            showErrorMessage('Failed to retrieve weather data based on your location.'); // Error if geolocation fails
        }
    });
});

// recent cities on page load
updateCityListDropdown();
