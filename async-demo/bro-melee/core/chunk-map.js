/**
 * 无限地图分块与装饰生成（README §3）
 * 分块内容由坐标确定性生成，渲染层据此缓存背景位图
 */

import { WORLD_CONFIG } from '../constants.js';
import { createSeededRandom } from './utils.js';

const DECORATION_KINDS = ['grass', 'grass', 'grass', 'grass', 'rock', 'crack', 'flower', 'pebble'];

/**
 * 生成单个分块的装饰数据
 * @param {Number} chunkX 分块列
 * @param {Number} chunkY 分块行
 * @returns {Object} 分块数据
 */
const generateChunk = (chunkX, chunkY) => {
  const seed = (chunkX * 73856093) ^ (chunkY * 19349663) ^ WORLD_CONFIG.MAP_SEED;
  const random = createSeededRandom(seed);
  const size = WORLD_CONFIG.CHUNK_SIZE;
  const decorations = [];
  const patchCount = random() > 0.55 ? 1 + Math.floor(random() * 2) : 0;
  for (let index = 0; index < patchCount; index++) {
    decorations.push({
      kind: 'patch',
      x: random() * size,
      y: random() * size,
      size: 70 + random() * 150,
      rotation: random() * Math.PI,
      alpha: 0.5 + random() * 0.5,
    });
  }
  const total = 22 + Math.floor(random() * 12);
  for (let index = 0; index < total; index++) {
    decorations.push({
      kind: DECORATION_KINDS[Math.floor(random() * DECORATION_KINDS.length)],
      x: random() * size,
      y: random() * size,
      size: 5 + random() * 13,
      rotation: random() * Math.PI * 2,
      alpha: 0.35 + random() * 0.5,
    });
  }
  return {
    key: `${chunkX},${chunkY}`,
    chunkX,
    chunkY,
    decorations,
  };
};

export class ChunkMap {
  constructor() {
    this.cache = new Map();
  }

  /**
   * 取分块数据（惰性生成 + 超量回收）
   * @param {Number} chunkX 分块列
   * @param {Number} chunkY 分块行
   * @returns {Object} 分块数据
   */
  getChunk(chunkX, chunkY) {
    const key = `${chunkX},${chunkY}`;
    const cached = this.cache.get(key);
    if (cached) {
      return cached;
    }
    const chunk = generateChunk(chunkX, chunkY);
    this.cache.set(key, chunk);
    if (this.cache.size > WORLD_CONFIG.ACTIVE_CHUNK_RADIUS * WORLD_CONFIG.ACTIVE_CHUNK_RADIUS * 16) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    return chunk;
  }

  /** 清空全部分块缓存 */
  clear() {
    this.cache.clear();
  }
}
