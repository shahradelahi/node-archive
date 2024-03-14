import { ContentLike } from '@/types';
import { normalizePathLike } from '@/utils/normalize';
import { BIN_PATH } from '@szip/bin';
import { debug } from '@szip/debugger';
import { handleExecaResult } from '@szip/helpers';
import { safeExec } from '@szip/utils/safe-exec';
import { PathLike } from 'node:fs';
import { basename } from 'node:path';
import { SafeReturn, SZipError } from 'szip';

type SZipEncryptOptions = {
  // -t (Type of archive)
  type?: string;
  // -p (Set Password)
  password: string;
  // -w (Working Dir)
  cwd?: string;
  // force overwrite
  force?: boolean;
};

export async function encrypt(
  output: PathLike,
  content: ContentLike,
  options: SZipEncryptOptions & { raw: true }
): Promise<SafeReturn<string, SZipError>>;

export async function encrypt(
  output: PathLike,
  content: ContentLike,
  options: SZipEncryptOptions & { raw?: false }
): Promise<SafeReturn<boolean, SZipError>>;

/**
 * Encrypt an archive
 *
 * @param output
 * @param content
 * @param options
 */
export async function encrypt(
  output: PathLike,
  content: ContentLike,
  options: SZipEncryptOptions & { raw?: boolean }
): Promise<SafeReturn<string | boolean, SZipError>> {
  const normalizedPath = normalizePathLike(output);
  const args = ['a', '-si', normalizedPath];

  if (!options.password) {
    throw new Error('Password is required');
  }

  if (options.type) {
    args.push(`-t${options.type}`);
  }

  args.push(`-p${options.password}`);

  const filename = basename(normalizedPath);

  if (filename.endsWith('.7z')) {
    args.push('-mhe=on');
  }

  const { data, error } = await safeExec(BIN_PATH, args, {
    input: content,
    cwd: options?.cwd,
    stderr: 'pipe'
  });

  if (error) {
    return { error: SZipError.fromExecaError(error) };
  }

  debug('encrypt', data.command);

  return handleExecaResult(data, {
    raw: options.raw || false,
    stdout: undefined,
    parser: () => true
  });
}
