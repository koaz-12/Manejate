/**
 * Calculate the start and end of a billing period based on a cutoff day.
 * 
 * Example: cutoff_day = 15, today = Feb 20
 * → Period: Feb 15 00:00 → Mar 15 00:00
 * 
 * Example: cutoff_day = 15, today = Feb 10
 * → Period: Jan 15 00:00 → Feb 15 00:00
 */
export function calculatePeriod(cutoffDay: number, referenceDate?: Date) {
    const ref = referenceDate || new Date()
    const referenceDay = ref.getDate()

    const start = new Date(ref)
    const end = new Date(ref)

    if (referenceDay >= cutoffDay) {
        // Current cycle started this month
        start.setDate(cutoffDay)
        start.setHours(0, 0, 0, 0)

        end.setMonth(end.getMonth() + 1)
        end.setDate(cutoffDay)
        end.setHours(0, 0, 0, 0)
    } else {
        // Previous month cycle
        start.setMonth(start.getMonth() - 1)
        start.setDate(cutoffDay)
        start.setHours(0, 0, 0, 0)

        end.setDate(cutoffDay)
        end.setHours(0, 0, 0, 0)
    }

    return { startOfPeriod: start, endOfPeriod: end }
}
