/**
 * Text Justification Utility - Logique Pure
 * 
 * This module implements a precise text justification algorithm following typographic rules:
 * - Line width: exactly 80 characters.
 * - Uniform space distribution between words.
 * - Last line of paragraphs is left-aligned.
 * - Words are never modified or concatenated.
 */

const MAX_WIDTH = 80;

/**
 * Justifies a single line of words to exactly MAX_WIDTH characters.
 * 
 * @param words - Array of words for the current line
 * @param charCount - Sum of lengths of all words in the line
 * @returns Fully justified string of exactly 80 characters
 */
const justifyLine = (words: string[], charCount: number): string => {
  if (words.length <= 1) {
    return words[0] || '';
  }

  const totalSpacesNeeded = MAX_WIDTH - charCount;
  const gaps = words.length - 1;

  // Each gap gets at least this many spaces
  const spacesPerGap = Math.floor(totalSpacesNeeded / gaps);
  // Remainder spaces to distribute from left to right
  let extraSpaces = totalSpacesNeeded % gaps;

  let line = '';
  for (let i = 0; i < words.length; i++) {
    line += words[i];

    if (i < gaps) {
      const spacesToApply = spacesPerGap + (extraSpaces > 0 ? 1 : 0);
      line += ' '.repeat(spacesToApply);
      if (extraSpaces > 0) extraSpaces--;
    }
  }

  return line;
};

/**
 * Main justification function.
 * Implements the "Logique Pure" flow:
 * 1. Normalize whitespace (tabs to spaces).
 * 2. Identify paragraphs (split by double newlines).
 * 3. For each paragraph, build lines and justify them.
 * 4. Join all justified lines into a final text/plain response.
 * 
 * @param text - The raw input text
 * @returns Fully justified text
 */
export const justifyText = (text: string): string => {
  if (!text || text.trim() === '') {
    return '';
  }

  // Pre-processing
  const normalized = text
    .replace(/\t/g, ' ')
    .replace(/\r/g, '')
    .trim();

  // Split into paragraphs based on double newlines (or more)
  const paragraphBlocks = normalized.split(/\n\s*\n/);
  const resultLines: string[] = [];

  for (const block of paragraphBlocks) {
    // Flatten internal structure of the paragraph and get words
    const words = block.replace(/\n/g, ' ').split(/\s+/).filter(w => w !== '');
    if (words.length === 0) continue;

    let currentLineWords: string[] = [];
    let currentLineCharCount = 0;

    for (const word of words) {
      // Calculate mandatory length: words + minimum spaces (1 per gap)
      // currentLineWords.length gives us the number of gaps if we add the current word
      const minLengthIfAdded = currentLineCharCount + word.length + currentLineWords.length;

      if (minLengthIfAdded > MAX_WIDTH && currentLineWords.length > 0) {
        // Current line is full. Justify it and push.
        resultLines.push(justifyLine(currentLineWords, currentLineCharCount));

        // Reset for the next line starting with this word
        currentLineWords = [word];
        currentLineCharCount = word.length;
      } else {
        // Word fits in the current line
        currentLineWords.push(word);
        currentLineCharCount += word.length;
      }
    }

    // Handle the last line of the paragraph (Left-aligned)
    if (currentLineWords.length > 0) {
      resultLines.push(currentLineWords.join(' '));
    }
  }

  // Final join: fulfill the requirement of single newlines between all lines
  return resultLines.join('\n');
};
