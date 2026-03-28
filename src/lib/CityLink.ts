import cityTimezones from 'city-timezones';
import { isMajorCity } from './majorCities';

export interface City {
    id: string;
    name: string;
    country: string;
    timezone: string;
    matchReason?: string;
}

// Common name aliases -> canonical name used by city-timezones library.
// Allows users to search using familiar names even when the library
// uses the official/local spelling.
const SEARCH_ALIASES: Record<string, string> = {
    'bangalore': 'Bengaluru',
    'yangon': 'Rangoon',
    'zurich': 'Zürich',
    'sao paulo': 'Sao Paulo',
    'são paulo': 'Sao Paulo',
    'tel aviv': 'Tel Aviv-Yafo',
    'washington': 'Washington, D.C.',
    'montreal': 'Montréal',
    'kuwait city': 'Kuwait',
    'bogota': 'Bogota',
    'bogotá': 'Bogota',
};

// Reverse map: timezone abbreviation -> list of IANA timezone IDs.
// Built from common abbreviations so users can search by e.g. "JST", "EST".
const ABBREV_TO_TIMEZONES: Record<string, string[]> = {};

function addAbbrev(abbrev: string, tz: string) {
    const key = abbrev.toUpperCase();
    if (!ABBREV_TO_TIMEZONES[key]) ABBREV_TO_TIMEZONES[key] = [];
    if (!ABBREV_TO_TIMEZONES[key].includes(tz)) ABBREV_TO_TIMEZONES[key].push(tz);
}

// Populate from the same abbreviations used in timezoneAbbrev.ts
const ABBREV_ENTRIES: [string, string, string][] = [
    // [IANA timezone, standard abbrev, DST abbrev]
    // Asia
    ['Asia/Tokyo', 'JST', 'JDT'],
    ['Asia/Hong_Kong', 'HKT', 'HKST'],
    ['Asia/Shanghai', 'CST', 'CDT'],
    ['Asia/Taipei', 'CST', 'CDT'],
    ['Asia/Singapore', 'SGT', 'SGT'],
    ['Asia/Seoul', 'KST', 'KDT'],
    ['Asia/Kolkata', 'IST', 'IST'],
    ['Asia/Colombo', 'IST', 'IST'],
    ['Asia/Dubai', 'GST', 'GST'],
    ['Asia/Karachi', 'PKT', 'PKST'],
    ['Asia/Dhaka', 'BST', 'BST'],
    ['Asia/Bangkok', 'ICT', 'ICT'],
    ['Asia/Ho_Chi_Minh', 'ICT', 'ICT'],
    ['Asia/Jakarta', 'WIB', 'WIB'],
    ['Asia/Kuala_Lumpur', 'MYT', 'MYT'],
    ['Asia/Manila', 'PHT', 'PHT'],
    ['Asia/Yangon', 'MMT', 'MMT'],
    ['Asia/Phnom_Penh', 'ICT', 'ICT'],
    ['Asia/Vientiane', 'ICT', 'ICT'],
    ['Asia/Tehran', 'IRST', 'IRDT'],
    ['Asia/Riyadh', 'AST', 'AST'],
    ['Asia/Qatar', 'AST', 'AST'],
    ['Asia/Muscat', 'GST', 'GST'],
    ['Asia/Bahrain', 'AST', 'AST'],
    ['Asia/Kuwait', 'AST', 'AST'],
    ['Asia/Amman', 'EET', 'EEST'],
    ['Asia/Beirut', 'EET', 'EEST'],
    ['Asia/Jerusalem', 'IST', 'IDT'],
    // Europe
    ['Europe/Moscow', 'MSK', 'MSD'],
    ['Europe/Istanbul', 'TRT', 'TRT'],
    ['Europe/London', 'GMT', 'BST'],
    ['Europe/Dublin', 'GMT', 'IST'],
    ['Europe/Paris', 'CET', 'CEST'],
    ['Europe/Berlin', 'CET', 'CEST'],
    ['Europe/Madrid', 'CET', 'CEST'],
    ['Europe/Rome', 'CET', 'CEST'],
    ['Europe/Amsterdam', 'CET', 'CEST'],
    ['Europe/Brussels', 'CET', 'CEST'],
    ['Europe/Zurich', 'CET', 'CEST'],
    ['Europe/Vienna', 'CET', 'CEST'],
    ['Europe/Warsaw', 'CET', 'CEST'],
    ['Europe/Prague', 'CET', 'CEST'],
    ['Europe/Budapest', 'CET', 'CEST'],
    ['Europe/Copenhagen', 'CET', 'CEST'],
    ['Europe/Stockholm', 'CET', 'CEST'],
    ['Europe/Oslo', 'CET', 'CEST'],
    ['Europe/Helsinki', 'EET', 'EEST'],
    ['Europe/Athens', 'EET', 'EEST'],
    ['Europe/Lisbon', 'WET', 'WEST'],
    ['Europe/Bucharest', 'EET', 'EEST'],
    // Africa
    ['Africa/Cairo', 'EET', 'EEST'],
    ['Africa/Lagos', 'WAT', 'WAT'],
    ['Africa/Johannesburg', 'SAST', 'SAST'],
    ['Africa/Nairobi', 'EAT', 'EAT'],
    ['Africa/Casablanca', 'WET', 'WEST'],
    ['Africa/Accra', 'GMT', 'GMT'],
    ['Africa/Addis_Ababa', 'EAT', 'EAT'],
    // Americas
    ['America/New_York', 'EST', 'EDT'],
    ['America/Chicago', 'CST', 'CDT'],
    ['America/Denver', 'MST', 'MDT'],
    ['America/Los_Angeles', 'PST', 'PDT'],
    ['America/Phoenix', 'MST', 'MST'],
    ['America/Toronto', 'EST', 'EDT'],
    ['America/Vancouver', 'PST', 'PDT'],
    ['America/Sao_Paulo', 'BRT', 'BRST'],
    ['America/Argentina/Buenos_Aires', 'ART', 'ARST'],
    ['America/Santiago', 'CLT', 'CLST'],
    ['America/Lima', 'PET', 'PET'],
    ['America/Bogota', 'COT', 'COT'],
    ['America/Mexico_City', 'CST', 'CDT'],
    // Oceania
    ['Australia/Sydney', 'AEST', 'AEDT'],
    ['Australia/Melbourne', 'AEST', 'AEDT'],
    ['Australia/Brisbane', 'AEST', 'AEST'],
    ['Australia/Perth', 'AWST', 'AWST'],
    ['Pacific/Auckland', 'NZST', 'NZDT'],
    ['Pacific/Honolulu', 'HST', 'HST'],
    ['America/Anchorage', 'AKST', 'AKDT'],
];

