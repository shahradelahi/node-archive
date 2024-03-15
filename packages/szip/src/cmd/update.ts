import { ContentLike, WritableStream } from '@/types';
import { PathLike } from 'node:fs';

type SZipUpdateOptions = {
  // -bb (Set output log level)
  logLevel?: string;
  // -i (Include)
  include?: string[];
  // -m (Method)
  method?: string;
  // -p (Set Password)
  password?: string;
  // -r (Recurse)
  recurse?: boolean;
  // -sfx (create SFX)
  sfx?: boolean;
  // -so (use StdOut)
  stdout?: WritableStream;
  // -si (use StdIn)
  stdin?: ContentLike;
  // -sni (Store NT security information)
  storeNTSecurityInformation?: boolean;
  // -sns (Store NTFS alternate Streams)
  storeNTFSAlternateStreams?: boolean;
  // -ssw (Compress shared files)
  compressSharedFiles?: boolean;
  // -spf (Use fully qualified file paths)
  fullyQualifiedPaths?: boolean;
  // -spm (Require path separator mark for directory path)
  requirePathSeparator?: boolean;
  // -stl (Set archive timestamp from the most recently modified file)
  setArchiveTimestamp?: boolean;
  // -stx (Exclude archive type)
  excludeArchiveType?: boolean;
  // -t (Type of archive)
  type?: string;
  // -u (Update)
  update?: boolean;
  // -w (Working Dir)
  workingDir?: string;
  // -x (Exclude)
  exclude?: string[];
};

/**
 * Update older files in the archive and add files that are not already in the archive.
 *
 * @param filename
 * @param options
 */
export async function update(filename: PathLike, options: SZipUpdateOptions) {}
