// gadget.js - gadget flip logic as ES module
import { getIsDragging } from './windows.js';
import { getIsNight, setBackgroundNightMode } from './background.js';

export function setupGadgetFlip() {
  function handleFlip(e) {
    // Prevent flip if clicking/tapping the close button
    if (e.target.closest('.gadget-close')) return;
    // Only respond to left click or touch
    if (e.type === 'click' && e.button !== 0) return;
    const gadget = e.target.closest('[data-flip="true"]');
    if (gadget && !getIsDragging()) {
      const gadgetFlip = gadget.querySelector('.gadget-flip');
      if (gadgetFlip) {
        gadgetFlip.classList.toggle('is-flipped');
        // Toggle background
        setBackgroundNightMode(!getIsNight());
      }
    }
  }
  document.querySelector('.site-wrapper').addEventListener('click', handleFlip);
  document.querySelector('.site-wrapper').addEventListener('touchend', function(e) {
    // Only trigger on direct tap, not drag
    handleFlip(e);
  }, { passive: false });
}
