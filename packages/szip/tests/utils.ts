import { fsAccessSync } from '@/utils/fs-access';
import { createReadStream, promises } from 'node:fs';
import { SZip } from 'szip';

export async function createTar(filename: string = 'source.tar', password?: string) {
  const output = await SZip.add(filename, {
    include: ['src/*', 'dist/*'],
    type: 'tar',
    password,
    cwd: ROOT_DIR,
    raw: true
  });

  return output;
}

export async function createTar7z(
  filename: string = 'secure.tar.7z',
  password: string = 'password'
) {
  const tarName = 'secure.tar';

  await createTar(tarName);

  const output = await SZip.encrypt(filename, createReadStream(tarName), {
    cwd: ROOT_DIR,
    password
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
