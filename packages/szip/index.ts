import { SZip } from '@szip/szip';

// ------------------------------

// @todo: export SZip option types

export type { ArchiveType, Archive7z, ArchiveZip, ArchiveTar } from '@szip/parser';

// ------------------------------

export type * from '@szip/types';

// ------------------------------

export { SZip };
export default SZip;
