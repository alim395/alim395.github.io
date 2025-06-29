// main.js - entry point for ES modules
import { showPrompt, hideLoader, tryStartExperience, setUserInteracted, startLoader } from './loader.js';
import { setupWindowDragging, setupActiveWindow } from './windows.js';
import { setupBackgroundToggle } from './background.js';
import { updateTime, initWeatherGadget } from './weather.js';
import { setupGadgetFlip } from './gadget.js';
import { setupDesktopIcons } from './desktopIcons.js';
import { setupPuzzleGadget } from './puzzleGadget.js';

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
      closeBtn.onclick = (event) => {
        event.stopPropagation(); // Prevent flip when closing
        gadget.style.display = 'none';
      };
      closeBtn.ontouchend = (event) => {
        event.stopPropagation();
        event.preventDefault();
        gadget.style.display = 'none';
      };
    }
  },
  onPuzzleClick: () => {
    // Show the puzzle gadget and initialize it
    const gadget = document.querySelector('.gadget-container.puzzle');
    if (gadget) gadget.style.display = 'block';
    setupPuzzleGadget();
    // Add close button handler
    const closeBtn = gadget.querySelector('.gadget-close');
    if (closeBtn) {
      closeBtn.onclick = (event) => {
        event.stopPropagation(); // Prevent flip when closing
        gadget.style.display = 'none';
      };
      closeBtn.ontouchend = (event) => {
        event.stopPropagation();
        event.preventDefault();
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

// Ensure all windows/gadgets are in view on resize/orientation change
function keepWindowsInView() {
  const desktop = document.querySelector('.site-wrapper') || document.body;
  const desktopRect = desktop.getBoundingClientRect();
  document.querySelectorAll('.window, .window.glass, .gadget-container').forEach(win => {
    // Only reposition absolutely/fixed positioned elements
    if (win.style.display === 'none') return;
    const rect = win.getBoundingClientRect();
    let left = win.offsetLeft;
    let top = win.offsetTop;
    let changed = false;
    // Right/bottom edge
    if (left + rect.width > desktopRect.width) {
      left = Math.max(0, desktopRect.width - rect.width);
      changed = true;
    }
    if (top + rect.height > desktopRect.height) {
      top = Math.max(0, desktopRect.height - rect.height);
      changed = true;
    }
    // Left/top edge
    if (left < 0) {
      left = 0;
      changed = true;
    }
    if (top < 0) {
      top = 0;
      changed = true;
    }
    if (changed) {
      win.style.left = left + 'px';
      win.style.top = top + 'px';
    }
  });
}
window.addEventListener('resize', keepWindowsInView);
window.addEventListener('orientationchange', keepWindowsInView);
// Optionally, call once on load
keepWindowsInView();
