/**
 * Text Justification Utility
 *
 * Implements a "Logique Pure" algorithm to justify text to exactly 80 characters.
 *
 * Constraints:
 * 1. Line length = 80 chars exactly (for non-last lines).
 * 2. Last line of paragraph = left-aligned.
 * 3. Spaces distributed evenly from left to right.
 * 4. Preservation of word integrity and paragraph logic.
 */

const MAX_WIDTH = 80;

/**
 * Justifies a single line of words to exactly MAX_WIDTH characters.
 * Calculates space distribution according to typographic standards.
 *
 * @param words Array of words to justify
 * @param totalChars Total number of characters in all words (sum of lengths)
 */
const justifyLine = (words: string[], totalChars: number): string => {
  // If only one word, we cannot distribute spaces in gaps, so return as is.
  // Note: The main loop handles word packing such that this usually only happens for 80+ char words.
  if (words.length <= 1) {
    return words[0] || '';
  }

  const totalSpaces = MAX_WIDTH - totalChars;
  const gaps = words.length - 1;

  // Each gap gets at least floor(TotalSpaces / Gaps)
  const spaceMin = Math.floor(totalSpaces / gaps);
  // Remainder spaces are distributed one-by-one to the first 'reste' gaps
  let reste = totalSpaces % gaps;

  let result = '';
  for (let i = 0; i < words.length; i++) {
    result += words[i];

    // If not the last word, add calculated spaces
    if (i < gaps) {
      const currentSpaces = spaceMin + (reste > 0 ? 1 : 0);
      result += ' '.repeat(currentSpaces);
      if (reste > 0) reste--;
    }
  }

  return result;
};

/**
 * Justifies input text to a fixed width of 80 characters.
 * Follows a multi-step "Pure Logic" approach as requested.
 *
 * @param text The raw input text
 */
export const justifyText = (text: string): string => {
  if (!text || text.trim() === '') {
    return '';
  }

  // Step 1: Pre-processing (Normalization)
  // Standardize whitespace and remove trailing/leading spaces.
  const normalized = text
    .replace(/\t/g, ' ')
    .replace(/\r/g, '')
    .trim();

  // Step 2: Paragraph Identification
  // We treat batches of newlines as paragraph breaks.
  const paragraphs = normalized.split(/\n\s*\n/);

  const resultLines: string[] = [];

  // Iterate through each logical paragraph
  for (const paragraph of paragraphs) {
    // Step 3: Extract words (Normalize internal newlines to spaces)
    const words = paragraph.replace(/\n/g, ' ').split(/\s+/).filter((w) => w !== '');
    if (words.length === 0) continue;

    let currentLineWords: string[] = [];
    let currentLineChars = 0;

    // Step 4: Greedy word packing with justification trigger
    for (const word of words) {
      // Condition: [Existing Chars] + [New Word] + [Min Spaces (Gap Count)]
      // The currentLineWords.length acts as the count of gaps we would have if we add this word.
      const estimatedLength = currentLineChars + word.length + currentLineWords.length;

      if (estimatedLength > MAX_WIDTH && currentLineWords.length > 0) {
        // Line is full -> Justify and push to results
        resultLines.push(justifyLine(currentLineWords, currentLineChars));

        // Start next line with current word
        currentLineWords = [word];
        currentLineChars = word.length;
      } else {
        // Word fits -> Add to current line
        currentLineWords.push(word);
        currentLineChars += word.length;
      }
    }

    // Step 5: Handle the last line of the paragraph (Left-aligned)
    if (currentLineWords.length > 0) {
      resultLines.push(currentLineWords.join(' '));
    }
  }

  // Step 6: Final Compilation
  // Joins all lines with a single newline, fulfilling the "several \n -> one \n" constraint for the final output.
  return resultLines.join('\n');
};
