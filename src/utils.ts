/**
 * Get a random number between two values.
 * @param min - The minimum value.
 * @param max - The maximum value.
 * @returns A random number between min(0) and max(100).
 */
export function getRandomArbitrary(min: number, max: number) {
  return Math.round(Math.random() * (max - min) + min);
}

