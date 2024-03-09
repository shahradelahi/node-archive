import { fileURLToPath } from 'node:url';

export function getDirname() {
  return typeof __dirname === 'undefined'
    ? fileURLToPath(new URL(`.`, import.meta.url))
    : __dirname;
}
