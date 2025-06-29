// main.js - entry point for ES modules
import { showPrompt, hideLoader, tryStartExperience, setUserInteracted, startLoader } from './loader.js';
import { setupWindowDragging, setupActiveWindow } from './windows.js';
import { setupBackgroundToggle } from './background.js';
import { updateTime, initWeatherGadget } from './weather.js';
import { setupGadgetFlip } from './gadget.js';
import { setupDesktopIcons } from './desktopIcons.js';

// Loader logic
startLoader();

const loaderWrapper = document.querySelector('.loader-wrapper');
if (loaderWrapper) {
  loaderWrapper.addEventListener('click', setUserInteracted);
  loaderWrapper.addEventListener('touchstart', setUserInteracted, { passive: false });
}

// Windows logic
setupWindowDragging();
setupActiveWindow();

// Background toggle logic
setupBackgroundToggle();

// Gadget flip logic
setupGadgetFlip();

// Desktop icons setup
setupDesktopIcons({
  onWeatherClick: () => {
    // Show the weather gadget and initialize it
    const gadget = document.querySelector('.gadget-container.weather');
    if (gadget) gadget.style.display = 'block';
    initWeatherGadget();
    // Add close button handler
    const closeBtn = gadget.querySelector('.gadget-close');
    if (closeBtn) {
      closeBtn.onclick = () => {
        gadget.style.display = 'none';
      };
    }
  }
});

// Weather/time logic
//initWeatherGadget();
setInterval(() => {
  updateTime();
}, 1000);
