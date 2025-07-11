// desktopContextMenu.js - Handles right-click context menu for desktop and icons
import { vfs, createFolder, createFile, deleteNode, saveVFS, getNode, loadVFS } from './vfs.js';

let menuEl = null;

// Protected system apps that cannot be deleted or renamed
const PROTECTED_ITEMS = ['Notepad', 'Paint', 'Music', 'Gadgets'];

// Helper function to check if an item is protected
function isProtectedItem(itemName) {
  return PROTECTED_ITEMS.includes(itemName);
}

// Helper function to get item type from VFS
function getItemType(itemName) {
  const node = getNode('/' + itemName);
  return node ? node.type : null;
}

// Helper function to reset VFS to default state
function resetDesktop() {
  if (confirm('This will reset the desktop to its default state and remove all user-created files and folders. Are you sure?')) {
    // Clear localStorage and reload default VFS
    localStorage.removeItem('webdesktop-vfs');
    loadVFS();
    // Refresh the desktop
    if (menuEl && menuEl._targetData && menuEl._targetData.refresh) {
      menuEl._targetData.refresh();
    }
  }
}

function createMenu(items, x, y) {
  console.log('createMenu called with items:', items, 'position:', x, y);
  if (menuEl) menuEl.remove();
  menuEl = document.createElement('div');
  menuEl.className = 'win7';
  menuEl.style.position = 'fixed';
  menuEl.style.left = x + 'px';
  menuEl.style.top = y + 'px';
  menuEl.style.pointerEvents = 'auto'; // Allow interaction with context menu
  menuEl.style.backgroundColor = 'white'; // Add visible background for debugging
  menuEl.style.border = '1px solid #ccc'; // Add border for debugging
  menuEl.style.zIndex = '9999'; // Ensure it's on top
  // Build 7.css menu markup
  const ul = document.createElement('ul');
  ul.setAttribute('role', 'menu');
  ul.className = 'can-hover';
  ul.style.width = '200px';
  items.forEach(item => {
    const li = document.createElement('li');
    li.setAttribute('role', 'menuitem');
    if (item.tabIndex !== undefined) li.tabIndex = item.tabIndex;
    if (item.ariaHasPopup) li.setAttribute('aria-haspopup', 'true');
    if (item.ariaDisabled) li.setAttribute('aria-disabled', 'true');
    if (item.hasDivider) li.classList.add('has-divider');
    if (item.icon) {
      const img = document.createElement('img');
      img.src = item.icon;
      img.style.marginRight = '6px';
      li.appendChild(img);
    }
    if (item.submenu) {
      li.innerHTML += item.label;
      const subUl = document.createElement('ul');
      subUl.setAttribute('role', 'menu');
      item.submenu.forEach(subitem => {
        const subLi = document.createElement('li');
        subLi.setAttribute('role', 'menuitem');
        if (subitem.type === 'radio' || subitem.type === 'checkbox') {
          const input = document.createElement('input');
          input.type = subitem.type;
          if (subitem.name) input.name = subitem.name;
          if (subitem.checked) input.checked = true;
          input.id = 'menu-' + subitem.action;
          const label = document.createElement('label');
          label.htmlFor = input.id;
          label.textContent = subitem.label;
          subLi.appendChild(input);
          subLi.appendChild(label);
        } else if (subitem.hasDivider) {
          subLi.classList.add('has-divider');
        } else {
          const a = document.createElement('a');
          a.textContent = subitem.label;
          a.style.cursor = 'pointer';
          a.style.textDecoration = 'none';
          a.style.color = 'inherit';
          subLi.appendChild(a);
        }
        subLi.dataset.action = subitem.action;
        subUl.appendChild(subLi);
      });
      li.appendChild(subUl);
    } else {
      const a = document.createElement('a');
      a.textContent = item.label;
      a.style.cursor = 'pointer';
      a.style.textDecoration = 'none';
      a.style.color = 'inherit';
      li.appendChild(a);
    }
    li.dataset.action = item.action;
    ul.appendChild(li);
  });
  menuEl.appendChild(ul);
  document.body.appendChild(menuEl);
  // Add outside click handler to close menu
  const handleOutsideClick = (e) => {
    // Don't close if clicking inside the menu
    if (menuEl && !menuEl.contains(e.target)) {
      closeMenu();
      document.removeEventListener('mousedown', handleOutsideClick);
    }
  };
  
  setTimeout(() => {
    document.addEventListener('mousedown', handleOutsideClick);
  }, 0);
  ul.addEventListener('click', (e) => {
    console.log('Menu item clicked:', e.target, 'Event type:', e.type);
    
    // Prevent default behavior for anchor tags
    if (e.target.tagName === 'A') {
      e.preventDefault();
    }
    
    // Find the closest li element with role="menuitem"
    let li = e.target.closest('li[role="menuitem"]');
    if (!li || li.getAttribute('aria-disabled') === 'true') {
      console.log('No valid menu item found or item disabled');
      return;
    }
    
    // Stop event propagation to prevent any interference
    e.stopPropagation();
    
    const action = li.dataset.action;
    console.log('Menu action:', action, 'Available handlers:', Object.keys(itemHandlers));
    
    if (action && itemHandlers[action]) {
      console.log('Executing action:', action);
      try {
        itemHandlers[action](menuEl._targetData, action);
        closeMenu();
      } catch (error) {
        console.error('Error executing action:', action, error);
      }
    } else {
      console.log('No handler found for action:', action);
    }
  });
}

