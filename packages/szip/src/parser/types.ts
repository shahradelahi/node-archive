export type ArchiveType = '7z' | 'tar' | 'zip';

export type Archive7z = {
  path: string;
  type: '7z';
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
  type: 'tar';
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
  type: 'zip';
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

export type ArchiveInfo<Type extends ArchiveType> = Type extends ArchiveType
  ? {
      '7z': Archive7z;
      tar: ArchiveTar;
      zip: ArchiveZip;
    }[Type]
  : never;

// -------------------------------

export interface SZipCompressResult {
  path: string;
  size: number;
}

// -------------------------------

export interface ArchiveTarHeader {
  type: 'tar';
  physicalSize: number;
  headersSize: number;
  codePage: string;
  characteristics: string;
}

export interface Archive7zHeader {
  type: '7z';
  physicalSize: number;
  headersSize: number;
  method: string[];
  solid: boolean;
  blocks: number;
}

export type ArchiveHeader<Type extends ArchiveType> = Type extends ArchiveType
  ? {
      '7z': Archive7zHeader;
      tar: ArchiveTarHeader;
      zip: never;
    }[Type]
  : never;

// -------------------------------

export type ArchiveStats<Operation extends ArchiveOperation = any> = {
  files: number;
  bytes: number;
} & (Operation extends 'delete' ? { folders?: never } : { folders: number });

export type ArchiveOperation = 'create' | 'update' | 'delete';

export type ArchiveResult<
  Operation extends ArchiveOperation = any,
  Type extends ArchiveType = any
> = {
  path: string;
  size: number;
  previous?: ArchiveStats<Operation>;
  added: ArchiveStats<Operation>;
} & (Operation extends 'create'
  ? { header?: never }
  : {
      header: ArchiveHeader<Type>;
    }) &
  (Operation extends 'delete' ? { deleted: ArchiveStats<Operation> } : { deleted?: never });

// -------------------------------
