import { PathLike, promises, accessSync } from 'node:fs';

export async function fsAccess(path: PathLike, mode?: number): Promise<boolean> {
  try {
    await promises.access(path, mode);
    return true;
  } catch (_) {
    return false;
  }
}

export function fsAccessSync(path: PathLike, mode?: number): boolean {
  try {
    accessSync(path, mode);
    return true;
  } catch (_) {
    return false;
  }
}
