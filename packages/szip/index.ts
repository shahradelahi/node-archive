import * as Add from '@szip/cmd/add';
import * as Compress from '@szip/cmd/compress';
import * as Delete from '@szip/cmd/delete';
import * as Encrypt from '@szip/cmd/encrypt';
import * as List from '@szip/cmd/list';
import * as Update from '@szip/cmd/update';

export { Add, Compress, Delete, Encrypt, List, Update };

const SZip = {
  ...Add,
  ...Compress,
  ...Delete,
  ...Encrypt,
  ...List,
  ...Update
};

// ------------------------------

// @todo: export SZip option types

export type { ArchiveType, Archive7z, ArchiveZip, ArchiveTar } from '@szip/parser';
export type { SZipCompressResult } from '@szip/parser';

// ------------------------------

export { SZipError } from '@szip/error';

// ------------------------------

export type * from '@szip/types';

// ------------------------------

export { SZip };
export default SZip;
