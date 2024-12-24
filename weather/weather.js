const apiKey = "41c83b89c32f021f16e4b543733d57fc";
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
const cityList = document.getElementById('cityList'); // Dropdown menu for recent cities
const dropdownButton = document.getElementById('dropdownButton');
const dropdownIcon = document.getElementById('dropdownIcon');
const forecastContainer = document.getElementById('fore-Container'); // Container for 5-day forecast

// Toggle button for dark mode
toggleButton.addEventListener('click', () => {
    if (header.style.backgroundColor === 'rgb(4, 205, 118)') {
        header.style.backgroundColor = '';
    } else {
        header.style.backgroundColor = '#04cd76'; 
    }
    if (icon.classList.contains('fa-sun')) {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    } else {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
});

// Function to fetch weather data by city name
const fetchWeatherByCity = async (city) => {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        const data = await response.json();

        if (data.cod !== 200) {
            showErrorMessage('City not found or invalid input.');
            return;
        }

        cityName.textContent = data.name;
        temp.textContent = `Temperature: ${data.main.temp}°C`;
        humid.textContent = `Humidity: ${data.main.humidity}%`;
        wind.textContent = `Wind Speed: ${data.wind.speed} m/s`;

        // Weather icons
        wIcon.innerHTML = `<i class="fas fa-${getWeatherIcon(data.weather[0].main)}"></i>`;

        // Hide the error message and show the weather info
        errorMessage.classList.add('hidden');
        wInfo.classList.remove('hidden');

        // Store recent city in sessionStorage
        storeRecentCity(data.name);

        // Fetch 5-day forecast
        fetchFiveDayForecast(data.coord.lat, data.coord.lon);
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
};

// Function to fetch 5-day weather forecast
const fetchFiveDayForecast = async (lat, lon) => {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const data = await response.json();

        // Display 5-day forecast
        const forecastData = data.list.filter((item, index) => index % 8 === 0); // Get forecast every 24 hours (8 items per day)

        // Clear previous forecast data
        forecastContainer.innerHTML = '';

        forecastData.forEach(item => {
            const forecastItem = document.createElement('div');
            forecastItem.classList.add('forecast-item', 'bg-blue-50','rounded-lg', 'm-1', 'flex',  'flex-col',  'p-4', 'lg:w-1/5');
        
            forecastItem.innerHTML = `
                <p class="text-lg font-semibold text-center">${new Date(item.dt * 1000).toLocaleDateString()}</p>
                <div class="text-center flex flex-col items-center p-3">
                    <i class="fas fa-${getWeatherIcon(item.weather[0].main)} text-blue-300 text-4xl"></i>
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
        console.error('Error fetching 5-day forecast data:', error);
    }
};

// Function to store recent cities in sessionStorage
const storeRecentCity = (city) => {
    let recentCities = JSON.parse(sessionStorage.getItem('recentCities')) || [];
    
    if (!recentCities.includes(city)) {
        if (recentCities.length >= 5) {  // Limit to 5 recent cities
            recentCities.shift();  // Remove the oldest city
        }
        recentCities.push(city);
        sessionStorage.setItem('recentCities', JSON.stringify(recentCities));
    }

    updateCityListDropdown();  // Update the dropdown with recent cities
};

// Function to update the dropdown with recent cities
const updateCityListDropdown = () => {
    const recentCities = JSON.parse(sessionStorage.getItem('recentCities')) || [];
    cityList.innerHTML = '';  // Clear existing items

    recentCities.forEach(city => {
        const li = document.createElement('li');
        li.textContent = city;
        li.classList.add('px-4', 'py-2', 'cursor-pointer', 'hover:bg-gray-100');
        li.addEventListener('click', () => fetchWeatherByCity(city));  // Fetch weather when clicked
        cityList.appendChild(li);
    });
};

// Function to toggle dropdown visibility
dropdownButton.addEventListener('click', () => {
    const isVisible = cityList.classList.contains('hidden');
    cityList.classList.toggle('hidden', !isVisible); // Toggle visibility
    dropdownIcon.classList.toggle('fa-chevron-up', !isVisible); // Change icon when clicked
    dropdownIcon.classList.toggle('fa-chevron-down', isVisible); // Reset icon
});

// Function to show error message
const showErrorMessage = (message) => {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    wInfo.classList.add('hidden');
};

// Function to get weather icon
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
            return 'cloud';
    }
};

// Handle search button click
searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeatherByCity(city);
        cityInput.value = '';  // Clear the input
    } else {
        showErrorMessage('Please enter a city name.');
    }
});

// Handle location button click
locationButton.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
            const data = await response.json();
            fetchWeatherByCity(data.name);
        } catch (error) {
            showErrorMessage('Failed to retrieve weather data based on your location.');
        }
    });
});

// Update the dropdown with recent cities on page load
updateCityListDropdown();
