/** 玩家在网格地图中的状态，坐标单位是“格子”，1 格 = 1 个世界单位 */
export interface PlayerState {
  x: number
  y: number
  /** 水平朝向弧度，0 指向 +x（地图东侧），顺时针为正 */
  yaw: number
  /** 俯仰角弧度，正值抬头，负值低头 */
  pitch: number
  /** 眼睛离地高度（世界单位），站立为 EYE_HEIGHT，下蹲 / 跳跃时变化 */
  eyeHeight: number
  /** 竖直速度（世界单位 / 秒，向上为正），用于跳跃与落地 */
  verticalVelocity: number
}

/** 输入模块每帧产出的快照，所有位移类输入都是 -1 / 0 / 1 */
export interface InputSnapshot {
  forward: number
  strafe: number
  turn: number
  run: boolean
  /** 空格在本帧刚按下（边沿触发），用于起跳 */
  jump: boolean
  /** Ctrl 是否按住，用于下蹲 */
  crouch: boolean
  /** 指针锁定状态下累积的鼠标水平位移（像素，已消费归零） */
  mouseDelta: number
  /** 累积的鼠标垂直位移，向下为正 */
  mouseDeltaY: number
  /** 键盘俯仰输入：抬头 +1 / 低头 -1 */
  lookVertical: number
}

/** 一次射线命中的结果 */
export interface RayHit {
  /** 垂直于摄像机平面的距离，用于消除鱼眼畸变 */
  distance: number
  /** 0 = 命中东西向墙面，1 = 命中南北向墙面 */
  side: 0 | 1
  /** 命中格子的贴图编号（> 0 即墙） */
  cell: number
  /** 命中点在墙面上的横向偏移，取值 [0, 1)，用于砖缝贴图 */
  wallCoord: number
}
