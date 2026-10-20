"use client";

import { useState, useEffect } from "react";

type CurrentWeather = {
  temperature_2m: number;
  relative_humidity_2m: number;
  wind_speed_10m: number;
  weather_code: number;
};

type DailyForecast = {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weather_code: number[];
};

// Maps Open-Meteo's WMO weather codes to emoji icons
function getWeatherIcon(code: number) {
  if (code === 0) return "☀️"; // Clear sky
  if (code <= 2) return "🌤️"; // Mainly clear / partly cloudy
  if (code === 3) return "☁️"; // Overcast
  if (code >= 45 && code <= 48) return "🌫️"; // Fog
  if (code >= 51 && code <= 57) return "🌧️"; // Drizzle
  if (code >= 61 && code <= 67) return "🌧️"; // Rain
  if (code >= 71 && code <= 77) return "🌨️"; // Snow
  if (code >= 80 && code <= 82) return "🌧️"; // Rain showers
  if (code >= 85 && code <= 86) return "🌨️"; // Snow showers
  if (code >= 95) return "⛈️"; // Thunderstorm
  return "❓"; // Unknown code
}

export default function Home() {
  const [weather, setWeather] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<DailyForecast | null>(null);
  const [city, setCity] = useState("");
  const [cityName, setCityName] = useState("Phnom Penh");
  const [error, setError] = useState<string | null>(null);

  async function fetchWeatherForCoords(lat: number, lon: number) {
    const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`
    );
    const data = await res.json();
    setWeather(data.current);
    setForecast(data.daily);
  }

  async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
    );
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      setError("City not found. Try another name.");
      return;
    }

    const { latitude, longitude, name } = geoData.results[0];
    setCityName(name);
    fetchWeatherForCoords(latitude, longitude);
  }

  useEffect(() => {
    fetchWeatherForCoords(11.5564, 104.9282);
  }, []);

  return (
      <main className="min-h-screen p-8 max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-slate-800">Weather Dashboard</h1>

        <form onSubmit={handleSearch} className="mb-8 flex gap-2">
          <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter a city..."
              className="border border-slate-300 rounded-lg px-4 py-2 w-64 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-2 rounded-lg shadow-sm font-medium"
          >
            Search
          </button>
        </form>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <h2 className="text-2xl font-semibold mb-3 text-slate-700">{cityName}</h2>

        {weather ? (
            <div className="bg-white rounded-2xl shadow-md p-6 mb-8 flex items-center gap-4">
              <span className="text-6xl">{getWeatherIcon(weather.weather_code)}</span>
              <div className="text-slate-700">
                <p className="text-2xl font-semibold">{weather.temperature_2m}°C</p>
                <p className="text-sm">Humidity: {weather.relative_humidity_2m}%</p>
                <p className="text-sm">Wind: {weather.wind_speed_10m} km/h</p>
              </div>
            </div>
        ) : (
            <p className="text-slate-500">Loading...</p>
        )}

        {forecast && (
            <div>
              <h2 className="text-xl font-semibold mb-3 text-slate-700">7-Day Forecast</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {forecast.time.map((date, index) => (
                    <div
                        key={date}
                        className="bg-white rounded-xl shadow-sm p-4 text-center hover:shadow-md transition"
                    >
                      <p className="font-medium text-slate-700 font-poppins">
                        {new Date(date).toLocaleDateString("en-US", { weekday: "short" })}
                      </p>
                      <p className="text-xs text-slate-400">{date}</p>
                      <p className="text-3xl my-1">
                        {getWeatherIcon(forecast.weather_code[index])}
                      </p>
                      <p className="text-sm text-slate-600">
                        ↑ {forecast.temperature_2m_max[index]}°C
                      </p>
                      <p className="text-sm text-slate-400">
                        ↓ {forecast.temperature_2m_min[index]}°C
                      </p>
                    </div>
                ))}
              </div>
            </div>
        )}
      </main>
  );
}
