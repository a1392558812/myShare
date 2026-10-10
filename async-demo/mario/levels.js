import { TILE, T } from './constants.js'

export const LEVELS = [
  {
    name: '1-1 蘑菇平原',
    desc: '平地踩怪 · 顶砖金币 · 超级蘑菇 · 管道 · 坑洞',
    rows: [
      '',
      '',
      '',
      '                                                                                            f',
      '                                                                                            f',
      '                                  BBHBB                                                     f',
      '                                                           oooo                             f',
      '                                                                                            f',
      '                                                                                            f',
      '               ?   BMB?B                        1                              B            f  CCCC',
      '                               ==== WW      pp         pp               ====  B             f  CCCC',
      '                           ppoo     WW      pp         pp                    B              f  CCCC',
      '   @       g            g  pp       WW  g   pp      g  pp   g               B           SS  f  CCCC',
      '################################################################   #################    ############',
      '################################################################   #################    ############',
    ],
  },
  {
    name: '1-2 管道迷阵',
    desc: '乌龟与龟壳 · 食人花管道 · 乌鸦 · 隐藏跳关管道',
    rows: [
      '',
      '',
      '',
      '                                                                                                        f',
      '                                                                                                        f',
      '                                                                                                        f',
      '                                            B?BM                                          r             f',
      '                                                                    r                                   f',
      '                                                         oooo                                           f',
      '             BBB                          H               =====                                         f  CCCC',
      '                   =====pp          PP                                                  ===             f  CCCC',
      '                        pp       oo pp                            WW                                    f  CCCC',
      '   @      g     k     g pp          pp  g    k              g     pp                  g                 f  CCCC',
      '##############################   ###################    ########################    ############    ############',
      '##############################   ###################    ########################    ############    ############',
    ],
  },
  {
    name: '1-3 天空陷阱',
    desc: '投怪手 · 移动平台 · 窄台极限跳',
    rows: [
      '',
      '',
      '',
      '                                                                                                                    f',
      '                                                                l                                                   f',
      '                                                                                      r                             f',
      '                                        r   BB?BM                                                                   f',
      '                                                        oo                                                          f',
      '                                                                                                                    f',
      '                BBBB                H                         ==                                                    f  CCCC',
      '                              PP      pp                ===               pp            ^           ====            f  CCCC',
      '                            oopp      pp          v                       pp                                        f  CCCC',
      '   @        g       k         pp  g   pp            k     g               pp    k                                   f  CCCC',
      '########################    ################    ####################    ####################    ############    ############',
      '########################    ################    ####################    ####################    ############    ############',
    ],
  },
]

export const getLevel = (index) => LEVELS[Math.min(index, LEVELS.length - 1)]

/**
 * 隐藏管道通向的奖励房（独立小场景，出来后回到原管道口继续走原路）
 * X = 回到原路的金色出口管道
 */
export const BONUS_ROOMS = [
  {
    name: '金币奖励房 · 地下金库',
    desc: '三层金币台阶 · 隐藏的超级蘑菇 · 金色出口管道',
    bonus: true,
    rows: [
      '',
      '',
      '',
      '',
      '                         o o o o',
      '                         BBBBBBBB',
      '                         o o o o',
      '                         BBBBBBBB',
      '     ? M ? ?  o o o o',
      '              BBBBBBBB                       S',
      'S                                            S',
      'S                                       BBBXXS',
      'S @   o o o o                   o o o BBB  XXS',
      '##############################################',
      '##############################################',
    ],
  },
  {
    name: '金币奖励房 · 三层钱塔',
    desc: '逐级向上的悬空钱塔 · 顶部一排金币 · 问号砖藏蘑菇',
    bonus: true,
    rows: [
      '',
      '',
      '',
      '',
      '',
      '                        o o o o o',
      '                        BBBBBBBBB',
      '              o o o o',
      '              BBBBBBB',
      '           o o o o',
      '   ? M ? ?  BBBBBBBB',
      '                                        BBBXXS',
      'S @                                     BBBXXS',
      '##############################################',
      '##############################################',
    ],
  },
]

export const getBonusRoom = (index = 0) => BONUS_ROOMS[Math.min(index, BONUS_ROOMS.length - 1)]

/** 敌人字符 → 类型 */
const ENEMY_CHAR = {
  [T.GOOMBA]: 'goomba',
  [T.KOOPA]: 'koopa',
  [T.CROW]: 'crow',
  [T.LAKITU]: 'lakitu',
}

/** 敌人高度（用于按行对齐地面） */
const ENEMY_H = { goomba: 30, koopa: 44, spiny: 28, crow: 24, lakitu: 28 }

/**
 * 解析关卡 ASCII 为运行时数据
 * @param {{name:string,desc?:string,rows:string[]}} def 关卡定义
 * @returns {{name:string,desc:string,w:number,h:number,tiles:string[][],spawn:object,enemies:object[],platforms:object[],flag:object,warps:object[]}}
 */
export const parseLevel = (def) => {
  const w = Math.max(...def.rows.map((r) => r.length))
  const h = def.rows.length
  const tiles = []
  const enemies = []
  const platforms = []
  const warps = []
  let spawn = { x: 2 * TILE, y: 11 * TILE }
  let flag = { x: (w - 6) * TILE, y0: 3 * TILE, y1: 12 * TILE }

  for (let y = 0; y < h; y++) {
    const line = def.rows[y].padEnd(w, ' ')
    const row = []
    for (let x = 0; x < w; x++) {
      const ch = line[x]
      if (ENEMY_CHAR[ch]) {
        const type = ENEMY_CHAR[ch]
        const eh = ENEMY_H[type]
        const fly = type === 'crow' || type === 'lakitu'
        const ey = fly ? y * TILE : (y + 1) * TILE - eh - 2
        enemies.push({ type, x: x * TILE + 1, y: ey, homeX: x * TILE + 1, homeY: y * TILE })
        row.push(T.EMPTY)
      } else if (ch === T.PLAYER) {
        spawn = { x: x * TILE + 4, y: y * TILE + 4 }
        row.push(T.EMPTY)
      } else if (ch === T.MOVE_H) {
        platforms.push({ axis: 'h', x: x * TILE, y: y * TILE + 12, w: 3 * TILE, h: 12, range: 3 * TILE, speed: 0.85, dx: 0, dy: 0, t: 0 })
        row.push(T.EMPTY)
      } else if (ch === T.MOVE_V) {
        platforms.push({ axis: 'v', x: x * TILE, y: y * TILE + 12, w: 3 * TILE, h: 12, range: 2.5 * TILE, speed: 0.6, dx: 0, dy: 0, t: 0 })
        row.push(T.EMPTY)
      } else if (ch === T.WARP) {
        warps.push({ x: x * TILE, y: y * TILE })
        row.push(ch)
      } else if (ch === T.FLAG_POLE) {
        if (!flag.poleX) flag = { ...flag, poleX: x * TILE + 12, y0: y * TILE, y1: y * TILE }
        else flag.y1 = y * TILE
        row.push(ch)
      } else {
        row.push(ch)
      }
    }
    tiles.push(row)
  }
  if (!flag.poleX) flag.poleX = (w - 6) * TILE + 12

  return { name: def.name, desc: def.desc || '', bonus: !!def.bonus, w, h, tiles, spawn, enemies, platforms, warps, flag }
}
