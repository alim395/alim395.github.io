let assetsLoaded = false;
let minDelayElapsed = false;
let userInteracted = false;

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

// Show the prompt when ready
function showPrompt() {
  const prompt = document.querySelector('.loader-prompt');
  if (prompt) prompt.style.display = 'block';
}

// Hide the loader and play audio
function hideLoader() {
  const loader = document.querySelector('.loader-wrapper');
  if (loader) loader.classList.add('hidden');
  const siteWrapper = document.querySelector('.site-wrapper');
  if (siteWrapper) siteWrapper.classList.add('show');
  const sound = document.getElementById('fadeSound');
  if (sound) sound.play();
}

// Called when all conditions are met
function tryStartExperience() {
  if (assetsLoaded && minDelayElapsed && userInteracted) {
    hideLoader();
  }
}

// Minimum delay
setTimeout(() => {
  minDelayElapsed = true;
  showPrompt();
  tryStartExperience();
}, 3000);

// Asset load handler
Promise.all(imagePromises)
  .then(() => {
    assetsLoaded = true;
    showPrompt();
    tryStartExperience();
  })
  .catch((err) => {
    console.error('Failed to load image:', err);
    assetsLoaded = true; // Still allow user to proceed
    showPrompt();
    tryStartExperience();
  });

const loaderWrapper = document.querySelector('.loader-wrapper');
if (loaderWrapper) {
  loaderWrapper.addEventListener('click', onUserInteract);
  loaderWrapper.addEventListener('touchstart', onUserInteract, { passive: false });
}

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
  // if (assetsLoaded) hideLoader();
}, 3000);

// Asset load handler
Promise.all(imagePromises)
  .then(() => {
    assetsLoaded = true;
    showPrompt();
    tryStartExperience();
  })
  .catch((err) => {
    console.error('Failed to load image:', err);
    assetsLoaded = true; // Still allow user to proceed
    showPrompt();
    tryStartExperience();
  });

// User interaction handler (click or touch)
function onUserInteract() {
  userInteracted = true;
  tryStartExperience();
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

  function startDrag(e) {
    // Prevent default for touch events to avoid scrolling
    if (e.type === 'touchstart') {
      e.preventDefault();
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
    } else {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
      startX = e.clientX;
      startY = e.clientY;
    }

    // Reset all windows to minimum z-index
    document.querySelectorAll('.window, .window.glass, .gadget-container').forEach(w => {
      w.style.zIndex = MIN_WINDOW_ZINDEX;
    });
    // Bring this window to the top
    win.style.zIndex = TOP_WINDOW_ZINDEX;

    initialLeft = win.offsetLeft;
    initialTop = win.offsetTop;
    isDragging = false;

    function onMove(e) {
      let clientX, clientY;
      if (e.type === 'touchmove') {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const dx = Math.abs(clientX - startX);
      const dy = Math.abs(clientY - startY);
      if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
        isDragging = true;
      }

      let newLeft = initialLeft + (clientX - startX);
      let newTop = initialTop + (clientY - startY);

      // Clamp to desktop boundaries
      const desktop = document.querySelector('.site-wrapper') || document.body;
      const desktopRect = desktop.getBoundingClientRect();
      const windowRect = win.getBoundingClientRect();

      newLeft = Math.max(0, Math.min(desktopRect.width - windowRect.width, newLeft));
      newTop = Math.max(0, Math.min(desktopRect.height - windowRect.height, newTop));

      win.style.left = newLeft + 'px';
      win.style.top = newTop + 'px';
    }

    function onEnd() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);

      setTimeout(() => { isDragging = false; }, 10);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
  }

  win.addEventListener('mousedown', startDrag);
  win.addEventListener('touchstart', startDrag, { passive: false });
});

// --- NEW: Active/Inactive Window State for Windows 7 ---

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
  function activateOnInteraction(e) {
    if (e.type === 'touchstart') e.preventDefault();
    setActiveWindow(windowEl);
  }
  windowEl.addEventListener('mousedown', activateOnInteraction);
  windowEl.addEventListener('touchstart', activateOnInteraction, { passive: false });
});

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

// Loading Animation
const frames = document.querySelectorAll('.vista-loader .frame');
const frameCount = frames.length;
let currentFrame = 0;
let isForward = true;
let holdCount = 0;
const holdFrames = 3; // Number of intervals to "hold" at frame 3 or 1

function cycleFrames() {
  // Remove active class from all frames
  frames.forEach(frame => frame.classList.remove('active'));

  // Set the current frame as active
  frames[currentFrame].classList.add('active');

  // If at the end or start, decide whether to hold or reverse
  if (isForward && currentFrame === frameCount - 1) {
    // At last frame, start holding (or reverse if hold is over)
    if (holdCount < holdFrames) {
      holdCount++;
    } else {
      holdCount = 0;
      isForward = false;
    }
  } else if (!isForward && currentFrame === 0) {
    // At first frame, start holding (or reverse if hold is over)
    if (holdCount < holdFrames) {
      holdCount++;
    } else {
      holdCount = 0;
      isForward = true;
    }
  } else {
    // Move to next frame in current direction
    currentFrame += isForward ? 1 : -1;
  }
}

// Start animation (e.g., every 400ms for a gentle cycle)
setInterval(cycleFrames, 400); // Adjust timing to match your desired speed