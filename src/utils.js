export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function unescapeHtml(value) {
  return String(value ?? '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * Small DOM helper: el('button', { class: 'btn', onclick }, 'Texto').
 * Children are appended before props so that `value` works on <select>.
 */
export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  node.append(...children.flat(Infinity).filter((child) => child != null && child !== false));

  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key === 'value' || key === 'checked') node[key] = value;
    else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value === true ? '' : value);
  }

  return node;
}

export function iconButton(symbol, title, onClick, { disabled = false, variant } = {}) {
  return el(
    'button',
    {
      type: 'button',
      class: variant ? `icon-btn icon-btn--${variant}` : 'icon-btn',
      title,
      'aria-label': title,
      disabled,
      onclick: onClick,
    },
    symbol,
  );
}

export function moveItem(list, from, to) {
  const [item] = list.splice(from, 1);
  list.splice(to, 0, item);
}

export function downloadFile(filename, content, type = 'text/markdown') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = el('a', { href: url, download: filename });
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
