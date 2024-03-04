import { promises } from 'node:fs';

import { getConfiguration } from './configuration';
import { logPolitely } from './log';
import { detectPlatform } from './utils/detect-platform';
import { overrideProxy } from './utils/override-proxy';
import { tryOrExit } from './utils/try-exit';

export async function download(): Promise<void> {
  overrideProxy();

  const configuration = getConfiguration();
  if (configuration.skipDownload) {
    logPolitely('**INFO** Skipping 7zip download');
    return;
  }

  const downloadBaseUrl = configuration.downloadBaseUrl;

  const platform = detectPlatform();
  if (!platform) {
    throw new Error('The current platform is not supported.');
  }

  const arch = process.arch;

  let downloadUrl: string;

  switch (platform) {
    case 'linux':
      downloadUrl = `${downloadBaseUrl}/${configuration.version}/linux/linux-${arch}/7zz`;
      break;
    case 'mac':
      downloadUrl = `${downloadBaseUrl}/${configuration.version}/mac/7zz`;
      break;
    case 'windows':
      switch (arch) {
        case 'x64':
          downloadUrl = `${downloadBaseUrl}/${configuration.version}/windows/x64/7zz.exe`;
          break;
        case 'ia32': // This is the architecture for 32-bit Windows
          downloadUrl = `${downloadBaseUrl}/${configuration.version}/windows/x86/7zz.exe`;
          break;
        default:
          throw new Error('The current architecture is not supported.');
      }
      break;
    default:
      throw new Error('The current platform is not supported.');
  }

  // Download 7zip
  if (configuration.logLevel !== 'silent') {
    logPolitely(`**INFO** Downloading binary...`);
  }

  const cacheDirectory = configuration.cacheDirectory;

  // Download it to the cache directory with a name that includes the version
  const downloadPath = `${cacheDirectory}/7zz-${configuration.version}`;

  // Download the file
  await tryOrExit(async () => {
    await promises.mkdir(configuration.cacheDirectory, { recursive: true });
    await downloadFile(downloadUrl, downloadPath);
  });

  // Make the file executable
  if (platform === 'linux' || platform === 'mac') {
    await tryOrExit(async () => {
      await promises.chmod(downloadPath, 0o755);
    });
  }

  if (configuration.logLevel !== 'silent') {
    logPolitely(`**INFO** Binary downloaded to ${downloadPath}`);
  }

  // Move it to the user bin directory
  const destination = configuration.executablePath;

  await tryOrExit(async () => {
    await promises.mkdir(configuration.binPath, { recursive: true });
    await promises.rename(downloadPath, destination);
  });

  if (configuration.logLevel !== 'silent') {
    logPolitely(`**INFO** Binary moved to ${destination}`);
  }

  return;
}

async function downloadFile(url: string, destination: string): Promise<void> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  await promises.writeFile(destination, Buffer.from(buffer));
}
