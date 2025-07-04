// desktopIcons.js - manage desktop icons and their actions

// Icon data structure
const ICON_GRID_SIZE = { x: 96, y: 96 }; // 72px icon + 24px gap
const desktopIconsData = [
  {
    type: 'folder',
    label: 'Gadgets',
    icon: '📁',
    pos: [0, 0], // (col, row)
    id: 'gadgets-folder',
    contents: [
      {
        type: 'gadget',
        label: 'Weather',
        icon: 'public/images/icons/weather.png',
        onOpen: 'weather',
      },
      {
        type: 'gadget',
        label: 'Puzzle',
        icon: 'public/images/icons/puzzle.png',
        onOpen: 'puzzle',
      }
    ]
  },
  {
    type: 'app',
    label: 'Notepad',
    icon: '📒',
    pos: [0, 1],
    id: 'notepad-app',
    subtype: 'notepad',
  },
  {
    type: 'app',
    label: 'Paint',
    icon: '🎨',
    pos: [0, 2],
    id: 'paint-app',
    subtype: 'paint',
  },
  {
    type: 'app',
    label: 'Music',
    icon: '🎵',
    pos: [0, 3],
    id: 'music-app',
    subtype: 'music',
  }
];

function createDesktopIcon(iconData, onWeatherClick, onPuzzleClick) {
  const icon = document.createElement('div');
  icon.className = 'desktop-icon';
  // Use grid position if available
  if (iconData.pos) {
    icon.style.left = (iconData.pos[0] * ICON_GRID_SIZE.x + 24) + 'px';
    icon.style.top = (iconData.pos[1] * ICON_GRID_SIZE.y + 24) + 'px';
  }
  if (iconData.type === 'folder') {
    icon.innerHTML = `
      <div style="width:48px;height:48px;font-size:40px;display:flex;align-items:center;justify-content:center;">${iconData.icon}</div>
      <span>${iconData.label}</span>
    `;
    icon.addEventListener('mousedown', (e) => {
      document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
      icon.classList.add('selected');
      e.stopPropagation();
    });
    icon.addEventListener('dblclick', () => openFolderWindow(iconData, onWeatherClick, onPuzzleClick));
    icon.addEventListener('touchend', function(e) {
      if (e.touches && e.touches.length > 0) return;
      e.preventDefault();
      openFolderWindow(iconData, onWeatherClick, onPuzzleClick);
    }, { passive: false });
  } else if (iconData.type === 'app') {
    icon.innerHTML = `
      <div style="width:48px;height:48px;font-size:40px;display:flex;align-items:center;justify-content:center;">${iconData.icon}</div>
      <span>${iconData.label}</span>
    `;
    icon.addEventListener('mousedown', (e) => {
      document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
      icon.classList.add('selected');
      e.stopPropagation();
    });
    function openAppWindow() {
      let appWin = document.getElementById(iconData.id + '-window');
      if (appWin) {
        appWin.style.display = 'block';
        appWin.style.zIndex = 100;
        return;
      }
      appWin = document.createElement('div');
      appWin.className = 'window';
      appWin.id = iconData.id + '-window';
      appWin.style.position = 'absolute';
      appWin.style.left = '400px';
      appWin.style.top = '180px';
      appWin.style.width = iconData.subtype === 'notepad' ? '400px' : '300px';
      appWin.style.height = iconData.subtype === 'notepad' ? '350px' : '';
      appWin.style.zIndex = 100;
      if (iconData.subtype === 'notepad') {
        appWin.innerHTML = `
          <div class="title-bar">
            <div class="title-bar-text">Untitled - Notepad</div>
            <div class="title-bar-controls">
              <button aria-label="Close" class="folder-close"></button>
            </div>
          </div>
          <div class="window-body" style="padding:0;">
            <div class="field-row-stacked" style="width:100%;margin:0;">
              <textarea style="width:100%;box-sizing:border-box;resize: none;padding: 2px;font-family: 'Lucida Console', monospace; font-size: 13px; line-height: 14px;" rows="24"></textarea>
            </div>
          </div>
          <div class="status-bar">
            <p class="status-bar-field" id="notepad-ln">Ln 1</p>
            <p class="status-bar-field" id="notepad-col">Col 1</p>
            <p class="status-bar-field" id="notepad-chars">0 Characters</p>
          </div>
        `;
        appWin.style.width = 'ch'.repeat ? '80ch' : '640px';
        appWin.style.width = '80ch';
        appWin.style.height = '410px';
        // Status bar update logic
        const textarea = appWin.querySelector('.field-row-stacked textarea');
        const lnField = appWin.querySelector('#notepad-ln');
        const colField = appWin.querySelector('#notepad-col');
        const charsField = appWin.querySelector('#notepad-chars');
        function updateStatus() {
          const value = textarea.value;
          const chars = value.length;
          const selStart = textarea.selectionStart;
          const lines = value.substr(0, selStart).split("\n");
          const line = lines.length;
          const col = lines[lines.length - 1].length + 1;
          lnField.textContent = `Ln ${line}`;
          colField.textContent = `Col ${col}`;
          charsField.textContent = `${chars} Character${chars === 1 ? '' : 's'}`;
        }
        textarea.addEventListener('input', updateStatus);
        textarea.addEventListener('keyup', updateStatus);
        textarea.addEventListener('click', updateStatus);
        updateStatus();
      } else {
        appWin.innerHTML = `
          <div class="title-bar">
            <div class="title-bar-text">${iconData.label}</div>
            <div class="title-bar-controls">
              <button aria-label="Close" class="folder-close"></button>
            </div>
          </div>
          <div class="window-body" style="min-height:100px;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <p style='margin:32px 0 24px 0;text-align:center;'>This feature has not been implemented yet.</p>
            <button class="placeholder-ok" style="margin-top:16px;align-self:center;">OK</button>
          </div>
        `;
      }
      document.body.appendChild(appWin);
      appWin.querySelector('.folder-close').onclick = () => { appWin.style.display = 'none'; };
      if (iconData.subtype !== 'notepad') {
        appWin.querySelector('.placeholder-ok').onclick = () => { appWin.style.display = 'none'; };
      }
      import('./windows.js').then(mod => { mod.setupWindowDragging(); });
    }
    icon.addEventListener('dblclick', openAppWindow);
    icon.addEventListener('touchend', function(e) {
      if (e.touches && e.touches.length > 0) return;
      e.preventDefault();
      openAppWindow();
    }, { passive: false });
  }
  return icon;
}

