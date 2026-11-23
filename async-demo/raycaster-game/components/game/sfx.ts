/**
 * 浏览器要求用户手势后才能出声，所以 AudioContext 在第一次开火时才创建。
 */
export interface SfxController {
  shot: () => void
  dry: () => void
  reload: () => void
  isMuted: () => boolean
  toggleMute: () => boolean
  dispose: () => void
}

export const createSfx = (): SfxController => {
  let context: AudioContext | null = null
  let noiseBuffer: AudioBuffer | null = null
  let muted = false

  const ensureContext = (): AudioContext | null => {
    if (context) {
      if (context.state === 'suspended') void context.resume()
      return context
    }
    if (typeof window === 'undefined' || !window.AudioContext) return null
    context = new window.AudioContext()
    return context
  }

  const getNoise = (ctx: AudioContext): AudioBuffer => {
    if (noiseBuffer) return noiseBuffer
    const duration = 0.16
    const length = Math.max(1, Math.ceil(ctx.sampleRate * duration))
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i += 1) {
      const decay = 1 - i / length
      data[i] = (Math.random() * 2 - 1) * decay * decay
    }
    noiseBuffer = buffer
    return buffer
  }

  const click = (frequency: number, delay: number, volume: number): void => {
    const ctx = ensureContext()
    if (!ctx) return
    const start = ctx.currentTime + delay
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = 'square'
    oscillator.frequency.setValueAtTime(frequency, start)
    gain.gain.setValueAtTime(volume, start)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.045)
    oscillator.connect(gain).connect(ctx.destination)
    oscillator.start(start)
    oscillator.stop(start + 0.05)
  }

  const shot = (): void => {
    if (muted) return
    const ctx = ensureContext()
    if (!ctx) return

    const noise = ctx.createBufferSource()
    noise.buffer = getNoise(ctx)
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1800, ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(420, ctx.currentTime + 0.14)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15)
    noise.connect(filter).connect(gain).connect(ctx.destination)
    noise.start()

    const thump = ctx.createOscillator()
    thump.type = 'triangle'
    thump.frequency.setValueAtTime(130, ctx.currentTime)
    thump.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.09)
    const thumpGain = ctx.createGain()
    thumpGain.gain.setValueAtTime(0.18, ctx.currentTime)
    thumpGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1)
    thump.connect(thumpGain).connect(ctx.destination)
    thump.start()
    thump.stop(ctx.currentTime + 0.11)
  }

  const dry = (): void => {
    if (muted) return
    click(1600, 0, 0.08)
  }

  const reload = (): void => {
    if (muted) return
    click(720, 0, 0.09)
    click(520, 0.38, 0.09)
    click(900, 0.9, 0.06)
  }

  const toggleMute = (): boolean => {
    muted = !muted
    return muted
  }

  const dispose = (): void => {
    if (!context) return
    const closing = context.close()
    void closing.catch(() => undefined)
    context = null
    noiseBuffer = null
  }

  return { shot, dry, reload, isMuted: () => muted, toggleMute, dispose }
}
