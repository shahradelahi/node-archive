import type { ContentLike, WritableStream } from '@/types';
import { BIN_PATH } from '@szip/bin';
import { debug } from '@szip/debugger';
import { SZipError } from '@szip/error';
import { auditArgsWithStdout, handleExecaResult } from '@szip/helpers';
import { ArchiveInfo, ArchiveOperation, ArchiveResult } from '@szip/parser';
import { parseArchiveResult } from '@szip/parser/parse-archive-result';
import { addPattern, isRecurse } from '@szip/utils/pattern';
import { safeExec } from '@szip/utils/safe-exec';
import { PathLike } from 'node:fs';
import { ArchiveType, SafeReturn } from 'szip';

type SZipAddOptions = {
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
  // -sdel (Delete files after including to archive)
  deleteAfter?: boolean;
  // -sfx (create SFX)
  sfx?: boolean;
  // -si (use StdIn)
  stdin?: ContentLike;
  // -so (use StdOut)
  stdout?: WritableStream;
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
  // -v (Volumes)
  volumes?: string;
  // -w (Working Dir)
  cwd?: string;
  // -x (Exclude)
  exclude?: string[];
};

export async function add<
  Operation extends ArchiveOperation = 'create' | 'update',
  Type extends ArchiveType = any
>(
  filename: PathLike,
  patterns: string[],
  options: SZipAddOptions & { raw?: false }
): Promise<SafeReturn<ArchiveResult<Operation, Type>, SZipError>>;

export async function add(
  filename: PathLike,
  patterns: string[],
  options: SZipAddOptions & { stdout?: WritableStream; raw?: never }
): Promise<SafeReturn<boolean, SZipError>>;

export async function add(
  filename: PathLike,
  patterns: string[],
  options: SZipAddOptions & { raw: true }
): Promise<SafeReturn<string, SZipError>>;

/**
 * Add files to an archive.
 *
 * @param filename
 * @param patterns
 * @param options
 */
export async function add<Type extends ArchiveType = ArchiveType>(
  filename: PathLike,
  patterns: string[],
  options: SZipAddOptions & { raw?: boolean }
): Promise<SafeReturn<ArchiveInfo<Type> | string | boolean, SZipError>> {
  let args = ['a'];

  const audited = await auditArgsWithStdout(filename, args, {
    ...options,
    ignoreOverwrite: options.update
  });
  if (audited.error) {
    return audited;
  }

  if (audited.data) {
    args = audited.data;
  }

  if (options.type) {
    args.push('-t' + options.type); // Type of archive: zip, tar, etc.
  }

  if (options.password) {
    args.push(`-p${options.password}`);

    // On 7z format add -mhe switch
    if (options.type === '7z') {
      args.push('-mhe');
    }
  }

  // Add patterns
  Array.from(patterns || [])
    .filter((p) => p && p.trim() !== '')
    .forEach((p) => args.push(p.trim()));

  if (options.include) {
    options.include.forEach((include) => {
      args.push(addPattern('i', include, options.recurse ?? isRecurse(include)));
    });
  }

  if (options.exclude) {
    options.exclude.forEach((exclude) => {
      args.push(addPattern('x', exclude, options.recurse ?? isRecurse(exclude)));
    });
  }

  if (options.volumes) {
    args.push('-v' + options.volumes);
  }

  if (options.deleteAfter) {
    args.push('-sdel');
  }

  if (options.method) {
    args.push('-m' + options.method);
  }

  if (options.sfx) {
    args.push('-sfx');
  }

  if (options.fullyQualifiedPaths) {
    args.push('-spf');
  }

  if (options.requirePathSeparator) {
    args.push('-spm');
  }

  if (options.storeNTSecurityInformation) {
    args.push('-sni');
  }

  if (options.storeNTFSAlternateStreams) {
    args.push('-sns');
  }

  if (options.compressSharedFiles) {
    args.push('-ssw');
  }

  if (options.setArchiveTimestamp) {
    args.push('-stl');
  }

  if (options.excludeArchiveType) {
    args.push('-stx');
  }

  // Examples:
  //
  // $ 7z a archive1.zip subdir\
  // adds all files and subfolders from folder subdir to archive archive1.zip. The filenames
  // in archive will contain subdir\ prefix.
  //
  // $ 7z a archive.7z Folder1\ -xr!*.png
  // adds to the archive.7z all files from Folder1 and its subfolders, except *.png files.
  //
  // $ 7z a -tzip archive.zip *.txt -x!temp.*
  // adds to the archive.zip all *.txt files, except temp.* files.

  const { data, error } = await safeExec(BIN_PATH, args, {
    cwd: options?.cwd
  });

  if (error) {
    return { error: SZipError.fromExecaError(error) };
  }

  debug('add', data.command);

  // @ts-expect-error - It does not recognize the `operation` and `type` properties
  return handleExecaResult(data, {
    raw: options.raw || false,
    stdout: options.stdout,
    parser: parseArchiveResult
  });
}
