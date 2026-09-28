import { uid } from '../utils.js';
import { badges, hero, image, themeImage } from './media.js';
import { alert, footnotes, heading, markdown, paragraph, quote, references } from './text.js';
import { code, mermaid, terminal } from './code.js';
import { checklist, details, divider, list, table, toc } from './structure.js';

export const BLOCKS = [
  hero,
  badges,
  image,
  themeImage,
  heading,
  paragraph,
  quote,
  alert,
  references,
  footnotes,
  markdown,
  code,
  terminal,
  mermaid,
  toc,
  list,
  checklist,
  table,
  details,
  divider,
];

export const CATEGORIES = [...new Set(BLOCKS.map((block) => block.category))];

const blocksByType = new Map(BLOCKS.map((block) => [block.type, block]));

export const getBlockDef = (type) => blocksByType.get(type);

export function createBlock(type, overrides = {}) {
  return {
    id: uid(),
    type,
    hidden: false,
    collapsed: false,
    data: { ...getBlockDef(type).defaults(), ...overrides },
  };
}
