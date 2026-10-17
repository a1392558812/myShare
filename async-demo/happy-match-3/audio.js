/** WebAudio 合成音效（P0 占位，无外部资源依赖） */
let actx = null
let enabled = true
let master = null

const ensure = () => {
  if (actx) return actx
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  actx = new AC()
  master = actx.createGain()
  master.gain.value = 0.18
  master.connect(actx.destination)
  return actx
}

export const setSfxEnabled = (v) => {
  enabled = !!v
  if (enabled) ensure()
}
export const isSfxEnabled = () => enabled

const tone = (freq, dur, type = 'sine', gain = 1, delay = 0, slideTo = 0) => {
  const ac = ensure()
  if (!ac || !enabled) return
  const t0 = ac.currentTime + delay
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(0.02, dur * 0.3))
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  osc.connect(g)
  g.connect(master)
  osc.start(t0)
  osc.stop(t0 + dur + 0.02)
}

export const playSfx = (name, extra = {}) => {
  if (!enabled) return
  switch (name) {
    case 'select': tone(620, 0.07, 'triangle', 0.5); break
    case 'swap': tone(520, 0.1, 'triangle', 0.5, 0, 760); break
    case 'invalid': tone(190, 0.14, 'sawtooth', 0.35, 0, 130); break
    case 'clear': {
      const base = 560 + (extra.mult || 1) * 90
      tone(base, 0.13, 'sine', 0.7, 0, base * 1.5)
      tone(base * 1.5, 0.1, 'sine', 0.4, 0.05)
      break
    }
    case 'big': {
      tone(320, 0.28, 'sawtooth', 0.5, 0, 900)
      tone(660, 0.2, 'square', 0.3, 0.06, 1200)
      break
    }
    case 'special': tone(880, 0.22, 'square', 0.35, 0, 1400); break
    case 'shuffle':
      tone(300, 0.3, 'sine', 0.4, 0, 900)
      tone(450, 0.3, 'sine', 0.3, 0.08, 1100)
      break
    case 'win':
      [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.26, 'triangle', 0.55, i * 0.11))
      break
    case 'lose':
      [440, 392, 330, 262].forEach((f, i) => tone(f, 0.26, 'triangle', 0.45, i * 0.13))
      break
    case 'star': tone(1200, 0.18, 'triangle', 0.5, 0, 1800); break
    default: break
  }
}
