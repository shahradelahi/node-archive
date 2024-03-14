import { fsAccessSync } from '@/utils/fs-access';
import { normalizePathLike } from '@/utils/normalize';
import type { ArchiveType } from '@szip/parser/types';
import { waitUtilOpenStream } from '@szip/utils/wait';
import { ExecaReturnValue } from 'execa';
import { PathLike, promises } from 'node:fs';
import type { Writable as WritableStream } from 'node:stream';
import { SafeReturn, SZipError } from 'szip';

export function detectArchiveType(message: string): ArchiveType | undefined {
  const matches = /--\n(?:.|\n)+^Type = (.+)/gm.exec(message);
  if (!matches || !matches[1]) {
    return;
  }

  return matches[1].trim() as ArchiveType;
}

export function handleExecaResult<Value>(
  result: ExecaReturnValue,
  options: { raw: boolean; stdout?: WritableStream; parser?: (message: string) => Value }
): SafeReturn<Value | string | boolean, SZipError> {
  if (options.stdout) {
    return { data: !result.failed };
  }

  const message = result.stdout !== '' ? result.stdout : result.stderr;
  if (options.raw) {
    return { data: message };
  }

  if (result.stderr !== '') {
    return { error: SZipError.fromExecaResult(result) };
  }

  if (result.stdout === '') {
    return { error: new SZipError('Empty') };
  }

  if (!options.parser) {
    return { error: new SZipError('No parser is provided') };
  }

  return { data: options.parser(message) };
}

export async function auditArgsWithStdout(
  filename: PathLike | undefined,
  args: string[],
  options: { stdout?: WritableStream; force?: boolean; ignoreOverwrite?: boolean; raw?: boolean }
): Promise<SafeReturn<string[], SZipError>> {
  if (options.stdout) {
    // Its using stdout. use a random str to as filename
    args.push('-so');

    const randomStr = Math.random().toString(36).substring(7);
    const tempName = filename ? `${normalizePathLike(filename)}.${randomStr}` : `${randomStr}.tmp`;
    args.push(tempName);

    // We need to wait until the stream is open to write
    await waitUtilOpenStream(options.stdout);

    return { data: args };
  }

  // Passing IF statement means we're going to write stdout to a file

  if (!filename) {
    return { error: new SZipError('Filename is required') };
  }

  const normalizedFilename = normalizePathLike(filename);

  if (!options.ignoreOverwrite) {
    // Check if the file exists
    const exists = fsAccessSync(filename);
    if (exists && !options.force) {
      return { error: new SZipError('File already exists.') };
    }

    if (options.force) {
      // Remove previous file
      try {
        await promises.unlink(filename);
      } catch (error) {
        return { error: new SZipError('Error removing previous file') };
      }
    }
  }

  args.push(normalizedFilename);

  return { data: args };
}
