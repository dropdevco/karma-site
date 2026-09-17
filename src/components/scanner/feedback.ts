/**
 * Short audio/haptic cues for scan outcomes.
 *
 * Staff are watching the queue, the roster, the person in front of them —
 * not the screen — so the outcome of a scan needs to be audible/felt, not
 * just displayed. `navigator.vibrate` does not exist on iOS Safari at all,
 * and `AudioContext` can be blocked until a user gesture unlocks it, so both
 * are wrapped and best-effort: a missed cue should never throw or block the
 * scan flow.
 */

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return null
      audioCtx = new Ctor()
    }
    if (audioCtx.state === 'suspended') void audioCtx.resume()
    return audioCtx
  } catch {
    return null
  }
}

function beep(frequency: number, durationMs: number) {
  const ctx = getAudioContext()
  if (!ctx) return
  try {
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = frequency
    gain.gain.value = 0.15
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.start()
    oscillator.stop(ctx.currentTime + durationMs / 1000)
  } catch {
    /* best effort only */
  }
}

function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* not available on this device (all of iOS) */
  }
}

export function playAccepted() {
  beep(880, 120)
  vibrate(60)
}

export function playAlready() {
  beep(520, 140)
  vibrate([40, 60, 40])
}

export function playRejected() {
  beep(220, 220)
  vibrate([80, 60, 80])
}
