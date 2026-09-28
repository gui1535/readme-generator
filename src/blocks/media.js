import { escapeHtml } from '../utils.js';
import { alignWrap } from '../markdown/helpers.js';
import { ALIGN_OPTIONS, BADGE_STYLES } from './options.js';

function imgTag({ src, alt, width, height }) {
  const widthAttr = width ? ` width="${escapeHtml(width)}"` : '';
  const heightAttr = height ? ` height="${escapeHtml(height)}"` : '';
  return `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${widthAttr}${heightAttr}>`;
}

function linkWrap(html, href) {
  return href ? `<a href="${escapeHtml(href)}">${html}</a>` : html;
}

export const hero = {
  type: 'hero',
  label: 'Hero / Logo',
  category: 'Destaque',
  description: 'Cabeçalho centralizado com logo, nome e descrição.',
  defaults: () => ({
    logo: 'https://placehold.co/120x120/png?text=Logo',
    width: '120',
    name: 'Meu Projeto',
    description: 'Uma pequena descrição do projeto.',
    link: '',
  }),
  summary: (data) => data.name,
  fields: [
    { key: 'name', label: 'Nome do projeto', type: 'text' },
    { key: 'description', label: 'Descrição', type: 'textarea', rows: 2 },
    { key: 'logo', label: 'URL do logo', type: 'text', placeholder: 'https://…' },
    { key: 'width', label: 'Largura do logo', type: 'text', placeholder: '120 ou 50%' },
    { key: 'link', label: 'Link ao clicar no logo', type: 'text', placeholder: 'https://…' },
  ],
  toMarkdown({ logo, width, name, description, link }) {
    const lines = [];
    if (logo) lines.push(linkWrap(imgTag({ src: logo, alt: name || 'Logo', width }), link));
    if (name) lines.push(`<h1>${escapeHtml(name)}</h1>`);
    if (description) lines.push(`<p>${escapeHtml(description)}</p>`);
    if (!lines.length) return '';
    return ['<div align="center">', ...lines.map((line) => `  ${line}`), '</div>'].join('\n');
  },
};

export const image = {
  type: 'image',
  label: 'Imagem',
  category: 'Destaque',
  description: 'Imagem ou screenshot, com tamanho, alinhamento, link e legenda.',
  defaults: () => ({
    url: 'https://placehold.co/800x400/png?text=Screenshot',
    alt: 'Screenshot',
    width: '',
    height: '',
    align: 'center',
    link: '',
    caption: '',
  }),
  summary: (data) => data.alt || data.url,
  fields: [
    { key: 'url', label: 'URL da imagem', type: 'text', placeholder: 'https://…' },
    { key: 'alt', label: 'Texto alternativo', type: 'text' },
    { key: 'width', label: 'Largura', type: 'text', placeholder: '600 ou 80%' },
    { key: 'height', label: 'Altura', type: 'text', placeholder: 'opcional' },
    { key: 'align', label: 'Alinhamento', type: 'select', options: ALIGN_OPTIONS },
    { key: 'link', label: 'Link ao clicar', type: 'text', placeholder: 'https://…' },
    { key: 'caption', label: 'Legenda', type: 'text' },
  ],
  toMarkdown({ url, alt, width, height, align, link, caption }) {
    if (!url) return '';
    const isPlain = !width && !height && (!align || align === 'left') && !caption;
    if (isPlain) {
      const md = `![${alt}](${url})`;
      return link ? `[${md}](${link})` : md;
    }
    let html = linkWrap(imgTag({ src: url, alt, width, height }), link);
    if (caption) html += `<br>\n  <sub>${escapeHtml(caption)}</sub>`;
    return `<p align="${align || 'left'}">\n  ${html}\n</p>`;
  },
};

const indent = (lines) => lines.map((line) => `  ${line}`);

