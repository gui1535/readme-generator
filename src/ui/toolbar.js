import { checkReadme, countProblems } from '../markdown/check.js';
import { generateMarkdown } from '../markdown/generate.js';
import { getBlocks, subscribe } from '../state/store.js';
import { downloadFile, el } from '../utils.js';
import { openCheckDialog } from './check-dialog.js';
import { icon } from './icons.js';
import { openImportDialog } from './import-dialog.js';
import { toast } from './toast.js';

const CHECK_DELAY = 400;
const GITHUB_PROFILE = 'https://github.com/gui1535';

const button = (iconName, label, title, onClick, variant) =>
  el(
    'button',
    {
      type: 'button',
      class: variant ? `btn btn--with-icon btn--${variant}` : 'btn btn--with-icon',
      title,
      onclick: onClick,
    },
    icon(iconName),
    label,
  );

export function mountToolbar(container) {
  const markdown = () => generateMarkdown(getBlocks());
  const download = () => downloadFile('README.md', markdown());

  const checkCount = el('span', { class: 'count-badge', hidden: true });
  const checkButton = button('shieldCheck', 'Verificar', 'Verificar compatibilidade com o GitHub', () =>
    openCheckDialog(),
  );
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
    button('upload', 'Importar', 'Importar um README existente', openImportDialog),
    checkButton,
    button('copy', 'Copiar', 'Copiar o Markdown', async () => {
      try {
        await navigator.clipboard.writeText(markdown());
        toast('Markdown copiado');
      } catch {
        toast('Não foi possível copiar', 'error');
      }
    }),
    button(
      'download',
      'Baixar',
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
