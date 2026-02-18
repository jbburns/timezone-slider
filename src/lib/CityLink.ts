import cityTimezones from 'city-timezones';
import { MAJOR_CITIES_AllowList } from './majorCities';

export interface City {
    id: string;
    name: string;
    country: string;
    timezone: string;
}

export class CityLink {
    static search(query: string): City[] {
        if (!query || query.length < 2) return [];

        // cityTimezones returns duplicates sometimes (same city name in multiple locations/spellings)
        // We want a robust search.
        const allMatches = cityTimezones.findFromCityStateProvince(query);

        // Filter and map
        const results = allMatches
            .filter(match => MAJOR_CITIES_AllowList.has(match.city))
            .map(match => ({
                id: `${match.city}-${match.country}-${match.timezone}`,
                name: match.city,
                country: match.country,
                timezone: match.timezone
            }));

        // Deduplicate by ID
        const seen = new Set();
        return results.filter(city => {
            const duplicate = seen.has(city.id);
            seen.add(city.id);
            return !duplicate;
        }).slice(0, 10); // Limit results
    }
}
