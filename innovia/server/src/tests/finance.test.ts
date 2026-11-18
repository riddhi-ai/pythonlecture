import { describe, it, expect } from 'vitest';
import { FinanceService } from '../services/financeService.js';

describe('Financial Formulas & Business Intelligence Logic', () => {
  it('correctly calculates Worth It Score and Verdict for high margin, high hourly profit', () => {
    // 60% margin, $80/hr ($8000 cents/hr), 5.5% engagement
    const result = FinanceService.calculateWorthItScore(60, 8000, 5.5);

    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.verdict).toBe('Totally worth it!');
    expect(result.sticker).toBe('trophy');
  });

  it('correctly calculates Worth It Score and Verdict for moderate performance', () => {
    // 25% margin, $30/hr ($3000 cents/hr), 3.0% engagement
    const result = FinanceService.calculateWorthItScore(25, 3000, 3.0);

    expect(result.score).toBeGreaterThanOrEqual(45);
    expect(result.score).toBeLessThan(75);
    expect(result.verdict).toBe('Meh');
    expect(result.sticker).toBe('hourglass');
  });

  it('correctly calculates Worth It Score and Verdict for low margin or loss', () => {
    // 5% margin, $10/hr ($1000 cents/hr), 1.0% engagement
    const result = FinanceService.calculateWorthItScore(5, 1000, 1.0);

    expect(result.score).toBeLessThan(45);
    expect(result.verdict).toBe('Not worth it');
    expect(result.sticker).toBe('fire');
  });

  it('handles negative or zero revenue safely without division by zero', () => {
    const result = FinanceService.calculateWorthItScore(0, 0, 0);

    expect(result.score).toBe(0);
    expect(result.verdict).toBe('Not worth it');
  });

  it('handles high engagement rates capping at max component weight', () => {
    // 80% margin, $120/hr, 12% engagement
    const result = FinanceService.calculateWorthItScore(80, 12000, 12.0);

    expect(result.score).toBe(100);
    expect(result.verdict).toBe('Totally worth it!');
  });
});
