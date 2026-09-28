import { createBlock, getBlockDef } from '../blocks/registry.js';
import { fetchGithubReadme } from '../github.js';
import { parseReadme } from '../markdown/import.js';
import { getBlocks, setAssetBase, setBlocks } from '../state/store.js';
import { el } from '../utils.js';
import { toast } from './toast.js';

function describe(parsed) {
  if (!parsed.length) return 'Nenhum bloco detectado.';
  const counts = new Map();
  parsed.forEach(({ type }) => counts.set(type, (counts.get(type) ?? 0) + 1));
  const detail = [...counts]
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => `${count} ${getBlockDef(type).label}`)
    .join(', ');
  return `${parsed.length} blocos detectados: ${detail}.`;
}

export function openImportDialog() {
  let assetBase = null;
  let parsed = [];

  const status = el('p', { class: 'import-dialog__status', role: 'status' });
  const setStatus = (message, type = 'info') => {
    status.textContent = message;
    status.dataset.type = type;
  };

  const textarea = el('textarea', {
    class: 'mono',
    rows: 14,
    spellcheck: 'false',
    placeholder: 'Cole aqui o conteúdo do README.md ou arraste um arquivo .md para cá…',
    'aria-label': 'Conteúdo do README',
  });

  const importButton = el('button', { type: 'submit', class: 'btn btn--primary', disabled: true }, 'Importar');

  const analyze = () => {
    parsed = textarea.value.trim() ? parseReadme(textarea.value) : [];
    importButton.disabled = !parsed.length;
    setStatus(textarea.value.trim() ? describe(parsed) : '');
  };

  const setMarkdown = (markdown, base = null) => {
    textarea.value = markdown;
    assetBase = base;
    analyze();
  };

  const loadFile = async (file) => {
    if (!file) return;
    setMarkdown(await file.text());
    toast(`Arquivo ${file.name} carregado`);
  };

  textarea.addEventListener('input', analyze);
  textarea.addEventListener('dragover', (event) => {
    if (event.dataTransfer.types.includes('Files')) event.preventDefault();
  });
  textarea.addEventListener('drop', (event) => {
    const [file] = event.dataTransfer.files;
    if (!file) return;
    event.preventDefault();
    loadFile(file);
  });

  const repoInput = el('input', {
    type: 'text',
    placeholder: 'usuario/repositorio ou https://github.com/usuario/repositorio',
    'aria-label': 'Repositório do GitHub',
  });
  const fetchButton = el('button', { type: 'button', class: 'btn' }, 'Buscar');

  const fetchReadme = async () => {
    fetchButton.disabled = true;
    fetchButton.textContent = 'Buscando…';
    setStatus('Buscando README no GitHub…');
    try {
      const { markdown, assetBase: base, repository } = await fetchGithubReadme(repoInput.value);
      setMarkdown(markdown, base);
      toast(`README de ${repository.owner}/${repository.name} carregado`);
    } catch (error) {
      setStatus(error instanceof TypeError ? 'Não foi possível conectar ao GitHub.' : error.message, 'error');
    } finally {
      fetchButton.disabled = false;
      fetchButton.textContent = 'Buscar';
    }
  };

  fetchButton.addEventListener('click', fetchReadme);
  repoInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      fetchReadme();
    }
  });

  const fileInput = el('input', {
    type: 'file',
    accept: '.md,.markdown,.mdx,.txt,text/markdown,text/plain',
    hidden: true,
    onchange: (event) => loadFile(event.target.files[0]),
  });

  const modeOption = (value, label, checked) =>
    el('label', { class: 'radio' }, el('input', { type: 'radio', name: 'import-mode', value, checked }), label);

  const form = el(
    'form',
    { method: 'dialog', class: 'import-dialog__form' },
    el(
      'header',
      { class: 'import-dialog__header' },
      el('h2', {}, 'Importar README'),
      el('p', { class: 'muted' }, 'Trechos que não viram um componente são mantidos como "Markdown livre", sem perder conteúdo.'),
    ),
    el(
      'section',
      { class: 'import-dialog__section' },
      el('h3', {}, 'Do GitHub'),
      el('div', { class: 'import-dialog__row' }, repoInput, fetchButton),
    ),
    el(
      'section',
      { class: 'import-dialog__section' },
      el(
        'div',
        { class: 'import-dialog__section-head' },
        el('h3', {}, 'Markdown'),
        el('button', { type: 'button', class: 'btn btn--small', onclick: () => fileInput.click() }, 'Abrir arquivo .md'),
        fileInput,
      ),
      textarea,
      status,
    ),
    el(
      'footer',
      { class: 'import-dialog__footer' },
      el(
        'div',
        { class: 'import-dialog__modes' },
        modeOption('replace', 'Substituir o README atual', true),
        modeOption('append', 'Adicionar ao final', false),
      ),
      el(
        'div',
        { class: 'import-dialog__actions' },
        el('button', { type: 'button', class: 'btn', onclick: () => dialog.close() }, 'Cancelar'),
        importButton,
      ),
    ),
  );

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!parsed.length) return;

    const imported = parsed.map(({ type, data }) => ({ ...createBlock(type, data), collapsed: true }));
    const replace = form.elements['import-mode'].value === 'replace';
    setBlocks(replace ? imported : [...getBlocks(), ...imported]);
    if (replace || assetBase) setAssetBase(assetBase);

    toast(`${imported.length} blocos importados`);
    dialog.close();
  });

  const dialog = el('dialog', { class: 'import-dialog' }, form);
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => dialog.remove());

  document.body.append(dialog);
  dialog.showModal();
  repoInput.focus();
}
