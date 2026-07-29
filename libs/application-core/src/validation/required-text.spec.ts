import { ApplicationError } from '../errors';
import { requiredText } from './required-text';

describe('requiredText', () => {
  it('trims valid input', () => {
    expect(requiredText('  value  ', 'field')).toBe('value');
  });

  it.each(['', '   ', 'abcd'])('rejects empty or oversized input: %p', (value) => {
    try {
      requiredText(value, 'field', 3);
      throw new Error('Expected validation to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationError);
      expect(error).toMatchObject({ code: 'INVALID_ARGUMENT' });
    }
  });
});
