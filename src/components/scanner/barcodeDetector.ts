/**
 * Minimal local typing for the native BarcodeDetector API.
 *
 * TypeScript's bundled DOM lib does not ship this type, and — more to the
 * point — iOS Safari does not implement the API at all and Apple has shown
 * no sign of adding it. So this is feature-detected at runtime and used only
 * on browsers (practically: Android Chrome/Edge) that actually have it;
 * everywhere else `useCameraScanner` falls back to `@zxing/browser`, which
 * decodes in JS and needs no browser support at all.
 */

export interface DetectedBarcode {
  rawValue: string
}

export interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>
}

interface BarcodeDetectorConstructor {
  new (options?: { formats: string[] }): BarcodeDetectorLike
}

export function getBarcodeDetectorCtor(): BarcodeDetectorConstructor | null {
  const ctor = (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector
  return typeof ctor === 'function' ? ctor : null
}
