export class RateLimiter {
  private cache = new Map<string, { count: number; timestamp: number }>()

  constructor(private limit: number, private windowMs: number) {}

  check(ip: string): boolean {
    const now = Date.now()
    const record = this.cache.get(ip)

    if (!record) {
      this.cache.set(ip, { count: 1, timestamp: now })
      return true
    }

    // Əgər vaxt bitibsə sıfırla
    if (now - record.timestamp > this.windowMs) {
      this.cache.set(ip, { count: 1, timestamp: now })
      return true
    }

    // Əgər limit dolubsa
    if (record.count >= this.limit) {
      return false
    }

    // Əks halda sayını artır
    record.count++
    return true
  }
}
