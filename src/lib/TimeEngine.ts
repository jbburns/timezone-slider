import { DateTime } from 'luxon';

export class TimeEngine {

    static getCurrentTime(timezone: string): DateTime {
        return DateTime.now().setZone(timezone);
    }

    // No specific conversion needed if using Luxon objects directly, but helpers are nice.

    static formatHour(dt: DateTime): string {
        return dt.toFormat('HH:mm');
    }

    static isBusinessHours(dt: DateTime): boolean {
        return dt.hour >= 9 && dt.hour <= 17;
    }
}
