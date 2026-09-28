const LIST_STYLES = [
  { value: 'bullet', label: 'Marcadores' },
  { value: 'numbered', label: 'Numerada' },
];

const TABLE_SEPARATORS = { left: '---', center: ':---:', right: '---:' };

export const list = {
  type: 'list',
  label: 'Lista',
  category: 'Estrutura',
  description: 'Lista com marcadores ou numerada, com suporte a aninhamento.',
  defaults: () => ({ style: 'bullet', items: 'Frontend\n  React\n  TypeScript\nBackend\n  Node.js' }),
  summary: (data) => `${data.items.split('\n').filter((line) => line.trim()).length} item(ns)`,
  fields: [
    { key: 'style', label: 'Tipo', type: 'select', options: LIST_STYLES },
    {
      key: 'items',
      label: 'Itens',
      type: 'textarea',
      rows: 6,
      monospace: true,
      markdown: true,
      help: 'Um item por linha. Use 2 espaços no início para aninhar.',
    },
  ],
  toMarkdown({ style, items }) {
    return items
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        const level = Math.floor(line.match(/^ */)[0].length / 2);
        const text = line.trim();
        return style === 'numbered' ? `${'   '.repeat(level)}1. ${text}` : `${'  '.repeat(level)}- ${text}`;
      })
      .join('\n');
  },
};

export const checklist = {
  type: 'checklist',
  label: 'Checklist',
  category: 'Estrutura',
  description: 'Lista de tarefas, útil para roadmap e funcionalidades.',
  defaults: () => ({
    items: [
      { done: true, text: 'Sistema de login' },
      { done: true, text: 'Dashboard' },
      { done: false, text: 'Sistema de pagamentos' },
    ],
  }),
  summary: (data) => `${data.items.filter((item) => item.done).length}/${data.items.length} concluídos`,
  fields: [
    {
      key: 'items',
      label: 'Itens',
      type: 'repeater',
      itemName: 'Item',
      addLabel: '+ Item',
      newItem: () => ({ done: false, text: '' }),
      fields: [
        { key: 'done', label: 'Concluído', type: 'checkbox' },
        { key: 'text', label: 'Texto', type: 'text', markdown: true },
      ],
    },
  ],
  toMarkdown({ items }) {
    return items
      .filter((item) => item.text.trim())
      .map((item) => `- [${item.done ? 'x' : ' '}] ${item.text.trim()}`)
      .join('\n');
  },
};

export const table = {
  type: 'table',
  label: 'Tabela',
  category: 'Estrutura',
  description: 'Tabela visual com colunas, linhas e alinhamento.',
  defaults: () => ({
    table: {
      columns: [
        { name: 'Feature', align: 'left' },
        { name: 'Status', align: 'center' },
        { name: 'Versão', align: 'center' },
      ],
      rows: [
        ['Login', '✅', '1.0'],
        ['Dashboard', '✅', '1.1'],
        ['Pagamentos', '🚧', '1.2'],
      ],
    },
  }),
  summary: (data) => `${data.table.columns.length} colunas × ${data.table.rows.length} linhas`,
  fields: [{ key: 'table', label: 'Conteúdo', type: 'table' }],
  toMarkdown({ table: { columns, rows } }) {
    if (!columns.length) return '';
    const cell = (value) => String(value ?? '').replace(/\|/g, '\\|').replace(/\n/g, '<br>') || ' ';
    const row = (cells) => `| ${cells.join(' | ')} |`;
    return [
      row(columns.map((column) => cell(column.name))),
      row(columns.map((column) => TABLE_SEPARATORS[column.align] ?? '---')),
      ...rows.map((values) => row(columns.map((_, index) => cell(values[index])))),
    ].join('\n');
  },
};

export const details = {
  type: 'details',
  label: 'Accordion',
  category: 'Estrutura',
  description: 'Seção expansível (<details>).',
  defaults: () => ({ summary: 'Ver instalação completa', content: 'Conteúdo…', open: false }),
  summary: (data) => data.summary,
  fields: [
    { key: 'summary', label: 'Título', type: 'text' },
    { key: 'content', label: 'Conteúdo', type: 'textarea', rows: 5, markdown: true },
    { key: 'open', label: 'Aberto por padrão', type: 'checkbox' },
  ],
  toMarkdown({ summary, content, open }) {
    return [`<details${open ? ' open' : ''}>`, `<summary>${summary}</summary>`, '', content.trim(), '', '</details>'].join('\n');
  },
};

const escapeLinkText = (text) => text.replace(/([[\]])/g, '\\$1');

export const toc = {
  type: 'toc',
  label: 'Sumário',
  category: 'Estrutura',
  description: 'Sumário automático: acompanha os títulos quando você renomeia, move ou remove seções.',
  usesOutline: true,
  defaults: () => ({ title: 'Sumário', collapsible: true, style: 'numbered', h2: true, h3: true, h4: false, ignore: '' }),
  summary: (data) => ['h2', 'h3', 'h4'].filter((level) => data[level]).map((level) => level.toUpperCase()).join(', '),
  fields: [
    { key: 'title', label: 'Título', type: 'text', placeholder: 'Sumário' },
    { key: 'style', label: 'Tipo', type: 'select', options: LIST_STYLES },
    { key: 'collapsible', label: 'Recolhível (clique para abrir)', type: 'checkbox' },
    { key: 'h2', label: 'Incluir H2', type: 'checkbox' },
    { key: 'h3', label: 'Incluir H3', type: 'checkbox' },
    { key: 'h4', label: 'Incluir H4', type: 'checkbox' },
    { key: 'ignore', label: 'Ignorar títulos', type: 'textarea', rows: 2, help: 'Um título por linha, ex.: Licença.' },
  ],
  toMarkdown(data, context) {
    const levels = [2, 3, 4].filter((level) => data[`h${level}`]);
    const ignored = new Set(
      data.ignore
        .split('\n')
        .map((line) => line.trim().toLowerCase())
        .filter(Boolean),
    );
    const headings = (context?.headings ?? []).filter(
      (heading) => levels.includes(heading.level) && !ignored.has(heading.text.toLowerCase()),
    );
    if (!headings.length) return '';

    let previousDepth = -1;
    const lines = headings.map((heading) => {
      const depth = Math.min(heading.level - levels[0], previousDepth + 1);
      previousDepth = depth;
      const link = `[${escapeLinkText(heading.text)}](#${heading.slug})`;
      if (data.style !== 'numbered') return `${'  '.repeat(depth)}- ${link}`;
      return depth === 0 ? `1. ${link}` : `${'   '.repeat(depth)}- ${link}`;
    });

    const list = lines.join('\n');
    const title = data.title.trim();
    if (data.collapsible) return `<details>\n<summary><b>${title || 'Sumário'}</b></summary>\n\n${list}\n\n</details>`;
    return title ? `**${title}**\n\n${list}` : list;
  },
};

export const divider = {
  type: 'divider',
  label: 'Separador',
  category: 'Estrutura',
  description: 'Linha horizontal (---).',
  defaults: () => ({}),
  fields: [],
  toMarkdown: () => '---',
};
