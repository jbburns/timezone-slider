/**
 * Get timezone abbreviation (e.g., JST, EST, IST) from IANA timezone.
 *
 * Strategy:
 *  1. Use Intl.DateTimeFormat with timeZoneName:'short' — returns correct
 *     abbreviations for zones the browser knows (mostly US/EU).
 *  2. If the browser returns a GMT±X offset instead, look up the zone in a
 *     curated map of standard IANA abbreviations.
 *  3. Fall back to extracting initials from the long timezone name.
 */

/** Standard IANA abbreviations keyed by [timezone, isDST]. */
const IANA_ABBREVS: Record<string, [string, string]> = {
    // [standard, daylight]
    // Asia
    'Asia/Tokyo':           ['JST', 'JDT'],
    'Asia/Hong_Kong':       ['HKT', 'HKST'],
    'Asia/Shanghai':        ['CST', 'CDT'],
    'Asia/Taipei':          ['CST', 'CDT'],
    'Asia/Singapore':       ['SGT', 'SGT'],
    'Asia/Seoul':           ['KST', 'KDT'],
    'Asia/Kolkata':         ['IST', 'IST'],
    'Asia/Colombo':         ['IST', 'IST'],
    'Asia/Dubai':           ['GST', 'GST'],
    'Asia/Karachi':         ['PKT', 'PKST'],
    'Asia/Dhaka':           ['BST', 'BST'],
    'Asia/Bangkok':         ['ICT', 'ICT'],
    'Asia/Ho_Chi_Minh':     ['ICT', 'ICT'],
    'Asia/Jakarta':         ['WIB', 'WIB'],
    'Asia/Kuala_Lumpur':    ['MYT', 'MYT'],
    'Asia/Manila':          ['PHT', 'PHT'],
    'Asia/Yangon':          ['MMT', 'MMT'],
    'Asia/Phnom_Penh':      ['ICT', 'ICT'],
    'Asia/Vientiane':       ['ICT', 'ICT'],
    'Asia/Tehran':          ['IRST', 'IRDT'],
    'Asia/Riyadh':          ['AST', 'AST'],
    'Asia/Qatar':           ['AST', 'AST'],
    'Asia/Muscat':          ['GST', 'GST'],
    'Asia/Bahrain':         ['AST', 'AST'],
    'Asia/Kuwait':          ['AST', 'AST'],
    'Asia/Amman':           ['EET', 'EEST'],
    'Asia/Beirut':          ['EET', 'EEST'],
    'Asia/Jerusalem':       ['IST', 'IDT'],

    // Europe
    'Europe/Moscow':        ['MSK', 'MSD'],
    'Europe/Istanbul':      ['TRT', 'TRT'],
    'Europe/London':        ['GMT', 'BST'],
    'Europe/Dublin':        ['GMT', 'IST'],
    'Europe/Paris':         ['CET', 'CEST'],
    'Europe/Berlin':        ['CET', 'CEST'],
    'Europe/Madrid':        ['CET', 'CEST'],
    'Europe/Rome':          ['CET', 'CEST'],
    'Europe/Amsterdam':     ['CET', 'CEST'],
    'Europe/Brussels':      ['CET', 'CEST'],
    'Europe/Zurich':        ['CET', 'CEST'],
    'Europe/Vienna':        ['CET', 'CEST'],
    'Europe/Warsaw':        ['CET', 'CEST'],
    'Europe/Prague':        ['CET', 'CEST'],
    'Europe/Budapest':      ['CET', 'CEST'],
    'Europe/Copenhagen':    ['CET', 'CEST'],
    'Europe/Stockholm':     ['CET', 'CEST'],
    'Europe/Oslo':          ['CET', 'CEST'],
    'Europe/Helsinki':      ['EET', 'EEST'],
    'Europe/Athens':        ['EET', 'EEST'],
    'Europe/Lisbon':        ['WET', 'WEST'],
    'Europe/Bucharest':     ['EET', 'EEST'],

    // Africa
    'Africa/Cairo':         ['EET', 'EEST'],
    'Africa/Lagos':         ['WAT', 'WAT'],
    'Africa/Johannesburg':  ['SAST', 'SAST'],
    'Africa/Nairobi':       ['EAT', 'EAT'],
    'Africa/Casablanca':    ['WET', 'WEST'],
    'Africa/Accra':         ['GMT', 'GMT'],
    'Africa/Addis_Ababa':   ['EAT', 'EAT'],

    // Americas
    'America/Sao_Paulo':    ['BRT', 'BRST'],
    'America/Argentina/Buenos_Aires': ['ART', 'ARST'],
    'America/Santiago':     ['CLT', 'CLST'],
    'America/Lima':         ['PET', 'PET'],
    'America/Bogota':       ['COT', 'COT'],
    'America/Mexico_City':  ['CST', 'CDT'],

    // Oceania
    'Australia/Sydney':     ['AEST', 'AEDT'],
    'Australia/Melbourne':  ['AEST', 'AEDT'],
    'Australia/Brisbane':   ['AEST', 'AEST'],
    'Australia/Perth':      ['AWST', 'AWST'],
    'Pacific/Auckland':     ['NZST', 'NZDT'],
    'Pacific/Honolulu':     ['HST', 'HST'],
    'America/Anchorage':    ['AKST', 'AKDT'],
};

function isDST(timezone: string, date: Date): boolean {
    const jan = new Date(date.getFullYear(), 0, 1);
    const jul = new Date(date.getFullYear(), 6, 1);
    const janOffset = getUTCOffset(timezone, jan);
    const julOffset = getUTCOffset(timezone, jul);
    const currentOffset = getUTCOffset(timezone, date);
    // DST is active when the offset differs from the "standard" (larger absolute offset)
    const standardOffset = Math.min(janOffset, julOffset);
    return currentOffset !== standardOffset && janOffset !== julOffset;
}

function getUTCOffset(timezone: string, date: Date): number {
    const utc = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const local = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    return (local.getTime() - utc.getTime()) / 60000;
}

export function getTimezoneAbbreviation(timezone: string, date: Date = new Date()): string {
    try {
        // 1. Try Intl short name — correct for well-known zones (US, some EU)
        const shortFmt = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            timeZoneName: 'short',
        });
        const shortName = shortFmt.formatToParts(date)
            .find(p => p.type === 'timeZoneName')?.value ?? '';

        if (shortName && !shortName.startsWith('GMT')) {
            return shortName;
        }

        // 2. Look up in curated IANA abbreviation table
        const entry = IANA_ABBREVS[timezone];
        if (entry) {
            return isDST(timezone, date) ? entry[1] : entry[0];
        }

        // 3. Fall back to initials of the long name
        const longFmt = new Intl.DateTimeFormat('en-US', {
            timeZone: timezone,
            timeZoneName: 'long',
        });
        const longName = longFmt.formatToParts(date)
            .find(p => p.type === 'timeZoneName')?.value ?? timezone;

        const abbr = longName.split(' ')
            .filter(w => w.length > 0 && w[0] === w[0].toUpperCase())
            .map(w => w[0])
            .join('');

        return abbr || longName;
    } catch {
        return timezone;
    }
}
