import { getBlockDef } from '../blocks/registry.js';
import { checkReadme, countProblems } from '../markdown/check.js';
import { getBlocks } from '../state/store.js';
import { el } from '../utils.js';
import { focusBlock } from './editor.js';

const LEVELS = {
  error: { icon: '✕', label: 'Erro' },
  warning: { icon: '⚠', label: 'Aviso' },
  info: { icon: 'ℹ', label: 'Info' },
};

function summaryText({ errors, warnings }, infoCount) {
  if (!errors && !warnings) return infoCount ? 'Tudo certo. Há apenas observações informativas.' : 'Tudo certo para o GitHub.';
  const parts = [errors && `${errors} erro(s)`, warnings && `${warnings} aviso(s)`].filter(Boolean);
  return `Encontramos ${parts.join(' e ')}.`;
}

/** `onDownload` adds a "download anyway" button (used before exporting). */
export function openCheckDialog({ onDownload } = {}) {
  const result = checkReadme(getBlocks());
  const counts = countProblems(result);
  const blocks = new Map(getBlocks().map((block) => [block.id, block]));
  const infoCount = result.issues.length - counts.errors - counts.warnings;

  const issueItem = (issue) => {
    const block = blocks.get(issue.blockId);
    return el(
      'li',
      { class: `check-issue check-issue--${issue.level}` },
      el('span', { class: 'check-issue__icon', title: LEVELS[issue.level].label }, LEVELS[issue.level].icon),
      el('span', { class: 'check-issue__message' }, issue.message),
      block &&
        el(
          'button',
          {
            type: 'button',
            class: 'btn btn--small',
            onclick: () => {
              dialog.close();
              focusBlock(block.id);
            },
          },
          getBlockDef(block.type)?.label ?? 'Bloco',
        ),
    );
  };

  const dialog = el(
    'dialog',
    { class: 'check-dialog' },
    el(
      'div',
      { class: 'check-dialog__body' },
      el(
        'header',
        {},
        el('h2', {}, 'Verificação do README'),
        el('p', { class: `check-dialog__summary${counts.errors ? ' has-errors' : ''}` }, summaryText(counts, infoCount)),
      ),
      result.passed.length > 0 &&
        el(
          'ul',
          { class: 'check-passed' },
          result.passed.map((check) => el('li', {}, el('span', { class: 'check-passed__icon' }, '✓'), check.label)),
        ),
      result.issues.length > 0 && el('ul', { class: 'check-issues' }, result.issues.map(issueItem)),
      el(
        'footer',
        { class: 'check-dialog__footer' },
        el('button', { type: 'button', class: 'btn', onclick: () => dialog.close() }, 'Fechar'),
        onDownload &&
          el(
            'button',
            {
              type: 'button',
              class: 'btn btn--primary',
              onclick: () => {
                dialog.close();
                onDownload();
              },
            },
            'Baixar mesmo assim',
          ),
      ),
    ),
  );

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => dialog.remove());
  document.body.append(dialog);
  dialog.showModal();
}
