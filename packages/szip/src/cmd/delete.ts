import { normalizePathLike } from '@/utils/normalize';
import { BIN_PATH } from '@szip/bin';
import { debug } from '@szip/debugger';
import { handleExecaResult } from '@szip/helpers';
import { ArchiveInfo, ArchiveResult, ArchiveType } from '@szip/parser';
import { parseArchiveResult } from '@szip/parser/parse-archive-result';
import { addPattern, isWildcard } from '@szip/utils/pattern';
import { safeExec } from '@szip/utils/safe-exec';
import { PathLike } from 'node:fs';
import { SafeReturn, SZipError } from 'szip';

type SZipDeleteOptions = {
  // -bb (Set output log level)
  logLevel?: string;
  // -i (Include)
  include?: string[];
  // -x (Exclude)
  exclude?: string[];
  // -m (Method)
  method?: string;
  // -w (Working Dir)
  cwd?: string;
  // -p (Set Password)
  password?: string;
  // -r (Recurse)
  recurse?: boolean;
  // -sns (Store NTFS alternate Streams)
  storeNTFSAlternateStreams?: boolean;
  // -u (Update)
  update?: boolean;
};

export async function del(
  filepath: PathLike,
  patterns: string[],
  options?: SZipDeleteOptions & { raw: true }
): Promise<SafeReturn<string, SZipError>>;

export async function del<Type extends ArchiveType = any>(
  filepath: PathLike,
  patterns: string[],
  options?: SZipDeleteOptions & { raw?: boolean }
): Promise<SafeReturn<ArchiveResult<'delete', Type>, SZipError>>;

/**
 * Deletes files from archive.
 *
 * @param filepath
 * @param patterns
 * @param options
 */
export async function del<Type extends ArchiveType = ArchiveType>(
  filepath: PathLike,
  patterns: string[],
  options?: SZipDeleteOptions & { raw?: boolean }
): Promise<SafeReturn<ArchiveInfo<Type> | string, SZipError>> {
  const normalizedPath = normalizePathLike(filepath);
  const args = ['d', normalizedPath];

  if (options?.logLevel) {
    args.push(`-bb${options.logLevel}`);
  }

  if (options?.password) {
    args.push(`-p${options.password}`);
  }

  if (options?.recurse) {
    args.push('-r');
  }

  if (options?.storeNTFSAlternateStreams) {
    args.push('-sns');
  }

  if (options?.update) {
    args.push('-u');
  }

  // Add patterns
  Array.from(patterns || [])
    .filter((p) => p && p.trim() !== '')
    .forEach((p) => args.push(p.trim()));

  if (options?.include) {
    options.include.forEach((include) => {
      args.push(addPattern('i', include, options.recurse ?? isWildcard(include)));
    });
  }

  if (options?.exclude) {
    options.exclude.forEach((exclude) => {
      args.push(addPattern('x', exclude, options.recurse ?? isWildcard(exclude)));
    });
  }

  // Examples:
  //
  // 7z d archive.zip *.bak -r
  // deletes *.bak files from archive archive.zip.

  const { data, error } = await safeExec(BIN_PATH, args, {
    cwd: options?.cwd
  });

  if (error) {
    return { error: SZipError.fromExecaError(error) };
  }

  debug('delete', data.command);

  // @ts-expect-error - It does not recognize the `type` property
  return handleExecaResult(data, {
    raw: options?.raw || false,
    parser: parseArchiveResult
  });
}
