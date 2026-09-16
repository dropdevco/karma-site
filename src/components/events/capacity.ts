export type CapacityState = 'open' | 'nearlyFull' | 'full'

export function getCapacityState(spotsTaken: number, capacity: number): CapacityState {
  if (spotsTaken >= capacity) return 'full'
  if (capacity > 0 && spotsTaken / capacity >= 0.85) return 'nearlyFull'
  return 'open'
}

export function getSpotsLeft(spotsTaken: number, capacity: number): number {
  return Math.max(capacity - spotsTaken, 0)
}
