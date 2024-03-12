import type { ArchiveType } from '@szip/parser/types';

export function detectArchiveType(message: string): ArchiveType | undefined {
  const matches = /--\n(?:.|\n)+^Type = (.+)/gm.exec(message);
  if (!matches || !matches[1]) {
    return;
  }

  return matches[1].trim() as ArchiveType;
}
