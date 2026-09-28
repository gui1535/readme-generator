import { checkReadme, countProblems } from '../markdown/check.js';
import { generateMarkdown } from '../markdown/generate.js';
import { getBlocks, setBlocks, subscribe } from '../state/store.js';
import { createStarterBlocks } from '../templates/starter.js';
import { downloadFile, el } from '../utils.js';
import { openCheckDialog } from './check-dialog.js';
import { icon } from './icons.js';
import { openImportDialog } from './import-dialog.js';
import { toast } from './toast.js';

const CHECK_DELAY = 400;
const GITHUB_PROFILE = 'https://github.com/gui1535';

const button = (iconName, title, onClick, variant) =>
  el(
    'button',
    {
      type: 'button',
      class: variant ? `btn btn--icon btn--${variant}` : 'btn btn--icon',
      title,
      'aria-label': title,
      onclick: onClick,
    },
    icon(iconName),
  );

export function mountToolbar(container) {
  const markdown = () => generateMarkdown(getBlocks());
  const download = () => downloadFile('README.md', markdown());

  const checkCount = el('span', { class: 'count-badge', hidden: true });
  const checkButton = button('shieldCheck', 'Verificar compatibilidade com o GitHub', () => openCheckDialog());
  checkButton.append(checkCount);

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
    button('upload', 'Importar README', openImportDialog),
    button('file', 'Carregar exemplo', () => {
      if (confirm('Substituir o README atual pelo exemplo?')) setBlocks(createStarterBlocks());
    }),
    button('trash', 'Limpar tudo', () => {
      if (confirm('Remover todos os blocos?')) setBlocks([]);
    }),
    checkButton,
    button('copy', 'Copiar Markdown', async () => {
      try {
        await navigator.clipboard.writeText(markdown());
        toast('Markdown copiado');
      } catch {
        toast('Não foi possível copiar', 'error');
      }
    }),
    button(
      'download',
      'Baixar README.md',
      () => {
        const { errors, warnings } = countProblems(checkReadme(getBlocks()));
        if (errors + warnings) openCheckDialog({ onDownload: download });
        else download();
      },
      'primary',
    ),
    el('span', { class: 'toolbar__divider', 'aria-hidden': 'true' }),
    el(
      'a',
      {
        class: 'btn btn--icon',
        href: GITHUB_PROFILE,
        target: '_blank',
        rel: 'noopener noreferrer',
        title: 'Meu GitHub (gui1535)',
        'aria-label': 'Meu GitHub (gui1535)',
      },
      icon('github'),
    ),
  );

  subscribe(refreshCheckCount);
  refreshCheckCount();
}
