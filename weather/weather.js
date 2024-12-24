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
const cityList = document.getElementById('cityList'); 
const dropdownButton = document.getElementById('dropdownButton');
const dropdownIcon = document.getElementById('dropdownIcon');
const forecastContainer = document.getElementById('fore-Container'); 


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

        
        wIcon.innerHTML = `<i class="fas fa-${getWeatherIcon(data.weather[0].main)}"></i>`;

        
        errorMessage.classList.add('hidden');
        wInfo.classList.remove('hidden');

        
        storeRecentCity(data.name);

       
        fetchFiveDayForecast(data.coord.lat, data.coord.lon);
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
};


const fetchFiveDayForecast = async (lat, lon) => {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const data = await response.json();

      
        const forecastData = data.list.filter((item, index) => index % 8 === 0); // Get forecast every 24 hours (8 items per day)

      
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
        

        
        document.getElementById('Forecast').classList.remove('hidden');
    } catch (error) {
        console.error('Error fetching 5-day forecast data:', error);
    }
};


const storeRecentCity = (city) => {
    let recentCities = JSON.parse(sessionStorage.getItem('recentCities')) || [];
    
    if (!recentCities.includes(city)) {
        if (recentCities.length >= 5) { 
            recentCities.shift(); 
        }
        recentCities.push(city);
        sessionStorage.setItem('recentCities', JSON.stringify(recentCities));
    }

    updateCityListDropdown();
};


const updateCityListDropdown = () => {
    const recentCities = JSON.parse(sessionStorage.getItem('recentCities')) || [];
    cityList.innerHTML = '';  

    recentCities.forEach(city => {
        const li = document.createElement('li');
        li.textContent = city;
        li.classList.add('px-4', 'py-2', 'cursor-pointer', 'hover:bg-gray-100');
        li.addEventListener('click', () => fetchWeatherByCity(city));  
        cityList.appendChild(li);
    });
};

dropdownButton.addEventListener('click', () => {
    const isVisible = cityList.classList.contains('hidden');
    cityList.classList.toggle('hidden', !isVisible); 
    dropdownIcon.classList.toggle('fa-chevron-up', !isVisible); 
    dropdownIcon.classList.toggle('fa-chevron-down', isVisible);
});


const showErrorMessage = (message) => {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    wInfo.classList.add('hidden');
};


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

searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeatherByCity(city);
        cityInput.value = ''; 
    } else {
        showErrorMessage('Please enter a city name.');
    }
});


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

updateCityListDropdown();