function closeMenu() {
  if (menuEl) {
    menuEl.remove();
    // Remove any remaining event listeners
    const handlers = document.querySelectorAll('[data-outside-click-handler]');
    handlers.forEach(handler => {
      document.removeEventListener('mousedown', handler);
    });
  }
  menuEl = null;
}

// Function to open the Gadgets folder window
function openGadgetsFolder(gadgetsNode) {
  // Check if Gadgets folder window is already open
  let gadgetsWin = document.getElementById('Gadgets-window');
  if (gadgetsWin) {
    gadgetsWin.style.display = 'block';
    gadgetsWin.style.zIndex = 100;
    return;
  }

  // Create new Gadgets folder window
  gadgetsWin = document.createElement('div');
  gadgetsWin.className = 'window';
  gadgetsWin.id = 'Gadgets-window';
  gadgetsWin.style.position = 'absolute';
  gadgetsWin.style.left = '320px';
  gadgetsWin.style.top = '120px';
  gadgetsWin.style.width = '320px';
  gadgetsWin.style.zIndex = 100;
  
  gadgetsWin.innerHTML = `
    <div class="title-bar">
      <div class="title-bar-text">Gadgets</div>
      <div class="title-bar-controls">
        <button aria-label="Close" class="folder-close"></button>
      </div>
    </div>
    <div class="window-body" style="min-height:160px;display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start;">
      ${gadgetsNode.children ? Object.entries(gadgetsNode.children).map(([key, item]) => {
        const displayName = item.label || item.name || key;
        let iconHtml = '';
        if (item.type === 'gadget' && item.icon) {
          iconHtml = `<img src='${item.icon}' alt='${displayName}' style='width:48px;height:48px;'>`;
        } else {
          iconHtml = `<div style='width:48px;height:48px;font-size:40px;display:flex;align-items:center;justify-content:center;'>🔧</div>`;
        }
        return `<div class="desktop-icon gadget-icon" style="position:static;cursor:pointer;" data-gadget="${item.onOpen}" data-key="${key}">
          ${iconHtml}
          <span>${displayName}</span>
        </div>`;
      }).join('') : ''}
    </div>
  `;
  
  document.body.appendChild(gadgetsWin);
  
  // Close button handler
  gadgetsWin.querySelector('.folder-close').onclick = () => {
    gadgetsWin.style.display = 'none';
  };
  
  // Add click handlers for gadget icons
  gadgetsWin.querySelectorAll('.gadget-icon').forEach(iconEl => {
    const gadgetType = iconEl.dataset.gadget;
    const gadgetKey = iconEl.dataset.key;
    
    function openGadget() {
      if (gadgetType === 'weather') {
        // Show the weather gadget and initialize it (same as main.js)
        const gadget = document.querySelector('.gadget-container.weather');
        if (gadget) {
          gadget.style.display = 'block';
          import('./weather.js').then(mod => {
            mod.initWeatherGadget();
          });
          // Add close button handler
          const closeBtn = gadget.querySelector('.gadget-close');
          if (closeBtn) {
            closeBtn.onclick = (event) => {
              event.stopPropagation();
              gadget.style.display = 'none';
            };
            closeBtn.ontouchend = (event) => {
              event.stopPropagation();
              event.preventDefault();
              gadget.style.display = 'none';
            };
          }
        }
      } else if (gadgetType === 'puzzle') {
        // Show the puzzle gadget and initialize it (same as main.js)
        const gadget = document.querySelector('.gadget-container.puzzle');
        if (gadget) {
          gadget.style.display = 'block';
          import('./puzzleGadget.js').then(mod => {
            mod.setupPuzzleGadget();
          });
          // Add close button handler
          const closeBtn = gadget.querySelector('.gadget-close');
          if (closeBtn) {
            closeBtn.onclick = (event) => {
              event.stopPropagation();
              gadget.style.display = 'none';
            };
            closeBtn.ontouchend = (event) => {
              event.stopPropagation();
              event.preventDefault();
              gadget.style.display = 'none';
            };
          }
        }
      }
    }
    
    iconEl.addEventListener('dblclick', openGadget);
    iconEl.addEventListener('touchend', function(e) {
      if (e.touches && e.touches.length > 0) return;
      e.preventDefault();
      openGadget();
    }, { passive: false });
  });
  
  // Make window draggable
  import('./windows.js').then(mod => {
    mod.setupWindowDragging();
  });
}

