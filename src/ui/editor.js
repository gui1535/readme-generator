import { getBlockDef } from '../blocks/registry.js';
import { blockToMarkdown, createContext } from '../markdown/generate.js';
import { collectHeadings } from '../markdown/outline.js';
import {
  addBlock,
  duplicateBlock,
  getBlocks,
  moveBlock,
  removeBlock,
  subscribe,
  toggleCollapsed,
  toggleHidden,
  updateBlockData,
} from '../state/store.js';
import { el, iconButton } from '../utils.js';
import { BLOCK_ID_MIME, BLOCK_TYPE_MIME } from './dnd.js';
import { renderForm } from './form.js';
import { toast } from './toast.js';

async function copyText(text, message) {
  try {
    await navigator.clipboard.writeText(text);
    toast(message);
  } catch {
    toast('Não foi possível copiar', 'error');
  }
}

async function copyBlock(block) {
  try {
    await navigator.clipboard.writeText(blockToMarkdown(block, createContext(getBlocks())));
    toast('Markdown do bloco copiado');
  } catch {
    toast('Não foi possível copiar', 'error');
  }
}

function renderCard(block, index, total) {
  const def = getBlockDef(block.type);
  const data = structuredClone(block.data);
  const summary = el('span', { class: 'block-card__summary' }, def.summary?.(data) ?? '');

  const handle = el('span', { class: 'block-card__handle', title: 'Arrastar para reordenar', 'aria-hidden': 'true' }, '⠿');

  const header = el(
    'div',
    { class: 'block-card__header' },
    handle,
    el(
      'button',
      {
        type: 'button',
        class: 'block-card__title',
        'aria-expanded': String(!block.collapsed),
        onclick: () => toggleCollapsed(block.id),
      },
      el('span', { class: 'block-card__chevron' }, block.collapsed ? '▸' : '▾'),
      el('span', { class: 'block-card__label' }, def.label),
      block.hidden && el('span', { class: 'tag' }, 'oculto'),
      summary,
    ),
    el(
      'div',
      { class: 'block-card__actions' },
      iconButton('↑', 'Mover para cima', () => moveBlock(block.id, index - 1), { disabled: index === 0 }),
      iconButton('↓', 'Mover para baixo', () => moveBlock(block.id, index + 2), { disabled: index === total - 1 }),
      iconButton('⎘', 'Copiar Markdown deste bloco', () => copyBlock({ ...block, data })),
      iconButton('⧉', 'Duplicar', () => duplicateBlock(block.id)),
      iconButton(block.hidden ? '◉' : '◌', block.hidden ? 'Mostrar no README' : 'Ocultar do README', () =>
        toggleHidden(block.id),
      ),
      iconButton('✕', 'Excluir', () => removeBlock(block.id), { variant: 'danger' }),
    ),
  );

  const anchorHint =
    def.showsAnchor &&
    el('button', {
      type: 'button',
      class: 'anchor-hint',
      title: 'Copiar link para esta seção',
      dataset: { anchorFor: block.id },
      onclick: (event) => copyText(event.currentTarget.dataset.anchor ?? '', 'Link da seção copiado'),
    });

  const body = el(
    'div',
    { class: 'block-card__body' },
    anchorHint,
    def.fields.length
      ? renderForm(def.fields, data, () => {
          updateBlockData(block.id, data);
          summary.textContent = def.summary?.(data) ?? '';
        })
      : el('p', { class: 'muted' }, 'Este bloco não tem configurações.'),
  );

  const card = el(
    'article',
    {
      class: ['block-card', block.hidden && 'is-hidden', block.collapsed && 'is-collapsed'].filter(Boolean).join(' '),
      dataset: { id: block.id },
    },
    header,
    body,
  );

  // Only the handle starts a drag, so text inside the inputs stays selectable.
  handle.addEventListener('mousedown', () => (card.draggable = true));
  handle.addEventListener('mouseup', () => (card.draggable = false));
  card.addEventListener('dragstart', (event) => {
    event.dataTransfer.setData(BLOCK_ID_MIME, block.id);
    event.dataTransfer.effectAllowed = 'move';
    card.classList.add('is-dragging');
  });
  card.addEventListener('dragend', () => {
    card.draggable = false;
    card.classList.remove('is-dragging');
  });

  return card;
}

