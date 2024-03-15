import { SZipError } from '@szip/error';
import type {
  Archive7z,
  ArchiveInfo,
  ArchiveTarFile,
  ArchiveTar,
  Archive7zFile
} from '@szip/parser/types';
import { detectArchiveType } from '@szip/helpers';

function parse7zArchiveInfo(message: string): Archive7z {
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

  const files: Archive7zFile[] = [];
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

function parseTarArchiveInfo(message: string): ArchiveTar {
  const FILE_REGEX =
    /Path = (.+)\nFolder = (.+)\nSize = (\d+)\nPacked Size = (\d+)\nModified = (.+)?\nCreated = (.+)?\nAccessed = (.+)?\nMode = (.+)?\nUser = (.+)?\nGroup = (.+)?\nUser ID = (.+)?\nGroup ID = (.+)?\nSymbolic Link = (.+)?\nHard Link = (.+)?\nCharacteristics = (.+)?\nComment = (.+)?\nDevice Major = (.+)?\nDevice Minor = (.+)?/gm;

  const files: ArchiveTarFile[] = [];
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

  const archivePath = /(?:Creating|Open|Updating|Listing) archive: (.+)$/gm.exec(message);
  const physicalSize = /^Physical Size = (\d+)/gm.exec(message);
  const headersSize = /^Headers Size = (\d+)/gm.exec(message);
  const codePage = /^Code Page = (.+)/gm.exec(message);
  const characteristics = /^Characteristics = (.+)/gm.exec(message);

  return {
    path: archivePath ? archivePath[1] : '',
    type: 'tar',
    physicalSize: physicalSize ? parseInt(physicalSize[1]) : 0,
    headersSize: headersSize ? parseInt(headersSize[1]) : 0,
    codePage: codePage ? codePage[1] : '',
    characteristics: characteristics ? characteristics[1] : '',
    files
  };
}

export function parseArchiveInfo(message: string): ArchiveInfo<any> | SZipError {
  const type = detectArchiveType(message);

  if (!type) {
    throw new SZipError('Archive type not detected');
  }

  if (type === '7z') {
    return parse7zArchiveInfo(message);
  }

  if (type === 'tar') {
    return parseTarArchiveInfo(message);
  }

  throw new SZipError('Archive type not supported');
}
