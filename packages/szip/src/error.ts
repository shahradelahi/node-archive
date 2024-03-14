import { parseError } from '@szip/parser';
import { ExecaError } from 'execa';

export class SZipError extends Error {
  constructor(
    message: string,
    private command?: string
  ) {
    super(message);
  }

  static fromStderr(message: string) {
    return new SZipError(parseError(message));
  }

  static fromExecaError(result: ExecaError) {
    return new SZipError(parseError(result.stderr), result.command);
  }
}
