import { homedir } from 'node:os';
import { join } from 'node:path';

import { Configuration, Platform } from './types';
import { getBooleanEnv } from './utils/boolean-env';

function isSupported(platform: unknown): boolean {
  return platform === Platform.Linux || platform === Platform.Mac || platform === Platform.Windows;
}

export function getConfiguration(): Configuration {
  const configuration: Partial<Configuration> = {
    version: '23.01',
    downloadBaseUrl: 'https://7zip.s3.ir-thr-at1.arvanstorage.ir'
  };

  configuration.logLevel = (process.env['ARCHIVE_LOGLEVEL'] ??
    process.env['npm_config_LOGLEVEL'] ??
    process.env['npm_package_config_LOGLEVEL'] ??
    configuration.logLevel ??
    'warn') as 'silent' | 'error' | 'warn';

  configuration.binPath =
    process.env['ARCHIVE_BIN_PATH'] ??
    process.env['npm_config_archive_bin_path'] ??
    process.env['npm_package_config_archive_bin_path'] ??
    configuration.binPath ??
    join(homedir(), '.local', 'bin');

  configuration.executablePath =
    process.env['ARCHIVE_EXECUTABLE_PATH'] ??
    process.env['npm_config_archive_executable_path'] ??
    process.env['npm_package_config_archive_executable_path'] ??
    configuration.executablePath ??
    join(configuration.binPath, '7zz');

  // Set skipDownload explicitly or from default
  configuration.skipDownload = Boolean(
    getBooleanEnv('PUPPETEER_SKIP_DOWNLOAD') ??
      getBooleanEnv('npm_config_archive_skip_download') ??
      getBooleanEnv('npm_package_config_archive_skip_download') ??
      configuration.skipDownload
  );

  if (!configuration.skipDownload) {
    configuration.downloadBaseUrl =
      process.env['ARCHIVE_DOWNLOAD_BASE_URL'] ??
      process.env['npm_config_archive_download_base_url'] ??
      process.env['npm_package_config_archive_download_base_url'] ??
      configuration.downloadBaseUrl;

    configuration.version =
      process.env['ARCHIVE_VERSION'] ??
      process.env['npm_config_archive_version'] ??
      process.env['npm_package_config_archive_version'] ??
      configuration.version;
  }

  configuration.cacheDirectory =
    process.env['ARCHIVE_CACHE_DIR'] ??
    process.env['npm_config_archive_cache_dir'] ??
    process.env['npm_package_config_archive_cache_dir'] ??
    configuration.cacheDirectory ??
    join(homedir(), '.cache', 'node-archive');

  return configuration as Configuration;
}
