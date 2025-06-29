// windows.js - window drag, z-index, and focus logic as ES module

const MIN_WINDOW_ZINDEX = 10;
const TOP_WINDOW_ZINDEX = 100;
let isDragging = false;
const DRAG_THRESHOLD = 5;

export function setupWindowDragging() {
  document.querySelectorAll('.window, .window.glass, .gadget-container').forEach(win => {
    win.style.zIndex = MIN_WINDOW_ZINDEX;
  });

  document.querySelectorAll('.window, .window.glass, .gadget-container').forEach(win => {
    let startX, startY, initialLeft, initialTop;

    function startDrag(e) {
      if (e.type === 'touchstart') {
        e.preventDefault();
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
      } else {
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
        startX = e.clientX;
        startY = e.clientY;
      }
      document.querySelectorAll('.window, .window.glass, .gadget-container').forEach(w => {
        w.style.zIndex = MIN_WINDOW_ZINDEX;
      });
      win.style.zIndex = TOP_WINDOW_ZINDEX;
      initialLeft = win.offsetLeft;
      initialTop = win.offsetTop;
      isDragging = false;
      function onMove(e) {
        let clientX, clientY;
        if (e.type === 'touchmove') {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          clientX = e.clientX;
          clientY = e.clientY;
        }
        const dx = Math.abs(clientX - startX);
        const dy = Math.abs(clientY - startY);
        if (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD) {
          isDragging = true;
        }
        let newLeft = initialLeft + (clientX - startX);
        let newTop = initialTop + (clientY - startY);
        const desktop = document.querySelector('.site-wrapper') || document.body;
        const desktopRect = desktop.getBoundingClientRect();
        const windowRect = win.getBoundingClientRect();
        newLeft = Math.max(0, Math.min(desktopRect.width - windowRect.width, newLeft));
        newTop = Math.max(0, Math.min(desktopRect.height - windowRect.height, newTop));
        win.style.left = newLeft + 'px';
        win.style.top = newTop + 'px';
      }
      function onEnd() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
        setTimeout(() => { isDragging = false; }, 10);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onEnd);
    }
    win.addEventListener('mousedown', startDrag);
    win.addEventListener('touchstart', startDrag, { passive: false });
  });
}

export function getIsDragging() {
  return isDragging;
}

// Active/inactive window state for Windows 7
let activeWindow = null;
export function setupActiveWindow() {
  const windows = document.querySelectorAll('.win7 .window.glass');
  function setActiveWindow(windowElement) {
    windows.forEach(win => {
      win.classList.add('unactive');
      win.classList.remove('active');
    });
    windowElement.classList.remove('unactive');
    windowElement.classList.add('active');
    activeWindow = windowElement;
  }
  windows.forEach(windowEl => {
    function activateOnInteraction(e) {
      if (e.type === 'touchstart') e.preventDefault();
      setActiveWindow(windowEl);
    }
    windowEl.addEventListener('mousedown', activateOnInteraction);
    windowEl.addEventListener('touchstart', activateOnInteraction, { passive: false });
  });
  if (windows.length > 0) {
    setActiveWindow(windows[0]);
  }
}
