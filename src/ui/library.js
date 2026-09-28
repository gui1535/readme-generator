import { BLOCKS, CATEGORIES } from '../blocks/registry.js';
import { addBlock } from '../state/store.js';
import { el } from '../utils.js';
import { BLOCK_TYPE_MIME } from './dnd.js';

function renderItem(def) {
  return el(
    'button',
    {
      type: 'button',
      class: 'library__item',
      draggable: 'true',
      title: def.description,
      onclick: () => {
        const id = addBlock(def.type);
        document.querySelector(`[data-id="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      },
      ondragstart: (event) => {
        event.dataTransfer.setData(BLOCK_TYPE_MIME, def.type);
        event.dataTransfer.effectAllowed = 'copy';
      },
    },
    def.label,
  );
}

export function mountLibrary(container) {
  container.append(
    el('header', { class: 'panel__header' }, el('h2', {}, 'Componentes')),
    el('p', { class: 'library__hint' }, 'Clique para adicionar ao final ou arraste para a estrutura.'),
    ...CATEGORIES.map((category) =>
      el(
        'section',
        { class: 'library__group' },
        el('h3', {}, category),
        el('div', { class: 'library__items' }, BLOCKS.filter((def) => def.category === category).map(renderItem)),
      ),
    ),
    el(
      'footer',
      { class: 'library__footer' },
      'Desenvolvido por ',
      el('a', { href: 'https://github.com/gui1535', target: '_blank', rel: 'noopener noreferrer' }, '@gui1535'),
    ),
  );
}
