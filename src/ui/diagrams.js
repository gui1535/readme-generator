import { el } from '../utils.js';

/* Mermaid and KaTeX are large, so they are only downloaded when the README uses them. */

let mermaidModule;
let mermaidTheme;
let renderQueue = Promise.resolve();
let renderCount = 0;
const diagramCache = new Map();
const DIAGRAM_CACHE_LIMIT = 60;

async function loadMermaid(theme) {
  mermaidModule ??= (await import('mermaid')).default;
  if (mermaidTheme !== theme) {
    mermaidModule.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      suppressErrorRendering: true,
      theme: theme === 'dark' ? 'dark' : 'default',
    });
    mermaidTheme = theme;
  }
  return mermaidModule;
}

function showDiagram(pre, result) {
  if (result.error) {
    pre.after(el('div', { class: 'diagram-error' }, `Erro no diagrama: ${result.error}`));
    return;
  }
  const container = el('div', { class: 'mermaid-diagram' });
  container.innerHTML = result.svg;
  pre.replaceWith(container);
}

function cacheDiagram(key, result) {
  diagramCache.set(key, result);
  if (diagramCache.size > DIAGRAM_CACHE_LIMIT) diagramCache.delete(diagramCache.keys().next().value);
}

export async function renderDiagrams(root, theme) {
  const pending = [];
  for (const code of root.querySelectorAll('pre > code.language-mermaid')) {
    const cached = diagramCache.get(`${theme}\n${code.textContent}`);
    if (cached) showDiagram(code.parentElement, cached);
    else pending.push(code);
  }
  if (!pending.length) return;

  // Mermaid cannot render two diagrams at the same time.
  renderQueue = renderQueue.then(async () => {
    const mermaid = await loadMermaid(theme);
    for (const code of pending) {
      const key = `${theme}\n${code.textContent}`;
      let result = diagramCache.get(key);
      if (!result) {
        const id = `mermaid-diagram-${++renderCount}`;
        try {
          result = { svg: (await mermaid.render(id, code.textContent)).svg };
        } catch (error) {
          result = { error: String(error?.message ?? error).split('\n')[0] };
          document.getElementById(`d${id}`)?.remove();
        }
        cacheDiagram(key, result);
      }
      if (code.isConnected) showDiagram(code.parentElement, result);
    }
  });
  await renderQueue;
}

let katexPromise;
const loadKatex = () =>
  (katexPromise ??= Promise.all([import('katex'), import('katex/dist/katex.min.css')]).then(([module]) => module.default));

export async function renderMath(root) {
  for (const code of root.querySelectorAll('pre > code.language-math')) {
    code.parentElement.replaceWith(el('div', { class: 'math-display' }, code.textContent));
  }
  const nodes = [...root.querySelectorAll('.math-inline, .math-display')];
  if (!nodes.length) return;

  const katex = await loadKatex();
  for (const node of nodes) {
    if (!node.isConnected) continue;
    katex.render(node.textContent, node, {
      displayMode: node.classList.contains('math-display'),
      throwOnError: false,
    });
  }
}
