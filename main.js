let assetsLoaded = false;
let minDelayElapsed = false;


const loadImage = (url) => new Promise((resolve, reject) => {
  const img = new Image();
  img.addEventListener('load', () => resolve(img));
  img.addEventListener('error', (err) => reject(err));
  img.src = url;
});

const imagePromises = [
  loadImage('public/images/Bliss21XL_Saturated.png'),
  loadImage('public/images/Bliss21XL_Night.png')
];

Promise.all(imagePromises)
  .then(() => {
    // All images loaded successfully
  })
  .catch((err) => {
    console.error('Failed to load image:', err);
    // You could fall back to a default image or show an error message
  });


const siteWrapper = document.querySelector('.site-wrapper');
const toggleBtn = document.getElementById('toggleImageBtn');
const dayLayer = document.querySelector('.bg-layer.day');
const nightLayer = document.querySelector('.bg-layer.night');

let isNight = false;

if (toggleBtn && dayLayer && nightLayer) {
  toggleBtn.addEventListener('click', () => {
    isNight = !isNight;
    if (isNight) {
      dayLayer.style.opacity = '0';
      nightLayer.style.opacity = '1';
    } else {
      dayLayer.style.opacity = '1';
      nightLayer.style.opacity = '0';
    }
  });
}

// Minimum delay
setTimeout(() => {
  minDelayElapsed = true;
  if (assetsLoaded) hideLoader();
}, 3000);

// Asset load handler
window.addEventListener('load', function() {
  Promise.all(imagePromises).then(() => {
    assetsLoaded = true;
    if (minDelayElapsed) hideLoader();
  });
});

function hideLoader() {
  const loader = document.querySelector('.loader-wrapper');
  if (loader) loader.classList.add('hidden');
  const siteWrapper = document.querySelector('.site-wrapper');
  if (siteWrapper) siteWrapper.classList.add('show');
  const sound = document.getElementById('fadeSound');
  if (sound) sound.play();
}

// Drag and Drop Code

const MIN_WINDOW_ZINDEX = 3;
const TOP_WINDOW_ZINDEX = 100;

let isDragging = false;
const DRAG_THRESHOLD = 5;

// Set all windows to minimum z-index at start
document.querySelectorAll('.window, .window.glass, .gadget-container').forEach(win => {
  win.style.zIndex = MIN_WINDOW_ZINDEX;
});

document.querySelectorAll('.window, .window.glass, .gadget-container').forEach(win => {
  let startX, startY, initialLeft, initialTop;

  win.addEventListener('mousedown', function(e) {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;

    // Reset all windows to minimum
    document.querySelectorAll('.window, .window.glass, .gadget-container').forEach(w => {
      w.style.zIndex = MIN_WINDOW_ZINDEX;
    });
    // Bring this window to the top
    win.style.zIndex = TOP_WINDOW_ZINDEX;

    e.preventDefault();
    startX = e.clientX;
    startY = e.clientY;
    initialLeft = win.offsetLeft;
    initialTop = win.offsetTop;
    isDragging = false;

    function onMouseMove(e) {
      const dx = Math.abs(e.clientX - startX);
      const dy = Math.abs(e.clientY - startY);
      if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
        isDragging = true;
      }

      let newLeft = initialLeft + (e.clientX - startX);
      let newTop = initialTop + (e.clientY - startY);

      // Clamp to desktop boundaries
      const desktop = document.querySelector('.site-wrapper') || document.body;
      const desktopRect = desktop.getBoundingClientRect();
      const windowRect = win.getBoundingClientRect();

      newLeft = Math.max(0, Math.min(desktopRect.width - windowRect.width, newLeft));
      newTop = Math.max(0, Math.min(desktopRect.height - windowRect.height, newTop));

      win.style.left = newLeft + 'px';
      win.style.top = newTop + 'px';
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      // Reset isDragging after a short delay to avoid race conditions
      setTimeout(() => { isDragging = false; }, 10);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
});

// --- NEW: Active/Inactive Window State for Windows 7 ---

let activeWindow = null;
const windows = document.querySelectorAll('.win7 .window.glass');

function setActiveWindow(windowElement) {
  windows.forEach(win => {
    win.classList.add('unactive');
    win.classList.remove('active');
  });
  windowElement.classList.remove('unactive');
  windowElement.classList.add('active');
  activeWindow = windowElement;
}

windows.forEach(windowEl => {
  windowEl.addEventListener('mousedown', (e) => {
    setActiveWindow(windowEl);
    // ... your existing drag code will handle the rest
  });
});

// Optionally, set the first window as active by default
if (windows.length > 0) {
  setActiveWindow(windows[0]);
}

// Weather Gadget Code

// Toggle flip on click (and background)
document.querySelector('.site-wrapper').addEventListener('click', function(e) {
  const gadget = e.target.closest('[data-flip="true"]');
  if (gadget && !isDragging) {
    const gadgetFlip = gadget.querySelector('.gadget-flip');
    if (gadgetFlip) {
      gadgetFlip.classList.toggle('is-flipped');
      // Toggle background
      isNight = !isNight;
      if (isNight) {
        dayLayer.style.opacity = '0';
        nightLayer.style.opacity = '1';
      } else {
        dayLayer.style.opacity = '1';
        nightLayer.style.opacity = '0';
      }
    }
  }
});


// Time update
function updateTime() {
  const timeEls = document.querySelectorAll('.time');
  let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let options = { hour: '2-digit', minute: '2-digit', timeZone: timezone };
  let time = new Date().toLocaleTimeString('en-US', options);
  // Fallback to Europe/London if timezone is not available
  if (!timezone || timezone === 'UTC') {
    time = new Date().toLocaleTimeString('en-US', { ...options, timeZone: 'Europe/London' });
  }
  timeEls.forEach(el => el.textContent = time);
}

// Update Tmeprature and City using AWS Proxy
async function updateTemperature(lat, lng) {
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


// Main update function
function updateAll(lat, lng) {
  updateTime();
  updateTemperature(lat, lng);
}

// Get user location and update everything
function initWeatherGadget() {
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

// Initialize and update time every second
initWeatherGadget();
setInterval(() => {
  updateTime();
}, 1000);

// Update Weather every 5 minutes
// Example: Update weather every 5 minutes (300,000 ms)
setInterval(() => {
  initWeatherGadget(); // Or call updateTemperature with current lat/lng
}, 300000);


