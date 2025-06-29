// desktopIcons.js - manage desktop icons and their actions

export function setupDesktopIcons({ onWeatherClick }) {
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

  // Single click to open gadget
  icon.addEventListener('click', onWeatherClick);
  desktop.appendChild(icon);

  // Deselect all icons when clicking elsewhere
  document.body.addEventListener('mousedown', (e) => {
    if (!e.target.closest('.desktop-icon')) {
      document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
    }
  });

  // Future: Add more icons here using a data structure
}
