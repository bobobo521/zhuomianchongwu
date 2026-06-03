const defaultLocation = {
  name: '北京',
  latitude: 39.9042,
  longitude: 116.4074
};
const requestTimeoutMs = 4500;

const weatherCodeLabels = {
  0: '晴',
  1: '大致晴朗',
  2: '多云',
  3: '阴',
  45: '有雾',
  48: '雾凇',
  51: '小毛毛雨',
  53: '毛毛雨',
  55: '大毛毛雨',
  61: '小雨',
  63: '中雨',
  65: '大雨',
  71: '小雪',
  73: '中雪',
  75: '大雪',
  80: '阵雨',
  81: '较强阵雨',
  82: '强阵雨',
  95: '雷雨'
};

export function createWeatherService({ settingsStore, fetcher = fetch }) {
  let settings = settingsStore.getSettings();
  let cachedWeather = null;
  let cachedAt = 0;
  let lastPromptAt = 0;
  let pendingAdvice = false;

  settingsStore.subscribe((nextSettings) => {
    const previousCity = settings.weather.city;

    settings = nextSettings;

    if (settings.weather.city !== previousCity) {
      clearCache();
    }
  });

  function clearCache() {
    cachedWeather = null;
    cachedAt = 0;
    pendingAdvice = false;
  }

  async function getMessage() {
    const weather = await getWeather();

    return formatWeatherMessage(weather);
  }

  async function getAdviceMessage() {
    const weather = await getWeather();

    return formatAdviceMessage(weather);
  }

  async function getClickMessage() {
    if (!shouldHandleClick()) {
      return null;
    }

    if (pendingAdvice) {
      pendingAdvice = false;
      return readWeatherMessage(getAdviceMessage);
    }

    if (Date.now() - lastPromptAt < settings.weather.clickIntervalMs) {
      return null;
    }

    lastPromptAt = Date.now();
    pendingAdvice = true;

    return readWeatherMessage(getMessage);
  }

  function shouldHandleClick() {
    if (!settings.modules.weather) {
      return false;
    }

    return pendingAdvice || Date.now() - lastPromptAt >= settings.weather.clickIntervalMs;
  }

  async function readWeatherMessage(reader) {
    try {
      return await reader();
    } catch {
      pendingAdvice = false;
      lastPromptAt = 0;
      return '天气没连上，等会再试。';
    }
  }

  async function getWeather() {
    if (cachedWeather && Date.now() - cachedAt < settings.weather.refreshIntervalMs) {
      return cachedWeather;
    }

    const location = await resolveLocation(settings.weather.city);
    const url = new URL('https://api.open-meteo.com/v1/forecast');

    url.searchParams.set('latitude', String(location.latitude));
    url.searchParams.set('longitude', String(location.longitude));
    url.searchParams.set('current', 'temperature_2m,weather_code');
    url.searchParams.set('hourly', 'temperature_2m,precipitation_probability,weather_code');
    url.searchParams.set('forecast_hours', '3');
    url.searchParams.set('timezone', 'auto');

    const response = await fetchWithTimeout(url, fetcher);

    if (!response.ok) {
      throw new Error('weather request failed');
    }

    const payload = await response.json();
    const current = payload.current ?? {};
    const hourly = payload.hourly ?? {};
    const weather = {
      city: location.name,
      temperature: round(current.temperature_2m),
      code: Number(current.weather_code),
      label: weatherCodeLabels[current.weather_code] ?? '天气不明',
      nextTwoHours: getNextTwoHours(hourly),
      updatedAt: current.time
    };

    cachedWeather = weather;
    cachedAt = Date.now();

    return weather;
  }

  async function resolveLocation(city) {
    const cleanCity = String(city || '').trim();

    if (!cleanCity || cleanCity === defaultLocation.name) {
      return defaultLocation;
    }

    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');

    url.searchParams.set('name', cleanCity);
    url.searchParams.set('count', '1');
    url.searchParams.set('language', 'zh');
    url.searchParams.set('format', 'json');

    const response = await fetchWithTimeout(url, fetcher);

    if (!response.ok) {
      throw new Error('location request failed');
    }

    const payload = await response.json();
    const result = payload.results?.[0];

    if (!result) {
      throw new Error('location not found');
    }

    return {
      name: result.name ?? cleanCity,
      latitude: result.latitude,
      longitude: result.longitude
    };
  }

  return {
    getMessage,
    getAdviceMessage,
    getClickMessage,
    shouldHandleClick,
    clearCache
  };
}

async function fetchWithTimeout(url, fetcher) {
  const controller = new AbortController();
  const timer = globalThis.setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    return await fetcher(url, { signal: controller.signal });
  } finally {
    globalThis.clearTimeout(timer);
  }
}

function formatWeatherMessage(weather) {
  return `${weather.city}现在${weather.temperature}°C，${weather.label}。两小时内：${formatNextTwoHours(weather.nextTwoHours)}。`;
}

function formatAdviceMessage(weather) {
  if (isRainy(weather.nextTwoHours)) {
    return '两小时内可能下雨，带伞。';
  }

  if (weather.temperature >= 30) {
    return '有点热，少折腾，多喝水。';
  }

  if (weather.temperature <= 5) {
    return '天气冷，添衣再出门。';
  }

  if ([0, 1].includes(weather.code)) {
    return '天气不错，适合短途出门。';
  }

  return '天气一般，适合稳稳做事。';
}

function getNextTwoHours(hourly) {
  const times = hourly.time ?? [];
  const temperatures = hourly.temperature_2m ?? [];
  const precipitation = hourly.precipitation_probability ?? [];
  const codes = hourly.weather_code ?? [];

  return times.slice(1, 3).map((time, index) => {
    const sourceIndex = index + 1;

    return {
      time,
      temperature: round(temperatures[sourceIndex]),
      precipitation: round(precipitation[sourceIndex]),
      code: Number(codes[sourceIndex]),
      label: weatherCodeLabels[codes[sourceIndex]] ?? '天气不明'
    };
  });
}

function formatNextTwoHours(hours) {
  if (!hours.length) {
    return '暂无预报';
  }

  return hours.map((hour) => `${formatHour(hour.time)}${hour.label}，雨${hour.precipitation}%`).join('；');
}

function formatHour(time) {
  const hour = String(time).match(/T(\d{2})/)?.[1];

  return hour ? `${Number(hour)}点` : '稍后';
}

function isRainy(hours) {
  return hours.some((hour) => hour.precipitation >= 40 || [51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(hour.code));
}

function round(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.round(number);
}
