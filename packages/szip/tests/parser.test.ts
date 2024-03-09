import { log } from '@tests/log';
import { expect } from 'chai';

describe('SZip - Message Parser', () => {
  describe('Create and Modify', () => {
    const MessageList: Record<string, string> = {
      MODIFY_ARCHIVE: `\
7-Zip (z) 23.01 (x64) : Copyright (c) 1999-2023 Igor Pavlov : 2023-06-20
 64-bit locale=en_US.UTF-8 Threads:8 OPEN_MAX:524288, ASM

Open archive: source.tar
--
Path = source.tar
Type = tar
Physical Size = 13312
Headers Size = 5632
Code Page = UTF-8
Characteristics = GNU ASCII

Scanning the drive:
3 folders, 6 files, 6865 bytes (7 KiB)

Updating archive: source.tar

Add new data to archive: 3 folders, 6 files, 6865 bytes (7 KiB)


Files read from disk: 9
Archive size: 13312 bytes (13 KiB)
Everything is Ok`,
      UPDATE_ADDED_ARCHIVE: `\
7-Zip (z) 23.01 (x64) : Copyright (c) 1999-2023 Igor Pavlov : 2023-06-20
 64-bit locale=en_US.UTF-8 Threads:8 OPEN_MAX:524288, ASM

Open archive: project.tar
--
Path = project.tar
Type = tar
Physical Size = 20992
Headers Size = 6656
Code Page = UTF-8
Characteristics = GNU ASCII

Scanning the drive:
2 folders, 7 files, 2837970 bytes (2772 KiB)

Updating archive: project.tar

Keep old data in archive: 3 folders, 8 files, 12585 bytes (13 KiB)
Add new data to archive: 2 folders, 7 files, 2837970 bytes (2772 KiB)


Files read from disk: 9
Archive size: 2865664 bytes (2799 KiB)
Everything is Ok`,
      UPDATE_DELETED_ARCHIVE: `\
7-Zip (z) 23.01 (x64) : Copyright (c) 1999-2023 Igor Pavlov : 2023-06-20
 64-bit locale=en_US.UTF-8 Threads:8 OPEN_MAX:524288, ASM

Open archive: package.tar
--
Path = package.tar
Type = tar
Physical Size = 78336
Headers Size = 2048
Code Page = UTF-8
Characteristics = GNU ASCII

Updating archive: package.tar


Delete data from archive: 1 file, 74192 bytes (73 KiB)
Keep old data in archive: 1 file, 1760 bytes (2 KiB)
Add new data to archive: 0 files, 0 bytes


Files read from disk: 0
Archive size: 3584 bytes (4 KiB)
Everything is Ok`,
      NEW_ARCHIVE: `\
7-Zip (z) 23.01 (x64) : Copyright (c) 1999-2023 Igor Pavlov : 2023-06-20
 64-bit locale=en_US.UTF-8 Threads:8 OPEN_MAX:524288, ASM

Scanning the drive:
5 folders, 15 files, 2852280 bytes (2786 KiB)

Creating archive: project.zip

Add new data to archive: 5 folders, 15 files, 2852280 bytes (2786 KiB)


Files read from disk: 15
Archive size: 1231162 bytes (1203 KiB)
Everything is Ok`
    };

    interface UpdateArchiveResult {
      path: string;
      size: number;
      type: string;
      physicalSize: number;
      headersSize: number;
      codePage: string;
      characteristics: string;
      previous?: ArchiveStats;
      deleted?: ArchiveStats;
      added: ArchiveStats;
    }

    interface CreateArchiveResult {
      path: string;
      size: number;
      added: ArchiveStats;
    }

    type ArchiveStats = {
      folders: number;
      files: number;
      bytes: number;
    };

    function parseUpdateArchive(message: string): UpdateArchiveResult {
      const ADDED_FOLDER_FILE_BYTE_REGEX =
        /Add new data to archive: (?:(\d+) folders, )?(\d+) files?, (\d+)/gm;

      const PREVIOUS_FOLDER_FILE_BYTE_REGEX =
        /Keep old data in archive: (?:(\d+) folders, )?(\d+) files?, (\d+)/gm;

      const DELETED_FOLDER_FILE_BYTE_REGEX =
        /Delete data from archive: (?:(\d+) folders, )?(\d+) files?, (\d+)/gm;

      const ARCHIVE_SIZE_REGEX = /^Archive size: (\d+) bytes/gm;

      const ARCHIVE_REGEX = /^(Creating|Updating) archive: (.+)$/gm;

      const archivePath = ARCHIVE_REGEX.exec(message);
      const archiveSize = ARCHIVE_SIZE_REGEX.exec(message);

      const type = /Type = (.+)/gm.exec(message)![1];
      const physicalSize = parseInt(/Physical Size = (\d+)/gm.exec(message)![1]);
      const headersSize = parseInt(/Headers Size = (\d+)/gm.exec(message)![1]);
      const codePage = /Code Page = (.+)/gm.exec(message)![1];
      const characteristics = /Characteristics = (.+)/gm.exec(message)![1];

      const result: Partial<UpdateArchiveResult> = {
        path: archivePath![2],
        size: parseInt(archiveSize![1]),
        type,
        physicalSize,
        headersSize,
        codePage,
        characteristics
      };

      const addedStats = ADDED_FOLDER_FILE_BYTE_REGEX.exec(message);
      if (addedStats) {
        result.added = {
          folders: addedStats[1] ? parseInt(addedStats[1]) : 0, // [1] is undefined if no folders
          files: parseInt(addedStats[2]),
          bytes: parseInt(addedStats[3])
        };
      }

      const previousStats = PREVIOUS_FOLDER_FILE_BYTE_REGEX.exec(message);
      if (previousStats) {
        result.previous = {
          folders: previousStats[1] ? parseInt(previousStats[1]) : 0,
          files: parseInt(previousStats[2]),
          bytes: parseInt(previousStats[3])
        };
      }

      const deletedStats = DELETED_FOLDER_FILE_BYTE_REGEX.exec(message);
      if (deletedStats) {
        result.deleted = {
          folders: deletedStats[1] ? parseInt(deletedStats[1]) : 0,
          files: parseInt(deletedStats[2]),
          bytes: parseInt(deletedStats[3])
        };
      }

      return result as UpdateArchiveResult;
    }

    function parseCreateArchive(message: string): CreateArchiveResult {
      const ADDED_FOLDER_FILE_BYTE_REGEX =
        /Add new data to archive: (\d+) folders, (\d+) files, (\d+) bytes/gm;

      const ARCHIVE_SIZE_REGEX = /^Archive size: (\d+) bytes/gm;

      const ARCHIVE_REGEX = /^(Creating|Updating) archive: (.+)$/gm;

      const archivePath = ARCHIVE_REGEX.exec(message);
      const archiveSize = ARCHIVE_SIZE_REGEX.exec(message);

      const addedStats = ADDED_FOLDER_FILE_BYTE_REGEX.exec(message)!;
      const added: ArchiveStats = {
        folders: addedStats[1] ? parseInt(addedStats[1]) : 0, // [1] is undefined if no folders
        files: parseInt(addedStats[2]),
        bytes: parseInt(addedStats[3])
      };

      return {
        path: archivePath![2],
        size: parseInt(archiveSize![1]),
        added
      };
    }

    it('should parse a update message', () => {
      const message = MessageList.MODIFY_ARCHIVE;

      const expected: UpdateArchiveResult = {
        path: 'source.tar',
        size: 13312,
        type: 'tar',
        physicalSize: 13312,
        headersSize: 5632,
        codePage: 'UTF-8',
        characteristics: 'GNU ASCII',
        added: {
          folders: 3,
          files: 6,
          bytes: 6865
        }
      };

      const result = parseUpdateArchive(message);
      log(result);

      expect(result).to.deep.equal(expected);
    });

    it('should parse a update message with previous archive', () => {
      const message = MessageList.UPDATE_ADDED_ARCHIVE;

      const expected: UpdateArchiveResult = {
        path: 'project.tar',
        size: 2865664,
        type: 'tar',
        physicalSize: 20992,
        headersSize: 6656,
        codePage: 'UTF-8',
        characteristics: 'GNU ASCII',
        added: {
          folders: 2,
          files: 7,
          bytes: 2837970
        },
        previous: {
          folders: 3,
          files: 8,
          bytes: 12585
        }
      };

      const result = parseUpdateArchive(message);
      log(result);

      expect(result).to.deep.equal(expected);
    });

    it('should parse a update message with deleted archive', () => {
      const message = MessageList.UPDATE_DELETED_ARCHIVE;

      const expected: UpdateArchiveResult = {
        path: 'package.tar',
        size: 3584,
        type: 'tar',
        physicalSize: 78336,
        headersSize: 2048,
        codePage: 'UTF-8',
        characteristics: 'GNU ASCII',
        deleted: {
          folders: 0,
          files: 1,
          bytes: 74192
        },
        previous: {
          folders: 0,
          files: 1,
          bytes: 1760
        },
        added: {
          folders: 0,
          files: 0,
          bytes: 0
        }
      };

      const result = parseUpdateArchive(message);
      log(result);

      expect(result).to.deep.equal(expected);
    });

    it('should parse a new archive message', () => {
      const message = MessageList.NEW_ARCHIVE;

      const expected: CreateArchiveResult = {
        path: 'project.zip',
        size: 1231162,
        added: {
          folders: 5,
          files: 15,
          bytes: 2852280
        }
      };

      const result = parseCreateArchive(message);
      log(result);

      expect(result).to.deep.equal(expected);
    });
  });

  describe('List', () => {
    const MessageList: Record<string, string> = {
      LIST_7Z: `\
7-Zip (z) 23.01 (x64) : Copyright (c) 1999-2023 Igor Pavlov : 2023-06-20
 64-bit locale=en_US.UTF-8 Threads:8 OPEN_MAX:524288, ASM

Scanning the drive for archives:
1 file, 1004250 bytes (981 KiB)

Listing archive: secure.tar.7z

--
Path = secure.tar.7z
Type = 7z
Physical Size = 1004250
Headers Size = 122
Method = LZMA2:24 7zAES
Solid = -
Blocks = 1

----------
Path = secure.tar
Size = 2868224
Packed Size = 1004128
Modified = 2024-03-08 00:09:39.2828660
Attributes = RA ----------
CRC = F2118818
Encrypted = +
Method = LZMA2:24 7zAES:19
Block = 0`,
      LIST_TAR: `\
7-Zip (z) 23.01 (x64) : Copyright (c) 1999-2023 Igor Pavlov : 2023-06-20
 64-bit locale=en_US.UTF-8 Threads:8 OPEN_MAX:524288, ASM

Scanning the drive for archives:
1 file, 2868224 bytes (2801 KiB)

Listing archive: source.tar

--
Path = source.tar
Type = tar
Physical Size = 2868224
Headers Size = 11264
Code Page = UTF-8
Characteristics = GNU ASCII

----------
Path = dist/bin
Folder = +
Size = 0
Packed Size = 0
Modified = 2024-03-07 03:48:23
Created = 
Accessed = 
Mode = drwxr-xr-x
User = 
Group = 
User ID = 0
Group ID = 0
Symbolic Link = 
Hard Link = 
Characteristics = 5 GNU ASCII
Comment = 
Device Major = 
Device Minor = 

Path = dist/bin/7zz
Folder = -
Size = 2763304
Packed Size = 2763776
Modified = 2024-03-07 03:48:23
Created = 
Accessed = 
Mode = -rwxr-xr-x
User = 
Group = 
User ID = 0
Group ID = 0
Symbolic Link = 
Hard Link = 
Characteristics = 0 GNU ASCII
Comment = 
Device Major = 
Device Minor = `,
      LIST_ZIP: `\
7-Zip (z) 23.01 (x64) : Copyright (c) 1999-2023 Igor Pavlov : 2023-06-20
 64-bit locale=C.UTF-8 Threads:8 OPEN_MAX:524288, ASM

Scanning the drive for archives:
1 file, 1231071 bytes (1203 KiB)

Listing archive: source.zip

--
Path = source.zip
Type = zip
Physical Size = 1231071

----------
Path = dist/bin
Folder = +
Size = 0
Packed Size = 0
Modified = 2024-03-07 03:48:23.8745316
Created = 
Accessed = 
Attributes = D drwxr-xr-x
Encrypted = -
Comment = 
CRC = 
Method = Store
Characteristics = NTFS
Host OS = Unix
Version = 20
Volume Index = 0
Offset = 0

Path = dist/bin/7zz
Folder = -
Size = 2763304
Packed Size = 1205072
Modified = 2024-03-07 03:48:23.8745316
Created = 
Accessed = 
Attributes =  -rwxr-xr-x
Encrypted = -
Comment = 
CRC = 2375CC5A
Method = Deflate
Characteristics = NTFS
Host OS = Unix
Version = 20
Volume Index = 0
Offset = 39`
    };

    type ArchiveType = '7z' | 'tar' | 'zip';

    type Archive7zInfo = {
      path: string;
      type: string;
      physicalSize: number;
      headersSize: number;
      method: string[];
      solid: boolean;
      blocks: number;
      files: Archive7zFileInfo[];
    };

    type Archive7zFileInfo = {
      path: string;
      size: number;
      packedSize: number;
      modified: string;
      attributes: string;
      crc: string;
      encrypted: boolean;
      method: string[];
      block: number;
    };

    type ArchiveTarInfo = {
      path: string;
      type: string;
      physicalSize: number;
      headersSize: number;
      codePage: string;
      characteristics: string;
      files: ArchiveTarFileInfo[];
    };

    type ArchiveTarFileInfo = {
      path: string;
      folder: boolean;
      size: number;
      packedSize: number;
      modified: string;
      created: string | undefined;
      accessed: string | undefined;
      mode: string;
      user: string | undefined;
      group: string | undefined;
      userID: number;
      groupID: number;
      symbolicLink: boolean;
      hardLink: boolean;
      characteristics: string;
      comment: string | undefined;
      deviceMajor: string | undefined;
      deviceMinor: string | undefined;
    };

    type ArchiveZipInfo = {
      path: string;
      type: string;
      physicalSize: number;
      files: ArchiveZipFileInfo[];
    };

    type ArchiveZipFileInfo = {
      path: string;
      folder: boolean;
      size: number;
      packedSize: number;
      modified: string;
      created: string | undefined;
      accessed: string | undefined;
      attributes: string | undefined;
      encrypted: boolean;
      comment: string | undefined;
      crc: string | undefined;
      method: string;
      characteristics: string;
      hostOS: string;
      version: number;
      volumeIndex: number;
      offset: number;
    };

    type ArchiveInfo<Type extends ArchiveType> = Type extends '7z'
      ? Archive7zInfo
      : Type extends 'tar'
        ? ArchiveTarInfo
        : Type extends 'zip'
          ? ArchiveZipInfo
          : never;

    function parse7zArchiveInfo(message: string): Archive7zInfo {
      const ARCHIVE_REGEX = /Listing archive: (.+)/gm;
      const archivePath = ARCHIVE_REGEX.exec(message)![1];

      const PHYSICAL_SIZE_REGEX = /^Physical Size = (\d+)/gm;
      const HEADERS_SIZE_REGEX = /^Headers Size = (\d+)/gm;
      const METHOD_REGEX = /^Method = (.+)/gm;
      const SOLID_REGEX = /^Solid = (.+)/gm;
      const BLOCKS_REGEX = /^Blocks = (\d+)/gm;

      const FILE_REGEX =
        /Path = (.+)\nSize = (\d+)\nPacked Size = (\d+)\nModified = (.+)\nAttributes = (.+)\nCRC = (.+)\nEncrypted = (.+)\nMethod = (.+)\nBlock = (\d+)/gm;

      const physicalSize = parseInt(PHYSICAL_SIZE_REGEX.exec(message)![1]);
      const headersSize = parseInt(HEADERS_SIZE_REGEX.exec(message)![1]);
      const method = METHOD_REGEX.exec(message)![1].split(' ');
      const solid = SOLID_REGEX.exec(message)![1] === '+';
      const blocks = parseInt(BLOCKS_REGEX.exec(message)![1]);

      const files: Archive7zFileInfo[] = [];
      let file: RegExpExecArray | null;
      while ((file = FILE_REGEX.exec(message)) !== null) {
        files.push({
          path: file[1],
          size: parseInt(file[2]),
          packedSize: parseInt(file[3]),
          modified: file[4],
          attributes: file[5],
          crc: file[6],
          encrypted: file[7] === '+',
          method: file[8].split(' '),
          block: parseInt(file[9])
        });
      }

      return {
        path: archivePath,
        type: '7z',
        physicalSize,
        headersSize,
        method,
        solid,
        blocks,
        files
      };
    }

    function parseTarArchiveInfo(message: string): ArchiveTarInfo {
      const ARCHIVE_REGEX = /Listing archive: (.+)/gm;
      const archivePath = ARCHIVE_REGEX.exec(message)![1];

      const PHYSICAL_SIZE_REGEX = /Physical Size = (\d+)/gm;
      const HEADERS_SIZE_REGEX = /Headers Size = (\d+)/gm;
      const CODE_PAGE_REGEX = /Code Page = (.+)/gm;
      const CHARACTERISTICS_REGEX = /Characteristics = (.+)/gm;

      const FILE_REGEX =
        /Path = (.+)\nFolder = (.+)\nSize = (\d+)\nPacked Size = (\d+)\nModified = (.+)?\nCreated = (.+)?\nAccessed = (.+)?\nMode = (.+)?\nUser = (.+)?\nGroup = (.+)?\nUser ID = (.+)?\nGroup ID = (.+)?\nSymbolic Link = (.+)?\nHard Link = (.+)?\nCharacteristics = (.+)?\nComment = (.+)?\nDevice Major = (.+)?\nDevice Minor = (.+)?/gm;

      const physicalSize = parseInt(PHYSICAL_SIZE_REGEX.exec(message)![1]);
      const headersSize = parseInt(HEADERS_SIZE_REGEX.exec(message)![1]);
      const codePage = CODE_PAGE_REGEX.exec(message)![1];
      const characteristics = CHARACTERISTICS_REGEX.exec(message)![1];

      const files: ArchiveTarFileInfo[] = [];
      let file: RegExpExecArray | null;
      while ((file = FILE_REGEX.exec(message)) !== null) {
        files.push({
          path: file[1],
          folder: file[2] === '+',
          size: parseInt(file[3]),
          packedSize: parseInt(file[4]),
          modified: file[5],
          created: file[6],
          accessed: file[7],
          mode: file[8],
          user: file[9],
          group: file[10],
          userID: parseInt(file[11]),
          groupID: parseInt(file[12]),
          symbolicLink: file[13] === '+',
          hardLink: file[14] === '+',
          characteristics: file[15],
          comment: file[16],
          deviceMajor: file[17],
          deviceMinor: file[18]
        });
      }

      return {
        path: archivePath,
        type: 'tar',
        physicalSize,
        headersSize,
        codePage,
        characteristics,
        files
      };
    }

    function detectArchiveType(message: string): ArchiveType | undefined {
      const matches = /--\n(?:.|\n)+^Type = (.+)/gm.exec(message);
      if (!matches || !matches[1]) {
        return;
      }

      return matches[1].trim() as ArchiveType;
    }

    function parseArchiveInfo(message: string): ArchiveInfo<any> {
      const type = detectArchiveType(message);

      if (!type) {
        throw new Error('Archive type not detected');
      }

      if (type === '7z') {
        return parse7zArchiveInfo(message);
      }

      if (type === 'tar') {
        return parseTarArchiveInfo(message);
      }

      throw new Error('Archive type not supported');
    }

    it('should parse a 7z archive list', () => {
      const message = MessageList.LIST_7Z;

      const expected: Archive7zInfo = {
        path: 'secure.tar.7z',
        type: '7z',
        physicalSize: 1004250,
        headersSize: 122,
        method: ['LZMA2:24', '7zAES'],
        solid: false,
        blocks: 1,
        files: [
          {
            path: 'secure.tar',
            size: 2868224,
            packedSize: 1004128,
            modified: '2024-03-08 00:09:39.2828660',
            attributes: 'RA ----------',
            crc: 'F2118818',
            encrypted: true,
            method: ['LZMA2:24', '7zAES:19'],
            block: 0
          }
        ]
      };

      const result = parseArchiveInfo(message);
      log(result);

      expect(result).to.deep.equal(expected);
    });

    it('should parse a tar archive list', () => {
      const message = MessageList.LIST_TAR;

      const expected: ArchiveTarInfo = {
        path: 'source.tar',
        type: 'tar',
        physicalSize: 2868224,
        headersSize: 11264,
        codePage: 'UTF-8',
        characteristics: 'GNU ASCII',
        files: [
          {
            path: 'dist/bin',
            folder: true,
            size: 0,
            packedSize: 0,
            modified: '2024-03-07 03:48:23',
            created: undefined,
            accessed: undefined,
            mode: 'drwxr-xr-x',
            user: undefined,
            group: undefined,
            userID: 0,
            groupID: 0,
            symbolicLink: false,
            hardLink: false,
            characteristics: '5 GNU ASCII',
            comment: undefined,
            deviceMajor: undefined,
            deviceMinor: undefined
          },
          {
            path: 'dist/bin/7zz',
            folder: false,
            size: 2763304,
            packedSize: 2763776,
            modified: '2024-03-07 03:48:23',
            created: undefined,
            accessed: undefined,
            mode: '-rwxr-xr-x',
            user: undefined,
            group: undefined,
            userID: 0,
            groupID: 0,
            symbolicLink: false,
            hardLink: false,
            characteristics: '0 GNU ASCII',
            comment: undefined,
            deviceMajor: undefined,
            deviceMinor: undefined
          }
        ]
      };

      const result = parseArchiveInfo(message);
      log(result);

      expect(result).to.deep.equal(expected);
    });
  });

  describe('Error', () => {
    const MessageList: Record<string, string> = {
      CMDLINE_ERROR_SINGLE: `\
Command Line Error:
Incorrect wildcard type marker
src/*.*`,
      CMDLINE_ERROR_SINGLE_2: `\
Command Line Error:
I won't write compressed data to a terminal`,
      CMDLINE_ERROR_MULTI: `\
WARNING: errno=2 : No such file or directory
!package.json


WARNING: errno=2 : No such file or directory
!pnpm-lock.yaml`
    };

    interface SZipError {
      message: string;
    }

    // Errors with \n\n as separator are multi-line errors

    function parseError(message: string): SZipError {
      const isMultiLine = message.includes('\n\n');

      if (isMultiLine) {
        const errors = message.split('\n\n');
        message = errors[0];
      }

      return {
        message
      };
    }

    it('should parse a cmdline error message', async () => {
      const message = MessageList.CMDLINE_ERROR_SINGLE;

      const expected: SZipError = {
        message: `\
Command Line Error:
Incorrect wildcard type marker
src/*.*`
      };

      const result = parseError(message);
      log(result);

      expect(result).to.deep.equal(expected);
    });

    it('should parse a cmdline error message with multi-line', async () => {
      const message = MessageList.CMDLINE_ERROR_MULTI;

      const expected: SZipError = {
        message: `\
WARNING: errno=2 : No such file or directory
!package.json`
      };

      const result = parseError(message);
      log(result);

      expect(result).to.deep.equal(expected);
    });

    it('should parse a cmdline error message with multi-line 2', async () => {
      const message = MessageList.CMDLINE_ERROR_MULTI;

      const expected: SZipError = {
        message: `\
WARNING: errno=2 : No such file or directory
!package.json`
      };

      const result = parseError(message);
      log(result);

      expect(result).to.deep.equal(expected);
    });
  });
});
