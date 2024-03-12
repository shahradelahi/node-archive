import { fsAccessSync } from '@/utils/fs-access';
import { getDirname } from '@/utils/get-dirname';
import { join, resolve } from 'node:path';

export const BIN_PATH = process?.env?.SZIP_BIN_PATH ?? resolveBinPath();

function resolveBinPath() {
  // This path is for dev and its pointing to the dist folder and root of the project
  const develPath = resolve(join('dist', 'bin', '7zz'));
  if (fsAccessSync(develPath)) {
    return develPath;
  }

  // This path is for dist version and its pointing to bin directory at the dist folder
  const distLevel = resolve(join(getDirname(), 'dist', 'bin', '7zz'));
  if (fsAccessSync(distLevel)) {
    return distLevel;
  }

  // We are not going to use $(which 7z) result because it can be different from the one we are using
  throw new Error('p7z binary not found');
}
