import cityTimezones from 'city-timezones';
import { isMajorCity } from './majorCities';

export interface City {
    id: string;
    name: string;
    country: string;
    timezone: string;
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

        // Filter by major city + country and map
        const results: City[] = [];
        for (const match of allMatches) {
            const entry = isMajorCity(match.city, match.country);
            if (entry) {
                const displayName = entry.displayName || match.city;
                results.push({
                    id: `${match.city}-${match.country}-${match.timezone}`,
                    name: displayName,
                    country: match.country,
                    timezone: match.timezone,
                });
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
