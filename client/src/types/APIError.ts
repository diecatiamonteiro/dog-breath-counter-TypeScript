/**
 * @file APIError.ts
 * @description Types for API errors
 *              Describes what a typical error response from BE might look like:
 *                - Message can exist at the top level
 *                - Message can exist inside response
 *              Used in the api calls src/api/
 */

export interface APIError {
  message?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
}
