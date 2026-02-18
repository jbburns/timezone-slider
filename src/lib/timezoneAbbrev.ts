/**
 * Get timezone abbreviation (e.g., JST, EST, IST) from IANA timezone
 * Uses Intl.DateTimeFormat to get the long name, then extracts abbreviation
 */
export function getTimezoneAbbreviation(timezone: string, date: Date = new Date()): string {
    try {
        // Get the long timezone name (e.g., "Japan Standard Time")
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            timeZoneName: 'long'
        });

        const parts = formatter.formatToParts(date);
        const timeZonePart = parts.find(part => part.type === 'timeZoneName');

        if (!timeZonePart) {
            return timezone; // Fallback to IANA name
        }

        const longName = timeZonePart.value;

        // Extract abbreviation by taking first letter of each capitalized word
        // "Japan Standard Time" -> "JST"
        // "Eastern Daylight Time" -> "EDT"
        // "India Standard Time" -> "IST"
        const words = longName.split(' ');
        const abbreviation = words
            .filter(word => word.length > 0 && word[0] === word[0].toUpperCase())
            .map(word => word[0])
            .join('');

        return abbreviation || longName;
    } catch (error) {
        // Fallback to timezone name if anything fails
        return timezone;
    }
}
