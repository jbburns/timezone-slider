export function getUserTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function getUserCityName(): string {
    const tz = getUserTimezone();
    if (!tz) return 'Unknown';

    const parts = tz.split('/');
    if (parts.length > 1) {
        return parts[parts.length - 1].replace(/_/g, ' ');
    }
    return tz;
}

export function getInitialHomeCity() {
    const tz = getUserTimezone();
    const name = getUserCityName();
    return {
        id: `home-${name}-${tz}`,
        name: name,
        country: 'Current Location',
        timezone: tz
    };
}
