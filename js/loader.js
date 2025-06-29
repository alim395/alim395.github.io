// Loader logic and asset preloading for ES Modules

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

// Ensure loader prompt is hidden on script load
document.addEventListener('DOMContentLoaded', () => {
  const prompt = document.querySelector('.loader-prompt');
  if (prompt) prompt.style.display = 'none';
});

export function showPrompt() {
  const prompt = document.querySelector('.loader-prompt');
  if (prompt) {
    console.log('showPrompt called');
    prompt.style.display = 'block';
  }
}

export function hideLoader() {
  const loader = document.querySelector('.loader-wrapper');
  if (loader) loader.classList.add('hidden');
  const siteWrapper = document.querySelector('.site-wrapper');
  if (siteWrapper) siteWrapper.classList.add('show');
  const sound = document.getElementById('fadeSound');
  if (sound) sound.play();
}

export function tryStartExperience() {
  if (assetsLoaded && minDelayElapsed && userInteracted) {
    hideLoader();
  } else if (assetsLoaded && minDelayElapsed && !userInteracted) {
    showPrompt();
  }
}

export function setUserInteracted() {
  userInteracted = true;
  tryStartExperience();
}

export function startLoader() {
  setTimeout(() => {
    minDelayElapsed = true;
    tryStartExperience();
  }, 3000);

  Promise.all(imagePromises)
    .then(() => {
      assetsLoaded = true;
      tryStartExperience();
    })
    .catch((err) => {
      console.error('Failed to load image:', err);
      assetsLoaded = true; // Still allow user to proceed
      tryStartExperience();
    });

  // Start loading animation
  const frames = document.querySelectorAll('.vista-loader .frame');
  const frameCount = frames.length;
  let currentFrame = 0;
  let isForward = true;
  let holdCount = 0;
  const holdFrames = 3; // Number of intervals to "hold" at frame 3 or 1

  function cycleFrames() {
    frames.forEach(frame => frame.classList.remove('active'));
    if (frames[currentFrame]) frames[currentFrame].classList.add('active');
    if (isForward && currentFrame === frameCount - 1) {
      if (holdCount < holdFrames) {
        holdCount++;
      } else {
        holdCount = 0;
        isForward = false;
      }
    } else if (!isForward && currentFrame === 0) {
      if (holdCount < holdFrames) {
        holdCount++;
      } else {
        holdCount = 0;
        isForward = true;
      }
    } else {
      currentFrame += isForward ? 1 : -1;
    }
  }
  setInterval(cycleFrames, 400);
}
