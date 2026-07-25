export interface Rng {
  next(): number;
  nextInt(maxExclusive: number): number;
}

export function createMulberry32(seed: number): Rng {
  let t = seed >>> 0;
  return {
    next(): number {
      t = (t + 0x6d2b79f5) >>> 0;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    },
    nextInt(maxExclusive: number): number {
      if (maxExclusive <= 0) {
        return 0;
      }
      return Math.floor(this.next() * maxExclusive);
    },
  };
}

export function shuffleInPlace<T>(items: T[], rng: Rng): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = rng.nextInt(i + 1);
    const tmp = items[i];
    items[i] = items[j];
    items[j] = tmp;
  }
  return items;
}
