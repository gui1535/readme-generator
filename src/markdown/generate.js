import { getBlockDef } from '../blocks/registry.js';
import { collectHeadings } from './outline.js';

/** Shared data some blocks need about the whole document (e.g. the table of contents). */
export function createContext(blocks) {
  let headings;
  return {
    blocks,
    get headings() {
      headings ??= collectHeadings(blocks);
      return headings;
    },
  };
}

export function blockToMarkdown(block, context = createContext([block])) {
  return getBlockDef(block.type)?.toMarkdown(block.data, context) ?? '';
}

/** Keeps two adjacent lists apart; without it GitHub renders them as a single list. */
export const LIST_SEPARATOR = '<!-- -->';

function listKind(line) {
  const match = line?.match(/^(?:([-*+])|\d+([.)]))[ \t]/);
  return match ? (match[1] ?? `ordered${match[2]}`) : null;
}

export function needsListSeparator(previous, next) {
  const lines = previous.trimEnd().split('\n');
  if (!/^ *(?:[-*+]|\d+[.)])[ \t]/.test(lines.at(-1))) return false;
  const kind = listKind(lines.findLast((line) => listKind(line)));
  return kind !== null && kind === listKind(next.trimStart().split('\n')[0]);
}

export function generateMarkdown(blocks) {
  const context = createContext(blocks);
  const sections = blocks
    .filter((block) => !block.hidden)
    .map((block) => blockToMarkdown(block, context))
    .filter((markdown) => markdown.trim());
  if (!sections.length) return '';
  const output = sections.reduce((text, section, index) => {
    if (index === 0) return section;
    const separator = needsListSeparator(sections[index - 1], section) ? `\n\n${LIST_SEPARATOR}\n\n` : '\n\n';
    return text + separator + section;
  });
  return `${output}\n`;
}
