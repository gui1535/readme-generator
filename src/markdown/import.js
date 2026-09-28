import { Lexer } from 'marked';
import { BADGE_STYLES } from '../blocks/options.js';
import { getBlockDef } from '../blocks/registry.js';
import { referenceLine } from '../blocks/text.js';
import { unescapeHtml } from '../utils.js';
import { createContext, LIST_SEPARATOR, needsListSeparator } from './generate.js';

/*
 * Converts an existing README into builder blocks.
 *
 * A piece of the document only becomes a structured block when that block
 * can generate it back without losing content. Anything else becomes a
 * "Markdown livre" block holding the original text untouched.
 */

const SHELL_LANGUAGES = new Set(['bash', 'sh', 'shell', 'zsh', 'console']);
const ALERT_KINDS = ['NOTE', 'TIP', 'IMPORTANT', 'WARNING', 'CAUTION'];
const GROUPED_HTML_TAGS = /^<(div|p|details|table|picture|center|section)\b/i;

const MD_IMAGE = /^(?:\[!\[([^\]]*)\]\(([^)\s]+)\)\]\(([^)\s]+)\)|!\[([^\]]*)\]\(([^)\s]+)\))/;
const HTML_IMAGE = /^(?:<a\s+([^>]*)>\s*<img\s+([^>]*?)\s*\/?>\s*<\/a>|<img\s+([^>]*?)\s*\/?>)/i;
const ALIGNED_CONTAINER = /^<(div|p)\s+align\s*=\s*["']?(left|center|right)["']?\s*>([\s\S]*)<\/\1>$/i;

const IMG_ATTRIBUTES = new Set(['src', 'alt', 'width', 'height']);
const LINK_ATTRIBUTES = new Set(['href', 'target', 'rel']);
const REFERENCE_DEFINITION = /^\[([^\]]+)\]:\s*(\S+)(?:\s+"((?:[^"\\]|\\.)*)")?$/;
const FOOTNOTE_LINE = /^\[\^([^\]\s]+)\]:\s+(\S.*)$/;

const HTML_TAG = /<([a-zA-Z][\w-]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*\/?>/g;

/** Ignores indentation, line breaks between tags and attribute order when comparing HTML. */
function normalizeHtml(html) {
  return html
    .replace(HTML_TAG, (_, tag, source) => {
      const attributes = Object.entries(parseAttributes(source))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, value]) => `${name}="${value}"`);
      return `<${[tag.toLowerCase(), ...attributes].join(' ')}>`;
    })
    .replace(/>\s+</g, '><')
    .replace(/\s+/g, ' ')
    .trim();
}

/** The lossless rule: a candidate block is accepted only if it generates the same content back. */
function regeneratesAs(block, original, normalize = (text) => text.trim()) {
  return normalize(getBlockDef(block.type).toMarkdown(block.data)) === normalize(original);
}

