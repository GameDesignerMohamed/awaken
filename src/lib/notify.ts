export interface ScheduleSlot {
  slot: number
  time: string // "HH:MM" in 24h format
}

export interface NotifyResult {
  shouldSend: boolean
  slot: number
  prompt: string
}

const PROMPTS: Record<number, string> = {
  1: 'What am I avoiding by doing what I\'m doing?',
  2: 'If someone filmed the last two hours, what would they conclude I want?',
  3: 'Am I moving toward the life I hate or the life I want?',
  4: 'What\'s the most important thing I\'m pretending isn\'t important?',
  5: 'What did I do today from identity protection rather than genuine desire?',
  6: 'When did I feel most alive today? Most dead?',
}

/**
 * Pure function: given a user's schedule, the current time in their timezone,
 * and which slots were already sent today, returns whether a notification
 * should be sent now — and if so, which slot/prompt.
 */
export function shouldNotifyNow(
  schedule: ScheduleSlot[],
  currentTimeHHMM: string,
  sentTodaySlots: Set<number>,
): NotifyResult | null {
  for (const { slot, time } of schedule) {
    if (time === currentTimeHHMM && !sentTodaySlots.has(slot)) {
      return {
        shouldSend: true,
        slot,
        prompt: PROMPTS[slot] || `Interrupt ${slot}`,
      }
    }
  }
  return null
}
