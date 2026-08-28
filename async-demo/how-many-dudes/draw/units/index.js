import drawWarrior from './drawWarrior.js';
import drawArcher from './drawArcher.js';
import drawMage from './drawMage.js';
import drawNinja from './drawNinja.js';
import drawZombie from './drawZombie.js';
import drawPriest from './drawPriest.js';
import drawCowboy from './drawCowboy.js';
import drawKnight from './drawKnight.js';
import drawCrossbowman from './drawCrossbowman.js';
import drawBerserker from './drawBerserker.js';
import drawMusketeer from './drawMusketeer.js';
import drawShaman from './drawShaman.js';
import drawDragoon from './drawDragoon.js';
import drawKid from './drawKid.js';
import drawWolf from './drawWolf.js';
import drawGorilla from './drawGorilla.js';
import drawShadow from './drawShadow.js';
import drawGod from './drawGod.js';
import drawArcherEnemy from './drawArcherEnemy.js';
import drawTank from './drawTank.js';
import drawBat from './drawBat.js';
import drawMedic from './drawMedic.js';
import drawBomber from './drawBomber.js';
import drawWarlord from './drawWarlord.js';
import drawNecromancer from './drawNecromancer.js';
import drawGolem from './drawGolem.js';
import drawHydra from './drawHydra.js';

/** defId → 绘制函数 映射表 */
const drawers = {
  warrior: drawWarrior,
  archer: drawArcher,
  mage: drawMage,
  ninja: drawNinja,
  zombie: drawZombie,
  priest: drawPriest,
  cowboy: drawCowboy,
  knight: drawKnight,
  crossbowman: drawCrossbowman,
  berserker: drawBerserker,
  musketeer: drawMusketeer,
  shaman: drawShaman,
  dragoon: drawDragoon,
  kid: drawKid,
  wolf: drawWolf,
  gorilla: drawGorilla,
  shadow: drawShadow,
  god: drawGod,
  eArcher: drawArcherEnemy,
  tank: drawTank,
  bat: drawBat,
  medic: drawMedic,
  bomber: drawBomber,
  warlord: drawWarlord,
  necromancer: drawNecromancer,
  golem: drawGolem,
  hydra: drawHydra,
};

/**
 * 绘制一个角色单位
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} unit - 单位数据
 * @param {number} time - 当前时间戳
 * @returns {boolean} 是否成功绘制
 */
export const drawCharacter = (ctx, unit, time) => {
  const fn = drawers[unit.defId];
  if (fn) {
    fn(ctx, unit, time);
    return true;
  }
  return false;
};

export { drawWarrior, drawArcher, drawMage, drawNinja, drawZombie,
  drawPriest, drawCowboy, drawKnight, drawCrossbowman, drawBerserker,
  drawMusketeer, drawShaman, drawDragoon, drawKid, drawWolf,
  drawGorilla, drawShadow, drawGod, drawArcherEnemy, drawTank,
  drawBat, drawMedic, drawBomber, drawWarlord, drawNecromancer,
  drawGolem, drawHydra };
