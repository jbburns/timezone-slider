import { describe, it, expect } from 'vitest';
import { getTimezoneAbbreviation } from './timezoneAbbrev';

describe('getTimezoneAbbreviation', () => {
  it('returns a non-empty string for a valid timezone', () => {
    const abbr = getTimezoneAbbreviation('America/New_York');
    expect(abbr).toBeTruthy();
    expect(abbr.length).toBeGreaterThan(0);
  });

  it('returns EST or EDT for America/New_York', () => {
    const abbr = getTimezoneAbbreviation('America/New_York');
    expect(['EST', 'EDT']).toContain(abbr);
  });

  it('returns PST or PDT for America/Los_Angeles', () => {
    const abbr = getTimezoneAbbreviation('America/Los_Angeles');
    expect(['PST', 'PDT']).toContain(abbr);
  });

  it('returns JST for Asia/Tokyo (no DST)', () => {
    const abbr = getTimezoneAbbreviation('Asia/Tokyo');
    expect(abbr).toBe('JST');
  });

  it('returns SGT for Asia/Singapore', () => {
    const abbr = getTimezoneAbbreviation('Asia/Singapore');
    expect(abbr).toBe('SGT');
  });

  it('returns IST for Asia/Kolkata', () => {
    const abbr = getTimezoneAbbreviation('Asia/Kolkata');
    expect(abbr).toBe('IST');
  });

  it('returns AEST or AEDT for Australia/Sydney', () => {
    const abbr = getTimezoneAbbreviation('Australia/Sydney');
    expect(['AEST', 'AEDT']).toContain(abbr);
  });

  it('returns CET or CEST for Europe/Paris', () => {
    const abbr = getTimezoneAbbreviation('Europe/Paris');
    expect(['CET', 'CEST']).toContain(abbr);
  });

  it('returns GMT or BST for Europe/London', () => {
    const abbr = getTimezoneAbbreviation('Europe/London');
    expect(['GMT', 'BST']).toContain(abbr);
  });

  it('returns the timezone string for an invalid timezone', () => {
    const abbr = getTimezoneAbbreviation('Invalid/Timezone');
    expect(abbr).toBe('Invalid/Timezone');
  });

  it('accepts a custom date parameter', () => {
    // January date — should be standard time in northern hemisphere
    const winter = new Date(2025, 0, 15);
    const abbr = getTimezoneAbbreviation('America/New_York', winter);
    expect(abbr).toBe('EST');
  });

  it('returns DST abbreviation in summer', () => {
    // July date — should be daylight time in northern hemisphere
    const summer = new Date(2025, 6, 15);
    const abbr = getTimezoneAbbreviation('America/New_York', summer);
    expect(abbr).toBe('EDT');
  });
});
