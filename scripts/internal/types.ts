export enum Platform {
  Linux = 'linux',
  Mac = 'mac',
  Windows = 'windows'
}

export interface Configuration {
  version: string;
  downloadBaseUrl: string;
  skipDownload: boolean;
  binPath: string;
  cacheDirectory: string;
  executablePath: string;
  logLevel: string;
}
