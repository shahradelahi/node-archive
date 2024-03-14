import { SZipCompressResult } from '@szip/parser/types';

export function parseCompressMessage(message: string): SZipCompressResult {
  const ARCHIVE_SIZE_REGEX = /^Archive size: (\d+) bytes/gm;
  const ARCHIVE_REGEX = /^Creating archive: (.+)$/gm;

  const archivePath = ARCHIVE_REGEX.exec(message);
  const archiveSize = ARCHIVE_SIZE_REGEX.exec(message);

  return {
    path: archivePath![1],
    size: parseInt(archiveSize![1])
  };
}
