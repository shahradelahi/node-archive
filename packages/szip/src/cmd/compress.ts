import { ContentLike } from '@/types';
import { BIN_PATH } from '@szip/bin';
import { debug } from '@szip/debugger';
import { execa } from 'execa';

type SZipCompressOptions = {
  // -m (Method)
  method?: string;
  // -p (Set Password)
  password?: string;
  // -t (Type of archive)
  type?: string;
  // -so (write data to stdout)
  stdout?: boolean;
  // -w (Working Dir)
  cwd?: string;
};

/**
 * Compress an archive or any given content.
 *
 * @param filename
 * @param content
 * @param options
 */
export async function compress(
  filename: string,
  content: ContentLike,
  options: SZipCompressOptions
) {
  const args = ['a', '-si', filename];

  if (options.type) {
    args.push('-t' + options.type);
  }

  if (options.method) {
    args.push('-m' + options.method);
  }

  if (options.password) {
    args.push('-p' + options.password);
  }

  if (options.stdout) {
    args.push('-so');
  }

  const result = await execa(BIN_PATH, args, {
    input: content,
    cwd: options?.cwd
  });

  debug('compress', result.command);

  return result.stdout;
}
