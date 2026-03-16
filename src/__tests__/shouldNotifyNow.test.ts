import { describe, it, expect } from 'vitest'
import { shouldNotifyNow, type ScheduleSlot } from '../lib/notify'

const DEFAULT_SCHEDULE: ScheduleSlot[] = [
  { slot: 1, time: '11:00' },
  { slot: 2, time: '13:30' },
  { slot: 3, time: '15:15' },
  { slot: 4, time: '17:00' },
  { slot: 5, time: '19:30' },
  { slot: 6, time: '21:00' },
]

describe('shouldNotifyNow', () => {
  it('returns matching slot when current time matches schedule', () => {
    const result = shouldNotifyNow(DEFAULT_SCHEDULE, '11:00', new Set())
    expect(result).not.toBeNull()
    expect(result!.shouldSend).toBe(true)
    expect(result!.slot).toBe(1)
    expect(result!.prompt).toContain('avoiding')
  })

  it('returns null when current time does not match any slot', () => {
    const result = shouldNotifyNow(DEFAULT_SCHEDULE, '11:01', new Set())
    expect(result).toBeNull()
  })

  it('returns null when slot was already sent today', () => {
    const result = shouldNotifyNow(DEFAULT_SCHEDULE, '11:00', new Set([1]))
    expect(result).toBeNull()
  })

  it('DST spring-forward: slot at 02:30 should not fire (time skipped)', () => {
    // During spring-forward, 02:30 never exists — the cron would see 03:00
    const schedule: ScheduleSlot[] = [{ slot: 1, time: '02:30' }]
    const result = shouldNotifyNow(schedule, '03:00', new Set())
    expect(result).toBeNull()
  })

  it('DST fall-back: slot at 01:30 fires once, dedup catches second run', () => {
    const schedule: ScheduleSlot[] = [{ slot: 1, time: '01:30' }]

    // First run at 01:30 — fires
    const first = shouldNotifyNow(schedule, '01:30', new Set())
    expect(first).not.toBeNull()
    expect(first!.shouldSend).toBe(true)

    // Second run at 01:30 (repeated hour) — already in sentToday
    const second = shouldNotifyNow(schedule, '01:30', new Set([1]))
    expect(second).toBeNull()
  })

  it('midnight boundary: slot at 23:59, checked at 00:00 — should not fire', () => {
    const schedule: ScheduleSlot[] = [{ slot: 1, time: '23:59' }]
    const result = shouldNotifyNow(schedule, '00:00', new Set())
    expect(result).toBeNull()
  })

  it('UTC+13 timezone: slot matches based on user local time, not server time', () => {
    // shouldNotifyNow takes the already-converted local time
    // If user is in UTC+13 and their local time is 11:00, it should match
    const result = shouldNotifyNow(DEFAULT_SCHEDULE, '11:00', new Set())
    expect(result).not.toBeNull()
    expect(result!.slot).toBe(1)
  })

  it('returns correct prompt for each slot', () => {
    for (const { slot, time } of DEFAULT_SCHEDULE) {
      const result = shouldNotifyNow(DEFAULT_SCHEDULE, time, new Set())
      expect(result).not.toBeNull()
      expect(result!.slot).toBe(slot)
      expect(result!.prompt.length).toBeGreaterThan(0)
    }
  })

  it('skips only the sent slot, not others at same time', () => {
    // If two slots were somehow at the same time
    const schedule: ScheduleSlot[] = [
      { slot: 1, time: '11:00' },
      { slot: 2, time: '11:00' },
    ]
    // Slot 1 already sent
    const result = shouldNotifyNow(schedule, '11:00', new Set([1]))
    expect(result).not.toBeNull()
    expect(result!.slot).toBe(2)
  })
})
