// A curated list of major cities to filter the dataset and avoid clutter.
// This is a heuristic list of "Tier 1" global cities.
// Keys are "city|country" to disambiguate cities with the same name
// (e.g., London UK vs London Ontario vs London Kentucky).
// Display names are used to show a friendlier name to the user when the
// library's canonical name differs from the common name.

export interface MajorCityEntry {
    country: string;
    displayName?: string; // If set, shown instead of the library's city name
}

export const MAJOR_CITIES: Map<string, MajorCityEntry> = new Map([
    // Asia
    ["Tokyo|Japan", { country: "Japan" }],
    ["Shanghai|China", { country: "China" }],
    ["Beijing|China", { country: "China" }],
    ["Hong Kong|Hong Kong S.A.R.", { country: "Hong Kong S.A.R." }],
    ["Singapore|Singapore", { country: "Singapore" }],
    ["Seoul|South Korea", { country: "South Korea" }],
    ["Osaka|Japan", { country: "Japan" }],
    ["Taipei|Taiwan", { country: "Taiwan" }],
    ["Bangkok|Thailand", { country: "Thailand" }],
    ["Jakarta|Indonesia", { country: "Indonesia" }],
    ["Manila|Philippines", { country: "Philippines" }],
    ["Ho Chi Minh City|Vietnam", { country: "Vietnam" }],
    ["Hanoi|Vietnam", { country: "Vietnam" }],
    ["Kuala Lumpur|Malaysia", { country: "Malaysia" }],
    ["Phnom Penh|Cambodia", { country: "Cambodia" }],
    ["Vientiane|Laos", { country: "Laos" }],
    ["Rangoon|Myanmar", { country: "Myanmar", displayName: "Yangon" }],

    // South Asia
    ["Mumbai|India", { country: "India" }],
    ["Delhi|India", { country: "India" }],
    ["Bengaluru|India", { country: "India", displayName: "Bangalore" }],
    ["Kolkata|India", { country: "India" }],
    ["Chennai|India", { country: "India" }],
    ["Hyderabad|India", { country: "India" }],
    ["Pune|India", { country: "India" }],
    ["Ahmedabad|India", { country: "India" }],
    ["Karachi|Pakistan", { country: "Pakistan" }],
    ["Lahore|Pakistan", { country: "Pakistan" }],
    ["Islamabad|Pakistan", { country: "Pakistan" }],
    ["Dhaka|Bangladesh", { country: "Bangladesh" }],
    ["Colombo|Sri Lanka", { country: "Sri Lanka" }],

    // Middle East
    ["Dubai|United Arab Emirates", { country: "United Arab Emirates" }],
    ["Abu Dhabi|United Arab Emirates", { country: "United Arab Emirates" }],
    ["Riyadh|Saudi Arabia", { country: "Saudi Arabia" }],
    ["Doha|Qatar", { country: "Qatar" }],
    ["Kuwait|Kuwait", { country: "Kuwait", displayName: "Kuwait City" }],
    ["Manama|Bahrain", { country: "Bahrain" }],
    ["Muscat|Oman", { country: "Oman" }],
    ["Tel Aviv-Yafo|Israel", { country: "Israel", displayName: "Tel Aviv" }],
    ["Tehran|Iran", { country: "Iran" }],
    ["Amman|Jordan", { country: "Jordan" }],
    ["Beirut|Lebanon", { country: "Lebanon" }],
    ["Istanbul|Turkey", { country: "Turkey" }],

    // Europe
    ["London|United Kingdom", { country: "United Kingdom" }],
    ["Paris|France", { country: "France" }],
    ["Berlin|Germany", { country: "Germany" }],
    ["Munich|Germany", { country: "Germany" }],
    ["Frankfurt|Germany", { country: "Germany" }],
    ["Hamburg|Germany", { country: "Germany" }],
    ["Madrid|Spain", { country: "Spain" }],
    ["Barcelona|Spain", { country: "Spain" }],
    ["Rome|Italy", { country: "Italy" }],
    ["Milan|Italy", { country: "Italy" }],
    ["Amsterdam|Netherlands", { country: "Netherlands" }],
    ["Brussels|Belgium", { country: "Belgium" }],
    ["Zürich|Switzerland", { country: "Switzerland", displayName: "Zurich" }],
    ["Geneva|Switzerland", { country: "Switzerland" }],
    ["Vienna|Austria", { country: "Austria" }],
    ["Dublin|Ireland", { country: "Ireland" }],
    ["Copenhagen|Denmark", { country: "Denmark" }],
    ["Stockholm|Sweden", { country: "Sweden" }],
    ["Oslo|Norway", { country: "Norway" }],
    ["Helsinki|Finland", { country: "Finland" }],
    ["Warsaw|Poland", { country: "Poland" }],
    ["Prague|Czech Republic", { country: "Czech Republic" }],
    ["Budapest|Hungary", { country: "Hungary" }],
    ["Athens|Greece", { country: "Greece" }],
    ["Lisbon|Portugal", { country: "Portugal" }],
    ["Moscow|Russia", { country: "Russia" }],

    // Africa
    ["Cairo|Egypt", { country: "Egypt" }],
    ["Lagos|Nigeria", { country: "Nigeria" }],
    ["Johannesburg|South Africa", { country: "South Africa" }],
    ["Cape Town|South Africa", { country: "South Africa" }],
    ["Nairobi|Kenya", { country: "Kenya" }],
    ["Casablanca|Morocco", { country: "Morocco" }],
    ["Accra|Ghana", { country: "Ghana" }],
    ["Addis Ababa|Ethiopia", { country: "Ethiopia" }],

    // North America
    ["New York|United States of America", { country: "United States of America" }],
    ["Birmingham|United States of America", { country: "United States of America" }],
    ["Los Angeles|United States of America", { country: "United States of America" }],
    ["Chicago|United States of America", { country: "United States of America" }],
    ["San Francisco|United States of America", { country: "United States of America" }],
    ["Washington, D.C.|United States of America", { country: "United States of America", displayName: "Washington" }],
    ["Seattle|United States of America", { country: "United States of America" }],
    ["Boston|United States of America", { country: "United States of America" }],
    ["Miami|United States of America", { country: "United States of America" }],
    ["Atlanta|United States of America", { country: "United States of America" }],
    ["Houston|United States of America", { country: "United States of America" }],
    ["Dallas|United States of America", { country: "United States of America" }],
    ["Denver|United States of America", { country: "United States of America" }],
    ["Phoenix|United States of America", { country: "United States of America" }],
    ["Las Vegas|United States of America", { country: "United States of America" }],
    ["San Diego|United States of America", { country: "United States of America" }],
    ["Austin|United States of America", { country: "United States of America" }],
    ["Honolulu|United States of America", { country: "United States of America" }],
    ["Anchorage|United States of America", { country: "United States of America" }],
    ["Detroit|United States of America", { country: "United States of America" }],
    ["Philadelphia|United States of America", { country: "United States of America" }],
    ["Minneapolis|United States of America", { country: "United States of America" }],
    ["St. Louis|United States of America", { country: "United States of America" }],
    ["Salt Lake City|United States of America", { country: "United States of America" }],
    ["Portland|United States of America", { country: "United States of America" }],
    ["San Jose|United States of America", { country: "United States of America" }],
    ["Sacramento|United States of America", { country: "United States of America" }],
    ["Charlotte|United States of America", { country: "United States of America" }],
    ["Nashville|United States of America", { country: "United States of America" }],
    ["Toronto|Canada", { country: "Canada" }],
    ["Vancouver|Canada", { country: "Canada" }],
    ["Montréal|Canada", { country: "Canada", displayName: "Montreal" }],
    ["Mexico City|Mexico", { country: "Mexico" }],

    // South America
    ["Sao Paulo|Brazil", { country: "Brazil", displayName: "São Paulo" }],
    ["Buenos Aires|Argentina", { country: "Argentina" }],
    ["Santiago|Chile", { country: "Chile" }],
    ["Lima|Peru", { country: "Peru" }],
    ["Bogota|Colombia", { country: "Colombia", displayName: "Bogotá" }],

    // Oceania
    ["Sydney|Australia", { country: "Australia" }],
    ["Melbourne|Australia", { country: "Australia" }],
    ["Brisbane|Australia", { country: "Australia" }],
    ["Perth|Australia", { country: "Australia" }],
    ["Auckland|New Zealand", { country: "New Zealand" }],
    ["Wellington|New Zealand", { country: "New Zealand" }],
    ["Christchurch|New Zealand", { country: "New Zealand" }],
]);

/** Check if a city+country combination is in the major cities list */
export function isMajorCity(city: string, country: string): MajorCityEntry | undefined {
    return MAJOR_CITIES.get(`${city}|${country}`);
}
