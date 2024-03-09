import { SZip } from '../../packages/szip/src/szip';
import { PathLike } from 'node:fs';

type ArchiveOptions = {
  archive?: PathLike;
  password?: string;
  output?: PathLike;
} & (
  | {
      archive: PathLike;
      password?: string;
    }
  | {
      output: PathLike;
    }
);

type ArchiveFormat = 'Zip' | 'GZip' | 'BZip2' | '7z' | 'XZ' | 'WIM' | 'Tar';

class Archive {
  private _archive: PathLike | undefined;
  private _password: string | undefined;

  private _output: PathLike | undefined;

  constructor(
    private format: ArchiveFormat,
    opts: ArchiveOptions
  ) {
    this._archive = opts.archive;
    this._password = opts.password;
    this._output = opts.output;
  }

  /**
   * Modify an existing archive file.
   * @param archive
   * @param password
   */
  static fromArchive(archive: PathLike, password?: string): Archive {
    // Check archive exists
    // Get archive info
    // Check if password is required, if it was, validate it
    // Return new Archive instance
    // return new Archive({
    //   archive,
    //   password
    // });
    throw new Error('Not implemented');
  }

  /**
   * Lists contents of archive.
   */
  async list(): Promise<string[]> {
    return [];
  }

  // ------------------------------
  // Extract
  // ------------------------------
  static async extract(archive: PathLike, output: PathLike, files: string[]): Promise<void> {}

  static async extractAll(archive: PathLike, output: PathLike): Promise<void> {}

  // ------------------------------
  // Add, Update, and Delete
  // ------------------------------
  async add(path: string, options: ArchiveAddOptions): Promise<void> {}

  // ------------------------------
  // Misc
  // ------------------------------
  setPassword(password: string): void {}

  /**
   * Get information about an archive.
   * @param archive
   */
  static async getInfo(archive: PathLike): Promise<any> {
    const info = await SZip.list(archive, {
      technicalInfo: true
    });
  }

  static async hasPassword(archive: PathLike): Promise<boolean> {
    return false;
  }

  async finalize(opts: FinalizeOptions): Promise<void> {}
}

type FinalizeOptions = {
  format: ArchiveFormat;
} & (
  | ({
      format: 'Zip';
    } & ArchiveZipOptions)
  | ({
      format: 'GZip';
    } & ArchiveGZipOptions)
);

type ArchiveZipOptions = {
  method?: 'Copy' | 'Deflate' | 'Deflate64' | 'BZip2' | 'LZMA' | 'PPMd';
  // Sets number of Fast Bytes for Deflate encoder.
  fastBytes?: number;
  // Sets number of Passes for Deflate encoder.
  passes?: number;
  // Sets Dictionary size for BZip2
  dictionarySize?: number;
  // Sets size of used memory for PPMd.
  memorySize?: number;
  // Sets model order for PPMd.
  modelOrder?: number;
  // Sets multithreading mode.
  threads?: number;
  // Sets a encryption method: ZipCrypto, AES128, AES192, AES256.
  encryption?: 'ZipCrypto' | 'AES128' | 'AES192' | 'AES256';
  // 7-Zip always uses local code page for file names.
  localCodePage?: boolean;
  // 7-Zip uses UTF-8 for file names that contain non-ASCII symbols.
  utf8?: boolean;
  // Sets code page
  codePage?: boolean;
  // Stores last Modified timestamps for files.
  timestamps?: boolean;
  // Stores Creation timestamps for files.
  creationTimestamps?: boolean;
  // Stores last Access timestamps for files
  accessTimestamps?: boolean;
  // Sets timestamp precision: 0 - Windows (100 ns), 1 - Unix (1 sec), 2 - DOS (2 sec). 3 - Windows (100 ns).
  timestampPrecision?: 0 | 1 | 2 | 3;
};

type ArchiveGZipOptions = Pick<ArchiveZipOptions, 'fastBytes' | 'passes'> & {
  method?: 'Deflate';
};

interface ArchiveAddOptions {
  recursive?: boolean;
}

export { Archive };
