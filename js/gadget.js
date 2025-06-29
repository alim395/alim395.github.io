// gadget.js - gadget flip logic as ES module
import { getIsDragging } from './windows.js';
import { getIsNight, setBackgroundNightMode } from './background.js';

export function setupGadgetFlip() {
  document.querySelector('.site-wrapper').addEventListener('click', function(e) {
    const gadget = e.target.closest('[data-flip="true"]');
    if (gadget && !getIsDragging()) {
      const gadgetFlip = gadget.querySelector('.gadget-flip');
      if (gadgetFlip) {
        gadgetFlip.classList.toggle('is-flipped');
        // Toggle background
        setBackgroundNightMode(!getIsNight());
      }
    }
  });
}
