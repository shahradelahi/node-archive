import { normalizePathLike } from '@/utils/normalize';
import { BIN_PATH } from '@szip/bin';
import { debug } from '@szip/debugger';
import { execa } from 'execa';
import { PathLike } from 'node:fs';

type SZipListOptions = {
  // -ai (Include archives)
  includeArchives?: boolean;
  // -an (Disable parsing of archive_name)
  disableParsingArchiveName?: boolean;
  // -ax (Exclude archives)
  excludeArchives?: boolean;
  // -i (Include)
  include?: string[];
  // -slt (Show technical information)
  technicalInfo?: boolean;
  // -sns (Store NTFS alternate Streams)
  storeNTFSAlternateStreams?: boolean;
  // -p (Set Password)
  password?: string;
  // -r (Recurse)
  recurse?: boolean;
  // -stx (Exclude archive type)
  excludeArchiveType?: boolean;
  // -t (Type of archive)
  type?: string;
  // -x (Exclude)
  exclude?: string[];
};

export async function list(
  filename: PathLike,
  options: SZipListOptions & { raw?: false }
): Promise<object>;

export async function list(
  filename: PathLike,
  options: SZipListOptions & { raw: true }
): Promise<string>;

export async function list(
  filename: PathLike,
  options: SZipListOptions & { raw?: boolean } = {}
): Promise<string | object> {
  const args: string[] = ['l', normalizePathLike(filename)];

  if (options?.technicalInfo) {
    args.push('-slt');
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

  if (options?.excludeArchiveType) {
    args.push('-stx');
  }

  if (options?.include) {
    options.include.forEach((include) => {
      args.push('-i!' + include);
    });
  }

  if (options?.excludeArchives) {
    args.push('-ax');
  }

  if (options?.includeArchives) {
    args.push('-ai');
  }

  const result = await execa(BIN_PATH, args);

  debug('list', result.command);

  const message = result.stdout !== '' ? result.stdout : result.stderr;

  if (options.raw) {
    return message;
  }

  throw new Error('Not implemented');
}