const itemHandlers = {
  'new-folder': (targetData) => {
    const name = prompt('Folder name:');
    if (name) {
      createFolder(targetData.path, name);
      targetData.refresh();
    }
  },
  'new-file': (targetData) => {
    const name = prompt('File name:');
    if (name) {
      // Ensure .txt extension for text files
      const fileName = name.endsWith('.txt') ? name : name + '.txt';
      createFile(targetData.path, fileName, 'notepad', '');
      targetData.refresh();
    }
  },
  'delete': (targetData) => {
    // Check if item is protected
    if (targetData.isProtected) {
      alert('This system item cannot be deleted.');
      return;
    }
    if (confirm('Delete this item?')) {
      deleteNode(targetData.itemPath);
      targetData.refresh();
    }
  },
  'rename': (targetData) => {
    // Check if item is protected
    if (targetData.isProtected) {
      alert('This system item cannot be renamed.');
      return;
    }
    const newName = prompt('New name:', targetData.itemName);
    if (newName && newName !== targetData.itemName) {
      // Rename logic: remove old, add new with same data
      const parent = vfs['/']; // Only desktop for now
      const node = parent.children[targetData.itemName];
      if (node) {
        node.name = newName;
        parent.children[newName] = node;
        delete parent.children[targetData.itemName];
        saveVFS();
        targetData.refresh();
      }
    }
  },
  'open': (targetData) => {
    // Find the icon by searching through all desktop icons
    const icons = document.querySelectorAll('.desktop-icon');
    for (const icon of icons) {
      const span = icon.querySelector('span');
      if (span && span.textContent === targetData.itemName) {
        icon.dispatchEvent(new Event('dblclick'));
        break;
      }
    }
  },
  'properties': (targetData) => {
    alert('Properties dialog is not implemented yet.');
  },
  'refresh': (targetData) => { targetData.refresh(); },
  'sort-name': (targetData) => { targetData.refresh('name'); },
  'sort-type': (targetData) => { targetData.refresh('type'); },
  'sort-date': (targetData) => { targetData.refresh('date'); },
  'gadgets': (targetData) => {
    // Open the Gadgets folder from VFS
    const gadgetsNode = getNode('/Gadgets');
    if (gadgetsNode) {
      openGadgetsFolder(gadgetsNode);
    }
  },
  'reset-desktop': (targetData) => {
    resetDesktop();
  }
};

