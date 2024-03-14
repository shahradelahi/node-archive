import { ContentLike } from '@/types';
import { BIN_PATH } from '@szip/bin';
import { debug } from '@szip/debugger';
import { SZipError } from '@szip/error';
import { auditArgsWithStdout } from '@szip/helpers';
import { ArchiveInfo, parseArchiveInfo } from '@szip/parser';
import { execa } from 'execa';
import { PathLike } from 'node:fs';
import type { Writable as WritableStream } from 'node:stream';
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

export async function add<Type extends ArchiveType = ArchiveType>(
  filename: PathLike,
  options: SZipAddOptions & { raw?: false }
): Promise<SafeReturn<ArchiveInfo<Type>, SZipError>>;

export async function add(
  filename: PathLike,
  options: SZipAddOptions & { stdout?: WritableStream; raw?: never }
): Promise<SafeReturn<boolean, SZipError>>;

export async function add(
  filename: PathLike,
  options: SZipAddOptions & { raw: true }
): Promise<SafeReturn<string, SZipError>>;

/**
 * Add files to an archive.
 *
 * @param filename
 * @param options
 */
export async function add<Type extends ArchiveType = ArchiveType>(
  filename: PathLike,
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

  const INCLUDE_FLAG = options.recurse ? '-ir!' : '-i!';
  const EXCLUDE_FLAG = options.recurse ? '-xr!' : '-x!';

  // Examples:
  // 7z a -tzip src.zip *.txt -ir!DIR1\*.cpp

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

  if (options.exclude) {
    options.exclude.forEach((exclude) => {
      args.push(EXCLUDE_FLAG + exclude);
    });
  }

  if (options.include) {
    options.include.forEach((include) => {
      args.push(INCLUDE_FLAG + include);
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

  const result = await execa(BIN_PATH, args, {
    cwd: options?.cwd
  });

  debug('add', result.command);

  const message = result.stdout !== '' ? result.stdout : result.stderr;
  if (options.raw) {
    return { data: message };
  }

  if (result.stderr !== '') {
    return { error: SZipError.fromStderr(result.stderr) };
  }

  if (result.stdout === '') {
    return { error: new SZipError('Empty') };
  }

  return { data: parseArchiveInfo(message) };
}
