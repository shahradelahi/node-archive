import { BIN_PATH } from '@szip/bin';
import { debug } from '@szip/debugger';
import { execa } from 'execa';

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
  workingDir?: string;
  // -p (Set Password)
  password?: string;
  // -r (Recurse)
  recurse?: boolean;
  // -sns (Store NTFS alternate Streams)
  storeNTFSAlternateStreams?: boolean;
  // -u (Update)
  update?: boolean;
};

/**
 * Deletes files from archive.
 *
 * @param filename
 * @param options
 */
export async function del(filename: string, options: SZipDeleteOptions) {
  const args = ['d', filename];

  if (options?.workingDir) {
    args.push('-w' + options.workingDir);
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

  if (options?.include) {
    options.include.forEach((include) => {
      args.push('-i!' + include);
    });
  }

  if (options?.exclude) {
    options.exclude.forEach((exclude) => {
      args.push('-x!' + exclude);
    });
  }

  const result = await execa(BIN_PATH, args);

  debug('delete', result.command);

  return result.stdout !== '' ? result.stdout : result.stderr;
}
