#!/usr/bin/env node

/**
 * The Purpose of this script is to download the 7zip binary
 * for the current platform.
 */

async function importInstaller() {
  try {
    return await import('./internal/installer');
  } catch {
    console.warn(
      'Skipping binary installation because the build is not available. Run `npm install` again after you have re-built the package.'
    );
    process.exit(0);
  }
}

try {
  const { download } = await importInstaller();
  await download();
} catch (error) {
  console.warn('Binary download failed', error);
}
