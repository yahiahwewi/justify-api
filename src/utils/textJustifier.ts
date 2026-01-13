/**
 * Text Justification Utility
 *
 * This module provides functionality to fully justify text to a specific line width (80 chars).
 * It ensures that standard lines have even spacing distributed from left to right,
 * while the last line of every paragraph remains left-aligned.
 */

const MAX_LINE_LENGTH = 80;

/**
 * Justifies a single line of words to exactly MAX_LINE_LENGTH.
 *
 * @param words - Array of words for the current line
 * @param currentLength - Total length of words in the line (without spaces)
 * @returns Justified string
 */
const justifyLine = (words: string[], currentLength: number): string => {
  // If there's only one word, we cannot justify it with spaces between words.
  // We just return the word, or potentially pad it (though usually left-aligned is fine for single words).
  if (words.length === 1) {
    return words[0] || '';
  }

  // Calculate total spaces needed to reach MAX_LINE_LENGTH
  const totalSpacesNeeded = MAX_LINE_LENGTH - currentLength;

  // Calculate gaps between words (words array length - 1)
  const gaps = words.length - 1;

  // Base spaces per gap
  const spacesPerGap = Math.floor(totalSpacesNeeded / gaps);

  // Extra spaces to distribute (from left to right)
  // These are the remainder spaces that don't divide evenly
  let extraSpaces = totalSpacesNeeded % gaps;

  let line = '';

  for (let i = 0; i < words.length; i++) {
    line += words[i];

    // If it's not the last word, add spaces
    if (i < gaps) {
      // Add base spaces
      line += ' '.repeat(spacesPerGap);

      // We distribute extra spaces from left to right
      // to mimic standard text justification behavior
      if (extraSpaces > 0) {
        line += ' ';
        extraSpaces--;
      }
    }
  }

  return line;
};

/**
 * Main function to justify text.
 * Handles paragraph splitting and line building logic.
 *
 * @param text - The raw input text
 * @returns Fully justified text
 */
export const justifyText = (text: string): string => {
  if (!text || text.trim() === '') {
    return '';
  }

  // Split text into paragraphs based on one or more newlines
  const paragraphs = text.split(/\n+/).filter((p) => p.trim() !== '');

  const justifiedParagraphs = paragraphs.map((paragraph) => {
    // Normalize whitespace
    const words = paragraph.trim().split(/\s+/);

    if (words.length === 0 || (words.length === 1 && words[0] === '')) {
      return '';
    }

    const lines: string[] = [];
    let currentLineWords: string[] = [];
    let currentLineLength = 0;

    for (const word of words) {
      const spaceNeeded = currentLineWords.length > 0 ? 1 : 0;

      if (currentLineLength + spaceNeeded + word.length <= MAX_LINE_LENGTH) {
        currentLineWords.push(word);
        currentLineLength += word.length + spaceNeeded;
      } else {
        // Justify the current line if it contains words
        if (currentLineWords.length > 0) {
          const lengthWithoutSpaces =
            currentLineLength - (currentLineWords.length - 1);
          lines.push(justifyLine(currentLineWords, lengthWithoutSpaces));
        }

        // Reset for the new line starting with this word
        currentLineWords = [word];
        currentLineLength = word.length;
      }
    }

    // Handle the last line (left-aligned)
    if (currentLineWords.length > 0) {
      lines.push(currentLineWords.join(' '));
    }

    return lines.join('\n');
  });

  return justifiedParagraphs.filter((p) => p !== '').join('\n');
};
