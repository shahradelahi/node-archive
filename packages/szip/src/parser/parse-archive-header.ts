import { detectArchiveType } from '@szip/helpers';
import {
  BLOCKS_REGEX,
  CHARACTERISTICS_REGEX,
  CODE_PAGE_REGEX,
  HEADERS_SIZE_REGEX,
  METHOD_REGEX,
  PHYSICAL_SIZE_REGEX,
  SOLID_REGEX
} from '@szip/parser/regex';
import { Archive7zHeader, ArchiveHeader, ArchiveTarHeader, ArchiveType } from '@szip/parser/types';

export function cRegExp(regex: RegExp): RegExp {
  return new RegExp(regex.source, regex.flags);
}

function parseTarHeader(message: string): ArchiveTarHeader {
  const physicalSize = cRegExp(PHYSICAL_SIZE_REGEX).exec(message);
  const headersSize = cRegExp(HEADERS_SIZE_REGEX).exec(message);
  const codePage = cRegExp(CODE_PAGE_REGEX).exec(message);
  const characteristics = cRegExp(CHARACTERISTICS_REGEX).exec(message);

  return {
    type: 'tar',
    physicalSize: physicalSize ? parseInt(physicalSize[1]) : 0,
    headersSize: headersSize ? parseInt(headersSize[1]) : 0,
    codePage: codePage ? codePage[1] : '',
    characteristics: characteristics ? characteristics[1] : ''
  };
}

function parse7zHeader(message: string): Archive7zHeader {
  const physicalSize = cRegExp(PHYSICAL_SIZE_REGEX).exec(message);
  const headersSize = cRegExp(HEADERS_SIZE_REGEX).exec(message);
  const method = cRegExp(METHOD_REGEX).exec(message);
  const solid = cRegExp(SOLID_REGEX).exec(message);
  const blocks = cRegExp(BLOCKS_REGEX).exec(message);

  return {
    type: '7z',
    physicalSize: physicalSize ? parseInt(physicalSize[1]) : 0,
    headersSize: headersSize ? parseInt(headersSize[1]) : 0,
    method: method![1].split(' '),
    solid: solid![1] === '+',
    blocks: parseInt(blocks![1])
  };
}

export function parseArchiveHeader<Type extends ArchiveType>(
  message: string
): ArchiveHeader<Type> | undefined {
  const type = detectArchiveType(message);
  switch (type) {
    case '7z':
      return parse7zHeader(message) as ArchiveHeader<Type>;
    case 'tar':
      return parseTarHeader(message) as ArchiveHeader<Type>;
    case 'zip':
      throw new Error('Not implemented');
  }
}
