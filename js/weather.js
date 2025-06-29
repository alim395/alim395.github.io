// weather.js - weather gadget and time update logic as ES module

export function updateTime() {
  const timeEls = document.querySelectorAll('.time');
  let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let options = { hour: '2-digit', minute: '2-digit', timeZone: timezone };
  let time = new Date().toLocaleTimeString('en-US', options);
  if (!timezone || timezone === 'UTC') {
    time = new Date().toLocaleTimeString('en-US', { ...options, timeZone: 'Europe/London' });
  }
  timeEls.forEach(el => el.textContent = time);
}

export async function updateTemperature(lat, lng) {
  const tempEls = document.querySelectorAll('.temp');
  const cityEls = document.querySelectorAll('.city');
  try {
    const response = await fetch(`https://l4o50876nc.execute-api.us-east-2.amazonaws.com/prod/weather?lat=${lat}&lng=${lng}`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    tempEls.forEach(el => el.textContent = `${data.temp_c}°C`);
    cityEls.forEach(el => el.textContent = data.city || "Unknown");
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    tempEls.forEach(el => el.textContent = "N/A");
    cityEls.forEach(el => el.textContent = "Unknown");
  }
}

export function updateAll(lat, lng) {
  updateTime();
  updateTemperature(lat, lng);
}

export function initWeatherGadget() {
  let lat = 51.5074; // Default: London
  let lng = -0.1278;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        updateAll(lat, lng);
      },
      () => {
        updateAll(lat, lng); // Use default on error
      }
    );
  } else {
    updateAll(lat, lng); // Use default if no geolocation
  }
}
