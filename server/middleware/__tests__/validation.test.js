const { validateEmail, validatePassword } = require('../validation');

describe('validateEmail', () => {
  test('rejects malformed email', () => {
    const result = validateEmail('invalid-email');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Please provide a valid email address');
  });

  test('accepts valid email', () => {
    const result = validateEmail('user@example.com');
    expect(result.isValid).toBe(true);
  });
});

describe('validatePassword', () => {
  test('rejects too short password', () => {
    const result = validatePassword('12345');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Password must be at least 6 characters long');
  });

  test('rejects password without numbers', () => {
    const result = validatePassword('abcdef');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Password must contain at least one letter and one number');
  });

  test('rejects password without letters', () => {
    const result = validatePassword('123456');
    expect(result.isValid).toBe(false);
    expect(result.message).toBe('Password must contain at least one letter and one number');
  });

  test('accepts strong password', () => {
    const result = validatePassword('abc123');
    expect(result.isValid).toBe(true);
  });
});
