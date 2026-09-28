import { el } from '../utils.js';

let current;
let timer;

export function toast(message, type = 'info') {
  current?.remove();
  clearTimeout(timer);

  current = el('div', { class: `toast toast--${type}`, role: 'status' }, message);
  document.body.append(current);
  requestAnimationFrame(() => current.classList.add('is-visible'));

  const node = current;
  timer = setTimeout(() => {
    node.classList.remove('is-visible');
    setTimeout(() => node.remove(), 200);
  }, 2200);
}
