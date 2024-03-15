import {
  ArchiveResult,
  ArchiveTar,
  parseArchiveInfo,
  parseError,
  SZipCompressResult
} from '@szip/parser';
import { parseArchiveResult } from '@szip/parser/parse-archive-result';
import { parseCompressMessage } from '@szip/parser/parse-compress-message';
import { log } from '@tests/log';
import { expect } from 'chai';
import { Archive7z } from 'szip';

describe('SZip - Message Parser', () => {
  describe('Create and Modify', () => {
    const MessageList = {
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

    it('should parse a update message', () => {
      const message = MessageList.MODIFY_ARCHIVE;

      const expected: ArchiveResult<'update', 'tar'> = {
        path: 'source.tar',
        size: 13312,
        header: {
          type: 'tar',
          physicalSize: 13312,
          headersSize: 5632,
          codePage: 'UTF-8',
          characteristics: 'GNU ASCII'
        },
        added: {
          folders: 3,
          files: 6,
          bytes: 6865
        }
      };

      const result = parseArchiveResult(message);
      log(result);

      expect(result).to.deep.equal(expected);
    });

    it('should parse a update message with previous archive', () => {
      const expected: ArchiveResult<'update', 'tar'> = {
        path: 'project.tar',
        size: 2865664,
        header: {
          type: 'tar',
          physicalSize: 20992,
          headersSize: 6656,
          codePage: 'UTF-8',
          characteristics: 'GNU ASCII'
        },
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

      const result = parseArchiveResult(MessageList.UPDATE_ADDED_ARCHIVE);
      log(result);

      expect(result).to.deep.equal(expected);
    });

    it('should parse a update message with deleted archive', () => {
      const message = MessageList.UPDATE_DELETED_ARCHIVE;

      const expected: ArchiveResult<'delete', 'tar'> = {
        path: 'package.tar',
        size: 3584,
        header: {
          type: 'tar',
          physicalSize: 78336,
          headersSize: 2048,
          codePage: 'UTF-8',
          characteristics: 'GNU ASCII'
        },
        deleted: {
          files: 1,
          bytes: 74192
        },
        previous: {
          files: 1,
          bytes: 1760
        },
        added: {
          files: 0,
          bytes: 0
        }
      };

      const result = parseArchiveResult(message);
      log(result);

      expect(result).to.deep.equal(expected);
    });

    it('should parse a new archive message', () => {
      const message = MessageList.NEW_ARCHIVE;

      const expected: ArchiveResult<'create'> = {
        path: 'project.zip',
        size: 1231162,
        added: {
          folders: 5,
          files: 15,
          bytes: 2852280
        }
      };

      const result = parseArchiveResult(message);
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

    it('should parse a 7z archive list', () => {
      const message = MessageList.LIST_7Z;

      const expected: Archive7z = {
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

      const expected: ArchiveTar = {
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

  describe('Compress', () => {
    const MessageList: Record<string, string> = {
      COMPRESS_XZ: `\
7-Zip (z) 23.01 (x64) : Copyright (c) 1999-2023 Igor Pavlov : 2023-06-20
 64-bit locale=en_US.UTF-8 Threads:8 OPEN_MAX:1048576, ASM

Creating archive: /home/master/Projects/WebstormProjects/Github/node-archive/source.tar.xz

Add new data to archive: 1 file


Files read from disk: 1
Archive size: 1003532 bytes (981 KiB)
Everything is Ok`
    };

    it('should parse a compress message', () => {
      const message = MessageList.COMPRESS_XZ;

      const expected: SZipCompressResult = {
        path: '/home/master/Projects/WebstormProjects/Github/node-archive/source.tar.xz',
        size: 1003532
      };

      const result = parseCompressMessage(message);
      log(result);

      expect(result).to.deep.equal(expected);
    });
  });

  describe('Error', () => {
    const MessageList = {
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

    // Errors with \n\n as separator are multi-line errors

    it('should parse a cmdline error message', async () => {
      const message = MessageList.CMDLINE_ERROR_SINGLE;

      const expected = 'Command Line Error: Incorrect wildcard type marker src/*.*';

      const result = parseError(message);
      log(result);

      expect(result).to.equal(expected);
    });

    it('should parse a cmdline error message with multi-line', async () => {
      const message = MessageList.CMDLINE_ERROR_MULTI;

      const expected = `\
WARNING: errno=2 : No such file or directory !package.json`;

      const result = parseError(message);
      log(result);

      expect(result).to.equal(expected);
    });

    it('should parse a cmdline error message with multi-line 2', async () => {
      const message = MessageList.CMDLINE_ERROR_MULTI;

      const expected = `\
WARNING: errno=2 : No such file or directory !package.json`;

      const result = parseError(message);
      log(result);

      expect(result).to.equal(expected);
    });
  });
});
