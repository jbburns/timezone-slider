import { describe, it, expect } from 'vitest';
import { CityLink } from './CityLink';

describe('CityLink.search', () => {
  it('returns empty array for empty query', () => {
    expect(CityLink.search('')).toEqual([]);
  });

  it('returns empty array for single character', () => {
    expect(CityLink.search('a')).toEqual([]);
  });

  it('finds Tokyo', () => {
    const results = CityLink.search('Tokyo');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toBe('Tokyo');
    expect(results[0].timezone).toBe('Asia/Tokyo');
  });

  it('finds New York', () => {
    const results = CityLink.search('New York');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(r => r.name === 'New York')).toBe(true);
  });

  it('finds London', () => {
    const results = CityLink.search('London');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toBe('London');
    expect(results[0].country).toBe('United Kingdom');
  });

  it('resolves alias "Bangalore" to Bengaluru and uses displayName', () => {
    const results = CityLink.search('Bangalore');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(r => r.name === 'Bangalore')).toBe(true);
  });

  it('resolves alias "Yangon" to Rangoon and uses displayName', () => {
    const results = CityLink.search('Yangon');
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(r => r.name === 'Yangon')).toBe(true);
  });

  it('limits results to 10', () => {
    // A broad search that might match many cities
    const results = CityLink.search('San');
    expect(results.length).toBeLessThanOrEqual(10);
  });

  it('returns City objects with required fields', () => {
    const results = CityLink.search('Paris');
    expect(results.length).toBeGreaterThan(0);
    const city = results[0];
    expect(city).toHaveProperty('id');
    expect(city).toHaveProperty('name');
    expect(city).toHaveProperty('country');
    expect(city).toHaveProperty('timezone');
  });

  it('deduplicates results by id', () => {
    const results = CityLink.search('Tokyo');
    const ids = results.map(r => r.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });

  it('prioritizes abbreviation matches over city name matches', () => {
    // "EST" is a timezone abbreviation — abbreviation matches should come first
    const results = CityLink.search('EST');
    const abbrevResults = results.filter(r => r.matchReason === 'EST');
    const nonAbbrevResults = results.filter(r => !r.matchReason);
    // All abbreviation matches should appear before non-abbreviation matches
    if (abbrevResults.length > 0 && nonAbbrevResults.length > 0) {
      const lastAbbrevIndex = results.lastIndexOf(abbrevResults[abbrevResults.length - 1]);
      const firstNonAbbrevIndex = results.indexOf(nonAbbrevResults[0]);
      expect(lastAbbrevIndex).toBeLessThan(firstNonAbbrevIndex);
    }
  });

  it('only returns major cities', () => {
    // Search for a generic term — all results should be major cities
    const results = CityLink.search('London');
    // Should not return London, Ontario or London, Kentucky
    expect(results.every(r => r.country === 'United Kingdom')).toBe(true);
  });

});
