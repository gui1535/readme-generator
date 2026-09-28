import { Lexer } from 'marked';
import { getBlockDef } from '../blocks/registry.js';
import { blockToMarkdown, createContext } from './generate.js';
import { GITHUB_ATTRIBUTES, GITHUB_TAGS } from './github-html.js';
import { inlineText } from './outline.js';

const CODE_BLOCKS = new Set(['code', 'terminal', 'mermaid']);
const VAGUE_LINK_TEXT = /^(clique aqui|clique|aqui|veja aqui|saiba mais|link|click here|here|this|read more|more)$/i;
const ABSOLUTE_URL = /^([a-z][a-z\d+.-]*:|\/\/)/i;
const HTML_TAG = /<([a-zA-Z][\w-]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*\/?>/g;
const HTML_ATTRIBUTE = /([^\s=>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
const EXPLICIT_ANCHOR = /\s(?:id|name)\s*=\s*["']?([^"'\s>]+)/gi;
const FOOTNOTE_DEFINITION = /^\[\^([^\]\s]+)\]:/gm;
const REFERENCE_DEFINITION = /^ {0,3}\[([^\]^][^\]]*)\]:\s*\S/gm;
const FOOTNOTE_REFERENCE = /\[\^([^\]\s]+)\](?!:)/g;
const REFERENCE_LINK = /\[([^\]]+)\]\[([^\]]*)\]/g;

export const CHECKS = [
  { category: 'Links', label: 'Links internos apontam para títulos existentes' },
  { category: 'Compatibilidade', label: 'Nenhum HTML será removido pelo GitHub' },
  { category: 'Acessibilidade', label: 'Imagens com texto alternativo e links descritivos' },
  { category: 'Títulos', label: 'Hierarquia de títulos sem pulos' },
  { category: 'Notas', label: 'Notas de rodapé com texto definido' },
  { category: 'Estrutura', label: 'Nenhum bloco vazio' },
];

const LEVEL_ORDER = { error: 0, warning: 1, info: 2 };
const normalizeLabel = (label) => label.trim().toLowerCase().replace(/\s+/g, ' ');
const shorten = (text, size = 60) => (text.length > size ? `${text.slice(0, size)}…` : text);

function walk(tokens, visit) {
  for (const token of tokens ?? []) {
    visit(token);
    if (token.tokens) walk(token.tokens, visit);
    if (token.items) walk(token.items, visit);
    if (token.type === 'table') {
      token.header.forEach((cell) => walk(cell.tokens, visit));
      token.rows.forEach((row) => row.forEach((cell) => walk(cell.tokens, visit)));
    }
  }
}

/**
 * Analyses the README as GitHub will see it.
 * Returns issues (error / warning / info), each linked to the block that caused it.
 */
