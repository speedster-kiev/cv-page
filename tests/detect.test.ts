import { describe, expect, it } from 'vitest';
import { findEmails, findPhones, hasContactShape } from '../src/lib/contact/detect';

// All values below are invented; no real contact detail belongs in the repo.
const phoneRejects = [
  '+45 12 34 56 78',
  '(555) 123-4567',
  '12345678',
  '+380-44-123-45-67',
  'call 555.123.4567 today',
  '2021-03-15',
];

const emailRejects = ['jane.doe@example.com', 'write to a_b+tag@mail.example.org now'];

const accepts = [
  '',
  '2019–2023',
  '2019-2023',
  '2019 – 2023',
  '1 000 000',
  'about 12 500 000 customers',
  '~48 to 16 days',
  '20+ years',
  '10 engineers',
  'cut from 10 seconds to 2.8 seconds',
  '123 456 789',
  'founded in 2008, left in 2011',
  'two lines\n2019\n2023',
];

describe('findEmails', () => {
  it.each(emailRejects)('finds an email in %j', (text) => {
    expect(findEmails(text)).toHaveLength(1);
  });

  it('returns the matched value', () => {
    expect(findEmails('mail jane.doe@example.com please')).toEqual(['jane.doe@example.com']);
  });

  it.each([...accepts, ...phoneRejects])('finds no email in %j', (text) => {
    expect(findEmails(text)).toEqual([]);
  });
});

describe('findPhones', () => {
  it.each(phoneRejects)('finds a phone in %j', (text) => {
    expect(findPhones(text)).toHaveLength(1);
  });

  it('returns the matched run without surrounding words', () => {
    expect(findPhones('call +45 12 34 56 78 today')).toEqual(['+45 12 34 56 78']);
  });

  it.each(accepts)('exempts %j', (text) => {
    expect(findPhones(text)).toEqual([]);
  });

  it.each(emailRejects)('finds no phone in %j', (text) => {
    expect(findPhones(text)).toEqual([]);
  });
});

describe('hasContactShape', () => {
  it.each(emailRejects)('classifies %j as email', (text) => {
    expect(hasContactShape(text)).toBe('email');
  });

  it.each(phoneRejects)('classifies %j as phone', (text) => {
    expect(hasContactShape(text)).toBe('phone');
  });

  it.each(accepts)('passes %j', (text) => {
    expect(hasContactShape(text)).toBeNull();
  });
});
