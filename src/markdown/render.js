import { Marked } from 'marked';
import markedAlert from 'marked-alert';
import markedFootnote from 'marked-footnote';
import DOMPurify from 'dompurify';
import { escapeHtml } from '../utils.js';
import { getEmoji } from './emoji.js';
import { GITHUB_ATTRIBUTES, GITHUB_TAGS } from './github-html.js';

const EMOJI_CODE = /:[a-z0-9_+-]+:/;

const emojiExtension = {
  name: 'emoji',
  level: 'inline',
  start: (src) => src.match(EMOJI_CODE)?.index,
  tokenizer(src) {
    const match = /^:([a-z0-9_+-]+):/.exec(src);
    const emoji = match && getEmoji(match[1]);
    if (emoji) return { type: 'emoji', raw: match[0], emoji };
    return undefined;
  },
  renderer: (token) => token.emoji,
};

/* GitHub math: $…$ and $`…`$ inline, $$…$$ in its own block. */
const mathBlockExtension = {
  name: 'mathBlock',
  level: 'block',
  start: (src) => src.match(/^ {0,3}\$\$/m)?.index,
  tokenizer(src) {
    const match = /^ {0,3}\$\$([\s\S]+?)\$\$[ \t]*(?:\n+|$)/.exec(src);
    if (match) return { type: 'mathBlock', raw: match[0], text: match[1].trim() };
    return undefined;
  },
  renderer: (token) => `<div class="math-display">${escapeHtml(token.text)}</div>\n`,
};

const mathInlineExtension = {
  name: 'mathInline',
  level: 'inline',
  start: (src) => src.match(/(?<!\\)\$/)?.index,
  tokenizer(src) {
    const match = /^\$`([^`]+)`\$/.exec(src) ?? /^\$(?![\s$])((?:\\.|[^\\$\n])+?)(?<!\s)\$(?!\d)/.exec(src);
    if (match) return { type: 'mathInline', raw: match[0], text: match[1] };
    return undefined;
  },
  renderer: (token) => `<span class="math-inline">${escapeHtml(token.text)}</span>`,
};

const marked = new Marked({ gfm: true })
  .use(markedAlert())
  .use(markedFootnote())
  .use({ extensions: [emojiExtension, mathBlockExtension, mathInlineExtension] });

/* Classes produced by the renderers above. User-written classes are removed, as on GitHub. */
const RENDERER_CLASS =
  /^(markdown-alert(-[\w-]+)?|octicon(-[\w-]+)?|mr-2|footnotes|sr-only|language-[\w+#.-]+|math-(inline|display))$/;

/* Own instance: Mermaid uses the shared one and needs its classes intact. */
const purifier = DOMPurify(window);

purifier.addHook('uponSanitizeAttribute', (_node, data) => {
  if (data.attrName !== 'class') return;
  const kept = data.attrValue.split(/\s+/).filter((name) => RENDERER_CLASS.test(name));
  if (kept.length) data.attrValue = kept.join(' ');
  else data.keepAttr = false;
});

const PURIFY_CONFIG = {
  ALLOWED_TAGS: [...GITHUB_TAGS, 'input', 'section', 'svg', 'path'],
  ALLOWED_ATTR: [
    ...GITHUB_ATTRIBUTES,
    'class',
    'checked',
    'disabled',
    'viewBox',
    'd',
    'data-footnote-ref',
    'data-footnote-backref',
    'data-footnotes',
  ],
  ALLOW_DATA_ATTR: false,
};

/** Markdown → HTML with only what GitHub keeps. */
export function renderMarkdown(markdown) {
  return purifier.sanitize(marked.parse(markdown), PURIFY_CONFIG);
}