export function checkReadme(blocks) {
  const context = createContext(blocks);
  const visible = blocks
    .filter((block) => !block.hidden)
    .map((block) => ({ block, markdown: blockToMarkdown(block, context) }));

  const issues = [];
  const seen = new Set();
  const add = (level, category, message, blockId) => {
    const key = `${blockId}|${message}`;
    if (seen.has(key)) return;
    seen.add(key);
    issues.push({ level, category, message, blockId });
  };

  const fullMarkdown = visible.map((item) => item.markdown).join('\n\n');
  const referenceDefinitions = Lexer.lex(fullMarkdown).links;
  const anchors = new Set(context.headings.map((heading) => heading.slug));
  for (const match of fullMarkdown.matchAll(EXPLICIT_ANCHOR)) anchors.add(match[1].toLowerCase());

  const footnoteDefinitions = new Set();
  const footnoteReferences = new Map();
  const referenceIds = new Set();
  for (const { block, markdown } of visible) {
    if (CODE_BLOCKS.has(block.type)) continue;
    for (const match of markdown.matchAll(FOOTNOTE_DEFINITION)) {
      if (footnoteDefinitions.has(match[1])) {
        add('warning', 'Notas', `A nota [^${match[1]}] está definida mais de uma vez; o GitHub usa só a primeira.`, block.id);
      }
      footnoteDefinitions.add(match[1]);
    }
    for (const match of markdown.matchAll(REFERENCE_DEFINITION)) {
      const id = normalizeLabel(match[1]);
      if (referenceIds.has(id)) {
        add('warning', 'Links', `A referência [${match[1]}] está definida mais de uma vez; o GitHub usa só a primeira.`, block.id);
      }
      referenceIds.add(id);
    }
  }

  const checkLink = (href, text, blockId) => {
    if (!href?.trim()) {
      add('error', 'Links', `Link${text ? ` "${text}"` : ''} sem endereço.`, blockId);
      return;
    }
    if (href.startsWith('#')) {
      let id = href.slice(1);
      try {
        id = decodeURIComponent(id);
      } catch {
        // Keeps the raw anchor when it is not valid URI encoding.
      }
      if (!anchors.has(id.toLowerCase())) add('error', 'Links', `O link ${href} não aponta para nenhum título.`, blockId);
    } else if (!ABSOLUTE_URL.test(href)) {
      add('info', 'Links', `Link relativo "${shorten(href)}": confirme que o arquivo existe no repositório.`, blockId);
    }
    if (text && VAGUE_LINK_TEXT.test(text.trim())) {
      add('warning', 'Acessibilidade', `Texto de link pouco descritivo: "${text.trim()}". Diga para onde o link leva.`, blockId);
    }
  };

  const checkHtml = (raw, blockId) => {
    for (const match of raw.matchAll(HTML_TAG)) {
      const tag = match[1].toLowerCase();
      if (!GITHUB_TAGS.has(tag)) add('warning', 'Compatibilidade', `<${tag}> é removido pelo GitHub.`, blockId);

      const attributes = {};
      for (const attribute of match[2].matchAll(HTML_ATTRIBUTE)) {
        const name = attribute[1].toLowerCase();
        attributes[name] = attribute[2] ?? attribute[3] ?? attribute[4] ?? '';
        if (!GITHUB_ATTRIBUTES.has(name)) {
          add('warning', 'Compatibilidade', `O atributo ${name} em <${tag}> é removido pelo GitHub.`, blockId);
        }
      }
      if (tag === 'img' && !attributes.alt?.trim()) {
        add('warning', 'Acessibilidade', `Imagem sem texto alternativo (${shorten(attributes.src ?? '')}).`, blockId);
      }
      if (tag === 'a' && 'href' in attributes) checkLink(attributes.href, null, blockId);
    }
  };

  for (const { block, markdown } of visible) {
    const label = getBlockDef(block.type)?.label ?? block.type;
    if (!markdown.trim()) {
      add('info', 'Estrutura', `Bloco ${label} vazio: não aparece no README.`, block.id);
      continue;
    }

    const lexer = new Lexer();
    Object.assign(lexer.tokens.links, referenceDefinitions);

    walk(lexer.lex(markdown), (token) => {
      if (token.type === 'link') checkLink(token.href, inlineText(token.tokens), block.id);
      if (token.type === 'image' && !token.text.trim()) {
        add('warning', 'Acessibilidade', `Imagem sem texto alternativo (${shorten(token.href)}).`, block.id);
      }
      if (token.type === 'html') checkHtml(token.raw, block.id);
      if (token.type === 'text' && !token.tokens) {
        for (const match of token.raw.matchAll(REFERENCE_LINK)) {
          const reference = match[2] || match[1];
          if (!(normalizeLabel(reference) in referenceDefinitions)) {
            add('warning', 'Links', `O link de referência [${reference}] não tem URL definida.`, block.id);
          }
        }
        for (const match of token.raw.matchAll(FOOTNOTE_REFERENCE)) {
          if (!footnoteReferences.has(match[1])) footnoteReferences.set(match[1], block.id);
        }
      }
    });
  }

  for (const [id, blockId] of footnoteReferences) {
    if (!footnoteDefinitions.has(id)) add('error', 'Notas', `A nota [^${id}] não tem texto definido.`, blockId);
  }

  let previousLevel = null;
  let h1Count = 0;
  for (const heading of context.headings) {
    if (heading.level === 1) h1Count++;
    if (previousLevel !== null && heading.level > previousLevel + 1) {
      add('warning', 'Títulos', `Pulo de nível: H${previousLevel} → H${heading.level} em "${heading.text}".`, heading.blockId);
    }
    if (/-\d+$/.test(heading.slug) && anchors.has(heading.slug.replace(/-\d+$/, ''))) {
      add('info', 'Títulos', `"${heading.text}" repete outro título; a âncora dele será #${heading.slug}.`, heading.blockId);
    }
    previousLevel = heading.level;
  }
  if (h1Count > 1) add('info', 'Títulos', `O README tem ${h1Count} títulos H1; o comum é ter apenas um.`);
  if (!context.headings.length && visible.length) add('info', 'Títulos', 'O README não tem títulos de seção.');

  issues.sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);
  const passed = CHECKS.filter(
    (check) => !issues.some((issue) => issue.category === check.category && issue.level !== 'info'),
  );
  return { issues, passed };
}

export function countProblems(result) {
  return {
    errors: result.issues.filter((issue) => issue.level === 'error').length,
    warnings: result.issues.filter((issue) => issue.level === 'warning').length,
  };
}
