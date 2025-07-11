// desktopIcons.js - manage desktop icons and their actions
import { vfs, getNode, saveVFS } from './vfs.js';
import { setupDesktopContextMenu } from './desktopContextMenu.js';

// Icon data structure
const ICON_GRID_SIZE = { x: 96, y: 96 }; // 72px icon + 24px gap

function createDesktopIcon(iconData, onWeatherClick, onPuzzleClick) {
  const icon = document.createElement('div');
  icon.className = 'desktop-icon';
  // Use grid position if available
  if (iconData.pos) {
    icon.style.left = (iconData.pos[0] * ICON_GRID_SIZE.x + 24) + 'px';
    icon.style.top = (iconData.pos[1] * ICON_GRID_SIZE.y + 24) + 'px';
  }
  // Determine if icon is an image path or emoji, with folder default
  function renderIcon(iconProp, type) {
    if (!iconProp && type === 'folder') {
      // Default folder icon (emoji or image path)
      return `<div style="width:48px;height:48px;font-size:40px;display:flex;align-items:center;justify-content:center;">📁</div>`;
      // Or use an image: return `<img src='public/images/icons/folder.png' alt='' style='width:48px;height:48px;'>`;
    }
    if (typeof iconProp === 'string' && (iconProp.endsWith('.png') || iconProp.endsWith('.jpg') || iconProp.endsWith('.jpeg') || iconProp.endsWith('.gif') || iconProp.endsWith('.svg') || iconProp.startsWith('public/'))) {
      return `<img src='${iconProp}' alt='' style='width:48px;height:48px;'>`;
    } else {
      return `<div style="width:48px;height:48px;font-size:40px;display:flex;align-items:center;justify-content:center;">${iconProp}</div>`;
    }
  }
  if (iconData.type === 'folder') {
    // Use label, then name, then fallback to empty string
    const displayName = iconData.label || iconData.name || '';
    icon.innerHTML = `
      ${renderIcon(iconData.icon, iconData.type)}
      <span>${displayName}</span>
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
    const displayName = iconData.label || iconData.name || '';
    icon.innerHTML = `
      ${renderIcon(iconData.icon, iconData.type)}
      <span>${displayName}</span>
    `;
    icon.addEventListener('mousedown', (e) => {
      document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
      icon.classList.add('selected');
      e.stopPropagation();
    });
    function openAppWindow() {
      let appWin = document.getElementById(iconData.id + '-window');
      if (appWin) {
        // For Notepad app launches, always reset to clean state
        if (iconData.subtype === 'notepad') {
          const textarea = appWin.querySelector('textarea');
          const titleBar = appWin.querySelector('.title-bar-text');
          
          // Clear content and reset title
          if (textarea) textarea.value = '';
          if (titleBar) titleBar.textContent = 'Untitled - Notepad';
          
          // Clear file reference since this is a new document
          appWin._currentFile = null;
          
          // Update status bar
          const updateStatus = appWin._updateStatus;
          if (updateStatus) updateStatus();
        }
        
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
        
        // Ensure textarea starts empty when opening the app directly
        const textarea = appWin.querySelector('.field-row-stacked textarea');
        textarea.value = ''; // Explicitly set to empty
        
        // Clear any file reference since this is a new document
        appWin._currentFile = null;
        
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
        
        // Store update function for external access
        appWin._updateStatus = updateStatus;
        
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
  } else if (iconData.type === 'file') {
    const displayName = iconData.label || iconData.name || '';
    icon.innerHTML = `
      ${renderIcon(iconData.icon, iconData.type)}
      <span>${displayName}</span>
    `;
    icon.addEventListener('mousedown', (e) => {
      document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
      icon.classList.add('selected');
      e.stopPropagation();
    });
    
    function openFileInApp() {
      // Open text files in Notepad
      if (iconData.app === 'notepad' || iconData.name.toLowerCase().endsWith('.txt')) {
        openNotepadWithFile(iconData);
      }
    }
    
    icon.addEventListener('dblclick', openFileInApp);
    icon.addEventListener('touchend', function(e) {
      if (e.touches && e.touches.length > 0) return;
      e.preventDefault();
      openFileInApp();
    }, { passive: false });
  }
  return icon;
}

function openNotepadWithFile(fileData) {
  // Check if Notepad is already open
  let notepadWin = document.getElementById('notepad-app-window');
  
  if (notepadWin) {
    // If Notepad is already open, load the file content
    const textarea = notepadWin.querySelector('textarea');
    const titleBar = notepadWin.querySelector('.title-bar-text');
    
    if (textarea && titleBar) {
      textarea.value = fileData.content || '';
      titleBar.textContent = `${fileData.name} - Notepad`;
      
      // Store current file reference for saving
      notepadWin._currentFile = fileData;
      
      // Update status bar
      const updateStatus = notepadWin._updateStatus;
      if (updateStatus) updateStatus();
      
      // Bring window to front
      notepadWin.style.display = 'block';
      notepadWin.style.zIndex = 100;
    }
  } else {
    // Create new Notepad window with file content
    notepadWin = document.createElement('div');
    notepadWin.className = 'window';
    notepadWin.id = 'notepad-app-window';
    notepadWin.style.position = 'absolute';
    notepadWin.style.left = '400px';
    notepadWin.style.top = '180px';
    notepadWin.style.width = '80ch';
    notepadWin.style.height = '410px';
    notepadWin.style.zIndex = 100;
    
    notepadWin.innerHTML = `
      <div class="title-bar">
        <div class="title-bar-text">${fileData.name} - Notepad</div>
        <div class="title-bar-controls">
          <button aria-label="Close" class="folder-close"></button>
        </div>
      </div>
      <div class="window-body" style="padding:0;">
        <div class="field-row-stacked" style="width:100%;margin:0;">
          <textarea style="width:100%;box-sizing:border-box;resize: none;padding: 2px;font-family: 'Lucida Console', monospace; font-size: 13px; line-height: 14px;" rows="24">${fileData.content || ''}</textarea>
        </div>
      </div>
      <div class="status-bar">
        <p class="status-bar-field" id="notepad-ln">Ln 1</p>
        <p class="status-bar-field" id="notepad-col">Col 1</p>
        <p class="status-bar-field" id="notepad-chars">0 Characters</p>
      </div>
    `;
    
    document.body.appendChild(notepadWin);
    
    // Store current file reference for saving
    notepadWin._currentFile = fileData;
    
    // Setup status bar updates
    const textarea = notepadWin.querySelector('textarea');
    const lnField = notepadWin.querySelector('#notepad-ln');
    const colField = notepadWin.querySelector('#notepad-col');
    const charsField = notepadWin.querySelector('#notepad-chars');
    
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
    
    // Store update function for external access
    notepadWin._updateStatus = updateStatus;
    
    textarea.addEventListener('input', () => {
      updateStatus();
      // Auto-save content to VFS
      if (notepadWin._currentFile) {
        notepadWin._currentFile.content = textarea.value;
        saveVFS();
      }
    });
    textarea.addEventListener('keyup', updateStatus);
    textarea.addEventListener('click', updateStatus);
    updateStatus();
    
    // Close button handler
    notepadWin.querySelector('.folder-close').onclick = () => {
      notepadWin.style.display = 'none';
    };
    
    // Setup window dragging
    import('./windows.js').then(mod => { mod.setupWindowDragging(); });
  }
}

function setupDesktopIcons({ onWeatherClick, onPuzzleClick }, sortKey = 'name') {
  const desktop = document.querySelector('.desktop-icons');
  if (!desktop) return;
  // Clear any existing icons
  desktop.innerHTML = '';
  // Calculate grid size based on window height
  const ICON_HEIGHT = ICON_GRID_SIZE.y;
  const ICON_MARGIN = 24; // top margin
  const availableHeight = window.innerHeight - ICON_MARGIN * 2;
  const maxRows = Math.max(1, Math.floor(availableHeight / ICON_HEIGHT));
  // Render all icons from VFS root, auto-assigning grid positions in columns
  const root = vfs['/'];
  let entries = Object.entries(root.children);
  // Sort logic
  if (sortKey === 'name') {
    entries.sort(([a], [b]) => a.localeCompare(b));
  } else if (sortKey === 'type') {
    entries.sort(([, a], [, b]) => (a.type || '').localeCompare(b.type || ''));
  } else if (sortKey === 'size') {
    // Placeholder: sort by content length for files, 0 for folders
    entries.sort(([, a], [, b]) => {
      const aSize = a.type === 'file' ? (a.content ? a.content.length : 0) : 0;
      const bSize = b.type === 'file' ? (b.content ? b.content.length : 0) : 0;
      return aSize - bSize;
    });
  } else if (sortKey === 'date') {
    // Placeholder: sort by a 'modified' property if present, else leave as is
    entries.sort(([, a], [, b]) => {
      const aDate = a.modified || 0;
      const bDate = b.modified || 0;
      return aDate - bDate;
    });
  }
  let col = 0, row = 0, idx = 0;
  entries.forEach(([key, iconData]) => {
    // Assign a grid position: fill down, then wrap to next column
    iconData.pos = [col, row];
    // Use key as fallback for label/name
    if (!iconData.label && !iconData.name) iconData.label = key;
    const icon = createDesktopIcon(iconData, onWeatherClick, onPuzzleClick);
    desktop.appendChild(icon);
    row++;
    if (row >= maxRows) {
      row = 0;
      col++;
    }
    idx++;
  });
  // Deselect all icons when clicking elsewhere
  document.body.addEventListener('mousedown', (e) => {
    if (!e.target.closest('.desktop-icon')) {
      document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
    }
  });
  // Setup context menu for desktop and icons
  setupDesktopContextMenu((sortKey) => setupDesktopIcons({ onWeatherClick, onPuzzleClick }, sortKey));
}

function openFolderWindow(folderData, onWeatherClick, onPuzzleClick) {
  // If already open, bring to front
  let folderWin = document.getElementById(folderData.id ? folderData.id + '-window' : folderData.name + '-window');
  if (folderWin) {
    folderWin.style.display = 'block';
    folderWin.style.zIndex = 100;
    return;
  }
  folderWin = document.createElement('div');
  folderWin.className = 'window';
  folderWin.id = folderData.id ? folderData.id + '-window' : folderData.name + '-window';
  folderWin.style.position = 'absolute';
  folderWin.style.left = '320px';
  folderWin.style.top = '120px';
  folderWin.style.width = '320px';
  folderWin.style.zIndex = 100;
  folderWin.innerHTML = `
    <div class="title-bar">
      <div class="title-bar-text">${folderData.label || folderData.name}</div>
      <div class="title-bar-controls">
        <button aria-label="Close" class="folder-close"></button>
      </div>
    </div>
    <div class="window-body" style="min-height:160px;display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start;">
      ${folderData.children ? Object.entries(folderData.children).map(([key, item], idx) => {
        const displayName = item.label || item.name || key;
        let iconHtml = '';
        let idAttr = '';
        if (item.type === 'gadget') {
          iconHtml = `<img src='${item.icon}' alt='${displayName}'>`;
          idAttr = `id="${folderData.name}-icon-${key}"`;
        } else if (item.type === 'file' || item.type === 'app' || item.type === 'folder') {
          if (!item.icon && item.type === 'folder') {
            iconHtml = `<div style='width:48px;height:48px;font-size:40px;display:flex;align-items:center;justify-content:center;'>📁</div>`;
          } else if (item.icon && (item.icon.endsWith('.png') || item.icon.endsWith('.jpg') || item.icon.endsWith('.jpeg') || item.icon.endsWith('.gif') || item.icon.endsWith('.svg') || item.icon.startsWith('public/'))) {
            iconHtml = `<img src='${item.icon}' alt='' style='width:48px;height:48px;'>`;
          } else {
            iconHtml = `<div style='width:48px;height:48px;font-size:40px;display:flex;align-items:center;justify-content:center;'>${item.icon || ''}</div>`;
          }
        }
        return `<div class="desktop-icon" style="position:static;cursor:pointer;" ${idAttr}>
          ${iconHtml}
          <span>${displayName}</span>
        </div>`;
      }).join('') : ''}
    </div>
  `;
  document.body.appendChild(folderWin);
  // Close logic
  folderWin.querySelector('.folder-close').onclick = () => { folderWin.style.display = 'none'; };
  // Make draggable
  import('./windows.js').then(mod => { mod.setupWindowDragging(); });
  // Add icon click logic for gadgets and files
  if (folderData.children) {
    Object.entries(folderData.children).forEach(([key, item], index) => {
      let iconEl = null;
      
      if (item.type === 'gadget') {
        iconEl = folderWin.querySelector(`#${folderData.name}-icon-${key}`);
      } else {
        // For files and other items, find by position since they don't have IDs
        const allIcons = folderWin.querySelectorAll('.desktop-icon');
        iconEl = allIcons[index];
      }
      
      if (iconEl) {
        if (item.type === 'gadget') {
          const openFn = item.onOpen === 'weather' ? onWeatherClick : item.onOpen === 'puzzle' ? onPuzzleClick : null;
          if (openFn) {
            iconEl.addEventListener('dblclick', openFn);
            iconEl.addEventListener('touchend', function(e) {
              if (e.touches && e.touches.length > 0) return;
              e.preventDefault();
              openFn();
            }, { passive: false });
          }
        } else if (item.type === 'file' && (item.app === 'notepad' || item.name.toLowerCase().endsWith('.txt'))) {
          // Handle text file opening
          iconEl.addEventListener('dblclick', () => openNotepadWithFile(item));
          iconEl.addEventListener('touchend', function(e) {
            if (e.touches && e.touches.length > 0) return;
            e.preventDefault();
            openNotepadWithFile(item);
          }, { passive: false });
        }
      }
    });
  }
}
export { setupDesktopIcons };
