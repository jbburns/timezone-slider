import { describe, it, expect } from 'vitest';
import { getUserTimezone, getUserCityName, getInitialHomeCity } from './GeoUtils';

describe('GeoUtils', () => {
  describe('getUserTimezone', () => {
    it('returns a string', () => {
      const tz = getUserTimezone();
      expect(typeof tz).toBe('string');
    });

    it('returns a valid IANA timezone', () => {
      const tz = getUserTimezone();
      // IANA timezones contain a slash (e.g., "America/New_York")
      expect(tz).toContain('/');
    });
  });

  describe('getUserCityName', () => {
    it('returns a string', () => {
      const name = getUserCityName();
      expect(typeof name).toBe('string');
    });

    it('returns the city part of the timezone (underscores replaced)', () => {
      const name = getUserCityName();
      expect(name).not.toContain('_');
    });

    it('does not include the region prefix', () => {
      const name = getUserCityName();
      expect(name).not.toContain('/');
    });
  });

  describe('getInitialHomeCity', () => {
    it('returns a City-like object', () => {
      const city = getInitialHomeCity();
      expect(city).toHaveProperty('id');
      expect(city).toHaveProperty('name');
      expect(city).toHaveProperty('country');
      expect(city).toHaveProperty('timezone');
    });

    it('has country set to "Current Location"', () => {
      const city = getInitialHomeCity();
      expect(city.country).toBe('Current Location');
    });

    it('has id starting with "home-"', () => {
      const city = getInitialHomeCity();
      expect(city.id).toMatch(/^home-/);
    });

    it('uses the user timezone', () => {
      const city = getInitialHomeCity();
      const tz = getUserTimezone();
      expect(city.timezone).toBe(tz);
    });
  });
});
