/**
 * Drives the rear camera and decodes QR codes from it.
 *
 * Two decode engines, feature-detected in this order:
 *  1. Native `BarcodeDetector` — fast, GPU-backed, but Android-only in
 *     practice. iOS Safari has never implemented it.
 *  2. `@zxing/browser` — pure JS decoding, works everywhere, is what every
 *     iPhone in the field will actually use.
 *
 * For the native path we own the `getUserMedia` call ourselves (so we can
 * request the rear camera and poll frames on our own timer); for the zxing
 * path its `decodeFromVideoDevice` already does both of those things and
 * already prefers the environment-facing camera, so we hand it the video
 * element and let it drive.
 *
 * `playsInline`/`muted` are set in code (not just JSX) because Safari only
 * honours them if they're present before `play()` is called on that same
 * user gesture — otherwise it force-fullscreens the video.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { BrowserCodeReader, BrowserQRCodeReader } from '@zxing/browser'
import type { IScannerControls } from '@zxing/browser'
import { getBarcodeDetectorCtor } from './barcodeDetector'

export type ScanEngine = 'native' | 'zxing'
export type CameraStatus = 'idle' | 'starting' | 'running' | 'error'

export interface UseCameraScannerOptions {
  /** Camera only runs while this is true, so a hidden/paused view can't drain the battery. */
  active: boolean
  onDecode: (rawValue: string) => void
}

export interface UseCameraScannerResult {
  videoRef: RefObject<HTMLVideoElement | null>
  engine: ScanEngine | null
  status: CameraStatus
  errorMessage: string | null
  torchSupported: boolean
  torchOn: boolean
  toggleTorch: () => void
}

const SCAN_INTERVAL_MS = 220

export function useCameraScanner({ active, onDecode }: UseCameraScannerOptions): UseCameraScannerResult {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const onDecodeRef = useRef(onDecode)
  onDecodeRef.current = onDecode

  const [engine, setEngine] = useState<ScanEngine | null>(null)
  const [status, setStatus] = useState<CameraStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [torchSupported, setTorchSupported] = useState(false)
  const [torchOn, setTorchOn] = useState(false)

  const streamRef = useRef<MediaStream | null>(null)
  const nativeTimerRef = useRef<number | null>(null)
  const zxingControlsRef = useRef<IScannerControls | null>(null)
  const stoppedRef = useRef(false)

  const stopAll = useCallback(() => {
    stoppedRef.current = true
    if (nativeTimerRef.current !== null) {
      window.clearTimeout(nativeTimerRef.current)
      nativeTimerRef.current = null
    }
    zxingControlsRef.current?.stop()
    zxingControlsRef.current = null
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop()
      streamRef.current = null
    }
    const video = videoRef.current
    if (video) {
      video.pause()
      video.srcObject = null
    }
    setEngine(null)
    setTorchSupported(false)
    setTorchOn(false)
  }, [])

  useEffect(() => {
    if (!active) {
      stopAll()
      setStatus('idle')
      return
    }

    stoppedRef.current = false
    setStatus('starting')
    setErrorMessage(null)

    const NativeCtor = getBarcodeDetectorCtor()

    const startNative = async (Ctor: NonNullable<typeof NativeCtor>) => {
      const detector = new Ctor({ formats: ['qr_code'] })
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      })
      if (stoppedRef.current) {
        for (const track of stream.getTracks()) track.stop()
        return
      }
      streamRef.current = stream

      const video = videoRef.current
      if (!video) throw new Error('no_video_element')
      video.muted = true
      video.playsInline = true
      video.srcObject = stream
      await video.play()

      const track = stream.getVideoTracks()[0]
      if (track && BrowserCodeReader.mediaStreamIsTorchCompatibleTrack(track)) {
        setTorchSupported(true)
      }

      setEngine('native')
      setStatus('running')

      const tick = async () => {
        if (stoppedRef.current) return
        try {
          const results = await detector.detect(video)
          if (results.length > 0) onDecodeRef.current(results[0].rawValue)
        } catch {
          // A frame with no readable code throws in some implementations;
          // that's routine, not a failure worth surfacing.
        }
        if (!stoppedRef.current) {
          nativeTimerRef.current = window.setTimeout(() => void tick(), SCAN_INTERVAL_MS)
        }
      }
      void tick()
    }

    const startZxing = async () => {
      const video = videoRef.current
      if (!video) throw new Error('no_video_element')
      video.muted = true
      video.playsInline = true

      const reader = new BrowserQRCodeReader(undefined, {
        delayBetweenScanAttempts: SCAN_INTERVAL_MS,
        delayBetweenScanSuccess: 1000,
      })

      const controls = await reader.decodeFromVideoDevice(undefined, video, (result) => {
        if (result) onDecodeRef.current(result.getText())
      })
      if (stoppedRef.current) {
        controls.stop()
        return
      }
      zxingControlsRef.current = controls
      setTorchSupported(typeof controls.switchTorch === 'function')
      setEngine('zxing')
      setStatus('running')
    }

    const run = NativeCtor ? startNative(NativeCtor) : startZxing()
    run.catch((err: unknown) => {
      if (stoppedRef.current) return
      setStatus('error')
      // getUserMedia rejects with a DOMException whose `name` (not `message`)
      // is the stable identifier — e.g. 'NotAllowedError' for a denied
      // permission prompt — so that's what CameraView keys its copy off of.
      const code =
        err instanceof DOMException ? err.name : err instanceof Error ? err.message : 'camera_unavailable'
      setErrorMessage(code)
    })

    return () => {
      stopAll()
    }
    // active/stopAll cover the lifecycle; onDecode is read through a ref so
    // the camera never has to be restarted just because the callback identity changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, stopAll])

  const toggleTorch = useCallback(() => {
    setTorchOn((prev) => {
      const next = !prev
      const zxingSwitch = zxingControlsRef.current?.switchTorch
      if (zxingSwitch) {
        void zxingSwitch(next)
      } else {
        const track = streamRef.current?.getVideoTracks()[0]
        if (track) void BrowserCodeReader.mediaStreamSetTorch(track, next)
      }
      return next
    })
  }, [])

  return { videoRef, engine, status, errorMessage, torchSupported, torchOn, toggleTorch }
}
