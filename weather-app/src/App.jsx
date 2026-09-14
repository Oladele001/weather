import { useEffect, useState } from "react";

function App() {
  // Weather data
  const [weather, setWeather] = useState(null);

  // Loading state
  const [loading, setLoading] = useState(true);

  // Error state
  const [error, setError] = useState("");

  // City name
  const [city, setCity] = useState("Lagos");

  // Input value
  const [search, setSearch] = useState("");

  // Fetch weather
  async function fetchWeather(latitude, longitude, cityName) {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m&timezone=auto`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch weather");
      }

      const data = await response.json();

      setWeather(data);
      setCity(cityName);
    } catch (error) {
      setError("Could not get weather data.");
    } finally {
      setLoading(false);
    }
  }

  // Get Lagos weather when app starts
  useEffect(() => {
    fetchWeather(6.5244, 3.3792, "Lagos");
  }, []);

  // Search city
  async function handleSearch(e) {
    e.preventDefault();

    if (!search.trim()) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      // First find the city's coordinates
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          search
        )}&count=1&language=en&format=json`
      );

      if (!response.ok) {
        throw new Error("City search failed");
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        throw new Error("City not found");
      }

      const location = data.results[0];

      await fetchWeather(
        location.latitude,
        location.longitude,
        location.name
      );

      setSearch("");
    } catch (error) {
      setError("City not found. Try another city.");
      setLoading(false);
    }
  }

  // Loading screen
  if (loading) {
    return (
      <div className="app">
        <h1>🌤️ Weather App</h1>
        <p>Loading weather...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <h1>🌤️ Weather App</h1>

      {/* Search */}
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Enter city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button type="submit">
          Search
        </button>
      </form>

      {/* Error */}
      {error && (
        <p className="error">
          ❌ {error}
        </p>
      )}

      {/* Weather */}
      {weather && !error && (
        <div className="weather-card">

          <h2>{city}</h2>

          <div className="temperature">
            {Math.round(weather.current.temperature_2m)}°C
          </div>

          <p>
            Weather code: {weather.current.weather_code}
          </p>

          <p>
            💨 Wind: {weather.current.wind_speed_10m} km/h
          </p>

        </div>
      )}
    </div>
  );
}

export default App;