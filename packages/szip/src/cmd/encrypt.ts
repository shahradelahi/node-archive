import { ContentLike } from '@/types';
import { normalizePathLike } from '@/utils/normalize';
import { BIN_PATH } from '@szip/bin';
import { execa } from 'execa';
import { PathLike } from 'node:fs';

type SZipEncryptOptions = {
  // -p (Set Password)
  password: string;
  // -w (Working Dir)
  cwd?: string;
};

export async function encrypt(
  filename: PathLike,
  content: ContentLike,
  options: SZipEncryptOptions
) {
  const args = ['a', '-si', normalizePathLike(filename)];

  if (!options.password) {
    throw new Error('Password is required');
  }

  args.push(`-p${options.password}`);

  const result = await execa(BIN_PATH, args, {
    input: content,
    cwd: options?.cwd
  });

  return result.stdout || result.stderr;
}
