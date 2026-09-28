import { checkReadme, countProblems } from '../markdown/check.js';
import { generateMarkdown } from '../markdown/generate.js';
import { getBlocks, setBlocks, subscribe } from '../state/store.js';
import { createStarterBlocks } from '../templates/starter.js';
import { downloadFile, el } from '../utils.js';
import { openCheckDialog } from './check-dialog.js';
import { openImportDialog } from './import-dialog.js';
import { toast } from './toast.js';

const CHECK_DELAY = 400;

const button = (label, onClick, variant) =>
  el('button', { type: 'button', class: variant ? `btn btn--${variant}` : 'btn', onclick: onClick }, label);

export function mountToolbar(container) {
  const markdown = () => generateMarkdown(getBlocks());
  const download = () => downloadFile('README.md', markdown());

  const checkCount = el('span', { class: 'count-badge', hidden: true });
  const checkButton = el(
    'button',
    { type: 'button', class: 'btn', title: 'Verificar compatibilidade com o GitHub', onclick: () => openCheckDialog() },
    'Verificar',
    checkCount,
  );

  let timer;
  const refreshCheckCount = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const { errors, warnings } = countProblems(checkReadme(getBlocks()));
      checkCount.hidden = !(errors + warnings);
      checkCount.textContent = String(errors + warnings);
      checkCount.classList.toggle('count-badge--error', errors > 0);
    }, CHECK_DELAY);
  };

  container.append(
    button('Importar', openImportDialog),
    button('Exemplo', () => {
      if (confirm('Substituir o README atual pelo exemplo?')) setBlocks(createStarterBlocks());
    }),
    button('Limpar', () => {
      if (confirm('Remover todos os blocos?')) setBlocks([]);
    }),
    checkButton,
    button('Copiar Markdown', async () => {
      try {
        await navigator.clipboard.writeText(markdown());
        toast('Markdown copiado');
      } catch {
        toast('Não foi possível copiar', 'error');
      }
    }),
    button(
      'Baixar README.md',
      () => {
        const { errors, warnings } = countProblems(checkReadme(getBlocks()));
        if (errors + warnings) openCheckDialog({ onDownload: download });
        else download();
      },
      'primary',
    ),
  );

  subscribe(refreshCheckCount);
  refreshCheckCount();
}
