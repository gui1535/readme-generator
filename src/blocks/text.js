import { escapeHtml } from '../utils.js';
import { alignWrap, prefixLines } from '../markdown/helpers.js';
import { ALERT_KINDS, ALIGN_OPTIONS } from './options.js';

const truncate = (text, size = 50) => (text.length > size ? `${text.slice(0, size)}…` : text);

export const heading = {
  type: 'heading',
  label: 'Heading',
  category: 'Texto',
  description: 'Título de seção (H1 a H6).',
  showsAnchor: true,
  defaults: () => ({ text: 'Título', level: '2', align: 'left' }),
  summary: (data) => data.text,
  fields: [
    { key: 'text', label: 'Texto', type: 'text', markdown: true },
    {
      key: 'level',
      label: 'Nível',
      type: 'select',
      options: [1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `H${n}` })),
    },
    { key: 'align', label: 'Alinhamento', type: 'select', options: ALIGN_OPTIONS },
  ],
  toMarkdown({ text, level, align }) {
    if (!text.trim()) return '';
    const n = Number(level) || 2;
    if (align && align !== 'left') return `<h${n} align="${align}">${escapeHtml(text)}</h${n}>`;
    return `${'#'.repeat(n)} ${text}`;
  },
};

export const paragraph = {
  type: 'paragraph',
  label: 'Parágrafo',
  category: 'Texto',
  description: 'Texto livre. Aceita Markdown (**negrito**, *itálico*, `código`, links).',
  defaults: () => ({ text: 'Escreva aqui. Você pode usar **negrito**, *itálico* e `código`.', align: 'left' }),
  summary: (data) => truncate(data.text),
  fields: [
    { key: 'text', label: 'Texto', type: 'textarea', rows: 5, markdown: true },
    { key: 'align', label: 'Alinhamento', type: 'select', options: ALIGN_OPTIONS },
  ],
  toMarkdown: ({ text, align }) => (text.trim() ? alignWrap(text.trim(), align) : ''),
};

export const quote = {
  type: 'quote',
  label: 'Citação',
  category: 'Texto',
  description: 'Blockquote (> texto).',
  defaults: () => ({ text: 'Informação importante sobre o projeto.' }),
  summary: (data) => truncate(data.text),
  fields: [{ key: 'text', label: 'Texto', type: 'textarea', rows: 3, markdown: true }],
  toMarkdown: ({ text }) => (text.trim() ? prefixLines(text.trim(), '> ') : ''),
};

export const markdown = {
  type: 'markdown',
  label: 'Markdown livre',
  category: 'Texto',
  description: 'Markdown ou HTML escrito à mão, inserido no README exatamente como está.',
  defaults: () => ({ content: 'Escreva **Markdown** ou <b>HTML</b> livremente.' }),
  summary: (data) => truncate(data.content.trim().split('\n')[0] ?? ''),
  fields: [
    {
      key: 'content',
      label: 'Conteúdo',
      type: 'textarea',
      rows: 8,
      monospace: true,
      markdown: true,
      help: 'Inserido no README exatamente como escrito.',
    },
  ],
  toMarkdown: ({ content }) => content.trim(),
};

export const alert = {
  type: 'alert',
  label: 'Alerta',
  category: 'Texto',
  description: 'Alertas do GitHub: Note, Tip, Important, Warning e Caution.',
  defaults: () => ({ kind: 'NOTE', text: 'Informação adicional.' }),
  summary: (data) => `${data.kind} · ${truncate(data.text, 40)}`,
  fields: [
    { key: 'kind', label: 'Tipo', type: 'select', options: ALERT_KINDS },
    { key: 'text', label: 'Texto', type: 'textarea', rows: 3, markdown: true },
  ],
  toMarkdown: ({ kind, text }) => (text.trim() ? `> [!${kind}]\n${prefixLines(text.trim(), '> ')}` : ''),
};

export function referenceLine({ id, url, title }) {
  const titlePart = title ? ` "${title.replace(/"/g, '\\"')}"` : '';
  return `[${id}]: ${url}${titlePart}`;
}

export const references = {
  type: 'references',
  label: 'Links de referência',
  category: 'Texto',
  description: 'URLs reutilizáveis. Escreva [texto][id] em qualquer campo, ou use o botão Link da barra.',
  defaults: () => ({ items: [{ id: 'docs', url: 'https://github.com/usuario/meu-projeto/wiki', title: '' }] }),
  summary: (data) => data.items.map((item) => item.id).filter(Boolean).join(', '),
  fields: [
    {
      key: 'items',
      label: 'Links',
      type: 'repeater',
      itemName: 'Link',
      addLabel: '+ Link',
      newItem: () => ({ id: '', url: '', title: '' }),
      fields: [
        { key: 'id', label: 'ID', type: 'text', placeholder: 'docs' },
        { key: 'url', label: 'URL', type: 'text', placeholder: 'https://…' },
        { key: 'title', label: 'Título', type: 'text', placeholder: 'opcional' },
      ],
    },
  ],
  toMarkdown: ({ items }) =>
    items
      .filter((item) => item.id.trim() && item.url.trim())
      .map(referenceLine)
      .join('\n'),
};

export const footnotes = {
  type: 'footnotes',
  label: 'Notas de rodapé',
  category: 'Texto',
  description: 'Textos das notas. Marque a referência no texto com [^id] ou com o botão Nota da barra.',
  defaults: () => ({ items: [{ id: '1', text: 'Texto da nota.' }] }),
  summary: (data) => `${data.items.length} nota(s)`,
  fields: [
    {
      key: 'items',
      label: 'Notas',
      type: 'repeater',
      itemName: 'Nota',
      addLabel: '+ Nota',
      newItem: () => ({ id: '', text: '' }),
      fields: [
        { key: 'id', label: 'ID', type: 'text', placeholder: '1' },
        { key: 'text', label: 'Texto', type: 'text', markdown: true },
      ],
    },
  ],
  toMarkdown: ({ items }) =>
    items
      .filter((item) => item.id.trim() && item.text.trim())
      .map((item) => `[^${item.id.trim()}]: ${item.text.trim()}`)
      .join('\n'),
};
