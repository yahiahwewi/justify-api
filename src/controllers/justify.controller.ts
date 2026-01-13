import { type Request, type Response } from 'express';
import { justifyText } from '../utils/textJustifier.js';

/**
 * Justify Controller
 *
 * This controller is intentionally thin.
 * Business logic lives in services (textJustifier utility).
 * Controllers only orchestrate the request flow.
 */

/**
 * Handles text justification requests.
 * Expects plain text input and returns justified plain text output.
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export const justify = (req: Request, res: Response): void => {
  // Extract the plain text body
  // Express text parser middleware converts the body to a string
  const text = typeof req.body === 'string' ? req.body : '';

  // Validate that we received text
  if (!text || text.trim() === '') {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Request body must contain text to justify',
    });
    return;
  }

  // Delegate to the justification service
  // This keeps the controller focused on HTTP concerns only
  const justifiedText = justifyText(text);

  // Return as plain text
  // We enforce text/plain to match the input format
  res.setHeader('Content-Type', 'text/plain');
  res.send(justifiedText);
};
