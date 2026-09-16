export function buildMapsUrl(venueName: string, address: string): string {
  const query = encodeURIComponent(`${venueName}, ${address}`)
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}