function openFolderWindow(folderData, onWeatherClick, onPuzzleClick) {
  // If already open, bring to front
  let folderWin = document.getElementById(folderData.id + '-window');
  if (folderWin) {
    folderWin.style.display = 'block';
    folderWin.style.zIndex = 100;
    return;
  }
  folderWin = document.createElement('div');
  folderWin.className = 'window';
  folderWin.id = folderData.id + '-window';
  folderWin.style.position = 'absolute';
  folderWin.style.left = '320px';
  folderWin.style.top = '120px';
  folderWin.style.width = '320px';
  folderWin.style.zIndex = 100;
  folderWin.innerHTML = `
    <div class="title-bar">
      <div class="title-bar-text">${folderData.label}</div>
      <div class="title-bar-controls">
        <button aria-label="Close" class="folder-close"></button>
      </div>
    </div>
    <div class="window-body" style="min-height:160px;display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start;">
      ${folderData.contents.map((item, idx) => {
        if (item.type === 'gadget') {
          return `<div class="desktop-icon" style="position:static;cursor:pointer;" id="${folderData.id}-icon-${idx}">
            <img src='${item.icon}' alt='${item.label}'>
            <span>${item.label}</span>
          </div>`;
        } else if (item.type === 'file') {
          return `<div class="desktop-icon" style="position:static;">
            <div style='width:48px;height:48px;font-size:40px;display:flex;align-items:center;justify-content:center;'>${item.icon}</div>
            <span>${item.label}</span>
          </div>`;
        }
        return '';
      }).join('')}
    </div>
  `;
  document.body.appendChild(folderWin);
  // Close logic
  folderWin.querySelector('.folder-close').onclick = () => { folderWin.style.display = 'none'; };
  // Make draggable
  import('./windows.js').then(mod => { mod.setupWindowDragging(); });
  // Add gadget icon click logic
  folderData.contents.forEach((item, idx) => {
    if (item.type === 'gadget') {
      const iconEl = folderWin.querySelector(`#${folderData.id}-icon-${idx}`);
      if (iconEl) {
        const openFn = item.onOpen === 'weather' ? onWeatherClick : item.onOpen === 'puzzle' ? onPuzzleClick : null;
        if (openFn) {
          iconEl.addEventListener('dblclick', openFn);
          iconEl.addEventListener('touchend', function(e) {
            if (e.touches && e.touches.length > 0) return;
            e.preventDefault();
            openFn();
          }, { passive: false });
        }
      }
    }
  });
}

export function setupDesktopIcons({ onWeatherClick, onPuzzleClick }) {
  const desktop = document.querySelector('.desktop-icons');
  if (!desktop) return;
  // Clear any existing icons
  desktop.innerHTML = '';
  // Render all icons from data
  desktopIconsData.forEach(iconData => {
    const icon = createDesktopIcon(iconData, onWeatherClick, onPuzzleClick);
    desktop.appendChild(icon);
  });
  // Deselect all icons when clicking elsewhere
  document.body.addEventListener('mousedown', (e) => {
    if (!e.target.closest('.desktop-icon')) {
      document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
    }
  });
}
