import { ContentLike } from '@/types';
import { BIN_PATH } from '@szip/bin';
import { debug } from '@szip/debugger';
import { SZipError } from '@szip/error';
import { auditArgsWithStdout, handleExecaResult } from '@szip/helpers';
import { SZipCompressResult } from '@szip/parser';
import { parseCompressMessage } from '@szip/parser/parse-compress-message';
import { execa } from 'execa';
import { PathLike } from 'node:fs';
import type { Writable as WritableStream } from 'node:stream';
import { SafeReturn } from 'szip';

type SZipCompressOptions = {
  // -m (Method)
  method?: string;
  // -p (Set Password)
  password?: string;
  // -t (Type of archive)
  type: string;
  // -so (write data to stdout)
  stdout?: WritableStream;
  // -w (Working Dir)
  cwd?: string;
  // force: Force to recreate archive
  force?: boolean;
};

export async function compress(
  filename: PathLike | undefined,
  content: ContentLike,
  options: Omit<SZipCompressOptions, 'stdout'> & { stdout: WritableStream; raw?: never }
): Promise<SafeReturn<boolean, SZipError>>;

export async function compress(
  filename: PathLike,
  content: ContentLike,
  options: SZipCompressOptions & { raw?: false }
): Promise<SafeReturn<SZipCompressResult, SZipError>>;

export async function compress(
  filename: PathLike,
  content: ContentLike,
  options: SZipCompressOptions & { raw: true }
): Promise<SafeReturn<string, SZipError>>;

/**
 * Compress an archive or any given content.
 *
 * @param filename
 * @param content
 * @param options
 */
export async function compress(
  filename: PathLike | undefined,
  content: ContentLike,
  options: SZipCompressOptions & { raw?: boolean }
): Promise<SafeReturn<SZipCompressResult | string | boolean, SZipError>> {
  let args = ['a', '-si'];

  const audited = await auditArgsWithStdout(filename, args, options);
  if (audited.error) {
    return audited;
  }

  if (audited.data) {
    args = audited.data;
  }

  if (options.type) {
    args.push('-t' + options.type);
  }

  if (options.method) {
    args.push('-m' + options.method);
  }

  if (options.password) {
    args.push('-p' + options.password);
  }

  const result = await execa(BIN_PATH, args, {
    input: content,
    stdio: options.stdout ? ['pipe', options.stdout, 'inherit'] : undefined,
    cwd: options?.cwd
  });

  debug('compress', result.command);

  return handleExecaResult(result, {
    raw: options.raw || false,
    stdout: options.stdout,
    parser: parseCompressMessage
  });
}
