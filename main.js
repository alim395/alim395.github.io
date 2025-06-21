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