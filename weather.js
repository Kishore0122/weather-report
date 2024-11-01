  const locationInput = document.getElementById('locationInput');
        const searchBtn = document.getElementById('searchBtn');
        const locationBtn = document.getElementById('locationBtn');
        const loadingText = document.getElementById('loadingText');
        const weatherCard = document.getElementById('weatherCard');
        const errorText = document.getElementById('errorText');
        const API_KEY = '8ee4faaeb7349428179be9171ded9f58';

        // Show or hide loading indicator
        function setLoading(isLoading) {
            loadingText.style.display = isLoading ? 'block' : 'none';
            weatherCard.style.display = isLoading ? 'none' : 'block';
            errorText.style.display = 'none';
        }

        // Display error message
        function showError(message) {
            errorText.textContent = message;
            errorText.style.display = 'block';
            weatherCard.style.display = 'none';
        }

        // Fetch weather data
        async function fetchWeather(location) {
            setLoading(true);
            try {
                const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${API_KEY}`);
                const geoData = await geoResponse.json();

                if (!geoData.length) {
                    showError('Location not found! Please try another city name.');
                    setLoading(false);
                    return;
                }

                const { lat, lon } = geoData[0];
                const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
                const weatherData = await weatherResponse.json();

                const processedData = {
                    location: location,
                    temperature: Math.round(weatherData.main.temp),
                    condition: weatherData.weather[0].main,
                    humidity: weatherData.main.humidity,
                    windSpeed: Math.round(weatherData.wind.speed * 3.6),
                    feelsLike: Math.round(weatherData.main.feels_like)
                };

                updateWeatherUI(processedData);
                errorText.style.display = 'none';
            } catch (error) {
                showError('Error fetching weather data. Please try again.');
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        }

        // Update UI with weather data
        function updateWeatherUI(data) {
            document.getElementById('location').textContent = data.location;
            document.getElementById('temperature').textContent = data.temperature;
            document.getElementById('condition').textContent = data.condition;
            document.getElementById('windSpeed').textContent = data.windSpeed;
            document.getElementById('humidity').textContent = data.humidity;
            document.getElementById('feelsLike').textContent = data.feelsLike;
            weatherCard.style.display = 'block';
        }

        searchBtn.addEventListener('click', () => {
            const location = locationInput.value.trim();
            if (location) fetchWeather(location);
        });

        locationInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchBtn.click();
        });

        locationBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const { latitude, longitude } = position.coords;
                    setLoading(true);
                    try {
                        const geoResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`);
                        const data = await geoResponse.json();

                        const location = data.name;
                        fetchWeather(location);
                    } catch (error) {
                        showError('Error fetching location data. Please try again.');
                        setLoading(false);
                    }
                });
            } else {
                showError('Geolocation is not supported by this browser.');
            }
        });