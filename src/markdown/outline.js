import { Lexer } from 'marked';
import { getBlockDef } from '../blocks/registry.js';
import { unescapeHtml } from '../utils.js';
import { createSlugger } from './slug.js';

const HTML_HEADING = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1\s*>/gi;

/** Visible text of inline tokens, which is what GitHub uses for anchors. */
export function inlineText(tokens = []) {
  return tokens
    .map((token) => {
      if (token.type === 'html' || token.type === 'image') return '';
      if (token.tokens) return inlineText(token.tokens);
      return token.type === 'escape' ? token.text : unescapeHtml(token.text ?? '');
    })
    .join('');
}

const stripTags = (html) => unescapeHtml(html.replace(/<[^>]*>/g, ''));

function headingsFromTokens(tokens, found) {
  for (const token of tokens) {
    if (token.type === 'heading') {
      found.push({ level: token.depth, text: inlineText(token.tokens).trim() });
    } else if (token.type === 'html') {
      for (const match of token.raw.matchAll(HTML_HEADING)) {
        found.push({ level: Number(match[1]), text: stripTags(match[2]).trim() });
      }
    } else if (token.type === 'blockquote' || token.type === 'list_item') {
      headingsFromTokens(token.tokens ?? [], found);
    } else if (token.type === 'list') {
      headingsFromTokens(token.items, found);
    }
  }
  return found;
}

/**
 * Every heading of the document, in order, with the anchor GitHub will
 * generate for it. Blocks that depend on the outline (such as the table of
 * contents) are skipped so they never include themselves.
 */
export function collectHeadings(blocks) {
  const slug = createSlugger();
  const headings = [];

  for (const block of blocks) {
    const def = getBlockDef(block.type);
    if (block.hidden || !def || def.usesOutline) continue;
    const markdown = def.toMarkdown(block.data);
    if (!markdown.trim()) continue;

    for (const heading of headingsFromTokens(Lexer.lex(markdown), [])) {
      headings.push({ ...heading, blockId: block.id, slug: slug(heading.text) });
    }
  }
  return headings;
}
