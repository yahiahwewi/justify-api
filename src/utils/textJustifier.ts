/**
 * Text Justification Utility - Token-Based Logique Pure
 *
 * This implementation treats spaces as first-class tokens to preserve semantic spacing
 * (e.g., double spaces within a line) while fulfilling the 80-character justification constraint.
 */

const MAX_WIDTH = 80;

/**
 * Justifies a line by distributing extra spaces into existing space tokens.
 *
 * @param tokens - Array of words and space-tokens for the current line
 * @returns Fully justified string of exactly 80 characters
 */
const justifyLineTokens = (tokens: string[]): string => {
  // Identify space slots (indices of tokens that are whitespace)
  const spaceSlotIndices = tokens
    .map((t, i) => (t.trim() === '' ? i : -1))
    .filter((i) => i !== -1);

  const currentLength = tokens.join('').length;

  // If no space slots (single word longer than 80 chars) or already at width
  if (spaceSlotIndices.length === 0 || currentLength >= MAX_WIDTH) {
    return tokens.join('');
  }

  const spacesToAdd = MAX_WIDTH - currentLength;
  const spacesPerSlot = Math.floor(spacesToAdd / spaceSlotIndices.length);
  let extraSpaces = spacesToAdd % spaceSlotIndices.length;

  const newTokens = [...tokens];
  for (const index of spaceSlotIndices) {
    const additional = spacesPerSlot + (extraSpaces > 0 ? 1 : 0);
    newTokens[index] += ' '.repeat(additional);
    if (extraSpaces > 0) extraSpaces--;
  }

  return newTokens.join('');
};

/**
 * Main justification function.
 * Implements the token-based "Pure Logic" approach:
 * 1. Safe normalization (tabs, line endings).
 * 2. Paragraph detection (split by double newlines).
 * 3. Tokenization (preserving all word-internal spaces).
 * 4. Incremental line building without word alteration.
 */
export const justifyText = (text: string): string => {
  if (!text) return '';

  // 1. Normalize safely
  const normalized = text
    .replace(/\t/g, ' ') // Replace tabs with space
    .replace(/\r\n/g, '\n'); // Normalize line endings

  // 2. Detect paragraphs (separated by 2 or more newlines)
  const paragraphs = normalized.split(/\n{2,}/);

  const resultParagraphs = paragraphs.map((para) => {
    // 3. Tokenize the paragraph while preserving all spaces
    // We trim leading/trailing spaces for the paragraph block itself,
    // but keep everything in between.
    const tokens = para
      .replace(/\n/g, ' ') // Flatten internal newlines to spaces
      .trim()
      .split(/(\s+)/)
      .filter((t) => t !== '');

    if (tokens.length === 0) return '';

    const lines: string[] = [];
    let currentLineTokens: string[] = [];
    let currentLineLength = 0;

    // 4. Build lines incrementally
    for (const token of tokens) {
      // Rule: Never start a line with a space token
      if (currentLineTokens.length === 0 && token.trim() === '') continue;

      if (currentLineLength + token.length <= MAX_WIDTH) {
        currentLineTokens.push(token);
        currentLineLength += token.length;
      } else {
        // Current token doesn't fit. Justify current line first.

        // Remove trailing space token if it exists before justification
        if (
          currentLineTokens.length > 0 &&
          currentLineTokens[currentLineTokens.length - 1]?.trim() === ''
        ) {
          const removed = currentLineTokens.pop()!;
          currentLineLength -= removed.length;
        }

        if (currentLineTokens.length > 0) {
          lines.push(justifyLineTokens(currentLineTokens));
        }

        // Start new line. If token is space, skip it (starting line with word)
        if (token.trim() !== '') {
          currentLineTokens = [token];
          currentLineLength = token.length;
        } else {
          currentLineTokens = [];
          currentLineLength = 0;
        }
      }
    }

    // 5. Handle the last line of the paragraph (Left-aligned)
    if (currentLineTokens.length > 0) {
      // Cleanup trailing space
      if (
        currentLineTokens[currentLineTokens.length - 1]?.trim() === ''
      ) {
        currentLineTokens.pop();
      }
      lines.push(currentLineTokens.join(''));
    }

    return lines.join('\n');
  });

  // 6. Join paragraphs with single empty line (\n\n)
  return resultParagraphs.filter((p) => p !== '').join('\n\n');
};
