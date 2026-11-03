/**
 * 地面持续伤害区（火莲业火 / 万毒瘴）
 * 只保存区域数据并周期性结算，绘制在 draw/renderer.js
 */

import { areaDamage } from './combat.js';

export class ZoneLayer {
  constructor() {
    this.zones = [];
  }

  /** 清空全部区域（重开一局） */
  clear() {
    this.zones.length = 0;
  }

  /**
   * 新增一片区域
   * @param {Object} zone { x, y, radius, life, tickInterval, multiplier, color, style, owner, follow }
   */
  add(zone) {
    this.zones.push({
      x: zone.x,
      y: zone.y,
      radius: zone.radius,
      life: zone.life,
      maxLife: zone.life,
      tickInterval: zone.tickInterval || 0.5,
      tickTimer: 0.06,
      multiplier: zone.multiplier === undefined ? 0.5 : zone.multiplier,
      color: zone.color || '#ff8a3d',
      style: zone.style || 'flame',
      owner: zone.owner || null,
      follow: zone.follow || null,
      seed: Math.random() * Math.PI * 2,
    });
  }

  /**
   * 推进区域生命周期并结算伤害
   * @param {Object} world 世界实例
   * @param {Number} deltaTime 帧间隔
   */
  update(world, deltaTime) {
    for (let index = this.zones.length - 1; index >= 0; index--) {
      const zone = this.zones[index];
      zone.life -= deltaTime;
      if (zone.follow) {
        zone.x = zone.follow.x;
        zone.y = zone.follow.y;
      }
      zone.tickTimer -= deltaTime;
      if (zone.tickTimer <= 0) {
        zone.tickTimer += zone.tickInterval;
        const owner = zone.owner && zone.owner.alive ? zone.owner : null;
        if (owner) {
          areaDamage(world, owner, zone.x, zone.y, zone.radius, {
            multiplier: zone.multiplier,
            knockback: 0,
            color: zone.color,
            particleColor: zone.color,
          });
        }
      }
      if (zone.life <= 0) {
        this.zones.splice(index, 1);
      }
    }
  }
}
