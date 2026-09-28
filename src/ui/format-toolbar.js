import { createBlock } from '../blocks/registry.js';
import { emojiReady, getEmoji, getEmojiList } from '../markdown/emoji.js';
import { generateMarkdown } from '../markdown/generate.js';
import { getBlocks, replaceBlockData, setBlocks } from '../state/store.js';
import { el } from '../utils.js';
import { toast } from './toast.js';

const POPULAR_EMOJI = [
  'rocket', 'sparkles', 'tada', 'white_check_mark', 'x', 'warning', 'construction', 'bug', 'fire', 'zap',
  'star', 'heart', '+1', 'eyes', 'bulb', 'memo', 'books', 'wrench', 'hammer', 'gear',
  'package', 'lock', 'key', 'globe_with_meridians', 'computer', 'iphone', 'art', 'chart_with_upwards_trend', 'hourglass', 'link',
  'mag', 'bell', 'gift', 'trophy', 'handshake', 'wave', 'point_right', 'coffee', 'seedling', 'earth_americas',
];

/** Inserts text keeping the browser's native undo (Ctrl+Z) working. */
function insertText(input, text) {
  if (!document.execCommand('insertText', false, text)) {
    input.setRangeText(text, input.selectionStart, input.selectionEnd, 'end');
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

export function wrapSelection(input, before, after = before, placeholder = 'texto') {
  input.focus();
  const { selectionStart: start, selectionEnd: end, value } = input;
  const selected = value.slice(start, end);
  const isWrapped =
    selected && value.slice(start - before.length, start) === before && value.slice(end, end + after.length) === after;

  if (isWrapped) {
    input.setSelectionRange(start - before.length, end + after.length);
    insertText(input, selected);
    input.setSelectionRange(start - before.length, end - before.length);
    return;
  }

  const text = selected || placeholder;
  insertText(input, `${before}${text}${after}`);
  input.setSelectionRange(start + before.length, start + before.length + text.length);
}

function insertLink(input) {
  const references = getBlocks()
    .filter((block) => block.type === 'references' && !block.hidden)
    .flatMap((block) => block.data.items)
    .filter((item) => item.id.trim());
  const hint = references.length ? ` ou o ID de um link de referência (${references.map((r) => r.id).join(', ')})` : '';
  const answer = prompt(`URL do link${hint}:`, 'https://')?.trim();
  if (!answer || answer === 'https://') return;

  const reference = references.find((item) => item.id.toLowerCase() === answer.toLowerCase());
  wrapSelection(input, '[', reference ? `][${reference.id}]` : `](${answer})`, 'texto do link');
}

function nextFootnoteId() {
  const used = new Set();
  for (const block of getBlocks()) {
    if (block.type === 'footnotes') block.data.items.forEach((item) => used.add(item.id.trim()));
  }
  for (const match of generateMarkdown(getBlocks()).matchAll(/\[\^([^\]\s]+)\]/g)) used.add(match[1]);
  let id = 1;
  while (used.has(String(id))) id++;
  return String(id);
}

function insertFootnote(input) {
  const id = nextFootnoteId();
  input.focus();
  input.setSelectionRange(input.selectionEnd, input.selectionEnd);
  insertText(input, `[^${id}]`);

  const item = { id, text: 'Texto da nota.' };
  const blocks = getBlocks();
  const target = blocks.find((block) => block.type === 'footnotes');
  if (target) {
    replaceBlockData(target.id, { ...target.data, items: [...target.data.items, item] });
  } else {
    setBlocks([...blocks, createBlock('footnotes', { items: [item] })]);
  }
  toast(`Nota [^${id}] criada. Edite o texto dela no bloco "Notas de rodapé".`);
}

let openPicker;

function closeEmojiPicker() {
  openPicker?.remove();
  openPicker = null;
}

function openEmojiPicker(anchor, input) {
  closeEmojiPicker();
  const { selectionStart, selectionEnd } = input;

  const pick = (emoji) => {
    closeEmojiPicker();
    input.focus();
    input.setSelectionRange(selectionStart, selectionEnd);
    insertText(input, emoji);
  };

  const grid = el('div', { class: 'emoji-picker__grid' });
  const renderList = (query) => {
    const q = query.trim().toLowerCase().replace(/:/g, '');
    const entries = q
      ? getEmojiList()
          .filter((entry) => entry.names.some((n) => n.includes(q)) || entry.tags.some((t) => t.includes(q)))
          .slice(0, 80)
      : POPULAR_EMOJI.filter((name) => getEmoji(name)).map((name) => ({ emoji: getEmoji(name), names: [name] }));
    grid.replaceChildren(
      ...(entries.length
        ? entries.map((entry) =>
            el(
              'button',
              { type: 'button', class: 'emoji-picker__item', title: `:${entry.names[0]}:`, onclick: () => pick(entry.emoji) },
              entry.emoji,
            ),
          )
        : [el('p', { class: 'muted' }, 'Nenhum emoji encontrado.')]),
    );
  };

  const search = el('input', {
    type: 'search',
    placeholder: 'Buscar em inglês (rocket, bug…)',
    'aria-label': 'Buscar emoji',
    oninput: (event) => renderList(event.target.value),
    onkeydown: (event) => {
      if (event.key === 'Escape') {
        closeEmojiPicker();
        input.focus();
      }
    },
  });

  openPicker = el('div', { class: 'emoji-picker' }, search, grid);
  grid.append(el('p', { class: 'muted' }, 'Carregando emojis…'));
  emojiReady.then(() => renderList(search.value));
  anchor.append(openPicker);
  search.focus();
}

document.addEventListener('mousedown', (event) => {
  if (openPicker && !event.target.closest('.emoji-picker, [data-action="emoji"]')) closeEmojiPicker();
});

const ACTIONS = [
  { id: 'bold', label: 'B', title: 'Negrito (Ctrl+B)', run: (input) => wrapSelection(input, '**') },
  { id: 'italic', label: 'I', title: 'Itálico (Ctrl+I)', run: (input) => wrapSelection(input, '_') },
  { id: 'strike', label: 'S', title: 'Tachado', run: (input) => wrapSelection(input, '~~') },
  { id: 'code', label: '<>', title: 'Código inline (Ctrl+E)', run: (input) => wrapSelection(input, '`', '`', 'código') },
  { id: 'link', label: 'Link', title: 'Link (Ctrl+K)', run: insertLink },
  { id: 'kbd', label: 'Kbd', title: 'Tecla do teclado', run: (input) => wrapSelection(input, '<kbd>', '</kbd>', 'Ctrl') },
  { id: 'sub', label: 'Sub', title: 'Subscrito', run: (input) => wrapSelection(input, '<sub>', '</sub>') },
  { id: 'sup', label: 'Sup', title: 'Sobrescrito', run: (input) => wrapSelection(input, '<sup>', '</sup>') },
  { id: 'emoji', label: '😀', title: 'Emoji', run: (input, button) => openEmojiPicker(button.parentElement, input) },
  { id: 'footnote', label: 'Nota', title: 'Nota de rodapé', run: insertFootnote },
];

const SHORTCUTS = { b: 'bold', i: 'italic', k: 'link', e: 'code' };

export function attachShortcuts(input) {
  input.addEventListener('keydown', (event) => {
    if (!(event.ctrlKey || event.metaKey) || event.shiftKey || event.altKey) return;
    const action = ACTIONS.find((item) => item.id === SHORTCUTS[event.key.toLowerCase()]);
    if (!action) return;
    event.preventDefault();
    action.run(input);
  });
}

export function renderFormatToolbar(input) {
  return el(
    'div',
    { class: 'format-toolbar', role: 'toolbar', 'aria-label': 'Formatação' },
    ACTIONS.map((action) =>
      el(
        'button',
        {
          type: 'button',
          class: `format-toolbar__button format-toolbar__button--${action.id}`,
          title: action.title,
          'aria-label': action.title,
          dataset: { action: action.id },
          // Keeps the text selection while clicking the button.
          onmousedown: (event) => event.preventDefault(),
          onclick: (event) => action.run(input, event.currentTarget),
        },
        action.label,
      ),
    ),
  );
}
