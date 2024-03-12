import { parseError } from '@szip/parser';

export class SZipError extends Error {
  static fromStderr(message: string) {
    return new SZipError(parseError(message));
  }
}
