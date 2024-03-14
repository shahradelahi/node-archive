import { fsAccessSync } from '@/utils/fs-access';
import { createReadStream, promises } from 'node:fs';
import { resolve } from 'node:path';
import { SZip } from 'szip';

export async function createTar(filename: string = 'source.tar', password?: string) {
  const output = await SZip.add(filename, {
    include: ['src/*', 'dist/*'],
    type: 'tar',
    password,
    update: true,
    cwd: ROOT_DIR,
    raw: true
  });

  return output;
}

export async function createTar7z(filename: string = 'secure.tar.7z', password?: string) {
  const tarName = resolve(ROOT_DIR, 'source.tar');
  await createTar(tarName);

  const output = await SZip.add(filename, {
    include: [tarName],
    type: '7z',
    password,
    cwd: ROOT_DIR,
    raw: true
  });

  await promises.unlink(tarName);

  return output;
}

export async function createZip(filename: string = 'source.zip', password?: string) {
  const output = await SZip.add(filename, {
    include: ['src/*', 'dist/*'],
    type: 'zip',
    password,
    cwd: ROOT_DIR,
    raw: true
  });

  return output;
}

export const ROOT_DIR = fsAccessSync('packages')
  ? process.cwd()
  : process.cwd().replace('packages/szip', '');
