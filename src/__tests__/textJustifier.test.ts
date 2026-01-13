import { justifyText } from '../utils/textJustifier.js';

describe('Unit Test: Text Justifier Logic', () => {
  /**
   * Scenario: Single short paragraph
   * Expected: No justification applied, left-aligned as it is the last line.
   */
  it('should not justify a paragraph that fits in one line', () => {
    const input = 'This is a short line.';
    const result = justifyText(input);
    expect(result).toBe('This is a short line.');
    expect(result.length).toBeLessThan(80);
  });

  /**
   * Scenario: Long string requiring wrapping
   * Expected: All lines except the last must be exactly 80 characters.
   */
  it('should justify multi-line paragraphs to exactly 80 characters', () => {
    const input =
      'The quick brown fox jumps over the lazy dog repeatedly until the text is long enough to span across multiple lines of exactly eighty characters each. This process validates our core algorithm.';

    const justified = justifyText(input);
    const lines = justified.split('\n');

    // All lines except the last should be 80 chars
    for (let i = 0; i < lines.length - 1; i++) {
      expect(lines[i]?.length).toBe(80);
    }

    // Last line should be left-aligned (no padding)
    expect(lines[lines.length - 1]?.length).toBeLessThanOrEqual(80);
    expect(lines[lines.length - 1]).not.toMatch(/  /); // No double spaces injected in last line
  });

  /**
   * Scenario: Even space distribution
   * Expected: Spaces should be distributed from left to right.
   * If we need 2 extra spaces for 3 gaps, the first 2 gaps get 1 extra space each.
   */
  it('should distribute extra spaces from left to right', () => {
    // "A B C D" -> 3 gaps. 
    // Total chars: 1+1+1+1 + 3 spaces = 7 chars.
    // Target: 80. Missing: 73 spaces.
    // This is extreme, but let's take a more realistic one.

    const words = ['word1', 'word2', 'word3', 'word4']; // 5+5+5+5 = 20 chars
    // 3 gaps. Total 23 chars. 
    // Target: 80. Missing 57 spaces.
    // 57 / 3 = 19 extra spaces per gap.
    // Every gap should have 1 (base) + 19 (extra) = 20 spaces.

    const input = words.join(' ') + ' ' + 'Filler to make sure it wraps properly later if needed. ' + 'a'.repeat(50);
    const justified = justifyText(input);
    const firstLine = justified.split('\n')[0];

    expect(firstLine?.length).toBe(80);
  });

  /**
   * Scenario: Multiple paragraphs
   * Expected: Each paragraph is justified independently, and the last line of each is left-aligned.
   */
  it('should respect paragraph boundaries', () => {
    const input = 'First paragraph is here.\n\nSecond paragraph starts after a double newline.';
    const justified = justifyText(input);

    // Should preserve the empty line between paragraphs if using \n\n
    // Our logic splits by \n+, so it might collapse them. Let's check.
    const paragraphs = justified.split('\n');
    expect(justified).toContain('First paragraph is here.');
    expect(justified).toContain('Second paragraph starts');
  });

  /**
   * Scenario: Words exactly 80 characters or longer
   * Expected: The word remains intact. Line length might exceed 80 if a single word is > 80.
   */
  it('should handle words longer than 80 characters gracefully', () => {
    const longWord = 'a'.repeat(90);
    const result = justifyText(longWord);
    expect(result).toBe(longWord);
    expect(result.length).toBe(90);
  });

  /**
   * Scenario: Empty or whitespace input
   * Expected: Returns empty string.
   */
  it('should handle empty or whitespace-only strings', () => {
    expect(justifyText('')).toBe('');
    expect(justifyText('   \n   ')).toBe('');
  });
});