export const themeImage = {
  type: 'themeImage',
  label: 'Imagem por tema',
  category: 'Destaque',
  description: 'Uma imagem para o tema claro e outra para o escuro do GitHub (<picture>).',
  defaults: () => ({
    light: 'https://placehold.co/600x160/ffffff/1f2328/png?text=Tema+claro',
    dark: 'https://placehold.co/600x160/0d1117/f0f6fc/png?text=Tema+escuro',
    alt: 'Logo do projeto',
    width: '',
    align: 'center',
    link: '',
  }),
  summary: (data) => data.alt,
  fields: [
    { key: 'light', label: 'Imagem para tema claro', type: 'text', placeholder: 'https://…' },
    { key: 'dark', label: 'Imagem para tema escuro', type: 'text', placeholder: 'https://…' },
    { key: 'alt', label: 'Texto alternativo', type: 'text' },
    { key: 'width', label: 'Largura', type: 'text', placeholder: '400 ou 60%' },
    { key: 'align', label: 'Alinhamento', type: 'select', options: ALIGN_OPTIONS },
    { key: 'link', label: 'Link ao clicar', type: 'text', placeholder: 'https://…' },
  ],
  toMarkdown({ light, dark, alt, width, align, link }) {
    if (!light && !dark) return '';
    let lines = [
      '<picture>',
      ...indent(
        [
          dark && `<source media="(prefers-color-scheme: dark)" srcset="${escapeHtml(dark)}">`,
          light && `<source media="(prefers-color-scheme: light)" srcset="${escapeHtml(light)}">`,
          imgTag({ src: light || dark, alt, width }),
        ].filter(Boolean),
      ),
      '</picture>',
    ];
    if (link) lines = [`<a href="${escapeHtml(link)}">`, ...indent(lines), '</a>'];
    if (align && align !== 'left') lines = [`<p align="${align}">`, ...indent(lines), '</p>'];
    return lines.join('\n');
  },
};

function shieldsText(text) {
  return encodeURIComponent(text.replace(/-/g, '--').replace(/_/g, '__')).replace(/%20/g, '_');
}

export function badgeUrl({ label, message, color, logo, logoColor }, style) {
  const texts = [label, message].filter(Boolean).map(shieldsText);
  const path = [...texts, (color || 'blue').replace('#', '')].join('-');
  const params = new URLSearchParams({ style });
  if (logo) params.set('logo', logo);
  if (logo && logoColor) params.set('logoColor', logoColor.replace('#', ''));
  return `https://img.shields.io/badge/${path}?${params}`;
}

const newBadge = (overrides = {}) => ({
  label: '',
  message: 'Badge',
  color: 'blue',
  logo: '',
  logoColor: 'white',
  link: '',
  ...overrides,
});

export const badges = {
  type: 'badges',
  label: 'Badges',
  category: 'Destaque',
  description: 'Grupo de badges do shields.io.',
  defaults: () => ({
    style: 'for-the-badge',
    align: 'center',
    items: [
      newBadge({ message: 'React', color: '20232A', logo: 'react', logoColor: '61DAFB' }),
      newBadge({ message: 'TypeScript', color: '3178C6', logo: 'typescript' }),
      newBadge({ message: 'Node.js', color: '339933', logo: 'nodedotjs' }),
    ],
  }),
  summary: (data) => data.items.map((item) => item.message || item.label).filter(Boolean).join(', '),
  fields: [
    { key: 'style', label: 'Estilo', type: 'select', options: BADGE_STYLES },
    { key: 'align', label: 'Alinhamento', type: 'select', options: ALIGN_OPTIONS },
    {
      key: 'items',
      label: 'Badges',
      type: 'repeater',
      itemName: 'Badge',
      addLabel: '+ Badge',
      newItem: () => newBadge(),
      fields: [
        { key: 'label', label: 'Label', type: 'text', placeholder: 'opcional' },
        { key: 'message', label: 'Valor', type: 'text' },
        { key: 'color', label: 'Cor', type: 'text', placeholder: 'blue ou 3178C6' },
        { key: 'logo', label: 'Logo', type: 'text', placeholder: 'react, github…' },
        { key: 'logoColor', label: 'Cor do logo', type: 'text' },
        { key: 'link', label: 'Link', type: 'text', placeholder: 'https://…' },
      ],
    },
  ],
  toMarkdown({ style, align, items }) {
    const markdown = items
      .filter((item) => item.label || item.message)
      .map((item) => {
        const md = `![${item.label || item.message}](${badgeUrl(item, style)})`;
        return item.link ? `[${md}](${item.link})` : md;
      });
    return markdown.length ? alignWrap(markdown.join(' '), align) : '';
  },
};