function setupDropZone(list) {
  const indicator = el('div', { class: 'drop-indicator' });
  const accepts = (event) => [BLOCK_ID_MIME, BLOCK_TYPE_MIME].some((type) => event.dataTransfer.types.includes(type));

  const dropIndex = (y) => {
    const cards = [...list.querySelectorAll('.block-card')];
    const index = cards.findIndex((card) => {
      const rect = card.getBoundingClientRect();
      return y < rect.top + rect.height / 2;
    });
    return index === -1 ? cards.length : index;
  };

  list.addEventListener('dragover', (event) => {
    if (!accepts(event)) return;
    event.preventDefault();
    const cards = list.querySelectorAll('.block-card');
    const index = dropIndex(event.clientY);
    if (index < cards.length) cards[index].before(indicator);
    else list.append(indicator);
  });

  list.addEventListener('dragleave', (event) => {
    if (!list.contains(event.relatedTarget)) indicator.remove();
  });

  list.addEventListener('drop', (event) => {
    if (!accepts(event)) return;
    event.preventDefault();
    const index = dropIndex(event.clientY);
    indicator.remove();

    const id = event.dataTransfer.getData(BLOCK_ID_MIME);
    if (id) moveBlock(id, index);
    else addBlock(event.dataTransfer.getData(BLOCK_TYPE_MIME), index);
  });
}

/** Opens a block (expanding it if needed), scrolls to it and highlights it briefly. */
export function focusBlock(id) {
  const block = getBlocks().find((item) => item.id === id);
  if (!block) return;
  if (block.collapsed) toggleCollapsed(id);
  const card = document.querySelector(`.block-card[data-id="${id}"]`);
  if (!card) return;
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  card.classList.add('is-flash');
  setTimeout(() => card.classList.remove('is-flash'), 1600);
}

/** Shows, under each Heading block, the anchor GitHub will generate (with -1, -2 for repeats). */
function updateAnchorHints(list) {
  const hints = list.querySelectorAll('.anchor-hint');
  if (!hints.length) return;
  const slugs = new Map(collectHeadings(getBlocks()).map((heading) => [heading.blockId, heading.slug]));
  for (const hint of hints) {
    const slug = slugs.get(hint.dataset.anchorFor);
    hint.hidden = !slug;
    if (!slug) continue;
    hint.dataset.anchor = `#${slug}`;
    hint.textContent = `Âncora: #${slug}`;
  }
}

function captureFocus() {
  const active = document.activeElement;
  const card = active?.closest?.('.block-card');
  if (!card || !active.dataset.field) return null;
  const hasSelection = typeof active.selectionStart === 'number';
  return {
    id: card.dataset.id,
    field: active.dataset.field,
    start: hasSelection ? active.selectionStart : null,
    end: hasSelection ? active.selectionEnd : null,
  };
}

function restoreFocus(list, focus) {
  if (!focus) return;
  const target = list.querySelector(`[data-id="${focus.id}"] [data-field="${CSS.escape(focus.field)}"]`);
  if (!target) return;
  target.focus({ preventScroll: true });
  if (focus.start !== null) target.setSelectionRange(focus.start, focus.end);
}

export function mountEditor(container) {
  const list = el('div', { class: 'block-list' });
  container.append(el('header', { class: 'panel__header' }, el('h2', {}, 'Estrutura')), list);

  const render = () => {
    const focus = captureFocus();
    const blocks = getBlocks();
    list.replaceChildren(
      ...(blocks.length
        ? blocks.map((block, index) => renderCard(block, index, blocks.length))
        : [el('div', { class: 'empty-state' }, 'Nenhum bloco ainda. Adicione componentes pela biblioteca ao lado.')]),
    );
    restoreFocus(list, focus);
  };

  setupDropZone(list);
  subscribe((kind) => {
    if (kind === 'structure') render();
    updateAnchorHints(list);
  });
  render();
  updateAnchorHints(list);
}