function fromDefinition(raw) {
  const match = raw.trim().match(REFERENCE_DEFINITION);
  if (!match) return null;
  const item = { id: match[1], url: match[2], title: (match[3] ?? '').replace(/\\"/g, '"') };
  return referenceLine(item) === raw.trim() ? item : null;
}

/** The separator is dropped only where the generator would put it back. */
function isGeneratedListSeparator(token, previousBlock, nextToken) {
  if (token.raw.trim() !== LIST_SEPARATOR || !previousBlock || previousBlock.type === 'markdown') return false;
  if (nextToken?.type !== 'list') return false;
  return needsListSeparator(getBlockDef(previousBlock.type).toMarkdown(previousBlock.data), nextToken.raw);
}

export function parseReadme(source) {
  const tokens = Lexer.lex(source.replace(/\r\n?/g, '\n'));
  const blocks = [];

  const pushRaw = (raw) => {
    const content = raw.trim();
    if (!content) return;
    const last = blocks.at(-1);
    if (last?.type === 'markdown') last.data.content += `\n\n${content}`;
    else blocks.push({ type: 'markdown', data: { content } });
  };

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    if (token.type === 'space') continue;

    if (token.type === 'html') {
      if (isGeneratedListSeparator(token, blocks.at(-1), tokens.slice(index + 1).find((t) => t.type !== 'space'))) {
        continue;
      }
      const end = findHtmlGroupEnd(tokens, index);
      const raw = tokens.slice(index, end + 1).map((t) => t.raw).join('');
      index = end;
      const block = fromHtml(raw.trim());
      if (block) blocks.push(block);
      else pushRaw(raw);
      continue;
    }

    if (token.type === 'def') {
      const item = fromDefinition(token.raw);
      const last = blocks.at(-1);
      if (item && last?.type === 'references') last.data.items.push(item);
      else if (item) blocks.push({ type: 'references', data: { items: [item] } });
      else pushRaw(token.raw);
      continue;
    }

    const block = fromToken(token);
    if (block) blocks.push(block);
    else pushRaw(token.raw);
  }

  return detectTablesOfContents(blocks);
}

const TOC_LEVELS = [['h2'], ['h2', 'h3'], ['h2', 'h3', 'h4'], ['h3'], ['h3', 'h4']];

/**
 * A list of links to the document's own headings becomes an automatic
 * table of contents, when the generated one is identical to the original.
 */
function detectTablesOfContents(blocks) {
  const toc = getBlockDef('toc');
  let context;

  return blocks.map((block) => {
    if (block.type !== 'details' && block.type !== 'list') return block;
    const original = getBlockDef(block.type).toMarkdown(block.data);
    if (!original.includes('](#')) return block;

    const summary = block.type === 'details' ? block.data.summary.match(/^<b>([^<]+)<\/b>$/) : null;
    if (block.type === 'details' && !summary) return block;
    context ??= createContext(blocks);

    for (const levels of TOC_LEVELS) {
      for (const style of ['numbered', 'bullet']) {
        const data = {
          title: summary ? summary[1] : '',
          collapsible: block.type === 'details',
          style,
          h2: levels.includes('h2'),
          h3: levels.includes('h3'),
          h4: levels.includes('h4'),
          ignore: '',
        };
        if (toc.toMarkdown(data, context) === original) return { type: 'toc', data };
      }
    }
    return block;
  });
}

/**
 * An HTML block ends at the first blank line, so `<div>…</div>` with
 * Markdown inside arrives as several tokens. Join them until the tag closes.
 */
function findHtmlGroupEnd(tokens, start) {
  const match = tokens[start].raw.trim().match(GROUPED_HTML_TAGS);
  if (!match) return start;

  const tag = match[1].toLowerCase();
  const opening = new RegExp(`<${tag}\\b`, 'gi');
  const closing = new RegExp(`</${tag}\\s*>`, 'gi');
  let depth = 0;

  for (let index = start; index < tokens.length; index++) {
    if (tokens[index].type === 'code') continue;
    const raw = tokens[index].raw;
    depth += (raw.match(opening)?.length ?? 0) - (raw.match(closing)?.length ?? 0);
    if (depth <= 0) return index;
  }
  return start;
}

function fromToken(token) {
  switch (token.type) {
    case 'heading':
      return { type: 'heading', data: { text: token.text.trim(), level: String(token.depth), align: 'left' } };
    case 'paragraph':
      return fromParagraph(token.raw.trim());
    case 'blockquote':
      return fromBlockquote(token.raw.trim());
    case 'code':
      return fromCode(token);
    case 'list':
      return fromList(token);
    case 'table':
      return fromTable(token);
    case 'hr':
      return { type: 'divider', data: {} };
    default:
      return null;
  }
}

function fromFootnoteDefinitions(text) {
  const items = [];
  for (const line of text.split('\n')) {
    const match = line.match(FOOTNOTE_LINE);
    if (!match) return null;
    items.push({ id: match[1], text: match[2].trim() });
  }
  const block = { type: 'footnotes', data: { items } };
  return regeneratesAs(block, text) ? block : null;
}

function fromParagraph(text, align = 'left') {
  const footnotes = align === 'left' ? fromFootnoteDefinitions(text) : null;
  if (footnotes) return footnotes;

  const badges = parseMarkdownBadges(text, align);
  if (badges) return badges;

  const image = text.match(MD_IMAGE);
  if (image && image[0].length === text.length && align === 'left') {
    return {
      type: 'image',
      data: {
        url: image[2] ?? image[5],
        alt: image[1] ?? image[4],
        width: '',
        height: '',
        align: 'left',
        link: image[3] ?? '',
        caption: '',
      },
    };
  }

  return { type: 'paragraph', data: { text, align } };
}

const stripQuoteMarkers = (text) =>
  text
    .split('\n')
    .map((line) => line.replace(/^ {0,3}> ?/, ''))
    .join('\n');

function fromBlockquote(raw) {
  const alert = raw.match(/^>\s*\[!(\w+)\]\s*\n([\s\S]+)$/);
  if (alert && ALERT_KINDS.includes(alert[1].toUpperCase())) {
    const text = stripQuoteMarkers(alert[2]).trim();
    return text ? { type: 'alert', data: { kind: alert[1].toUpperCase(), text } } : null;
  }
  const text = stripQuoteMarkers(raw).trim();
  return text ? { type: 'quote', data: { text } } : null;
}

function fromCode(token) {
  const language = (token.lang ?? '').trim();
  const code = token.text;
  if (!code.trim()) return null;

  if (language === 'mermaid' && token.codeBlockStyle !== 'indented') {
    return { type: 'mermaid', data: { code } };
  }

  const lines = code.split('\n');
  const isTerminal =
    token.codeBlockStyle !== 'indented' &&
    SHELL_LANGUAGES.has(language) &&
    lines.every((line) => line.trim() && line === line.trim());

  if (isTerminal) return { type: 'terminal', data: { commands: lines.map((command) => ({ command })) } };
  return { type: 'code', data: { language, code } };
}

function listItemText(item) {
  const content = item.tokens.filter((t) => !['checkbox', 'list', 'space'].includes(t.type));
  if (content.length !== 1 || !['text', 'paragraph'].includes(content[0].type)) return null;
  const text = content[0].raw.trim();
  return text && !text.includes('\n') ? text : null;
}

function collectListLines(list, depth, ordered, lines) {
  for (const item of list.items) {
    const text = listItemText(item);
    if (item.task || text == null) return false;
    lines.push(`${'  '.repeat(depth)}${text}`);

    const nested = item.tokens.filter((t) => t.type === 'list');
    if (nested.length > 1) return false;
    if (nested.length && (nested[0].ordered !== ordered || !collectListLines(nested[0], depth + 1, ordered, lines))) {
      return false;
    }
  }
  return true;
}

function fromList(token) {
  const isChecklist = token.items.every(
    (item) => item.task && !item.tokens.some((t) => t.type === 'list') && listItemText(item) != null,
  );
  if (isChecklist) {
    return {
      type: 'checklist',
      data: { items: token.items.map((item) => ({ done: Boolean(item.checked), text: listItemText(item) })) },
    };
  }

  if (token.ordered && token.start !== 1 && token.start !== '') return null;
  const lines = [];
  if (!collectListLines(token, 0, token.ordered, lines)) return null;
  return { type: 'list', data: { style: token.ordered ? 'numbered' : 'bullet', items: lines.join('\n') } };
}

function fromTable(token) {
  return {
    type: 'table',
    data: {
      table: {
        columns: token.header.map((cell, index) => ({ name: cell.text, align: token.align[index] ?? 'left' })),
        rows: token.rows.map((row) => row.map((cell) => cell.text)),
      },
    },
  };
}

/* HTML blocks */

function fromHtml(raw) {
  return (
    parseDetails(raw) ??
    parseAlignedHeading(raw) ??
    parseThemeImage(raw) ??
    parseHero(raw) ??
    parseHtmlImages(raw) ??
    parseAlignedMarkdown(raw)
  );
}

function parseThemeImage(raw) {
  if (!/<picture\b/i.test(raw)) return null;
  const container = raw.match(ALIGNED_CONTAINER);
  const inner = container ? container[3].trim() : raw;
  const link = inner.match(/^<a\s+href="([^"]*)">/i);
  const srcset = (theme) =>
    inner.match(new RegExp(`<source\\s+media="\\(prefers-color-scheme:\\s*${theme}\\)"\\s+srcset="([^"]*)"`, 'i'))?.[1];
  const imgTag = inner.match(/<img\s[^>]*>/i);
  const img = imgTag ? takeHtmlImage(imgTag[0]) : null;
  if (!img) return null;

  const block = {
    type: 'themeImage',
    data: {
      light: unescapeHtml(srcset('light') ?? ''),
      dark: unescapeHtml(srcset('dark') ?? ''),
      alt: img.image.alt,
      width: img.image.width,
      align: container ? container[2].toLowerCase() : 'left',
      link: link ? unescapeHtml(link[1]) : '',
    },
  };
  return regeneratesAs(block, raw, normalizeHtml) ? block : null;
}

