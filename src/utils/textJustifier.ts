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
  // Split text into paragraphs based on newlines
  // We preserve paragraph structure as per requirements
  const paragraphs = text.split(/\n\s*\n|\n/); // Simple split by newline

  const justifiedParagraphs = paragraphs.map((paragraph) => {
    // Normalize whitespace: replace multiple spaces/tabs with single space
    // This ensures we start with a clean slate for spacing
    const words = paragraph.trim().split(/\s+/);

    // Handle empty paragraphs
    if (words.length === 0 || (words.length === 1 && words[0] === '')) {
      return '';
    }

    const lines: string[] = [];
    let currentLineWords: string[] = [];
    let currentLineLength = 0; // Length of characters specifically

    for (const word of words) {
      // Check if adding this word + a mandatory space exceeds standard
      // We add 1 for the space that would precede this word (unless it's first)
      const spaceNeeded = currentLineWords.length > 0 ? 1 : 0;

      if (currentLineLength + spaceNeeded + word.length <= MAX_LINE_LENGTH) {
        // Word fits in current line
        currentLineWords.push(word);
        currentLineLength += word.length + spaceNeeded;
      } else {
        // Word doesn't fit, justify the current line and start a new one
        // We calculate length without spaces for the justifier function
        const lengthForJustify = currentLineLength - (currentLineWords.length - 1);
        lines.push(justifyLine(currentLineWords, lengthForJustify));

        // Start new line with current word
        currentLineWords = [word];
        currentLineLength = word.length;
      }
    }

    // Handle the last line of the paragraph
    // The last line must remain left-aligned, so we simply join with single spaces
    if (currentLineWords.length > 0) {
      lines.push(currentLineWords.join(' '));
    }

    return lines.join('\n');
  });

  // Rejoin paragraphs with a newline
  return justifiedParagraphs.join('\n');
};
