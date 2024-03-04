import { handleError } from './handle-error';

export async function tryOrExit(fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (error) {
    handleError(error);
  }
}
