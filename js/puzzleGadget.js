// puzzleGadget.js - Sliding picture puzzle gadget for desktop

export function setupPuzzleGadget() {
  const gadget = document.querySelector('.gadget-container.puzzle');
  const board = gadget.querySelector('.puzzle-board');
  const shuffleBtn = gadget.querySelector('.puzzle-shuffle');
  const status = gadget.querySelector('.puzzle-status');
  const closeBtn = gadget.querySelector('.gadget-close');

  let tiles = [];
  const size = 4;
  const tileSize = 48;

  function createTiles() {
    tiles = Array.from({length: size * size}, (_, i) => i);
    board.innerHTML = '';
    tiles.forEach((n, idx) => {
      const tile = document.createElement('div');
      tile.className = 'puzzle-tile' + (n === 0 ? ' empty' : '');
      setTileBackground(tile, n, size, tileSize);
      tile.addEventListener('click', () => moveTile(idx));
      tile.addEventListener('touchend', () => moveTile(idx));
      board.appendChild(tile);
    });
  }

  function setTileBackground(tile, n, size, tileSize) {
    if (n === 0) {
      tile.style.backgroundImage = 'none';
      return;
    }
    const row = Math.floor((n - 1) / size);
    const col = (n - 1) % size;
    tile.style.backgroundImage = "url('public/images/puzzle.jpg')";
    tile.style.backgroundSize = `${size * tileSize}px ${size * tileSize}px`;
    tile.style.backgroundPosition = `-${col * tileSize}px -${row * tileSize}px`;
  }

  function moveTile(idx) {
    const emptyIdx = tiles.indexOf(0);
    const canMove = [idx - 1, idx + 1, idx - size, idx + size].includes(emptyIdx) &&
      !(idx % size === 0 && emptyIdx === idx - 1) &&
      !(emptyIdx % size === 0 && idx === emptyIdx - 1);
    if (canMove) {
      [tiles[idx], tiles[emptyIdx]] = [tiles[emptyIdx], tiles[idx]];
      updateBoard();
      if (isSolved()) status.textContent = '🎉 Solved!';
      else status.textContent = '';
    }
  }

  function updateBoard() {
    board.childNodes.forEach((tile, idx) => {
      const n = tiles[idx];
      tile.className = 'puzzle-tile' + (n === 0 ? ' empty' : '');
      setTileBackground(tile, n, size, tileSize);
    });
  }

  function shuffle() {
    do {
      for (let i = tiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
      }
    } while (!isSolvable() || isSolved());
    updateBoard();
    status.textContent = '';
  }

  function isSolved() {
    return tiles.every((n, i) => n === (i + 1) % (size * size));
  }

  function isSolvable() {
    let inv = 0;
    for (let i = 0; i < tiles.length; i++) {
      for (let j = i + 1; j < tiles.length; j++) {
        if (tiles[i] && tiles[j] && tiles[i] > tiles[j]) inv++;
      }
    }
    const emptyRow = Math.floor(tiles.indexOf(0) / size);
    return (inv + emptyRow) % 2 === 0;
  }

  shuffleBtn.addEventListener('click', shuffle);
  closeBtn.addEventListener('click', () => { gadget.style.display = 'none'; });
  closeBtn.addEventListener('touchend', (e) => { e.stopPropagation(); gadget.style.display = 'none'; });

  createTiles();
  shuffle();
}
