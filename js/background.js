// background.js - background switching logic as ES module

let isNight = false;

export function setupBackgroundToggle() {
  const dayLayer = document.querySelector('.bg-layer.day');
  const nightLayer = document.querySelector('.bg-layer.night');
  const toggleBtn = document.getElementById('toggleImageBtn');
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
}

export function setBackgroundNightMode(night) {
  const dayLayer = document.querySelector('.bg-layer.day');
  const nightLayer = document.querySelector('.bg-layer.night');
  isNight = night;
  if (dayLayer && nightLayer) {
    if (isNight) {
      dayLayer.style.opacity = '0';
      nightLayer.style.opacity = '1';
    } else {
      dayLayer.style.opacity = '1';
      nightLayer.style.opacity = '0';
    }
  }
}

export function toggleBackground() {
  setBackgroundNightMode(!isNight);
}

export function getIsNight() {
  return isNight;
}
