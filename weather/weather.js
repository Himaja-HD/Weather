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
const errorMessage = document.getElementById('errorMessage'); // Error message div

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
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
};

// Function to fetch weather data by current location
const fetchWeatherByLocation = async (lat, lon) => {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        
        cityName.textContent = data.name;
        temp.textContent = `Temperature: ${data.main.temp}°C`;
        humid.textContent = `Humidity: ${data.main.humidity}%`;
        wind.textContent = `Wind Speed: ${data.wind.speed} m/s`;

        // Weather icons
        wIcon.innerHTML = `<i class="fas fa-${getWeatherIcon(data.weather[0].main)}"></i>`;

        // Hide the error message and show the weather info
        errorMessage.classList.add('hidden');
        wInfo.classList.remove('hidden');
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
};

// Function to get weather icon class based on condition
const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
        case 'clear':
            return 'sun';
        case 'clouds':
            return 'cloud';
        case 'rain':
            return 'cloud-rain';
        case 'snow':
            return 'snowflake';
        case 'storm':
            return 'cloud-showers-heavy';
        default:
            return 'sun';  // Default to sunny
    }
};

// Function to show error message
const showErrorMessage = (message) => {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
};

// Event listener for search button (city name)
searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeatherByCity(city);
    } else {
        showErrorMessage('Please enter a city name.');
    }
});

// Event listener for current location button
locationButton.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeatherByLocation(lat, lon);
        }, error => {
            showErrorMessage('Unable to retrieve your location.');
        });
    } else {
        showErrorMessage('Geolocation is not supported by this browser.');
    }
});
