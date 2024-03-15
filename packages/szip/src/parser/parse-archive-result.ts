import { parseArchiveHeader } from '@szip/parser/parse-archive-header';
import { ArchiveResult, ArchiveStats } from '@szip/parser/types';

export function parseArchiveResult(message: string): ArchiveResult {
  const ADDED_FOLDER_FILE_BYTE_REGEX =
    /^Add new data to archive: (?:(\d+) folders, )?(\d+) files?, (\d+)/gm;

  const PREVIOUS_FOLDER_FILE_BYTE_REGEX =
    /^Keep old data in archive: (?:(\d+) folders, )?(\d+) files?, (\d+)/gm;

  const DELETED_FOLDER_FILE_BYTE_REGEX =
    /^Delete data from archive: (?:(\d+) folders, )?(\d+) files?, (\d+)/gm;

  const ARCHIVE_SIZE_REGEX = /^Archive size: (\d+) bytes/gm;

  const ARCHIVE_REGEX = /^(Creating|Updating) archive: (.+)$/gm;

  const archivePath = ARCHIVE_REGEX.exec(message);
  const archiveSize = ARCHIVE_SIZE_REGEX.exec(message);
  const result: Partial<ArchiveResult> = {
    path: archivePath![2],
    size: parseInt(archiveSize![1])
  };

  const parsedHeader = parseArchiveHeader(message);
  if (parsedHeader) {
    result.header = parsedHeader;
  }

  const deletedStats = DELETED_FOLDER_FILE_BYTE_REGEX.exec(message);
  if (deletedStats) {
    result.deleted = {
      files: parseInt(deletedStats[2]),
      bytes: parseInt(deletedStats[3])
    };
  }

  [ADDED_FOLDER_FILE_BYTE_REGEX, PREVIOUS_FOLDER_FILE_BYTE_REGEX].forEach((regex) => {
    const stats = regex.exec(message);
    if (stats) {
      const type = regex === ADDED_FOLDER_FILE_BYTE_REGEX ? 'added' : 'previous';
      const res: ArchiveStats = {
        folders: stats[1] ? parseInt(stats[1]) : undefined,
        files: parseInt(stats[2]),
        bytes: parseInt(stats[3])
      };

      if (typeof res.folders === 'undefined') {
        delete res.folders;
      }

      result[type] = res;
    }
  });

  return result as ArchiveResult;
}