for (const [tz, std, dst] of ABBREV_ENTRIES) {
    addAbbrev(std, tz);
    if (dst !== std) addAbbrev(dst, tz);
}

export class CityLink {
    static search(query: string): City[] {
        if (!query || query.length < 2) return [];

        // Search using the original query
        const allMatches = cityTimezones.findFromCityStateProvince(query);

        // Also search using alias if the query matches one
        const alias = SEARCH_ALIASES[query.toLowerCase()];
        if (alias) {
            const aliasMatches = cityTimezones.findFromCityStateProvince(alias);
            // Add alias matches that aren't already in the results
            const existingIds = new Set(allMatches.map(m => `${m.city}-${m.country}`));
            for (const match of aliasMatches) {
                if (!existingIds.has(`${match.city}-${match.country}`)) {
                    allMatches.push(match);
                }
            }
        }

        // Check if query matches a timezone abbreviation (e.g. "JST", "EST")
        const abbrevKey = query.toUpperCase();
        const abbrevTimezones = ABBREV_TO_TIMEZONES[abbrevKey];
        const abbrevTzSet = abbrevTimezones ? new Set(abbrevTimezones) : null;
        if (abbrevTimezones) {
            const existingIds = new Set(allMatches.map(m => `${m.city}-${m.country}`));
            for (const entry of cityTimezones.cityMapping) {
                if (abbrevTimezones.includes(entry.timezone) &&
                    !existingIds.has(`${entry.city}-${entry.country}`)) {
                    allMatches.push(entry);
                    existingIds.add(`${entry.city}-${entry.country}`);
                }
            }
        }

        // Filter by major city + country and map
        const results: City[] = [];
        for (const match of allMatches) {
            const entry = isMajorCity(match.city, match.country);
            if (entry) {
                const displayName = entry.displayName || match.city;
                const city: City = {
                    id: `${match.city}-${match.country}-${match.timezone}`,
                    name: displayName,
                    country: match.country,
                    timezone: match.timezone,
                };
                if (abbrevTzSet?.has(match.timezone)) {
                    city.matchReason = abbrevKey;
                }
                results.push(city);
            }
        }

        // Deduplicate by ID
        const seen = new Set<string>();
        return results.filter(city => {
            const duplicate = seen.has(city.id);
            seen.add(city.id);
            return !duplicate;
        }).slice(0, 10); // Limit results
    }
}
