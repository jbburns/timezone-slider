import { describe, it, expect } from 'vitest';
import { DateTime } from 'luxon';
import { TimeEngine } from './TimeEngine';

describe('TimeEngine', () => {
  describe('getCurrentTime', () => {
    it('returns a DateTime in the specified timezone', () => {
      const dt = TimeEngine.getCurrentTime('America/New_York');
      expect(dt.zoneName).toBe('America/New_York');
    });

    it('returns a DateTime in a different timezone', () => {
      const dt = TimeEngine.getCurrentTime('Asia/Tokyo');
      expect(dt.zoneName).toBe('Asia/Tokyo');
    });

    it('returns a valid DateTime', () => {
      const dt = TimeEngine.getCurrentTime('Europe/London');
      expect(dt.isValid).toBe(true);
    });
  });

  describe('formatHour', () => {
    it('formats a DateTime as HH:mm', () => {
      const dt = DateTime.fromObject({ hour: 9, minute: 30 }, { zone: 'UTC' });
      expect(TimeEngine.formatHour(dt)).toBe('09:30');
    });

    it('formats midnight correctly', () => {
      const dt = DateTime.fromObject({ hour: 0, minute: 0 }, { zone: 'UTC' });
      expect(TimeEngine.formatHour(dt)).toBe('00:00');
    });

    it('formats 23:59 correctly', () => {
      const dt = DateTime.fromObject({ hour: 23, minute: 59 }, { zone: 'UTC' });
      expect(TimeEngine.formatHour(dt)).toBe('23:59');
    });

    it('uses 24-hour format', () => {
      const dt = DateTime.fromObject({ hour: 14, minute: 5 }, { zone: 'UTC' });
      expect(TimeEngine.formatHour(dt)).toBe('14:05');
    });
  });

  describe('isBusinessHours', () => {
    it('returns true for 9:00', () => {
      const dt = DateTime.fromObject({ hour: 9, minute: 0 }, { zone: 'UTC' });
      expect(TimeEngine.isBusinessHours(dt)).toBe(true);
    });

    it('returns true for 17:00', () => {
      const dt = DateTime.fromObject({ hour: 17, minute: 0 }, { zone: 'UTC' });
      expect(TimeEngine.isBusinessHours(dt)).toBe(true);
    });

    it('returns true for 12:00 (midday)', () => {
      const dt = DateTime.fromObject({ hour: 12, minute: 0 }, { zone: 'UTC' });
      expect(TimeEngine.isBusinessHours(dt)).toBe(true);
    });

    it('returns false for 8:59', () => {
      const dt = DateTime.fromObject({ hour: 8, minute: 59 }, { zone: 'UTC' });
      expect(TimeEngine.isBusinessHours(dt)).toBe(false);
    });

    it('returns false for 18:00', () => {
      const dt = DateTime.fromObject({ hour: 18, minute: 0 }, { zone: 'UTC' });
      expect(TimeEngine.isBusinessHours(dt)).toBe(false);
    });

    it('returns false for midnight', () => {
      const dt = DateTime.fromObject({ hour: 0, minute: 0 }, { zone: 'UTC' });
      expect(TimeEngine.isBusinessHours(dt)).toBe(false);
    });

    it('returns false for 3 AM', () => {
      const dt = DateTime.fromObject({ hour: 3, minute: 0 }, { zone: 'UTC' });
      expect(TimeEngine.isBusinessHours(dt)).toBe(false);
    });
  });
});
