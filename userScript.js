// userScript.js
// Injected by TizenBrew into the wrapped website.
// Adds TV-remote (D-pad) support to a site that was built for a mouse:
//   - Arrow keys move focus to the nearest clickable element in that direction
//   - OK / Enter clicks the focused element
//   - Return / Back key goes back in history
//   - A visible focus ring so you can always see where you are
//
// Nothing here is site-specific; it works on any website.

(function () {
  'use strict';

  // ---- 1. Focus ring styling -------------------------------------------
  // Injected so the currently focused element is always clearly visible.
  const style = document.createElement('style');
  style.textContent = `
    .tb-focus {
      outline: 4px solid #ffffff !important;
      outline-offset: 2px !important;
      box-shadow: 0 0 0 4px rgba(0,0,0,0.6), 0 0 14px 4px rgba(255,255,255,0.5) !important;
      border-radius: 4px !important;
      scroll-margin: 80px !important;
    }
  `;
  document.documentElement.appendChild(style);

  // ---- 2. What counts as "focusable" -----------------------------------
  const FOCUSABLE = [
    'a[href]', 'button', 'input', 'select', 'textarea',
    'video', '[role="button"]', '[onclick]', '[tabindex]'
  ].join(',');

  function isVisible(el) {
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return false;
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none' || s.opacity === '0') return false;
    // Must be at least partly on-screen vertically within a reasonable band.
    if (r.bottom < -50 || r.top > window.innerHeight + 50) return false;
    return true;
  }

  function candidates() {
    return Array.prototype.filter.call(
      document.querySelectorAll(FOCUSABLE),
      isVisible
    );
  }

  // ---- 3. Track the current element ------------------------------------
  let current = null;

  function center(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function setFocus(el) {
    if (!el) return;
    if (current) current.classList.remove('tb-focus');
    current = el;
    current.classList.add('tb-focus');
    try { current.focus({ preventScroll: true }); } catch (e) {}
    current.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  }

  // Pick a sensible starting element (top-most, left-most focusable).
  function focusFirst() {
    const list = candidates();
    if (!list.length) return;
    list.sort((a, b) => {
      const ca = center(a), cb = center(b);
      return (ca.y - cb.y) || (ca.x - cb.x);
    });
    setFocus(list[0]);
  }

  // ---- 4. Spatial navigation -------------------------------------------
  // Given a direction, score every other element by how well it lines up
  // and how close it is, then focus the best one.
  function move(dir) {
    if (!current) { focusFirst(); return; }
    const from = center(current);
    let best = null, bestScore = Infinity;

    candidates().forEach(el => {
      if (el === current) return;
      const to = center(el);
      const dx = to.x - from.x;
      const dy = to.y - from.y;

      // Must be in the requested direction.
      if (dir === 'left'  && dx >= -8)  return;
      if (dir === 'right' && dx <=  8)  return;
      if (dir === 'up'    && dy >= -8)  return;
      if (dir === 'down'  && dy <=  8)  return;

      // Primary distance along the axis of travel, plus a penalty for
      // drifting off-axis so focus tends to move in a straight line.
      let along, off;
      if (dir === 'left' || dir === 'right') { along = Math.abs(dx); off = Math.abs(dy); }
      else                                   { along = Math.abs(dy); off = Math.abs(dx); }

      const score = along + off * 2;
      if (score < bestScore) { bestScore = score; best = el; }
    });

    if (best) setFocus(best);
  }

  // ---- 5. Remote key handling ------------------------------------------
  // Tizen TV remote keycodes alongside standard browser ones.
  const KEY = {
    LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40,
    ENTER: 13,
    RETURN: 10009,   // Samsung "Back" button
    BACK: 461
  };

  document.addEventListener('keydown', function (e) {
    switch (e.keyCode) {
      case KEY.LEFT:  move('left');  e.preventDefault(); break;
      case KEY.RIGHT: move('right'); e.preventDefault(); break;
      case KEY.UP:    move('up');    e.preventDefault(); break;
      case KEY.DOWN:  move('down');  e.preventDefault(); break;
      case KEY.ENTER:
        if (current) { current.click(); e.preventDefault(); }
        break;
      case KEY.RETURN:
      case KEY.BACK:
        history.back();
        e.preventDefault();
        break;
    }
  }, true);

  // ---- 6. Kick things off ----------------------------------------------
  // Sites load content asynchronously, so grab initial focus once things
  // settle, and re-grab it if the page had nothing focusable at first.
  function init() {
    focusFirst();
    if (!current) {
      let tries = 0;
      const t = setInterval(() => {
        focusFirst();
        if (current || ++tries > 20) clearInterval(t);
      }, 500);
    }
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(init, 800);
  } else {
    window.addEventListener('load', () => setTimeout(init, 800));
  }
})();
