import { createBlock, getBlockDef } from '../blocks/registry.js';
import { createStarterBlocks } from '../templates/starter.js';
import { uid } from '../utils.js';

const STORAGE_KEY = 'readme-builder:project';
const STORAGE_VERSION = 1;

/**
 * Listeners receive the kind of change:
 * - 'structure': blocks were added, removed, moved, hidden or collapsed.
 * - 'content': only the data of a block changed (typing in a field).
 */
const listeners = new Set();

const saved = load();
let blocks = saved?.blocks ?? createStarterBlocks();

/** Where relative image paths point to, e.g. the repository a README was imported from. */
let assetBase = saved?.assetBase ?? null;

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(saved?.blocks)) return null;
    return {
      blocks: saved.blocks
        .filter((block) => getBlockDef(block.type))
        .map((block) => ({ ...block, data: { ...getBlockDef(block.type).defaults(), ...block.data } })),
      assetBase: saved.assetBase ?? null,
    };
  } catch {
    return null;
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, blocks, assetBase }));
  } catch {
    // Storage can be unavailable (private mode, quota exceeded); the app keeps working in memory.
  }
}

function commit(kind) {
  save();
  listeners.forEach((listener) => listener(kind));
}

function patchBlock(id, patch) {
  blocks = blocks.map((block) => (block.id === id ? { ...block, ...patch } : block));
  commit('structure');
}

const findBlock = (id) => blocks.find((block) => block.id === id);

export const getBlocks = () => blocks;

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function addBlock(type, index = blocks.length) {
  const block = createBlock(type);
  blocks = [...blocks.slice(0, index), block, ...blocks.slice(index)];
  commit('structure');
  return block.id;
}

export function updateBlockData(id, data) {
  blocks = blocks.map((block) => (block.id === id ? { ...block, data: structuredClone(data) } : block));
  commit('content');
}

/** Changes data from outside the block's own form, so the editor re-renders it. */
export function replaceBlockData(id, data) {
  blocks = blocks.map((block) => (block.id === id ? { ...block, data: structuredClone(data) } : block));
  commit('structure');
}

export function removeBlock(id) {
  blocks = blocks.filter((block) => block.id !== id);
  commit('structure');
}

export function duplicateBlock(id) {
  const index = blocks.findIndex((block) => block.id === id);
  if (index === -1) return;
  const copy = { ...structuredClone(blocks[index]), id: uid() };
  blocks = [...blocks.slice(0, index + 1), copy, ...blocks.slice(index + 1)];
  commit('structure');
}

/** `toIndex` is an insertion position in the current list (0..length). */
export function moveBlock(id, toIndex) {
  const from = blocks.findIndex((block) => block.id === id);
  if (from === -1) return;
  const target = from < toIndex ? toIndex - 1 : toIndex;
  if (target === from) return;
  const next = [...blocks];
  const [block] = next.splice(from, 1);
  next.splice(target, 0, block);
  blocks = next;
  commit('structure');
}

export const toggleHidden = (id) => patchBlock(id, { hidden: !findBlock(id).hidden });

export const toggleCollapsed = (id) => patchBlock(id, { collapsed: !findBlock(id).collapsed });

export function setBlocks(next) {
  blocks = next;
  commit('structure');
}

export const getAssetBase = () => assetBase;

export function setAssetBase(next) {
  assetBase = next;
  commit('content');
}
