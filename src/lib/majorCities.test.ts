import { describe, it, expect } from 'vitest';
import { isMajorCity, MAJOR_CITIES } from './majorCities';

describe('isMajorCity', () => {
  it('returns entry for Tokyo, Japan', () => {
    const result = isMajorCity('Tokyo', 'Japan');
    expect(result).toBeDefined();
    expect(result!.country).toBe('Japan');
  });

  it('returns entry for New York', () => {
    const result = isMajorCity('New York', 'United States of America');
    expect(result).toBeDefined();
  });

  it('returns entry with displayName for Yangon (stored as Rangoon)', () => {
    const result = isMajorCity('Rangoon', 'Myanmar');
    expect(result).toBeDefined();
    expect(result!.displayName).toBe('Yangon');
  });

  it('returns entry with displayName for Bangalore (stored as Bengaluru)', () => {
    const result = isMajorCity('Bengaluru', 'India');
    expect(result).toBeDefined();
    expect(result!.displayName).toBe('Bangalore');
  });

  it('returns undefined for unknown city', () => {
    const result = isMajorCity('Smallville', 'Kansas');
    expect(result).toBeUndefined();
  });

  it('returns undefined for wrong country', () => {
    // London exists for UK but not for a random country
    const result = isMajorCity('London', 'Australia');
    expect(result).toBeUndefined();
  });

  it('requires exact city and country match', () => {
    // "Tokyo" exists but with "Japan", not with "China"
    const result = isMajorCity('Tokyo', 'China');
    expect(result).toBeUndefined();
  });
});

describe('MAJOR_CITIES', () => {
  it('contains more than 100 cities', () => {
    expect(MAJOR_CITIES.size).toBeGreaterThan(100);
  });

  it('contains cities from multiple continents', () => {
    expect(isMajorCity('Tokyo', 'Japan')).toBeDefined();          // Asia
    expect(isMajorCity('London', 'United Kingdom')).toBeDefined(); // Europe
    expect(isMajorCity('Lagos', 'Nigeria')).toBeDefined();         // Africa
    expect(isMajorCity('Sydney', 'Australia')).toBeDefined();      // Oceania
    expect(isMajorCity('Sao Paulo', 'Brazil')).toBeDefined();      // South America
    expect(isMajorCity('New York', 'United States of America')).toBeDefined(); // North America
  });
});
