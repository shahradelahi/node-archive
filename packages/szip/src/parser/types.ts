export type ArchiveType = '7z' | 'tar' | 'zip';

export type Archive7z = {
  path: string;
  type: string;
  physicalSize: number;
  headersSize: number;
  method: string[];
  solid: boolean;
  blocks: number;
  files: Archive7zFile[];
};

export type Archive7zFile = {
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

export type ArchiveTar = {
  path: string;
  type: string;
  physicalSize: number;
  headersSize: number;
  codePage: string;
  characteristics: string;
  files: ArchiveTarFile[];
};

export type ArchiveTarFile = {
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

export type ArchiveZip = {
  path: string;
  type: string;
  physicalSize: number;
  files: ArchiveZipFile[];
};

export type ArchiveZipFile = {
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

interface InnerArchive extends Record<ArchiveType, object> {
  '7z': Archive7z;
  tar: ArchiveTar;
  zip: ArchiveZip;
}

export type ArchiveInfo<Type extends ArchiveType> = Type extends ArchiveType
  ? InnerArchive[Type]
  : never;