export function setupDesktopContextMenu(refresh) {
  const desktop = document.querySelector('.desktop-icons');
  console.log('Setting up desktop context menu, desktop element:', desktop);
  
  desktop.addEventListener('contextmenu', (e) => {
    console.log('Context menu event triggered on desktop, target:', e.target, 'desktop:', desktop);
    e.preventDefault();
    // Right-click on empty desktop
    if (e.target === desktop) {
      console.log('Creating desktop context menu');
      createMenu([
        { label: 'View', action: 'view', tabIndex: 0, ariaHasPopup: true, ariaDisabled: true, 
          // submenu: [
          // { label: 'Large icons', action: 'view-large', type: 'radio', name: 'icon-size' },
          // { label: 'Medium icons', action: 'view-medium', type: 'radio', name: 'icon-size', checked: true },
          // { label: 'Small icons', action: 'view-small', type: 'radio', name: 'icon-size' },
          // { label: '', hasDivider: true },
          // { label: 'Auto arrange icons', action: 'view-autoarrange', type: 'checkbox', checked: false },
          // { label: 'Align icons to grid', action: 'view-aligntogrid', type: 'checkbox', checked: true },
          // ] 
        },
        { label: 'Sort by', ariaHasPopup: true, tabIndex: 0, submenu: [
          { label: 'Name', action: 'sort-name' },
          { label: 'Item type', action: 'sort-type' },
          { label: 'Date modified', action: 'sort-date' },
        ] },
        { label: 'New', ariaHasPopup: true, tabIndex: 0, submenu: [
          { label: 'Folder', action: 'new-folder' },
          { label: 'Text Document', action: 'new-file' },
        ] },
        { label: 'Refresh', action: 'refresh', hasDivider: true },
        { label: 'Gadgets', action: 'gadgets', icon: 'https://img.icons8.com/color/18/000000/virtual-machine2.png' },
        { label: 'Reset Desktop', action: 'reset-desktop' },
      ], e.clientX, e.clientY);
      menuEl._targetData = { path: '/', refresh };
    }
  });
  // Right-click on icon
  desktop.addEventListener('contextmenu', (e) => {
    const icon = e.target.closest('.desktop-icon');
    if (icon) {
      console.log('Creating icon context menu for:', icon);
      e.preventDefault();
      const name = icon.querySelector('span').textContent;
      const itemType = getItemType(name);
      const isProtected = isProtectedItem(name);
      
      // Create dynamic menu based on item type and protection status
      const menuItems = [];
      
      if (itemType === 'app') {
        // For apps, show Open option first
        menuItems.push({ label: 'Open', action: 'open' });
      }
      
      // Add rename option (disabled for protected items)
      menuItems.push({
        label: 'Rename',
        action: 'rename',
        ariaDisabled: isProtected
      });
      
      // Add delete option (disabled for protected items)
      menuItems.push({
        label: 'Delete',
        action: 'delete',
        ariaDisabled: isProtected
      });
      
      // Add properties option for all items
      menuItems.push({
        label: 'Properties',
        action: 'properties',
        ariaDisabled: true // Not implemented yet
      });
      
      createMenu(menuItems, e.clientX, e.clientY);
      menuEl._targetData = { itemName: name, itemPath: '/' + name, path: '/', refresh, itemType, isProtected };
    }
  });
}
