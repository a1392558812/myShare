/**
 * 空间哈希：把「附近有哪些实体」从 O(n) 降到 O(邻居)
 */

export class SpatialHash {
  /**
   * @param {Number} cellSize 网格边长（px）
   */
  constructor(cellSize = 128) {
    this.cellSize = cellSize;
    this.cells = new Map();
  }

  /** 清空网格（每帧重建前调用） */
  clear() {
    this.cells.clear();
  }

  /**
   * 插入实体（会占满其包围盒覆盖的所有格子）
   * @param {Object} entity 需具备 x / y / radius
   */
  insert(entity) {
    if (!entity || !entity.alive) {
      return;
    }
    const size = this.cellSize;
    const minCellX = Math.floor((entity.x - entity.radius) / size);
    const maxCellX = Math.floor((entity.x + entity.radius) / size);
    const minCellY = Math.floor((entity.y - entity.radius) / size);
    const maxCellY = Math.floor((entity.y + entity.radius) / size);
    for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
      for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
        const key = `${cellX},${cellY}`;
        let bucket = this.cells.get(key);
        if (!bucket) {
          bucket = new Set();
          this.cells.set(key, bucket);
        }
        bucket.add(entity);
      }
    }
  }

  /**
   * 全量重建（实体数量不大时最省心，避免移动后漏删）
   * @param {Array} entities 全部参与查询的实体
   */
  rebuild(entities) {
    this.clear();
    for (let index = 0; index < entities.length; index++) {
      this.insert(entities[index]);
    }
  }

  /**
   * 查询圆形范围内的实体（返回去重数组，粗筛不做精确距离判断）
   * @param {Number} x 中心点
   * @param {Number} y 中心点
   * @param {Number} radius 半径
   * @returns {Array} 候选实体
   */
  query(x, y, radius) {
    const size = this.cellSize;
    const minCellX = Math.floor((x - radius) / size);
    const maxCellX = Math.floor((x + radius) / size);
    const minCellY = Math.floor((y - radius) / size);
    const maxCellY = Math.floor((y + radius) / size);
    const result = new Set();
    for (let cellX = minCellX; cellX <= maxCellX; cellX++) {
      for (let cellY = minCellY; cellY <= maxCellY; cellY++) {
        const bucket = this.cells.get(`${cellX},${cellY}`);
        if (!bucket) {
          continue;
        }
        for (const entity of bucket) {
          result.add(entity);
        }
      }
    }
    return [...result];
  }
}
