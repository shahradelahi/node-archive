import { PathLike } from 'node:fs';
import { fileURLToPath } from 'node:url';

export function normalizePathLike(path: PathLike): string {
  if (path instanceof URL) {
    return fileURLToPath(path);
  }

  return path.toString();
}
