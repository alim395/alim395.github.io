// desktopIcons.js - manage desktop icons and their actions

export function setupDesktopIcons({ onWeatherClick, onPuzzleClick }) {
  const desktop = document.querySelector('.desktop-icons');
  if (!desktop) return;

  // Weather icon (grid position 0,0)
  const icon = document.createElement('div');
  icon.className = 'desktop-icon';
  icon.style.left = '24px';
  icon.style.top = '24px';
  icon.innerHTML = `
    <img src="public/images/icons/weather.png" alt="Weather">
    <span>Weather</span>
  `;

  // Selection feedback
  icon.addEventListener('mousedown', (e) => {
    document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
    icon.classList.add('selected');
    e.stopPropagation(); // Prevent body click from immediately removing selection
  });

  // Double click for desktop
  icon.addEventListener('dblclick', onWeatherClick);
  // Single tap for touch devices
  icon.addEventListener('touchend', function(e) {
    // Only trigger if it's a tap, not a drag
    if (e.touches && e.touches.length > 0) return;
    e.preventDefault();
    onWeatherClick();
  }, { passive: false });
  desktop.appendChild(icon);

  // Puzzle icon (grid position 1,0)
  if (typeof onPuzzleClick === 'function') {
    const puzzleIcon = document.createElement('div');
    puzzleIcon.className = 'desktop-icon';
    puzzleIcon.style.left = '24px';
    puzzleIcon.style.top = '100px';
    puzzleIcon.innerHTML = `
      <img src="public/images/icons/puzzle.png" alt="Puzzle">
      <span>Puzzle</span>
    `;
    puzzleIcon.addEventListener('mousedown', (e) => {
      document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
      puzzleIcon.classList.add('selected');
      e.stopPropagation();
    });
    puzzleIcon.addEventListener('dblclick', onPuzzleClick);
    puzzleIcon.addEventListener('touchend', function(e) {
      if (e.touches && e.touches.length > 0) return;
      e.preventDefault();
      onPuzzleClick();
    }, { passive: false });
    desktop.appendChild(puzzleIcon);
  }

  // Deselect all icons when clicking elsewhere
  document.body.addEventListener('mousedown', (e) => {
    if (!e.target.closest('.desktop-icon')) {
      document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
    }
  });

  // Future: Add more icons here using a data structure
}
