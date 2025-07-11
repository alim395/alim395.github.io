// vfs.js - Virtual File System core module

// Default VFS structure (can be migrated from desktopIconsData later)
const DEFAULT_VFS = {
  '/': {
    type: 'folder',
    name: '/',
    children: {
      'Gadgets': {
        type: 'folder',
        name: 'Gadgets',
        children: {
          'Weather': {
            type: 'gadget',
            name: 'Weather',
            icon: 'public/images/icons/weather.png',
            onOpen: 'weather',
          },
          'Puzzle': {
            type: 'gadget',
            name: 'Puzzle',
            icon: 'public/images/icons/puzzle.png',
            onOpen: 'puzzle',
          }
        }
      },
      'Notepad': {
        type: 'app',
        name: 'Notepad',
        icon: 'public/images/icons/notepad.png',
        subtype: 'notepad',
        id: 'notepad-app',
      },
      'README.txt': {
        type: 'file',
        name: 'README.txt',
        icon: 'public/images/icons/textfile.svg',
        app: 'notepad',
        content: 'Welcome to the Desktop Environment!\n\nThis is a sample text file that demonstrates the text file functionality.\n\nFeatures:\n- Create text files via context menu\n- Open text files in Notepad\n- Edit and save content\n- Proper file icons\n\nDouble-click this file to open it in Notepad!'
      },
      'Notes.txt': {
        type: 'file',
        name: 'Notes.txt',
        icon: 'public/images/icons/textfile.svg',
        app: 'notepad',
        content: 'My Personal Notes\n================\n\n- Remember to test the text file functionality\n- Check that files save properly\n- Verify icons display correctly\n- Test double-click to open\n\nThis file should open in Notepad when double-clicked.'
      },
      'Paint': {
        type: 'app',
        name: 'Paint',
        icon: '🎨',
        subtype: 'paint',
        id: 'paint-app',
      },
      'Music': {
        type: 'app',
        name: 'Music',
        icon: '🎵',
        subtype: 'music',
        id: 'music-app',
      },
      // --- TEMPORARY TEST FOLDERS FOR GRID LOGIC ---
      'Test1': {
        type: 'folder',
        name: 'Test1',
        children: {}
      },
      'Test2': {
        type: 'folder',
        name: 'Test2',
        children: {}
      },
      'Test3': {
        type: 'folder',
        name: 'Test3',
        children: {}
      },
    }
  }
};

let vfs = null;

// --- Persistence ---
const VFS_KEY = 'webdesktop-vfs';

export function saveVFS() {
  localStorage.setItem(VFS_KEY, JSON.stringify(vfs));
}

export function loadVFS() {
  const raw = localStorage.getItem(VFS_KEY);
  if (raw) {
    try {
      vfs = JSON.parse(raw);
    } catch (e) {
      vfs = JSON.parse(JSON.stringify(DEFAULT_VFS));
    }
  } else {
    vfs = JSON.parse(JSON.stringify(DEFAULT_VFS));
  }
  return vfs;
}

// --- Helper: Path Navigation ---
function splitPath(path) {
  return path.split('/').filter(Boolean);
}

export function getNode(path) {
  // e.g. '/Gadgets/Weather'
  let node = vfs['/'];
  if (path === '/' || !path) return node;
  const parts = splitPath(path);
  for (const part of parts) {
    if (!node.children || !node.children[part]) return null;
    node = node.children[part];
  }
  return node;
}

export function createFolder(parentPath, name) {
  const parent = getNode(parentPath);
  if (!parent || parent.type !== 'folder') return false;
  if (parent.children[name]) return false;
  parent.children[name] = { type: 'folder', name, children: {} };
  saveVFS();
  return true;
}

export function createFile(parentPath, name, app = '', content = '') {
  const parent = getNode(parentPath);
  if (!parent || parent.type !== 'folder') return false;
  if (parent.children[name]) return false;
  
  // Determine file type and icon based on extension
  let fileType = 'file';
  let icon = 'public/images/icons/textfile.svg';
  
  if (name.toLowerCase().endsWith('.txt')) {
    fileType = 'file';
    icon = 'public/images/icons/textfile.svg';
    app = app || 'notepad';
  }
  
  parent.children[name] = {
    type: fileType,
    name,
    content,
    app,
    icon
  };
  saveVFS();
  return true;
}

export function deleteNode(path) {
  if (path === '/' || !path) return false;
  const parts = splitPath(path);
  const name = parts.pop();
  const parent = getNode('/' + parts.join('/'));
  if (!parent || !parent.children || !parent.children[name]) return false;
  delete parent.children[name];
  saveVFS();
  return true;
}

export function moveNode(srcPath, destPath) {
  if (srcPath === '/' || !srcPath) return false;
  const parts = splitPath(srcPath);
  const name = parts.pop();
  const parent = getNode('/' + parts.join('/'));
  const dest = getNode(destPath);
  if (!parent || !parent.children || !parent.children[name] || !dest || dest.type !== 'folder') return false;
  if (dest.children[name]) return false;
  dest.children[name] = parent.children[name];
  delete parent.children[name];
  saveVFS();
  return true;
}

// --- Initialization ---
loadVFS();

export { vfs };
