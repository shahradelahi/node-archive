import { Platform } from '../types';

export function detectPlatform(): Platform | undefined {
  const platform = process.platform;
  if (platform === 'win32') {
    return Platform.Windows;
  }
  if (platform === 'darwin') {
    return Platform.Mac;
  }
  if (platform === 'linux') {
    return Platform.Linux;
  }
  return undefined;
}
