/**
 * 帧率管理器
 * 用于管理游戏循环动画
 */
export class FrameRateManager {
  constructor() {
    this.animationId = null;
    this.lastTime = 0;
    this.fps = 60; // 默认帧率
    this.frameInterval = 1000 / this.fps;
    this.isRunning = false;
    this.callbacks = [];
  }

  /**
   * 设置目标帧率
   * @param {number} fps 帧率
   */
  setFPS(fps) {
    this.fps = fps;
    this.frameInterval = 1000 / fps;
  }

  /**
   * 获取当前帧率
   * @returns {number}
   */
  getFPS() {
    return this.fps;
  }

  /**
   * 注册绘制回调函数
   * @param {Function} callback 回调函数，接收 deltaTime 参数
   */
  register(callback) {
    if (typeof callback === "function" && !this.callbacks.includes(callback)) {
      this.callbacks.push(callback);
    }
  }

  /**
   * 移除绘制回调函数
   * @param {Function} callback 回调函数
   */
  unregister(callback) {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  /**
   * 清除所有回调
   */
  clear() {
    this.callbacks = [];
  }

  /**
   * 内部循环函数
   * @param {number} timestamp 时间戳
   */
  _loop(timestamp) {
    if (!this.isRunning) return;

    const deltaTime = timestamp - this.lastTime;

    if (deltaTime >= this.frameInterval) {
      this.lastTime = timestamp - (deltaTime % this.frameInterval);

      for (const callback of this.callbacks) {
        callback(deltaTime);
      }
    }

    this.animationId = requestAnimationFrame((ts) => this._loop(ts));
  }

  /**
   * 启动动画循环
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.animationId = requestAnimationFrame((ts) => this._loop(ts));
  }

  /**
   * 停止动画循环
   */
  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * 暂停动画
   */
  pause() {
    this.isRunning = false;
  }

  /**
   * 恢复动画
   */
  resume() {
    if (!this.isRunning) {
      this.start();
    }
  }

  /**
   * 检查是否正在运行
   * @returns {boolean}
   */
  isAnimating() {
    return this.isRunning;
  }
}

export const frameRateManager = new FrameRateManager();
