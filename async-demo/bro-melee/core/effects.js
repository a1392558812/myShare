/**
 * 特效层：飘字、粒子、刀光、冲击波、落雷
 * 纯数据对象，绘制在 draw/renderer.js 中完成
 */

const MAX_EFFECTS = 520;

export class EffectLayer {
  constructor() {
    this.effects = [];
  }

  /** 清空全部特效（重开一局） */
  clear() {
    this.effects.length = 0;
  }

  /** 内部：容量保护，避免极端情况下无上限增长 */
  pushEffect(effect) {
    if (this.effects.length >= MAX_EFFECTS) {
      this.effects.shift();
    }
    this.effects.push(effect);
  }

  /**
   * 伤害飘字
   * @param {Number} x 世界坐标
   * @param {Number} y 世界坐标
   * @param {String} text 文本
   * @param {Object} options { color, size, isCrit, isHeal }
   */
  addText(x, y, text, options = {}) {
    this.pushEffect({
      kind: 'text',
      x,
      y,
      vx: (Math.random() - 0.5) * 26,
      vy: -58,
      life: 0.85,
      maxLife: 0.85,
      text,
      color: options.color || '#ffe9c9',
      size: options.size || 15,
      isCrit: Boolean(options.isCrit),
    });
  }

  /**
   * 粒子爆发
   * @param {Number} x 世界坐标
   * @param {Number} y 世界坐标
   * @param {Object} options { count, color, speed, size, life, spread }
   */
  addParticles(x, y, options = {}) {
    const count = options.count || 8;
    const baseSpeed = options.speed || 150;
    const spread = options.spread || Math.PI * 2;
    const baseAngle = options.angle === undefined ? 0 : options.angle;
    for (let index = 0; index < count; index++) {
      const angle = baseAngle + (Math.random() - 0.5) * spread;
      const speed = baseSpeed * (0.4 + Math.random() * 0.9);
      const life = (options.life || 0.5) * (0.6 + Math.random() * 0.7);
      this.pushEffect({
        kind: 'particle',
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        size: (options.size || 3) * (0.6 + Math.random() * 0.8),
        color: options.color || '#ffd166',
      });
    }
  }

  /**
   * 刀光扇形
   * @param {Number} x 世界坐标
   * @param {Number} y 世界坐标
   * @param {Number} angle 朝向
   * @param {Number} arc 扇形张开角
   * @param {Number} radius 半径
   * @param {String} color 颜色
   */
  addSwing(x, y, angle, arc, radius, color) {
    this.pushEffect({
      kind: 'swing',
      x,
      y,
      angle,
      arc,
      radius,
      color,
      life: 0.22,
      maxLife: 0.22,
    });
  }

  /**
   * 扩散圆环（范围技能 / 死亡冲击）
   * @param {Number} x 世界坐标
   * @param {Number} y 世界坐标
   * @param {Number} radius 最大半径
   * @param {String} color 颜色
   * @param {Object} options { life, lineWidth }
   */
  addRing(x, y, radius, color, options = {}) {
    const life = options.life || 0.4;
    this.pushEffect({
      kind: 'ring',
      x,
      y,
      radius,
      color,
      lineWidth: options.lineWidth || 3,
      life,
      maxLife: life,
    });
  }

  /**
   * 落雷
   * @param {Number} x 世界坐标
   * @param {Number} y 世界坐标
   * @param {Number} radius 影响半径
   * @param {String} color 颜色
   */
  addBolt(x, y, radius, color) {
    this.pushEffect({
      kind: 'bolt',
      x,
      y,
      radius,
      color,
      life: 0.34,
      maxLife: 0.34,
      seed: Math.random() * 1000,
    });
  }

  /**
   * 升级光环
   * @param {Number} x 世界坐标
   * @param {Number} y 世界坐标
   * @param {Number} radius 基础半径
   */
  addLevelUp(x, y, radius) {
    this.pushEffect({
      kind: 'levelUp',
      x,
      y,
      radius,
      color: '#ffd166',
      life: 0.8,
      maxLife: 0.8,
    });
  }

  /**
   * 冲刺残影
   * @param {Number} x 世界坐标
   * @param {Number} y 世界坐标
   * @param {Number} radius 半径
   * @param {String} color 颜色
   */
  addTrail(x, y, radius, color) {
    this.pushEffect({
      kind: 'trail',
      x,
      y,
      radius,
      color,
      life: 0.28,
      maxLife: 0.28,
    });
  }

  /**
   * 折线闪电（连锁弹射 / 射线类技能）
   * @param {Number} x1 起点
   * @param {Number} y1 起点
   * @param {Number} x2 终点
   * @param {Number} y2 终点
   * @param {String} color 颜色
   * @param {Object} options { life, lineWidth }
   */
  addArc(x1, y1, x2, y2, color, options = {}) {
    const life = options.life || 0.22;
    this.pushEffect({
      kind: 'arc',
      x: x1,
      y: y1,
      x2,
      y2,
      color,
      lineWidth: options.lineWidth || 3,
      life,
      maxLife: life,
      seed: Math.random() * 1000,
    });
  }

  /**
   * 逐帧推进特效生命周期
   * @param {Number} deltaTime 帧间隔（秒）
   */
  update(deltaTime) {
    const list = this.effects;
    for (let index = list.length - 1; index >= 0; index--) {
      const effect = list[index];
      effect.life -= deltaTime;
      if (effect.life <= 0) {
        list.splice(index, 1);
        continue;
      }
      if (effect.kind === 'text') {
        effect.x += effect.vx * deltaTime;
        effect.y += effect.vy * deltaTime;
        effect.vy += 92 * deltaTime;
      } else if (effect.kind === 'particle') {
        effect.x += effect.vx * deltaTime;
        effect.y += effect.vy * deltaTime;
        effect.vx *= 1 - 3.4 * deltaTime;
        effect.vy *= 1 - 3.4 * deltaTime;
      }
    }
  }
}