function parseAttributes(source) {
  const attributes = {};
  for (const match of source.matchAll(/([\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
    attributes[match[1].toLowerCase()] = unescapeHtml(match[2] ?? match[3] ?? match[4] ?? '');
  }
  return attributes;
}

/** Reads one `<img>` (optionally wrapped in `<a>`) from the start of `source`. */
function takeHtmlImage(source) {
  const match = source.match(HTML_IMAGE);
  if (!match) return null;

  const link = match[1] ? parseAttributes(match[1]) : {};
  const img = parseAttributes(match[2] ?? match[3]);
  const hasUnsupported =
    Object.keys(img).some((key) => !IMG_ATTRIBUTES.has(key)) ||
    Object.keys(link).some((key) => !LINK_ATTRIBUTES.has(key));
  if (!img.src || hasUnsupported) return null;

  return {
    image: { src: img.src, alt: img.alt ?? '', width: img.width ?? '', height: img.height ?? '', link: link.href ?? '' },
    rest: source.slice(match[0].length).trim(),
  };
}

function parseDetails(raw) {
  const match = raw.match(/^<details(\s+open(?:=["'][^"']*["'])?)?\s*>\s*<summary>([\s\S]*?)<\/summary>([\s\S]*)<\/details>$/i);
  if (!match) return null;
  return { type: 'details', data: { summary: match[2].trim(), content: match[3].trim(), open: Boolean(match[1]) } };
}

function parseAlignedHeading(raw) {
  const match = raw.match(/^<h([1-6])\s+align\s*=\s*["']?(left|center|right)["']?\s*>([^<]*)<\/h\1>$/i);
  if (!match || !match[3].trim()) return null;
  return {
    type: 'heading',
    data: { text: unescapeHtml(match[3].trim()), level: match[1], align: match[2].toLowerCase() },
  };
}

function parseHero(raw) {
  const container = raw.match(ALIGNED_CONTAINER);
  if (!container || container[1].toLowerCase() !== 'div' || container[2].toLowerCase() !== 'center') return null;

  let rest = container[3].trim();
  const logo = takeHtmlImage(rest);
  if (logo) rest = logo.rest;

  const name = rest.match(/^<h1>([^<]+)<\/h1>/i);
  if (!name) return null;
  rest = rest.slice(name[0].length).trim();

  const description = rest.match(/^<p>([^<]*)<\/p>/i);
  if (description) rest = rest.slice(description[0].length).trim();

  if (rest || logo?.image.height) return null;
  return {
    type: 'hero',
    data: {
      logo: logo?.image.src ?? '',
      width: logo?.image.width ?? '',
      name: unescapeHtml(name[1].trim()),
      description: description ? unescapeHtml(description[1].trim()) : '',
      link: logo?.image.link ?? '',
    },
  };
}

function parseHtmlImages(raw) {
  const container = raw.match(ALIGNED_CONTAINER);
  const align = container ? container[2].toLowerCase() : 'left';
  let rest = container ? container[3].trim() : raw;

  const images = [];
  let taken;
  while ((taken = takeHtmlImage(rest))) {
    images.push(taken.image);
    rest = taken.rest;
  }
  if (!images.length) return null;

  const badges = images.map((image) => {
    const badge = parseBadgeUrl(image.src);
    return badge && { ...badge, link: image.link };
  });
  if (!rest && badges.every(Boolean)) return toBadgesBlock(badges, align);

  if (images.length !== 1) return null;
  const caption = rest.match(/^<br\s*\/?>\s*<sub>([^<]*)<\/sub>$/i);
  if (rest && !caption) return null;

  const [image] = images;
  return {
    type: 'image',
    data: {
      url: image.src,
      alt: image.alt,
      width: image.width,
      height: image.height,
      align,
      link: image.link,
      caption: caption ? unescapeHtml(caption[1].trim()) : '',
    },
  };
}

function parseAlignedMarkdown(raw) {
  const container = raw.match(ALIGNED_CONTAINER);
  if (!container || container[1].toLowerCase() !== 'div') return null;

  const inner = container[3].trim();
  if (!inner || /<[a-z/!]/i.test(inner)) return null;

  const tokens = Lexer.lex(inner).filter((token) => token.type !== 'space');
  if (tokens.length !== 1 || tokens[0].type !== 'paragraph') return null;
  return fromParagraph(tokens[0].raw.trim(), container[2].toLowerCase());
}

/* Badges */

function decodeShieldsText(text) {
  return text.replace(/__/g, '\u0000').replace(/_/g, ' ').replace(/\u0000/g, '_');
}

/** Parses static shields.io badges: img.shields.io/badge/<label>-<message>-<color>. */
export function parseBadgeUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.hostname !== 'img.shields.io' || !parsed.pathname.startsWith('/badge/')) return null;
  if ([...parsed.searchParams.keys()].some((key) => !['style', 'logo', 'logoColor'].includes(key))) return null;

  let path;
  try {
    path = decodeURIComponent(parsed.pathname.slice('/badge/'.length)).replace(/\.(svg|png)$/i, '');
  } catch {
    return null;
  }

  const parts = path
    .replace(/--/g, '\u0000')
    .split('-')
    .map((part) => decodeShieldsText(part.replace(/\u0000/g, '-')));
  if (parts.length < 2 || parts.length > 3 || parts.some((part) => !part)) return null;

  const [label, message, color] = parts.length === 3 ? parts : ['', ...parts];
  return {
    label,
    message,
    color,
    logo: parsed.searchParams.get('logo') ?? '',
    logoColor: parsed.searchParams.get('logoColor') ?? '',
    style: parsed.searchParams.get('style') ?? 'flat',
  };
}

function parseMarkdownBadges(text, align) {
  const badges = [];
  let rest = text;
  while (rest) {
    const match = rest.match(MD_IMAGE);
    if (!match) return null;
    const badge = parseBadgeUrl(match[2] ?? match[5]);
    if (!badge) return null;
    badges.push({ ...badge, link: match[3] ?? '' });
    rest = rest.slice(match[0].length).trimStart();
  }
  return toBadgesBlock(badges, align);
}

function toBadgesBlock(badges, align) {
  if (!badges.length) return null;
  const { style } = badges[0];
  if (!BADGE_STYLES.includes(style) || badges.some((badge) => badge.style !== style)) return null;
  return {
    type: 'badges',
    data: { style, align, items: badges.map(({ style: _style, ...item }) => item) },
  };
}
