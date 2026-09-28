import markdownLight from 'github-markdown-css/github-markdown-light.css?inline';
import markdownDark from 'github-markdown-css/github-markdown-dark.css?inline';
import highlightLight from 'highlight.js/styles/github.css?inline';
import highlightDark from 'highlight.js/styles/github-dark.css?inline';
import { emojiReady } from '../markdown/emoji.js';
import { generateMarkdown } from '../markdown/generate.js';
import { renderMarkdown } from '../markdown/render.js';
import { createSlugger } from '../markdown/slug.js';
import { getAssetBase, getBlocks, subscribe } from '../state/store.js';
import { el } from '../utils.js';
import { renderDiagrams, renderMath } from './diagrams.js';
import { highlightCode } from './highlight.js';

const THEME_KEY = 'readme-builder:preview-theme';
const THEME_CSS = { light: markdownLight + highlightLight, dark: markdownDark + highlightDark };
const ABSOLUTE_URL = /^([a-z][a-z\d+.-]*:|\/\/|#)/i;

function loadTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/** <picture> follows the OS theme; the preview picks the source for the chosen theme instead. */
function applyPictureTheme(container, theme) {
  for (const picture of container.querySelectorAll('picture')) {
    const img = picture.querySelector('img');
    const sources = [...picture.querySelectorAll('source')];
    const match = sources.find((source) => (source.getAttribute('media') ?? '').includes(`prefers-color-scheme: ${theme}`));
    if (img && match) img.setAttribute('src', match.getAttribute('srcset').split(',')[0].trim().split(/\s+/)[0]);
    sources.forEach((source) => source.remove());
  }
}

function resolveRelativeImages(container, base) {
  if (!base) return;
  for (const img of container.querySelectorAll('img[src]')) {
    const src = img.getAttribute('src');
    if (ABSOLUTE_URL.test(src)) continue;
    img.src = src.startsWith('/') ? new URL(src.slice(1), base.root).href : new URL(src, base.dir).href;
  }
}

/** GitHub prefixes ids with "user-content-" so they never clash with the page itself. */
function addHeadingAnchors(container) {
  const slug = createSlugger();
  for (const heading of container.querySelectorAll('h1, h2, h3, h4, h5, h6')) {
    if (heading.closest('.footnotes')) continue;
    heading.id = `user-content-${slug(heading.textContent)}`;
  }
}

function scrollToAnchor(container, hash) {
  let id;
  try {
    id = decodeURIComponent(hash.slice(1));
  } catch {
    return;
  }
  const target =
    container.querySelector(`[id="user-content-${CSS.escape(id)}"]`) ?? container.querySelector(`[id="${CSS.escape(id)}"]`);
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function mountPreview(container) {
  let theme = loadTheme();
  const themeStyle = el('style', { id: 'preview-theme' });
  document.head.append(themeStyle);

  const rendered = el('article', { class: 'markdown-body' });
  const source = el('pre', { class: 'markdown-source', hidden: true });
  const frame = el('div', { class: 'preview__frame' }, rendered, source);

  const tabs = [
    { label: 'Preview', view: rendered },
    { label: 'Markdown', view: source },
  ].map(({ label, view }, index) => {
    const tab = el('button', { type: 'button', class: index === 0 ? 'tab is-active' : 'tab' }, label);
    const entry = { tab, view };
    tab.addEventListener('click', () => {
      tabs.forEach((other) => {
        other.tab.classList.toggle('is-active', other === entry);
        other.view.hidden = other !== entry;
      });
    });
    return entry;
  });

  const themeButton = el('button', { type: 'button', class: 'tab theme-toggle' });

  const update = () => {
    const markdown = generateMarkdown(getBlocks());
    rendered.innerHTML = markdown ? renderMarkdown(markdown) : '<p class="muted">O README está vazio.</p>';
    applyPictureTheme(rendered, theme);
    resolveRelativeImages(rendered, getAssetBase());
    addHeadingAnchors(rendered);
    highlightCode(rendered);
    renderMath(rendered);
    renderDiagrams(rendered, theme);
    source.textContent = markdown || '(vazio)';
  };

  const applyTheme = () => {
    themeStyle.textContent = THEME_CSS[theme];
    frame.classList.toggle('is-dark', theme === 'dark');
    themeButton.textContent = theme === 'dark' ? '☾ Escuro' : '☀ Claro';
    themeButton.title = 'Alternar entre o tema claro e o escuro do GitHub';
  };

  themeButton.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // Theme preference is optional.
    }
    applyTheme();
    update();
  });

  container.append(
    el(
      'header',
      { class: 'panel__header' },
      el('h2', {}, 'README.md'),
      el('div', { class: 'tabs' }, themeButton, tabs.map((t) => t.tab)),
    ),
    frame,
  );

  rendered.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    event.preventDefault();
    const href = link.getAttribute('href');
    if (href.startsWith('#')) scrollToAnchor(rendered, href);
    else if (/^(https?:|mailto:)/i.test(href)) window.open(href, '_blank', 'noopener');
  });

  applyTheme();
  subscribe(update);
  update();
  emojiReady.then(update);
}
